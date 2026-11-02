# Intelligence Fusion Platform — Comprehensive Viva & Defense Study Guide

**Course:** Database Management Systems Mini Project (UE24CS395/DBMS)  
**Authors:** Saatvik Gupta (`PES1UG24CS395`) & Satyam Goyal (`PES1UG24CS424`)  
**Target Evaluation:** Official 14-Component Evaluation Matrix (50 Marks)  
**Institution:** Department of Computer Science and Engineering, PES University, Bengaluru  

---

## Fix Before Viva: Discrepancies Between Code and Legacy Documentation

Code is the single source of truth. If an examiner cross-checks the documentation against the codebase, be prepared with these exact reconciliations:

1. **Table Count (10 + 12 = 22 Tables):** Legacy notes in early drafts mentioned "11 primary entities + 11 junction bridges". The active schema in [`database/sql/schema.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/schema.sql#L15-L250) and [`backend/app/models/sql_models.py`](file:///d:/DBMS%20Mini%20Project/backend/app/models/sql_models.py#L20-L380) implements **exactly 10 core entity/audit tables** (`officers`, `cases`, `people`, `organizations`, `vehicles`, `devices`, `locations`, `evidence`, `evidence_custody`, `case_activity`) and **12 associative junction tables** (`case_people`, `case_organizations`, `case_vehicles`, `case_devices`, `case_locations`, `person_organizations`, `person_vehicles`, `person_devices`, `evidence_people`, `evidence_vehicles`, `evidence_devices`, `evidence_locations`).
2. **Submission Deliverables:** Early drafts listed an 8-PDF set. The final submission suite contains **11 separate publication-grade academic PDFs** in `docs/submission/` (`01_ER_Diagram.pdf` through `11_Project_Report.pdf`), mapping directly onto the 14 rows of the university evaluation matrix.
3. **UI Theme Palette:** Earlier documentation referred to a "dark navy" theme. The active production stylesheet in [`frontend/src/index.css`](file:///d:/DBMS%20Mini%20Project/frontend/src/index.css) and Tailwind v4 uses a neutral **dark graphite/slate palette** (`#070A0F`, `#0B0F17`, `#0E1420`) with 1-pixel borders and muted steel blue accents, avoiding decorative glassmorphism or bright gradients.
4. **Offline Fallback Engine:** Stored procedures and triggers run natively in PostgreSQL. If the viva examination machine runs offline without a live PostgreSQL daemon, the backend automatically switches to SQLite via [`backend/app/db/session.py`](file:///d:/DBMS%20Mini%20Project/backend/app/db/session.py#L40-L75), executing `PRAGMA foreign_keys=ON`.

---

## 5-Minute Live Viva Walkthrough Script (Split 50/50)

### Part 1: Saatvik Gupta (Minutes 0:00 to 2:30) — Relational Modeling, DDL, DML & Advanced SQL

* **[0:00 - 0:40] Architectural Overview & Relational Design:**  
  "Good morning professors. Our project is the Intelligence Fusion Platform, developed by Saatvik Gupta and Satyam Goyal. In law enforcement, evidentiary data demands strict ACID guarantees, non-repudiation, and referential integrity, whereas field intelligence demands polymorphic flexibility. We implemented a polyglot persistence architecture combining PostgreSQL and MongoDB. I led the relational architecture. Our schema in `database/sql/schema.sql` consists of 22 normalized tables: 10 primary entity and audit relations, and 12 associative junction tables satisfying BCNF. We enforced domain constraints using CHECK constraints on case status and priority, and referential actions with `ON DELETE CASCADE` for junction links and `ON DELETE RESTRICT` for evidence custody."
* **[0:40 - 1:20] DDL, DML & ACID Transactions:**  
  "Every table uses surrogate primary keys like `CASE-2026-001` or `EVD-001`. In `database/sql/dml-examples.sql`, we verified multi-table transactions using `BEGIN`, `SAVEPOINT`, and `ROLLBACK TO SAVEPOINT`. This ensures that if a tentative case assignment or evidence transfer fails verification, the transaction rolls back cleanly without losing prior work."
* **[1:20 - 2:30] Advanced Procedural SQL & Live Demo:**  
  "In `database/sql/advanced-concepts.sql`, we moved critical logic into the database kernel:
  1. Stored Procedure `sp_create_investigation_case`: Atomically provisions a case and inserts an initial record into `case_activity`.
  2. Database Trigger `trg_case_activity_audit`: An `AFTER UPDATE` trigger that intercepts case status and priority transitions, automatically recording before-and-after audit logs.
  3. Recursive CTE: Traverses the `case_people` bridge table to discover suspect syndicate networks across multiple degrees of separation.
  I will now demonstrate our stored procedure and trigger in the live workstation."  
  *(Saatvik clicks **Cases** &rarr; Updates a case priority from 'High' to 'Critical' &rarr; Navigates to **Audit Log** to show the trigger-generated row).*

---

### Part 2: Satyam Goyal (Minutes 2:30 to 5:00) — NoSQL, Vector Search, Dual-Tier RBAC & Integration

* **[2:30 - 3:15] NoSQL Document Model & Schema Validation:**  
  "Thank you Saatvik. I led the NoSQL document architecture, vector similarity search, and role-based access control. In `database/mongodb/collection-schema.json`, our `investigation_documents` collection stores polymorphic forensic exhibits like witness statements, CCTV telemetry, phone extractions, and chat logs. To prevent schema drift, we enforce database-level validation using MongoDB's `$jsonSchema`. Documents reference relational entities via `case_id` and an embedded array `related_entity_ids`."
* **[3:15 - 4:00] Aggregations, Inverted Index & Semantic Vector Search:**  
  "In `database/mongodb/indexes.js`, we established compound indexes on `(case_id, created_at)` and full-text indexes on title and content. In `backend/app/core/vector.py`, we developed an offline 64-dimensional semantic vector search engine. Text inputs are projected into normalized unit vectors using multi-seed feature hashing, and relevance is calculated via cosine similarity dot products, matching meaning even when terms share no exact keywords."
* **[4:00 - 4:40] Dual-Tier RBAC (Application + Database Kernel):**  
  "Our security operates on two tiers:
  1. Application Layer: FastAPI decodes signed HS256 JWT tokens with role claims, enforcing `@require_role` dependencies.
  2. Database Layer: In `database/sql/roles-and-grants.sql`, we defined PostgreSQL roles `ifp_admin`, `ifp_investigator`, and `ifp_auditor`. Even if the application layer were bypassed, `ifp_investigator` has explicit `REVOKE DELETE`, causing direct deletion attempts to fail at the database kernel level with SQL error 42501."
* **[4:40 - 5:00] Live Demonstration & Handoff:**  
  "I will now demonstrate access denial and vector retrieval."  
  *(Satyam logs in as Investigator &rarr; attempts officer provisioning &rarr; shows 403 Forbidden; runs semantic search for 'stolen luxury vehicle' &rarr; shows CCTV and valet witness matches with similarity percentages).*

---

## Which Teammate Leads Which Topic

| Evaluation Matrix Row | Lead Presenter | Core Focus for Lead | What the Other Teammate Must Know |
|:---|:---:|:---|:---|
| **Row 1: ER Diagram** | Saatvik | Strong vs weak entities, cardinalities, M:N junction transformations | Must explain why weak entities depend on parents. |
| **Row 2: Relational Schema** | Saatvik | BCNF normalization proofs, functional dependencies, 22-table schema | Must know composite primary keys on junction tables. |
| **Row 3: SQL DDL** | Saatvik | `schema.sql`, table definitions, constraint violation tests | Must know how SQLite fallback enforces foreign keys (`PRAGMA foreign_keys=ON`). |
| **Row 4: NoSQL/Vector Creation** | Satyam | MongoDB collection schema, `$jsonSchema` validator, 64-dim vector design | Must know how polyglot links connect MongoDB docs to SQL `case_id`. |
| **Row 5: Tech Justification** | Satyam | RDBMS ACID vs NoSQL polymorphism, CAP theorem position | Must know why we did not use MongoDB for evidence chain-of-custody. |
| **Row 6: DML Operations** | Saatvik | Multi-table INSERT/UPDATE/DELETE, SAVEPOINT and rollback transaction | Must know difference between `ON DELETE CASCADE` and `RESTRICT`. |
| **Row 7: Complex Queries** | Saatvik | 6-table JOIN, correlated vs uncorrelated subqueries, recursive CTE | Must know how recursive CTE terminates (`depth < 2`). |
| **Row 8: Advanced SQL** | Saatvik | Stored procedure, user function, `trg_case_activity_audit` trigger | Must explain difference between stored procedure and function. |
| **Row 9: NoSQL RUD & Vector** | Satyam | MongoDB operators (`$set`, `$push`), aggregation pipelines, cosine similarity | Must explain how dot product calculates cosine similarity on unit vectors. |
| **Row 10: Next.js Interface** | Satyam | SPA structure, dark graphite palette, `@xyflow/react` graph | Must know how frontend handles 401/403 API responses. |
| **Row 11: Backend/API Integration** | Saatvik | FastAPI async endpoints, Pydantic schemas, search fan-out | Must know how `asyncio.gather` parallelizes SQL and Mongo queries. |
| **Row 12: Authentication & RBAC** | Satyam | PBKDF2 hashing, JWT signing, PostgreSQL `GRANT` / `REVOKE` roles | Must know how investigator deletion triggers SQL 42501 permission denied. |
| **Row 13: Documentation & Git** | Satyam | Git branch history, PDF deliverables, reproduction scripts | Must know how `start.ps1` automates multi-tier startup. |
| **Row 14: Originality & Viva** | Both | 5 major extensions: vector engine, dual-tier RBAC, polyglot search | Must articulate individual contributions clearly. |

---

## Detailed Component-by-Component Defense Guide (Rows 1 to 14)

---

### Row 1: ER Diagram (2 Marks)

#### 1. What the examiner will check
The examiner will inspect [`docs/diagrams/chen_overview.png`](file:///d:/DBMS%20Mini%20Project/docs/diagrams/chen_overview.png) and [`docs/diagrams/crowsfoot_full_schema.png`](file:///d:/DBMS%20Mini%20Project/docs/diagrams/crowsfoot_full_schema.png), looking for proper Chen symbols (rectangles, double rectangles, diamonds, double diamonds, attribute ovals) and checking whether all 22 tables are accounted for.

#### 2. What to say in 30 seconds
"We designed a conceptual ER model using formal Chen notation and mapped it to a Crow's-Foot physical schema. We have 10 entity relations—8 strong entities and 2 weak entities, `case_activity` and `evidence_custody`—which have total participation in identifying relationships because audit records cannot exist without their parent case or evidence item. All 12 many-to-many relationships are modeled as relationship diamonds with their own associative attributes."

#### 3. 8-10 Likely Viva Questions & Project-Specific Answers

* **Q1: Why do you have 22 tables? Can you account for them?**  
  *Answer:* Yes. We have 10 primary entity/audit relations: 8 strong entities (`officers`, `cases`, `people`, `organizations`, `vehicles`, `devices`, `locations`, `evidence`) and 2 weak audit entities (`case_activity`, `evidence_custody`). The remaining 12 tables are associative junction relations decoupling many-to-many relationships: 5 connecting cases to entities (`case_people`, `case_organizations`, `case_vehicles`, `case_devices`, `case_locations`), 3 connecting people to other entities (`person_organizations`, `person_vehicles`, `person_devices`), and 4 connecting evidence to physical entities (`evidence_people`, `evidence_vehicles`, `evidence_devices`, `evidence_locations`).
* **Q2: What is the difference between a strong and a weak entity in your schema?**  
  *Answer:* A strong entity has an independent existence with its own primary key (e.g. `cases` with `case_id`, `evidence` with `evidence_id`). A weak entity cannot exist without its parent owner entity and borrows the owner's identity. In our schema, `evidence_custody` is a weak entity: it represents a custody transfer event that has no meaning or legal existence without the parent `evidence_id`.
* **Q3: How is weak entity identifying relationship represented in Chen notation versus relational tables?**  
  *Answer:* In Chen notation, the weak entity is drawn with a double rectangle, its identifying relationship is drawn with a double diamond, and the line connecting the weak entity to the identifying relationship is a double line signifying total participation. In relational tables, it is implemented with a foreign key column that has a `NOT NULL` constraint and an `ON DELETE CASCADE` or `RESTRICT` rule.
* **Q4: Why are many-to-many relationships not kept as multivalued attributes inside entity tables?**  
  *Answer:* Storing multivalued attributes (such as a comma-separated list of suspect IDs in a case row) violates First Normal Form (1NF), prevents indexing, makes joins impossible, and prevents storing association-specific attributes like `role_in_case` or `added_at`.
* **Q5: What are relationship attributes? Give an example from your project.**  
  *Answer:* Relationship attributes are descriptive attributes that belong to the association itself rather than either entity alone. For example, in `case_people`, the attribute `role_in_case` describes what role a person plays in that specific case (e.g., 'Principal Target', 'Witness'). A person can be a witness in Case 1 and a suspect in Case 2.
* **Q6: (Follow-up) Where do relationship attributes live in the physical schema?**  
  *Answer:* They become non-key columns inside the associative junction table (e.g., `role_in_case` and `added_at` in `case_people`).
* **Q7: What is total participation? Where does it occur in your diagram?**  
  *Answer:* Total participation means every entity in the entity set must participate in at least one relationship instance. In our schema, `evidence_custody` has total participation in `custody_chain`: a custody log row cannot exist without belonging to an evidence item. In contrast, `officers` has partial participation in `leads_case`: an officer does not necessarily have to be the lead investigator on a case.
* **Q8: Why did you split the Chen diagram into cluster diagrams?**  
  *Answer:* An ER diagram with 22 tables and over 100 attributes becomes unreadable on a single A4 page if all attribute ovals are displayed. Following standard database engineering practice, we created one system-wide overview diagram showing entities and relationship diamonds, plus four cluster diagrams showing all attributes.

#### 4. Be ready to run
Open [`docs/diagrams/chen_overview.png`](file:///d:/DBMS%20Mini%20Project/docs/diagrams/chen_overview.png) and [`docs/diagrams/crowsfoot_full_schema.png`](file:///d:/DBMS%20Mini%20Project/docs/diagrams/crowsfoot_full_schema.png) in any image viewer. Point out the double rectangles for `case_activity` and `evidence_custody`.

#### 5. Weak spots & honest answers
* **Weak spot:** Why is `case_activity` given its own surrogate primary key `activity_id` if it is a weak entity?  
  *Honest answer:* In pure academic Chen notation, a weak entity uses a partial discriminator combined with the parent's primary key as a composite key. In our relational implementation in [`database/sql/schema.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/schema.sql#L106-L115), we used a surrogate `VARCHAR(36)` `activity_id` as the physical primary key for indexing and REST API URL routing convenience (`/api/cases/{id}/activity/{activity_id}`), while maintaining the functional dependency on `case_id` via a `NOT NULL` foreign key.

---

### Row 2: Relational Schema, Keys & Constraints (3 Marks)

#### 1. What the examiner will check
The examiner will inspect [`docs/database-design.md`](file:///d:/DBMS%20Mini%20Project/docs/database-design.md) or [`docs/submission/02_Relational_Schema.pdf`](file:///d:/DBMS%20Mini%20Project/docs/submission/02_Relational_Schema.pdf), checking for formal functional dependencies (FDs), candidate keys, and normalization proofs.

#### 2. What to say in 30 seconds
"We mapped our ER model to 22 relations using the standard 4-step algorithm. Every relation is in Boyce-Codd Normal Form (BCNF). For each relation, every non-trivial functional dependency has a candidate key as its determinant. In our 12 junction tables, the composite primary key fully determines the relationship attributes, ensuring no partial dependencies exist."

#### 3. 8-10 Likely Viva Questions & Project-Specific Answers

* **Q1: Walk me through the normalization of your `cases` table.**  
  *Answer:* In [`database/sql/schema.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/schema.sql#L28-L45), `cases` has primary key `case_id`.
  - 1NF: All attributes (`title`, `status`, `priority`, `case_type`, etc.) are atomic. There are no repeating groups.
  - 2NF: The primary key consists of a single attribute (`case_id`), so partial key dependencies are mathematically impossible.
  - 3NF / BCNF: The functional dependencies are `case_id -> {title, description, case_type, status, priority, lead_officer_id, incident_date, closed_at, created_at, updated_at}`. The only determinant is `case_id`, which is a superkey. There are no transitive dependencies to non-prime attributes (we store `lead_officer_id`, not the officer's name or badge).
* **Q2: Walk me through the normalization of relation `evidence`.**  
  *Answer:* In `evidence`, the attributes are `evidence_id`, `case_id`, `title`, `evidence_type`, `barcode`, `storage_location`, `status`, `chain_of_custody_hash`, `collected_by_officer_id`.
  - Candidate Keys: `evidence_id` (Primary Key) and `barcode` (Unique constraint).
  - FDs: `evidence_id -> all attributes` and `barcode -> all attributes`.
  - Both determinants are candidate keys. We do not store `case_title` or `officer_name` in `evidence`, eliminating transitive dependencies. Thus, `evidence` satisfies BCNF.
* **Q3: Show me a composite key relation and prove it does not violate 2NF.**  
  *Answer:* In `case_people`, the primary key is the composite key `{case_id, person_id}`. The non-key attributes are `role_in_case`, `notes`, and `added_at`.
  - Dependency: `{case_id, person_id} -> {role_in_case, notes, added_at}`.
  - Neither `case_id -> role_in_case` nor `person_id -> role_in_case` holds, because a person's role depends specifically on which case they are being associated with. Because the non-key attributes depend on the *entire* composite key and not a proper subset, there are no partial dependencies, satisfying 2NF.
* **Q4: What is the difference between 3NF and BCNF?**  
  *Answer:* 3NF allows a functional dependency `X -> Y` if `X` is a superkey OR if `Y` is a prime attribute (part of a candidate key). BCNF is stricter: it requires that for every non-trivial dependency `X -> Y`, `X` MUST be a superkey, with no exceptions for prime attributes.
* **Q5: Did you deliberately denormalize anywhere in the project?**  
  *Answer:* Yes, in one specific operational scenario: in `evidence`, we maintain `storage_location` and `status` on the primary `evidence` table, even though `evidence_custody` tracks every historical transfer location. This is a deliberate 1-attribute operational denormalization to allow O(1) lookups of an exhibit's current physical vault location during active warehouse inventory queries, without requiring an aggregate subquery to find the latest custody event timestamp.
* **Q6: (Follow-up) How do you keep that denormalized field consistent?**  
  *Answer:* Through our custody transfer transaction in `backend/app/routers/evidence.py` lines 85–130: whenever a new `evidence_custody` row is inserted, the transaction updates `evidence.storage_location` and `evidence.status` within the same atomic database transaction.
* **Q7: What is a surrogate key versus a natural key? Which do you use?**  
  *Answer:* A natural key is formed by attributes that exist in the real world (e.g. National ID or Vehicle VIN). A surrogate key is an artificially generated identifier with no intrinsic business meaning (e.g. UUID or auto-incrementing ID). We use structured surrogate keys with domain prefixes like `CASE-2026-001`, `PER-001`, and `EVD-001`. Natural keys like VIN and National ID are protected by `UNIQUE` constraints but are not used as primary keys to decouple internal foreign key references from real-world data corrections.
* **Q8: What are candidate keys, primary keys, and alternate keys in your `officers` table?**  
  *Answer:* In [`database/sql/schema.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/schema.sql#L15-L25), `officers` has candidate keys: `officer_id`, `badge_number`, and `contact_email`. We chose `officer_id` as the primary key. `badge_number` and `contact_email` are alternate keys, enforced by `UNIQUE` constraints.

#### 4. Be ready to run
Open [`docs/submission/02_Relational_Schema.pdf`](file:///d:/DBMS%20Mini%20Project/docs/submission/02_Relational_Schema.pdf) and turn to Section 3 ("Normalization Analysis & Formal Proofs").

#### 5. Weak spots & honest answers
* **Weak spot:** Is the `locations` table fully BCNF if `city` could determine `state` or `postal_code`?  
  *Honest answer:* In real-world postal geography, `postal_code -> {city, state}` can be considered a transitive dependency if full address normalization is enforced. In our schema, we stored `address`, `city`, and `state` together in `locations` because Indian postal codes can span multiple sub-localities. If strictly normalized, postal codes could be factored into a separate lookup table, but for a 22-table mini project, this practical balance avoids over-fragmentation.

---

### Row 3: SQL Database Implementation (DDL with Constraints) (4 Marks)

#### 1. What the examiner will check
The examiner will ask to see [`database/sql/schema.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/schema.sql), verify the tables in a live database CLI (PostgreSQL `psql` or SQLite CLI), and ask you to demonstrate constraint violation errors.

#### 2. What to say in 30 seconds
"Our DDL script in `database/sql/schema.sql` creates all 22 tables with primary keys, foreign keys, CHECK constraints, and UNIQUE constraints. We explicitly defined referential actions: `ON DELETE CASCADE` for associative junction rows, and `ON DELETE RESTRICT` for custody transfers so historical audit records can never be orphaned. We also created 17 B-tree indexes on foreign keys and frequently filtered columns."

#### 3. 8-10 Likely Viva Questions & Project-Specific Answers

* **Q1: Show me where you enforce CHECK constraints in your DDL.**  
  *Answer:* In [`database/sql/schema.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/schema.sql#L40-L45), we enforce domain integrity on `cases.status` and `cases.priority`:
  ```sql
  CONSTRAINT chk_case_status CHECK (status IN ('Open', 'Under Investigation', 'Suspended', 'Closed')),
  CONSTRAINT chk_case_priority CHECK (priority IN ('Low', 'Medium', 'High', 'Critical'))
  ```
  We also enforce coordinates range in `locations`:
  ```sql
  CONSTRAINT chk_latitude CHECK (latitude BETWEEN -90.0 AND 90.0),
  CONSTRAINT chk_longitude CHECK (longitude BETWEEN -180.0 AND 180.0)
  ```
* **Q2: What is the difference between `ON DELETE CASCADE`, `RESTRICT`, and `SET NULL`? Where did you use each?**  
  *Answer:*
  - `CASCADE`: Deleting the parent automatically deletes all referencing child rows. Used on junction tables like `case_people` (`FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE`) so deleting a case automatically cleans up its link rows.
  - `RESTRICT`: Prevents deletion of the parent if any child row references it. Used in `evidence_custody` (`FOREIGN KEY (evidence_id) REFERENCES evidence(evidence_id) ON DELETE RESTRICT`) to protect court-admissible custody records from accidental deletion.
  - `SET NULL`: Sets the foreign key column in child rows to NULL when the parent is deleted. Used in `cases.lead_officer_id` referencing `officers`: if an officer leaves the department, existing cases remain preserved with `lead_officer_id = NULL`.
* **Q3: What error does PostgreSQL return when a foreign key constraint is violated?**  
  *Answer:* PostgreSQL throws error code `23503` (`foreign_key_violation`): `"insert or update on table '...' violates foreign key constraint '...' DETAIL: Key (...) is not present in table '...'."`
* **Q4: What error does PostgreSQL return when a CHECK constraint is violated?**  
  *Answer:* PostgreSQL throws error code `23514` (`check_violation`): `"new row for relation '...' violates check constraint '...'."`
* **Q5: Why did you create secondary indexes? Which columns did you index?**  
  *Answer:* Relational databases automatically build unique B-tree indexes for primary keys and unique constraints, but foreign key columns are *not* indexed by default in PostgreSQL or SQLite. Without indexes, joins require full table sequential scans. In `database/sql/schema.sql` lines 230–250, we indexed:
  - Foreign key columns: `idx_cases_lead_officer`, `idx_evidence_case_id`
  - High-frequency query filters: `idx_cases_status`, `idx_cases_priority`, `idx_cases_incident_date`
* **Q6: Why use B-tree indexes instead of Hash or GIN indexes for these tables?**  
  *Answer:* B-tree is the default and most versatile index structure because it supports equality queries (`status = 'Open'`), range queries (`incident_date >= '2026-01-01'`), and sorting operations (`ORDER BY priority`). Hash indexes only support exact equality (`=`) and cannot assist range scans. GIN indexes are specialized for composite array types and full-text search, which we use on the MongoDB document side.
* **Q7: How do you check if an index is actually being used by the database engine?**  
  *Answer:* By prepending `EXPLAIN` or `EXPLAIN ANALYZE` to the query. If the query planner uses the index, the plan will display `Index Scan` or `Bitmap Index Scan using idx_cases_status`, rather than `Seq Scan on cases`.
* **Q8: How does your SQLite fallback enforce foreign key constraints?**  
  *Answer:* In SQLite, foreign key constraint enforcement is disabled by default for backward compatibility. In [`backend/app/db/session.py`](file:///d:/DBMS%20Mini%20Project/backend/app/db/session.py#L55-L65), we register an event listener on the SQLAlchemy engine connection that executes `PRAGMA foreign_keys=ON` every time a SQLite connection is established.

#### 4. Be ready to run
Run the verification test suite in PowerShell:
```powershell
.\venv\Scripts\python.exe -c "import sqlite3; con = sqlite3.connect('intelligence_fusion.db'); cur = con.cursor(); cur.execute('PRAGMA table_list'); print(len(cur.fetchall()))"
```
Or show Section 4 of [`docs/submission/03_SQL_DDL_Implementation.pdf`](file:///d:/DBMS%20Mini%20Project/docs/submission/03_SQL_DDL_Implementation.pdf) showing the four real constraint error messages.

#### 5. Weak spots & honest answers
* **Weak spot:** Did you define partial indexes or expression indexes?  
  *Honest answer:* In our initial DDL, we used standard single-column and compound B-tree indexes. While PostgreSQL supports partial indexes like `CREATE INDEX idx_open_cases ON cases (created_at) WHERE status = 'Open'`, standard B-tree indexes were chosen to maintain 100% dialect parity with our SQLite fallback engine.

---

### Row 4: NoSQL / Vector Database Creation (4 Marks)

#### 1. What the examiner will check
The examiner will inspect [`database/mongodb/collection-schema.json`](file:///d:/DBMS%20Mini%20Project/database/mongodb/collection-schema.json), [`database/mongodb/indexes.js`](file:///d:/DBMS%20Mini%20Project/database/mongodb/indexes.js), and [`database/mongodb/sample-documents.json`](file:///d:/DBMS%20Mini%20Project/database/mongodb/sample-documents.json), or check MongoDB indexes in mongosh.

#### 2. What to say in 30 seconds
"We designed MongoDB 7.0 as our document store for polymorphic intelligence documents. In `database/mongodb/collection-schema.json`, we enforce structural integrity using MongoDB's `$jsonSchema` validator. We established compound indexes, multikey indexes on embedded entity reference arrays, an inverted text search index, and a 64-dimensional semantic embedding array on every document for vector similarity search."

#### 3. 8-10 Likely Viva Questions & Project-Specific Answers

* **Q1: If MongoDB is schemaless, why do you have a `collection-schema.json`?**  
  *Answer:* MongoDB collections are dynamic by default, but in an enterprise law enforcement environment, completely unconstrained writes can corrupt data. MongoDB supports `$jsonSchema` collection validators via `collMod` or `createCollection`. In [`database/mongodb/collection-schema.json`](file:///d:/DBMS%20Mini%20Project/database/mongodb/collection-schema.json#L1-L30), we define required fields (`title`, `document_type`, `content`, `created_at`) and data types, while allowing polymorphic flexibility inside the `metadata` object using `additionalProperties: true`.
* **Q2: What is a multikey index in MongoDB? Where did you use one?**  
  *Answer:* A multikey index is an index created on an array field. MongoDB indexes each separate element of the array individually. In [`database/mongodb/indexes.js`](file:///d:/DBMS%20Mini%20Project/database/mongodb/indexes.js#L18-L22), we created a multikey index on `related_entity_ids.entity_id`:
  ```javascript
  db.investigation_documents.createIndex({ "related_entity_ids.entity_id": 1 });
  ```
  This allows queries searching for documents mentioning suspect `PER-001` to locate matches in O(log N) time instead of scanning every document.
* **Q3: How do your MongoDB documents link to PostgreSQL tables?**  
  *Answer:* Through polyglot cross-database references. In `investigation_documents`, the `case_id` string field holds values like `"CASE-2026-001"`, and the `related_entity_ids` array holds objects like `{"entity_type": "person", "entity_id": "PER-001"}`. These strings correspond to the primary keys in our PostgreSQL tables.
* **Q4: (Follow-up) Can MongoDB enforce referential integrity on those SQL foreign keys?**  
  *Answer:* No. MongoDB cannot enforce foreign key constraints across database engines. In our platform, referential integrity is guaranteed by the FastAPI application service tier: before a document is created or linked, the API queries the SQL session to verify that the `case_id` exists.
* **Q5: What is an inverted full-text index in MongoDB?**  
  *Answer:* A text index tokenizes string fields into words, strips language stopwords (like 'the', 'is'), stems words to their linguistic roots (e.g., 'running' &rarr; 'run'), and builds an inverted index mapping words to document IDs. In `indexes.js`, we indexed `title`, `content`, and `tags` with custom field weights (`{ title: 10, content: 5, tags: 3 }`).
* **Q6: How are vectors represented in your MongoDB documents?**  
  *Answer:* In [`database/mongodb/sample-documents.json`](file:///d:/DBMS%20Mini%20Project/database/mongodb/sample-documents.json), each document contains an `embedding` field storing an array of 64 normalized 32-bit floating-point numbers generated from the document's text.
* **Q7: What is the difference between embedding documents and referencing documents in MongoDB?**  
  *Answer:*
  - Embedding stores sub-documents directly inside the parent document (e.g. `related_entity_ids` array and `metadata` object). This gives high read performance in a single disk fetch (1:1 or 1:few relationships).
  - Referencing stores an ID pointing to another document or table (e.g. `case_id`). Used for 1:Many or Many:Many relationships where embedding would cause unbounded document growth beyond MongoDB's 16 MB BSON document size limit.
* **Q8: What compound index did you create, and why?**  
  *Answer:* In `indexes.js`, we created `{ case_id: 1, created_at: -1 }`. In police investigations, the most common analytical query is: "Fetch all intelligence reports for Case X sorted in reverse chronological order." This compound index covers both the filter and the sort, eliminating in-memory sorting.

#### 4. Be ready to run
Open [`database/mongodb/collection-schema.json`](file:///d:/DBMS%20Mini%20Project/database/mongodb/collection-schema.json) in your editor and explain the `$jsonSchema` required properties.

#### 5. Weak spots & honest answers
* **Weak spot:** Why 64 dimensions for vectors instead of 1536 (OpenAI ada-002) or 768 (BERT)?  
  *Honest answer:* In production enterprise deployments with cloud connectivity, 768 or 1536-dimensional embeddings from models like OpenAI or sentence-transformers are common. For an academic university mini project required to run deterministically offline on evaluation laptops without paid API keys, GPU requirements, or gigabyte model downloads, 64 dimensions was chosen as an optimal balance: it accurately preserves semantic clustering across our 26 intelligence categories while running instantaneously in pure Python.

---

### Row 5: Technology Justification (1 Mark)

#### 1. What the examiner will check
The examiner will open [`docs/submission/05_Technology_Justification.pdf`](file:///d:/DBMS%20Mini%20Project/docs/submission/05_Technology_Justification.pdf) or [`docs/technology-justification.md`](file:///d:/DBMS%20Mini%20Project/docs/technology-justification.md). **Strict check:** Ensure it is at most 2 pages.

#### 2. What to say in 30 seconds
"We chose a polyglot persistence architecture because law enforcement platforms require two opposing data models: PostgreSQL provides strict ACID transactions, foreign key cascades, and kernel-level RBAC for evidence and cases; MongoDB provides dynamic BSON document storage for polymorphic forensic items like CCTV logs and chat exports without sparse tables or null-padding. FastAPI coordinates parallel retrieval, and Next.js 15 delivers a responsive forensic workstation."

#### 3. 8-10 Likely Viva Questions & Project-Specific Answers

* **Q1: Why couldn't you do this whole project in PostgreSQL using JSONB columns?**  
  *Answer:* PostgreSQL supports JSONB and GIN indexing, but using JSONB for the entire unstructured document layer would reduce PostgreSQL to an unindexed key-value document store. Storing multi-megabyte forensic logs in PostgreSQL causes table bloat and competing buffer pool pressure against high-frequency relational index lookups. Polyglot separation isolates analytical document reads from transactional relational writes.
* **Q2: Why couldn't you do this whole project in MongoDB?**  
  *Answer:* MongoDB 4.0+ supports multi-document transactions, but it lacks schema-enforced relational declarative constraints, foreign key cascade actions (`ON DELETE RESTRICT`), and fine-grained table-level role grants (`GRANT SELECT ON officers`). For court-admissible evidence, an accidental delete or broken custody link could invalidate criminal proceedings.
* **Q3: Where does your platform sit on the CAP Theorem spectrum?**  
  *Answer:* The platform is a hybrid:
  - The PostgreSQL relational tier operates as a **CP (Consistency / Partition Tolerance)** system under the ACID paradigm, prioritizing immediate serializable consistency over availability during network splits.
  - The MongoDB tier operates as a **CP/AP configurable** store (by default CP with primary-secondary replica sets, but allowing eventual consistency on distributed document reads).
* **Q4: What is the primary operational trade-off of a polyglot architecture?**  
  *Answer:* The primary trade-off is the absence of unified cross-database distributed ACID transactions. If a case is deleted in PostgreSQL, MongoDB does not have a native trigger to automatically purge linked documents. We address this at the application service tier through compensating transactions and existence validation.
* **Q5: Why FastAPI instead of Django or Flask?**  
  *Answer:* FastAPI is built on Starlette and `asyncio`, offering native asynchronous concurrency. This allows our cross-database search endpoint (`/api/search`) to dispatch asynchronous queries to PostgreSQL and MongoDB simultaneously via `asyncio.gather`, cutting response latency in half compared to synchronous frameworks like Flask. FastAPI also generates automatic OpenAPI Swagger documentation from Pydantic models.
* **Q6: Why Next.js 15 instead of a standard React Vite SPA?**  
  *Answer:* Next.js 15 provides an enterprise App Router architecture with standardized layout nesting, static optimization, and built-in production asset bundling, while allowing us to deploy client-side routing for dense forensic dashboards.
* **Q7: What is the downside of using SQLite as a fallback?**  
  *Answer:* SQLite is an embedded file-based database that does not support stored procedures (`CREATE PROCEDURE`), PL/pgSQL procedural triggers, or client-server database-level user authentication (`CREATE ROLE`). While our schema and queries run cleanly in SQLite, procedural routines are limited to live PostgreSQL instances.

#### 4. Be ready to run
Open [`docs/submission/05_Technology_Justification.pdf`](file:///d:/DBMS%20Mini%20Project/docs/submission/05_Technology_Justification.pdf) and demonstrate that it fits cleanly on exactly 2 pages.

#### 5. Weak spots & honest answers
* **Weak spot:** Did you benchmark the throughput difference between PostgreSQL and MongoDB?  
  *Honest answer:* In our mini project development environment, we benchmarked query execution times via `time.perf_counter()` inside the API layer: relational joins average 1.5 to 3.0 ms, and MongoDB document regex lookups average 2.0 to 4.5 ms. Formal high-load stress testing (e.g. 10,000 concurrent writes) was not conducted given the single-node local evaluation hardware.

---

### Row 6: DML Operations (4 Marks)

#### 1. What the examiner will check
The examiner will ask to see [`database/sql/dml-examples.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/dml-examples.sql) and will ask you to explain an ACID transaction with `COMMIT`, `ROLLBACK`, and `SAVEPOINT`.

#### 2. What to say in 30 seconds
"In `database/sql/dml-examples.sql`, we implemented multi-table INSERTs, UPDATEs, cascade DELETEs, and multi-table queries. We also demonstrated ACID transactional control: we begin a transaction, provision a cadet officer, set a SAVEPOINT, insert a tentative case, roll back to the SAVEPOINT, and commit. The officer is saved, but the tentative case is undone."

#### 3. 8-10 Likely Viva Questions & Project-Specific Answers

* **Q1: Explain what ACID stands for using your project as an example.**  
  *Answer:*
  - **Atomicity:** In our evidence custody transfer, inserting the `evidence_custody` log row and updating `evidence.storage_location` happen together. If either fails, the whole block aborts.
  - **Consistency:** If an INSERT specifies an invalid priority like `'Immediate'`, the CHECK constraint rejects the row, keeping the database in a valid state.
  - **Isolation:** If two officers simultaneously update case notes, transactions do not see uncommitted intermediate states.
  - **Durability:** Once `COMMIT` executes, records are written to PostgreSQL's Write-Ahead Log (WAL) and survive power failures.
* **Q2: Walk me through your SAVEPOINT script line by line.**  
  *Answer:* In [`database/sql/dml-examples.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/dml-examples.sql#L140-L175):
  1. `BEGIN TRANSACTION;` starts an atomic transaction.
  2. `INSERT INTO officers ... VALUES ('OFF-TEMP-01', ...);` provisions a new officer.
  3. `SAVEPOINT pre_case_provisioning;` marks a checkpoint in the transaction log.
  4. `INSERT INTO cases ... VALUES ('CASE-TEMP-01', ...);` creates a tentative case.
  5. `ROLLBACK TO SAVEPOINT pre_case_provisioning;` cancels everything done after the savepoint (the case row is undone, but the officer insert remains).
  6. `COMMIT;` permanently writes the officer row to disk.
* **Q3: What would happen if you ran `ROLLBACK;` instead of `ROLLBACK TO SAVEPOINT`?**  
  *Answer:* A plain `ROLLBACK;` would abort the *entire* transaction from `BEGIN`, undoing the officer insertion as well.
* **Q4: What transaction isolation level does PostgreSQL use by default?**  
  *Answer:* PostgreSQL defaults to **Read Committed**. Under Read Committed, a query within a transaction only sees data committed before the query began, preventing dirty reads (`READ UNCOMMITTED`).
* **Q5: What is a dirty read, non-repeatable read, and phantom read?**  
  *Answer:*
  - *Dirty Read:* Transaction A reads uncommitted modifications made by Transaction B (prevented in Read Committed).
  - *Non-Repeatable Read:* Transaction A reads a row, Transaction B updates and commits that row, and Transaction A re-reads the row to find different values (prevented in Repeatable Read).
  - *Phantom Read:* Transaction A queries a range of rows, Transaction B inserts a new row satisfying the range and commits, and Transaction A re-queries to find a "phantom" row (prevented in Serializable).
* **Q6: What would happen in a concurrent custody transfer without transactions?**  
  *Answer:* If Officer A transfers Evidence E1 to Vault 3 and Officer B simultaneously transfers Evidence E1 to Courtroom 2 without an atomic transaction lock (`SELECT ... FOR UPDATE`), a race condition could result in Officer A's custody log being written, but Officer B's location update overwriting the table—corrupting the chain of custody.
* **Q7: What is the difference between `DELETE FROM table;` and `TRUNCATE TABLE;`?**  
  *Answer:*
  - `DELETE` is a DML operation that removes rows one by one, fires `ON DELETE` triggers, logs each row deletion in the transaction log, and can be filtered with `WHERE`.
  - `TRUNCATE` is a DDL operation that deallocates entire data pages, resets identity sequences, is significantly faster on large tables, cannot have a `WHERE` clause, and does not fire individual row-level triggers.

#### 4. Be ready to run
Open Section 5 of [`docs/submission/06_DML_Operations.pdf`](file:///d:/DBMS%20Mini%20Project/docs/submission/06_DML_Operations.pdf) showing the verification output where `OFF-TEMP-01` exists but `CASE-TEMP-01` is absent.

#### 5. Weak spots & honest answers
* **Weak spot:** Did you test concurrent transactions with row locking in your script?  
  *Honest answer:* Our DML script demonstrates multi-statement transaction rollback with `SAVEPOINT` in a single-client session. While we designed our schema to support `SELECT FOR UPDATE`, multi-threaded lock-contention concurrency testing was not scripted in the submission DML file.

---

### Row 7: Complex Queries (Nested, Correlated, Recursive & JOINs) (4 Marks)

#### 1. What the examiner will check
The examiner will ask you to open [`database/sql/advanced-queries.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/advanced-queries.sql) and explain the recursive CTE or the difference between your nested and correlated subqueries.

#### 2. What to say in 30 seconds
"In `database/sql/advanced-queries.sql`, we implemented four query patterns: a 6-relation multi-table join, an uncorrelated nested subquery using `AVG` sub-aggregations, a correlated subquery that evaluates per-person case associations, and a recursive CTE that traverses our associative junction tables to discover indirect criminal associate networks up to two degrees of separation."

#### 3. 8-10 Likely Viva Questions & Project-Specific Answers

* **Q1: Explain how your 6-table JOIN query works.**  
  *Answer:* In [`database/sql/advanced-queries.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/advanced-queries.sql#L15-L35), we join `cases` with:
  1. `officers` (INNER JOIN on `lead_officer_id = officer_id`)
  2. `case_people` (INNER JOIN on `case_id`)
  3. `people` (INNER JOIN on `person_id`)
  4. `case_devices` (LEFT JOIN on `case_id`)
  5. `devices` (LEFT JOIN on `device_id`)
  6. `evidence` (LEFT JOIN on `case_id`)  
  We use `LEFT JOIN` for devices and evidence because a valid active case must have an officer and a suspect, but might not have seized devices or exhibits yet. An INNER JOIN would drop cases that lack evidence.
* **Q2: What is the difference between an uncorrelated subquery and a correlated subquery?**  
  *Answer:*
  - *Uncorrelated Subquery:* Independent of the outer query. It executes once, produces an intermediate result (scalar or set), and passes it to the outer query. In our Query 2, the subquery calculates the global average evidence count across all cases once.
  - *Correlated Subquery:* References columns from the outer query row (e.g. `WHERE cp.person_id = p.person_id`). It must re-evaluate for *every candidate row* processed by the outer query.
* **Q3: Walk me through your Recursive CTE line by line.**  
  *Answer:* In [`database/sql/advanced-queries.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/advanced-queries.sql#L125-L160):
  ```sql
  WITH RECURSIVE SuspectNetwork AS (
      -- 1. Anchor Member (Base Case, Depth 0):
      SELECT cp.person_id AS source_id, cp.person_id AS target_id, cp.case_id, 0 AS depth
      FROM case_people cp WHERE cp.person_id = 'PER-001'
      UNION
      -- 2. Recursive Member (Depth N+1):
      SELECT sn.source_id, next_cp.person_id AS target_id, next_cp.case_id, sn.depth + 1
      FROM SuspectNetwork sn
      JOIN case_people curr_cp ON sn.target_id = curr_cp.person_id
      JOIN case_people next_cp ON curr_cp.case_id = next_cp.case_id
      WHERE next_cp.person_id != sn.target_id AND sn.depth < 2
  )
  ```
  1. The anchor member finds seed suspect `PER-001` with depth 0.
  2. The recursive member joins the previous result with `case_people` to find other suspects linked to the same cases.
  3. Termination: `sn.depth < 2` halts execution at 2 degrees of separation.
* **Q4: How do you prevent infinite loops or cycles in a recursive CTE?**  
  *Answer:* Cycles occur if Person A is linked to Person B, and Person B is linked back to Person A. We prevent infinite recursion in two ways:
  1. Explicit recursion depth limit: `WHERE sn.depth < 2`.
  2. Target filter: `WHERE next_cp.person_id != sn.target_id`.
  In production PostgreSQL, one can also track visited nodes using an array (`WHERE NOT (next_cp.person_id = ANY(visited_array))`).
* **Q5: What window function did you use, and how does it differ from `GROUP BY`?**  
  *Answer:* In [`database/sql/advanced-concepts.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/advanced-concepts.sql#L190-L205), we used `DENSE_RANK() OVER (ORDER BY COUNT(c.case_id) DESC)`. Unlike `GROUP BY`, which collapses rows into a single summary row per group, window functions perform calculations across a set of table rows while preserving each individual row's distinct identity.
* **Q6: What is the difference between `RANK()` and `DENSE_RANK()`?**  
  *Answer:* If two investigators tie for rank 1:
  - `RANK()` skips subsequent ranks: 1, 1, 3.
  - `DENSE_RANK()` does not skip ranks: 1, 1, 2.

#### 4. Be ready to run
Open the app UI &rarr; navigate to **DBMS Concepts** tab &rarr; click **Run Query** on Query 5 (Recursive CTE) to demonstrate live execution.

---

### Row 8: Advanced SQL Concepts (Procedure, Function, Trigger, CTE) (6 Marks)

#### 1. What the examiner will check
The examiner will ask you to open [`database/sql/advanced-concepts.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/advanced-concepts.sql), explain the trigger function line by line, and show before-and-after table contents.

#### 2. What to say in 30 seconds
"In `database/sql/advanced-concepts.sql`, we implemented:
1. `sp_create_investigation_case`: A PL/pgSQL stored procedure that validates the lead officer and atomically provisions the case and initial audit entry.
2. `fn_get_case_summary`: A user-defined function returning a JSONB dossier summary.
3. `trg_case_activity_audit`: An AFTER UPDATE trigger on `cases` that automatically detects when `status` or `priority` changes and writes an immutable before-and-after audit log into `case_activity`."

#### 3. 8-10 Likely Viva Questions & Project-Specific Answers

* **Q1: Walk me through the trigger function `fn_audit_case_state_change()` line by line.**  
  *Answer:* In [`database/sql/advanced-concepts.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/advanced-concepts.sql#L80-L125):
  1. `IF (OLD.status IS DISTINCT FROM NEW.status) THEN`: Compares old and new status values. `IS DISTINCT FROM` safely handles NULLs without breaking.
  2. `INSERT INTO case_activity (...) VALUES (NEW.case_id, 'STATUS_CHANGE', 'Case Status Updated', CONCAT('Investigation status modified from "', OLD.status, '" to "', NEW.status, '".'), NEW.lead_officer_id, CURRENT_TIMESTAMP);`: Inserts an audit row recording what changed.
  3. `IF (OLD.priority IS DISTINCT FROM NEW.priority) THEN`: Evaluates if urgency changed.
  4. `NEW.updated_at = CURRENT_TIMESTAMP;`: Updates the timestamp on the case.
  5. `RETURN NEW;`: Passes the modified row to the database engine.
* **Q2: Why use an `AFTER UPDATE` trigger instead of a `BEFORE UPDATE` trigger?**  
  *Answer:*
  - A `BEFORE` trigger is used to validate or modify values in the row *before* it is written to the table (e.g. sanitizing input or validating bounds).
  - An `AFTER` trigger is used when writing to secondary tables (like our audit table `case_activity`). By using `AFTER UPDATE`, we guarantee that the audit entry is only written if the case update succeeds. If the case update fails or violates a constraint, the trigger does not write orphan audit logs.
* **Q3: What is the difference between a Stored Procedure and a Function in PostgreSQL?**  
  *Answer:*
  - A *Function* (`CREATE FUNCTION`) is invoked as part of an expression (e.g. `SELECT fn_get_case_summary(...)`), must return a value, and cannot manage autonomous transactions (`COMMIT` or `ROLLBACK` inside the body are forbidden).
  - A *Stored Procedure* (`CREATE PROCEDURE`, introduced in PostgreSQL 11) is invoked using the `CALL` statement (e.g. `CALL sp_create_investigation_case(...)`), does not require a return value, and can manage its own transactions with internal `COMMIT` and `ROLLBACK` statements.
* **Q4: Show me the before and after proof of your trigger.**  
  *Answer:*
  - Before: `SELECT case_id, status, priority FROM cases WHERE case_id = 'CASE-2026-001';` shows `status = 'Open'`, `priority = 'High'`.
  - Action: `UPDATE cases SET status = 'Under Investigation', priority = 'Critical' WHERE case_id = 'CASE-2026-001';`.
  - After: `SELECT * FROM case_activity WHERE case_id = 'CASE-2026-001';` shows two new rows generated automatically: one for `STATUS_CHANGE` ("Open" &rarr; "Under Investigation") and one for `PRIORITY_CHANGE` ("High" &rarr; "Critical").
* **Q5: Can triggers cause performance issues? How do you prevent them?**  
  *Answer:* Yes, triggers run synchronously within the transaction boundary. If a trigger executes slow network operations, long loops, or unindexed queries, it holds locks and degrades write throughput. We prevent this by keeping our trigger lightweight: it executes single-row direct INSERTs into `case_activity` using indexed foreign keys, with zero external calls.

#### 4. Be ready to run
Open [`docs/submission/08_Advanced_SQL_Procedure_Function_Trigger_CTE.pdf`](file:///d:/DBMS%20Mini%20Project/docs/submission/08_Advanced_SQL_Procedure_Function_Trigger_CTE.pdf) and turn to Section 3.1 showing the before and after table output.

---

### Row 9: NoSQL / Vector Features & RUD Operations (7 Marks)

#### 1. What the examiner will check
The examiner will inspect [`database/mongodb/rud-examples.js`](file:///d:/DBMS%20Mini%20Project/database/mongodb/rud-examples.js) and [`backend/app/core/vector.py`](file:///d:/DBMS%20Mini%20Project/backend/app/core/vector.py), and will ask you to explain an aggregation pipeline and the vector cosine similarity calculation.

#### 2. What to say in 30 seconds
"In MongoDB, we implemented full Read, Update, and Delete operations using operators like `$set`, `$push`, and `$currentDate`. Our multi-stage aggregation pipeline filters verified documents, unwinds the `tags` array, and groups them to calculate caseload metrics. In `backend/app/core/vector.py`, our semantic search engine generates 64-dimensional float embeddings using token and sub-word n-gram hashing and calculates cosine similarity using dot products."

#### 3. 8-10 Likely Viva Questions & Project-Specific Answers

* **Q1: Walk me through your MongoDB aggregation pipeline stage by stage.**  
  *Answer:* In [`database/mongodb/rud-examples.js`](file:///d:/DBMS%20Mini%20Project/database/mongodb/rud-examples.js#L50-L75):
  1. `$match`: Filters documents where `document_status` is in `["Verified", "Court Admissible"]`. This reduces the dataset early in the pipeline.
  2. `$unwind: "$tags"`: Deconstructs the `tags` array, producing an individual document for each element in the array.
  3. `$group`: Groups the unwound documents by `{ type: "$document_type", tag: "$tags" }`, calculating `total_records: { $sum: 1 }` and collecting distinct case IDs via `distinct_cases: { $addToSet: "$case_id" }`.
  4. `$project`: Shapes the output, renaming fields and calculating `case_count: { $size: "$distinct_cases" }`.
  5. `$sort`: Sorts by `total_records: -1` in descending order.
* **Q2: Explain the math behind your cosine similarity vector search.**  
  *Answer:* In [`backend/app/core/vector.py`](file:///d:/DBMS%20Mini%20Project/backend/app/core/vector.py#L45-L65):
  Cosine similarity measures the angle between two multi-dimensional vectors:
  $$\text{Cosine Similarity} = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}$$
  Because our `generate_embedding()` function normalizes every embedding vector to unit length ($L_2\text{-norm} = 1.0$), $\|\mathbf{u}\| = 1$ and $\|\mathbf{v}\| = 1$. Therefore, the cosine similarity simplifies to the **dot product**:
  $$\sum_{i=1}^{64} u_i \cdot v_i$$
  The result ranges from $-1.0$ (opposite) to $+1.0$ (identical).
* **Q3: Show me MongoDB update operators in your project.**  
  *Answer:* In [`database/mongodb/rud-examples.js`](file:///d:/DBMS%20Mini%20Project/database/mongodb/rud-examples.js#L25-L35):
  ```javascript
  db.investigation_documents.updateOne(
    { title: /Valet Supervisor Pooja Kulkarni/ },
    {
      $set: { document_status: "Court Admissible" },
      $push: { tags: "cross_examined" },
      $currentDate: { audited_at: true }
    }
  );
  ```
  `$set` updates the status string, `$push` appends an item to the array without overwriting existing tags, and `$currentDate` sets the current timestamp.
* **Q4: How does feature hashing generate embeddings without an external API?**  
  *Answer:* In [`backend/app/core/vector.py`](file:///d:/DBMS%20Mini%20Project/backend/app/core/vector.py#L15-L40), we use deterministic multi-seed SHA-256 hashing. For each token in the text, we hash it with three distinct seeds (`7`, `42`, `101`) modulo 64 to choose indices in the vector, adding positive or negative sign weights. We also hash character 3-grams to make the representation resilient to typos and word inflections. Finally, the vector is normalized to unit length.

#### 4. Be ready to run
Run the vector search test in PowerShell:
```powershell
.\venv\Scripts\python.exe scripts/test_vector_search.py
```
Point out the top-ranked matches and their cosine similarity scores.

---

### Row 10: Next.js User Interface (3 Marks)

#### 1. What the examiner will check
The examiner will test the web interface at `http://localhost:3000`, checking navigation, data density, responsiveness, and dark palette styling.

#### 2. What to say in 30 seconds
"Our frontend is built with Next.js 15, React 19, and Tailwind CSS v4. Following case-management tool standards, we designed the UI with a dark graphite base (`#070A0F`), 4px border radiuses, and dense, sortable tables. It features an interactive suspect network graph powered by `@xyflow/react`, an evidence locker, and a DBMS Concepts demonstration sandbox."

#### 3. 8-10 Likely Viva Questions & Project-Specific Answers

* **Q1: Why use `@xyflow/react` in your frontend?**  
  *Answer:* In [`frontend/src/views/RelationshipsPage.tsx`](file:///d:/DBMS%20Mini%20Project/frontend/src/views/RelationshipsPage.tsx), `@xyflow/react` renders our interactive entity graph. It takes nodes and edges from our `/api/graph/relationships` endpoint (which traverses the 12 SQL junction tables) and renders an interactive node-link diagram with drag, zoom, and pan controls.
* **Q2: Why use a single-page app (SPA) client wrapper inside Next.js?**  
  *Answer:* Next.js 15 serves as our production build framework. To provide smooth transitions across complex investigation dossiers without re-fetching layout assets or interrupting websocket/graph state, we wrapped the interactive workbench in client-side routing, caching active dossier tabs in memory.
* **Q3: How does the frontend handle authentication state?**  
  *Answer:* When an officer logs in, the API returns an HS256 JWT token and officer metadata. The frontend stores the token in `localStorage` (`fusion_auth_token`) and includes it in the `Authorization: Bearer <token>` header on all subsequent API requests. If an endpoint returns 401 Unauthorized, the frontend clears the session and redirects to `/login`.

#### 4. Be ready to run
Open `http://localhost:3000` in the browser, log in as `admin`, and click **Relationships** to demonstrate the interactive graph.

---

### Row 11: Backend / API & Database Integration (2 Marks)

#### 1. What the examiner will check
The examiner will inspect Swagger docs at `http://127.0.0.1:8000/docs` and [`backend/app/routers/search.py`](file:///d:/DBMS%20Mini%20Project/backend/app/routers/search.py).

#### 2. What to say in 30 seconds
"Our backend is powered by FastAPI and SQLAlchemy 2.0. We structured the API into modular routers under `backend/app/routers/`. In `search.py`, our cross-database federated search uses `asyncio.gather` to dispatch queries in parallel across PostgreSQL tables and MongoDB documents, returning a unified JSON payload."

#### 3. 8-10 Likely Viva Questions & Project-Specific Answers

* **Q1: How do you prevent SQL injection in your API endpoints?**  
  *Answer:* In all our routers (e.g. [`backend/app/routers/cases.py`](file:///d:/DBMS%20Mini%20Project/backend/app/routers/cases.py)), we use SQLAlchemy 2.0 ORM expressions (`db.query(Case).filter(...)`). SQLAlchemy uses parameterized queries where user inputs are passed as parameters separate from the SQL command structure, rendering injection impossible. In our concept sandbox (`dbms_concepts.py`), the endpoint only executes pre-approved parameterized query definitions keyed by ID (`POST /api/dbms-concepts/execute/{query_id}`); raw user SQL strings are never accepted.
* **Q2: How does Pydantic validate data in FastAPI?**  
  *Answer:* In [`backend/app/schemas/schemas.py`](file:///d:/DBMS%20Mini%20Project/backend/app/schemas/schemas.py), we define Pydantic models with explicit types, regex constraints, and length bounds. When an HTTP POST request arrives, FastAPI validates the JSON body against the schema *before* entering the route handler. If a field fails validation (e.g. missing a required title or sending an integer instead of a string), FastAPI automatically returns a 422 Unprocessable Entity response with descriptive field errors.

#### 4. Be ready to run
Open `http://127.0.0.1:8000/docs` and show the Swagger UI with all 16 interactive endpoints.

---

### Row 12: Authentication & Dual-Tier RBAC in Database (4 Marks)

#### 1. What the examiner will check
The examiner will ask you to demonstrate access denial: an investigator attempting an admin operation being blocked with 403 Forbidden, and the corresponding PostgreSQL role permissions in [`database/sql/roles-and-grants.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/roles-and-grants.sql).

#### 2. What to say in 30 seconds
"We implemented a dual-tier authorization model:
1. Application Tier: FastAPI validates signed HS256 JWT tokens, checking role claims.
2. Database Kernel Tier: In `database/sql/roles-and-grants.sql`, we defined PostgreSQL roles `ifp_admin`, `ifp_investigator`, and `ifp_auditor`. Even if the API layer were bypassed, `ifp_investigator` has explicit `REVOKE DELETE`, causing direct deletion attempts to be rejected by the database engine with SQL error 42501."

#### 3. 8-10 Likely Viva Questions & Project-Specific Answers

* **Q1: How are passwords stored in the database?**  
  *Answer:* In [`backend/app/core/security.py`](file:///d:/DBMS%20Mini%20Project/backend/app/core/security.py#L12-L25), passwords are never stored in plaintext. We hash passwords using **PBKDF2 HMAC SHA-256** with 100,000 iterations and a dedicated salt. Verification uses `hmac.compare_digest` to perform constant-time comparison, preventing timing-attack vulnerabilities.
* **Q2: Walk me through your database-level roles in `roles-and-grants.sql`.**  
  *Answer:* In [`database/sql/roles-and-grants.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/roles-and-grants.sql#L10-L45):
  - `ifp_admin`: Has `ALL PRIVILEGES` on all tables and sequences.
  - `ifp_investigator`: Has `SELECT` on officers (read-only); `SELECT, INSERT, UPDATE` on cases, people, and evidence; `SELECT, INSERT` on audit tables (`case_activity`, `evidence_custody`); and `REVOKE DELETE` on all tables.
  - `ifp_auditor`: Has strict `SELECT ONLY` across all public tables, with `INSERT, UPDATE, DELETE` explicitly revoked.
* **Q3: Show me proof that an investigator is refused access.**  
  *Answer:* When authenticated as `investigator` (`CID-002`), calling `POST /api/officers` returns HTTP 403 Forbidden with detail `"Access forbidden: Officer provisioning and credential management requires ADMIN clearance."` Under PostgreSQL direct access, running `DELETE FROM cases WHERE ...` returns `ERROR: 42501: permission denied for table cases`.

#### 4. Be ready to run
Run the RBAC verification harness in PowerShell:
```powershell
.\venv\Scripts\python.exe scripts/demonstrate_db_rbac.py
```
Show both Part 1 (Server-side 403 refusal) and Part 2 (Database-level role privileges).

---

### Row 13: Documentation & Git/GitHub Quality (2 Marks)

#### 1. What the examiner will check
The examiner will inspect the repository structure, `git log`, the clean root directory, and the reproducibility of startup scripts (`start.ps1`, `start.sh`).

#### 2. What to say in 30 seconds
"Our repository maintains a clean structure with no temporary files committed. We used structured git feature branches (`main`, `final-polish`, `rubric-compliance`, `deliverables-visual-fix`). Our documentation includes 11 submission PDFs in `docs/submission/` and 16 high-resolution vector diagrams in `docs/diagrams/`. Everything can be reproduced with a single command: `.\start.ps1`."

#### 3. 8-10 Likely Viva Questions & Project-Specific Answers

* **Q1: How do I run the entire platform from scratch on a new machine?**  
  *Answer:* In PowerShell, run `.\start.ps1`. The script checks prerequisites, activates the virtual environment, verifies database connectivity, seeds sample data, launches the backend on port 8000 and the frontend on port 3000, and opens the browser.
* **Q2: What is your branching strategy?**  
  *Answer:* We maintained `main` for stable releases, using feature branches for focused milestones: `final-polish` for UI theme refinement, `rubric-compliance` for matrix alignment and vector search, and `deliverables-visual-fix` for academic diagrams and PDF compilation.

---

### Row 14: Originality, Modifications & Viva (4 Marks)

#### 1. What the examiner will check
The examiner will inspect [`docs/modifications.md`](file:///d:/DBMS%20Mini%20Project/docs/modifications.md) and evaluate what was built beyond a baseline CRUD tutorial application.

#### 2. What to say in 30 seconds
"Beyond baseline CRUD, we implemented five significant architectural extensions:
1. A deterministic 64-dimensional semantic vector search engine operating offline.
2. Dual-tier RBAC enforced both in the API and via PostgreSQL database kernel roles.
3. Cross-database search fan-out across SQL and MongoDB using `asyncio.gather`.
4. Automated PostgreSQL-to-SQLite fallback with foreign key PRAGMA enforcement.
5. Automated immutable database audit triggers recording case status transitions."

#### 3. 8-10 Likely Viva Questions & Project-Specific Answers

* **Q1: What are your five major original extensions?**  
  *Answer:* Detailed in [`docs/modifications.md`](file:///d:/DBMS%20Mini%20Project/docs/modifications.md):
  1. *Deterministic Semantic Vector Search:* Custom offline embedding engine (`backend/app/core/vector.py`).
  2. *Dual-Tier Role-Based Security:* Defense-in-depth with FastAPI JWT checks and PostgreSQL kernel grants.
  3. *Cross-Database Search Federation:* Parallel async dispatch across PostgreSQL and MongoDB.
  4. *Zero-Config SQLite Fallback Engine:* Automated socket detection in `session.py` allowing offline viva demonstration.
  5. *Immutable Database Triggers:* Kernel-level auditing via `trg_case_activity_audit`.
* **Q2: What would you improve if you had another month on this project?**  
  *Answer:* We would implement:
  1. Change Data Capture (CDC) using PostgreSQL logical decoding (e.g. Debezium) to automatically synchronize relational entity updates into MongoDB document references without application coordination.
  2. Native PostgreSQL `pgvector` extension for indexing billion-vector scale embeddings inside PostgreSQL.
  3. Distributed tracing using OpenTelemetry across polyglot query executions.

---

## 30 Rapid-Fire One-Line Definitions (With Our Project Examples)

1. **Primary Key:** A minimal candidate key chosen to uniquely identify every row in a table (e.g. `case_id` in `cases`).
2. **Superkey:** Any set of attributes that uniquely identifies a row in a relation; may contain redundant attributes (e.g. `{case_id, title}`).
3. **Candidate Key:** A minimal superkey with no extraneous attributes (e.g. `badge_number` or `officer_id` in `officers`).
4. **Alternate Key:** A candidate key that was not selected as the primary key (e.g. `barcode` in `evidence`).
5. **Foreign Key:** An attribute in one relation that references the primary key of another relation to enforce referential integrity (e.g. `cases.lead_officer_id -> officers.officer_id`).
6. **Weak Entity:** An entity that cannot exist without its parent owner entity and has no primary key of its own (e.g. `evidence_custody`).
7. **Identifying Relationship:** The relationship connecting a weak entity to its owner entity (e.g. `custody_chain` connecting `evidence` to `evidence_custody`).
8. **Cardinality:** The numerical ratio of association between two entity sets (1:1, 1:N, or M:N).
9. **Total Participation:** Constraint requiring that every entity instance in a set participate in a relationship (e.g. every `case_activity` must belong to a `case`).
10. **Composite Key:** A primary key composed of two or more attributes (e.g. `{case_id, person_id}` in `case_people`).
11. **Associative Relation (Junction Table):** A table created to resolve a many-to-many relationship into two 1:N relationships (e.g. `case_people`).
12. **1NF (First Normal Form):** State where all attribute domain values are atomic and no repeating groups exist.
13. **2NF (Second Normal Form):** State where a relation is in 1NF and no non-prime attribute is partially dependent on any candidate key.
14. **3NF (Third Normal Form):** State where a relation is in 2NF and no non-prime attribute transitively depends on the primary key.
15. **BCNF (Boyce-Codd Normal Form):** Strict form requiring that for every non-trivial functional dependency $X \rightarrow Y$, $X$ must be a superkey.
16. **Trigger:** A database callback procedure automatically invoked by the DBMS engine in response to a DML event (e.g. `trg_case_activity_audit` on UPDATE).
17. **Stored Procedure:** A pre-compiled collection of procedural SQL statements callable by name that can perform transaction management (`sp_create_investigation_case`).
18. **User-Defined Function (UDF):** A stored routine that computes and returns a scalar value or table expression (`fn_get_case_summary`).
19. **Common Table Expression (CTE):** A temporary named result set defined within a query using the `WITH` clause.
20. **Recursive CTE:** A CTE that references itself to iteratively traverse hierarchical or graph data until a termination condition is reached.
21. **Window Function:** A function that performs calculations across a set of rows related to the current row without collapsing row identity (`DENSE_RANK()`).
22. **Correlated Subquery:** A subquery that references columns from the outer query, re-evaluating once for each candidate row.
23. **ACID Properties:** Atomicity, Consistency, Isolation, and Durability—the core guarantees of database transactions.
24. **SAVEPOINT:** A checkpoint within an uncommitted transaction allowing partial rollback without aborting the entire transaction.
25. **Deadlock:** A state where two or more concurrent transactions are unable to proceed because each holds a lock the other requires.
26. **B-Tree Index:** A balanced multi-way search tree index optimized for disk reads, supporting equality, range, and sort operations.
27. **Multikey Index:** An index created on an array field in MongoDB, indexing each array element separately.
28. **Inverted Index:** An index mapping individual words/tokens to the list of documents containing them, used for full-text search.
29. **Cosine Similarity:** A metric evaluating the angle between two normalized vectors via their dot product, bounded in $[-1.0, 1.0]$.
30. **Polyglot Persistence:** The architectural practice of using multiple specialized database storage engines within a single software platform.

---

## "If the Demo Breaks" Emergency Troubleshooting Playbook

### Problem 1: Port 8000 or 3000 is already in use
```powershell
.\start.ps1 -Restart
```
*Why this works:* `start.ps1` with `-Restart` identifies any orphaned Python or Node processes holding ports 8000 or 3000 and terminates them before relaunching.

### Problem 2: PostgreSQL is offline on the examination computer
*Symptom:* `FATAL: connection to server at '127.0.0.1', port 5432 failed`.  
*Action:* **Do nothing.** The backend automatically catches the socket exception in [`backend/app/db/session.py`](file:///d:/DBMS%20Mini%20Project/backend/app/db/session.py#L40-L75) and falls back to local SQLite (`intelligence_fusion.db`) with `PRAGMA foreign_keys=ON`. Explain this to the examiner as a planned architectural fallback.

### Problem 3: MongoDB is offline
*Symptom:* `ServerSelectionTimeoutError` on document routes.  
*Action:* Start MongoDB service:
```powershell
net start MongoDB
```
Or start local mongod:
```powershell
mongod --dbpath "D:\DBMS Mini Project\.mongo_data"
```

### Problem 4: Database needs fresh seed records
```powershell
.\start.ps1 -Seed -Restart
```

---

## 40-Point Viva Self-Test Checklist

Test your readiness by verifying each item without consulting notes:

### ER Modeling & Normalization
- [ ] 1. I can explain the difference between our 8 strong and 2 weak entities.
- [ ] 2. I can identify all 12 junction tables and explain why they exist.
- [ ] 3. I can explain why `evidence_custody` has total participation in `custody_chain`.
- [ ] 4. I can define 1NF, 2NF, 3NF, and BCNF from memory.
- [ ] 5. I can prove that `cases` is in BCNF using its functional dependencies.
- [ ] 6. I can prove that composite key junction table `case_people` satisfies 2NF.
- [ ] 7. I can explain the single deliberate denormalization in `evidence.storage_location`.
- [ ] 8. I can explain why natural keys like VIN are not used as primary keys.

### DDL & Constraints
- [ ] 9. I can locate CHECK constraints in `schema.sql` and name the allowed statuses.
- [ ] 10. I can explain why `case_people` uses `ON DELETE CASCADE`.
- [ ] 11. I can explain why `evidence_custody` uses `ON DELETE RESTRICT`.
- [ ] 12. I can explain why `cases.lead_officer_id` uses `ON DELETE SET NULL`.
- [ ] 13. I can quote the SQL error code for foreign key violation (`23503`).
- [ ] 14. I can quote the SQL error code for check constraint violation (`23514`).
- [ ] 15. I can explain why secondary B-tree indexes were added to foreign keys.
- [ ] 16. I can explain how SQLite fallback enforces foreign keys (`PRAGMA foreign_keys=ON`).

### Advanced SQL & Transactions
- [ ] 17. I can walk through the stored procedure `sp_create_investigation_case` line by line.
- [ ] 18. I can explain the difference between a stored procedure and a function.
- [ ] 19. I can walk through the trigger `trg_case_activity_audit` and explain `OLD` vs `NEW`.
- [ ] 20. I can explain why `AFTER UPDATE` was chosen instead of `BEFORE UPDATE`.
- [ ] 21. I can show the before-and-after proof of the trigger firing.
- [ ] 22. I can walk through the anchor and recursive members of our Recursive CTE.
- [ ] 23. I can explain how our Recursive CTE terminates (`depth < 2`).
- [ ] 24. I can explain our multi-statement transaction with `SAVEPOINT` and `ROLLBACK TO SAVEPOINT`.

### NoSQL & Vector Search
- [ ] 25. I can explain why MongoDB was chosen for polymorphic documents instead of SQL.
- [ ] 26. I can explain the `$jsonSchema` validator in `collection-schema.json`.
- [ ] 27. I can explain how `case_id` forms a polyglot link from MongoDB to PostgreSQL.
- [ ] 28. I can walk through the stages of our aggregation pipeline (`$match`, `$unwind`, `$group`).
- [ ] 29. I can explain MongoDB operators `$set`, `$push`, and `$currentDate`.
- [ ] 30. I can explain how multi-seed feature hashing generates 64-dimensional embeddings.
- [ ] 31. I can explain why cosine similarity equals the dot product on normalized unit vectors.
- [ ] 32. I can explain what a multikey index is and where it is used.

### Backend, Security & Frontend
- [ ] 33. I can explain how passwords are hashed with PBKDF2 (100,000 iterations + salt).
- [ ] 34. I can explain what constant-time comparison is (`hmac.compare_digest`).
- [ ] 35. I can explain the difference between FastAPI route guards and PostgreSQL role grants.
- [ ] 36. I can quote the PostgreSQL error code for permission denied (`42501`).
- [ ] 37. I can explain how `asyncio.gather` parallelizes cross-database search queries.
- [ ] 38. I can explain how SQL injection is prevented across all endpoints.
- [ ] 39. I can explain the dark graphite palette tokens and why 4px rounded corners were used.
- [ ] 40. I can explain what happens when an investigator token attempts officer provisioning (403 Forbidden).
