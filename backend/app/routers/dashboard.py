from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db, ACTIVE_SQL_ENGINE
from app.db.mongo import get_mongo_db, MONGO_CONNECTED
from app.models.sql_models import (
    Case, Person, Organization, Vehicle, Device, Location, Evidence, Officer, CaseActivity
)
from app.schemas.schemas import DashboardStats, CaseOut, InvestigationDocumentOut, CaseActivityOut

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # SQL aggregate counts
    total_cases = db.query(func.count(Case.case_id)).scalar() or 0
    open_cases = db.query(func.count(Case.case_id)).filter(Case.status == "Open").scalar() or 0
    under_inv_cases = db.query(func.count(Case.case_id)).filter(Case.status == "Under Investigation").scalar() or 0
    closed_cases = db.query(func.count(Case.case_id)).filter(Case.status == "Closed").scalar() or 0
    
    total_people = db.query(func.count(Person.person_id)).scalar() or 0
    total_orgs = db.query(func.count(Organization.organization_id)).scalar() or 0
    total_vehicles = db.query(func.count(Vehicle.vehicle_id)).scalar() or 0
    total_devices = db.query(func.count(Device.device_id)).scalar() or 0
    total_locations = db.query(func.count(Location.location_id)).scalar() or 0
    total_evidence = db.query(func.count(Evidence.evidence_id)).scalar() or 0
    total_officers = db.query(func.count(Officer.officer_id)).scalar() or 0

    # Case distributions using SQL GROUP BY
    status_counts = db.query(Case.status, func.count(Case.case_id)).group_by(Case.status).all()
    case_status_distribution = [{"status": row[0], "count": row[1]} for row in status_counts]

    priority_counts = db.query(Case.priority, func.count(Case.case_id)).group_by(Case.priority).all()
    case_priority_distribution = [{"priority": row[0], "count": row[1]} for row in priority_counts]

    # Recent cases
    recent_cases_db = db.query(Case).order_by(Case.created_at.desc()).limit(5).all()
    recent_cases = []
    for c in recent_cases_db:
        recent_cases.append({
            "case_id": c.case_id,
            "title": c.title,
            "description": c.description,
            "case_type": c.case_type,
            "status": c.status,
            "priority": c.priority,
            "lead_officer_id": c.lead_officer_id,
            "lead_officer_name": c.lead_officer.full_name if c.lead_officer else "Unassigned",
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "evidence_count": len(c.evidence_items),
            "people_count": len(c.people)
        })

    # Recent activities
    recent_activities_db = db.query(CaseActivity).order_by(CaseActivity.activity_timestamp.desc()).limit(6).all()
    recent_activities = []
    for a in recent_activities_db:
        recent_activities.append({
            "activity_id": a.activity_id,
            "case_id": a.case_id,
            "officer_id": a.officer_id,
            "officer_name": a.officer.full_name if a.officer else "System / Unspecified",
            "activity_type": a.activity_type,
            "title": a.title,
            "description": a.description,
            "activity_timestamp": a.activity_timestamp
        })

    # MongoDB document statistics
    total_docs = 0
    recent_docs = []
    mongo_status = "Disconnected"
    mdb = get_mongo_db()
    if mdb is not None:
        try:
            total_docs = mdb["investigation_documents"].count_documents({})
            mongo_status = "Connected"
            cursor = mdb["investigation_documents"].find().sort("ingested_at", -1).limit(5)
            for doc in cursor:
                doc["id"] = str(doc["_id"])
                doc.pop("_id", None)
                recent_docs.append(doc)
        except Exception:
            mongo_status = "Error"

    return {
        "total_cases": total_cases,
        "open_cases": open_cases,
        "under_investigation_cases": under_inv_cases,
        "closed_cases": closed_cases,
        "total_people": total_people,
        "total_organizations": total_orgs,
        "total_vehicles": total_vehicles,
        "total_devices": total_devices,
        "total_locations": total_locations,
        "total_evidence": total_evidence,
        "total_documents": total_docs,
        "total_officers": total_officers,
        "sql_engine": ACTIVE_SQL_ENGINE,
        "mongo_status": mongo_status,
        "recent_cases": recent_cases,
        "recent_documents": recent_docs,
        "case_status_distribution": case_status_distribution,
        "case_priority_distribution": case_priority_distribution,
        "recent_activities": recent_activities
    }
