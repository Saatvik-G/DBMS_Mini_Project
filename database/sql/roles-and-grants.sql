-- ============================================================================
-- INTELLIGENCE FUSION PLATFORM — DATABASE ROLES & ACCESS CONTROL (RBAC)
-- Target DBMS: PostgreSQL 14+ / 15+
-- Authors: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)
-- Subject: Database Management Systems (DBMS Mini Project)
-- ============================================================================

-- ============================================================================
-- 1. ROLE DEFINITIONS
-- ============================================================================

-- Create Administrator Role
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ifp_admin') THEN
        CREATE ROLE ifp_admin WITH LOGIN PASSWORD 'Admin@SecPass2026';
    END IF;
END
$$;

-- Create Field Investigator Role
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ifp_investigator') THEN
        CREATE ROLE ifp_investigator WITH LOGIN PASSWORD 'Investigator@SecPass2026';
    END IF;
END
$$;

-- Create Auditor Role (Read-Only)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ifp_auditor') THEN
        CREATE ROLE ifp_auditor WITH LOGIN PASSWORD 'Auditor@SecPass2026';
    END IF;
END
$$;

-- ============================================================================
-- 2. SCHEMA PRIVILEGES
-- ============================================================================

GRANT USAGE ON SCHEMA public TO ifp_admin, ifp_investigator, ifp_auditor;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ifp_admin, ifp_investigator;

-- ============================================================================
-- 3. ROLE: ifp_admin (FULL PRIVILEGES)
-- Full DDL and DML access across all tables, including user management
-- ============================================================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ifp_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ifp_admin;

-- ============================================================================
-- 4. ROLE: ifp_investigator (LEAST-PRIVILEGE INVESTIGATION ROLE)
-- Can read/write cases, people, vehicles, devices, locations, evidence.
-- CANNOT modify or delete immutable audit logs (case_activity, evidence_custody).
-- CANNOT delete physical evidence exhibits.
-- CANNOT modify officers or user accounts.
-- ============================================================================

-- Read-only on System Users & Officers
GRANT SELECT ON users, officers TO ifp_investigator;

-- Read & Insert only on Audit Logs (Immutable append-only access)
GRANT SELECT, INSERT ON case_activity, evidence_custody TO ifp_investigator;

-- Controlled DML on Investigation Entities (SELECT, INSERT, UPDATE)
GRANT SELECT, INSERT, UPDATE ON 
    cases,
    people,
    organizations,
    vehicles,
    devices,
    locations,
    evidence,
    case_people,
    case_organizations,
    case_vehicles,
    case_devices,
    case_locations,
    case_officers,
    evidence_people,
    evidence_vehicles,
    evidence_devices,
    evidence_locations,
    person_organizations,
    person_vehicles,
    person_devices
TO ifp_investigator;

-- Explicitly revoke DELETE privileges on sensitive audit and evidence records
REVOKE DELETE ON cases, evidence, evidence_custody, case_activity FROM ifp_investigator;

-- ============================================================================
-- 5. ROLE: ifp_auditor (COMPLIANCE & VIVA INSPECTION ROLE)
-- Complete read-only access to verify data integrity without modification rights
-- ============================================================================

GRANT SELECT ON ALL TABLES IN SCHEMA public TO ifp_auditor;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM ifp_auditor;

-- ============================================================================
-- 6. VERIFICATION QUERY FOR EXAMINERS / VIVA
-- ============================================================================

SELECT 
    grantee, 
    table_schema, 
    table_name, 
    string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants 
WHERE grantee IN ('ifp_admin', 'ifp_investigator', 'ifp_auditor')
GROUP BY grantee, table_schema, table_name
ORDER BY grantee, table_name;
