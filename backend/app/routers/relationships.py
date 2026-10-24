from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.mongo import get_mongo_db
from app.models.sql_models import Case, Person, Organization, Vehicle, Device, Location, Evidence
from app.schemas.schemas import RelationshipGraphResponse, GraphNode, GraphEdge

router = APIRouter(prefix="/relationships", tags=["Relationship Explorer"])

@router.get("/{entity_type}/{entity_id}", response_model=RelationshipGraphResponse)
def get_entity_relationships(entity_type: str, entity_id: str, db: Session = Depends(get_db)):
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []
    seen_nodes = set()
    seen_edges = set()

    def add_node(nid: str, label: str, etype: str, sublabel: str = "", details: dict = None):
        if nid not in seen_nodes:
            seen_nodes.add(nid)
            nodes.append(GraphNode(
                id=nid,
                label=label,
                entity_type=etype,
                sublabel=sublabel,
                details=details or {}
            ))

    def add_edge(source: str, target: str, label: str, rel_type: str):
        edge_key = f"{source}->{target}:{label}"
        if edge_key not in seen_edges:
            seen_edges.add(edge_key)
            edges.append(GraphEdge(
                id=f"edge-{len(edges)+1}",
                source=source,
                target=target,
                label=label,
                relationship_type=rel_type
            ))

    etype = entity_type.lower()

    if etype == "case":
        c = db.query(Case).filter(Case.case_id == entity_id).first()
        if not c:
            raise HTTPException(status_code=404, detail=f"Case '{entity_id}' not found.")

        root = {"id": c.case_id, "label": c.title, "type": "case"}
        add_node(c.case_id, c.case_id, "case", c.title, {"status": c.status, "priority": c.priority})

        # Lead Officer
        if c.lead_officer:
            off_id = c.lead_officer.officer_id
            add_node(off_id, c.lead_officer.full_name, "officer", f"Badge: {c.lead_officer.badge_number}")
            add_edge(c.case_id, off_id, "Lead Investigator", "assigned_to")

        # Linked People
        for p in c.people:
            add_node(p.person_id, p.full_name, "person", p.category)
            add_edge(c.case_id, p.person_id, p.category, "involves_person")

            # Check if this person is linked to any vehicles
            for pv in p.vehicles:
                add_node(pv.vehicle_id, f"{pv.make} {pv.model}", "vehicle", pv.registration_number)
                add_edge(p.person_id, pv.vehicle_id, "Registered Owner / Driver", "owns_vehicle")

            # Check if person belongs to any organization
            for po in p.organizations:
                add_node(po.organization_id, po.name, "organization", po.organization_type)
                add_edge(p.person_id, po.organization_id, "Affiliated With", "member_of")

        # Linked Organizations
        for org in c.organizations:
            add_node(org.organization_id, org.name, "organization", org.organization_type)
            add_edge(c.case_id, org.organization_id, "Under Review / Related", "involves_organization")

        # Linked Vehicles
        for v in c.vehicles:
            add_node(v.vehicle_id, f"{v.make} {v.model}", "vehicle", f"{v.color} | {v.registration_number}")
            add_edge(c.case_id, v.vehicle_id, "Vehicle of Interest", "involves_vehicle")

        # Linked Devices
        for d in c.devices:
            add_node(d.device_id, f"{d.manufacturer} {d.model}", "device", d.device_type)
            add_edge(c.case_id, d.device_id, "Digital Device", "involves_device")

        # Linked Locations
        for loc in c.locations:
            add_node(loc.location_id, loc.name, "location", loc.location_type)
            add_edge(c.case_id, loc.location_id, "Incident Site / POI", "involves_location")

        # Linked Evidence
        for ev in c.evidence_items:
            add_node(ev.evidence_id, ev.title, "evidence", ev.evidence_type)
            add_edge(c.case_id, ev.evidence_id, "Evidence Item", "has_evidence")

            # Evidence linking to entities
            for ep in ev.people:
                add_node(ep.person_id, ep.full_name, "person", ep.category)
                add_edge(ev.evidence_id, ep.person_id, "Linked Person", "evidence_person")
            for evv in ev.vehicles:
                add_node(evv.vehicle_id, f"{evv.make} {evv.model}", "vehicle", evv.registration_number)
                add_edge(ev.evidence_id, evv.vehicle_id, "Found In", "evidence_vehicle")
            for ed in ev.devices:
                add_node(ed.device_id, f"{ed.manufacturer} {ed.model}", "device", ed.device_type)
                add_edge(ev.evidence_id, ed.device_id, "Extracted From", "evidence_device")
            for el in ev.locations:
                add_node(el.location_id, el.name, "location", el.location_type)
                add_edge(ev.evidence_id, el.location_id, "Found At", "evidence_location")

        # Linked MongoDB Documents
        mdb = get_mongo_db()
        if mdb is not None:
            try:
                docs = mdb["investigation_documents"].find({"case_id": entity_id}).limit(10)
                for d in docs:
                    doc_id = str(d["_id"])
                    add_node(doc_id, d.get("title", "Document"), "document", d.get("document_type", "Doc"))
                    add_edge(c.case_id, doc_id, "Documentary Record", "has_document")
            except Exception:
                pass

        return RelationshipGraphResponse(
            root_entity=root,
            nodes=nodes,
            edges=edges
        )

    elif etype == "person":
        p = db.query(Person).filter(Person.person_id == entity_id).first()
        if not p:
            raise HTTPException(status_code=404, detail=f"Person '{entity_id}' not found.")

        root = {"id": p.person_id, "label": p.full_name, "type": "person"}
        add_node(p.person_id, p.full_name, "person", p.category)

        for c in p.cases:
            add_node(c.case_id, c.case_id, "case", c.title)
            add_edge(p.person_id, c.case_id, "Case Association", "associated_with")

        for o in p.organizations:
            add_node(o.organization_id, o.name, "organization", o.organization_type)
            add_edge(p.person_id, o.organization_id, "Affiliation", "member_of")

        for v in p.vehicles:
            add_node(v.vehicle_id, f"{v.make} {v.model}", "vehicle", v.registration_number)
            add_edge(p.person_id, v.vehicle_id, "Owner / Operator", "operates")

        for d in p.devices:
            add_node(d.device_id, f"{d.manufacturer} {d.model}", "device", d.device_type)
            add_edge(p.person_id, d.device_id, "User / Owner", "owns_device")

        for e in p.evidence_items:
            add_node(e.evidence_id, e.title, "evidence", e.evidence_type)
            add_edge(p.person_id, e.evidence_id, "Linked Evidence", "linked_to_evidence")

        return RelationshipGraphResponse(
            root_entity=root,
            nodes=nodes,
            edges=edges
        )
    else:
        raise HTTPException(status_code=400, detail="Only 'case' and 'person' root entities currently supported.")
