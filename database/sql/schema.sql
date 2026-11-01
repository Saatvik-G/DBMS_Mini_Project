-- ============================================================================
-- INTELLIGENCE FUSION PLATFORM — RELATIONAL DATABASE DDL SCHEMA (22 TABLES)
-- Target DBMS: PostgreSQL 14+ / 15+ & SQLite 3 Compatible DDL
-- Authors: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)
-- Subject: Database Management Systems (DBMS Mini Project - UE24CS395)
-- Architecture: 10 Primary Entity & Audit Tables + 12 Associative Junction Tables
-- ============================================================================

-- Clean slate drop in reverse dependency order
DROP TABLE IF EXISTS evidence_locations CASCADE;
DROP TABLE IF EXISTS evidence_devices CASCADE;
DROP TABLE IF EXISTS evidence_vehicles CASCADE;
DROP TABLE IF EXISTS evidence_people CASCADE;
DROP TABLE IF EXISTS person_devices CASCADE;
DROP TABLE IF EXISTS person_vehicles CASCADE;
DROP TABLE IF EXISTS person_organizations CASCADE;
DROP TABLE IF EXISTS case_locations CASCADE;
DROP TABLE IF EXISTS case_devices CASCADE;
DROP TABLE IF EXISTS case_vehicles CASCADE;
DROP TABLE IF EXISTS case_organizations CASCADE;
DROP TABLE IF EXISTS case_people CASCADE;
DROP TABLE IF EXISTS case_activity CASCADE;
DROP TABLE IF EXISTS evidence_custody CASCADE;
DROP TABLE IF EXISTS evidence CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS officers CASCADE;

-- ============================================================================
-- 1. PRIMARY ENTITY TABLES (10 Core Tables)
-- ============================================================================

-- 1.1 OFFICERS (Law enforcement personnel, credentials, and RBAC)
CREATE TABLE officers (
    officer_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    badge_number VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    contact_email VARCHAR(120) NOT NULL UNIQUE,
    role VARCHAR(100) NOT NULL DEFAULT 'INVESTIGATOR'
        CHECK (role IN ('ADMIN', 'INVESTIGATOR')),
    account_status VARCHAR(50) NOT NULL DEFAULT 'Active'
        CHECK (account_status IN ('Active', 'Suspended', 'On Leave')),
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 CASES (Central investigation incidents)
CREATE TABLE cases (
    case_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    case_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open'
        CHECK (status IN ('Open', 'Under Investigation', 'On Hold', 'Closed')),
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium'
        CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    lead_officer_id VARCHAR(50) REFERENCES officers(officer_id) ON DELETE SET NULL,
    incident_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.3 PEOPLE (Persons of interest, suspects, witnesses, victims)
CREATE TABLE people (
    person_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth VARCHAR(50),
    contact_details VARCHAR(200),
    address TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'Other'
        CHECK (category IN ('Witness', 'Reporting Party', 'Subject', 'Other')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.4 ORGANIZATIONS (Corporations, criminal syndicates, front companies)
CREATE TABLE organizations (
    organization_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    organization_type VARCHAR(100) NOT NULL,
    address TEXT,
    contact_details VARCHAR(200),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.5 VEHICLES (Transport assets with unique registrations)
CREATE TABLE vehicles (
    vehicle_id VARCHAR(50) PRIMARY KEY,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL DEFAULT 'Sedan',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.6 DEVICES (Electronic hardware exhibits)
CREATE TABLE devices (
    device_id VARCHAR(50) PRIMARY KEY,
    device_type VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.7 LOCATIONS (Physical crime scenes and geolocations)
CREATE TABLE locations (
    location_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    location_type VARCHAR(100) NOT NULL DEFAULT 'Commercial',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.8 EVIDENCE (Seized legal exhibits)
CREATE TABLE evidence (
    evidence_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    evidence_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    collection_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    case_id VARCHAR(50) NOT NULL REFERENCES cases(case_id) ON DELETE RESTRICT,
    collected_by_officer_id VARCHAR(50) REFERENCES officers(officer_id) ON DELETE SET NULL,
    storage_reference VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Logged in Secure Storage',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.9 EVIDENCE CUSTODY (Immutable temporal audit chain)
CREATE TABLE evidence_custody (
    custody_event_id SERIAL PRIMARY KEY,
    evidence_id VARCHAR(50) NOT NULL REFERENCES evidence(evidence_id) ON DELETE CASCADE,
    officer_id VARCHAR(50) NOT NULL REFERENCES officers(officer_id) ON DELETE RESTRICT,
    event_type VARCHAR(100) NOT NULL,
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 1.10 CASE ACTIVITY (Chronological case event timeline)
CREATE TABLE case_activity (
    activity_id SERIAL PRIMARY KEY,
    case_id VARCHAR(50) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    officer_id VARCHAR(50) REFERENCES officers(officer_id) ON DELETE SET NULL,
    activity_type VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    activity_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. ASSOCIATIVE JUNCTION TABLES (12 M:N Tables)
-- ============================================================================

-- 2.1 CASE - PEOPLE
CREATE TABLE case_people (
    case_id VARCHAR(50) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    person_id VARCHAR(50) NOT NULL REFERENCES people(person_id) ON DELETE CASCADE,
    role_in_case VARCHAR(100) DEFAULT 'Associated Person',
    notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (case_id, person_id)
);

-- 2.2 CASE - ORGANIZATIONS
CREATE TABLE case_organizations (
    case_id VARCHAR(50) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    organization_id VARCHAR(50) NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
    association_type VARCHAR(100) DEFAULT 'Under Investigation / Related',
    notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (case_id, organization_id)
);

-- 2.3 CASE - VEHICLES
CREATE TABLE case_vehicles (
    case_id VARCHAR(50) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    vehicle_id VARCHAR(50) NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    role_in_case VARCHAR(100) DEFAULT 'Vehicle of Interest',
    notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (case_id, vehicle_id)
);

-- 2.4 CASE - DEVICES
CREATE TABLE case_devices (
    case_id VARCHAR(50) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    device_id VARCHAR(50) NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
    role_in_case VARCHAR(100) DEFAULT 'Digital Evidence / Device',
    notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (case_id, device_id)
);

-- 2.5 CASE - LOCATIONS
CREATE TABLE case_locations (
    case_id VARCHAR(50) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    location_id VARCHAR(50) NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
    association_type VARCHAR(100) DEFAULT 'Incident Site / Point of Interest',
    notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (case_id, location_id)
);

-- 2.6 PERSON - ORGANIZATIONS
CREATE TABLE person_organizations (
    person_id VARCHAR(50) NOT NULL REFERENCES people(person_id) ON DELETE CASCADE,
    organization_id VARCHAR(50) NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
    role VARCHAR(100) DEFAULT 'Member / Employee',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (person_id, organization_id)
);

-- 2.7 PERSON - VEHICLES
CREATE TABLE person_vehicles (
    person_id VARCHAR(50) NOT NULL REFERENCES people(person_id) ON DELETE CASCADE,
    vehicle_id VARCHAR(50) NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) DEFAULT 'Registered Owner / Driver',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (person_id, vehicle_id)
);

-- 2.8 PERSON - DEVICES
CREATE TABLE person_devices (
    person_id VARCHAR(50) NOT NULL REFERENCES people(person_id) ON DELETE CASCADE,
    device_id VARCHAR(50) NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) DEFAULT 'User / Owner',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (person_id, device_id)
);

-- 2.9 EVIDENCE - PEOPLE
CREATE TABLE evidence_people (
    evidence_id VARCHAR(50) NOT NULL REFERENCES evidence(evidence_id) ON DELETE CASCADE,
    person_id VARCHAR(50) NOT NULL REFERENCES people(person_id) ON DELETE CASCADE,
    association_type VARCHAR(100) DEFAULT 'Recovered from / Linked to',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (evidence_id, person_id)
);

-- 2.10 EVIDENCE - VEHICLES
CREATE TABLE evidence_vehicles (
    evidence_id VARCHAR(50) NOT NULL REFERENCES evidence(evidence_id) ON DELETE CASCADE,
    vehicle_id VARCHAR(50) NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    association_type VARCHAR(100) DEFAULT 'Found in / Associated with',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (evidence_id, vehicle_id)
);

-- 2.11 EVIDENCE - DEVICES
CREATE TABLE evidence_devices (
    evidence_id VARCHAR(50) NOT NULL REFERENCES evidence(evidence_id) ON DELETE CASCADE,
    device_id VARCHAR(50) NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
    association_type VARCHAR(100) DEFAULT 'Extracted from / Hardware correlation',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (evidence_id, device_id)
);

-- 2.12 EVIDENCE - LOCATIONS
CREATE TABLE evidence_locations (
    evidence_id VARCHAR(50) NOT NULL REFERENCES evidence(evidence_id) ON DELETE CASCADE,
    location_id VARCHAR(50) NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
    association_type VARCHAR(100) DEFAULT 'Found at location',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (evidence_id, location_id)
);

-- ============================================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE SEARCH & JOINS
-- ============================================================================

CREATE INDEX idx_cases_lead_officer ON cases(lead_officer_id);
CREATE INDEX idx_cases_status_priority ON cases(status, priority);
CREATE INDEX idx_cases_created ON cases(created_at);
CREATE INDEX idx_evidence_case ON evidence(case_id);
CREATE INDEX idx_evidence_type_status ON evidence(evidence_type, status);
CREATE INDEX idx_custody_evidence ON evidence_custody(evidence_id);
CREATE INDEX idx_custody_timestamp ON evidence_custody(event_timestamp DESC);
CREATE INDEX idx_case_activity_case_ts ON case_activity(case_id, activity_timestamp DESC);

CREATE INDEX idx_people_name ON people(full_name);
CREATE INDEX idx_people_category ON people(category);
CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX idx_devices_serial ON devices(serial_number);
CREATE INDEX idx_locations_name ON locations(name);

CREATE INDEX idx_cp_person ON case_people(person_id);
CREATE INDEX idx_co_org ON case_organizations(organization_id);
CREATE INDEX idx_cv_vehicle ON case_vehicles(vehicle_id);
CREATE INDEX idx_cd_device ON case_devices(device_id);
CREATE INDEX idx_cl_location ON case_locations(location_id);
