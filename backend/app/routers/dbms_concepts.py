import time
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db, ACTIVE_SQL_ENGINE
from app.db.mongo import get_mongo_db

router = APIRouter(prefix="/dbms-concepts", tags=["DBMS Concepts Demonstration"])

PREDEFINED_QUERIES = {
    "q1_three_way_join": {
        "title": "3-Table Relational Join (Cases + Officers + Evidence)",
        "concept": "Multi-table INNER JOIN preserving referential integrity via foreign keys (cases.lead_officer_id -> officers.officer_id, evidence.case_id -> cases.case_id).",
        "type": "SQL",
        "sql": """SELECT 
    c.case_id, 
    c.title AS case_title, 
    c.status, 
    o.full_name AS lead_officer, 
    o.badge_number,
    e.evidence_id, 
    e.title AS evidence_title, 
    e.evidence_type
FROM cases c
JOIN officers o ON c.lead_officer_id = o.officer_id
JOIN evidence e ON e.case_id = c.case_id
ORDER BY c.case_id ASC
LIMIT 8;"""
    },
    "q2_junction_m2m": {
        "title": "Many-to-Many Association via Junction Table (case_people)",
        "concept": "Demonstrates 3NF decomposition where Many-to-Many relationship between cases and people is decoupled into the case_people bridge table.",
        "type": "SQL",
        "sql": """SELECT 
    c.case_id, 
    c.title AS case_title, 
    p.person_id, 
    p.full_name, 
    p.category, 
    cp.role_in_case, 
    cp.added_at
FROM case_people cp
JOIN cases c ON cp.case_id = c.case_id
JOIN people p ON cp.person_id = p.person_id
ORDER BY c.case_id ASC
LIMIT 10;"""
    },
    "q3_group_by_having": {
        "title": "Aggregate Analysis with GROUP BY & HAVING",
        "concept": "Demonstrates aggregate functions (COUNT) combined with GROUP BY and relational filtering (HAVING count >= 1) to identify investigators managing multiple open files.",
        "type": "SQL",
        "sql": """SELECT 
    o.officer_id, 
    o.full_name, 
    o.department, 
    COUNT(c.case_id) AS total_assigned_cases
FROM officers o
JOIN cases c ON o.officer_id = c.lead_officer_id
GROUP BY o.officer_id, o.full_name, o.department
HAVING COUNT(c.case_id) >= 1
ORDER BY total_assigned_cases DESC;"""
    },
    "q4_custody_audit": {
        "title": "Audit Trail & Custody Chain (1:N Sub-table)",
        "concept": "Temporal audit tracking demonstrating chronological history table (evidence_custody) maintaining sequential chain of custody without mutating the primary evidence row.",
        "type": "SQL",
        "sql": """SELECT 
    ec.custody_event_id, 
    e.evidence_id, 
    e.title AS item_name, 
    o.full_name AS handled_by_officer, 
    ec.event_type, 
    ec.event_timestamp, 
    ec.notes
FROM evidence_custody ec
JOIN evidence e ON ec.evidence_id = e.evidence_id
JOIN officers o ON ec.officer_id = o.officer_id
ORDER BY ec.event_timestamp DESC
LIMIT 10;"""
    },
    "q5_mongo_aggregation": {
        "title": "MongoDB Document Aggregation Pipeline ($group, $sort)",
        "concept": "Demonstrates flexible schema processing in NoSQL. Documents contain dynamic JSON metadata fields that can be aggregated across heterogenous schemas without rigid DDL migrations.",
        "type": "MongoDB",
        "pipeline": [
            {"$group": {"_id": "$document_type", "total_docs": {"$sum": 1}, "sources": {"$addToSet": "$source_type"}}},
            {"$sort": {"total_docs": -1}}
        ]
    },
    "q6_cross_database_fusion": {
        "title": "Cross-Database Fusion (SQL Case Context + MongoDB Document Store)",
        "concept": "Core project architectural innovation: Relational DB acts as strict system of record for entities, while MongoDB stores polymorphic unstructured field documents referencing SQL foreign keys.",
        "type": "Hybrid",
        "description": "Executes SQL query for CASE-2026-001, then seamlessly joins unstructured field documents from MongoDB by case_id."
    },
    "q7_recursive_cte": {
        "title": "Recursive CTE: Multi-Hop Criminal Associate Network",
        "concept": "Demonstrates SQL Turing-complete graph traversal using WITH RECURSIVE. Recursively discovers 2nd-degree associates co-occurring across investigation files.",
        "type": "SQL",
        "sql": """WITH RECURSIVE PersonNetwork AS (
    SELECT cp.person_id AS source_id, cp.person_id AS target_id, cp.case_id, 0 AS depth
    FROM case_people cp
    WHERE cp.person_id = 'PER-001'
    
    UNION
    
    SELECT pn.source_id, next_cp.person_id AS target_id, next_cp.case_id, pn.depth + 1
    FROM PersonNetwork pn
    JOIN case_people curr_cp ON pn.target_id = curr_cp.person_id
    JOIN case_people next_cp ON curr_cp.case_id = next_cp.case_id
    WHERE next_cp.person_id != pn.target_id AND pn.depth < 2
)
SELECT DISTINCT p.person_id, p.full_name, p.category, pn.depth AS degree_of_separation, pn.case_id
FROM PersonNetwork pn
JOIN people p ON pn.target_id = p.person_id
ORDER BY pn.depth ASC;"""
    },
    "q8_window_ranking": {
        "title": "Window Function: Analytical DENSE_RANK() Over Caseloads",
        "concept": "Computes analytical ranks of investigators without collapsing row identity using DENSE_RANK() OVER (ORDER BY COUNT(...) DESC).",
        "type": "SQL",
        "sql": """SELECT 
    o.badge_number,
    o.full_name AS officer_name,
    o.department,
    COUNT(c.case_id) AS total_cases_managed,
    DENSE_RANK() OVER (ORDER BY COUNT(c.case_id) DESC) AS rank_by_caseload
FROM officers o
LEFT JOIN cases c ON o.officer_id = c.lead_officer_id
GROUP BY o.officer_id, o.badge_number, o.full_name, o.department
ORDER BY rank_by_caseload ASC;"""
    },
    "q9_correlated_subquery": {
        "title": "Correlated Subquery: Identifying Multi-Case Subjects",
        "concept": "Demonstrates subquery correlation where the inner subquery references the outer query's person_id to calculate real-time association frequency.",
        "type": "SQL",
        "sql": """SELECT 
    p.person_id,
    p.full_name,
    p.category,
    (SELECT COUNT(*) FROM case_people cp WHERE cp.person_id = p.person_id) AS total_case_associations
FROM people p
WHERE (
    SELECT COUNT(*) FROM case_people cp WHERE cp.person_id = p.person_id
) >= 1
ORDER BY total_case_associations DESC;"""
    },
    "q10_trigger_audit_log": {
        "title": "Database Audit Trigger: Immutable Activity Trail",
        "concept": "Demonstrates automated database audit logging. Case updates fire triggers populating case_activity chronologically without manual intervention.",
        "type": "SQL",
        "sql": """SELECT 
    ca.activity_id,
    ca.case_id,
    c.title AS case_title,
    ca.activity_type,
    ca.title AS event_title,
    ca.description,
    ca.created_at
FROM case_activity ca
JOIN cases c ON ca.case_id = c.case_id
ORDER BY ca.created_at DESC
LIMIT 10;"""
    },
    "q11_stored_procedure_logic": {
        "title": "Stored Procedure & Summary Function Output",
        "concept": "Simulates output of fn_get_case_summary returning computed relational metrics including total linked suspects and evidence counts per case.",
        "type": "SQL",
        "sql": """SELECT 
    c.case_id,
    c.title,
    c.status,
    c.priority,
    o.full_name AS lead_officer,
    COUNT(DISTINCT cp.person_id) AS total_linked_people,
    COUNT(DISTINCT e.evidence_id) AS total_evidence_items
FROM cases c
LEFT JOIN officers o ON c.lead_officer_id = o.officer_id
LEFT JOIN case_people cp ON c.case_id = cp.case_id
LEFT JOIN evidence e ON c.case_id = e.case_id
GROUP BY c.case_id, c.title, c.status, c.priority, o.full_name
ORDER BY c.case_id ASC;"""
    }
}

@router.get("/queries")
def list_demo_queries():
    return [
        {"id": k, "title": v["title"], "concept": v["concept"], "type": v["type"]}
        for k, v in PREDEFINED_QUERIES.items()
    ]

@router.post("/execute/{query_id}")
def execute_concept_query(query_id: str, db: Session = Depends(get_db)):
    if query_id not in PREDEFINED_QUERIES:
        raise HTTPException(status_code=404, detail="Query ID not found in predefined safe queries.")

    qinfo = PREDEFINED_QUERIES[query_id]
    start_t = time.perf_counter()

    if qinfo["type"] == "SQL":
        raw_sql = qinfo["sql"]
        result = db.execute(text(raw_sql))
        columns = list(result.keys())
        rows = [dict(zip(columns, [str(val) if val is not None else "" for val in row])) for row in result.fetchall()]
        duration_ms = round((time.perf_counter() - start_t) * 1000, 2)
        return {
            "query_id": query_id,
            "title": qinfo["title"],
            "concept": qinfo["concept"],
            "type": "SQL",
            "engine": ACTIVE_SQL_ENGINE,
            "executed_query": raw_sql,
            "columns": columns,
            "rows": rows,
            "row_count": len(rows),
            "execution_time_ms": duration_ms
        }

    elif qinfo["type"] == "MongoDB":
        mdb = get_mongo_db()
        if mdb is None:
            raise HTTPException(status_code=503, detail="MongoDB offline.")
        pipeline = qinfo["pipeline"]
        cursor = list(mdb["investigation_documents"].aggregate(pipeline))
        duration_ms = round((time.perf_counter() - start_t) * 1000, 2)
        rows = [{"document_type": d["_id"], "count": d["total_docs"], "source_types": ", ".join(d.get("sources", []))} for d in cursor]
        return {
            "query_id": query_id,
            "title": qinfo["title"],
            "concept": qinfo["concept"],
            "type": "MongoDB Aggregation Pipeline",
            "engine": "MongoDB",
            "executed_query": str(pipeline),
            "columns": ["document_type", "count", "source_types"],
            "rows": rows,
            "row_count": len(rows),
            "execution_time_ms": duration_ms
        }

    elif qinfo["type"] == "Hybrid":
        # First query SQL for Case CASE-2026-001
        sql_res = db.execute(text("SELECT case_id, title, status, priority, case_type FROM cases LIMIT 1")).fetchone()
        case_dict = {}
        if sql_res:
            case_dict = {"case_id": sql_res[0], "title": sql_res[1], "status": sql_res[2], "priority": sql_res[3], "case_type": sql_res[4]}

        # Now query MongoDB for matching documents
        mongo_rows = []
        mdb = get_mongo_db()
        if mdb is not None and case_dict:
            docs = mdb["investigation_documents"].find({"case_id": case_dict["case_id"]}).limit(5)
            for d in docs:
                mongo_rows.append({
                    "case_id": case_dict["case_id"],
                    "case_title": case_dict["title"],
                    "sql_status": case_dict["status"],
                    "mongo_doc_id": str(d["_id"]),
                    "doc_type": d.get("document_type"),
                    "source_name": d.get("source_name"),
                    "doc_title": d.get("title")
                })
        duration_ms = round((time.perf_counter() - start_t) * 1000, 2)
        return {
            "query_id": query_id,
            "title": qinfo["title"],
            "concept": qinfo["concept"],
            "type": "Hybrid SQL + NoSQL Query",
            "engine": f"{ACTIVE_SQL_ENGINE} + MongoDB",
            "executed_query": "SELECT case_id, title FROM cases ... JOIN MongoDB.investigation_documents ON case_id",
            "columns": ["case_id", "case_title", "sql_status", "mongo_doc_id", "doc_type", "source_name", "doc_title"],
            "rows": mongo_rows,
            "row_count": len(mongo_rows),
            "execution_time_ms": duration_ms
        }
