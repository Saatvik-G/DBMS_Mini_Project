# Intelligence Fusion Platform — Team Contributions & Attribution

**Course:** Database Management Systems Mini Project (UE24CS395/DBMS)  
**Academic Year:** 2026–2027  
**Department:** Department of Computer Science & Engineering, PES University  

---

## Team Members & Registration Details

| Member Name | SRN / Student ID | Role / Specialization | Contact Email |
|-------------|-------------------|-----------------------|---------------|
| **Saatvik Gupta** | **PES1UG24CS395** | Full-Stack Architect, Relational Schema & Advanced SQL Lead | saatvik.gupta@pesu.pes.edu |
| **Satyam Goyal** | **PES1UG24CS424** | Polyglot Storage Engineer, NoSQL Document Design & RBAC Lead | satyam.goyal@pesu.pes.edu |

---

## Detailed Technical Contributions Breakdown

Both team members contributed equally (50% / 50%) across all design, implementation, testing, and documentation phases.

### 1. Saatvik Gupta (PES1UG24CS395)
- **Relational Data Modeling:** Designed the 22-table normalized relational schema (11 primary entities + 11 bridge junction tables) in 3NF and BCNF.
- **PostgreSQL DDL & Constraints:** Authored [`database/sql/schema.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/schema.sql) with primary keys, composite keys, check constraints, foreign keys with cascade rules, and B-tree/composite indexes.
- **Advanced SQL Implementation:**
  - Stored Procedure: `sp_create_investigation_case` for atomic transaction management.
  - SQL User-Defined Function: `fn_get_case_summary` returning formatted JSON metrics.
  - Audit Trigger: `trg_case_activity_audit` for automatic state logging.
  - Recursive Common Table Expressions (CTE) for multi-hop graph and suspect network traversal.
- **Frontend Architecture:** Migrated and developed the Next.js 14+ / React 19 application in [`frontend/`](file:///d:/DBMS%20Mini%20Project/frontend/), implementing the dark navy intelligence theme, responsive sidebar, KPI cards, Recharts analytical dashboards, and relationship visual graph.
- **ER Diagram & Documentation:** Authored [`docs/er-diagram.md`](file:///d:/DBMS%20Mini%20Project/docs/er-diagram.md) and [`docs/database-design.md`](file:///d:/DBMS%20Mini%20Project/docs/database-design.md).

### 2. Satyam Goyal (PES1UG24CS424)
- **NoSQL Document Architecture:** Formulated the flexible document model for 9 heterogeneous intelligence document types (witness statements, CCTV logs, mobile extractions, forensic reports).
- **MongoDB Engineering:**
  - Authored JSON Schema validator in [`database/mongodb/collection-schema.json`](file:///d:/DBMS%20Mini%20Project/database/mongodb/collection-schema.json).
  - Designed weighted full-text search indexes (`idx_text_search_doc_content`) and compound indexes in [`database/mongodb/indexes.js`](file:///d:/DBMS%20Mini%20Project/database/mongodb/indexes.js).
  - Authored aggregation pipelines, updates, and deletes in [`database/mongodb/rud-examples.js`](file:///d:/DBMS%20Mini%20Project/database/mongodb/rud-examples.js).
- **Polyglot Integration & Search:** Built the cross-database hybrid search engine (`backend/app/routers/search.py`) uniting PostgreSQL entities with MongoDB unstructured documents.
- **Authorization & Access Control (RBAC):**
  - Designed the two-tier security model in [`docs/authorization.md`](file:///d:/DBMS%20Mini%20Project/docs/authorization.md).
  - Wrote PostgreSQL role scripts in [`database/sql/roles-and-grants.sql`](file:///d:/DBMS%20Mini%20Project/database/sql/roles-and-grants.sql) (`ifp_admin` and `ifp_investigator`).
  - Implemented JWT token verification and role dependency injection in FastAPI.
- **Test Automation & Viva Preparation:** Authored test cases in [`backend/tests/test_api.py`](file:///d:/DBMS%20Mini%20Project/backend/tests/test_api.py) and viva technical questions in [`docs/viva-preparation.md`](file:///d:/DBMS%20Mini%20Project/docs/viva-preparation.md).

---

## Contribution Matrix by Rubric Component

| Rubric Component | Saatvik Gupta (PES1UG24CS395) | Satyam Goyal (PES1UG24CS424) |
|------------------|-------------------------------|------------------------------|
| **1. ER Diagram** | Lead (Mermaid syntax, entities, junctions) | Review & MongoDB polyglot linkage |
| **2. Relational Schema & Keys** | Lead (PostgreSQL DDL, FKs, CHECKs) | Co-Author (Junction relationships) |
| **3. Data Integrity & Normalization** | Lead (3NF/BCNF proofs, composite indexes) | Co-Author (Partial indexes & review) |
| **4. Relational Implementation** | Lead (FastAPI SQLAlchemy integration) | Verification & SQLite/Postgres fallback |
| **5. DML Operations** | Lead (Transactions, SAVEPOINTs, Rollbacks) | Co-Author (DML queries & audit logs) |
| **6. Advanced SQL (Procedures, Triggers, CTEs)** | Lead (PL/pgSQL stored logic, Recursive CTE) | Co-Author (Window analytical queries) |
| **7. NoSQL Database Implementation** | Co-Author (Polyglot endpoints) | Lead (MongoDB schema, indexes, pipelines) |
| **8. Technology Justification** | Co-Author (RDBMS justification) | Lead (NoSQL & Polyglot comparison) |
| **9. Authorization & Access Control** | Co-Author (Frontend role gates) | Lead (Database roles, grants & JWT RBAC) |
| **10. User Interface (Next.js)** | Lead (Next.js layout, components, graph) | Co-Author (Forms, search UI, demo views) |
| **11. System Architecture** | Co-Author (FastAPI routers) | Lead (Docker Compose, Polyglot integration) |
| **12. Project Documentation** | Lead (Report, DDL docs, README) | Co-Author (API docs, seed verification) |
| **13. Viva Preparation** | Lead (SQL & Relational Viva Q&A) | Lead (NoSQL & Architecture Viva Q&A) |
| **14. Team Contributions** | Equal Participation (50%) | Equal Participation (50%) |

---

## Academic Honesty Declaration

We hereby declare that this mini project titled **"Intelligence Fusion Platform"** is our original collective work conducted under the academic guidelines of PES University for the Database Management Systems course. All database schemas, queries, API services, and user interfaces were developed collaboratively by us without plagiarism or unauthorized copying.
