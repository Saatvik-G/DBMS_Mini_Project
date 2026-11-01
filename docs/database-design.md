# Intelligence Fusion Platform — Database Design & Normalization Specification

**Course:** Database Management Systems Mini Project (UE24CS395/DBMS)  
**Project Title:** Intelligence Fusion Platform  
**Authors:** Saatvik Gupta (`PES1UG24CS395`) & Satyam Goyal (`PES1UG24CS424`)  
**Architecture:** Polyglot Relational (PostgreSQL / SQLite fallback) + Document (MongoDB)  

---

## 1. Relational Database Design & Schema Architecture

The relational schema implements a fully normalized 3NF/BCNF architecture across **22 tables (10 primary entity and audit tables + 12 many-to-many junction tables)** designed for high referential integrity and performance under PostgreSQL 14+/15+ and SQLite 3.

### 1.1 Primary Entity Tables (10 Tables)
1. **`officers`**: Primary key `officer_id` (VARCHAR). Law enforcement personnel, badge identifiers (`badge_number` UNIQUE), department unit, clearance ratings, role (`ADMIN`, `INVESTIGATOR`), and cryptographic PBKDF2 password hashes.
2. **`cases`**: Primary key `case_id` (VARCHAR, e.g. `CASE-2026-001`). Master investigation incidents, urgency priorities (`Low`, `Medium`, `High`, `Critical`), statuses (`Open`, `Under Investigation`, `On Hold`, `Closed`), and lead officer assignment.
3. **`people`**: Primary key `person_id` (VARCHAR, e.g. `PER-001`). Subjects of interest, witnesses, victims, informants, contact details, addresses, and categories.
4. **`organizations`**: Primary key `organization_id` (VARCHAR, e.g. `ORG-001`). Corporations, criminal syndicates, front companies, and shell entities.
5. **`vehicles`**: Primary key `vehicle_id` (VARCHAR, e.g. `VEH-001`). Physical transport assets with unique registration numbers (`registration_number` UNIQUE), make, model, color, and type.
6. **`devices`**: Primary key `device_id` (VARCHAR, e.g. `DEV-001`). Electronic hardware exhibits (smartphones, laptops, servers, crypto storage) with unique serial numbers (`serial_number` UNIQUE).
7. **`locations`**: Primary key `location_id` (VARCHAR, e.g. `LOC-001`). Physical crime scenes, meeting sites, and GPS latitude/longitude coordinates.
8. **`evidence`**: Primary key `evidence_id` (VARCHAR, e.g. `EVD-001`). Seized physical and digital exhibits linked to cases with legal reference storage tags and status.
9. **`evidence_custody`**: Primary key `custody_event_id` (INT AUTO). Immutable temporal audit log recording sequential evidence relocations and handling officer transfers.
10. **`case_activity`**: Primary key `activity_id` (INT AUTO). Database-level timeline log recording chronological status and investigative updates.

### 1.2 Junction Tables (12 Bridge Tables)
All many-to-many relationships are normalized into dedicated associative tables:
- `case_people` `(case_id, person_id)` -> `role_in_case`, `notes`, `added_at`
- `case_organizations` `(case_id, organization_id)` -> `association_type`, `notes`, `added_at`
- `case_vehicles` `(case_id, vehicle_id)` -> `role_in_case`, `notes`, `added_at`
- `case_devices` `(case_id, device_id)` -> `role_in_case`, `notes`, `added_at`
- `case_locations` `(case_id, location_id)` -> `association_type`, `notes`, `added_at`
- `person_organizations` `(person_id, organization_id)` -> `role`, `added_at`
- `person_vehicles` `(person_id, vehicle_id)` -> `relationship_type`, `added_at`
- `person_devices` `(person_id, device_id)` -> `relationship_type`, `added_at`
- `evidence_people` `(evidence_id, person_id)` -> `association_type`, `added_at`
- `evidence_vehicles` `(evidence_id, vehicle_id)` -> `association_type`, `added_at`
- `evidence_devices` `(evidence_id, device_id)` -> `association_type`, `added_at`
- `evidence_locations` `(evidence_id, location_id)` -> `association_type`, `added_at`

---

## 2. Normalization Analysis & Proofs

### 2.1 First Normal Form (1NF)
- **Requirement:** Every column must hold atomic values, and there must be no repeating groups or multivalued arrays.
- **Verification:** 
  - In `people`, telephone numbers and addresses are stored as atomic fields; multiple phone numbers or devices are handled via the `person_devices` junction table rather than comma-separated lists.
  - In `cases`, multiple suspects, organizations, and evidence exhibits are mapped through dedicated associative bridge tables rather than array columns.

### 2.2 Second Normal Form (2NF)
- **Requirement:** Must satisfy 1NF, and all non-key attributes must be fully functionally dependent on the entire candidate key (no partial key dependencies).
- **Verification:**
  - In composite key junction tables like `case_people(case_id, person_id)`, descriptive attributes such as `role_in_case` and `added_at` describe the specific pairing and cannot be determined by `case_id` or `person_id` alone.

### 2.3 Third Normal Form (3NF) & Boyce-Codd Normal Form (BCNF)
- **Requirement:** Must satisfy 2NF, and no non-prime attribute may transitively depend on a candidate key ($X \to Y \to Z$ is eliminated).
- **Verification:**
  - Case officers are not stored redundantly in `cases`; only `lead_officer_id` references `officers.officer_id`. An officer's department, contact email, and badge are stored strictly in `officers`.
  - For every functional dependency $X \to Y$, $X$ is a superkey (BCNF).
