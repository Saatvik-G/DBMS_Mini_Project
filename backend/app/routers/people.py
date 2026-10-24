from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from datetime import datetime, timezone
from typing import Optional, List
from app.db.session import get_db
from app.models.sql_models import Person, Case
from app.schemas.schemas import PersonCreate, PersonUpdate, PersonOut

router = APIRouter(prefix="/people", tags=["People"])

def utc_now():
    return datetime.now(timezone.utc)

def generate_person_id(db: Session) -> str:
    count = db.query(Person).count() + 1
    return f"PER-{count:03d}"

@router.get("", response_model=List[PersonOut])
def list_people(
    search: Optional[str] = None,
    category: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Person)
    if search:
        s = f"%{search}%"
        query = query.filter(or_(Person.person_id.ilike(s), Person.full_name.ilike(s), Person.description.ilike(s), Person.contact_details.ilike(s)))
    if category and category != "All":
        query = query.filter(Person.category == category)

    people = query.order_by(Person.person_id.asc()).offset(skip).limit(limit).all()
    results = []
    for p in people:
        results.append({
            "person_id": p.person_id,
            "full_name": p.full_name,
            "date_of_birth": p.date_of_birth,
            "contact_details": p.contact_details,
            "address": p.address,
            "category": p.category,
            "description": p.description,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
            "linked_cases_count": len(p.cases)
        })
    return results

@router.post("", response_model=PersonOut, status_code=status.HTTP_201_CREATED)
def create_person(person_in: PersonCreate, db: Session = Depends(get_db)):
    pid = person_in.person_id or generate_person_id(db)
    if db.query(Person).filter(Person.person_id == pid).first():
        raise HTTPException(status_code=400, detail=f"Person with ID '{pid}' already exists.")

    new_person = Person(
        person_id=pid,
        full_name=person_in.full_name,
        date_of_birth=person_in.date_of_birth,
        contact_details=person_in.contact_details,
        address=person_in.address,
        category=person_in.category,
        description=person_in.description,
        created_at=utc_now(),
        updated_at=utc_now()
    )
    db.add(new_person)
    db.commit()
    db.refresh(new_person)
    return {
        "person_id": new_person.person_id,
        "full_name": new_person.full_name,
        "date_of_birth": new_person.date_of_birth,
        "contact_details": new_person.contact_details,
        "address": new_person.address,
        "category": new_person.category,
        "description": new_person.description,
        "created_at": new_person.created_at,
        "updated_at": new_person.updated_at,
        "linked_cases_count": 0
    }

@router.get("/{person_id}")
def get_person(person_id: str, db: Session = Depends(get_db)):
    p = db.query(Person).filter(Person.person_id == person_id).first()
    if not p:
        raise HTTPException(status_code=404, detail=f"Person '{person_id}' not found.")

    return {
        "person_id": p.person_id,
        "full_name": p.full_name,
        "date_of_birth": p.date_of_birth,
        "contact_details": p.contact_details,
        "address": p.address,
        "category": p.category,
        "description": p.description,
        "created_at": p.created_at,
        "updated_at": p.updated_at,
        "cases": [{"case_id": c.case_id, "title": c.title, "status": c.status, "priority": c.priority} for c in p.cases],
        "organizations": [{"organization_id": o.organization_id, "name": o.name, "organization_type": o.organization_type} for o in p.organizations],
        "vehicles": [{"vehicle_id": v.vehicle_id, "registration_number": v.registration_number, "make": v.make, "model": v.model} for v in p.vehicles],
        "devices": [{"device_id": d.device_id, "device_type": d.device_type, "manufacturer": d.manufacturer, "serial_number": d.serial_number} for d in p.devices],
        "evidence_items": [{"evidence_id": e.evidence_id, "title": e.title, "evidence_type": e.evidence_type} for e in p.evidence_items]
    }

@router.put("/{person_id}", response_model=PersonOut)
def update_person(person_id: str, person_in: PersonUpdate, db: Session = Depends(get_db)):
    p = db.query(Person).filter(Person.person_id == person_id).first()
    if not p:
        raise HTTPException(status_code=404, detail=f"Person '{person_id}' not found.")

    data = person_in.dict(exclude_unset=True)
    for field, val in data.items():
        setattr(p, field, val)
    p.updated_at = utc_now()
    db.commit()
    db.refresh(p)
    return {
        "person_id": p.person_id,
        "full_name": p.full_name,
        "date_of_birth": p.date_of_birth,
        "contact_details": p.contact_details,
        "address": p.address,
        "category": p.category,
        "description": p.description,
        "created_at": p.created_at,
        "updated_at": p.updated_at,
        "linked_cases_count": len(p.cases)
    }

@router.delete("/{person_id}")
def delete_person(person_id: str, db: Session = Depends(get_db)):
    p = db.query(Person).filter(Person.person_id == person_id).first()
    if not p:
        raise HTTPException(status_code=404, detail=f"Person '{person_id}' not found.")
    db.delete(p)
    db.commit()
    return {"message": f"Person '{person_id}' deleted successfully."}
