from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timezone
from typing import Optional, List
from app.db.session import get_db
from app.models.sql_models import Officer, Case, EvidenceCustody
from app.schemas.schemas import OfficerCreate, OfficerUpdate, OfficerOut
from app.core.security import get_password_hash

router = APIRouter(prefix="/officers", tags=["Officers"])

def utc_now():
    return datetime.now(timezone.utc)

def generate_officer_id(db: Session) -> str:
    count = db.query(Officer).count() + 1
    return f"OFF-{count:03d}"

@router.get("", response_model=List[OfficerOut])
def list_officers(
    search: Optional[str] = None,
    department: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Officer)
    if search:
        s = f"%{search}%"
        query = query.filter(or_(Officer.officer_id.ilike(s), Officer.full_name.ilike(s), Officer.badge_number.ilike(s), Officer.department.ilike(s)))
    if department and department != "All":
        query = query.filter(Officer.department == department)
    return query.order_by(Officer.officer_id.asc()).offset(skip).limit(limit).all()

@router.post("", response_model=OfficerOut, status_code=status.HTTP_201_CREATED)
def create_officer(off_in: OfficerCreate, db: Session = Depends(get_db)):
    oid = off_in.officer_id or generate_officer_id(db)
    if db.query(Officer).filter(Officer.officer_id == oid).first():
        raise HTTPException(status_code=400, detail=f"Officer ID '{oid}' already exists.")
    if db.query(Officer).filter(Officer.badge_number == off_in.badge_number).first():
        raise HTTPException(status_code=400, detail=f"Badge number '{off_in.badge_number}' already registered.")
    if db.query(Officer).filter(Officer.contact_email == off_in.contact_email).first():
        raise HTTPException(status_code=400, detail=f"Email '{off_in.contact_email}' already registered.")

    hashed = get_password_hash(off_in.password)
    off = Officer(
        officer_id=oid,
        full_name=off_in.full_name,
        badge_number=off_in.badge_number,
        department=off_in.department,
        contact_email=off_in.contact_email,
        role=off_in.role,
        account_status=off_in.account_status,
        hashed_password=hashed,
        created_at=utc_now(),
        updated_at=utc_now()
    )
    db.add(off)
    db.commit()
    db.refresh(off)
    return off

@router.get("/{officer_id}")
def get_officer(officer_id: str, db: Session = Depends(get_db)):
    o = db.query(Officer).filter(Officer.officer_id == officer_id).first()
    if not o:
        raise HTTPException(status_code=404, detail=f"Officer '{officer_id}' not found.")
    
    assigned_cases = [
        {"case_id": c.case_id, "title": c.title, "status": c.status, "priority": c.priority}
        for c in o.assigned_cases
    ]
    custody_actions = [
        {
            "custody_event_id": ev.custody_event_id,
            "evidence_id": ev.evidence_id,
            "event_type": ev.event_type,
            "event_timestamp": ev.event_timestamp,
            "notes": ev.notes
        }
        for ev in o.custody_events
    ]
    return {
        "officer_id": o.officer_id,
        "full_name": o.full_name,
        "badge_number": o.badge_number,
        "department": o.department,
        "contact_email": o.contact_email,
        "role": o.role,
        "account_status": o.account_status,
        "created_at": o.created_at,
        "updated_at": o.updated_at,
        "assigned_cases": assigned_cases,
        "custody_actions": custody_actions
    }

@router.put("/{officer_id}", response_model=OfficerOut)
def update_officer(officer_id: str, off_in: OfficerUpdate, db: Session = Depends(get_db)):
    o = db.query(Officer).filter(Officer.officer_id == officer_id).first()
    if not o:
        raise HTTPException(status_code=404, detail=f"Officer '{officer_id}' not found.")

    data = off_in.dict(exclude_unset=True)
    if "password" in data and data["password"]:
        o.hashed_password = get_password_hash(data.pop("password"))
    for field, val in data.items():
        setattr(o, field, val)
    o.updated_at = utc_now()
    db.commit()
    db.refresh(o)
    return o
