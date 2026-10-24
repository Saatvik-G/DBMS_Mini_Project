from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timezone
from typing import Optional, List
from app.db.session import get_db
from app.models.sql_models import Organization
from app.schemas.schemas import OrganizationCreate, OrganizationUpdate, OrganizationOut

router = APIRouter(prefix="/organizations", tags=["Organizations"])

def utc_now():
    return datetime.now(timezone.utc)

def generate_org_id(db: Session) -> str:
    count = db.query(Organization).count() + 1
    return f"ORG-{count:03d}"

@router.get("", response_model=List[OrganizationOut])
def list_organizations(
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Organization)
    if search:
        s = f"%{search}%"
        query = query.filter(or_(Organization.name.ilike(s), Organization.organization_type.ilike(s), Organization.description.ilike(s)))
    return query.order_by(Organization.organization_id.asc()).offset(skip).limit(limit).all()

@router.post("", response_model=OrganizationOut, status_code=status.HTTP_201_CREATED)
def create_organization(org_in: OrganizationCreate, db: Session = Depends(get_db)):
    oid = org_in.organization_id or generate_org_id(db)
    if db.query(Organization).filter(Organization.organization_id == oid).first():
        raise HTTPException(status_code=400, detail=f"Organization '{oid}' already exists.")

    org = Organization(
        organization_id=oid,
        name=org_in.name,
        organization_type=org_in.organization_type,
        address=org_in.address,
        contact_details=org_in.contact_details,
        description=org_in.description,
        created_at=utc_now(),
        updated_at=utc_now()
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org

@router.get("/{organization_id}")
def get_organization(organization_id: str, db: Session = Depends(get_db)):
    o = db.query(Organization).filter(Organization.organization_id == organization_id).first()
    if not o:
        raise HTTPException(status_code=404, detail=f"Organization '{organization_id}' not found.")
    return {
        "organization_id": o.organization_id,
        "name": o.name,
        "organization_type": o.organization_type,
        "address": o.address,
        "contact_details": o.contact_details,
        "description": o.description,
        "created_at": o.created_at,
        "updated_at": o.updated_at,
        "cases": [{"case_id": c.case_id, "title": c.title, "status": c.status} for c in o.cases],
        "people": [{"person_id": p.person_id, "full_name": p.full_name, "category": p.category} for p in o.people]
    }

@router.put("/{organization_id}", response_model=OrganizationOut)
def update_organization(organization_id: str, org_in: OrganizationUpdate, db: Session = Depends(get_db)):
    o = db.query(Organization).filter(Organization.organization_id == organization_id).first()
    if not o:
        raise HTTPException(status_code=404, detail=f"Organization '{organization_id}' not found.")
    data = org_in.dict(exclude_unset=True)
    for field, val in data.items():
        setattr(o, field, val)
    o.updated_at = utc_now()
    db.commit()
    db.refresh(o)
    return o

@router.delete("/{organization_id}")
def delete_organization(organization_id: str, db: Session = Depends(get_db)):
    o = db.query(Organization).filter(Organization.organization_id == organization_id).first()
    if not o:
        raise HTTPException(status_code=404, detail=f"Organization '{organization_id}' not found.")
    db.delete(o)
    db.commit()
    return {"message": f"Organization '{organization_id}' deleted successfully."}
