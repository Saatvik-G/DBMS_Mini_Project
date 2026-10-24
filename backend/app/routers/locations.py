from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timezone
from typing import Optional, List
from app.db.session import get_db
from app.models.sql_models import Location
from app.schemas.schemas import LocationCreate, LocationUpdate, LocationOut

router = APIRouter(prefix="/locations", tags=["Locations"])

def utc_now():
    return datetime.now(timezone.utc)

def generate_location_id(db: Session) -> str:
    count = db.query(Location).count() + 1
    return f"LOC-{count:03d}"

@router.get("", response_model=List[LocationOut])
def list_locations(
    search: Optional[str] = None,
    location_type: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Location)
    if search:
        s = f"%{search}%"
        query = query.filter(or_(Location.name.ilike(s), Location.address.ilike(s), Location.location_type.ilike(s), Location.description.ilike(s)))
    if location_type and location_type != "All":
        query = query.filter(Location.location_type == location_type)
    return query.order_by(Location.location_id.asc()).offset(skip).limit(limit).all()

@router.post("", response_model=LocationOut, status_code=status.HTTP_201_CREATED)
def create_location(loc_in: LocationCreate, db: Session = Depends(get_db)):
    lid = loc_in.location_id or generate_location_id(db)
    if db.query(Location).filter(Location.location_id == lid).first():
        raise HTTPException(status_code=400, detail=f"Location '{lid}' already exists.")

    loc = Location(
        location_id=lid,
        name=loc_in.name,
        address=loc_in.address,
        location_type=loc_in.location_type,
        latitude=loc_in.latitude,
        longitude=loc_in.longitude,
        description=loc_in.description,
        created_at=utc_now(),
        updated_at=utc_now()
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc

@router.get("/{location_id}")
def get_location(location_id: str, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.location_id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found.")
    return {
        "location_id": loc.location_id,
        "name": loc.name,
        "address": loc.address,
        "location_type": loc.location_type,
        "latitude": loc.latitude,
        "longitude": loc.longitude,
        "description": loc.description,
        "created_at": loc.created_at,
        "updated_at": loc.updated_at,
        "cases": [{"case_id": c.case_id, "title": c.title, "status": c.status} for c in loc.cases],
        "evidence_items": [{"evidence_id": e.evidence_id, "title": e.title} for e in loc.evidence_items]
    }

@router.put("/{location_id}", response_model=LocationOut)
def update_location(location_id: str, loc_in: LocationUpdate, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.location_id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found.")
    data = loc_in.dict(exclude_unset=True)
    for field, val in data.items():
        setattr(loc, field, val)
    loc.updated_at = utc_now()
    db.commit()
    db.refresh(loc)
    return loc

@router.delete("/{location_id}")
def delete_location(location_id: str, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.location_id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found.")
    db.delete(loc)
    db.commit()
    return {"message": f"Location '{location_id}' deleted successfully."}
