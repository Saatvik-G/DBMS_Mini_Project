import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.sql_models import Case, Person, Evidence
from app.db.mongo import get_mongo_db

client = TestClient(app)

def is_mongo_available() -> bool:
    try:
        mdb = get_mongo_db()
        return mdb is not None
    except Exception:
        return False

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("online", "degraded")
    assert "databases" in data
    assert "sql" in data["databases"]
    assert "nosql" in data["databases"]
    assert data["databases"]["nosql"]["engine"] == "MongoDB"

def test_dashboard_stats():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_cases"] >= 8
    assert data["total_people"] >= 15
    assert data["total_evidence"] >= 15
    if is_mongo_available():
        assert data["total_documents"] >= 20
    assert len(data["case_status_distribution"]) > 0

def test_cases_crud():
    # 1. List cases
    response = client.get("/api/cases")
    assert response.status_code == 200
    cases = response.json()
    assert len(cases) >= 8

    # 2. Get specific case detail with relations
    c_id = cases[0]["case_id"]
    detail_res = client.get(f"/api/cases/{c_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["case_id"] == c_id
    assert "people" in detail
    assert "evidence_items" in detail
    assert "documents" in detail

    # 3. Create a new case
    new_case_payload = {
        "title": "Automated Test Case: Suspicious Toll Anomaly",
        "description": "Created during automated regression test suite.",
        "case_type": "Digital Forensics",
        "status": "Open",
        "priority": "Low",
        "lead_officer_id": "OFF-001"
    }
    create_res = client.post("/api/cases", json=new_case_payload)
    assert create_res.status_code == 201
    created = create_res.json()
    test_case_id = created["case_id"]

    # 4. Update the created case
    update_res = client.put(f"/api/cases/{test_case_id}", json={"priority": "High"})
    assert update_res.status_code == 200
    assert update_res.json()["priority"] == "High"

    # 5. Delete the case
    delete_res = client.delete(f"/api/cases/{test_case_id}")
    assert delete_res.status_code == 200

def test_people_crud():
    res = client.get("/api/people")
    assert res.status_code == 200
    people = res.json()
    assert len(people) >= 15

    p1 = people[0]
    detail = client.get(f"/api/people/{p1['person_id']}")
    assert detail.status_code == 200
    assert detail.json()["person_id"] == p1["person_id"]

def test_evidence_and_custody():
    res = client.get("/api/evidence")
    assert res.status_code == 200
    evidence_list = res.json()
    assert len(evidence_list) >= 15

    # Check chain of custody
    ev1 = evidence_list[0]
    custody_res = client.get(f"/api/evidence/{ev1['evidence_id']}/custody")
    assert custody_res.status_code == 200
    assert isinstance(custody_res.json(), list)

def test_mongodb_documents_crud():
    if not is_mongo_available():
        pytest.skip("MongoDB offline on localhost:27017")

    # 1. List MongoDB documents
    docs_res = client.get("/api/documents")
    assert docs_res.status_code == 200
    docs = docs_res.json()
    assert len(docs) >= 20

    # 2. Add a new document to MongoDB
    doc_payload = {
        "document_type": "Investigation notes",
        "title": "Automated Unit Test Ingestion Note",
        "content": "Verifying real-time MongoDB document persistence and nested metadata JSON validation.",
        "summary": "Automated test record",
        "source_type": "Sensor Log",
        "source_name": "Pytest Automation Harness",
        "case_id": "CASE-2026-001",
        "tags": ["unit-test", "pytest", "automated"],
        "metadata": {
            "test_runner": "pytest",
            "nested_metric": 99.8,
            "pass_criteria": "strict"
        }
    }
    create_doc = client.post("/api/documents", json=doc_payload)
    assert create_doc.status_code == 201
    doc_id = create_doc.json()["id"]

    # 3. Read document detail with resolved SQL foreign keys
    read_doc = client.get(f"/api/documents/{doc_id}")
    assert read_doc.status_code == 200
    doc_detail = read_doc.json()
    assert doc_detail["case_detail"]["case_id"] == "CASE-2026-001"
    assert doc_detail["metadata"]["nested_metric"] == 99.8

    # 4. Clean up test document
    del_doc = client.delete(f"/api/documents/{doc_id}")
    assert del_doc.status_code == 200

def test_unified_cross_database_search():
    # Search for "blue sedan"
    search_res = client.get("/api/search?q=blue+sedan")
    assert search_res.status_code == 200
    data = search_res.json()
    assert data["total_sql_results"] > 0
    # SQL results should include vehicles or cases
    assert any(item["category"] == "vehicle" for item in data["sql_results"])
    if is_mongo_available():
        assert data["total_mongo_results"] > 0
        # MongoDB results should include documents
        assert any(item["category"] == "document" for item in data["mongo_results"])

def test_semantic_vector_search():
    # Test vector cosine similarity search across unstructured documents
    res = client.get("/api/search/semantic?q=stolen+blue+bmw+sedan")
    assert res.status_code == 200
    data = res.json()
    assert data["vector_dimensions"] == 64
    assert data["total_documents_scanned"] >= 20
    assert len(data["results"]) > 0
    top_hit = data["results"][0]
    assert "score" in top_hit
    assert "similarity_percent" in top_hit
    assert "title" in top_hit

def test_case_timeline():
    timeline_res = client.get("/api/cases/CASE-2026-001/timeline")
    assert timeline_res.status_code == 200
    events = timeline_res.json()
    assert len(events) >= 5
    # Verify both SQL events and MongoDB events are present
    sources = set(e["source_type"] for e in events)
    assert "PostgreSQL" in sources or "SQLite" in sources or any("SQL" in s for s in sources)
    if is_mongo_available():
        assert "MongoDB" in sources

def test_relationship_graph():
    rel_res = client.get("/api/relationships/case/CASE-2026-001")
    assert rel_res.status_code == 200
    graph = rel_res.json()
    assert "nodes" in graph
    assert "edges" in graph
    assert len(graph["nodes"]) >= 5
    assert len(graph["edges"]) >= 5

def test_dbms_concepts_demonstration():
    queries_res = client.get("/api/dbms-concepts/queries")
    assert queries_res.status_code == 200
    assert len(queries_res.json()) >= 6

    # Execute 3-table join query
    exec_res = client.post("/api/dbms-concepts/execute/q1_three_way_join")
    assert exec_res.status_code == 200
    data = exec_res.json()
    assert "columns" in data
    assert "rows" in data
    assert len(data["rows"]) > 0

    if is_mongo_available():
        # Execute MongoDB aggregation pipeline query
        mongo_exec = client.post("/api/dbms-concepts/execute/q5_mongo_aggregation")
        assert mongo_exec.status_code == 200
        assert len(mongo_exec.json()["rows"]) > 0

def test_server_side_rbac_enforcement():
    # 1. Unauthenticated request to admin endpoint must return 401
    import time
    rand_suffix = str(int(time.time() * 1000) % 1000000)
    new_officer_payload = {
        "badge_number": f"CID-T-{rand_suffix}",
        "full_name": "Test Officer Provisioning",
        "department": "Cyber Crime",
        "role": "INVESTIGATOR",
        "contact_email": f"test.officer{rand_suffix}@fusion.gov.in",
        "password": "Password@123"
    }
    unauth_res = client.post("/api/officers", json=new_officer_payload)
    assert unauth_res.status_code == 401

    # 2. Authenticate as INVESTIGATOR
    inv_login = client.post("/api/auth/login", json={
        "badge_number": "CID-002",
        "password": "Investigator@123"
    })
    assert inv_login.status_code == 200
    inv_token = inv_login.json()["access_token"]
    inv_headers = {"Authorization": f"Bearer {inv_token}"}

    # Investigator CAN read officer directory (read-only)
    inv_read = client.get("/api/officers", headers=inv_headers)
    assert inv_read.status_code == 200
    assert len(inv_read.json()) >= 2

    # Investigator is FORBIDDEN (403) from creating officers on /api/officers
    inv_post_officers = client.post("/api/officers", json=new_officer_payload, headers=inv_headers)
    assert inv_post_officers.status_code == 403
    assert "ADMIN" in inv_post_officers.json()["detail"]

    # Investigator is FORBIDDEN (403) from creating users on /api/users
    inv_post_users = client.post("/api/users", json=new_officer_payload, headers=inv_headers)
    assert inv_post_users.status_code == 403
    assert "ADMIN" in inv_post_users.json()["detail"]

    # 3. Authenticate as ADMIN
    admin_login = client.post("/api/auth/login", json={
        "badge_number": "CID-001",
        "password": "Admin@123"
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin IS PERMITTED (201) to provision new officers
    admin_post = client.post("/api/officers", json=new_officer_payload, headers=admin_headers)
    assert admin_post.status_code == 201
    created_off = admin_post.json()
    assert created_off["badge_number"] == f"CID-T-{rand_suffix}"

