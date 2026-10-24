# Automated Testing & Verification Report

**Project Title:** Intelligence Fusion Platform  
**Project Type:** DBMS Mini Project  
**Team Members:**  
- **Saatvik Gupta** — PES1UG24CS395  
- **Satyam Goyal** — PES1UG24CS424  

---

## 1. Test Suite Summary

The automated test suite is located in `backend/tests/test_api.py` and is run using `pytest`.

- **Test Framework:** `pytest 9.1.1`
- **HTTP Test Client:** `fastapi.testclient.TestClient`
- **Total Tests:** 10
- **Pass Rate:** 10/10 (100% Passed)
- **Execution Time:** ~7.97s

---

## 2. Test Cases Overview

| # | Test Function | Description | Result |
|---|---|---|---|
| 1 | `test_health_endpoint` | Verifies health check reports connected SQL engine and live MongoDB instance | **PASSED** |
| 2 | `test_dashboard_stats` | Tests relational COUNT aggregates and MongoDB document count calculations | **PASSED** |
| 3 | `test_cases_crud` | Tests Case creation, retrieval with relationships, update, and deletion | **PASSED** |
| 4 | `test_people_crud` | Tests Person directory listing and detail retrieval with linked cases | **PASSED** |
| 5 | `test_evidence_and_custody` | Tests Evidence records and sequential Chain-of-Custody retrieval | **PASSED** |
| 6 | `test_mongodb_documents_crud` | Tests MongoDB document insertion, retrieval with resolved SQL keys, and deletion | **PASSED** |
| 7 | `test_unified_cross_database_search` | Verifies unified multi-word search (`"blue sedan"`) across SQL and MongoDB | **PASSED** |
| 8 | `test_case_timeline` | Verifies chronological event consolidation across SQL and MongoDB sources | **PASSED** |
| 9 | `test_relationship_graph` | Verifies node and edge graph generation from SQL junction tables | **PASSED** |
| 10 | `test_dbms_concepts_demonstration` | Tests safe execution of 3-table SQL join and MongoDB aggregation pipeline | **PASSED** |

---

## 3. How to Run the Tests

From the project root:

```powershell
$env:PYTHONPATH="backend"
.\venv\Scripts\pytest.exe backend/tests/test_api.py -v
```

Expected output:
```text
backend/tests/test_api.py::test_health_endpoint PASSED                   [ 10%]
backend/tests/test_api.py::test_dashboard_stats PASSED                   [ 20%]
backend/tests/test_api.py::test_cases_crud PASSED                        [ 30%]
backend/tests/test_api.py::test_people_crud PASSED                       [ 40%]
backend/tests/test_api.py::test_evidence_and_custody PASSED              [ 50%]
backend/tests/test_api.py::test_mongodb_documents_crud PASSED            [ 60%]
backend/tests/test_api.py::test_unified_cross_database_search PASSED     [ 70%]
backend/tests/test_api.py::test_case_timeline PASSED                     [ 80%]
backend/tests/test_api.py::test_relationship_graph PASSED                [ 90%]
backend/tests/test_api.py::test_dbms_concepts_demonstration PASSED       [100%]
======================= 10 passed in 7.97s =======================
```
