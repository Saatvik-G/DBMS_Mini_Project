from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import Optional, List
from app.db.session import get_db, ACTIVE_SQL_ENGINE
from app.db.mongo import get_mongo_db
from app.models.sql_models import Case, Person, Organization, Vehicle, Device, Location, Evidence
from app.schemas.schemas import UnifiedSearchResponse, SearchResultItem

router = APIRouter(prefix="/search", tags=["Unified Search"])

@router.get("", response_model=UnifiedSearchResponse)
def search_unified(
    q: str = Query(..., min_length=1, description="Query string"),
    category: Optional[str] = Query("all", description="all, cases, people, organizations, vehicles, devices, locations, evidence, documents"),
    case_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    sql_results: List[SearchResultItem] = []
    mongo_results: List[SearchResultItem] = []
    search_term = q.strip()
    words = [w.strip() for w in search_term.split() if w.strip()]
    raw_pattern = f"%{search_term}%"

    cat = category.lower() if category else "all"

    # Helper function to build multi-word condition: matches either full phrase OR all words
    def multi_word_filter(fields):
        # Full phrase match on any field
        conds = [f.ilike(raw_pattern) for f in fields]
        if len(words) > 1:
            # Each word must match at least one field
            word_conds = []
            for w in words:
                wp = f"%{w}%"
                word_conds.append(or_(*[f.ilike(wp) for f in fields]))
            conds.append(and_(*word_conds))
        return or_(*conds)

    # 1. Search SQL Relational Store
    # A. Cases
    if cat in ("all", "cases", "sql"):
        cases = db.query(Case).filter(
            multi_word_filter([Case.case_id, Case.title, Case.description, Case.case_type])
        ).limit(10).all()
        for c in cases:
            sql_results.append(SearchResultItem(
                source_db=ACTIVE_SQL_ENGINE,
                category="case",
                id=c.case_id,
                title=f"{c.case_id}: {c.title}",
                subtitle=f"Status: {c.status} | Priority: {c.priority} | Type: {c.case_type}",
                snippet=c.description[:180] + ("..." if len(c.description) > 180 else ""),
                case_id=c.case_id,
                tags=[c.status, c.priority, c.case_type],
                matched_field="title/description",
                url=f"/cases/{c.case_id}"
            ))

    # B. People
    if cat in ("all", "people", "sql"):
        people = db.query(Person).filter(
            multi_word_filter([Person.person_id, Person.full_name, Person.description, Person.contact_details, Person.address])
        ).limit(10).all()
        for p in people:
            linked_cases = [c.case_id for c in p.cases]
            sql_results.append(SearchResultItem(
                source_db=ACTIVE_SQL_ENGINE,
                category="person",
                id=p.person_id,
                title=f"{p.person_id}: {p.full_name}",
                subtitle=f"Category: {p.category} | Linked Cases: {len(linked_cases)}",
                snippet=p.description or p.address or "No description recorded",
                case_id=linked_cases[0] if linked_cases else None,
                tags=[p.category],
                matched_field="full_name/description",
                url=f"/people/{p.person_id}"
            ))

    # C. Organizations
    if cat in ("all", "organizations", "sql"):
        orgs = db.query(Organization).filter(
            multi_word_filter([Organization.organization_id, Organization.name, Organization.organization_type, Organization.description])
        ).limit(10).all()
        for o in orgs:
            sql_results.append(SearchResultItem(
                source_db=ACTIVE_SQL_ENGINE,
                category="organization",
                id=o.organization_id,
                title=f"{o.organization_id}: {o.name}",
                subtitle=f"Type: {o.organization_type}",
                snippet=o.description or o.address or "No details",
                case_id=o.cases[0].case_id if o.cases else None,
                tags=[o.organization_type],
                matched_field="name/description",
                url=f"/organizations/{o.organization_id}"
            ))

    # D. Vehicles (e.g. "blue sedan" matches color="Navy Blue" and vehicle_type="Sedan")
    if cat in ("all", "vehicles", "sql"):
        vehicles = db.query(Vehicle).filter(
            multi_word_filter([Vehicle.vehicle_id, Vehicle.registration_number, Vehicle.make, Vehicle.model, Vehicle.color, Vehicle.vehicle_type, Vehicle.description])
        ).limit(10).all()
        for v in vehicles:
            sql_results.append(SearchResultItem(
                source_db=ACTIVE_SQL_ENGINE,
                category="vehicle",
                id=v.vehicle_id,
                title=f"{v.vehicle_id}: {v.color} {v.make} {v.model}",
                subtitle=f"Reg: {v.registration_number} | Type: {v.vehicle_type}",
                snippet=v.description or f"{v.color} {v.make} {v.model}",
                case_id=v.cases[0].case_id if v.cases else None,
                tags=[v.vehicle_type, v.color],
                matched_field="registration/make/color/type",
                url=f"/vehicles/{v.vehicle_id}"
            ))

    # E. Devices
    if cat in ("all", "devices", "sql"):
        devices = db.query(Device).filter(
            multi_word_filter([Device.device_id, Device.serial_number, Device.device_type, Device.manufacturer, Device.model, Device.description])
        ).limit(10).all()
        for d in devices:
            sql_results.append(SearchResultItem(
                source_db=ACTIVE_SQL_ENGINE,
                category="device",
                id=d.device_id,
                title=f"{d.device_id}: {d.manufacturer} {d.model}",
                subtitle=f"Type: {d.device_type} | Serial: {d.serial_number}",
                snippet=d.description or "No description",
                case_id=d.cases[0].case_id if d.cases else None,
                tags=[d.device_type, d.manufacturer],
                matched_field="serial/manufacturer",
                url=f"/devices/{d.device_id}"
            ))

    # F. Locations
    if cat in ("all", "locations", "sql"):
        locs = db.query(Location).filter(
            multi_word_filter([Location.location_id, Location.name, Location.address, Location.description])
        ).limit(10).all()
        for l in locs:
            sql_results.append(SearchResultItem(
                source_db=ACTIVE_SQL_ENGINE,
                category="location",
                id=l.location_id,
                title=f"{l.location_id}: {l.name}",
                subtitle=f"Type: {l.location_type} | Address: {l.address}",
                snippet=l.description or l.address,
                case_id=l.cases[0].case_id if l.cases else None,
                tags=[l.location_type],
                matched_field="name/address",
                url=f"/locations/{l.location_id}"
            ))

    # G. Evidence
    if cat in ("all", "evidence", "sql"):
        evidence = db.query(Evidence).filter(
            multi_word_filter([Evidence.evidence_id, Evidence.title, Evidence.description, Evidence.storage_reference])
        ).limit(10).all()
        for e in evidence:
            sql_results.append(SearchResultItem(
                source_db=ACTIVE_SQL_ENGINE,
                category="evidence",
                id=e.evidence_id,
                title=f"{e.evidence_id}: {e.title}",
                subtitle=f"Type: {e.evidence_type} | Case: {e.case_id} | Status: {e.status}",
                snippet=e.description,
                case_id=e.case_id,
                tags=[e.evidence_type, e.status],
                matched_field="title/description",
                url=f"/evidence/{e.evidence_id}"
            ))

    # 2. Search MongoDB Unstructured Documents
    if cat in ("all", "documents", "nosql"):
        mdb = get_mongo_db()
        if mdb is not None:
            try:
                # Support single and multi-word regex
                word_patterns = [f"(?=.*{w})" for w in words]
                combined_regex = {"$regex": "".join(word_patterns), "$options": "i"} if words else {"$regex": search_term, "$options": "i"}
                simple_regex = {"$regex": search_term, "$options": "i"}
                
                doc_filter = {
                    "$or": [
                        {"title": simple_regex},
                        {"content": simple_regex},
                        {"summary": simple_regex},
                        {"tags": simple_regex},
                        {"source_name": simple_regex},
                        {"document_type": simple_regex},
                        {"content": combined_regex},
                        {"tags": {"$in": [w.lower() for w in words]}}
                    ]
                }
                if case_id:
                    doc_filter["case_id"] = case_id

                cursor = mdb["investigation_documents"].find(doc_filter).limit(15)
                for d in cursor:
                    doc_id = str(d["_id"])
                    mongo_results.append(SearchResultItem(
                        source_db="MongoDB",
                        category="document",
                        id=doc_id,
                        title=f"Doc: {d.get('title', 'Untitled')}",
                        subtitle=f"Type: {d.get('document_type')} | Source: {d.get('source_name')} | Case: {d.get('case_id', 'Unlinked')}",
                        snippet=d.get("summary") or d.get("content", "")[:180] + "...",
                        case_id=d.get("case_id"),
                        tags=d.get("tags", []),
                        matched_field="content/tags/summary",
                        url=f"/documents/{doc_id}"
                    ))
            except Exception:
                pass

    return UnifiedSearchResponse(
        query=search_term,
        total_sql_results=len(sql_results),
        total_mongo_results=len(mongo_results),
        sql_results=sql_results,
        mongo_results=mongo_results
    )
