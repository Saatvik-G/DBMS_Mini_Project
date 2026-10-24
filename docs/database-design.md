# Intelligence Fusion Platform — Database Design & Normalization Specification

**Course:** Database Management Systems Mini Project (UE24CS395/DBMS)  
**Project Title:** Intelligence Fusion Platform  
**Authors:** Saatvik Gupta (`PES1UG24CS395`) & Satyam Goyal (`PES1UG24CS424`)  
**Architecture:** Polyglot Relational (PostgreSQL) + Document (MongoDB)  

---

## 1. Relational Database Design & Schema Architecture

The relational schema implements a fully normalized structure across 22 tables (11 primary entities and 11 many-to-many junction tables) designed for high referential integrity and performance under PostgreSQL 14+/15+.

### 1.1 Primary Entity Tables
1. **`users`**: System credentials, hashed passwords, roles (`ADMIN`, `INVESTIGATOR`, `ANALYST`, `AUDITOR`), and activation flags.
2. **`officers`**: Law enforcement personnel, badge identifiers, department unit, clearance ratings, and 1:1 user account links.
3. **`cases`**: Master investigation incidents, unique case numbers (`CAS-YYYY-CAT-XXX`), urgency priorities, sensitivity classifications, and lead officer assignment.
4. **`people`**: Subjects of interest, witnesses, victims, informants, biometrics, national IDs, and risk levels (`LOW`, `MEDIUM`, `HIGH`, `EXTREME`).
5. **`organizations`**: Corporations, criminal syndicates, front companies, and shell operations.
6. **`vehicles`**: Physical transport assets with VINs, license plates, and ownership foreign keys.
7. **`devices`**: Electronic devices (smartphones, laptops, servers, hardware wallets) with IMEIs and serial numbers.
8. **`locations`**: Physical crime scenes, safe houses, and GPS latitude/longitude coordinates.
9. **`evidence`**: Seized physical and digital exhibits with unique tracking codes and chain-of-custody hashes.
10. **`evidence_custody`**: Immutable temporal audit log recording sequential evidence relocations and officer transfers.
11. **`case_activity`**: Database-level trigger log recording status/priority shifts.

### 1.2 Junction Tables (M:N Bridge Tables)
All many-to-many relationships are normalized into dedicated associative tables:
- `case_people` (case_id, person_id) -> `role`
- `case_organizations` (case_id, organization_id) -> `relationship_type`
- `case_vehicles` (case_id, vehicle_id) -> `involvement_type`
- `case_devices` (case_id, device_id) -> `status_in_case`
- `case_locations` (case_id, location_id) -> `association_type`
- `case_officers` (case_id, officer_id) -> `role`
- `person_organizations` (person_id, organization_id) -> `role`, `is_key_official`
- `person_vehicles` (person_id, vehicle_id) -> `relationship`
- `person_devices` (person_id, device_id) -> `relationship`
- `evidence_people` (evidence_id, person_id) -> `association`
- `evidence_vehicles` (evidence_id, vehicle_id) -> `association`
- `evidence_devices` (evidence_id, device_id) -> `association`
- `evidence_locations` (evidence_id, location_id) -> `association`

---

## 2. Normalization Analysis & Proofs

### 2.1 First Normal Form (1NF)
- **Requirement:** Every column must hold atomic values, and there must be no repeating groups or multivalued arrays.
- **Verification:** 
  - In `people`, telephone numbers and addresses are stored as atomic fields; multiple phone numbers or devices are handled via the `person_devices` junction table rather than comma-separated lists.
  - In `cases`, associated suspects or officers are not stored as delimited strings or JSON arrays; they are resolved via 1NF bridge tables.

### 2.2 Second Normal Form (2NF)
- **Requirement:** Must be in 1NF, and all non-key attributes must be fully functionally dependent on the entire primary key (no partial key dependencies).
- **Verification:**
  - In composite key junction tables like `case_people (case_id, person_id)`, the attribute `role` describes the person's specific function *in that specific case*. It cannot be determined by `case_id` alone, nor by `person_id` alone:
    $$\{ \text{case\_id}, \text{person\_id} \} \to \text{role}$$
  - No partial functional dependency exists in any table.

### 2.3 Third Normal Form (3NF)
- **Requirement:** Must be in 2NF, and no non-prime attribute may depend transitively on a candidate key ($X \to Y \to Z$ where $Z$ is non-prime).
- **Verification:**
  - In `cases`, only `lead_officer_id` is stored. The lead officer's full name, rank, badge number, and department are kept strictly in `officers`. Storing officer rank inside `cases` would create a transitive dependency:
    $$\text{case\_id} \to \text{lead\_officer\_id} \to \text{rank}$$
    By storing `rank` solely in `officers`, 3NF is strictly preserved, eliminating update and deletion anomalies.

### 2.4 Boyce-Codd Normal Form (BCNF)
- **Requirement:** For every non-trivial functional dependency $X \to Y$, $X$ must be a superkey.
- **Verification:**
  - In all 22 relational tables, determinants are strictly primary keys or unique constraint candidates (`case_number`, `badge_number`, `license_plate`, `imei`, `tracking_number`). Hence, the entire relational schema satisfies BCNF.

---

## 3. Data Integrity & Constraints

1. **Entity Integrity:** Primary keys (`SERIAL PRIMARY KEY` or unique identifiers) exist on every table, strictly disallowing nulls.
2. **Referential Integrity:** Foreign keys are explicitly defined with:
   - `ON DELETE CASCADE` on associative junction tables.
   - `ON DELETE RESTRICT` on evidence custody records to prevent destroying court-admissible audit trails.
   - `ON DELETE SET NULL` on optional lead officer assignments.
3. **Domain Integrity & CHECK Constraints:**
   - `cases.status IN ('OPEN', 'UNDER_INVESTIGATION', 'PENDING_CHARGES', 'CLOSED', 'COLD_CASE')`
   - `cases.priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`
   - `cases.classification IN ('UNCLASSIFIED', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET')`
   - `locations.latitude BETWEEN -90.0 AND 90.0`
   - `locations.longitude BETWEEN -180.0 AND 180.0`
4. **Unique Natural Keys:** Unique constraints prevent duplicate registrations on `badge_number`, `case_number`, `national_id`, `license_plate`, `vin`, and `tracking_number`.

---

## 4. Indexing Strategy

To guarantee sub-millisecond query execution on analytical queries and dashboard aggregations, the following indexes are deployed:
- **Foreign Key B-Tree Indexes:** `idx_cases_lead_officer`, `idx_evidence_case`, `idx_custody_evidence`.
- **Compound Composite Indexes:**
  - `idx_cases_status_priority` on `cases(status, priority)`: Powers the filtered triage dashboard.
  - `idx_case_activity_case_ts` on `case_activity(case_id, timestamp DESC)`: Powers real-time chronological case timeline rendering.
- **Search Indexes:** B-tree indexes on `(last_name, first_name)` in `people`, and `license_plate` in `vehicles`.
