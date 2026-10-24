# Academic Project Report

## Intelligence Fusion Platform
**A Centralized Multi-Source Investigation Management System Combining Normalized Relational Architecture and Polymorphic Document Storage**

---

### Course & Submission Details
- **Project Title:** Intelligence Fusion Platform
- **Project Type:** Database Management Systems (DBMS) Mini Project
- **Academic Year:** 2026
- **Institution:** PES University

### Team Members
1. **Saatvik Gupta** — SRN: `PES1UG24CS395` (Backend & Database Architecture)
2. **Satyam Goyal** — SRN: `PES1UG24CS424` (Frontend & Visual Analytics)

---

### Abstract
Modern investigative information management requires synthesizing structured relational records (suspects, vehicles, evidence chains, officers) with diverse semi-structured intelligence documents (CCTV metadata, telecommunications logs, witness depositions, chat transcripts). Traditional single-database paradigms force compromises: relational databases struggle with polymorphic, unpredictable document schemas, while pure NoSQL databases lack strict referential integrity, declarative constraints, and foreign key cascades.

This project designs and implements the **Intelligence Fusion Platform**, a dual-database architecture integrating a normalized **PostgreSQL** relational database with a **MongoDB** document store. The platform provides unified cross-database full-text search, Many-to-Many entity exploration, chronological case timelines, and automated chain-of-custody tracking.

---

### Table of Contents
1. Introduction & Problem Statement
2. Objectives & Scope
3. System Requirements (Functional & Non-Functional)
4. Relational Database Design & Normalization (1NF to BCNF)
5. NoSQL Document Storage & Flexible Schema Design
6. Polyglot Persistence & Cross-Database Search
7. System Architecture & Tech Stack
8. Implementation Details (Backend & Frontend)
9. Testing & Verification
10. Conclusion & Future Enhancements

---

### 1. Introduction & Problem Statement
Investigation agencies encounter high volumes of heterogenous data from physical seizures, electronic intercepts, and public complaints. Storing unstructured logs inside relational tables requires frequent schema migrations (`ALTER TABLE`) or denormalized text blobs. Conversely, tracking evidence custody chains and legal relationships without ACID constraints risks data loss.

The **Intelligence Fusion Platform** solves this by establishing PostgreSQL as the single source of truth for structured entity lifecycles while utilizing MongoDB as an elastic repository for raw intelligence artifacts.

---

### 2. Objectives & Scope
1. **Relational Modeling:** Design a normalized 3NF/BCNF schema with 11 primary tables and 11 Many-to-Many junction tables.
2. **NoSQL Document Integration:** Store and index 9 distinct document formats in MongoDB with arbitrary nested JSON metadata.
3. **Cross-Database Unified Search:** Execute federated queries returning categorized SQL entities and NoSQL documents.
4. **Chronological Timelines:** Consolidate alleged incident dates, SQL case activities, evidence custody handoffs, and MongoDB document creation/ingestion timestamps.
5. **Relationship Exploration:** Render visual interactive entity networks traversing relational bridge tables.
6. **Academic Integrity:** All data is strictly synthetic and demonstration-based.

---

### 3. Database Schema Summary

#### Relational Entities (PostgreSQL / SQLite Fallback)
- **`officers`**: PK `officer_id`. Hashed passwords, badge numbers, department.
- **`cases`**: PK `case_id`. Status and priority check constraints.
- **`people`**: PK `person_id`. Category: Subject, Witness, Reporting Party, Other.
- **`organizations`**: PK `organization_id`. Corporate and workshop entities.
- **`vehicles`**: PK `vehicle_id`. Unique registration numbers.
- **`devices`**: PK `device_id`. Unique hardware serial numbers.
- **`locations`**: PK `location_id`. Latitude, longitude, descriptive locations.
- **`evidence`**: PK `evidence_id`. Belongs to a case.
- **`evidence_custody`**: PK `custody_event_id`. Sequential audit history.
- **`case_activity`**: PK `activity_id`. Case milestones and notes.
- **11 Junction Tables**: `case_people`, `case_organizations`, `case_vehicles`, `case_devices`, `case_locations`, `person_organizations`, `person_vehicles`, `person_devices`, `evidence_people`, `evidence_vehicles`, `evidence_devices`, `evidence_locations`.

#### Document Collection (MongoDB)
- **`investigation_documents`**: Collection in database `intelligence_fusion`.
- Contains `document_type`, `title`, `content`, `summary`, `source_type`, `source_name`, `case_id`, `tags`, and flexible `metadata` dict.

---

### 4. Conclusion & Key Learnings
This project successfully demonstrated that:
1. Normalized relational schemas with composite junction tables provide robust referential integrity for investigative entities.
2. Combining PostgreSQL with MongoDB eliminates impedance mismatch for semi-structured documents.
3. Federated search across both stores can be achieved cleanly with sub-second response times.
