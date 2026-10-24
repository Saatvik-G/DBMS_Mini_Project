from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from datetime import datetime, timezone
from typing import Optional, List
from app.db.session import get_db
from app.db.mongo import get_mongo_db
from app.models.sql_models import (
    Case, Officer, Person, Organization, Vehicle, Device, Location, Evidence, CaseActivity,
    case_people, case_organizations, case_vehicles, case_devices, case_locations
)
from app.schemas.schemas import (
    CaseCreate, CaseUpdate, CaseOut, CaseDetail, CaseLinkRequest, CaseUnlinkRequest,
    CaseActivityCreate, CaseActivityOut
)

router = APIRouter(prefix="/cases", tags=["Cases"])

def utc_now():
    return datetime.now(timezone.utc)

def generate_case_id(db: Session) -> str:
    year = datetime.now().year
    prefix = f"CASE-{year}-"
    existing = db.query(Case.case_id).filter(Case.case_id.like(f"{prefix}%")).order_by(desc(Case.case_id)).first()
    if existing:
        try:
            num = int(existing[0].split("-")[-1]) + 1
            return f"{prefix}{num:03d}"
        except Exception:
            pass
    count = db.query(Case).count() + 1
    return f"{prefix}{count:03d}"

@router.get("", response_model=List[CaseOut])
def list_cases(
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    officer_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Case)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(or_(Case.case_id.ilike(search_filter), Case.title.ilike(search_filter), Case.description.ilike(search_filter)))
    if status:
        query = query.filter(Case.status == status)
    if priority:
        query = query.filter(Case.priority == priority)
    if officer_id:
        query = query.filter(Case.lead_officer_id == officer_id)

    cases = query.order_by(desc(Case.created_at)).offset(skip).limit(limit).all()
    results = []
    for c in cases:
        results.append({
            "case_id": c.case_id,
            "title": c.title,
            "description": c.description,
            "case_type": c.case_type,
            "status": c.status,
            "priority": c.priority,
            "lead_officer_id": c.lead_officer_id,
            "lead_officer_name": c.lead_officer.full_name if c.lead_officer else None,
            "incident_date": c.incident_date,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "evidence_count": len(c.evidence_items),
            "people_count": len(c.people)
        })
    return results

@router.post("", response_model=CaseOut, status_code=status.HTTP_201_CREATED)
def create_case(case_in: CaseCreate, db: Session = Depends(get_db)):
    case_id = case_in.case_id or generate_case_id(db)
    if db.query(Case).filter(Case.case_id == case_id).first():
        raise HTTPException(status_code=400, detail=f"Case with ID '{case_id}' already exists.")

    if case_in.lead_officer_id:
        officer = db.query(Officer).filter(Officer.officer_id == case_in.lead_officer_id).first()
        if not officer:
            raise HTTPException(status_code=400, detail=f"Officer '{case_in.lead_officer_id}' not found.")

    new_case = Case(
        case_id=case_id,
        title=case_in.title,
        description=case_in.description,
        case_type=case_in.case_type,
        status=case_in.status,
        priority=case_in.priority,
        lead_officer_id=case_in.lead_officer_id,
        incident_date=case_in.incident_date,
        created_at=utc_now(),
        updated_at=utc_now()
    )
    db.add(new_case)
    
    # Add initial activity log
    activity = CaseActivity(
        case_id=case_id,
        officer_id=case_in.lead_officer_id,
        activity_type="Case Initialization",
        title="Investigation File Opened",
        description=f"Case opened as {case_in.priority} priority under {case_in.case_type}.",
        activity_timestamp=utc_now()
    )
    db.add(activity)
    db.commit()
    db.refresh(new_case)

    return {
        "case_id": new_case.case_id,
        "title": new_case.title,
        "description": new_case.description,
        "case_type": new_case.case_type,
        "status": new_case.status,
        "priority": new_case.priority,
        "lead_officer_id": new_case.lead_officer_id,
        "lead_officer_name": new_case.lead_officer.full_name if new_case.lead_officer else None,
        "incident_date": new_case.incident_date,
        "created_at": new_case.created_at,
        "updated_at": new_case.updated_at,
        "evidence_count": 0,
        "people_count": 0
    }

@router.get("/{case_id}", response_model=CaseDetail)
def get_case_detail(case_id: str, db: Session = Depends(get_db)):
    c = db.query(Case).filter(Case.case_id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    # Fetch linked MongoDB documents for this case
    mongo_docs = []
    mdb = get_mongo_db()
    if mdb is not None:
        try:
            cursor = mdb["investigation_documents"].find({"case_id": case_id}).sort("ingested_at", -1)
            for doc in cursor:
                doc["id"] = str(doc["_id"])
                doc.pop("_id", None)
                mongo_docs.append(doc)
        except Exception:
            pass

    evidence_out = []
    for e in c.evidence_items:
        custody_list = [
            {
                "custody_event_id": ev.custody_event_id,
                "evidence_id": ev.evidence_id,
                "officer_id": ev.officer_id,
                "officer_name": ev.officer.full_name if ev.officer else "Unknown",
                "event_type": ev.event_type,
                "event_timestamp": ev.event_timestamp,
                "notes": ev.notes
            }
            for ev in e.custody_history
        ]
        evidence_out.append({
            "evidence_id": e.evidence_id,
            "title": e.title,
            "evidence_type": e.evidence_type,
            "description": e.description,
            "case_id": e.case_id,
            "case_title": c.title,
            "collected_by_officer_id": e.collected_by_officer_id,
            "collected_by_name": e.collected_by_officer.full_name if e.collected_by_officer else None,
            "storage_reference": e.storage_reference,
            "status": e.status,
            "notes": e.notes,
            "collection_date": e.collection_date,
            "created_at": e.created_at,
            "updated_at": e.updated_at,
            "custody_history": custody_list
        })

    activities_out = [
        {
            "activity_id": a.activity_id,
            "case_id": a.case_id,
            "officer_id": a.officer_id,
            "officer_name": a.officer.full_name if a.officer else "System",
            "activity_type": a.activity_type,
            "title": a.title,
            "description": a.description,
            "activity_timestamp": a.activity_timestamp
        }
        for a in c.activities
    ]

    return {
        "case_id": c.case_id,
        "title": c.title,
        "description": c.description,
        "case_type": c.case_type,
        "status": c.status,
        "priority": c.priority,
        "lead_officer_id": c.lead_officer_id,
        "lead_officer_name": c.lead_officer.full_name if c.lead_officer else None,
        "incident_date": c.incident_date,
        "created_at": c.created_at,
        "updated_at": c.updated_at,
        "evidence_count": len(c.evidence_items),
        "people_count": len(c.people),
        "people": c.people,
        "organizations": c.organizations,
        "vehicles": c.vehicles,
        "devices": c.devices,
        "locations": c.locations,
        "evidence_items": evidence_out,
        "activities": activities_out,
        "documents": mongo_docs
    }

@router.put("/{case_id}", response_model=CaseOut)
def update_case(case_id: str, case_in: CaseUpdate, db: Session = Depends(get_db)):
    c = db.query(Case).filter(Case.case_id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    update_data = case_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(c, field, val)
    c.updated_at = utc_now()

    # Log case modification activity
    activity = CaseActivity(
        case_id=case_id,
        officer_id=c.lead_officer_id,
        activity_type="Case Updated",
        title="Record Attributes Modified",
        description=f"Case updated. Current status: {c.status}, priority: {c.priority}.",
        activity_timestamp=utc_now()
    )
    db.add(activity)
    db.commit()
    db.refresh(c)

    return {
        "case_id": c.case_id,
        "title": c.title,
        "description": c.description,
        "case_type": c.case_type,
        "status": c.status,
        "priority": c.priority,
        "lead_officer_id": c.lead_officer_id,
        "lead_officer_name": c.lead_officer.full_name if c.lead_officer else None,
        "incident_date": c.incident_date,
        "created_at": c.created_at,
        "updated_at": c.updated_at,
        "evidence_count": len(c.evidence_items),
        "people_count": len(c.people)
    }

@router.delete("/{case_id}")
def delete_case(case_id: str, force: bool = False, db: Session = Depends(get_db)):
    c = db.query(Case).filter(Case.case_id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    # Referential integrity check: prevent accidental loss of evidence items unless explicitly confirmed
    if len(c.evidence_items) > 0 and not force:
        raise HTTPException(
            status_code=400,
            detail=f"Referential integrity protection: Case '{case_id}' has {len(c.evidence_items)} logged evidence items. In compliance with DBMS audit rules, cases with registered chain-of-custody evidence cannot be deleted without 'force=true'."
        )

    db.delete(c)
    db.commit()
    return {"message": f"Case '{case_id}' and associated junction relationships successfully removed."}

@router.post("/{case_id}/link")
def link_entity_to_case(case_id: str, link_req: CaseLinkRequest, db: Session = Depends(get_db)):
    c = db.query(Case).filter(Case.case_id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    etype = link_req.entity_type.lower()
    if etype == "person":
        person = db.query(Person).filter(Person.person_id == link_req.entity_id).first()
        if not person:
            raise HTTPException(status_code=404, detail=f"Person '{link_req.entity_id}' not found.")
        if person not in c.people:
            c.people.append(person)
    elif etype == "organization":
        org = db.query(Organization).filter(Organization.organization_id == link_req.entity_id).first()
        if not org:
            raise HTTPException(status_code=404, detail=f"Organization '{link_req.entity_id}' not found.")
        if org not in c.organizations:
            c.organizations.append(org)
    elif etype == "vehicle":
        veh = db.query(Vehicle).filter(Vehicle.vehicle_id == link_req.entity_id).first()
        if not veh:
            raise HTTPException(status_code=404, detail=f"Vehicle '{link_req.entity_id}' not found.")
        if veh not in c.vehicles:
            c.vehicles.append(veh)
    elif etype == "device":
        dev = db.query(Device).filter(Device.device_id == link_req.entity_id).first()
        if not dev:
            raise HTTPException(status_code=404, detail=f"Device '{link_req.entity_id}' not found.")
        if dev not in c.devices:
            c.devices.append(dev)
    elif etype == "location":
        loc = db.query(Location).filter(Location.location_id == link_req.entity_id).first()
        if not loc:
            raise HTTPException(status_code=404, detail=f"Location '{link_req.entity_id}' not found.")
        if loc not in c.locations:
            c.locations.append(loc)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported entity type '{link_req.entity_type}'.")

    # Add activity note
    act = CaseActivity(
        case_id=case_id,
        officer_id=c.lead_officer_id,
        activity_type="Entity Association",
        title=f"Linked {link_req.entity_type.capitalize()}",
        description=f"Entity {link_req.entity_id} linked to case. Role/Note: {link_req.relationship_role or link_req.notes or 'None'}",
        activity_timestamp=utc_now()
    )
    db.add(act)
    db.commit()
    return {"message": f"Successfully linked {link_req.entity_type} '{link_req.entity_id}' to case '{case_id}'."}

@router.post("/{case_id}/unlink")
def unlink_entity_from_case(case_id: str, unlink_req: CaseUnlinkRequest, db: Session = Depends(get_db)):
    c = db.query(Case).filter(Case.case_id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    etype = unlink_req.entity_type.lower()
    if etype == "person":
        person = db.query(Person).filter(Person.person_id == unlink_req.entity_id).first()
        if person and person in c.people:
            c.people.remove(person)
    elif etype == "organization":
        org = db.query(Organization).filter(Organization.organization_id == unlink_req.entity_id).first()
        if org and org in c.organizations:
            c.organizations.remove(org)
    elif etype == "vehicle":
        veh = db.query(Vehicle).filter(Vehicle.vehicle_id == unlink_req.entity_id).first()
        if veh and veh in c.vehicles:
            c.vehicles.remove(veh)
    elif etype == "device":
        dev = db.query(Device).filter(Device.device_id == unlink_req.entity_id).first()
        if dev and dev in c.devices:
            c.devices.remove(dev)
    elif etype == "location":
        loc = db.query(Location).filter(Location.location_id == unlink_req.entity_id).first()
        if loc and loc in c.locations:
            c.locations.remove(loc)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported entity type '{unlink_req.entity_type}'.")

    db.commit()
    return {"message": f"Successfully unlinked {unlink_req.entity_type} '{unlink_req.entity_id}' from case '{case_id}'."}

@router.post("/{case_id}/activities", response_model=CaseActivityOut)
def add_case_activity(case_id: str, act_in: CaseActivityCreate, db: Session = Depends(get_db)):
    c = db.query(Case).filter(Case.case_id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    activity = CaseActivity(
        case_id=case_id,
        officer_id=act_in.officer_id or c.lead_officer_id,
        activity_type=act_in.activity_type,
        title=act_in.title,
        description=act_in.description,
        activity_timestamp=act_in.activity_timestamp or utc_now()
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    return {
        "activity_id": activity.activity_id,
        "case_id": activity.case_id,
        "officer_id": activity.officer_id,
        "officer_name": activity.officer.full_name if activity.officer else "Officer",
        "activity_type": activity.activity_type,
        "title": activity.title,
        "description": activity.description,
        "activity_timestamp": activity.activity_timestamp
    }
