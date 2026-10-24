from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List
from app.db.session import get_db
from app.db.mongo import get_mongo_db
from app.models.sql_models import Case, CaseActivity, Evidence, EvidenceCustody
from app.schemas.schemas import TimelineEvent

router = APIRouter(prefix="/cases", tags=["Case Timeline"])

@router.get("/{case_id}/timeline", response_model=List[TimelineEvent])
def get_case_timeline(
    case_id: str,
    category: Optional[str] = None,
    source_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    c = db.query(Case).filter(Case.case_id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

    timeline: List[TimelineEvent] = []

    # 1. Incident Allegation Event (alleged event date)
    if c.incident_date:
        timeline.append(TimelineEvent(
            id=f"incident-{c.case_id}",
            timestamp=c.incident_date,
            timestamp_str=c.incident_date.strftime("%Y-%m-%d %H:%M UTC"),
            date_type="alleged_event",
            category="Incident Allegation",
            title=f"Alleged Incident Occurred: {c.case_type}",
            description=f"Estimated or reported incident timeframe for {c.title}.",
            source_record_id=c.case_id,
            source_type="PostgreSQL",
            badge_label="Alleged Occurrence"
        ))

    # 2. Case Record Creation Event (system intake)
    if c.created_at:
        timeline.append(TimelineEvent(
            id=f"case-created-{c.case_id}",
            timestamp=c.created_at,
            timestamp_str=c.created_at.strftime("%Y-%m-%d %H:%M UTC"),
            date_type="record_created",
            category="Case Milestone",
            title="Investigation Opened",
            description=f"Case file {c.case_id} formally registered with priority '{c.priority}'. Lead Officer: {c.lead_officer.full_name if c.lead_officer else 'Unassigned'}.",
            source_record_id=c.case_id,
            source_type="PostgreSQL",
            officer_name=c.lead_officer.full_name if c.lead_officer else None,
            badge_label="System Intake"
        ))

    # 3. Case Activity Logs
    for act in c.activities:
        timeline.append(TimelineEvent(
            id=f"act-{act.activity_id}",
            timestamp=act.activity_timestamp,
            timestamp_str=act.activity_timestamp.strftime("%Y-%m-%d %H:%M UTC") if act.activity_timestamp else "Date Unavailable",
            date_type="activity_logged",
            category="Case Activity",
            title=f"{act.activity_type}: {act.title}",
            description=act.description,
            source_record_id=str(act.activity_id),
            source_type="PostgreSQL",
            officer_name=act.officer.full_name if act.officer else "Investigator",
            badge_label="Investigative Log"
        ))

    # 4. Evidence Collection & Custody Events
    for ev in c.evidence_items:
        if ev.collection_date:
            timeline.append(TimelineEvent(
                id=f"ev-col-{ev.evidence_id}",
                timestamp=ev.collection_date,
                timestamp_str=ev.collection_date.strftime("%Y-%m-%d %H:%M UTC"),
                date_type="evidence_collected",
                category="Evidence Log",
                title=f"Evidence Collected: {ev.title}",
                description=f"Type: {ev.evidence_type}. Storage reference: {ev.storage_reference}. Status: {ev.status}.",
                source_record_id=ev.evidence_id,
                source_type="PostgreSQL",
                officer_name=ev.collected_by_officer.full_name if ev.collected_by_officer else None,
                badge_label="Evidence Collection"
            ))
        
        # Custody transfer events
        for cust in ev.custody_history:
            timeline.append(TimelineEvent(
                id=f"cust-{cust.custody_event_id}",
                timestamp=cust.event_timestamp,
                timestamp_str=cust.event_timestamp.strftime("%Y-%m-%d %H:%M UTC") if cust.event_timestamp else "Date Unavailable",
                date_type="custody_action",
                category="Chain of Custody",
                title=f"Custody Action: {cust.event_type} ({ev.evidence_id})",
                description=f"Item: {ev.title}. Action by {cust.officer.full_name if cust.officer else 'Officer'}. Notes: {cust.notes or 'Standard procedure'}.",
                source_record_id=str(cust.custody_event_id),
                source_type="PostgreSQL",
                officer_name=cust.officer.full_name if cust.officer else None,
                badge_label="Custody Event"
            ))

    # 5. MongoDB Investigation Documents (distinguish created_at vs ingested_at)
    mdb = get_mongo_db()
    if mdb is not None:
        try:
            cursor = mdb["investigation_documents"].find({"case_id": case_id})
            for doc in cursor:
                doc_id = str(doc["_id"])
                doc_title = doc.get("title", "Untitled Document")
                doc_type = doc.get("document_type", "Document")
                source_name = doc.get("source_name", "Unknown Source")
                created_dt = doc.get("created_at")
                ingested_dt = doc.get("ingested_at")

                # Document Origin/Creation Event
                if created_dt and isinstance(created_dt, datetime):
                    timeline.append(TimelineEvent(
                        id=f"mongo-created-{doc_id}",
                        timestamp=created_dt,
                        timestamp_str=created_dt.strftime("%Y-%m-%d %H:%M UTC"),
                        date_type="document_created",
                        category="Investigation Document",
                        title=f"Document Authored: {doc_title}",
                        description=f"Type: {doc_type}. Source: {source_name}. Summary: {doc.get('summary', '')[:120]}...",
                        source_record_id=doc_id,
                        source_type="MongoDB",
                        badge_label="Original Document Date"
                    ))

                # Document System Ingestion Event
                if ingested_dt and isinstance(ingested_dt, datetime):
                    timeline.append(TimelineEvent(
                        id=f"mongo-ingested-{doc_id}",
                        timestamp=ingested_dt,
                        timestamp_str=ingested_dt.strftime("%Y-%m-%d %H:%M UTC"),
                        date_type="document_ingested",
                        category="Document Ingestion",
                        title=f"Document Ingested into Fusion Store: {doc_title}",
                        description=f"Ingested from {source_name} into MongoDB collection 'investigation_documents'. Tags: {', '.join(doc.get('tags', []))}",
                        source_record_id=doc_id,
                        source_type="MongoDB",
                        badge_label="MongoDB Ingestion"
                    ))
        except Exception:
            pass

    # Sort chronologically (ascending, null timestamps at the end)
    def sort_key(item: TimelineEvent):
        if item.timestamp is None:
            return datetime.max
        return item.timestamp

    timeline.sort(key=sort_key)

    # Apply filters if provided
    if category and category != "All":
        timeline = [t for t in timeline if t.category == category]
    if source_type and source_type != "All":
        timeline = [t for t in timeline if t.source_type == source_type]

    return timeline
