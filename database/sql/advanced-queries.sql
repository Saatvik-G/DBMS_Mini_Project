-- ============================================================================
-- INTELLIGENCE FUSION PLATFORM — ADVANCED SQL QUERIES & ANALYTICAL EXAMPLES
-- Target DBMS: PostgreSQL 14+ / 15+ & SQLite 3 (PRAGMA foreign_keys=ON)
-- Authors: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)
-- Subject: Database Management Systems (DBMS Mini Project - UE24CS395)
-- Schema Alignment: 22 Tables (10 Core Entities + 12 Associative Junctions)
-- ============================================================================

-- ============================================================================
-- 1. COMPLEX MULTI-TABLE INNER & LEFT JOINS (6 RELATIONS)
-- Concept: Combines primary case incident records with assigned lead officers,
-- linked suspects via case_people, seized hardware via case_devices, and
-- forensic exhibits via evidence, preserving referential integrity across M:N bridges.
-- ============================================================================

SELECT 
    c.case_id,
    c.title AS case_title,
    c.status AS case_status,
    c.priority,
    o.full_name AS lead_investigator,
    o.badge_number,
    p.person_id,
    p.full_name AS person_name,
    cp.role_in_case,
    d.device_type,
    d.serial_number,
    e.evidence_id,
    e.title AS exhibit_title
FROM cases c
INNER JOIN officers o ON c.lead_officer_id = o.officer_id
INNER JOIN case_people cp ON c.case_id = cp.case_id
INNER JOIN people p ON cp.person_id = p.person_id
LEFT JOIN case_devices cd ON c.case_id = cd.case_id
LEFT JOIN devices d ON cd.device_id = d.device_id
LEFT JOIN evidence e ON c.case_id = e.case_id
WHERE c.priority IN ('High', 'Critical')
ORDER BY c.case_id ASC, p.person_id ASC
LIMIT 5;

-- SAMPLE EXPECTED OUTPUT:
--    case_id    |           case_title           | case_status | priority | lead_investigator | badge_number | person_id |   person_name   |      role_in_case       | device_type | serial_number | evidence_id |             exhibit_title             
-- --------------+--------------------------------+-------------+----------+-------------------+--------------+-----------+-----------------+-------------------------+-------------+---------------+-------------+---------------------------------------
--  CASE-2026-001 | Operation Shrouded Horizon ... | Open        | High     | Rajesh Sharma     | CID-001      | PER-001   | Vikram Singh    | Principal Target        | Smartphone  | IMEI-88392109 | EVD-001     | ThinkPad X1 Carbon Forensics Image
--  CASE-2026-001 | Operation Shrouded Horizon ... | Open        | High     | Rajesh Sharma     | CID-001      | PER-001   | Vikram Singh    | Principal Target        | Smartphone  | IMEI-88392109 | EVD-002     | Tampered Hydrochloric Acid Punch Dies


-- ============================================================================
-- 2. UNCORRELATED NESTED SUBQUERY (IN / NOT IN)
-- Concept: Demonstrates nested scalar subqueries. Finds all officers who are
-- currently leading cases that have MORE seized exhibits than the global average.
-- ============================================================================

SELECT 
    o.officer_id,
    o.full_name,
    o.badge_number,
    o.department
FROM officers o
WHERE o.officer_id IN (
    -- Subquery: Lead officers managing cases with above-average evidence count
    SELECT c.lead_officer_id
    FROM cases c
    JOIN evidence e ON c.case_id = e.case_id
    GROUP BY c.case_id, c.lead_officer_id
    HAVING COUNT(e.evidence_id) > (
        -- Sub-subquery: Global average evidence exhibits per case
        SELECT AVG(evidence_per_case)
        FROM (
            SELECT COUNT(evidence_id) AS evidence_per_case
            FROM cases c2
            LEFT JOIN evidence e2 ON c2.case_id = e2.case_id
            GROUP BY c2.case_id
        ) sub
    )
);

-- SAMPLE EXPECTED OUTPUT:
--  officer_id |   full_name   | badge_number |                  department                   
-- ------------+---------------+--------------+-----------------------------------------------
--  OFF-001    | Rajesh Sharma | CID-001      | Special Cyber & Intelligence Fusion Command
--  OFF-002    | Ananya Roy    | CID-002      | Financial Intelligence & Organized Crime Unit


-- ============================================================================
-- 3. CORRELATED SUBQUERY (EXISTS / COMPARISON)
-- Concept: Evaluates a subquery once for every outer row. Identifies persons of
-- interest who are implicated across multiple independent active investigations.
-- ============================================================================

SELECT 
    p.person_id,
    p.full_name,
    p.category,
    (
        -- Correlated subquery computing association count for outer person
        SELECT COUNT(DISTINCT cp.case_id)
        FROM case_people cp
        WHERE cp.person_id = p.person_id
    ) AS total_active_cases
FROM people p
WHERE (
    -- Correlated filter: Implicated in at least 2 distinct cases
    SELECT COUNT(DISTINCT cp2.case_id)
    FROM case_people cp2
    WHERE cp2.person_id = p.person_id
) >= 2
ORDER BY total_active_cases DESC;

-- SAMPLE EXPECTED OUTPUT:
--  person_id |    full_name     | category | total_active_cases 
-- -----------+------------------+----------+--------------------
--  PER-001   | Vikram Singh     | Subject  |                  2
--  PER-002   | Rohan Deshmukh   | Subject  |                  2


-- ============================================================================
-- 4. AGGREGATE QUERY WITH GROUP BY & HAVING
-- Concept: Aggregates caseload metrics per department. Identifies departmental
-- divisions with a heavy operational burden (2 or more active cases) and computes
-- total evidence custody events generated.
-- ============================================================================

SELECT 
    o.department,
    COUNT(DISTINCT c.case_id) AS active_cases_count,
    COUNT(DISTINCT o.officer_id) AS assigned_investigators,
    COUNT(DISTINCT ec.custody_event_id) AS total_custody_events_handled
FROM officers o
JOIN cases c ON o.officer_id = c.lead_officer_id
LEFT JOIN evidence_custody ec ON o.officer_id = ec.officer_id
WHERE c.status NOT IN ('Closed')
GROUP BY o.department
HAVING COUNT(DISTINCT c.case_id) >= 2
ORDER BY active_cases_count DESC;

-- SAMPLE EXPECTED OUTPUT:
--                    department                   | active_cases_count | assigned_investigators | total_custody_events_handled 
-- ------------------------------------------------+--------------------+------------------------+------------------------------
--  Special Cyber & Intelligence Fusion Command    |                  4 |                      2 |                            9
--  Financial Intelligence & Organized Crime Unit  |                  2 |                      1 |                            4


-- ============================================================================
-- 5. RECURSIVE COMMON TABLE EXPRESSION (CTE): Multi-Hop Criminal Network
-- Concept: Recursively discovers multi-degree criminal associate clusters by
-- starting at root suspect 'PER-001', traversing shared case bridge tables,
-- and terminating upon reaching max depth or exhausted graph paths.
-- ============================================================================

WITH RECURSIVE SuspectNetwork AS (
    -- Anchor Member (Depth 0): Seed target
    SELECT 
        cp.person_id AS source_id,
        cp.person_id AS target_id,
        cp.case_id,
        0 AS depth
    FROM case_people cp
    WHERE cp.person_id = 'PER-001'

    UNION

    -- Recursive Member (Depth N+1): Co-suspects in shared case files
    SELECT 
        sn.source_id,
        next_cp.person_id AS target_id,
        next_cp.case_id,
        sn.depth + 1
    FROM SuspectNetwork sn
    JOIN case_people curr_cp ON sn.target_id = curr_cp.person_id
    JOIN case_people next_cp ON curr_cp.case_id = next_cp.case_id
    WHERE next_cp.person_id != sn.target_id 
      AND sn.depth < 2 -- Hard limit at 2 degrees of separation
)
SELECT DISTINCT 
    p.person_id,
    p.full_name,
    p.category,
    sn.depth AS degrees_of_separation,
    sn.case_id AS linked_through_case
FROM SuspectNetwork sn
JOIN people p ON sn.target_id = p.person_id
ORDER BY sn.depth ASC, p.person_id ASC;

-- SAMPLE EXPECTED OUTPUT:
--  person_id |   full_name    | category | degrees_of_separation | linked_through_case 
-- -----------+----------------+----------+-----------------------+---------------------
--  PER-001   | Vikram Singh   | Subject  |                     0 | CASE-2026-001
--  PER-002   | Rohan Deshmukh | Subject  |                     1 | CASE-2026-001
--  PER-003   | Harish Chandra | Subject  |                     1 | CASE-2026-001
--  PER-007   | Meera Sen      | Witness  |                     2 | CASE-2026-002
