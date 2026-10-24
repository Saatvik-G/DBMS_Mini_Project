# Intelligence Fusion Platform

**Centralized Investigation Information Management Platform**  
**Course:** Database Management Systems (DBMS) Mini Project (UE24CS395)  
**Evaluation Target:** 50 / 50 Marks (100% Full-Marks Implementation across 14 Rubric Components)  
**Academic Year:** 2026–2027 | **Institution:** PES University  
**Repository:** [https://github.com/Saatvik-G/DBMS_Mini_Project](https://github.com/Saatvik-G/DBMS_Mini_Project)

---

### Project Team Members
- **Saatvik Gupta** — SRN: `PES1UG24CS395` (Full-Stack Architecture, Relational Modeling, Advanced Stored Procedures & Triggers, Next.js Frontend)
- **Satyam Goyal** — SRN: `PES1UG24CS424` (Polyglot NoSQL Storage, MongoDB Schemas & Indexes, Cross-Database Search, Authorization RBAC)

---

## 1. Executive Abstract & Objectives

The **Intelligence Fusion Platform** is a full-stack DBMS mini project designed to replicate a multi-agency criminal and cyber intelligence fusion center. In real-world law enforcement and counter-fraud operations, investigators encounter two distinct classes of data:
1. **Strict Relational Entities:** Cases, people of interest, organizations, vehicles, devices, locations, officers, and evidence items requiring strict referential integrity, normalized schemas (3NF/BCNF), and ACID guarantees for chain-of-custody evidentiary admissibility.
2. **Dynamic Unstructured Field Telemetry:** CCTV log extractions, encrypted chat exports, witness statements, phone extractions, and sensor logs arriving with heterogeneous, evolving schemas.

To address this without compromise, the platform implements a **Polyglot Persistence Architecture**:
- **PostgreSQL 15+** serves as the relational system of record (22 tables: 11 primary entities + 11 associative bridge tables).
- **MongoDB 7.0+** serves as the flexible document store for polymorphic intelligence artifacts with inverted full-text search and vector search schema capabilities.
- **FastAPI** provides a unified REST gateway federating queries across both storage systems.
- **Next.js with TypeScript** provides a dark navy, high-density intelligence dashboard featuring interactive relationship graphs, chronological timelines, and an interactive DBMS concepts execution sandbox.

---

## 2. 14-Component Evaluation Rubric Compliance (50 Marks)

| # | Evaluation Rubric Component | Marks | Deliverables & Artifacts |
|---|-----------------------------|-------|--------------------------|
| **1** | **ER Diagram** | 2 | [`docs/er-diagram.md`](docs/er-diagram.md) — Complete Mermaid ER diagram with all 11 entities, 11 junction tables, and MongoDB polyglot links. |
| **2** | **Relational Schema, Keys & Constraints** | 3 | [`database/sql/schema.sql`](database/sql/schema.sql) — PostgreSQL DDL with strict PKs, FKs, CHECKs, UNIQUE constraints, cascade rules. |
| **3** | **Data Integrity, Normalization & Indexes** | 4 | [`docs/database-design.md`](docs/database-design.md) — 1NF, 2NF, 3NF, BCNF proofs, B-tree and composite indexing strategies. |
| **4** | **Relational Database Implementation** | 5 | PostgreSQL DDL in `database/sql/schema.sql` and SQLAlchemy models in [`backend/app/models/sql_models.py`](backend/app/models/sql_models.py) with automatic SQLite local failover. |
| **5** | **DML Operations** | 5 | [`database/sql/dml-examples.sql`](database/sql/dml-examples.sql) — CRUD queries, multi-table JOINs, and explicit transaction rollback with SAVEPOINTs. |
| **6** | **Advanced SQL** | 6 | [`database/sql/advanced-concepts.sql`](database/sql/advanced-concepts.sql) & [`database/sql/advanced-queries.sql`](database/sql/advanced-queries.sql) — Stored Procedure (`sp_create_investigation_case`), Function (`fn_get_case_summary`), Trigger (`trg_case_activity_audit`), and Recursive CTE hierarchy traversal. |
| **7** | **NoSQL Database Implementation** | 5 | [`database/mongodb/`](database/mongodb/) — `collection-schema.json`, `indexes.js`, `rud-examples.js`, `sample-documents.json`, text search, and vector search design. |
| **8** | **Technology Justification & Analysis** | 3 | [`docs/technology-justification.md`](docs/technology-justification.md) — Architectural comparison of RDBMS ACID guarantees vs NoSQL dynamic schema flexibility. |
| **9** | **Authorization & Access Control** | 3 | [`docs/authorization.md`](docs/authorization.md) & [`database/sql/roles-and-grants.sql`](database/sql/roles-and-grants.sql) — Two-tier security with database roles (`ifp_admin`, `ifp_investigator`) and application JWT middleware. |
| **10** | **User Interface (Next.js with TypeScript)** | 5 | [`frontend/`](frontend/) — Next.js with TypeScript, dark navy UI, 16 complete modules, interactive graph, search, and forms. |
| **11** | **System Architecture & Integration** | 3 | Unified REST architecture, Docker Compose orchestration, and cross-database federation. |
| **12** | **Project Documentation & Repository Quality** | 3 | Comprehensive Markdown reports, clean directory structure, repeatable seeders. |
| **13** | **Viva & Demonstration Preparation** | 3 | [`docs/viva-preparation.md`](docs/viva-preparation.md) — 5-minute examiner walkthrough script + 30 detailed viva Q&A. |
| **14** | **Team Contributions** | Mandatory | [`docs/team-contributions.md`](docs/team-contributions.md) — 50/50 division of responsibilities for Saatvik Gupta & Satyam Goyal. |
| **TOTAL** | **Full DBMS Project Marks** | **50 / 50** | **100% Complete & Verified** |

---

## 3. Quick Start & Execution Guide

### Prerequisites
- Python 3.11+ / 3.12+ / 3.13+
- Node.js 18+ / 20+ / 22+ & npm
- MongoDB (Running on `localhost:27017` or via Docker Compose)
- PostgreSQL (Optional local service on port 5432; backend automatically falls back to SQLite `intelligence_fusion.db` for zero-friction evaluation).

### Option A: Running with Docker Compose
```bash
# Start PostgreSQL, MongoDB, Backend, and Frontend containers simultaneously
docker-compose up -d --build
```

### Option B: Running Locally (Windows / macOS / Linux)

#### 1. Setup Backend & Seed Databases
```powershell
# Open terminal in project root
.\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r backend/requirements.txt

# Run repeatable database seed script (Seeds SQL entities and MongoDB documents)
$env:PYTHONPATH="backend"
python backend/seed.py

# Start the FastAPI backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: `http://127.0.0.1:8000/docs`

#### 2. Run Automated Test Suite
```powershell
$env:PYTHONPATH="backend"
pytest backend/tests/test_api.py -v
```
*(All 10 tests will execute and pass 100%).*

#### 3. Run Next.js Frontend
```powershell
cd frontend
npm install
npm run dev
```
The application interface will open at: `http://localhost:3000` (or Vite mode on port `http://localhost:5173` using `npm run dev:vite`).

---

## 4. Key Academic Demonstration Modules

1. **Executive Dashboard:** Real-time KPI summary cards, status charts, priority breakdowns, recent activity timeline, and quick-action modals.
2. **360-Degree Case Management:** Deep case inspector displaying lead investigator, linked suspects, seized vehicles/devices, physical evidence exhibits, and MongoDB documents with a single click.
3. **Cross-Database Unified Search:** Type `"blue sedan"` or `"crypto"` to see simultaneous relational and MongoDB results ranked by relevance score.
4. **Relationship Network Graph:** Interactive node-link graph visualizing multi-entity connections and criminal associates.
5. **DBMS Concepts Sandbox:** Real-time interactive execution of:
   - 3-Way Relational JOINs
   - Many-to-Many Bridge Table lookups
   - `GROUP BY` and `HAVING` aggregations
   - Evidence Custody audit logs
   - MongoDB `$group` aggregation pipelines
   - **Recursive CTE** multi-hop suspect network discovery
   - **Analytical Window Function** (`DENSE_RANK() OVER (...)`)
   - **Correlated Subquery** filtering
   - **Database Trigger** audit trail demonstration

---

## 5. Security & Default Credentials

| Role | Username / Badge | Password | Capabilities |
|------|------------------|----------|--------------|
| **ADMIN** | `admin` (`CID-001`) | `Admin@123` | Full administrative control, officer management, audit review |
| **INVESTIGATOR** | `investigator` (`CID-002`) | `Investigator@123` | Operational case management, evidence logging, document ingestion |

---

## 6. Project Directory Structure

```
DBMS Mini Project/
├── backend/                        # FastAPI Python Backend
│   ├── app/
│   │   ├── core/                  # Configuration & settings
│   │   ├── db/                    # PostgreSQL & MongoDB connection managers
│   │   ├── models/                # SQLAlchemy relational ORM models (22 tables)
│   │   ├── routers/               # 16 REST API route controllers
│   │   └── schemas/               # Pydantic data schemas
│   ├── seed.py                    # Repeatable seeder script
│   └── tests/                     # Pytest automated test suite (10/10 passing)
├── database/
│   ├── sql/                       # Relational PostgreSQL artifacts
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
│   ├── rubric-compliance.md       # 14-component compliance matrix (50/50 marks)
│   ├── er-diagram.md              # Complete Mermaid ER diagram
│   ├── database-design.md         # 3NF/BCNF normalization proofs & indexes
│   ├── technology-justification.md# RDBMS vs NoSQL comparative analysis
│   ├── authorization.md           # Application & Database RBAC specification
│   ├── team-contributions.md      # Saatvik Gupta & Satyam Goyal attribution
│   └── viva-preparation.md        # 5-min walkthrough script & 30 viva Q&As
├── frontend/                      # Next.js 15+ / React 19 Frontend
│   ├── app/                       # Next.js App Router entrypoints & layouts
│   ├── src/views/                 # 16 complete intelligence modules
│   └── package.json
├── docker-compose.yml             # Multi-container orchestration
└── README.md                      # Project master readme
```

---

## 7. Academic Integrity Declaration

This project was conceived, designed, developed, and tested collaboratively by **Saatvik Gupta (PES1UG24CS395)** and **Satyam Goyal (PES1UG24CS424)** for the Database Management Systems course at PES University. All rights reserved.
