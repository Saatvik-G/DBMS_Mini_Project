# Intelligence Fusion Platform — Viva & Defense Preparation Guide

**Course:** Database Management Systems Mini Project (UE24CS395/DBMS)  
**Authors:** Saatvik Gupta (`PES1UG24CS395`) & Satyam Goyal (`PES1UG24CS424`)  
**Project:** Intelligence Fusion Platform (Polyglot Law Enforcement Investigation System)  

---

## 1. Five-Minute Live Examiner Walkthrough Script

When presenting to the viva panel or evaluation committee, follow this exact 5-step sequence:

### Step 1: Architectural Rationale & Dual-Engine Overview (1 Minute)
> *"Good morning professors. Our DBMS project is the **Intelligence Fusion Platform**, developed by Saatvik Gupta and Satyam Goyal. In real-world law enforcement, investigations handle two distinct classes of data:
> 1. Strict relational entities with court-admissible chain of custody requiring full ACID guarantees.
> 2. Heterogeneous unstructured intelligence (CCTV logs, phone extractions, witness statements) arriving with dynamic schemas.
> To address this without compromise, we engineered a **Polyglot Persistence Architecture** using PostgreSQL for normalized relational entities and MongoDB for unstructured document telemetry, united via FastAPI and Next.js."*

### Step 2: Relational Schema, Normalization & Constraints (1 Minute)
> *"Our relational schema consists of 22 tables—11 primary entities and 11 bridge junction tables—engineered to satisfy **3NF and BCNF**.
> - Every Many-to-Many relationship (e.g. `case_people`, `evidence_devices`, `person_vehicles`) is decoupled using junction tables with composite primary keys.
> - We enforce domain integrity through CHECK constraints on case status, priority, and clearance levels, with strict foreign key cascade rules (`ON DELETE CASCADE` for associations, `ON DELETE RESTRICT` for evidence custody handoffs).
> - Our indexing strategy includes B-tree indexes on foreign keys and compound indexes on `(status, priority)` to eliminate full table scans during filtering."*

### Step 3: Advanced Procedural SQL, Triggers & Recursive CTEs (1 Minute)
> *"Beyond standard CRUD, we implemented advanced database logic:
> 1. **Stored Procedure (`sp_create_investigation_case`):** Encapsulates atomic case initialization, officer taskforce allocation, and initial audit trail in a single transaction block.
> 2. **SQL Function (`fn_get_case_summary`):** Computes aggregate metrics and outputs structured JSON dossiers.
> 3. **Database Audit Trigger (`trg_case_activity_audit`):** Intercepts status and priority transitions on cases, immutably appending before-and-after values into `case_activity`.
> 4. **Recursive Common Table Expression (CTE):** Traverses the criminal association graph to discover indirect associates across shared case files up to multiple degrees of separation."*

### Step 4: NoSQL Document Storage, Full-Text & Vector Search (1 Minute)
> *"On the MongoDB side, our `investigation_documents` collection stores 9 categories of polymorphic intelligence.
> - Each document maintains a relational link via `case_id` and polymorphic entity references (`entity_type`, `entity_id`).
> - We created an inverted full-text search index with weighted relevance scoring (`title: 10, tags: 5, content: 1`).
> - We designed Atlas Vector Search support for semantic similarity matching, complete with a resilient cosine-similarity fallback for offline environments."*

### Step 5: Cross-Database Fusion & Live System Demo (1 Minute)
> *"In our live Next.js interface, we demonstrate:
> 1. The unified search bar executing simultaneous relational and MongoDB queries.
> 2. The interactive Relationship Graph rendering multi-entity connections.
> 3. The DBMS Sandbox running real-time Recursive CTEs and Trigger audits directly against the live database."*

---

## 2. Comprehensive Viva Questions & Model Answers (30 Questions)

### Category A: Relational Database Design & Normalization

#### Q1: What normalization level does your relational schema achieve?
**Answer:** The relational schema achieves **Third Normal Form (3NF)** and **Boyce-Codd Normal Form (BCNF)**. 
- **1NF:** All column values are atomic; no repeating groups or multivalued columns (e.g., telephone numbers and addresses are atomic, and multi-value phone arrays are separated).
- **2NF:** It is in 1NF and contains zero partial functional dependencies on candidate keys; every non-prime attribute depends on the whole primary key. In our composite junction tables like `case_people (case_id, person_id)`, descriptive attributes like `role` depend on the composite key `(case_id, person_id)`.
- **3NF:** It is in 2NF and contains zero transitive functional dependencies ($X \to Y$ and $Y \to Z$ where $Z$ is non-prime). For example, officer departments or ranks are tied directly to the officer ID, not transitively through case records.
- **BCNF:** Every determinant is a candidate key.

#### Q2: Why did you separate `evidence` and `evidence_custody` into two tables?
**Answer:** To avoid update anomalies and maintain legal non-repudiation. If custody transfer details were updated directly inside the `evidence` row, historical custody events would be overwritten, destroying the chronological chain of custody required in court. By creating a 1:N relationship with `evidence_custody`, every transfer is appended immutably with timestamp, handling officer, and verification hash.

#### Q3: What is the difference between `ON DELETE CASCADE` and `ON DELETE RESTRICT` in your schema?
**Answer:** 
- `ON DELETE CASCADE` is used for dependent junction records (e.g. `case_people`, `case_evidence`). If a case is deleted, its junction mappings are automatically purged to prevent orphaned references.
- `ON DELETE RESTRICT` is used for `evidence_custody.transferred_to_officer_id`. If an officer is registered as having received evidence in an active case, their officer record cannot be deleted from the database, preventing legal gaps in custodial accountability.

#### Q4: How do composite primary keys prevent duplicate associations?
**Answer:** In tables like `case_people`, the primary key is defined as `PRIMARY KEY (case_id, person_id)`. The relational engine automatically enforces uniqueness on the pair, guaranteeing that Person #5 cannot be linked to Case #1 twice with contradictory roles.

---

### Category B: Transactions, ACID & Advanced SQL

#### Q5: Explain how the ACID properties are preserved during an evidence transfer.
**Answer:**
- **Atomicity:** Wrapped inside a `BEGIN ... COMMIT` transaction. Both updating `evidence.status` and inserting into `evidence_custody` must succeed. If either fails, `ROLLBACK` reverts both operations.
- **Consistency:** Database integrity constraints (e.g., verifying that the destination officer exists and status belongs to the approved enum) are preserved before and after commit.
- **Isolation:** Transaction isolation (such as Read Committed) ensures concurrent transactions cannot view intermediate or uncommitted custody shifts.
- **Durability:** Once committed, transaction logs (Write-Ahead Logging / WAL in PostgreSQL) ensure changes survive power loss or system failure.

#### Q6: What is a Recursive Common Table Expression (CTE) and how did you use it?
**Answer:** A Recursive CTE is a query that references its own output table to iteratively evaluate hierarchical or graph data. It consists of an **Anchor Member** (initial query), a **UNION ALL**, and a **Recursive Member** that joins with the CTE itself until an exit condition is reached. We used it in `cte_suspect_network` to discover hidden criminal syndicates by starting with suspect #1, discovering co-suspects in shared cases, and recurring up to depth = 2.

#### Q7: What is the difference between a Stored Procedure and a Function in PostgreSQL?
**Answer:**
- A **Function** (`CREATE FUNCTION ... RETURNS ...`) returns a value or table, is called within a `SELECT` statement (e.g. `SELECT fn_get_case_summary(1)`), and cannot execute transaction control statements (`COMMIT`/`ROLLBACK`).
- A **Stored Procedure** (`CREATE PROCEDURE ...`) is invoked using `CALL sp_create_investigation_case(...)`, can accept `INOUT` parameters, and has the capability to initiate and commit independent transactions within its execution body.

#### Q8: How does your database trigger work?
**Answer:** The trigger `trg_case_activity_audit` is defined `AFTER UPDATE OF status, priority ON cases FOR EACH ROW`. When an investigator updates the status of a case from 'OPEN' to 'CLOSED', PostgreSQL automatically executes the trigger function `fn_audit_case_state_change()`. This function compares `OLD.status` with `NEW.status`, generating an audit row in `case_activity` with the timestamp and previous values without any application code intervention.

#### Q9: What is the difference between `RANK()`, `DENSE_RANK()`, and `ROW_NUMBER()`?
**Answer:**
- `ROW_NUMBER()` assigns sequential integers (1, 2, 3, 4) regardless of ties.
- `RANK()` assigns identical ranks to tied rows but skips subsequent numbers (1, 2, 2, 4).
- `DENSE_RANK()` assigns identical ranks to tied rows without skipping numbers (1, 2, 2, 3). In our analytics, `DENSE_RANK()` ranks officers by caseload without producing arbitrary gaps in the leaderboard.

---

### Category C: NoSQL, MongoDB & Polyglot Architecture

#### Q10: Why did you use MongoDB instead of storing JSON in PostgreSQL `JSONB`?
**Answer:** While PostgreSQL supports `JSONB`, MongoDB was chosen because:
1. Investigation telemetry documents (CCTV logs, phone memory dumps, email archives) are fundamentally document-oriented, varying widely in structure.
2. MongoDB provides native horizontal sharding and native inverted full-text search indexing with document scoring.
3. It demonstrates **Polyglot Persistence**, proving our capability to architect, integrate, and maintain hybrid database paradigms in a single cohesive platform.

#### Q11: How do you link MongoDB documents with PostgreSQL relational tables?
**Answer:** Through **Application-Level Polyglot References**. MongoDB documents store integer and string foreign keys (`case_id`, `entity_type`, `entity_id`). When the application needs to render a case dossier, the FastAPI service queries PostgreSQL for the core relational entity and issues an indexed MongoDB query (`{ case_id: id }`) to retrieve linked unstructured documents, merging them into a unified response object.

#### Q12: How does MongoDB's `$text` index and score work?
**Answer:** MongoDB builds an inverted text index tokenizing, lowercasing, and stemming text fields. When executing `{ $text: { $search: "crypto fraud" } }`, MongoDB computes a text relevance score based on term frequency and field weights (`title: 10, tags: 5, content: 1`). We project `{ score: { $meta: "textScore" } }` and sort descending so the most relevant forensic exhibits appear first.

#### Q13: What is the difference between MongoDB Atlas Vector Search and relational full-text search?
**Answer:** Relational full-text search (and standard MongoDB text search) relies on syntactic lexical matching (exact words and stems). Vector Search converts text into high-dimensional numerical vectors (embeddings) using neural models. It performs approximate nearest neighbor search (e.g., Cosine Similarity / HNSW), matching conceptual meaning even when the exact keywords are completely different (e.g., matching "clandestine offshore fund transfer" with "laundered cryptocurrency wallet").

---

### Category D: Security, RBAC & Deployment

#### Q14: How is Role-Based Access Control enforced at the database level?
**Answer:** We created distinct PostgreSQL roles:
- `ifp_admin`: Possesses `ALL PRIVILEGES` for user administration and schema maintenance.
- `ifp_investigator`: Follows the principle of least privilege. Granted `SELECT`, `INSERT`, `UPDATE` on cases and evidence, but `REVOKE DELETE` on cases, evidence, and audit logs to prevent evidence destruction.
- `ifp_auditor`: Granted read-only (`SELECT`) access across public schema tables.

#### Q15: What happens if PostgreSQL is unavailable in the demonstration environment?
**Answer:** The platform features resilient dual-engine failover: `backend/app/db/session.py` attempts connection to PostgreSQL. If the PostgreSQL daemon is unreachable, it automatically and gracefully initializes our SQLite relational replica (`intelligence_fusion.db`) without crashing, allowing full demonstration of all 22 relational tables and CRUD operations.
