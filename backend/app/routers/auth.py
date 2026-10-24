from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.sql_models import Officer
from app.schemas.schemas import LoginRequest, Token
from app.core.security import verify_password, create_access_token
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    officer = db.query(Officer).filter(Officer.badge_number == login_req.badge_number).first()
    if not officer or not verify_password(login_req.password, officer.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid badge number or password"
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

@router.get("/demo-accounts")
def get_demo_accounts(db: Session = Depends(get_db)):
    officers = db.query(Officer).filter(Officer.account_status == "Active").limit(5).all()
    return [
        {
            "officer_id": o.officer_id,
            "badge_number": o.badge_number,
            "full_name": o.full_name,
            "role": o.role,
            "department": o.department,
            "demo_password": "password123"
        }
        for o in officers
    ]
