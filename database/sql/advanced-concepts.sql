-- ============================================================================
-- INTELLIGENCE FUSION PLATFORM — ADVANCED PROCEDURAL SQL, TRIGGERS & CTEs
-- Target DBMS: PostgreSQL 14+ / 15+ (Production Engine)
-- Authors: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)
-- Subject: Database Management Systems (DBMS Mini Project - UE24CS395)
-- Architecture: Matches active schema with VARCHAR prefixed keys (OFF-XXX, CASE-XXX)
-- ============================================================================

-- ============================================================================
-- 1. STORED PROCEDURE: sp_create_investigation_case
-- Purpose: Atomically initialize an investigation case, validate the lead officer,
-- and write an immutable audit log entry in case_activity within a single ACID transaction.
-- ============================================================================

CREATE OR REPLACE PROCEDURE sp_create_investigation_case(
    IN p_case_id VARCHAR(50),
    IN p_title VARCHAR(200),
    IN p_description TEXT,
    IN p_case_type VARCHAR(100),
    IN p_priority VARCHAR(50),
    IN p_lead_officer_id VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate lead officer existence
    IF p_lead_officer_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM officers WHERE officer_id = p_lead_officer_id) THEN
        RAISE EXCEPTION 'Officer ID % does not exist in the law enforcement registry.', p_lead_officer_id;
    END IF;

    -- Insert case record
    INSERT INTO cases (
        case_id, title, description, case_type, status, priority, lead_officer_id, incident_date, created_at, updated_at
    ) VALUES (
        p_case_id, p_title, p_description, p_case_type, 'Open', p_priority, p_lead_officer_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );

    -- Record initial audit entry in case activity log
    INSERT INTO case_activity (
        case_id, activity_type, title, description, officer_id, activity_timestamp
    ) VALUES (
        p_case_id,
        'CASE_INITIALIZED',
        'Case Record Created',
        CONCAT('Case initialized with priority "', p_priority, '" and type "', p_case_type, '".'),
        p_lead_officer_id,
        CURRENT_TIMESTAMP
    );

    RAISE NOTICE 'Case % successfully provisioned with initial audit trail.', p_case_id;
END;
$$;

-- Demonstration Call & Verification:
-- CALL sp_create_investigation_case('CASE-2026-999', 'Operation Neon Cipher', 'Cryptocurrency drainer ring', 'Financial Cybercrime', 'High', 'OFF-001');
--
-- VERIFICATION SELECT:
-- SELECT case_id, title, status, priority, lead_officer_id FROM cases WHERE case_id = 'CASE-2026-999';
-- EXPECTED OUTPUT:
--    case_id    |         title          | status | priority | lead_officer_id 
-- --------------+------------------------+--------+----------+-----------------
--  CASE-2026-999 | Operation Neon Cipher  | Open   | High     | OFF-001
--
-- SELECT activity_type, title, description FROM case_activity WHERE case_id = 'CASE-2026-999';
-- EXPECTED OUTPUT:
--     activity_type   |        title        |                           description                            
--  -------------------+---------------------+------------------------------------------------------------------
--   CASE_INITIALIZED  | Case Record Created | Case initialized with priority "High" and type "Financial Cybercrime".


-- ============================================================================
-- 2. USER-DEFINED FUNCTION: fn_get_case_summary
-- Purpose: Aggregates metrics for any given case into a standardized JSON payload,
-- including counts of linked suspects, organizations, evidence, and lead officer.
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_get_case_summary(p_case_id VARCHAR(50))
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'case_id', c.case_id,
        'title', c.title,
        'status', c.status,
        'priority', c.priority,
        'case_type', c.case_type,
        'lead_officer', CASE 
            WHEN o.officer_id IS NOT NULL THEN CONCAT(o.full_name, ' (Badge: ', o.badge_number, ')') 
            ELSE 'UNASSIGNED' 
        END,
        'statistics', jsonb_build_object(
            'total_people', (SELECT COUNT(*) FROM case_people WHERE case_id = c.case_id),
            'organizations', (SELECT COUNT(*) FROM case_organizations WHERE case_id = c.case_id),
            'vehicles', (SELECT COUNT(*) FROM case_vehicles WHERE case_id = c.case_id),
            'devices', (SELECT COUNT(*) FROM case_devices WHERE case_id = c.case_id),
            'locations', (SELECT COUNT(*) FROM case_locations WHERE case_id = c.case_id),
            'evidence_count', (SELECT COUNT(*) FROM evidence WHERE case_id = c.case_id)
        ),
        'created_at', c.created_at,
        'updated_at', c.updated_at
    )
    INTO v_result
    FROM cases c
    LEFT JOIN officers o ON c.lead_officer_id = o.officer_id
    WHERE c.case_id = p_case_id;

    IF v_result IS NULL THEN
        RAISE EXCEPTION 'Case % not found.', p_case_id;
    END IF;

    RETURN v_result;
END;
$$;

-- Demonstration Call:
-- SELECT fn_get_case_summary('CASE-2026-001');
--
-- EXPECTED JSON OUTPUT:
-- {
--   "case_id": "CASE-2026-001",
--   "title": "Operation Shrouded Horizon: Luxury Vehicle Identification Fraud Ring",
--   "status": "Open",
--   "priority": "High",
--   "case_type": "Organized Auto Theft & Counterfeiting",
--   "lead_officer": "Rajesh Sharma (Badge: CID-001)",
--   "statistics": {
--     "total_people": 3,
--     "organizations": 2,
--     "vehicles": 2,
--     "devices": 2,
--     "locations": 2,
--     "evidence_count": 3
--   },
--   "created_at": "2026-10-15T09:00:00Z",
--   "updated_at": "2026-10-15T09:00:00Z"
-- }


-- ============================================================================
-- 3. AUDIT TRIGGER & TRIGGER FUNCTION: trg_case_activity_audit
-- Purpose: Automatically intercepts UPDATEs to cases.status and cases.priority
-- and records immutable audit log rows in case_activity without application code.
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_audit_case_state_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if status has transitioned
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO case_activity (
            case_id, activity_type, title, description, officer_id, activity_timestamp
        ) VALUES (
            NEW.case_id,
            'STATUS_CHANGE',
            'Case Status Updated',
            CONCAT('Investigation status modified from "', OLD.status, '" to "', NEW.status, '".'),
            NEW.lead_officer_id,
            CURRENT_TIMESTAMP
        );
    END IF;

    -- Check if priority has transitioned
    IF (OLD.priority IS DISTINCT FROM NEW.priority) THEN
        INSERT INTO case_activity (
            case_id, activity_type, title, description, officer_id, activity_timestamp
        ) VALUES (
            NEW.case_id,
            'PRIORITY_CHANGE',
            'Case Priority Updated',
            CONCAT('Urgency priority updated from "', OLD.priority, '" to "', NEW.priority, '".'),
            NEW.lead_officer_id,
            CURRENT_TIMESTAMP
        );
    END IF;

    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_case_activity_audit ON cases;
CREATE TRIGGER trg_case_activity_audit
    AFTER UPDATE OF status, priority ON cases
    FOR EACH ROW
    EXECUTE FUNCTION fn_audit_case_state_change();

-- TRIGGER DEMONSTRATION & VERIFICATION:
--
-- BEFORE UPDATE:
-- SELECT case_id, status, priority FROM cases WHERE case_id = 'CASE-2026-001';
-- EXPECTED: status = 'Open', priority = 'High'
--
-- EXECUTE UPDATE:
-- UPDATE cases SET status = 'Under Investigation', priority = 'Critical' WHERE case_id = 'CASE-2026-001';
--
-- AFTER UPDATE (Verify trigger automatically appended activity audit rows):
-- SELECT activity_id, case_id, activity_type, title, description, activity_timestamp
-- FROM case_activity
-- WHERE case_id = 'CASE-2026-001'
-- ORDER BY activity_timestamp DESC LIMIT 2;
--
-- EXPECTED TRIGGER AUDIT OUTPUT:
--  activity_id |    case_id    |  activity_type  |         title         |                                description                                
-- -------------+---------------+-----------------+-----------------------+---------------------------------------------------------------------------
--           12 | CASE-2026-001 | PRIORITY_CHANGE | Case Priority Updated | Urgency priority updated from "High" to "Critical".
--           11 | CASE-2026-001 | STATUS_CHANGE   | Case Status Updated   | Investigation status modified from "Open" to "Under Investigation".


-- ============================================================================
-- 4. RECURSIVE COMMON TABLE EXPRESSION (CTE): Multi-Hop Criminal Network
-- Purpose: Uncovers criminal syndicate association networks by recursively traversing
-- shared case connections up to 2 degrees of separation starting from 'PER-001'.
-- Works identically in PostgreSQL and SQLite 3.8.3+.
-- ============================================================================

WITH RECURSIVE PersonNetwork AS (
    -- Anchor Member: Initial Subject
    SELECT 
        cp.person_id AS source_id, 
        cp.person_id AS target_id, 
        cp.case_id, 
        0 AS depth
    FROM case_people cp
    WHERE cp.person_id = 'PER-001'
    
    UNION
    
    -- Recursive Member: Co-occurring persons in linked cases
    SELECT 
        pn.source_id, 
        next_cp.person_id AS target_id, 
        next_cp.case_id, 
        pn.depth + 1
    FROM PersonNetwork pn
    JOIN case_people curr_cp ON pn.target_id = curr_cp.person_id
    JOIN case_people next_cp ON curr_cp.case_id = next_cp.case_id
    WHERE next_cp.person_id != pn.target_id AND pn.depth < 2
)
SELECT DISTINCT 
    p.person_id, 
    p.full_name, 
    p.category, 
    pn.depth AS degree_of_separation, 
    pn.case_id
FROM PersonNetwork pn
JOIN people p ON pn.target_id = p.person_id
ORDER BY pn.depth ASC;


-- ============================================================================
-- 5. ANALYTICAL WINDOW FUNCTION: Caseload Ranking with DENSE_RANK()
-- Purpose: Ranks investigators by total managed cases without collapsing row identity.
-- ============================================================================

SELECT 
    o.badge_number,
    o.full_name AS officer_name,
    o.department,
    COUNT(c.case_id) AS total_cases_managed,
    DENSE_RANK() OVER (ORDER BY COUNT(c.case_id) DESC) AS rank_by_caseload
FROM officers o
LEFT JOIN cases c ON o.officer_id = c.lead_officer_id
GROUP BY o.officer_id, o.badge_number, o.full_name, o.department
ORDER BY rank_by_caseload ASC;
