from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timezone
from typing import Optional, List
from app.db.session import get_db
from app.models.sql_models import Device
from app.schemas.schemas import DeviceCreate, DeviceUpdate, DeviceOut

router = APIRouter(prefix="/devices", tags=["Devices"])

def utc_now():
    return datetime.now(timezone.utc)

def generate_device_id(db: Session) -> str:
    count = db.query(Device).count() + 1
    return f"DEV-{count:03d}"

@router.get("", response_model=List[DeviceOut])
def list_devices(
    search: Optional[str] = None,
    device_type: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Device)
    if search:
        s = f"%{search}%"
        query = query.filter(or_(Device.device_id.ilike(s), Device.serial_number.ilike(s), Device.manufacturer.ilike(s), Device.model.ilike(s), Device.description.ilike(s)))
    if device_type and device_type != "All":
        query = query.filter(Device.device_type == device_type)
    return query.order_by(Device.device_id.asc()).offset(skip).limit(limit).all()

@router.post("", response_model=DeviceOut, status_code=status.HTTP_201_CREATED)
def create_device(d_in: DeviceCreate, db: Session = Depends(get_db)):
    did = d_in.device_id or generate_device_id(db)
    if db.query(Device).filter(Device.device_id == did).first():
        raise HTTPException(status_code=400, detail=f"Device '{did}' already exists.")
    if db.query(Device).filter(Device.serial_number == d_in.serial_number).first():
        raise HTTPException(status_code=400, detail=f"Device with serial number '{d_in.serial_number}' already registered.")

    dev = Device(
        device_id=did,
        device_type=d_in.device_type,
        manufacturer=d_in.manufacturer,
        model=d_in.model,
        serial_number=d_in.serial_number,
        description=d_in.description,
        created_at=utc_now(),
        updated_at=utc_now()
    )
    db.add(dev)
    db.commit()
    db.refresh(dev)
    return dev

@router.get("/{device_id}")
def get_device(device_id: str, db: Session = Depends(get_db)):
    d = db.query(Device).filter(Device.device_id == device_id).first()
    if not d:
        raise HTTPException(status_code=404, detail=f"Device '{device_id}' not found.")
    return {
        "device_id": d.device_id,
        "device_type": d.device_type,
        "manufacturer": d.manufacturer,
        "model": d.model,
        "serial_number": d.serial_number,
        "description": d.description,
        "created_at": d.created_at,
        "updated_at": d.updated_at,
        "cases": [{"case_id": c.case_id, "title": c.title, "status": c.status} for c in d.cases],
        "people": [{"person_id": p.person_id, "full_name": p.full_name, "category": p.category} for p in d.people],
        "evidence_items": [{"evidence_id": e.evidence_id, "title": e.title} for e in d.evidence_items]
    }

@router.put("/{device_id}", response_model=DeviceOut)
def update_device(device_id: str, d_in: DeviceUpdate, db: Session = Depends(get_db)):
    d = db.query(Device).filter(Device.device_id == device_id).first()
    if not d:
        raise HTTPException(status_code=404, detail=f"Device '{device_id}' not found.")
    data = d_in.dict(exclude_unset=True)
    for field, val in data.items():
        setattr(d, field, val)
    d.updated_at = utc_now()
    db.commit()
    db.refresh(d)
    return d

@router.delete("/{device_id}")
def delete_device(device_id: str, db: Session = Depends(get_db)):
    d = db.query(Device).filter(Device.device_id == device_id).first()
    if not d:
        raise HTTPException(status_code=404, detail=f"Device '{device_id}' not found.")
    db.delete(d)
    db.commit()
    return {"message": f"Device '{device_id}' deleted successfully."}
