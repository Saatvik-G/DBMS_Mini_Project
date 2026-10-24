from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.db.mongo import get_mongo_db
from app.db.session import get_db
from app.models.sql_models import Case, Person, Organization, Vehicle, Device, Location, Evidence
from app.schemas.schemas import (
    InvestigationDocumentCreate, InvestigationDocumentUpdate, InvestigationDocumentOut
)

router = APIRouter(prefix="/documents", tags=["MongoDB Investigation Documents"])

def utc_now():
    return datetime.now(timezone.utc)

def format_doc(doc: dict) -> dict:
    if not doc:
        return doc
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

@router.get("", response_model=List[InvestigationDocumentOut])
def list_documents(
    search: Optional[str] = None,
    document_type: Optional[str] = None,
    source_type: Optional[str] = None,
    case_id: Optional[str] = None,
    tag: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    mdb = get_mongo_db()
    if mdb is None:
        raise HTTPException(status_code=503, detail="MongoDB database is currently offline or unreachable.")

    filter_query = {}
    if document_type and document_type != "All":
        filter_query["document_type"] = document_type
    if source_type and source_type != "All":
        filter_query["source_type"] = source_type
    if case_id:
        filter_query["case_id"] = case_id
    if tag:
        filter_query["tags"] = tag

    if search:
        # Use regex for flexible case-insensitive search across title, content, summary, or source
        regex = {"$regex": search, "$options": "i"}
        filter_query["$or"] = [
            {"title": regex},
            {"content": regex},
            {"summary": regex},
            {"source_name": regex},
            {"tags": regex}
        ]

    cursor = mdb["investigation_documents"].find(filter_query).sort("ingested_at", -1).skip(skip).limit(limit)
    return [format_doc(doc) for doc in cursor]

@router.post("", response_model=InvestigationDocumentOut, status_code=status.HTTP_201_CREATED)
def create_document(doc_in: InvestigationDocumentCreate, db: Session = Depends(get_db)):
    mdb = get_mongo_db()
    if mdb is None:
        raise HTTPException(status_code=503, detail="MongoDB database is currently offline or unreachable.")

    # Cross-database validation: if case_id is specified, verify it exists in SQL
    if doc_in.case_id:
        c = db.query(Case).filter(Case.case_id == doc_in.case_id).first()
        if not c:
            raise HTTPException(
                status_code=400,
                detail=f"Validation failed: Referenced SQL Case ID '{doc_in.case_id}' does not exist in relational store."
            )

    doc_data = doc_in.dict()
    doc_data["created_at"] = doc_data.get("created_at") or utc_now()
    doc_data["ingested_at"] = utc_now()

    result = mdb["investigation_documents"].insert_one(doc_data)
    doc_data["id"] = str(result.inserted_id)
    doc_data.pop("_id", None)
    return doc_data

@router.get("/{document_id}")
def get_document_detail(document_id: str, db: Session = Depends(get_db)):
    mdb = get_mongo_db()
    if mdb is None:
        raise HTTPException(status_code=503, detail="MongoDB database is currently offline or unreachable.")

    try:
        obj_id = ObjectId(document_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid MongoDB ObjectId format.")

    doc = mdb["investigation_documents"].find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")

    doc = format_doc(doc)

    # Enrich with SQL references
    enriched_case = None
    if doc.get("case_id"):
        c = db.query(Case).filter(Case.case_id == doc["case_id"]).first()
        if c:
            enriched_case = {
                "case_id": c.case_id,
                "title": c.title,
                "status": c.status,
                "priority": c.priority
            }
        else:
            enriched_case = {"case_id": doc["case_id"], "note": "SQL Case record deleted or unlinked."}

    # Enrich related SQL entities
    enriched_entities = []
    for rel in doc.get("related_entity_ids", []):
        etype = rel.get("entity_type", "").lower()
        eid = rel.get("entity_id", "")
        name = "Unknown"
        if etype == "person":
            p = db.query(Person).filter(Person.person_id == eid).first()
            if p: name = p.full_name
        elif etype == "organization":
            o = db.query(Organization).filter(Organization.organization_id == eid).first()
            if o: name = o.name
        elif etype == "vehicle":
            v = db.query(Vehicle).filter(Vehicle.vehicle_id == eid).first()
            if v: name = f"{v.make} {v.model} ({v.registration_number})"
        elif etype == "device":
            d = db.query(Device).filter(Device.device_id == eid).first()
            if d: name = f"{d.device_type} - {d.manufacturer} {d.model}"
        elif etype == "location":
            l = db.query(Location).filter(Location.location_id == eid).first()
            if l: name = l.name
        elif etype == "evidence":
            e = db.query(Evidence).filter(Evidence.evidence_id == eid).first()
            if e: name = e.title

        enriched_entities.append({
            "entity_type": etype,
            "entity_id": eid,
            "resolved_name": name,
            "note": rel.get("note")
        })

    doc["case_detail"] = enriched_case
    doc["resolved_entities"] = enriched_entities
    return doc

@router.put("/{document_id}", response_model=InvestigationDocumentOut)
def update_document(document_id: str, doc_in: InvestigationDocumentUpdate, db: Session = Depends(get_db)):
    mdb = get_mongo_db()
    if mdb is None:
        raise HTTPException(status_code=503, detail="MongoDB database is currently offline or unreachable.")

    try:
        obj_id = ObjectId(document_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid MongoDB ObjectId format.")

    update_fields = doc_in.dict(exclude_unset=True)
    if "case_id" in update_fields and update_fields["case_id"]:
        c = db.query(Case).filter(Case.case_id == update_fields["case_id"]).first()
        if not c:
            raise HTTPException(status_code=400, detail=f"Case ID '{update_fields['case_id']}' not found in SQL database.")

    update_fields["updated_at"] = utc_now()
    result = mdb["investigation_documents"].update_one({"_id": obj_id}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")

    updated_doc = mdb["investigation_documents"].find_one({"_id": obj_id})
    return format_doc(updated_doc)

@router.delete("/{document_id}")
def delete_document(document_id: str):
    mdb = get_mongo_db()
    if mdb is None:
        raise HTTPException(status_code=503, detail="MongoDB database is currently offline or unreachable.")

    try:
        obj_id = ObjectId(document_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid MongoDB ObjectId format.")

    res = mdb["investigation_documents"].delete_one({"_id": obj_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")
    return {"message": f"Document '{document_id}' permanently removed from MongoDB collection."}
