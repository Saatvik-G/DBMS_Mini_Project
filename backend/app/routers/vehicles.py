from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timezone
from typing import Optional, List
from app.db.session import get_db
from app.models.sql_models import Vehicle
from app.schemas.schemas import VehicleCreate, VehicleUpdate, VehicleOut

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

def utc_now():
    return datetime.now(timezone.utc)

def generate_vehicle_id(db: Session) -> str:
    count = db.query(Vehicle).count() + 1
    return f"VEH-{count:03d}"

@router.get("", response_model=List[VehicleOut])
def list_vehicles(
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Vehicle)
    if search:
        s = f"%{search}%"
        query = query.filter(or_(Vehicle.registration_number.ilike(s), Vehicle.make.ilike(s), Vehicle.model.ilike(s), Vehicle.color.ilike(s), Vehicle.description.ilike(s)))
    return query.order_by(Vehicle.vehicle_id.asc()).offset(skip).limit(limit).all()

@router.post("", response_model=VehicleOut, status_code=status.HTTP_201_CREATED)
def create_vehicle(v_in: VehicleCreate, db: Session = Depends(get_db)):
    vid = v_in.vehicle_id or generate_vehicle_id(db)
    if db.query(Vehicle).filter(Vehicle.vehicle_id == vid).first():
        raise HTTPException(status_code=400, detail=f"Vehicle '{vid}' already exists.")
    if db.query(Vehicle).filter(Vehicle.registration_number == v_in.registration_number).first():
        raise HTTPException(status_code=400, detail=f"Registration number '{v_in.registration_number}' already registered.")

    v = Vehicle(
        vehicle_id=vid,
        registration_number=v_in.registration_number,
        make=v_in.make,
        model=v_in.model,
        color=v_in.color,
        vehicle_type=v_in.vehicle_type,
        description=v_in.description,
        created_at=utc_now(),
        updated_at=utc_now()
    )
    db.add(v)
    db.commit()
    db.refresh(v)
    return v

@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail=f"Vehicle '{vehicle_id}' not found.")
    return {
        "vehicle_id": v.vehicle_id,
        "registration_number": v.registration_number,
        "make": v.make,
        "model": v.model,
        "color": v.color,
        "vehicle_type": v.vehicle_type,
        "description": v.description,
        "created_at": v.created_at,
        "updated_at": v.updated_at,
        "cases": [{"case_id": c.case_id, "title": c.title, "status": c.status} for c in v.cases],
        "people": [{"person_id": p.person_id, "full_name": p.full_name, "category": p.category} for p in v.people],
        "evidence_items": [{"evidence_id": e.evidence_id, "title": e.title} for e in v.evidence_items]
    }

@router.put("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(vehicle_id: str, v_in: VehicleUpdate, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail=f"Vehicle '{vehicle_id}' not found.")
    data = v_in.dict(exclude_unset=True)
    for field, val in data.items():
        setattr(v, field, val)
    v.updated_at = utc_now()
    db.commit()
    db.refresh(v)
    return v

@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail=f"Vehicle '{vehicle_id}' not found.")
    db.delete(v)
    db.commit()
    return {"message": f"Vehicle '{vehicle_id}' deleted successfully."}
