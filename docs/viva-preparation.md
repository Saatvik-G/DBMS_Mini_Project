# Intelligence Fusion Platform — Viva & Defense Preparation Guide

**Course:** Database Management Systems Mini Project (UE24CS395/DBMS)  
**Authors:** Saatvik Gupta (`PES1UG24CS395`) & Satyam Goyal (`PES1UG24CS424`)  
**Project:** Intelligence Fusion Platform (Polyglot Law Enforcement Investigation System)  
**Evaluation Rubric:** 14 Components | 50 Marks

---

## 1. Five-Minute Live Examiner Walkthrough Script

When presenting to the viva panel or evaluation committee, follow this exact sequence:

### Step 1: Architectural Rationale & Dual-Engine Overview (1 Minute)
> *"Good morning professors. Our DBMS project is the **Intelligence Fusion Platform**, developed by Saatvik Gupta and Satyam Goyal. In real-world law enforcement, investigations handle two distinct classes of data:
> 1. Strict relational entities with court-admissible chain of custody requiring full ACID guarantees.
> 2. Heterogeneous unstructured intelligence (CCTV logs, phone extractions, witness statements) arriving with dynamic schemas.
> To address this without compromise, we engineered a **Polyglot Persistence Architecture** using PostgreSQL for normalized relational entities and MongoDB for unstructured document telemetry, united via FastAPI and Next.js 15."*

### Step 2: Relational Schema, Normalization & Constraints (1 Minute)
> *"Our relational schema consists of 22 tables—10 primary entity/audit tables and 12 associative junction tables—engineered to satisfy **3NF and BCNF**.
> - Every Many-to-Many relationship (e.g. `case_people`, `evidence_devices`, `person_vehicles`) is decoupled using junction tables with composite primary keys.
> - We enforce domain integrity through CHECK constraints on case status, priority, and clearance levels, with strict foreign key cascade rules (`ON DELETE CASCADE` for associations, `ON DELETE RESTRICT` for evidence custody handoffs).
> - Our indexing strategy includes B-tree indexes on foreign keys and compound indexes on `(status, priority)` to eliminate full table scans during filtering."*

### Step 3: Advanced Procedural SQL, Triggers & Recursive CTEs (1 Minute)
> *"Beyond standard CRUD, we implemented advanced database logic:
> 1. **Stored Procedure (`sp_create_investigation_case`):** Encapsulates atomic case initialization, officer taskforce allocation, and initial audit trail in a single transaction block.
> 2. **SQL Function (`fn_get_case_summary`):** Computes aggregate metrics and outputs structured JSON dossiers.
> 3. **Database Audit Trigger (`trg_case_activity_audit`):** An AFTER UPDATE row-level trigger that intercepts status and priority transitions on cases, immutably appending before-and-after values into `case_activity`.
> 4. **Recursive Common Table Expression (CTE):** Traverses the criminal association graph to discover indirect associates across shared case files up to multiple degrees of separation."*

### Step 4: NoSQL Document Storage, Full-Text & Vector Search (1 Minute)
> *"On the MongoDB side, our `investigation_documents` collection stores 9 categories of polymorphic intelligence.
> - Each document maintains a relational link via `case_id` and polymorphic entity references (`entity_type`, `entity_id`).
> - We created an inverted full-text search index with weighted relevance scoring (`title: 10, tags: 5, content: 1`).
> - We designed Atlas Vector Search support for semantic similarity matching, complete with a resilient cosine-similarity fallback for offline environments."*

### Step 5: System Walkthrough & Live Demonstration (1 Minute)
> *"In our live interface—designed with a dark graphite palette, dense tables, and 1-pixel borders for authentic operational case management—we demonstrate:
> 1. The unified search bar executing federated queries across PostgreSQL and MongoDB simultaneously.
> 2. Case dossiers with linked entities, evidence chain of custody, and chronological audit timelines.
> 3. The relationship graph visualizer rendering multi-entity connections.
> 4. The DBMS Concepts Sandbox executing predefined analytical queries (3-way joins, recursive CTEs, window rankings, triggers) directly against the live database."*

---

## 2. Core Viva Questions & In-Depth Technical Answers

### Q1: Why polyglot persistence? Why not use PostgreSQL for everything or MongoDB for everything?
**Answer:**
1. **Relational Core (PostgreSQL / SQLite):**
   - Core investigative workflows demand strict **ACID transactions**, referential integrity (`FOREIGN KEY`), and non-repudiation.
   - Chain of custody handoffs (`evidence_custody`) and case status changes require atomic multi-table updates.
   - Relational schemas enforce strict domain constraints (`CHECK`, `UNIQUE`, composite primary keys) that prevent corrupt associations (e.g. duplicate suspect links).
2. **Document Store (MongoDB):**
   - Forensic intelligence artifacts arrive from heterogeneous sources: ANPR camera feeds, cell tower dumps, digital forensics JSON, CCTV logs, and audio transcripts.
   - Forcing these into relational tables would require continuous schema migrations (`ALTER TABLE`) or denormalized text columns losing queryability.
   - MongoDB allows storing arbitrary polymorphic nested metadata (`metadata` object) while indexing on relational pointers (`case_id`, `entity_type`, `entity_id`).
   - MongoDB provides native inverted full-text search with weighted field scoring (`title: 10`, `tags: 5`, `content: 1`).
3. **Graph Traversal (via Relational Recursive CTEs):**
   - Rather than introducing a third operational database engine (like Neo4j), we leverage SQL:1999 standard **Recursive CTEs** over our existing 12 junction tables to traverse multi-hop criminal associate graphs dynamically.

### Q2: How does your schema achieve 3NF and BCNF? Point to a specific functional dependency.
**Answer:**
- **1NF (First Normal Form):** All attribute values are atomic; no repeating groups or multivalued columns (e.g. contact emails and phone numbers are scalar attributes; multiple phone numbers are decoupled into `devices`).
- **2NF (Second Normal Form):** Schema is in 1NF and contains **zero partial dependencies**. In all 12 junction tables with composite primary keys (e.g., `case_people` with `PRIMARY KEY (case_id, person_id)`), non-prime attributes like `role_in_case` and `added_at` depend on the *entire* composite key `(case_id, person_id)`, not on a subset.
- **3NF (Third Normal Form):** Schema is in 2NF and contains **zero transitive dependencies** ($X \to Y$ and $Y \to Z$).
  - *Concrete Functional Dependency Proof:*
    - In an unnormalized design: `cases (case_id, title, lead_officer_id, officer_name, officer_department)`.
    - Dependencies: $\text{case\_id} \to \text{lead\_officer\_id}$ and $\text{lead\_officer\_id} \to \text{officer\_department}$.
    - This creates a transitive dependency: $\text{case\_id} \to \text{officer\_department}$, causing update anomalies if an officer changes departments.
    - We decomposed this into `cases (case_id, ..., lead_officer_id)` and `officers (officer_id, full_name, department)`, where $\text{lead\_officer\_id}$ is a foreign key.
- **BCNF (Boyce-Codd Normal Form):** Every determinant in every functional dependency is a **superkey**. E.g., in `vehicles (vehicle_id, registration_number, vin)`, the candidate keys are `vehicle_id` and `registration_number`. The only determinants are candidate keys.

### Q3: What does the SQLite fallback lose compared to native PostgreSQL?
**Answer:**
- **What is lost / simulated:**
  1. **PL/pgSQL Procedural Routines:** SQLite lacks native stored procedures (`CREATE PROCEDURE sp_create_investigation_case`) and user-defined functions returning tables (`CREATE FUNCTION fn_get_case_summary`). In SQLite mode, these queries execute optimized multi-table aggregations simulating identical output.
  2. **Database-Level Roles & RBAC:** SQLite is an embedded file database without a client-server user management or grant/revoke model (`ifp_admin`, `ifp_investigator`). Role enforcement falls back entirely to the FastAPI server-side authorization layer.
  3. **High-Concurrency Locking:** SQLite relies on database-level locking for writes (WAL mode provides single-writer multi-reader), whereas PostgreSQL provides granular row-level locking and Multi-Version Concurrency Control (MVCC).
- **What SQLite preserves:**
  - Complete 22-table relational schema.
  - Foreign key referential integrity (via `PRAGMA foreign_keys=ON` event listener on connect).
  - Domain `CHECK` constraints on status, priority, and categories.
  - Composite primary keys on all 12 junction tables.
  - Standard SQL:1999 Window functions (`DENSE_RANK()`, `ROW_NUMBER()`) and **Recursive CTEs** (`WITH RECURSIVE`).

### Q4: How does the database trigger work (before/after, row/statement)?
**Answer:**
- **Definition:** `AFTER UPDATE OF status, priority ON cases FOR EACH ROW EXECUTE FUNCTION fn_case_activity_audit()`
- **Timing (`AFTER`):** Ensures that the case update has passed all relational constraints and validations before an audit record is committed. If the case update fails, the audit record is never written.
- **Granularity (`FOR EACH ROW`):** Operates on each modified row individually rather than once per statement, capturing the exact transition for every case affected.
- **Mechanism:**
  1. When an `UPDATE` executes, PostgreSQL provides the pseudo-records `OLD` and `NEW`.
  2. The trigger checks `IF (OLD.status IS DISTINCT FROM NEW.status) OR (OLD.priority IS DISTINCT FROM NEW.priority)`.
  3. It inserts an immutable entry into `case_activity` recording `case_id`, `activity_type = 'STATUS_CHANGE'`, before-and-after values in the description, and `CURRENT_TIMESTAMP`.

### Q5: How does the recursive CTE terminate?
**Answer:**
The recursive CTE `cte_suspect_network` traverses indirect suspect associations through shared cases:
```sql
WITH RECURSIVE associate_graph AS (
    -- Anchor Member (Depth 1): Direct co-suspects in shared cases
    SELECT cp1.person_id AS root_id, cp2.person_id AS associate_id, 1 AS depth
    FROM case_people cp1
    JOIN case_people cp2 ON cp1.case_id = cp2.case_id AND cp1.person_id != cp2.person_id
    WHERE cp1.person_id = 'PER-001'

    UNION ALL

    -- Recursive Member (Depth N+1): Indirect associates
    SELECT ag.root_id, cp_next.person_id, ag.depth + 1
    FROM associate_graph ag
    JOIN case_people cp_prev ON ag.associate_id = cp_prev.person_id
    JOIN case_people cp_next ON cp_prev.case_id = cp_next.case_id 
         AND cp_next.person_id != ag.root_id 
         AND cp_next.person_id != ag.associate_id
    WHERE ag.depth < 3  -- Hard recursion depth limit
)
SELECT DISTINCT * FROM associate_graph;
```
- **Termination Conditions:**
  1. **Depth Ceiling:** The clause `WHERE ag.depth < 3` prevents runaway recursion and guarantees termination at depth 2.
  2. **Cycle Prevention:** Checks `cp_next.person_id != ag.root_id AND cp_next.person_id != ag.associate_id` to eliminate trivial back-and-forth loops.
  3. **Relational Fixed-Point:** When the recursive member produces an empty set ($\emptyset$), the relational engine naturally terminates the iteration.

### Q6: How do JWT roles map to database-level roles (roles-and-grants.sql)?
**Answer:**
1. **Application Layer (FastAPI JWT):**
   - The `/api/auth/login` endpoint issues signed HS256 JWT tokens with claims: `{ "sub": officer_id, "role": "ADMIN" | "INVESTIGATOR" }`.
   - Endpoints verify tokens server-side via `require_admin_officer`. An investigator attempting `POST /api/officers` or `POST /api/users` receives an immediate `403 Forbidden`.
2. **Database Layer (`database/sql/roles-and-grants.sql`):**
   - `ifp_admin`: Granted `ALL PRIVILEGES ON ALL TABLES IN SCHEMA public` for user provisioning and schema administration.
   - `ifp_investigator`: Follows least privilege:
     - `SELECT` on `officers` (read-only directory).
     - `SELECT, INSERT, UPDATE` on domain entities and junction tables (`cases`, `people`, `evidence`, `vehicles`, etc.).
     - `SELECT, INSERT` on audit tables (`case_activity`, `evidence_custody`) — immutable append-only.
     - `REVOKE DELETE ON cases, evidence, evidence_custody, case_activity` to prevent evidence spoliation.
   - `ifp_auditor`: Read-only (`SELECT ON ALL TABLES`) for viva examination and external audit.
3. **Production Mapping:** In a production deployment, the application gateway selects a PostgreSQL connection pool corresponding to the officer's role, enforcing physical DB-level isolation in addition to HTTP middleware.

### Q7: Why is the DBMS Concepts Sandbox immune to SQL injection?
**Answer:**
1. **Strict Whitelist Architecture:**
   - The `/api/dbms-concepts/execute/{query_id}` endpoint accepts only a fixed string key matching the dictionary `PREDEFINED_QUERIES` (`q1_three_way_join` .. `q11_stored_procedure_logic`).
   - If an unlisted key is supplied, it immediately throws `HTTPException(status_code=404, detail="Query ID not found in predefined safe queries.")`.
2. **Zero User-Supplied SQL:**
   - The endpoint does not accept raw SQL text, query parameters, or string fragments from the client.
3. **Parameterized ORM:**
   - All standard entity endpoints use SQLAlchemy 2.0 ORM with parameterized variable binding (`?` in SQLite, `$1` in PostgreSQL), ensuring that user inputs are never concatenated directly into SQL text.

---

## 3. Supplementary Viva Technical Questions (Relational, ACID, NoSQL)

#### Q8: Why did you separate `evidence` and `evidence_custody` into two tables?
**Answer:** To preserve the chronological chain of custody required in court. If custodial transfer data were stored in the `evidence` row, each handoff would overwrite the previous officer and location, destroying auditability. By establishing a 1:N relationship with `evidence_custody`, every transfer is appended immutably with timestamp, handling officer, and storage reference.

#### Q9: What is the difference between `ON DELETE CASCADE` and `ON DELETE RESTRICT` in your schema?
**Answer:**
- `ON DELETE CASCADE`: Used on associative junction tables (e.g. `case_people`, `case_evidence`). If a case is deleted, its junction records are automatically deleted to eliminate orphaned foreign keys.
- `ON DELETE RESTRICT`: Used on `evidence_custody.officer_id`. If an officer is on record as having handled physical evidence, their officer record cannot be deleted, preventing legal gaps in custodial accountability.

#### Q10: How do composite primary keys prevent duplicate associations?
**Answer:** In junction tables like `case_people`, the primary key is `PRIMARY KEY (case_id, person_id)`. The relational engine automatically enforces uniqueness on the tuple, preventing an investigator from accidentally linking the same suspect twice with conflicting roles.

#### Q11: Explain how the ACID properties are preserved during an evidence custody transfer.
**Answer:**
- **Atomicity:** Executed inside a single transaction block. Updating `evidence.storage_reference` and inserting a new row in `evidence_custody` must both succeed; otherwise, a `ROLLBACK` reverts both.
- **Consistency:** All check constraints and foreign key relationships are validated before commit.
- **Isolation:** Read Committed isolation ensures concurrent transactions cannot view intermediate or uncommitted custody shifts.
- **Durability:** PostgreSQL Write-Ahead Logging (WAL) guarantees committed custodial transfers persist across system failures.

#### Q12: What is the difference between `RANK()`, `DENSE_RANK()`, and `ROW_NUMBER()`?
**Answer:**
- `ROW_NUMBER()` assigns strictly sequential integers (1, 2, 3, 4) regardless of ties.
- `RANK()` assigns identical ranks to tied rows but skips subsequent numbers (1, 2, 2, 4).
- `DENSE_RANK()` assigns identical ranks to tied rows without skipping numbers (1, 2, 2, 3). In our caseload analytics, `DENSE_RANK()` ranks officers without artificial gaps in the ranking.

#### Q13: How does MongoDB's `$text` index and score work?
**Answer:** MongoDB builds an inverted full-text index tokenizing, lowercasing, and stemming text fields. When executing `{ $text: { $search: "blue sedan" } }`, MongoDB calculates a relevance score based on term frequency and field weights (`title: 10, tags: 5, content: 1`). Projecting `{ score: { $meta: "textScore" } }` sorts the most relevant forensic exhibits first.

#### Q14: What is the difference between MongoDB Atlas Vector Search and relational text search?
**Answer:** Relational text search relies on lexical keyword and stem matching. Vector Search converts text into high-dimensional numerical vectors (embeddings) using neural models. It performs approximate nearest neighbor search (e.g. Cosine Similarity / HNSW), matching semantic intent even when exact keywords differ (e.g., matching "clandestine offshore wire transfer" with "laundered cryptocurrency wallet").

---

## 4. Quick Verification Commands for Demonstrators

```powershell
# 1. Run the complete automated test suite (11/11 tests passing)
.\start.ps1 -Test

# 2. Launch full platform with clean restart
.\start.ps1 -Restart

# 3. Force database re-seeding with standardized demonstration records
.\start.ps1 -Seed -Restart
```
