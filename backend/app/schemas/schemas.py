from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# ----------------- Auth & Token Schemas -----------------
class Token(BaseModel):
    access_token: str
    token_type: str
    officer: Dict[str, Any]

class LoginRequest(BaseModel):
    badge_number: str
    password: str

# ----------------- Officer Schemas -----------------
class OfficerBase(BaseModel):
    full_name: str
    badge_number: str
    department: str
    contact_email: str
    role: str = "Investigator"
    account_status: str = "Active"

class OfficerCreate(OfficerBase):
    officer_id: Optional[str] = None
    password: str = "demo1234"

class OfficerUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    contact_email: Optional[str] = None
    role: Optional[str] = None
    account_status: Optional[str] = None
    password: Optional[str] = None

class OfficerOut(OfficerBase):
    officer_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ----------------- Junction Link Schemas -----------------
class CaseLinkRequest(BaseModel):
    entity_type: str # 'person', 'organization', 'vehicle', 'device', 'location'
    entity_id: str
    relationship_role: Optional[str] = None
    notes: Optional[str] = None

class CaseUnlinkRequest(BaseModel):
    entity_type: str
    entity_id: str

# ----------------- Case Activity Schemas -----------------
class CaseActivityCreate(BaseModel):
    officer_id: Optional[str] = None
    activity_type: str
    title: str
    description: str
    activity_timestamp: Optional[datetime] = None

class CaseActivityOut(BaseModel):
    activity_id: int
    case_id: str
    officer_id: Optional[str] = None
    officer_name: Optional[str] = None
    activity_type: str
    title: str
    description: str
    activity_timestamp: datetime

    class Config:
        from_attributes = True

# ----------------- Evidence Custody Schemas -----------------
class EvidenceCustodyCreate(BaseModel):
    officer_id: str
    event_type: str
    notes: Optional[str] = None
    event_timestamp: Optional[datetime] = None

class EvidenceCustodyOut(BaseModel):
    custody_event_id: int
    evidence_id: str
    officer_id: str
    officer_name: Optional[str] = None
    event_type: str
    event_timestamp: datetime
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- Evidence Schemas -----------------
class EvidenceBase(BaseModel):
    title: str
    evidence_type: str # Physical, Digital, Forensic, Documentary, Audio/Video
    description: str
    case_id: str
    collected_by_officer_id: Optional[str] = None
    storage_reference: str
    status: str = "Logged in Secure Storage"
    notes: Optional[str] = None
    collection_date: Optional[datetime] = None

class EvidenceCreate(EvidenceBase):
    evidence_id: Optional[str] = None

class EvidenceUpdate(BaseModel):
    title: Optional[str] = None
    evidence_type: Optional[str] = None
    description: Optional[str] = None
    case_id: Optional[str] = None
    collected_by_officer_id: Optional[str] = None
    storage_reference: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    collection_date: Optional[datetime] = None

class EvidenceOut(EvidenceBase):
    evidence_id: str
    collected_by_name: Optional[str] = None
    case_title: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    custody_history: Optional[List[EvidenceCustodyOut]] = []

    class Config:
        from_attributes = True

# ----------------- People Schemas -----------------
class PersonBase(BaseModel):
    full_name: str
    date_of_birth: Optional[str] = None
    contact_details: Optional[str] = None
    address: Optional[str] = None
    category: str = "Other" # Witness, Reporting Party, Subject, Other
    description: Optional[str] = None

class PersonCreate(PersonBase):
    person_id: Optional[str] = None

class PersonUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    contact_details: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None

class PersonOut(PersonBase):
    person_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    linked_cases_count: Optional[int] = 0

    class Config:
        from_attributes = True

# ----------------- Organization Schemas -----------------
class OrganizationBase(BaseModel):
    name: str
    organization_type: str
    address: Optional[str] = None
    contact_details: Optional[str] = None
    description: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    organization_id: Optional[str] = None

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    organization_type: Optional[str] = None
    address: Optional[str] = None
    contact_details: Optional[str] = None
    description: Optional[str] = None

class OrganizationOut(OrganizationBase):
    organization_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ----------------- Vehicle Schemas -----------------
class VehicleBase(BaseModel):
    registration_number: str
    make: str
    model: str
    color: str
    vehicle_type: str = "Sedan"
    description: Optional[str] = None

class VehicleCreate(VehicleBase):
    vehicle_id: Optional[str] = None

class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    vehicle_type: Optional[str] = None
    description: Optional[str] = None

class VehicleOut(VehicleBase):
    vehicle_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ----------------- Device Schemas -----------------
class DeviceBase(BaseModel):
    device_type: str
    manufacturer: str
    model: str
    serial_number: str
    description: Optional[str] = None

class DeviceCreate(DeviceBase):
    device_id: Optional[str] = None

class DeviceUpdate(BaseModel):
    device_type: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    description: Optional[str] = None

class DeviceOut(DeviceBase):
    device_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ----------------- Location Schemas -----------------
class LocationBase(BaseModel):
    name: str
    address: str
    location_type: str = "Commercial"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None

class LocationCreate(LocationBase):
    location_id: Optional[str] = None

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    location_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None

class LocationOut(LocationBase):
    location_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ----------------- Case Schemas -----------------
class CaseBase(BaseModel):
    title: str
    description: str
    case_type: str
    status: str = "Open"
    priority: str = "Medium"
    lead_officer_id: Optional[str] = None
    incident_date: Optional[datetime] = None

class CaseCreate(CaseBase):
    case_id: Optional[str] = None

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    case_type: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    lead_officer_id: Optional[str] = None
    incident_date: Optional[datetime] = None

class CaseOut(CaseBase):
    case_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    lead_officer_name: Optional[str] = None
    evidence_count: Optional[int] = 0
    people_count: Optional[int] = 0

    class Config:
        from_attributes = True

class CaseDetail(CaseOut):
    people: List[PersonOut] = []
    organizations: List[OrganizationOut] = []
    vehicles: List[VehicleOut] = []
    devices: List[DeviceOut] = []
    locations: List[LocationOut] = []
    evidence_items: List[EvidenceOut] = []
    activities: List[CaseActivityOut] = []
    documents: List[Dict[str, Any]] = []

# ----------------- MongoDB Investigation Document Schemas -----------------
class RelatedEntityRef(BaseModel):
    entity_type: str # person, organization, vehicle, device, location, evidence
    entity_id: str
    note: Optional[str] = None

class InvestigationDocumentCreate(BaseModel):
    document_type: str # Witness statements, Investigation notes, Social media posts, Chat exports, Image metadata, CCTV metadata, PDF reports, Email archives, JSON API responses
    title: str
    content: str
    summary: str
    source_type: str # Field Interview, Digital Forensic Extraction, Public OSINT, Sensor Log, Surveillance, Formal Filing
    source_name: str
    case_id: Optional[str] = None
    related_entity_ids: List[Dict[str, Any]] = []
    tags: List[str] = []
    metadata: Dict[str, Any] = {}
    file_name: Optional[str] = None
    mime_type: Optional[str] = None
    language: Optional[str] = "en"
    document_status: str = "Verified"
    created_at: Optional[datetime] = None

class InvestigationDocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    document_type: Optional[str] = None
    source_type: Optional[str] = None
    source_name: Optional[str] = None
    case_id: Optional[str] = None
    related_entity_ids: Optional[List[Dict[str, Any]]] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    file_name: Optional[str] = None
    mime_type: Optional[str] = None
    language: Optional[str] = None
    document_status: Optional[str] = None

class InvestigationDocumentOut(BaseModel):
    id: str
    document_type: str
    title: str
    content: str
    summary: str
    source_type: str
    source_name: str
    case_id: Optional[str] = None
    related_entity_ids: List[Dict[str, Any]] = []
    tags: List[str] = []
    metadata: Dict[str, Any] = {}
    file_name: Optional[str] = None
    mime_type: Optional[str] = None
    language: Optional[str] = "en"
    document_status: str = "Verified"
    created_at: Optional[datetime] = None
    ingested_at: Optional[datetime] = None

# ----------------- Search & Cross-Database Schemas -----------------
class SearchResultItem(BaseModel):
    source_db: str # 'PostgreSQL' or 'MongoDB'
    category: str # 'case', 'person', 'organization', 'vehicle', 'device', 'location', 'evidence', 'document'
    id: str
    title: str
    subtitle: Optional[str] = None
    snippet: Optional[str] = None
    case_id: Optional[str] = None
    tags: Optional[List[str]] = []
    matched_field: Optional[str] = None
    url: str

class UnifiedSearchResponse(BaseModel):
    query: str
    total_sql_results: int
    total_mongo_results: int
    sql_results: List[SearchResultItem]
    mongo_results: List[SearchResultItem]

# ----------------- Timeline Schemas -----------------
class TimelineEvent(BaseModel):
    id: str
    timestamp: Optional[datetime] = None
    timestamp_str: str
    date_type: str # 'alleged_event', 'record_created', 'custody_action', 'document_ingested'
    category: str # 'Case Milestone', 'Evidence Log', 'Chain of Custody', 'Investigation Document', 'Case Activity'
    title: str
    description: str
    source_record_id: str
    source_type: str # 'PostgreSQL' or 'MongoDB'
    officer_name: Optional[str] = None
    badge_label: Optional[str] = None

# ----------------- Relationship Graph Schemas -----------------
class GraphNode(BaseModel):
    id: str
    label: str
    entity_type: str # case, person, organization, vehicle, device, location, evidence, document
    sublabel: Optional[str] = None
    details: Optional[Dict[str, Any]] = {}

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    relationship_type: str

class RelationshipGraphResponse(BaseModel):
    root_entity: Dict[str, Any]
    nodes: List[GraphNode]
    edges: List[GraphEdge]

# ----------------- Dashboard & Analytics Schemas -----------------
class DashboardStats(BaseModel):
    total_cases: int
    open_cases: int
    under_investigation_cases: int
    closed_cases: int
    total_people: int
    total_organizations: int
    total_vehicles: int
    total_devices: int
    total_locations: int
    total_evidence: int
    total_documents: int
    total_officers: int
    sql_engine: str
    mongo_status: str
    recent_cases: List[CaseOut] = []
    recent_documents: List[InvestigationDocumentOut] = []
    case_status_distribution: List[Dict[str, Any]] = []
    case_priority_distribution: List[Dict[str, Any]] = []
    recent_activities: List[CaseActivityOut] = []
