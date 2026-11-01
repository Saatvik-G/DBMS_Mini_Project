# Intelligence Fusion Platform

**Centralized Investigation Information Management Platform**  
**Course:** Database Management Systems (DBMS) Mini Project (UE24CS395)  
**Evaluation Scope:** 14-Component Evaluation Rubric (50 Marks Maximum)  
**Academic Year:** 2026–2027 | **Institution:** PES University  
**Repository:** [https://github.com/Saatvik-G/DBMS_Mini_Project](https://github.com/Saatvik-G/DBMS_Mini_Project)

---

### Project Team Members
- **Saatvik Gupta** — SRN: `PES1UG24CS395` (Full-Stack Architecture, Relational Modeling, Advanced Stored Procedures & Triggers, Next.js Frontend)
- **Satyam Goyal** — SRN: `PES1UG24CS424` (Polyglot NoSQL Storage, MongoDB Schemas & Indexes, Cross-Database Search, Authorization RBAC)

---

## 1. Executive Abstract & Objectives

The **Intelligence Fusion Platform** is a full-stack DBMS application designed to model a multi-agency digital forensics and intelligence fusion center. In digital investigations and counter-fraud operations, law enforcement handles two distinct classes of data:
1. **Strict Relational Entities:** Cases, people of interest, organizations, vehicles, devices, locations, officers, evidence items, and custody events requiring strict referential integrity, normalized schemas (3NF/BCNF), and ACID guarantees for evidentiary admissibility.
2. **Dynamic Unstructured Field Telemetry:** CCTV extractions, encrypted chat exports, witness statements, mobile extractions, and sensor logs arriving with heterogeneous, evolving schemas.

To address this without compromise, the platform implements a **Polyglot Persistence Architecture**:
- **PostgreSQL 15+** serves as the primary relational system of record across **22 normalized tables** (10 primary entity/audit tables + 12 associative bridge tables), with zero-configuration automatic fallback to **SQLite 3** for portable offline presentations.
- **MongoDB 7.0+** serves as the flexible document store for polymorphic intelligence artifacts with inverted full-text search, multikey indexing, and pipeline aggregations.
- **FastAPI** provides a high-throughput REST gateway federating queries across both storage systems.
- **Next.js with TypeScript** provides a dark charcoal and slate forensic workstation interface (`#070A0F`, `#0B0F17`, `#141824`) featuring interactive relationship graphs, chronological timelines, and an interactive DBMS concepts execution sandbox.

---

## 2. Official 14-Component Evaluation Matrix (50 Marks)

| # | Official Evaluation Component | Max Marks | Status | Primary Artifact & Submission Deliverable |
|:---:|:---|:---:|:---:|:---|
| **1** | **ER diagram** | 2 | Complete | [`docs/submission/01_ER_Diagram.pdf`](docs/submission/01_ER_Diagram.pdf) & [`docs/er-diagram.md`](docs/er-diagram.md) — 22 tables (10 entities + 12 junction tables) with cardinalities and keys. |
| **2** | **Relational schema with keys, relationships, and constraints** | 3 | Complete | [`docs/submission/02_Relational_Schema.pdf`](docs/submission/02_Relational_Schema.pdf) & [`docs/database-design.md`](docs/database-design.md) — Relation table with PKs, FKs, CHECKs, UNIQUEs, and 1NF/2NF/3NF/BCNF proofs. |
| **3** | **SQL database implementation - DDL with constraints** | 4 | Complete | [`docs/submission/03_SQL_DDL_Implementation.pdf`](docs/submission/03_SQL_DDL_Implementation.pdf) & [`database/sql/schema.sql`](database/sql/schema.sql) — 22-table DDL, CASCADE/RESTRICT rules, and 17 performance indexes. |
| **4** | **NoSQL/Vector database creation** | 4 | Complete | [`docs/submission/04_NoSQL_Vector_Database_Creation.pdf`](docs/submission/04_NoSQL_Vector_Database_Creation.pdf) & [`database/mongodb/`](database/mongodb/) — Collection `$jsonSchema`, 64-dim vector design, text/compound indexes, 26 seeded docs. |
| **5** | **Technology justification** | 1 | Complete | [`docs/submission/05_Technology_Justification.pdf`](docs/submission/05_Technology_Justification.pdf) & [`docs/technology-justification.md`](docs/technology-justification.md) — Architectural rationale: PostgreSQL ACID vs MongoDB polymorphism. |
| **6** | **DML operations** | 4 | Complete | [`docs/submission/06_DML_Operations.pdf`](docs/submission/06_DML_Operations.pdf) & [`database/sql/dml-examples.sql`](database/sql/dml-examples.sql) — CRUD statements with outputs, plus transaction with COMMIT, ROLLBACK and SAVEPOINT. |
| **7** | **Nested/correlated/recursive queries, JOIN SQL queries** | 4 | Complete | [`docs/submission/07_Queries_Nested_Correlated_Recursive_Joins.pdf`](docs/submission/07_Queries_Nested_Correlated_Recursive_Joins.pdf) & [`database/sql/advanced-queries.sql`](database/sql/advanced-queries.sql) — Multi-table JOINs, nested, correlated, and recursive CTEs with output. |
| **8** | **Advanced SQL concepts: procedure/function, trigger, CTE** | 6 | Complete | [`docs/submission/08_Advanced_SQL_Procedure_Function_Trigger_CTE.pdf`](docs/submission/08_Advanced_SQL_Procedure_Function_Trigger_CTE.pdf) & [`database/sql/advanced-concepts.sql`](database/sql/advanced-concepts.sql) — Stored Procedure, Function, Audit Trigger, and CTE. |
| **9** | **NoSQL/Vector feature, RUD** | 7 | Complete | [`docs/submission/09_NoSQL_Vector_Features_and_RUD.pdf`](docs/submission/09_NoSQL_Vector_Features_and_RUD.pdf) & [`scripts/test_vector_search.py`](scripts/test_vector_search.py) — 64-dim cosine vector search (`/api/search/semantic`), text search, and aggregations. |
| **10** | **Next.js interface** | 3 | Complete | [`frontend/`](frontend/) — Professional dark graphite case-management workstation in Next.js 15 App Router & TypeScript (18/18 static pages generated). |
| **11** | **Backend/API and database integration** | 2 | Complete | [`backend/app/`](backend/app/) — FastAPI asynchronous gateway, cross-database federated search, interactive Swagger docs (`/docs`), robust error handling. |
| **12** | **Authentication (frontend + 2 roles + DB-level RBAC)** | 4 | Complete | [`docs/submission/10_Authentication_and_RBAC.pdf`](docs/submission/10_Authentication_and_RBAC.pdf) & [`scripts/demonstrate_db_rbac.py`](scripts/demonstrate_db_rbac.py) — JWT login, route protection, 403 checks, and PostgreSQL roles (`ifp_admin`, `ifp_investigator`). |
| **13** | **Documentation, Git/GitHub** | 2 | Complete | [`README.md`](README.md), [`.gitignore`](.gitignore), clean repository root, clear setup instructions, and verified startup scripts. |
| **14** | **Originality, individual contribution, modification/viva** | 4 | Complete | [`docs/submission/11_Project_Report.pdf`](docs/submission/11_Project_Report.pdf), [`docs/modifications.md`](docs/modifications.md), [`docs/viva-preparation.md`](docs/viva-preparation.md), [`docs/team-contributions.md`](docs/team-contributions.md). |
| **TOTAL** | **Official Evaluation Matrix** | **50** | **Complete** | **All 14 components backed by executable code, verified outputs, and dedicated PDF deliverables.** |

---

## 3. Quick Start & Execution Guide

### Primary Method: One-Command Presentation Startup

For presentations and viva evaluations, run the **single startup script**. It validates Python and Node.js prerequisites, checks databases, launches backend and frontend servers, and opens the application in your browser.

#### On Windows (PowerShell):
```powershell
.\start.ps1
```

#### On macOS / Linux (Bash):
```bash
chmod +x start.sh
./start.sh
```

---

### Command-Line Arguments & Options

Both `start.ps1` and `start.sh` support identical command-line flags:

| PowerShell Flag | Bash Flag | Description |
|:---|:---|:---|
| *(none)* | *(none)* | Full stack launch: verifies environment, starts backend (:8000), frontend (:3000), and opens browser. |
| `-Restart` | `-r`, `--restart` | Terminates any existing processes on ports 8000 and 3000 before launching fresh instances. |
| `-Test` | `-t`, `--test` | Runs the 10-test automated verification suite (`pytest`) and exits with standard exit code. |
| `-Seed` | `-s`, `--seed` | Forces database re-seeding (`--force`) with the standardized fictional investigation dataset. |
| `-NoBrowser` | `-n`, `--no-browser` | Launches all background services without opening the default web browser automatically. |
| `-FrontendMode vite` | `-f, --frontend vite` | Launches frontend using Vite on port `5173` instead of Next.js on port `3000`. |
| `-Help` | `-h`, `--help` | Displays the help menu with all options and usage examples. |

#### Useful Presentation Commands:
```powershell
# Clean restart backend and frontend
.\start.ps1 -Restart

# Run the automated verification test suite (10/10 tests)
.\start.ps1 -Test

# Force re-seed database with fresh demonstration records
.\start.ps1 -Seed -Restart
```

---

### Database Engine Strategy: PostgreSQL Primary & SQLite Fallback

1. **Primary Engine — PostgreSQL (`localhost:5432`):**
   - The production target for the 22-table schema.
   - Natively compiles and executes procedural SQL: `sp_create_investigation_case`, `fn_get_case_summary`, `trg_case_activity_audit`, and the recursive CTE.
2. **Fallback Engine — SQLite 3 (`intelligence_fusion.db`):**
   - If PostgreSQL is offline, the backend connects automatically to `intelligence_fusion.db` at the project root with zero configuration.
   - Relational tables, foreign key constraints (via `PRAGMA foreign_keys=ON`), queries, aggregations, window functions, and recursive CTEs run natively.
   - Procedural routines (stored procedures and triggers) are documented as PostgreSQL-specific in the DBMS Concepts Sandbox.

---

### Alternative: Running with Docker Compose
```bash
docker-compose up -d --build
```

---

### Alternative: Manual Step-by-Step Startup

#### Terminal 1 — Backend & Database Seeding
```powershell
cd backend
..\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Backend API Docs (Swagger): `http://127.0.0.1:8000/docs`

#### Terminal 2 — Next.js Frontend
```powershell
cd frontend
npm run dev
```
- Workstation URL: `http://localhost:3000`

---

## 4. Security, Roles & Authentication Credentials

The platform enforces role-based access control (RBAC) both at the database level and server-side in the API:

| Role | Username / Badge | Password | Authorization Scope & Clearance |
|:---|:---|:---|:---|
| **ADMIN** | `admin` (`CID-001`) | `Admin@123` | Full system control, officer registration (`/users`), audit inspection |
| **INVESTIGATOR** | `investigator` (`CID-002`) | `Investigator@123` | Case dossiers, suspect linking, evidence custody, document ingestion (Read-only on `/users`) |

- **Password Hashing:** PBKDF2 HMAC SHA-256 with 100,000 iterations and constant-time verification.
- **Session Tokens:** Cryptographically signed JSON Web Tokens (JWT) using `HS256`.
- **1-Click Demo Buttons:** The login page provides instant demonstration cards for Administrator and Lead Inspector roles.

---

## 5. Official Academic PDF Deliverables (`docs/submission/`)

The repository includes 11 publication-grade academic PDF deliverables in `docs/submission/` mapping directly onto the official evaluation matrix:

| Deliverable | File Path | Topic & Official Matrix Component | Marks |
|:---|:---|:---|:---:|
| **Doc 1: ER Diagram** | [`docs/submission/01_ER_Diagram.pdf`](docs/submission/01_ER_Diagram.pdf) | Entity-Relationship model, 10 entities, 12 junction tables, cardinalities | 2 |
| **Doc 2: Relational Schema** | [`docs/submission/02_Relational_Schema.pdf`](docs/submission/02_Relational_Schema.pdf) | Schema table per relation, keys, constraints, normalization proofs | 3 |
| **Doc 3: SQL DDL** | [`docs/submission/03_SQL_DDL_Implementation.pdf`](docs/submission/03_SQL_DDL_Implementation.pdf) | DDL with constraints, cascade rules, and 17 performance indexes | 4 |
| **Doc 4: NoSQL & Vector DB** | [`docs/submission/04_NoSQL_Vector_Database_Creation.pdf`](docs/submission/04_NoSQL_Vector_Database_Creation.pdf) | MongoDB schema validation, 64-dim vector design, text/compound indexes | 4 |
| **Doc 5: Tech Justification** | [`docs/submission/05_Technology_Justification.pdf`](docs/submission/05_Technology_Justification.pdf) | Architectural trade-offs: PostgreSQL ACID vs MongoDB polymorphism | 1 |
| **Doc 6: DML Operations** | [`docs/submission/06_DML_Operations.pdf`](docs/submission/06_DML_Operations.pdf) | CRUD statements with outputs, transaction rollback & savepoint demo | 4 |
| **Doc 7: Advanced Queries** | [`docs/submission/07_Queries_Nested_Correlated_Recursive_Joins.pdf`](docs/submission/07_Queries_Nested_Correlated_Recursive_Joins.pdf) | Multi-table joins, nested subqueries, correlated subqueries, recursive CTE | 4 |
| **Doc 8: Advanced SQL** | [`docs/submission/08_Advanced_SQL_Procedure_Function_Trigger_CTE.pdf`](docs/submission/08_Advanced_SQL_Procedure_Function_Trigger_CTE.pdf) | Stored procedure, user function, audit trigger, and recursive CTE | 6 |
| **Doc 9: Vector Search & RUD**| [`docs/submission/09_NoSQL_Vector_Features_and_RUD.pdf`](docs/submission/09_NoSQL_Vector_Features_and_RUD.pdf) | 64-dim vector cosine similarity search, MongoDB CRUD, aggregations | 7 |
| **Doc 10: Auth & RBAC** | [`docs/submission/10_Authentication_and_RBAC.pdf`](docs/submission/10_Authentication_and_RBAC.pdf) | JWT auth flow, 403 route protection, and PostgreSQL role privileges | 4 |
| **Doc 11: Project Report** | [`docs/submission/11_Project_Report.pdf`](docs/submission/11_Project_Report.pdf) | Comprehensive report: Next.js UI, backend integration, Git/contributions | 11 |
| **TOTAL** | **Comprehensive Academic Submission** | **All 14 Official Evaluation Components Covered** | **50** |

#### To regenerate all 11 PDFs from scratch:
```powershell
python scripts/generate_submission_pdfs.py
```

---

## 6. Project Directory Structure

```
DBMS Mini Project/
├── backend/                        # FastAPI Python Backend
│   ├── app/
│   │   ├── core/                  # Configuration & PBKDF2/JWT security
│   │   ├── db/                    # PostgreSQL & MongoDB connection managers
│   │   ├── models/                # SQLAlchemy relational ORM models (22 tables)
│   │   ├── routers/               # 16 REST API route controllers
│   │   └── schemas/               # Pydantic data schemas
│   ├── seed.py                    # Repeatable seeder script (22 evidence, 8 cases, 15 people)
│   └── tests/                     # Pytest automated test suite (10/10 passing)
├── database/
│   ├── sql/                       # Relational SQL artifacts
│   │   ├── schema.sql             # 22-table DDL with constraints & indexes
│   │   ├── dml-examples.sql       # CRUD, JOINs, Savepoints & Rollback
│   │   ├── advanced-queries.sql   # Complex JOINs, Subqueries, Window functions
│   │   ├── advanced-concepts.sql  # Stored Procedure, Function, Trigger, CTE
│   │   └── roles-and-grants.sql   # Database-level RBAC (ifp_admin, ifp_investigator)
│   └── mongodb/                   # NoSQL MongoDB artifacts
│       ├── collection-schema.json # JSON Schema validator
│       ├── indexes.js             # Weighted text & compound indexes
│       ├── rud-examples.js        # Aggregations, updates & text search
│       ├── sample-documents.json  # 26 polymorphic investigation documents
│       └── README.md              # Document design guide
├── docs/                          # Comprehensive Academic Documentation
│   ├── submission/                # 8 OFFICIAL ACADEMIC PDF DELIVERABLES
│   │   ├── 01_ER_Diagram.pdf
│   │   ├── 02_Relational_Schema_and_DDL.pdf
│   │   ├── 03_SQL_Operations_and_Queries.pdf
│   │   ├── 04_Advanced_Database_Concepts.pdf
│   │   ├── 05_NoSQL_and_Integration.pdf
│   │   ├── 06_Project_Report.pdf
│   │   ├── 07_Rubric_Coverage_and_Viva.pdf
│   │   └── 08_Setup_API_and_Testing_Guide.pdf
│   ├── rubric-compliance.md       # 14-component compliance matrix (50/50 marks)
│   ├── er-diagram.md              # Complete Mermaid ER diagram
│   ├── database-design.md         # 3NF/BCNF normalization proofs & indexes
│   ├── technology-justification.md# RDBMS vs NoSQL comparative analysis
│   ├── authorization.md           # Application & Database RBAC specification
│   ├── team-contributions.md      # Saatvik Gupta & Satyam Goyal attribution
│   └── viva-preparation.md        # 5-min walkthrough script & 30 viva Q&As
├── frontend/                      # Next.js 15+ / React 19 Frontend
│   ├── app/                       # Next.js App Router entrypoints & layouts
│   ├── src/views/                 # 17 complete intelligence modules
│   └── package.json
├── scripts/                       # Automation & Report Generation Scripts
│   └── generate_submission_pdfs.py # ReportLab PDF generator for all 8 deliverables
├── start.ps1                      # Windows presentation startup script
├── start.sh                       # Linux / macOS presentation startup script
├── docker-compose.yml             # Multi-container orchestration
└── README.md                      # Project master readme
```

---

## 7. Academic Integrity Declaration

This project was conceived, designed, developed, and tested collaboratively by **Saatvik Gupta (PES1UG24CS395)** and **Satyam Goyal (PES1UG24CS424)** for the Database Management Systems course at PES University. All rights reserved.
