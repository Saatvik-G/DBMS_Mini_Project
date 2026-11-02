# Intelligence Fusion Platform — Rubric Compliance & Evidence Mapping

**Course:** Database Management Systems Mini Project (UE24CS395/DBMS)  
**Project Title:** Intelligence Fusion Platform (Polyglot Law Enforcement Investigation System)  
**Evaluation Model:** Official 14-Component Evaluation Matrix (50 Marks)  
**Institution:** PES University (2026–2027)  

### Team Members
1. **Saatvik Gupta** — `PES1UG24CS395` (Backend & Database Architecture, Relational Modeling, Procedural SQL, REST APIs, Frontend UI Overhaul)
2. **Satyam Goyal** — `PES1UG24CS424` (NoSQL Modeling, MongoDB Schema & Vector Search, Authorization RBAC, Testing Scenarios, Academic Documentation)

---

## 1. Official 14-Component Evaluation Matrix & Evidence Mapping

| # | Official Evaluation Component | Max Marks | Status | Primary Code / Documentation Artifact | Submission Deliverable PDF |
|:---:|:---|:---:|:---:|:---|:---|
| **1** | **ER diagram** | 2 | Complete | [`docs/er-diagram.md`](er-diagram.md) & [`docs/diagrams/`](diagrams/) — 16 Drawn Vector SVGs & 300 DPI PNGs (Chen notation overview + clusters, Crow's foot schema, MongoDB polyglot model, process flowcharts). | [`01_ER_Diagram.pdf`](submission/01_ER_Diagram.pdf) |
| **2** | **Relational schema with keys, relationships, and constraints** | 3 | Complete | [`docs/database-design.md`](database-design.md) — Relation table for all 22 tables with PKs, FKs, CHECKs, UNIQUEs, NOT NULLs, defaults, and formal 1NF/2NF/3NF/BCNF proofs. | [`02_Relational_Schema.pdf`](submission/02_Relational_Schema.pdf) |
| **3** | **SQL database implementation - DDL with constraints** | 4 | Complete | [`database/sql/schema.sql`](../database/sql/schema.sql) & [`backend/app/models/sql_models.py`](../backend/app/models/sql_models.py) — DDL with CASCADE/RESTRICT rules, 17 performance indexes. | [`03_SQL_DDL_Implementation.pdf`](submission/03_SQL_DDL_Implementation.pdf) |
| **4** | **NoSQL/Vector database creation** | 4 | Complete | [`database/mongodb/collection-schema.json`](../database/mongodb/collection-schema.json), [`database/mongodb/indexes.js`](../database/mongodb/indexes.js), [`database/mongodb/sample-documents.json`](../database/mongodb/sample-documents.json) — `$jsonSchema`, 64-dim vector design, text & compound indexes, 26 docs. | [`04_NoSQL_Vector_Database_Creation.pdf`](submission/04_NoSQL_Vector_Database_Creation.pdf) |
| **5** | **Technology justification** | 1 | Complete | [`docs/technology-justification.md`](technology-justification.md) — Concise 2-page architectural analysis: PostgreSQL ACID vs MongoDB polymorphism vs FastAPI/Next.js. | [`05_Technology_Justification.pdf`](submission/05_Technology_Justification.pdf) |
| **6** | **DML operations** | 4 | Complete | [`database/sql/dml-examples.sql`](../database/sql/dml-examples.sql) — CRUD statements with outputs, plus transaction with COMMIT, ROLLBACK and SAVEPOINT. | [`06_DML_Operations.pdf`](submission/06_DML_Operations.pdf) |
| **7** | **Nested/correlated/recursive queries, JOIN SQL queries** | 4 | Complete | [`database/sql/advanced-queries.sql`](../database/sql/advanced-queries.sql) — Multi-table JOINs, nested subqueries, correlated subqueries (`EXISTS`), and recursive CTEs with output. | [`07_Queries_Nested_Correlated_Recursive_Joins.pdf`](submission/07_Queries_Nested_Correlated_Recursive_Joins.pdf) |
| **8** | **Advanced SQL concepts: procedure/function, trigger, CTE** | 6 | Complete | [`database/sql/advanced-concepts.sql`](../database/sql/advanced-concepts.sql) — Stored Procedure `sp_create_investigation_case`, Function `fn_get_case_summary`, Trigger `trg_case_activity_audit`, and Recursive CTE with before/after output. | [`08_Advanced_SQL_Procedure_Function_Trigger_CTE.pdf`](submission/08_Advanced_SQL_Procedure_Function_Trigger_CTE.pdf) |
| **9** | **NoSQL/Vector feature, RUD** | 7 | Complete | [`database/mongodb/rud-examples.js`](../database/mongodb/rud-examples.js), [`scripts/test_vector_search.py`](../scripts/test_vector_search.py), [`backend/app/routers/search.py`](../backend/app/routers/search.py) — 64-dim vector cosine similarity search (`GET /api/search/semantic`), text search, and aggregations. | [`09_NoSQL_Vector_Features_and_RUD.pdf`](submission/09_NoSQL_Vector_Features_and_RUD.pdf) |
| **10** | **Next.js interface** | 3 | Complete | [`frontend/`](../frontend/) — Next.js 15 App Router SPA in TypeScript (18/18 static pages generated cleanly). Dark graphite forensic workstation (`#070A0F`), 4px rounded corners, dense tables. | Covered in [`11_Project_Report.pdf`](submission/11_Project_Report.pdf) |
| **11** | **Backend/API and database integration** | 2 | Complete | [`backend/app/`](../backend/app/) — FastAPI asynchronous gateway, cross-database federated search, interactive Swagger documentation (`/docs`), robust error handling. | Covered in [`11_Project_Report.pdf`](submission/11_Project_Report.pdf) |
| **12** | **Authentication (frontend + 2 roles + DB-level RBAC)** | 4 | Complete | [`backend/app/routers/auth.py`](../backend/app/routers/auth.py), [`database/sql/roles-and-grants.sql`](../database/sql/roles-and-grants.sql), [`scripts/demonstrate_db_rbac.py`](../scripts/demonstrate_db_rbac.py) — JWT login, route guards, 403 checks, and PostgreSQL roles (`ifp_admin`, `ifp_investigator`). | [`10_Authentication_and_RBAC.pdf`](submission/10_Authentication_and_RBAC.pdf) |
| **13** | **Documentation, Git/GitHub** | 2 | Complete | [`README.md`](../README.md), [`.gitignore`](../.gitignore), clean repository root, clear setup instructions, and verified startup scripts (`start.ps1`, `start.sh`). | Covered in [`11_Project_Report.pdf`](submission/11_Project_Report.pdf) |
| **14** | **Originality, individual contribution, modification/viva** | 4 | Complete | [`docs/modifications.md`](modifications.md), [`docs/viva-preparation.md`](viva-preparation.md), [`docs/team-contributions.md`](team-contributions.md) — 5 major original extensions, 5-min viva walkthrough, 7 core technical viva proofs. | Covered in [`11_Project_Report.pdf`](submission/11_Project_Report.pdf) |
| **TOTAL** | **Official University Evaluation Matrix** | **50** | **Complete** | **All 14 components fully backed by code, tests, DDL, live services, and dedicated academic PDF deliverables.** | **11 Separate Submission PDFs** |

---

## 2. Independent Grader Verification Steps

```powershell
# 1. Run the automated test suite (12/12 tests passing)
.\start.ps1 -Test

# 2. Run the Vector Similarity Search verification script
python scripts/test_vector_search.py

# 3. Run the Dual-Layer RBAC demonstration harness
python scripts/demonstrate_db_rbac.py

# 4. Regenerate all 11 official academic submission PDFs
python scripts/generate_submission_pdfs.py

# 5. Launch full application (backend on :8000, frontend on :3000)
.\start.ps1 -Restart
```
