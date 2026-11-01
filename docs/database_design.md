# Database Design & Architecture Document

**Project Title:** Intelligence Fusion Platform  
**Project Type:** DBMS Mini Project (UE24CS395)  
**Team Members:**  
- **Saatvik Gupta** — PES1UG24CS395  
- **Satyam Goyal** — PES1UG24CS424  

---

## 1. System Overview

The **Intelligence Fusion Platform** combines a normalized relational database (PostgreSQL with SQLite fallback) with a polymorphic document database (MongoDB) to manage multi-agency investigation intelligence.

- **PostgreSQL / SQLite (Relational Store):** Serves as the strict system of record for structured entities, foreign key referential integrity, Many-to-Many bridge tables, and chronological audit logs across 22 normalized tables.
- **MongoDB (Document Store):** Stores heterogenous, semi-structured, and polymorphic investigation documents (witness statements, CCTV telemetry, chat dumps, sensor logs) that require schema flexibility and rapid full-text search.

---

## 2. Relational Schema & Tables (22 Tables)

### Primary Entity Tables (10 Tables)
1. **`officers`**: Primary key `officer_id`. Stores credentials (`hashed_password`), badge identifier (`badge_number`), department, and role (`ADMIN`, `INVESTIGATOR`).
2. **`cases`**: Primary key `case_id` (`CASE-YYYY-XXX`). Foreign key `lead_officer_id` references `officers.officer_id`. Check constraints enforce valid statuses (`Open`, `Under Investigation`, `On Hold`, `Closed`) and priorities (`Low`, `Medium`, `High`, `Critical`).
3. **`people`**: Primary key `person_id`. Stores demographic and category attributes (`Witness`, `Reporting Party`, `Subject`, `Other`).
4. **`organizations`**: Primary key `organization_id`. Stores commercial, governmental, and corporate entities.
5. **`vehicles`**: Primary key `vehicle_id`. Unique constraint on `registration_number`.
6. **`devices`**: Primary key `device_id`. Unique constraint on `serial_number`.
7. **`locations`**: Primary key `location_id`. Stores latitude, longitude, and physical addresses.
8. **`evidence`**: Primary key `evidence_id`. Foreign key `case_id` references `cases.case_id` (ON DELETE RESTRICT).
9. **`evidence_custody`**: Primary key `custody_event_id` (autoincrement). Foreign keys reference `evidence.evidence_id` (CASCADE) and `officers.officer_id` (RESTRICT).
10. **`case_activity`**: Primary key `activity_id` (autoincrement). Logs chronological timeline events.

### Many-to-Many Junction Tables (12 Bridge Tables)
- `case_people` (case_id, person_id, role_in_case, notes, added_at)
- `case_organizations` (case_id, organization_id, association_type, notes, added_at)
- `case_vehicles` (case_id, vehicle_id, role_in_case, notes, added_at)
- `case_devices` (case_id, device_id, role_in_case, notes, added_at)
- `case_locations` (case_id, location_id, association_type, notes, added_at)
- `person_organizations` (person_id, organization_id, role, added_at)
- `person_vehicles` (person_id, vehicle_id, relationship_type, added_at)
- `person_devices` (person_id, device_id, relationship_type, added_at)
- `evidence_people` (evidence_id, person_id, association_type, added_at)
- `evidence_vehicles` (evidence_id, vehicle_id, association_type, added_at)
- `evidence_devices` (evidence_id, device_id, association_type, added_at)
- `evidence_locations` (evidence_id, location_id, association_type, added_at)
