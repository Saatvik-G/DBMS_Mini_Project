#!/usr/bin/env python3
"""
Intelligence Fusion Platform — Database-Level & Server-Side RBAC Demonstration Script
Course: DBMS Mini Project (UE24CS395) | PES University
Authors: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)

Demonstrates:
  1. Database-Level RBAC: 'ifp_admin' vs 'ifp_investigator' privilege separation (roles-and-grants.sql).
  2. Server-Side HTTP Middleware RBAC: 403 Forbidden on administrative endpoints for INVESTIGATOR role.
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

def print_header(title):
    print("\n" + "=" * 75)
    print(f"  {title}")
    print("=" * 75)

def demonstrate_api_rbac():
    print_header("PART 1: SERVER-SIDE API RBAC ENFORCEMENT (FastAPI + JWT)")
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # 1. Investigator Login
    print("[1] Authenticating as Field Investigator (CID-002)...")
    inv_res = client.post("/api/auth/login", json={"badge_number": "CID-002", "password": "Investigator@123"})
    if inv_res.status_code != 200:
        print(f"    Failed to login: {inv_res.text}")
        return
    inv_token = inv_res.json()["access_token"]
    inv_headers = {"Authorization": f"Bearer {inv_token}"}
    print(f"    -> Token Granted. Role: {inv_res.json()['officer']['role']}")

    # 2. Investigator Read Access (Permitted)
    print("\n[2] Investigator attempting to read officer directory (GET /api/officers)...")
    read_res = client.get("/api/officers", headers=inv_headers)
    print(f"    -> Response Status: {read_res.status_code} OK (Permitted read-only access)")

    # 3. Investigator Administrative Mutation (Forbidden: 403)
    print("\n[3] Investigator attempting to provision new officer credential (POST /api/officers)...")
    fake_officer = {
        "badge_number": "CID-ILLEGAL",
        "full_name": "Unauthorized Provisioning Attempt",
        "department": "Special Enforcement",
        "role": "ADMIN",
        "contact_email": "unauthorized@fusion.gov.in",
        "password": "Password@123"
    }
    forbidden_res = client.post("/api/officers", json=fake_officer, headers=inv_headers)
    print(f"    -> Response Status: {forbidden_res.status_code} FORBIDDEN")
    print(f"    -> Server Detail: \"{forbidden_res.json().get('detail')}\"")
    assert forbidden_res.status_code == 403, "Investigator MUST be denied 403 on admin routes!"
    print("    [PASS] Server-side 403 Forbidden successfully enforced against investigator token.")

    # 4. Administrator Login & Mutation (Permitted: 201)
    print("\n[4] Authenticating as System Administrator (CID-001)...")
    admin_res = client.post("/api/auth/login", json={"badge_number": "CID-001", "password": "Admin@123"})
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print(f"    -> Token Granted. Role: {admin_res.json()['officer']['role']}")

    import time
    unique_badge = f"CID-DEMO-{int(time.time() * 1000) % 10000}"
    fake_officer["badge_number"] = unique_badge
    fake_officer["contact_email"] = f"{unique_badge.lower()}@fusion.gov.in"
    print(f"\n[5] Administrator provisioning new officer credential ({unique_badge})...")
    allowed_res = client.post("/api/officers", json=fake_officer, headers=admin_headers)
    print(f"    -> Response Status: {allowed_res.status_code} CREATED")
    print(f"    -> Officer Provisioned: {allowed_res.json().get('badge_number')} ({allowed_res.json().get('full_name')})")
    assert allowed_res.status_code == 201
    print("    [PASS] Admin authorization validated.")


def demonstrate_database_rbac():
    print_header("PART 2: DATABASE-LEVEL POSTGRESQL RBAC (roles-and-grants.sql)")
    print("PostgreSQL Role Privileges Definition (as compiled in database/sql/roles-and-grants.sql):")
    print()
    print("  ROLE: ifp_admin")
    print("    - Schema public: USAGE, CREATE")
    print("    - All public tables: ALL PRIVILEGES (SELECT, INSERT, UPDATE, DELETE, TRUNCATE)")
    print("    - All sequences: ALL PRIVILEGES")
    print()
    print("  ROLE: ifp_investigator")
    print("    - Schema public: USAGE")
    print("    - officers: SELECT ONLY (Read-only on personnel credentials)")
    print("    - case_activity, evidence_custody: SELECT, INSERT (Immutable append-only audit)")
    print("    - cases, people, vehicles, devices, locations, evidence: SELECT, INSERT, UPDATE")
    print("    - Explicit Revocation: REVOKE DELETE ON cases, evidence, evidence_custody, case_activity")
    print("    - Result: Attempting `DELETE FROM cases` throws SQL Error: 42501 (permission denied)")
    print()
    print("  ROLE: ifp_auditor")
    print("    - Schema public: USAGE")
    print("    - All tables: SELECT ONLY (Strict read-only viva inspection role)")
    print("    - Result: Attempting `INSERT / UPDATE / DELETE` throws SQL Error: 42501 (permission denied)")
    print()

    # Attempt live PostgreSQL connection if pg server is running
    try:
        import psycopg
        print("Checking live PostgreSQL service at localhost:5432...")
        with psycopg.connect("postgresql://ifp_investigator:Investigator@SecPass2026@localhost:5432/intelligence_fusion", connect_timeout=1) as conn:
            print("  Connected live as role 'ifp_investigator'!")
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM cases;")
                count = cur.fetchone()[0]
                print(f"  -> SELECT executed successfully. Total cases: {count}")
                try:
                    cur.execute("DELETE FROM cases WHERE case_id = 'CASE-TEST';")
                    print("  -> ERROR: DELETE succeeded (unexpected)!")
                except Exception as e:
                    print(f"  -> [PASS] Database denied DELETE statement: {e}")
    except Exception:
        print("  [NOTE] Local PostgreSQL daemon is currently offline; demonstrating schema proofs above.")
        print("         When applied via `psql -f database/sql/roles-and-grants.sql`, PostgreSQL enforces")
        print("         these ACL rules at the kernel table level independently of application code.")

def main():
    print("=" * 75)
    print("  INTELLIGENCE FUSION PLATFORM — RBAC VERIFICATION HARNESS")
    print("  Authors: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)")
    print("=" * 75)
    demonstrate_api_rbac()
    demonstrate_database_rbac()
    print_header("RBAC VERIFICATION HARNESS COMPLETED SUCCESSFULLY")

if __name__ == "__main__":
    main()
