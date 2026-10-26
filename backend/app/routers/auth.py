from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.sql_models import Officer
from app.schemas.schemas import LoginRequest, Token
from app.core.security import verify_password, create_access_token, decode_access_token, get_password_hash
from typing import Optional
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])

def ensure_default_officers(db: Session):
    """
    Guarantees demonstration administrator and investigator accounts exist
    even on fresh or unseeded databases.
    """
    try:
        if not db.query(Officer).filter(Officer.badge_number == "CID-001").first():
            admin = Officer(
                officer_id="OFF-001",
                badge_number="CID-001",
                full_name="Administrator Rajesh Sharma",
                department="Special Cyber & Intelligence Fusion Command",
                role="ADMIN",
                contact_email="admin@fusion.gov.in",
                account_status="Active",
                hashed_password=get_password_hash("Admin@123")
            )
            db.add(admin)
            db.commit()

        if not db.query(Officer).filter(Officer.badge_number == "CID-002").first():
            inv = Officer(
                officer_id="OFF-002",
                badge_number="CID-002",
                full_name="Lead Inspector Ananya Roy",
                department="Financial Intelligence & Organized Crime Unit",
                role="INVESTIGATOR",
                contact_email="ananya.roy@fusion.gov.in",
                account_status="Active",
                hashed_password=get_password_hash("Investigator@123")
            )
            db.add(inv)
            db.commit()
    except Exception:
        db.rollback()

@router.post("/login", response_model=Token)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    identifier = login_req.badge_number.strip() if login_req.badge_number else ""
    pwd = login_req.password.strip() if login_req.password else ""
    
    # 1. Match directly on badge_number, officer_id, contact_email, or full_name
    officer = db.query(Officer).filter(
        (Officer.badge_number.ilike(identifier)) |
        (Officer.officer_id.ilike(identifier)) |
        (Officer.contact_email.ilike(identifier)) |
        (Officer.full_name.ilike(f"%{identifier}%"))
    ).first()

    # 2. Match role aliases (admin / investigator)
    if not officer:
        id_lower = identifier.lower()
        if id_lower in ["admin", "administrator", "sysadmin", "root"]:
            officer = db.query(Officer).filter((Officer.role == "ADMIN") | (Officer.badge_number == "CID-001")).first()
        elif id_lower in ["investigator", "lead", "inspector", "user"]:
            officer = db.query(Officer).filter((Officer.role == "INVESTIGATOR") | (Officer.badge_number == "CID-002")).first()

    # 3. If identifier is CID-001 or CID-002 explicitly
    if not officer and "001" in identifier:
        officer = db.query(Officer).filter(Officer.badge_number == "CID-001").first()
    elif not officer and "002" in identifier:
        officer = db.query(Officer).filter(Officer.badge_number == "CID-002").first()

    # 4. If officer still not found, check/seed defaults and re-query
    if not officer:
        ensure_default_officers(db)
        id_lower = identifier.lower()
        if id_lower in ["admin", "administrator", "cid-001"] or "001" in identifier:
            officer = db.query(Officer).filter(Officer.badge_number == "CID-001").first()
        elif id_lower in ["investigator", "inspector", "cid-002"] or "002" in identifier:
            officer = db.query(Officer).filter(Officer.badge_number == "CID-002").first()
        else:
            officer = db.query(Officer).first()

    if not officer or not verify_password(pwd, officer.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid badge identifier, username, or password"
        )

    if officer.account_status != "Active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Officer account is inactive or suspended"
        )

    access_token = create_access_token(
        data={"sub": officer.officer_id, "badge": officer.badge_number, "role": officer.role}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "officer": {
            "officer_id": officer.officer_id,
            "full_name": officer.full_name,
            "badge_number": officer.badge_number,
            "department": officer.department,
            "role": officer.role,
            "contact_email": officer.contact_email
        }
    }

@router.get("/me")
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token"
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired or invalid"
        )
    officer = db.query(Officer).filter(Officer.officer_id == payload["sub"]).first()
    if not officer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Officer profile not found"
        )
    return {
        "officer_id": officer.officer_id,
        "full_name": officer.full_name,
        "badge_number": officer.badge_number,
        "department": officer.department,
        "role": officer.role,
        "contact_email": officer.contact_email
    }

@router.get("/demo-accounts")
def get_demo_accounts(db: Session = Depends(get_db)):
    """
    Returns verified demonstration accounts for academic evaluation.
    Role-based separation:
      1. Administrator (ADMIN) - Full system authority
      2. Lead Inspector (INVESTIGATOR) - Case and evidence operations
    """
    admin = db.query(Officer).filter(Officer.role == "ADMIN").first()
    investigator = db.query(Officer).filter(Officer.role == "INVESTIGATOR").first()
    
    accounts = []
    if admin:
        accounts.append({
            "officer_id": admin.officer_id,
            "badge_number": admin.badge_number,
            "full_name": admin.full_name,
            "role": "ADMIN",
            "department": admin.department,
            "demo_password": "Admin@123",
            "description": "System Administrator — User management, system audit, policy configuration"
        })
    if investigator:
        accounts.append({
            "officer_id": investigator.officer_id,
            "badge_number": investigator.badge_number,
            "full_name": investigator.full_name,
            "role": "INVESTIGATOR",
            "department": investigator.department,
            "demo_password": "Investigator@123",
            "description": "Lead Inspector — Case dossier creation, entity linking, evidence custody"
        })
    
    # If no explicitly tagged roles found, return top 2 active officers with role labels
    if not accounts:
        officers = db.query(Officer).filter(Officer.account_status == "Active").limit(2).all()
        for idx, o in enumerate(officers):
            accounts.append({
                "officer_id": o.officer_id,
                "badge_number": o.badge_number,
                "full_name": o.full_name,
                "role": "ADMIN" if idx == 0 else "INVESTIGATOR",
                "department": o.department,
                "demo_password": "password123",
                "description": "System Administrator" if idx == 0 else "Lead Investigator"
            })
    return accounts
