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

## 2. 14-Component Evaluation Rubric Coverage (50 Marks)

| # | Evaluation Rubric Component | Max Marks | Implementation Evidence & Verified Artifacts |
|:---:|:---|:---:|:---|
| **1** | **ER Diagram** | 2 | [`docs/er-diagram.md`](docs/er-diagram.md) & [`docs/submission/01_ER_Diagram.pdf`](docs/submission/01_ER_Diagram.pdf) — Complete Mermaid ER diagram with all 10 core entities, 12 junction tables, cardinality notation, and MongoDB polyglot links. |
| **2** | **Relational Schema, Keys & Constraints** | 3 | [`database/sql/schema.sql`](database/sql/schema.sql) & [`backend/app/models/sql_models.py`](backend/app/models/sql_models.py) — DDL with domain PKs (`CASE-XXX`, `PER-XXX`), foreign keys, CHECK constraints (status, priority, category), UNIQUE constraints, and ON DELETE cascade/restrict rules. |
| **3** | **Data Integrity, Normalization & Indexes** | 4 | [`docs/database-design.md`](docs/database-design.md) & [`docs/submission/02_Relational_Schema_and_DDL.pdf`](docs/submission/02_Relational_Schema_and_DDL.pdf) — Formal 1NF, 2NF, 3NF, and BCNF normalization proofs; B-tree, temporal, and composite indexing strategies. |
| **4** | **Relational Database Implementation** | 5 | PostgreSQL production schema (`database/sql/schema.sql`) and SQLAlchemy 2.0 models with automatic SQLite failover (`backend/app/db/session.py`) maintaining foreign key pragmas and integrity. |
| **5** | **DML Operations** | 5 | [`database/sql/dml-examples.sql`](database/sql/dml-examples.sql) & [`docs/submission/03_SQL_Operations_and_Queries.pdf`](docs/submission/03_SQL_Operations_and_Queries.pdf) — CRUD operations, multi-table joins, nested queries, and transaction rollback with SAVEPOINTs. |
| **6** | **Advanced SQL** | 6 | [`database/sql/advanced-concepts.sql`](database/sql/advanced-concepts.sql) & [`docs/submission/04_Advanced_Database_Concepts.pdf`](docs/submission/04_Advanced_Database_Concepts.pdf) — Stored Procedure (`sp_create_investigation_case`), Function (`fn_get_case_summary`), Audit Trigger (`trg_case_activity_audit`), Window Ranking (`DENSE_RANK()`), and Recursive CTE suspect graph traversal. |
| **7** | **NoSQL Database Implementation** | 5 | [`database/mongodb/`](database/mongodb/) & [`docs/submission/05_NoSQL_and_Integration.pdf`](docs/submission/05_NoSQL_and_Integration.pdf) — JSON Schema validator (`collection-schema.json`), weighted text and compound indexes (`indexes.js`), aggregation pipelines, and 26 sample polymorphic documents. |
| **8** | **Technology Justification & Analysis** | 3 | [`docs/technology-justification.md`](docs/technology-justification.md) — Architectural trade-off analysis comparing RDBMS ACID guarantees vs NoSQL dynamic schema flexibility, query latency benchmarks, and CAP theorem classification. |
| **9** | **Authorization & Access Control** | 3 | [`docs/authorization.md`](docs/authorization.md) & [`database/sql/roles-and-grants.sql`](database/sql/roles-and-grants.sql) — Dual-tier RBAC: PostgreSQL roles (`ifp_admin`, `ifp_investigator`, `ifp_auditor`) + server-side JWT authentication with ADMIN vs INVESTIGATOR route protection. |
| **10** | **User Interface (Next.js with TypeScript)** | 5 | [`frontend/`](frontend/) & [`docs/submission/06_Project_Report.pdf`](docs/submission/06_Project_Report.pdf) — Responsive forensic workstation in dark graphite/slate, TypeScript type safety, case dossier inspector, evidence vault, interactive link analysis graph, and live DBMS concepts sandbox. |
| **11** | **System Architecture & Integration** | 3 | Unified REST gateway (`FastAPI`), polyglot data federation (`backend/app/routers/search.py`), and multi-service Docker Compose orchestration (`docker-compose.yml`). |
| **12** | **Project Documentation & Repository Quality** | 3 | Detailed technical specifications, synchronized DDL/models, reproducible seed scripts (`backend/seed.py`), and 8 publication-grade submission PDFs. |
| **13** | **Viva & Demonstration Preparation** | 3 | [`docs/viva-preparation.md`](docs/viva-preparation.md) & [`docs/submission/07_Rubric_Coverage_and_Viva.pdf`](docs/submission/07_Rubric_Coverage_and_Viva.pdf) — 5-minute live demo walkthrough script and 30 examiner questions with answers. |
| **14** | **Team Contributions** | Mandatory | [`docs/team-contributions.md`](docs/team-contributions.md) — Equal 50/50 division of responsibilities across design, engineering, testing, and documentation between Saatvik Gupta and Satyam Goyal. |
| **TOTAL** | **Comprehensive DBMS Evaluation** | **50 / 50** | **Fully Implemented, Verified, and Tested** |

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

The repository includes 8 publication-grade academic PDF deliverables in `docs/submission/` matching the 14 rubric components:

| Deliverable | File Path | Topic & Rubric Component |
|:---|:---|:---|
| **Doc 1: ER Diagram** | [`docs/submission/01_ER_Diagram.pdf`](docs/submission/01_ER_Diagram.pdf) | Entity-Relationship model, 10 entities, 12 junction tables, cardinality |
| **Doc 2: Schema & DDL** | [`docs/submission/02_Relational_Schema_and_DDL.pdf`](docs/submission/02_Relational_Schema_and_DDL.pdf) | DDL, check constraints, indexes, 3NF/BCNF normalization proofs |
| **Doc 3: SQL Operations** | [`docs/submission/03_SQL_Operations_and_Queries.pdf`](docs/submission/03_SQL_Operations_and_Queries.pdf) | DML CRUD, multi-table joins, subqueries, transaction rollback & savepoints |
| **Doc 4: Advanced SQL** | [`docs/submission/04_Advanced_Database_Concepts.pdf`](docs/submission/04_Advanced_Database_Concepts.pdf) | Stored procedures, user functions, audit triggers, recursive CTE link graph |
| **Doc 5: NoSQL & Integration** | [`docs/submission/05_NoSQL_and_Integration.pdf`](docs/submission/05_NoSQL_and_Integration.pdf) | MongoDB schema validation, weighted text search, aggregation pipelines |
| **Doc 6: Project Report** | [`docs/submission/06_Project_Report.pdf`](docs/submission/06_Project_Report.pdf) | Comprehensive report: abstract, architecture, security, and UI design |
| **Doc 7: Rubric & Viva** | [`docs/submission/07_Rubric_Coverage_and_Viva.pdf`](docs/submission/07_Rubric_Coverage_and_Viva.pdf) | 14-component rubric compliance matrix, 5-min demo walkthrough, viva Q&A |
| **Doc 8: Setup & API Guide** | [`docs/submission/08_Setup_API_and_Testing_Guide.pdf`](docs/submission/08_Setup_API_and_Testing_Guide.pdf) | Startup guide, CLI command reference, test suite execution, REST endpoints |

#### To regenerate all 8 PDFs from scratch:
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
