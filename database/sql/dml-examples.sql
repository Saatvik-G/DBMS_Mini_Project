-- ============================================================================
-- INTELLIGENCE FUSION PLATFORM — DML OPERATIONS & TRANSACTION SCRIPTS
-- Target DBMS: PostgreSQL 14+ / 15+
-- Authors: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)
-- Subject: Database Management Systems (DBMS Mini Project)
-- ============================================================================

-- ============================================================================
-- 1. DATA INSERTION (CRUD: CREATE)
-- Demonstrating primary entity insertion and relational junction associations
-- ============================================================================

-- 1.1 Insert a New High-Priority Narcotics Case
INSERT INTO cases (
    case_number, title, description, category, status, priority, classification, lead_officer_id, incident_date
) VALUES (
    'CAS-2026-NARC-099',
    'Operation Deep Blue Sea: Arabian Sea Smuggling Route',
    'Interception of encrypted satellite comms coordinating illicit maritime logistics via Kochi and Mangaluru ports.',
    'NARCOTICS',
    'OPEN',
    'CRITICAL',
    'TOP_SECRET',
    1,
    '2026-10-15 04:30:00+05:30'
);

-- 1.2 Insert a Person of Interest
INSERT INTO people (
    first_name, last_name, alias, national_id, passport_number, date_of_birth, gender, nationality, phone, risk_level, notes
) VALUES (
    'Farhan',
    'Qureshi',
    'The Skipper',
    'IND-9912-3849',
    'Z8829103',
    '1985-06-14',
    'MALE',
    'Indian',
    '+91-98450-99881',
    'EXTREME',
    'Identified as primary maritime logistics coordinator operating between Muscat and western Indian coastline.'
);

-- 1.3 Associate the Person with the Case (Junction Table Insert)
INSERT INTO case_people (
    case_id, person_id, role, notes
) VALUES (
    (SELECT id FROM cases WHERE case_number = 'CAS-2026-NARC-099'),
    (SELECT id FROM people WHERE national_id = 'IND-9912-3849'),
    'SUSPECT',
    'Primary vessel captain and radio communicator.'
);

-- 1.4 Register Seized Physical Evidence
INSERT INTO evidence (
    case_id, tracking_number, description, evidence_type, collected_by_officer_id, storage_location, status, chain_of_custody_hash
) VALUES (
    (SELECT id FROM cases WHERE case_number = 'CAS-2026-NARC-099'),
    'EVD-2026-099-SAT',
    'Iridium Extreme 9575 Satellite Phone with preprogrammed oceanic waypoints',
    'DIGITAL_DEVICE',
    1,
    'Locker 4B, Cyber Forensics Division, Bengaluru',
    'IN_CUSTODY',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
);

-- ============================================================================
-- 2. DATA RETRIEVAL (CRUD: READ)
-- Comprehensive multi-table relational JOINs with filtering
-- ============================================================================

-- 2.1 Retrieve complete 360-degree case summary with lead officer and suspect counts
SELECT 
    c.id AS case_id,
    c.case_number,
    c.title,
    c.status,
    c.priority,
    CONCAT(o.first_name, ' ', o.last_name, ' (', o.rank, ')') AS lead_investigator,
    COUNT(DISTINCT cp.person_id) AS total_suspects_linked,
    COUNT(DISTINCT e.id) AS total_evidence_items,
    c.opened_date
FROM cases c
LEFT JOIN officers o ON c.lead_officer_id = o.id
LEFT JOIN case_people cp ON c.id = cp.case_id
LEFT JOIN evidence e ON c.id = e.case_id
WHERE c.status IN ('OPEN', 'UNDER_INVESTIGATION')
GROUP BY c.id, c.case_number, c.title, c.status, c.priority, o.first_name, o.last_name, o.rank, c.opened_date
ORDER BY c.priority DESC, c.opened_date DESC;

-- ============================================================================
-- 3. DATA MODIFICATION (CRUD: UPDATE)
-- Demonstrating status updates and activity logging
-- ============================================================================

-- 3.1 Elevate Case Priority and Status
UPDATE cases
SET 
    status = 'UNDER_INVESTIGATION',
    priority = 'CRITICAL',
    updated_at = CURRENT_TIMESTAMP
WHERE case_number = 'CAS-2026-NARC-099';

-- 3.2 Update Person Risk Level Based on Recent Intelligence
UPDATE people
SET 
    risk_level = 'EXTREME',
    notes = CONCAT(COALESCE(notes, ''), ' [UPDATED: Confirmed weapon possession during raid].'),
    updated_at = CURRENT_TIMESTAMP
WHERE national_id = 'IND-9912-3849';

-- ============================================================================
-- 4. DATA DELETION (CRUD: DELETE)
-- Demonstrating CASCADE cleanup and explicit reference integrity
-- ============================================================================

-- 4.1 Delete a non-essential test entity (cascades to junction tables safely)
DELETE FROM case_locations
WHERE case_id = (SELECT id FROM cases WHERE case_number = 'CAS-2026-NARC-099')
  AND location_id = 999; -- safe nonexistent guard

-- ============================================================================
-- 5. TRANSACTION INTEGRITY, SAVEPOINTS & ROLLBACK DEMONSTRATION
-- Scenario: Transferring Evidence with Chain of Custody Verification
-- If custody hash validation or destination verification fails, entire transfer is rolled back.
-- ============================================================================

BEGIN;

-- Step 1: Set a Savepoint before attempting evidence custody reassignment
SAVEPOINT pre_custody_transfer;

-- Step 2: Update evidence status to ANALYZING
UPDATE evidence
SET 
    status = 'ANALYZING',
    storage_location = 'Forensic Lab 3, Cyber Investigation Unit'
WHERE tracking_number = 'EVD-2026-099-SAT';

-- Step 3: Insert Custody Audit Event
INSERT INTO evidence_custody (
    evidence_id,
    transferred_from_officer_id,
    transferred_to_officer_id,
    reason,
    source_location,
    destination_location,
    verification_hash
) VALUES (
    (SELECT id FROM evidence WHERE tracking_number = 'EVD-2026-099-SAT'),
    1,
    2,
    'Forensic chip-off extraction and satellite call log retrieval',
    'Locker 4B, Cyber Forensics Division, Bengaluru',
    'Forensic Lab 3, Cyber Investigation Unit',
    'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'
);

-- Demonstration: Conditional rollback check (simulating failure scenario)
-- If the transfer reason or integrity check is deemed invalid, rollback to savepoint:
-- ROLLBACK TO SAVEPOINT pre_custody_transfer;

-- If successful, commit transaction permanently:
COMMIT;

-- Verify successful transaction execution
SELECT e.tracking_number, e.status, e.storage_location, ec.transfer_date, ec.destination_location
FROM evidence e
JOIN evidence_custody ec ON e.id = ec.evidence_id
WHERE e.tracking_number = 'EVD-2026-099-SAT'
ORDER BY ec.transfer_date DESC
LIMIT 1;
