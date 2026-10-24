from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.db.mongo import get_mongo_db
from app.models.sql_models import Case, Evidence, Person, Vehicle, Device, Location, Organization

router = APIRouter(prefix="/analytics", tags=["Analytics & Reports"])

@router.get("")
def get_analytics(db: Session = Depends(get_db)):
    # 1. Cases by status
    status_rows = db.query(Case.status, func.count(Case.case_id)).group_by(Case.status).all()
    cases_by_status = [{"status": r[0], "count": r[1]} for r in status_rows]

    # 2. Cases by priority
    priority_rows = db.query(Case.priority, func.count(Case.case_id)).group_by(Case.priority).all()
    cases_by_priority = [{"priority": r[0], "count": r[1]} for r in priority_rows]

    # 3. Evidence by type
    evidence_rows = db.query(Evidence.evidence_type, func.count(Evidence.evidence_id)).group_by(Evidence.evidence_type).all()
    evidence_by_type = [{"evidence_type": r[0], "count": r[1]} for r in evidence_rows]

    # 4. Entity category totals (SQL distribution)
    entity_totals = [
        {"entity": "People", "count": db.query(func.count(Person.person_id)).scalar() or 0},
        {"entity": "Vehicles", "count": db.query(func.count(Vehicle.vehicle_id)).scalar() or 0},
        {"entity": "Devices", "count": db.query(func.count(Device.device_id)).scalar() or 0},
        {"entity": "Locations", "count": db.query(func.count(Location.location_id)).scalar() or 0},
        {"entity": "Organizations", "count": db.query(func.count(Organization.organization_id)).scalar() or 0},
        {"entity": "Evidence Items", "count": db.query(func.count(Evidence.evidence_id)).scalar() or 0}
    ]

    # 5. Documents by source type & document type from MongoDB
    docs_by_source = []
    docs_by_type = []
    mdb = get_mongo_db()
    if mdb is not None:
        try:
            # MongoDB Aggregation Pipeline for source_type distribution
            pipe_source = [
                {"$group": {"_id": "$source_type", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ]
            for doc in mdb["investigation_documents"].aggregate(pipe_source):
                docs_by_source.append({"source_type": doc["_id"] or "Unspecified", "count": doc["count"]})

            # MongoDB Aggregation Pipeline for document_type distribution
            pipe_type = [
                {"$group": {"_id": "$document_type", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ]
            for doc in mdb["investigation_documents"].aggregate(pipe_type):
                docs_by_type.append({"document_type": doc["_id"] or "Unspecified", "count": doc["count"]})
        except Exception:
            pass

    return {
        "cases_by_status": cases_by_status,
        "cases_by_priority": cases_by_priority,
        "evidence_by_type": evidence_by_type,
        "entity_totals": entity_totals,
        "docs_by_source": docs_by_source,
        "docs_by_type": docs_by_type
    }
