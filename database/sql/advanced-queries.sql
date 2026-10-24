-- ============================================================================
-- INTELLIGENCE FUSION PLATFORM — ADVANCED SQL QUERIES & ANALYTICS
-- Target DBMS: PostgreSQL 14+ / 15+
-- Authors: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)
-- Subject: Database Management Systems (DBMS Mini Project)
-- ============================================================================

-- ============================================================================
-- 1. COMPLEX MULTI-TABLE JOINS (5+ RELATIONS)
-- Problem: Build an investigation dossiers query uniting Case, Lead Officer,
-- Linked Suspects, Seized Devices, and Forensic Custody Status.
-- ============================================================================

SELECT 
    c.case_number,
    c.title AS case_title,
    c.status AS case_status,
    CONCAT(o.first_name, ' ', o.last_name) AS lead_investigator,
    o.rank AS investigator_rank,
    p.first_name || ' ' || p.last_name AS suspect_name,
    cp.role AS suspect_role,
    p.risk_level,
    d.device_name,
    d.imei,
    e.tracking_number AS evidence_tag,
    e.status AS evidence_custody_status
FROM cases c
INNER JOIN officers o ON c.lead_officer_id = o.id
INNER JOIN case_people cp ON c.id = cp.case_id
INNER JOIN people p ON cp.person_id = p.id
LEFT JOIN case_devices cd ON c.id = cd.case_id
LEFT JOIN devices d ON cd.device_id = d.id
LEFT JOIN evidence e ON c.id = e.case_id
WHERE c.priority IN ('HIGH', 'CRITICAL')
ORDER BY c.case_number, p.risk_level DESC;

-- ============================================================================
-- 2. AGGREGATE QUERIES WITH GROUP BY AND HAVING
-- Problem: Identify officers managing more than 1 active case, computing total
-- evidence items under their supervision and latest incident date.
-- ============================================================================

SELECT 
    o.id AS officer_id,
    o.badge_number,
    CONCAT(o.first_name, ' ', o.last_name) AS officer_name,
    o.unit,
    COUNT(DISTINCT c.id) AS total_active_cases,
    COUNT(DISTINCT e.id) AS total_evidence_overseen,
    MAX(c.incident_date) AS most_recent_incident
FROM officers o
JOIN cases c ON o.id = c.lead_officer_id
LEFT JOIN evidence e ON c.id = e.case_id
WHERE c.status NOT IN ('CLOSED', 'COLD_CASE')
GROUP BY o.id, o.badge_number, o.first_name, o.last_name, o.unit
HAVING COUNT(DISTINCT c.id) >= 1
ORDER BY total_active_cases DESC, total_evidence_overseen DESC;

-- ============================================================================
-- 3. CORRELATED SUBQUERIES
-- Problem: Find people who are linked to more cases than the average number
-- of cases per person across the entire intelligence database.
-- ============================================================================

SELECT 
    p.id,
    p.first_name || ' ' || p.last_name AS person_name,
    p.alias,
    p.risk_level,
    (SELECT COUNT(*) FROM case_people cp WHERE cp.person_id = p.id) AS linked_case_count
FROM people p
WHERE (
    SELECT COUNT(*) 
    FROM case_people cp 
    WHERE cp.person_id = p.id
) > (
    SELECT AVG(case_count) 
    FROM (
        SELECT COUNT(case_id) AS case_count 
        FROM case_people 
        GROUP BY person_id
    ) AS avg_cases
)
ORDER BY linked_case_count DESC;

-- ============================================================================
-- 4. WINDOW FUNCTIONS (ANALYTICAL SQL)
-- Problem: Compute running case counts and dense rankings of investigators
-- by evidence collection output using PARTITION BY and OVER().
-- ============================================================================

SELECT 
    o.badge_number,
    CONCAT(o.first_name, ' ', o.last_name) AS officer_name,
    o.unit,
    COUNT(e.id) AS evidence_collected_count,
    DENSE_RANK() OVER (
        PARTITION BY o.unit 
        ORDER BY COUNT(e.id) DESC
    ) AS unit_rank,
    ROUND(
        COUNT(e.id) * 100.0 / NULLIF(SUM(COUNT(e.id)) OVER (PARTITION BY o.unit), 0), 2
    ) AS pct_of_unit_evidence
FROM officers o
LEFT JOIN evidence e ON o.id = e.collected_by_officer_id
GROUP BY o.id, o.badge_number, o.first_name, o.last_name, o.unit
ORDER BY o.unit, unit_rank;

-- ============================================================================
-- 5. SET OPERATIONS (UNION, INTERSECT, EXCEPT)
-- Problem: Correlate individuals who own a vehicle involved in a case
-- vs individuals registered as a suspect in any active case.
-- ============================================================================

-- Suspects in active cases who ALSO have a vehicle registered to their name (INTERSECT)
(
    SELECT p.id, p.first_name || ' ' || p.last_name AS name, p.national_id
    FROM people p
    JOIN case_people cp ON p.id = cp.person_id
    WHERE cp.role = 'SUSPECT'
)
INTERSECT
(
    SELECT p.id, p.first_name || ' ' || p.last_name AS name, p.national_id
    FROM people p
    JOIN vehicles v ON p.id = v.owner_person_id
);
