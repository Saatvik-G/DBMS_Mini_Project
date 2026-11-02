-- ============================================================================
-- INTELLIGENCE FUSION PLATFORM — DML OPERATIONS & TRANSACTION SCRIPTS
-- Target DBMS: PostgreSQL 14+ / 15+ & SQLite 3 (PRAGMA foreign_keys=ON)
-- Authors: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)
-- Subject: Database Management Systems (DBMS Mini Project - UE24CS395)
-- Schema Alignment: 22 Tables (10 Core Entities + 12 Associative Junctions)
-- ============================================================================

-- ============================================================================
-- 1. DATA INSERTION (CREATE)
-- ============================================================================

-- 1.1 Insert a New Investigation Case
INSERT INTO cases (
    case_id, title, description, case_type, status, priority, lead_officer_id, incident_date
) VALUES (
    'CASE-2026-901',
    'Operation Cobalt Wire: Arabian Sea Telecom Intercept',
    'Surveillance intercept regarding unlogged high-bandwidth data bursts routed through offshore transponders.',
    'Electronic Surveillance',
    'Open',
    'Critical',
    'OFF-001',
    '2026-10-18 14:30:00+05:30'
);
-- EXPECTED OUTPUT:
-- INSERT 0 1

-- 1.2 Insert a Person of Interest
INSERT INTO people (
    person_id, full_name, category, contact_phone, contact_email, address, notes
) VALUES (
    'PER-901',
    'Farhan Qureshi',
    'Subject',
    '+91-98450-99881',
    'farhan.q@secure-mail.ch',
    'Dockside Warehouse 4B, Mangaluru Port',
    'Identified as primary telecommunications technician handling satellite decoders.'
);
-- EXPECTED OUTPUT:
-- INSERT 0 1

-- 1.3 Link Person to Case via Many-to-Many Junction Table
INSERT INTO case_people (
    case_id, person_id, role_in_case, notes
) VALUES (
    'CASE-2026-901',
    'PER-901',
    'Chief Systems Operator',
    'Flagged during port facility access log sweep.'
);
-- EXPECTED OUTPUT:
-- INSERT 0 1

-- 1.4 Register Seized Physical Exhibit
INSERT INTO evidence (
    evidence_id, case_id, title, description, evidence_type, storage_reference, collected_by_officer_id
) VALUES (
    'EVD-901',
    'CASE-2026-901',
    'Iridium Extreme 9575 Satellite Handset',
    'Ruggedized satellite phone with dual-SIM configuration and custom firmware payload.',
    'Digital Hardware',
    'Secure Vault Locker B-14',
    'OFF-001'
);
-- EXPECTED OUTPUT:
-- INSERT 0 1

-- 1.5 Initial Chain of Custody Event
INSERT INTO evidence_custody (
    evidence_id, officer_id, event_type, notes
) VALUES (
    'EVD-901',
    'OFF-001',
    'Seizure & Evidence Vault Check-in',
    'Recovered from dockside shipping container 12 during joint enforcement action.'
);
-- EXPECTED OUTPUT:
-- INSERT 0 1


-- ============================================================================
-- 2. DATA QUERYING (READ)
-- ============================================================================

-- 2.1 Read Case Dossier with Lead Officer and Associated Suspects
SELECT 
    c.case_id,
    c.title AS case_title,
    c.status AS case_status,
    c.priority,
    o.full_name AS lead_investigator,
    o.badge_number,
    p.person_id,
    p.full_name AS suspect_name,
    cp.role_in_case
FROM cases c
JOIN officers o ON c.lead_officer_id = o.officer_id
JOIN case_people cp ON c.case_id = cp.case_id
JOIN people p ON cp.person_id = p.person_id
WHERE c.case_id = 'CASE-2026-901';

-- EXPECTED OUTPUT:
--    case_id    |                   case_title                    | case_status | priority |  lead_investigator  | badge_number | person_id |  suspect_name  |      role_in_case       
-----------------+-------------------------------------------------+-------------+----------+---------------------+--------------+-----------+----------------+-------------------------
-- CASE-2026-901 | Operation Cobalt Wire: Arabian Sea Telecom...   | Open        | Critical | Rajesh Sharma       | CID-001      | PER-901   | Farhan Qureshi | Chief Systems Operator

-- 2.2 Verify Evidence Chain of Custody
SELECT 
    ec.custody_event_id,
    ec.evidence_id,
    e.title AS exhibit_title,
    ec.event_type,
    o.full_name AS custodian_officer,
    ec.event_timestamp,
    ec.notes
FROM evidence_custody ec
JOIN evidence e ON ec.evidence_id = e.evidence_id
JOIN officers o ON ec.officer_id = o.officer_id
WHERE ec.evidence_id = 'EVD-901'
ORDER BY ec.event_timestamp ASC;

-- EXPECTED OUTPUT:
--  custody_event_id | evidence_id |             exhibit_title             |            event_type            | custodian_officer |       event_timestamp       |                 notes                  
-- ------------------+-------------+---------------------------------------+----------------------------------+-------------------+-----------------------------+----------------------------------------
--                 1 | EVD-901     | Iridium Extreme 9575 Satellite Handset | Seizure & Evidence Vault Check-in | Rajesh Sharma     | 2026-10-18 14:35:10.123+05  | Recovered from dockside shipping...


-- ============================================================================
-- 3. DATA MODIFICATION (UPDATE)
-- ============================================================================

-- 3.1 Upgrade Case Priority and Modify Investigation Status
UPDATE cases
SET 
    status = 'Under Investigation',
    priority = 'Critical',
    updated_at = CURRENT_TIMESTAMP
WHERE case_id = 'CASE-2026-901';
-- EXPECTED OUTPUT:
-- UPDATE 1

-- 3.2 Update Evidence Custodial Location
UPDATE evidence
SET 
    storage_reference = 'Cyber Forensics Lab Station 2',
    updated_at = CURRENT_TIMESTAMP
WHERE evidence_id = 'EVD-901';
-- EXPECTED OUTPUT:
-- UPDATE 1

-- 3.3 Log Subsequent Custody Transfer
INSERT INTO evidence_custody (
    evidence_id, officer_id, event_type, notes
) VALUES (
    'EVD-901',
    'OFF-002',
    'Transferred to Forensic Specialist',
    'Released to Lead Inspector Ananya Roy for JTAG chip-off memory acquisition.'
);
-- EXPECTED OUTPUT:
-- INSERT 0 1


-- ============================================================================
-- 4. DATA REMOVAL & CASCADE BEHAVIOR (DELETE)
-- ============================================================================

-- 4.1 Delete Association from Bridge Table (Decouple suspect without deleting person)
DELETE FROM case_people
WHERE case_id = 'CASE-2026-901' AND person_id = 'PER-901';
-- EXPECTED OUTPUT:
-- DELETE 1

-- Verify person entity remains intact in primary registry:
SELECT person_id, full_name, category FROM people WHERE person_id = 'PER-901';
-- EXPECTED OUTPUT:
--  person_id |  full_name     | category 
-- -----------+----------------+----------
--  PER-901   | Farhan Qureshi | Subject


-- ============================================================================
-- 5. ACID TRANSACTION WITH SAVEPOINT & CONDITIONAL ROLLBACK
-- ============================================================================

BEGIN;

-- Step A: Register new evidence item
INSERT INTO evidence (
    evidence_id, case_id, title, description, evidence_type, storage_reference, collected_by_officer_id
) VALUES (
    'EVD-902',
    'CASE-2026-901',
    'Encrypted MicroSD Card (SanDisk 512GB)',
    'Recovered from inside battery compartment of satellite phone.',
    'Digital Storage',
    'Vault Tray 9',
    'OFF-001'
);

-- Step B: Establish Savepoint before risky operation
SAVEPOINT after_evidence_created;

-- Step C: Attempt erroneous assignment to non-existent officer
-- (Simulated failure: assigning to invalid officer identifier)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM officers WHERE officer_id = 'OFF-INVALID') THEN
        RAISE NOTICE 'Officer validation failed! Rolling back to savepoint...';
    END IF;
END
$$;

-- Rollback to safe intermediate state:
ROLLBACK TO SAVEPOINT after_evidence_created;

-- Step D: Correct assignment with verified officer
INSERT INTO evidence_custody (
    evidence_id, officer_id, event_type, notes
) VALUES (
    'EVD-902',
    'OFF-001',
    'Initial Vault Deposition',
    'MicroSD card bagged in anti-static Faraday pouch after savepoint recovery.'
);

-- Step E: Commit transaction atomically
COMMIT;

-- Verify both records committed successfully:
SELECT e.evidence_id, e.title, ec.event_type, ec.officer_id
FROM evidence e
JOIN evidence_custody ec ON e.evidence_id = ec.evidence_id
WHERE e.evidence_id = 'EVD-902';

-- EXPECTED OUTPUT:
--  evidence_id |                 title                  |        event_type        | officer_id 
-- -------------+----------------------------------------+--------------------------+------------
--  EVD-902     | Encrypted MicroSD Card (SanDisk 512GB) | Initial Vault Deposition | OFF-001
