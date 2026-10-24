from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, DateTime, ForeignKey, Float, Integer, CheckConstraint, Index, Table
)
from sqlalchemy.orm import relationship
from app.db.session import Base

def utc_now():
    return datetime.now(timezone.utc)

# ----------------- Junction Tables -----------------

case_people = Table(
    "case_people",
    Base.metadata,
    Column("case_id", String(50), ForeignKey("cases.case_id", ondelete="CASCADE"), primary_key=True),
    Column("person_id", String(50), ForeignKey("people.person_id", ondelete="CASCADE"), primary_key=True),
    Column("role_in_case", String(100), default="Associated Person"),
    Column("notes", Text, nullable=True),
    Column("added_at", DateTime, default=utc_now)
)

case_organizations = Table(
    "case_organizations",
    Base.metadata,
    Column("case_id", String(50), ForeignKey("cases.case_id", ondelete="CASCADE"), primary_key=True),
    Column("organization_id", String(50), ForeignKey("organizations.organization_id", ondelete="CASCADE"), primary_key=True),
    Column("association_type", String(100), default="Under Investigation / Related"),
    Column("notes", Text, nullable=True),
    Column("added_at", DateTime, default=utc_now)
)

case_vehicles = Table(
    "case_vehicles",
    Base.metadata,
    Column("case_id", String(50), ForeignKey("cases.case_id", ondelete="CASCADE"), primary_key=True),
    Column("vehicle_id", String(50), ForeignKey("vehicles.vehicle_id", ondelete="CASCADE"), primary_key=True),
    Column("role_in_case", String(100), default="Vehicle of Interest"),
    Column("notes", Text, nullable=True),
    Column("added_at", DateTime, default=utc_now)
)

case_devices = Table(
    "case_devices",
    Base.metadata,
    Column("case_id", String(50), ForeignKey("cases.case_id", ondelete="CASCADE"), primary_key=True),
    Column("device_id", String(50), ForeignKey("devices.device_id", ondelete="CASCADE"), primary_key=True),
    Column("role_in_case", String(100), default="Digital Evidence / Device"),
    Column("notes", Text, nullable=True),
    Column("added_at", DateTime, default=utc_now)
)

case_locations = Table(
    "case_locations",
    Base.metadata,
    Column("case_id", String(50), ForeignKey("cases.case_id", ondelete="CASCADE"), primary_key=True),
    Column("location_id", String(50), ForeignKey("locations.location_id", ondelete="CASCADE"), primary_key=True),
    Column("association_type", String(100), default="Incident Site / Point of Interest"),
    Column("notes", Text, nullable=True),
    Column("added_at", DateTime, default=utc_now)
)

person_organizations = Table(
    "person_organizations",
    Base.metadata,
    Column("person_id", String(50), ForeignKey("people.person_id", ondelete="CASCADE"), primary_key=True),
    Column("organization_id", String(50), ForeignKey("organizations.organization_id", ondelete="CASCADE"), primary_key=True),
    Column("role", String(100), default="Member / Employee"),
    Column("added_at", DateTime, default=utc_now)
)

person_vehicles = Table(
    "person_vehicles",
    Base.metadata,
    Column("person_id", String(50), ForeignKey("people.person_id", ondelete="CASCADE"), primary_key=True),
    Column("vehicle_id", String(50), ForeignKey("vehicles.vehicle_id", ondelete="CASCADE"), primary_key=True),
    Column("relationship_type", String(100), default="Registered Owner / Driver"),
    Column("added_at", DateTime, default=utc_now)
)

person_devices = Table(
    "person_devices",
    Base.metadata,
    Column("person_id", String(50), ForeignKey("people.person_id", ondelete="CASCADE"), primary_key=True),
    Column("device_id", String(50), ForeignKey("devices.device_id", ondelete="CASCADE"), primary_key=True),
    Column("relationship_type", String(100), default="User / Owner"),
    Column("added_at", DateTime, default=utc_now)
)

evidence_people = Table(
    "evidence_people",
    Base.metadata,
    Column("evidence_id", String(50), ForeignKey("evidence.evidence_id", ondelete="CASCADE"), primary_key=True),
    Column("person_id", String(50), ForeignKey("people.person_id", ondelete="CASCADE"), primary_key=True),
    Column("association_type", String(100), default="Recovered from / Linked to"),
    Column("added_at", DateTime, default=utc_now)
)

evidence_vehicles = Table(
    "evidence_vehicles",
    Base.metadata,
    Column("evidence_id", String(50), ForeignKey("evidence.evidence_id", ondelete="CASCADE"), primary_key=True),
    Column("vehicle_id", String(50), ForeignKey("vehicles.vehicle_id", ondelete="CASCADE"), primary_key=True),
    Column("association_type", String(100), default="Found in / Associated with"),
    Column("added_at", DateTime, default=utc_now)
)

evidence_devices = Table(
    "evidence_devices",
    Base.metadata,
    Column("evidence_id", String(50), ForeignKey("evidence.evidence_id", ondelete="CASCADE"), primary_key=True),
    Column("device_id", String(50), ForeignKey("devices.device_id", ondelete="CASCADE"), primary_key=True),
    Column("association_type", String(100), default="Extracted from / Hardware correlation"),
    Column("added_at", DateTime, default=utc_now)
)

evidence_locations = Table(
    "evidence_locations",
    Base.metadata,
    Column("evidence_id", String(50), ForeignKey("evidence.evidence_id", ondelete="CASCADE"), primary_key=True),
    Column("location_id", String(50), ForeignKey("locations.location_id", ondelete="CASCADE"), primary_key=True),
    Column("association_type", String(100), default="Found at location"),
    Column("added_at", DateTime, default=utc_now)
)

# ----------------- Primary Entities -----------------

class Officer(Base):
    __tablename__ = "officers"
    
    officer_id = Column(String(50), primary_key=True)
    full_name = Column(String(150), nullable=False)
    badge_number = Column(String(50), unique=True, nullable=False, index=True)
    department = Column(String(100), nullable=False)
    contact_email = Column(String(120), unique=True, nullable=False)
    role = Column(String(100), default="Investigator")
    account_status = Column(String(50), default="Active")
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    assigned_cases = relationship("Case", back_populates="lead_officer", foreign_keys="Case.lead_officer_id")
    collected_evidence = relationship("Evidence", back_populates="collected_by_officer")
    custody_events = relationship("EvidenceCustody", back_populates="officer")
    activities = relationship("CaseActivity", back_populates="officer")


class Case(Base):
    __tablename__ = "cases"
    
    case_id = Column(String(50), primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    case_type = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="Open", index=True)
    priority = Column(String(50), nullable=False, default="Medium", index=True)
    lead_officer_id = Column(String(50), ForeignKey("officers.officer_id", ondelete="SET NULL"), nullable=True)
    incident_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now, index=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    __table_args__ = (
        CheckConstraint("status IN ('Open', 'Under Investigation', 'On Hold', 'Closed')", name="check_case_status"),
        CheckConstraint("priority IN ('Low', 'Medium', 'High', 'Critical')", name="check_case_priority"),
    )

    # Relationships
    lead_officer = relationship("Officer", back_populates="assigned_cases", foreign_keys=[lead_officer_id])
    people = relationship("Person", secondary=case_people, back_populates="cases")
    organizations = relationship("Organization", secondary=case_organizations, back_populates="cases")
    vehicles = relationship("Vehicle", secondary=case_vehicles, back_populates="cases")
    devices = relationship("Device", secondary=case_devices, back_populates="cases")
    locations = relationship("Location", secondary=case_locations, back_populates="cases")
    evidence_items = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    activities = relationship("CaseActivity", back_populates="case", cascade="all, delete-orphan")


class Person(Base):
    __tablename__ = "people"
    
    person_id = Column(String(50), primary_key=True, index=True)
    full_name = Column(String(150), nullable=False, index=True)
    date_of_birth = Column(String(50), nullable=True)
    contact_details = Column(String(200), nullable=True)
    address = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, default="Other", index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    __table_args__ = (
        CheckConstraint("category IN ('Witness', 'Reporting Party', 'Subject', 'Other')", name="check_person_category"),
    )

    # Relationships
    cases = relationship("Case", secondary=case_people, back_populates="people")
    organizations = relationship("Organization", secondary=person_organizations, back_populates="people")
    vehicles = relationship("Vehicle", secondary=person_vehicles, back_populates="people")
    devices = relationship("Device", secondary=person_devices, back_populates="people")
    evidence_items = relationship("Evidence", secondary=evidence_people, back_populates="people")


class Organization(Base):
    __tablename__ = "organizations"
    
    organization_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    organization_type = Column(String(100), nullable=False)
    address = Column(Text, nullable=True)
    contact_details = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    cases = relationship("Case", secondary=case_organizations, back_populates="organizations")
    people = relationship("Person", secondary=person_organizations, back_populates="organizations")


class Vehicle(Base):
    __tablename__ = "vehicles"
    
    vehicle_id = Column(String(50), primary_key=True, index=True)
    registration_number = Column(String(50), unique=True, nullable=False, index=True)
    make = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    color = Column(String(50), nullable=False)
    vehicle_type = Column(String(50), default="Sedan")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    cases = relationship("Case", secondary=case_vehicles, back_populates="vehicles")
    people = relationship("Person", secondary=person_vehicles, back_populates="vehicles")
    evidence_items = relationship("Evidence", secondary=evidence_vehicles, back_populates="vehicles")


class Device(Base):
    __tablename__ = "devices"
    
    device_id = Column(String(50), primary_key=True, index=True)
    device_type = Column(String(100), nullable=False, index=True)
    manufacturer = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    serial_number = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    cases = relationship("Case", secondary=case_devices, back_populates="devices")
    people = relationship("Person", secondary=person_devices, back_populates="devices")
    evidence_items = relationship("Evidence", secondary=evidence_devices, back_populates="devices")


class Location(Base):
    __tablename__ = "locations"
    
    location_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    address = Column(Text, nullable=False)
    location_type = Column(String(100), default="Commercial")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    cases = relationship("Case", secondary=case_locations, back_populates="locations")
    evidence_items = relationship("Evidence", secondary=evidence_locations, back_populates="locations")


class Evidence(Base):
    __tablename__ = "evidence"
    
    evidence_id = Column(String(50), primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    evidence_type = Column(String(100), nullable=False, index=True) # Physical, Digital, Forensic, Documentary, Audio/Video
    description = Column(Text, nullable=False)
    collection_date = Column(DateTime, default=utc_now)
    case_id = Column(String(50), ForeignKey("cases.case_id", ondelete="RESTRICT"), nullable=False, index=True)
    collected_by_officer_id = Column(String(50), ForeignKey("officers.officer_id", ondelete="SET NULL"), nullable=True)
    storage_reference = Column(String(150), nullable=False)
    status = Column(String(50), default="Logged in Secure Storage", index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    case = relationship("Case", back_populates="evidence_items")
    collected_by_officer = relationship("Officer", back_populates="collected_evidence")
    custody_history = relationship("EvidenceCustody", back_populates="evidence", cascade="all, delete-orphan", order_by="desc(EvidenceCustody.event_timestamp)")
    people = relationship("Person", secondary=evidence_people, back_populates="evidence_items")
    vehicles = relationship("Vehicle", secondary=evidence_vehicles, back_populates="evidence_items")
    devices = relationship("Device", secondary=evidence_devices, back_populates="evidence_items")
    locations = relationship("Location", secondary=evidence_locations, back_populates="evidence_items")


class EvidenceCustody(Base):
    __tablename__ = "evidence_custody"
    
    custody_event_id = Column(Integer, primary_key=True, autoincrement=True)
    evidence_id = Column(String(50), ForeignKey("evidence.evidence_id", ondelete="CASCADE"), nullable=False, index=True)
    officer_id = Column(String(50), ForeignKey("officers.officer_id", ondelete="RESTRICT"), nullable=False)
    event_type = Column(String(100), nullable=False) # Collected, Transferred, Checked Out for Analysis, Returned to Secure Storage, Submitted to Lab, Court Presentation
    event_timestamp = Column(DateTime, default=utc_now, index=True)
    notes = Column(Text, nullable=True)

    # Relationships
    evidence = relationship("Evidence", back_populates="custody_history")
    officer = relationship("Officer", back_populates="custody_events")


class CaseActivity(Base):
    __tablename__ = "case_activity"
    
    activity_id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(String(50), ForeignKey("cases.case_id", ondelete="CASCADE"), nullable=False, index=True)
    officer_id = Column(String(50), ForeignKey("officers.officer_id", ondelete="SET NULL"), nullable=True)
    activity_type = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    activity_timestamp = Column(DateTime, default=utc_now, index=True)

    # Relationships
    case = relationship("Case", back_populates="activities")
    officer = relationship("Officer", back_populates="activities")
