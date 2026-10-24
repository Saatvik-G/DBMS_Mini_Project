from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from datetime import datetime, timezone
from typing import Optional, List
from app.db.session import get_db
from app.models.sql_models import Evidence, EvidenceCustody, Case, Officer
from app.schemas.schemas import (
    EvidenceCreate, EvidenceUpdate, EvidenceOut, EvidenceCustodyCreate, EvidenceCustodyOut
)

router = APIRouter(prefix="/evidence", tags=["Evidence"])

def utc_now():
    return datetime.now(timezone.utc)

def generate_evidence_id(db: Session) -> str:
    count = db.query(Evidence).count() + 1
    return f"EVD-{count:03d}"

@router.get("", response_model=List[EvidenceOut])
def list_evidence(
    search: Optional[str] = None,
    case_id: Optional[str] = None,
    evidence_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Evidence)
    if search:
        s = f"%{search}%"
        query = query.filter(or_(Evidence.evidence_id.ilike(s), Evidence.title.ilike(s), Evidence.description.ilike(s), Evidence.storage_reference.ilike(s)))
    if case_id:
        query = query.filter(Evidence.case_id == case_id)
    if evidence_type and evidence_type != "All":
        query = query.filter(Evidence.evidence_type == evidence_type)
    if status_filter and status_filter != "All":
        query = query.filter(Evidence.status == status_filter)

    items = query.order_by(desc(Evidence.collection_date)).offset(skip).limit(limit).all()
    results = []
    for e in items:
        results.append({
            "evidence_id": e.evidence_id,
            "title": e.title,
            "evidence_type": e.evidence_type,
            "description": e.description,
            "case_id": e.case_id,
            "case_title": e.case.title if e.case else None,
            "collected_by_officer_id": e.collected_by_officer_id,
            "collected_by_name": e.collected_by_officer.full_name if e.collected_by_officer else None,
            "storage_reference": e.storage_reference,
            "status": e.status,
            "notes": e.notes,
            "collection_date": e.collection_date,
            "created_at": e.created_at,
            "updated_at": e.updated_at,
            "custody_history": []
        })
    return results

@router.post("", response_model=EvidenceOut, status_code=status.HTTP_201_CREATED)
def create_evidence(ev_in: EvidenceCreate, db: Session = Depends(get_db)):
    eid = ev_in.evidence_id or generate_evidence_id(db)
    if db.query(Evidence).filter(Evidence.evidence_id == eid).first():
        raise HTTPException(status_code=400, detail=f"Evidence '{eid}' already exists.")

    c = db.query(Case).filter(Case.case_id == ev_in.case_id).first()
    if not c:
        raise HTTPException(status_code=400, detail=f"Case '{ev_in.case_id}' does not exist.")

    if ev_in.collected_by_officer_id:
        off = db.query(Officer).filter(Officer.officer_id == ev_in.collected_by_officer_id).first()
        if not off:
            raise HTTPException(status_code=400, detail=f"Officer '{ev_in.collected_by_officer_id}' not found.")

    col_date = ev_in.collection_date or utc_now()
    ev = Evidence(
        evidence_id=eid,
        title=ev_in.title,
        evidence_type=ev_in.evidence_type,
        description=ev_in.description,
        case_id=ev_in.case_id,
        collected_by_officer_id=ev_in.collected_by_officer_id,
        storage_reference=ev_in.storage_reference,
        status=ev_in.status,
        notes=ev_in.notes,
        collection_date=col_date,
        created_at=utc_now(),
        updated_at=utc_now()
    )
    db.add(ev)

    # Automatically create initial Chain-of-Custody record
    if ev_in.collected_by_officer_id:
        initial_custody = EvidenceCustody(
            evidence_id=eid,
            officer_id=ev_in.collected_by_officer_id,
            event_type="Collected",
            event_timestamp=col_date,
            notes=f"Initial item intake into evidence vault ({ev_in.storage_reference})."
        )
        db.add(initial_custody)

    db.commit()
    db.refresh(ev)
    return {
        "evidence_id": ev.evidence_id,
        "title": ev.title,
        "evidence_type": ev.evidence_type,
        "description": ev.description,
        "case_id": ev.case_id,
        "case_title": c.title,
        "collected_by_officer_id": ev.collected_by_officer_id,
        "collected_by_name": ev.collected_by_officer.full_name if ev.collected_by_officer else None,
        "storage_reference": ev.storage_reference,
        "status": ev.status,
        "notes": ev.notes,
        "collection_date": ev.collection_date,
        "created_at": ev.created_at,
        "updated_at": ev.updated_at,
        "custody_history": []
    }

@router.get("/{evidence_id}", response_model=EvidenceOut)
def get_evidence(evidence_id: str, db: Session = Depends(get_db)):
    e = db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()
    if not e:
        raise HTTPException(status_code=404, detail=f"Evidence '{evidence_id}' not found.")

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

    return {
        "evidence_id": e.evidence_id,
        "title": e.title,
        "evidence_type": e.evidence_type,
        "description": e.description,
        "case_id": e.case_id,
        "case_title": e.case.title if e.case else None,
        "collected_by_officer_id": e.collected_by_officer_id,
        "collected_by_name": e.collected_by_officer.full_name if e.collected_by_officer else None,
        "storage_reference": e.storage_reference,
        "status": e.status,
        "notes": e.notes,
        "collection_date": e.collection_date,
        "created_at": e.created_at,
        "updated_at": e.updated_at,
        "custody_history": custody_list
    }

@router.put("/{evidence_id}", response_model=EvidenceOut)
def update_evidence(evidence_id: str, ev_in: EvidenceUpdate, db: Session = Depends(get_db)):
    e = db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()
    if not e:
        raise HTTPException(status_code=404, detail=f"Evidence '{evidence_id}' not found.")
    data = ev_in.dict(exclude_unset=True)
    for field, val in data.items():
        setattr(e, field, val)
    e.updated_at = utc_now()
    db.commit()
    db.refresh(e)
    return get_evidence(evidence_id, db)

@router.delete("/{evidence_id}")
def delete_evidence(evidence_id: str, db: Session = Depends(get_db)):
    e = db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()
    if not e:
        raise HTTPException(status_code=404, detail=f"Evidence '{evidence_id}' not found.")
    db.delete(e)
    db.commit()
    return {"message": f"Evidence '{evidence_id}' and associated custody chain deleted."}

@router.get("/{evidence_id}/custody", response_model=List[EvidenceCustodyOut])
def get_custody_history(evidence_id: str, db: Session = Depends(get_db)):
    e = db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()
    if not e:
        raise HTTPException(status_code=404, detail=f"Evidence '{evidence_id}' not found.")
    return [
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

@router.post("/{evidence_id}/custody", response_model=EvidenceCustodyOut, status_code=status.HTTP_201_CREATED)
def add_custody_event(evidence_id: str, cust_in: EvidenceCustodyCreate, db: Session = Depends(get_db)):
    e = db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()
    if not e:
        raise HTTPException(status_code=404, detail=f"Evidence '{evidence_id}' not found.")

    off = db.query(Officer).filter(Officer.officer_id == cust_in.officer_id).first()
    if not off:
        raise HTTPException(status_code=400, detail=f"Officer '{cust_in.officer_id}' not found.")

    event = EvidenceCustody(
        evidence_id=evidence_id,
        officer_id=cust_in.officer_id,
        event_type=cust_in.event_type,
        event_timestamp=cust_in.event_timestamp or utc_now(),
        notes=cust_in.notes
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return {
        "custody_event_id": event.custody_event_id,
        "evidence_id": event.evidence_id,
        "officer_id": event.officer_id,
        "officer_name": off.full_name,
        "event_type": event.event_type,
        "event_timestamp": event.event_timestamp,
        "notes": event.notes
    }
