-- ============================================================================
-- INTELLIGENCE FUSION PLATFORM — ADVANCED PROCEDURAL SQL, TRIGGERS & CTEs
-- Target DBMS: PostgreSQL 14+ / 15+
-- Authors: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)
-- Subject: Database Management Systems (DBMS Mini Project)
-- ============================================================================

-- ============================================================================
-- 1. STORED PROCEDURE: sp_create_investigation_case
-- Purpose: Atomically initialize an investigation case, assign the lead officer
-- to the taskforce table, and write an immutable audit log entry.
-- ============================================================================

CREATE OR REPLACE PROCEDURE sp_create_investigation_case(
    IN p_case_number VARCHAR(50),
    IN p_title VARCHAR(200),
    IN p_description TEXT,
    IN p_category VARCHAR(50),
    IN p_priority VARCHAR(20),
    IN p_classification VARCHAR(20),
    IN p_lead_officer_id INT,
    INOUT p_new_case_id INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate lead officer existence
    IF p_lead_officer_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM officers WHERE id = p_lead_officer_id) THEN
        RAISE EXCEPTION 'Officer ID % does not exist in the law enforcement registry.', p_lead_officer_id;
    END IF;

    -- Insert case record
    INSERT INTO cases (
        case_number, title, description, category, status, priority, classification, lead_officer_id, incident_date
    ) VALUES (
        p_case_number, p_title, p_description, p_category, 'OPEN', p_priority, p_classification, p_lead_officer_id, CURRENT_TIMESTAMP
    )
    RETURNING id INTO p_new_case_id;

    -- If lead officer assigned, register in case taskforce junction
    IF p_lead_officer_id IS NOT NULL THEN
        INSERT INTO case_officers (case_id, officer_id, role, assigned_date)
        VALUES (p_new_case_id, p_lead_officer_id, 'LEAD_INVESTIGATOR', CURRENT_TIMESTAMP)
        ON CONFLICT (case_id, officer_id) DO NOTHING;
    END IF;

    -- Record initial audit entry in case activity log
    INSERT INTO case_activity (
        case_id, activity_type, description, officer_id, old_value, new_value, timestamp
    ) VALUES (
        p_new_case_id,
        'CASE_INITIALIZED',
        CONCAT('Case initialized with priority ', p_priority, ' and category ', p_category, '.'),
        p_lead_officer_id,
        NULL,
        'OPEN',
        CURRENT_TIMESTAMP
    );

    RAISE NOTICE 'Case % (ID: %) successfully provisioned with audit trail.', p_case_number, p_new_case_id;
END;
$$;

-- Demonstration Call:
-- CALL sp_create_investigation_case('CAS-2026-CYB-777', 'Operation Dark Grid', 'Ransomware telemetry', 'CYBERCRIME', 'HIGH', 'SECRET', 1, NULL);


-- ============================================================================
-- 2. USER-DEFINED FUNCTION: fn_get_case_summary
-- Purpose: Aggregates metrics for any given case into a standardized JSON payload,
-- including counts of linked suspects, organizations, evidence, and lead officer.
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_get_case_summary(p_case_id INT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'case_id', c.id,
        'case_number', c.case_number,
        'title', c.title,
        'status', c.status,
        'priority', c.priority,
        'classification', c.classification,
        'lead_officer', CASE 
            WHEN o.id IS NOT NULL THEN CONCAT(o.first_name, ' ', o.last_name, ' (', o.badge_number, ')') 
            ELSE 'UNASSIGNED' 
        END,
        'statistics', jsonb_build_object(
            'suspect_count', (SELECT COUNT(*) FROM case_people WHERE case_id = c.id AND role = 'SUSPECT'),
            'total_people', (SELECT COUNT(*) FROM case_people WHERE case_id = c.id),
            'organizations', (SELECT COUNT(*) FROM case_organizations WHERE case_id = c.id),
            'vehicles', (SELECT COUNT(*) FROM case_vehicles WHERE case_id = c.id),
            'devices', (SELECT COUNT(*) FROM case_devices WHERE case_id = c.id),
            'locations', (SELECT COUNT(*) FROM case_locations WHERE case_id = c.id),
            'evidence_count', (SELECT COUNT(*) FROM evidence WHERE case_id = c.id)
        ),
        'opened_date', c.opened_date,
        'last_updated', c.updated_at
    )
    INTO v_result
    FROM cases c
    LEFT JOIN officers o ON c.lead_officer_id = o.id
    WHERE c.id = p_case_id;

    IF v_result IS NULL THEN
        RAISE EXCEPTION 'Case with ID % not found.', p_case_id;
    END IF;

    RETURN v_result;
END;
$$;

-- Demonstration Call:
-- SELECT fn_get_case_summary(1);


-- ============================================================================
-- 3. AUDIT TRIGGER & TRIGGER FUNCTION: trg_case_activity_log
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
            case_id, activity_type, description, officer_id, old_value, new_value, timestamp
        ) VALUES (
            NEW.id,
            'STATUS_CHANGE',
            CONCAT('Investigation status modified from "', OLD.status, '" to "', NEW.status, '".'),
            NEW.lead_officer_id,
            OLD.status,
            NEW.status,
            CURRENT_TIMESTAMP
        );
    END IF;

    -- Check if priority has transitioned
    IF (OLD.priority IS DISTINCT FROM NEW.priority) THEN
        INSERT INTO case_activity (
            case_id, activity_type, description, officer_id, old_value, new_value, timestamp
        ) VALUES (
            NEW.id,
            'PRIORITY_CHANGE',
            CONCAT('Urgency priority updated from "', OLD.priority, '" to "', NEW.priority, '".'),
            NEW.lead_officer_id,
            OLD.priority,
            NEW.priority,
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


-- ============================================================================
-- 4. RECURSIVE COMMON TABLE EXPRESSION (CTE): Multi-Hop Network Traversal
-- Purpose: Uncovers criminal syndicate association networks by recursively traversing
-- shared case connections up to 3 degrees of separation starting from suspect #1.
-- ============================================================================

WITH RECURSIVE suspect_network AS (
    -- Anchor member: Initial suspect
    SELECT 
        cp.person_id AS source_person_id,
        cp.person_id AS current_person_id,
        cp.case_id,
        1 AS depth,
        ARRAY[cp.person_id] AS path
    FROM case_people cp
    WHERE cp.person_id = 1

    UNION

    -- Recursive member: Find all people who co-occur in any case with current suspects
    SELECT 
        sn.source_person_id,
        next_cp.person_id AS current_person_id,
        next_cp.case_id,
        sn.depth + 1,
        sn.path || next_cp.person_id
    FROM suspect_network sn
    JOIN case_people curr_cp ON sn.current_person_id = curr_cp.person_id
    JOIN case_people next_cp ON curr_cp.case_id = next_cp.case_id
    WHERE NOT (next_cp.person_id = ANY(sn.path))
      AND sn.depth < 3
)
SELECT DISTINCT
    sn.source_person_id,
    p_orig.first_name || ' ' || p_orig.last_name AS root_suspect,
    sn.current_person_id AS connected_person_id,
    p_target.first_name || ' ' || p_target.last_name AS connected_name,
    p_target.alias AS connected_alias,
    p_target.risk_level,
    sn.depth AS degrees_of_separation
FROM suspect_network sn
JOIN people p_orig ON sn.source_person_id = p_orig.id
JOIN people p_target ON sn.current_person_id = p_target.id
WHERE sn.source_person_id <> sn.current_person_id
ORDER BY sn.depth, p_target.risk_level DESC;


-- ============================================================================
-- 5. ANALYTICAL CTE: High-Risk Officer Workload & Case Density Distribution
-- Purpose: Evaluates operational pressure by categorizing officers according to
-- critical case volume and evidence custody count.
-- ============================================================================

WITH OfficerCaseStats AS (
    SELECT 
        o.id AS officer_id,
        CONCAT(o.first_name, ' ', o.last_name) AS officer_name,
        o.unit,
        COUNT(c.id) AS total_assigned_cases,
        COUNT(CASE WHEN c.priority = 'CRITICAL' THEN 1 END) AS critical_case_count,
        COUNT(CASE WHEN c.status = 'OPEN' THEN 1 END) AS active_case_count
    FROM officers o
    LEFT JOIN cases c ON o.id = c.lead_officer_id
    GROUP BY o.id, o.first_name, o.last_name, o.unit
),
OfficerEvidenceStats AS (
    SELECT 
        collected_by_officer_id AS officer_id,
        COUNT(id) AS total_evidence_collected
    FROM evidence
    GROUP BY collected_by_officer_id
)
SELECT 
    ocs.officer_id,
    ocs.officer_name,
    ocs.unit,
    ocs.total_assigned_cases,
    ocs.critical_case_count,
    ocs.active_case_count,
    COALESCE(oes.total_evidence_collected, 0) AS total_evidence_collected,
    CASE 
        WHEN ocs.critical_case_count >= 2 THEN 'HIGH_BURDEN'
        WHEN ocs.active_case_count >= 1 THEN 'MODERATE_BURDEN'
        ELSE 'AVAILABLE'
    END AS operational_status
FROM OfficerCaseStats ocs
LEFT JOIN OfficerEvidenceStats oes ON ocs.officer_id = oes.officer_id
ORDER BY ocs.critical_case_count DESC, ocs.active_case_count DESC;
