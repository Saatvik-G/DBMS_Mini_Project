# Intelligence Fusion Platform

**Centralized investigation information management platform built on polyglot persistence (PostgreSQL + MongoDB).**

| | |
|---|---|
| **Course** | Database Management Systems Mini Project (UE24CS395) |
| **Institution** | PES University, Academic Year 2026-2027 |
| **Repository** | https://github.com/Saatvik-G/DBMS_Mini_Project |

## Team

| Member | SRN | Focus |
|---|---|---|
| Saatvik Gupta | `PES1UG24CS395` | Full-stack architecture, relational modeling, stored procedures and triggers, Next.js frontend |
| Satyam Goyal | `PES1UG24CS424` | NoSQL storage, MongoDB schemas and indexes, cross-database search, RBAC authorization |

## Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Rubric Coverage](#3-rubric-coverage)
4. [Quick Start](#4-quick-start)
5. [Demonstration Modules](#5-demonstration-modules)
6. [Security and Demo Credentials](#6-security-and-demo-credentials)
7. [Submission PDFs](#7-submission-pdfs)
8. [Project Structure](#8-project-structure)
9. [Academic Integrity Declaration](#9-academic-integrity-declaration)

## 1. Overview

The platform replicates a multi-agency criminal and cyber intelligence fusion center. Investigators work with two very different kinds of data:

1. **Strict relational entities.** Cases, people of interest, organizations, vehicles, devices, locations, officers and evidence items. These need referential integrity, normalized schemas (3NF/BCNF) and ACID guarantees to preserve chain of custody.
2. **Dynamic unstructured telemetry.** CCTV log extractions, encrypted chat exports, witness statements, phone extractions and sensor logs, all arriving with heterogeneous, evolving schemas.

To handle both without compromise, the project uses a **polyglot persistence architecture**. PostgreSQL is the system of record for relational data, MongoDB stores polymorphic intelligence artifacts, and a FastAPI gateway federates queries across both.

## 2. Tech Stack

| Layer | Technology | Role |
|---|---|---|
| Relational DB | PostgreSQL 15+ | System of record, 22 tables (11 entities and 11 associative bridge tables) |
| Document DB | MongoDB 7.0+ | Polymorphic artifacts, weighted full-text search, vector search schema design |
| Backend | FastAPI, SQLAlchemy, Pydantic | Unified REST gateway across both databases |
| Frontend | Next.js 15+, React 19, TypeScript | Dark navy dashboard with relationship graph, timelines and a DBMS concepts sandbox |
| Orchestration | Docker Compose, `start.sh`, `start.ps1` | One-command startup |

## 3. Rubric Coverage

| # | Component | Marks | Artifacts |
|---|---|:---:|---|
| 1 | ER Diagram | 2 | [`docs/er-diagram.md`](docs/er-diagram.md): Mermaid ER diagram with 11 entities, 11 junction tables and MongoDB links |
| 2 | Relational Schema, Keys and Constraints | 3 | [`database/sql/schema.sql`](database/sql/schema.sql): PKs, FKs, CHECKs, UNIQUE constraints, cascade rules |
| 3 | Integrity, Normalization and Indexes | 4 | [`docs/database-design.md`](docs/database-design.md): 1NF to BCNF proofs, B-tree and composite index strategy |
| 4 | Relational Implementation | 5 | `database/sql/schema.sql` and [`backend/app/models/sql_models.py`](backend/app/models/sql_models.py), with automatic SQLite local failover |
| 5 | DML Operations | 5 | [`database/sql/dml-examples.sql`](database/sql/dml-examples.sql): CRUD, multi-table JOINs, transaction rollback with SAVEPOINTs |
| 6 | Advanced SQL | 6 | [`advanced-concepts.sql`](database/sql/advanced-concepts.sql) and [`advanced-queries.sql`](database/sql/advanced-queries.sql): `sp_create_investigation_case`, `fn_get_case_summary`, `trg_case_activity_audit`, recursive CTE |
| 7 | NoSQL Implementation | 5 | [`database/mongodb/`](database/mongodb): schema validator, indexes, RUD examples, sample documents, text and vector search design |
| 8 | Technology Justification | 3 | [`docs/technology-justification.md`](docs/technology-justification.md): ACID RDBMS vs flexible-schema NoSQL |
| 9 | Authorization and Access Control | 3 | [`docs/authorization.md`](docs/authorization.md) and [`roles-and-grants.sql`](database/sql/roles-and-grants.sql): DB roles (`ifp_admin`, `ifp_investigator`) plus JWT middleware |
| 10 | User Interface | 5 | [`frontend/`](frontend): 16 modules, interactive graph, unified search, forms |
| 11 | System Architecture and Integration | 3 | Unified REST architecture, Docker Compose, cross-database federation |
| 12 | Documentation and Repository Quality | 3 | Markdown reports, clean directory layout, repeatable seeder |
| 13 | Viva and Demonstration Preparation | 3 | [`docs/viva-preparation.md`](docs/viva-preparation.md): 5-minute walkthrough and 30 viva Q&As |
| 14 | Team Contributions | Mandatory | [`docs/team-contributions.md`](docs/team-contributions.md): 50/50 split between both members |
| | **Total** | **50** | |

## 4. Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- Optional: PostgreSQL on `localhost:5432`, MongoDB on `localhost:27017`, Docker

Copy `.env.example` to `.env` and adjust values if you are not using the defaults.

### Option A: One-command startup (recommended)

The root script checks prerequisites, creates the Python virtual environment, installs dependencies, probes the databases, starts the backend (`:8000`) and frontend (`:3000`), runs health checks, and opens the browser.

**Windows (PowerShell)**

```powershell
.\start.ps1
```

**macOS / Linux**

```bash
chmod +x start.sh
./start.sh
```

**Options**

| PowerShell | Bash | Description |
|---|---|---|
| *(none)* | *(none)* | Full launch of backend and frontend, then opens the browser |
| `-Test` | `--test` | Runs the 10-test `pytest` suite and exits |
| `-NoBrowser` | `--no-browser` | Starts services without opening a browser |
| `-Seed` | `--seed` | Forces re-seeding (`--force`) even if records exist |
| `-FrontendMode vite` | `--frontend vite` | Uses Vite on port `5173` instead of Next.js on `3000` |
| `-Help` | `--help` | Shows usage |

```powershell
.\start.ps1 -Test         # run the verification suite
.\start.ps1 -NoBrowser    # presentation mode, no auto-open
.\start.ps1 -Seed         # re-seed demo data
```

**What the startup script handles for you**

1. **Prerequisite checks.** Verifies Python, Node.js and npm, and creates `venv/` if missing.
2. **Non-destructive seeding.** Skips seeding when SQL or MongoDB already hold records, so nothing is duplicated or overwritten.
3. **Database failover.** If PostgreSQL is unreachable, SQL falls back to local SQLite (`intelligence_fusion.db`) with the same schema, indexes and constraints. If MongoDB is installed locally it is launched automatically; if it is offline, the API reports that to the client while SQL features keep working.
4. **Port and health checks.** Inspects ports 8000, 3000 and 5173, and waits for `/health` and the frontend to respond before opening the browser.
5. **Clean shutdown.** `Ctrl+C` stops all spawned processes without leaving orphaned ports.

### Option B: Docker Compose

```bash
docker-compose up -d --build
```

This starts PostgreSQL, MongoDB, the backend and the frontend together.

### Option C: Manual startup

**Terminal 1: backend and seeding**

```powershell
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
$env:PYTHONPATH="backend"
python backend/seed.py
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

```bash
# macOS / Linux
source venv/bin/activate
pip install -r backend/requirements.txt
export PYTHONPATH=backend
python backend/seed.py
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

API docs: http://127.0.0.1:8000/docs

**Terminal 2: frontend**

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:3000 (or http://localhost:5173 with `npm run dev:vite`)

**Terminal 3: tests**

```bash
# PowerShell: $env:PYTHONPATH="backend"
export PYTHONPATH=backend
pytest backend/tests/test_api.py -v
```

## 5. Demonstration Modules

1. **Executive Dashboard.** KPI cards, status charts, priority breakdowns, recent activity timeline and quick-action modals.
2. **360-Degree Case Management.** Case inspector showing the lead investigator, linked suspects, seized vehicles and devices, evidence exhibits, and MongoDB documents in one view.
3. **Cross-Database Unified Search.** Searching for `blue sedan` or `crypto` returns relational and MongoDB results together, ranked by relevance.
4. **Relationship Network Graph.** Interactive node-link graph of multi-entity connections and associates.
5. **DBMS Concepts Sandbox.** Live execution of:
   - 3-way relational JOINs
   - Many-to-many bridge table lookups
   - `GROUP BY` and `HAVING` aggregations
   - Evidence custody audit logs
   - MongoDB `$group` aggregation pipelines
   - Recursive CTE for multi-hop suspect network discovery
   - Window function (`DENSE_RANK() OVER (...)`)
   - Correlated subquery filtering
   - Trigger-based audit trail demonstration

## 6. Security and Demo Credentials

Access control is two-tier RBAC. Protected frontend routes redirect unauthenticated visitors to `/login`.

| Role | Username (badge) | Password | Scope |
|---|---|---|---|
| ADMIN | `admin` (`CID-001`) | `Admin@123` | Full administration, officer management, audit review, policy configuration |
| INVESTIGATOR | `investigator` (`CID-002`) | `Investigator@123` | Case management, suspect linking, evidence custody logging, document ingestion |

> These are seeded **demo credentials for local evaluation only**. Change them and set a fresh JWT secret in `.env` before any real deployment.

- **Password hashing:** PBKDF2-HMAC-SHA256, 100,000 iterations
- **Sessions:** JSON Web Tokens signed with `HS256`
- **Logout:** header and sidebar buttons clear the local session token and redirect to `/login`

## 7. Submission PDFs

All eight evaluation deliverables are in `docs/submission/`.

| Doc | File | Topic | Marks |
|---|---|---|:---:|
| 1 | [`01_ER_Diagram.pdf`](docs/submission/01_ER_Diagram.pdf) | Conceptual and physical ER model | 2 |
| 2 | [`02_Relational_Schema_and_DDL.pdf`](docs/submission/02_Relational_Schema_and_DDL.pdf) | DDL, constraints, indexes, 3NF/BCNF proofs | 7 |
| 3 | [`03_SQL_Operations_and_Queries.pdf`](docs/submission/03_SQL_Operations_and_Queries.pdf) | DML, joins, subqueries, rollback and savepoints | 8 |
| 4 | [`04_Advanced_Database_Concepts.pdf`](docs/submission/04_Advanced_Database_Concepts.pdf) | Procedures, functions, audit triggers, recursive CTE | 6 |
| 5 | [`05_NoSQL_and_Integration.pdf`](docs/submission/05_NoSQL_and_Integration.pdf) | MongoDB validation, weighted text search, aggregations | 12 |
| 6 | [`06_Project_Report.pdf`](docs/submission/06_Project_Report.pdf) | Abstract, architecture, security, verification | 4 |
| 7 | [`07_Rubric_Coverage_and_Viva.pdf`](docs/submission/07_Rubric_Coverage_and_Viva.pdf) | Rubric matrix, demo walkthrough, viva Q&A | 7 |
| 8 | [`08_Setup_API_and_Testing_Guide.pdf`](docs/submission/08_Setup_API_and_Testing_Guide.pdf) | Setup, commands, tests, REST API directory | 4 |

To regenerate all eight PDFs:

```bash
python scripts/generate_submission_pdfs.py
```

## 8. Project Structure

```text
DBMS_Mini_Project/
├── backend/                         # FastAPI backend
│   ├── app/
│   │   ├── core/                    # Config, PBKDF2 and JWT security
│   │   ├── db/                      # PostgreSQL and MongoDB connection managers
│   │   ├── models/                  # SQLAlchemy ORM models (22 tables)
│   │   ├── routers/                 # 16 REST route controllers
│   │   └── schemas/                 # Pydantic schemas
│   ├── seed.py                      # Repeatable seeder (22 evidence, 8 cases, 15 people)
│   └── tests/                       # Pytest suite (10 tests)
├── database/
│   ├── sql/
│   │   ├── schema.sql               # 22-table DDL with constraints and indexes
│   │   ├── dml-examples.sql         # CRUD, JOINs, savepoints, rollback
│   │   ├── advanced-queries.sql     # Complex JOINs, subqueries, window functions
│   │   ├── advanced-concepts.sql    # Procedure, function, trigger, CTE
│   │   └── roles-and-grants.sql     # Database-level RBAC
│   └── mongodb/
│       ├── collection-schema.json   # JSON Schema validator
│       ├── indexes.js               # Weighted text and compound indexes
│       ├── rud-examples.js          # Aggregations, updates, text search
│       ├── sample-documents.json    # 26 polymorphic investigation documents
│       └── README.md                # Document design guide
├── docs/
│   ├── submission/                  # 8 official PDF deliverables
│   ├── rubric-compliance.md         # 14-component compliance matrix
│   ├── er-diagram.md                # Mermaid ER diagram
│   ├── database-design.md           # Normalization proofs and indexes
│   ├── technology-justification.md  # RDBMS vs NoSQL analysis
│   ├── authorization.md             # Application and database RBAC spec
│   ├── team-contributions.md        # Contribution attribution
│   └── viva-preparation.md          # 5-minute walkthrough and 30 viva Q&As
├── frontend/                        # Next.js 15+ / React 19 frontend
│   ├── app/                         # App Router entrypoints and layouts
│   ├── src/views/                   # 16 intelligence modules
│   └── package.json
├── scripts/
│   └── generate_submission_pdfs.py  # ReportLab generator for the 8 PDFs
├── .env.example
├── docker-compose.yml               # Multi-container orchestration
├── start.ps1                        # Windows startup script
├── start.sh                         # macOS / Linux startup script
└── README.md
```

## 9. Academic Integrity Declaration

This project was conceived, designed, developed and tested collaboratively by **Saatvik Gupta (PES1UG24CS395)** and **Satyam Goyal (PES1UG24CS424)** for the Database Management Systems course at PES University. All rights reserved.
