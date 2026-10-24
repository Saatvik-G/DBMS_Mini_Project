-- ============================================================================
-- INTELLIGENCE FUSION PLATFORM — RELATIONAL DATABASE DDL SCHEMA
-- Target DBMS: PostgreSQL 14+ / 15+
-- Authors: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)
-- Subject: Database Management Systems (DBMS Mini Project)
-- ============================================================================

-- Clean slate initialization (drops in reverse dependency order)
DROP TABLE IF EXISTS case_activity CASCADE;
DROP TABLE IF EXISTS evidence_custody CASCADE;
DROP TABLE IF EXISTS evidence_locations CASCADE;
DROP TABLE IF EXISTS evidence_devices CASCADE;
DROP TABLE IF EXISTS evidence_vehicles CASCADE;
DROP TABLE IF EXISTS evidence_people CASCADE;
DROP TABLE IF EXISTS person_devices CASCADE;
DROP TABLE IF EXISTS person_vehicles CASCADE;
DROP TABLE IF EXISTS person_organizations CASCADE;
DROP TABLE IF EXISTS case_officers CASCADE;
DROP TABLE IF EXISTS case_locations CASCADE;
DROP TABLE IF EXISTS case_devices CASCADE;
DROP TABLE IF EXISTS case_vehicles CASCADE;
DROP TABLE IF EXISTS case_organizations CASCADE;
DROP TABLE IF EXISTS case_people CASCADE;
DROP TABLE IF EXISTS evidence CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS officers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PRIMARY ENTITY TABLES
-- ============================================================================

-- 1.1 USERS (System credentials and RBAC)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'INVESTIGATOR' 
        CHECK (role IN ('ADMIN', 'INVESTIGATOR', 'ANALYST', 'AUDITOR')),
    badge_number VARCHAR(30) UNIQUE,
    department VARCHAR(80) DEFAULT 'Criminal Investigation Division',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 OFFICERS (Law enforcement personnel assigned to cases)
CREATE TABLE officers (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    badge_number VARCHAR(30) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    rank VARCHAR(50) NOT NULL,
    unit VARCHAR(80) NOT NULL,
    phone VARCHAR(25),
    email VARCHAR(120) NOT NULL UNIQUE,
    clearance_level VARCHAR(20) NOT NULL DEFAULT 'SECRET' 
        CHECK (clearance_level IN ('UNCLASSIFIED', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'RETIRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.3 CASES (Central investigation incidents)
CREATE TABLE cases (
    id SERIAL PRIMARY KEY,
    case_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL 
        CHECK (category IN ('CYBERCRIME', 'FINANCIAL_FRAUD', 'ORGANIZED_CRIME', 'COUNTER_TERRORISM', 'NARCOTICS', 'HOMICIDE', 'ESPIONAGE')),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' 
        CHECK (status IN ('OPEN', 'UNDER_INVESTIGATION', 'PENDING_CHARGES', 'CLOSED', 'COLD_CASE')),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' 
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    classification VARCHAR(20) NOT NULL DEFAULT 'SECRET' 
        CHECK (classification IN ('UNCLASSIFIED', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET')),
    lead_officer_id INT REFERENCES officers(id) ON DELETE SET NULL,
    incident_date TIMESTAMP WITH TIME ZONE,
    opened_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.4 PEOPLE (Persons of interest, suspects, witnesses, victims)
CREATE TABLE people (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    alias VARCHAR(80),
    national_id VARCHAR(50) UNIQUE,
    passport_number VARCHAR(50) UNIQUE,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'UNKNOWN')),
    nationality VARCHAR(50) DEFAULT 'Indian',
    phone VARCHAR(30),
    email VARCHAR(120),
    address TEXT,
    risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW' 
        CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'EXTREME')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.5 ORGANIZATIONS (Corporations, syndicates, front companies, NGOs)
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    legal_name VARCHAR(200),
    registration_number VARCHAR(60) UNIQUE,
    org_type VARCHAR(50) NOT NULL 
        CHECK (org_type IN ('CORPORATION', 'SHELL_COMPANY', 'NGO', 'CRIMINAL_SYNDICATE', 'FINANCIAL_INSTITUTION', 'GOVERNMENT', 'OTHER')),
    jurisdiction VARCHAR(80) DEFAULT 'India',
    address TEXT,
    phone VARCHAR(30),
    website VARCHAR(150),
    is_illicit BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.6 VEHICLES (Cars, trucks, watercraft, aircraft used in incidents)
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(30) NOT NULL UNIQUE,
    vin VARCHAR(50) UNIQUE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    color VARCHAR(30),
    vehicle_type VARCHAR(30) NOT NULL DEFAULT 'AUTOMOBILE'
        CHECK (vehicle_type IN ('AUTOMOBILE', 'MOTORCYCLE', 'TRUCK', 'VAN', 'WATERCRAFT', 'AIRCRAFT', 'OTHER')),
    owner_person_id INT REFERENCES people(id) ON DELETE SET NULL,
    owner_organization_id INT REFERENCES organizations(id) ON DELETE SET NULL,
    is_stolen BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.7 DEVICES (Smartphones, laptops, servers, storage media, hardware wallets)
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(40) NOT NULL 
        CHECK (device_type IN ('SMARTPHONE', 'LAPTOP', 'DESKTOP', 'SERVER', 'HARD_DRIVE', 'USB_DRIVE', 'ROUTER', 'HARDWARE_WALLET', 'OTHER')),
    imei VARCHAR(30) UNIQUE,
    serial_number VARCHAR(60) UNIQUE,
    mac_address VARCHAR(30),
    model VARCHAR(80),
    operating_system VARCHAR(50),
    owner_person_id INT REFERENCES people(id) ON DELETE SET NULL,
    is_compromised BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.8 LOCATIONS (Physical crime scenes, hideouts, surveillance target spots)
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(80) NOT NULL,
    state VARCHAR(80),
    country VARCHAR(80) NOT NULL DEFAULT 'India',
    postal_code VARCHAR(20),
    latitude NUMERIC(10, 7) CHECK (latitude >= -90.0 AND latitude <= 90.0),
    longitude NUMERIC(10, 7) CHECK (longitude >= -180.0 AND longitude <= 180.0),
    location_type VARCHAR(40) NOT NULL DEFAULT 'OTHER'
        CHECK (location_type IN ('RESIDENCE', 'COMMERCIAL', 'WAREHOUSE', 'HIDE_OUT', 'CRIME_SCENE', 'SAFE_HOUSE', 'CHECKPOINT', 'TRANSIT_HUB', 'OTHER')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.9 EVIDENCE (Physical and digital exhibits collected)
CREATE TABLE evidence (
    id SERIAL PRIMARY KEY,
    case_id INT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    tracking_number VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    evidence_type VARCHAR(40) NOT NULL 
        CHECK (evidence_type IN ('DIGITAL_DEVICE', 'DOCUMENT', 'PHYSICAL_ITEM', 'FORENSIC_SAMPLE', 'WEAPON', 'NARCOTICS', 'CURRENCY', 'RECORDING', 'OTHER')),
    collected_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    collected_by_officer_id INT REFERENCES officers(id) ON DELETE SET NULL,
    storage_location VARCHAR(120) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'IN_CUSTODY'
        CHECK (status IN ('COLLECTED', 'IN_CUSTODY', 'ANALYZING', 'IN_COURT', 'DESTROYED', 'RELEASED')),
    chain_of_custody_hash VARCHAR(128),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. CASE JUNCTION TABLES (MANY-TO-MANY RELATIONSHIPS)
-- ============================================================================

-- 2.1 CASE - PEOPLE
CREATE TABLE case_people (
    case_id INT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    person_id INT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    role VARCHAR(40) NOT NULL DEFAULT 'SUSPECT' 
        CHECK (role IN ('SUSPECT', 'PERSON_OF_INTEREST', 'WITNESS', 'VICTIM', 'INFORMANT', 'ASSOCIATE')),
    date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    PRIMARY KEY (case_id, person_id)
);

-- 2.2 CASE - ORGANIZATIONS
CREATE TABLE case_organizations (
    case_id INT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL DEFAULT 'TARGET_ORGANIZATION'
        CHECK (relationship_type IN ('TARGET_ORGANIZATION', 'FRONT_COMPANY', 'AFFILIATE', 'VICTIM_ORGANIZATION', 'FINANCIAL_INTERMEDIARY')),
    date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    PRIMARY KEY (case_id, organization_id)
);

-- 2.3 CASE - VEHICLES
CREATE TABLE case_vehicles (
    case_id INT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    involvement_type VARCHAR(50) NOT NULL DEFAULT 'SUSPECT_VEHICLE'
        CHECK (involvement_type IN ('SUSPECT_VEHICLE', 'GETAWAY_VEHICLE', 'VICTIM_VEHICLE', 'SURVEILLED', 'SEIZED')),
    date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    PRIMARY KEY (case_id, vehicle_id)
);

-- 2.4 CASE - DEVICES
CREATE TABLE case_devices (
    case_id INT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    device_id INT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    status_in_case VARCHAR(40) NOT NULL DEFAULT 'SEIZED'
        CHECK (status_in_case IN ('SEIZED', 'ANALYZING', 'SURVEILLED', 'RETURNED', 'EVIDENCE_SOURCE')),
    date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    PRIMARY KEY (case_id, device_id)
);

-- 2.5 CASE - LOCATIONS
CREATE TABLE case_locations (
    case_id INT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    location_id INT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    association_type VARCHAR(50) NOT NULL DEFAULT 'PRIMARY_CRIME_SCENE'
        CHECK (association_type IN ('PRIMARY_CRIME_SCENE', 'SECONDARY_SCENE', 'SUSPECT_HIDEOUT', 'MEETING_POINT', 'STORAGE_FACILITY', 'SURVEILLANCE_POST')),
    date_added TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    PRIMARY KEY (case_id, location_id)
);

-- 2.6 CASE - OFFICERS (Investigation Taskforce)
CREATE TABLE case_officers (
    case_id INT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    officer_id INT NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'INVESTIGATOR'
        CHECK (role IN ('LEAD_INVESTIGATOR', 'INVESTIGATOR', 'FORENSIC_EXPERT', 'ANALYST', 'LIAISON')),
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (case_id, officer_id)
);

-- ============================================================================
-- 3. EVIDENCE ASSOCIATIONS & DIRECT ENTITY JUNCTIONS
-- ============================================================================

-- 3.1 EVIDENCE - PEOPLE (Linking seized exhibits to individuals)
CREATE TABLE evidence_people (
    evidence_id INT NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    person_id INT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    association VARCHAR(40) DEFAULT 'SEIZED_FROM'
        CHECK (association IN ('SEIZED_FROM', 'OWNED_BY', 'TOUCHED_BY', 'DEPICTS')),
    PRIMARY KEY (evidence_id, person_id)
);

-- 3.2 EVIDENCE - VEHICLES
CREATE TABLE evidence_vehicles (
    evidence_id INT NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    association VARCHAR(40) DEFAULT 'RECOVERED_FROM'
        CHECK (association IN ('RECOVERED_FROM', 'LINKED_TO', 'INSTALLED_ON')),
    PRIMARY KEY (evidence_id, vehicle_id)
);

-- 3.3 EVIDENCE - DEVICES
CREATE TABLE evidence_devices (
    evidence_id INT NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    device_id INT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    association VARCHAR(40) DEFAULT 'CONTAINS_DATA_FROM'
        CHECK (association IN ('PHYSICAL_DEVICE', 'CONTAINS_DATA_FROM', 'EXTRACTED_IMAGE')),
    PRIMARY KEY (evidence_id, device_id)
);

-- 3.4 EVIDENCE - LOCATIONS
CREATE TABLE evidence_locations (
    evidence_id INT NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    location_id INT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    association VARCHAR(40) DEFAULT 'FOUND_AT'
        CHECK (association IN ('FOUND_AT', 'STORED_AT', 'TRANSFERRED_THROUGH')),
    PRIMARY KEY (evidence_id, location_id)
);

-- 3.5 PERSON - ORGANIZATIONS
CREATE TABLE person_organizations (
    person_id INT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(60) NOT NULL DEFAULT 'MEMBER',
    start_date DATE,
    end_date DATE,
    is_key_official BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (person_id, organization_id)
);

-- 3.6 PERSON - VEHICLES
CREATE TABLE person_vehicles (
    person_id INT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    relationship VARCHAR(40) NOT NULL DEFAULT 'REGISTERED_OWNER'
        CHECK (relationship IN ('REGISTERED_OWNER', 'FREQUENT_DRIVER', 'PASSENGER', 'LEASING')),
    PRIMARY KEY (person_id, vehicle_id)
);

-- 3.7 PERSON - DEVICES
CREATE TABLE person_devices (
    person_id INT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    device_id INT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    relationship VARCHAR(40) NOT NULL DEFAULT 'PRIMARY_USER'
        CHECK (relationship IN ('PRIMARY_USER', 'SECONDARY_USER', 'PURCHASER')),
    PRIMARY KEY (person_id, device_id)
);

-- ============================================================================
-- 4. AUDIT & CHAIN OF CUSTODY LOGGING TABLES
-- ============================================================================

-- 4.1 EVIDENCE CUSTODY EVENTS (Immutable log of physical/digital handling)
CREATE TABLE evidence_custody (
    id SERIAL PRIMARY KEY,
    evidence_id INT NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    transferred_from_officer_id INT REFERENCES officers(id) ON DELETE RESTRICT,
    transferred_to_officer_id INT NOT NULL REFERENCES officers(id) ON DELETE RESTRICT,
    transfer_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reason TEXT NOT NULL,
    source_location VARCHAR(120),
    destination_location VARCHAR(120) NOT NULL,
    verification_hash VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4.2 CASE ACTIVITY TIMELINE (Automated trigger and manual incident logs)
CREATE TABLE case_activity (
    id SERIAL PRIMARY KEY,
    case_id INT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    activity_type VARCHAR(60) NOT NULL,
    description TEXT NOT NULL,
    officer_id INT REFERENCES officers(id) ON DELETE SET NULL,
    old_value VARCHAR(100),
    new_value VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. PERFORMANCE & INTEGRITY INDEXES
-- ============================================================================

-- Foreign Key Lookup Indexes
CREATE INDEX idx_cases_lead_officer ON cases(lead_officer_id);
CREATE INDEX idx_cases_status_priority ON cases(status, priority);
CREATE INDEX idx_evidence_case ON evidence(case_id);
CREATE INDEX idx_evidence_status_type ON evidence(status, evidence_type);
CREATE INDEX idx_evidence_collected_by ON evidence(collected_by_officer_id);
CREATE INDEX idx_custody_evidence ON evidence_custody(evidence_id);
CREATE INDEX idx_custody_transfer_to ON evidence_custody(transferred_to_officer_id);
CREATE INDEX idx_case_activity_case_ts ON case_activity(case_id, timestamp DESC);

-- Entity Search Indexes
CREATE INDEX idx_people_names ON people(last_name, first_name);
CREATE INDEX idx_people_alias ON people(alias);
CREATE INDEX idx_people_risk ON people(risk_level);
CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_vehicles_plate ON vehicles(license_plate);
CREATE INDEX idx_vehicles_vin ON vehicles(vin);
CREATE INDEX idx_devices_imei ON devices(imei);
CREATE INDEX idx_devices_serial ON devices(serial_number);
CREATE INDEX idx_locations_city ON locations(city, state);

-- Junction Table Search Indexes
CREATE INDEX idx_case_people_person ON case_people(person_id);
CREATE INDEX idx_case_orgs_org ON case_organizations(organization_id);
CREATE INDEX idx_case_veh_veh ON case_vehicles(vehicle_id);
CREATE INDEX idx_case_dev_dev ON case_devices(device_id);
CREATE INDEX idx_case_loc_loc ON case_locations(location_id);
CREATE INDEX idx_case_off_off ON case_officers(officer_id);
