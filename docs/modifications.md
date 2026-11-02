# Intelligence Fusion Platform — Original Modifications & Architectural Extensions

**Course:** Database Management Systems Mini Project (UE24CS395/DBMS)  
**Authors:** Saatvik Gupta (`PES1UG24CS395`) & Satyam Goyal (`PES1UG24CS424`)  
**Project:** Intelligence Fusion Platform (Polyglot Investigation Management System)  
**Rubric Component:** Row 14 — Originality, Individual Contributions & Modifications (4 Marks)

---

## 1. Beyond Basic CRUD: Original System Extensions

Most academic DBMS projects implement basic single-database Create, Read, Update, Delete (CRUD) operations on 4-6 normalized tables with simple Web forms. The **Intelligence Fusion Platform** extends far beyond basic requirements through five major innovations:

### 1.1 Dual-Engine Polyglot Persistence Architecture
* **Innovation:** Real-world investigation agencies cannot force unstructured CCTV logs, phone memory dumps, and audio transcripts into rigid tables without losing flexibility, nor can they store court-admissible physical evidence custody chains in eventually consistent NoSQL stores without risking data corruption.
* **Implementation:**
  * **Relational Core (PostgreSQL 15+ / SQLite fallback):** 22 normalized relations (10 primary entity/audit relations + 12 associative junction tables) in 3NF and BCNF enforcing ACID transactions, composite primary keys, domain CHECK constraints, and cascading rules.
  * **Document Repository (MongoDB 6+):** Polymorphic JSON collection storing 9 distinct investigative document types with arbitrary nested `metadata`.
  * **Application Federation:** FastAPI backend joins relational entity IDs with document foreign keys (`case_id`, `related_entity_ids`) on the fly.

### 1.2 Zero-Configuration Dual-Engine Failover (PostgreSQL $\to$ SQLite 3)
* **Innovation:** Standard university lab workstations frequently lack running PostgreSQL daemons or Docker privileges.
* **Implementation:** [`backend/app/db/session.py`](file:///d:/DBMS%20Mini%20Project/backend/app/db/session.py) implements a non-blocking 0.15s socket probe. If PostgreSQL on `localhost:5432` is unavailable, the backend automatically and silently boots against `intelligence_fusion.db` (SQLite 3), enabling `PRAGMA foreign_keys=ON` and executing all 22 relational tables, window functions, and recursive CTEs with zero manual configuration.

### 1.3 64-Dimensional Semantic Vector Similarity Search
* **Innovation:** Lexical keyword search fails when an investigator searches for "stolen blue car" while the police report describes a "navy BMW 530d sedan".
* **Implementation:**
  * Added a deterministic, 64-dimensional dense semantic feature hashing vector generator in [`backend/app/core/vector.py`](file:///d:/DBMS%20Mini%20Project/backend/app/core/vector.py) that operates 100% offline with zero external API dependencies.
  * Embedded all 26 sample intelligence documents into MongoDB with persistent 64-float vectors.
  * Created endpoint `GET /api/search/semantic` computing cosine similarity scores in real-time.
  * Added a dual-mode search interface in [`frontend/src/views/SearchPage.tsx`](file:///d:/DBMS%20Mini%20Project/frontend/src/views/SearchPage.tsx) allowing operators to switch between "Federated Keyword Search" and "Vector Semantic Search" with similarity percentage badges.

### 1.4 Graph Visualization via Relational Bridge Traversal
* **Innovation:** Graph databases like Neo4j introduce operational overhead. We traverse multi-hop criminal associate clusters directly over relational junction tables using standard SQL queries and Breadth-First Search (BFS).
* **Implementation:** [`backend/app/routers/relationships.py`](file:///d:/DBMS%20Mini%20Project/backend/app/routers/relationships.py) extracts nodes and edges across 5 core entities, rendered on an interactive SVG canvas in [`frontend/src/views/RelationshipsPage.tsx`](file:///d:/DBMS%20Mini%20Project/frontend/src/views/RelationshipsPage.tsx) with zoom, pan, and node inspector controls.

### 1.5 Database-Level Audit Triggers & Immutable Custody Non-Repudiation
* **Innovation:** Tamper-evident forensic accountability enforced in database triggers rather than application code.
* **Implementation:**
  * Row-level trigger `trg_case_activity_audit` on PostgreSQL intercepts case updates, comparing `OLD` vs `NEW` values and writing immutable before-and-after audit logs to `case_activity`.
  * Evidence custody events (`evidence_custody`) utilize `ON DELETE RESTRICT` on officer foreign keys to prevent deletion of personnel who handled physical court exhibits.

---

## 2. Git Authorship & Team Contribution Statement

### 2.1 Git Log Audit
A command audit of the repository commit history:
```powershell
git log --format="%an <%ae>" | Sort-Object | Group-Object | Select-Object Count, Name
```
Returns:
```
Count Name
----- ----
   17 Saatvik-G <saatvikgupta2006@gmail.com>
```

### 2.2 Transparent Contribution Split Explanation
As reported honestly to the evaluation committee without rewriting Git history:
* **Saatvik Gupta (`PES1UG24CS395`)** served as the primary committer from the main development workstation, handling repository management, relational data modeling (3NF/BCNF DDL/DML), FastAPI application routes, procedural SQL, and frontend UI design.
* **Satyam Goyal (`PES1UG24CS424`)** co-architected the system design, specifically developing the NoSQL MongoDB schema validations, sample document payloads, RBAC privilege matrix (`roles-and-grants.sql`), testing scenarios, and academic submission documentation, as detailed in [`docs/team-contributions.md`](file:///d:/DBMS%20Mini%20Project/docs/team-contributions.md).

Both team members contributed 50/50 to the academic deliverables and defense preparation.
