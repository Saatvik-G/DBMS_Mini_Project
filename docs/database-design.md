# Intelligence Fusion Platform — Database Design & Schema Specification

**Course:** Database Management Systems Mini Project (UE24CS395/DBMS)  
**Project Title:** Intelligence Fusion Platform (Polyglot Investigation System)  
**Authors:** Saatvik Gupta (`PES1UG24CS395`) & Satyam Goyal (`PES1UG24CS424`)  
**Architecture:** 22 Relational Tables (10 Core Entity & Audit + 12 Junction Tables) in 3NF/BCNF + MongoDB Document Store

---

## 1. Complete Relational Schema Table Specifications (22 Relations)

### 1.1 Primary Entity & Audit Relations (10 Tables)

#### 1. `officers` (Law Enforcement Personnel & RBAC Registry)
| Column Name | Data Type | Constraints & Key Attributes | Description |
|:---|:---|:---|:---|
| `officer_id` | `VARCHAR(50)` | **PRIMARY KEY** | Unique officer identifier (e.g. `OFF-001`) |
| `full_name` | `VARCHAR(150)` | `NOT NULL` | Legal name of the officer |
| `badge_number` | `VARCHAR(50)` | `NOT NULL`, **UNIQUE** | Official badge number (e.g. `CID-001`) |
| `department` | `VARCHAR(100)` | `NOT NULL` | Operating division or unit |
| `contact_email` | `VARCHAR(120)` | `NOT NULL`, **UNIQUE** | Official government contact email |
| `role` | `VARCHAR(100)` | `NOT NULL`, `DEFAULT 'INVESTIGATOR'`, **CHECK** (`role IN ('ADMIN', 'INVESTIGATOR')`) | Role for application authorization |
| `account_status` | `VARCHAR(50)` | `NOT NULL`, `DEFAULT 'Active'`, **CHECK** (`account_status IN ('Active', 'Suspended', 'On Leave')`) | Security credential status |
| `hashed_password` | `VARCHAR(255)` | `NOT NULL` | PBKDF2 cryptographic password hash |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | System provisioning timestamp |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Last profile update timestamp |

#### 2. `cases` (Master Investigation Dossiers)
| Column Name | Data Type | Constraints & Key Attributes | Description |
|:---|:---|:---|:---|
| `case_id` | `VARCHAR(50)` | **PRIMARY KEY** | Primary case identifier (e.g. `CASE-2026-001`) |
| `title` | `VARCHAR(200)` | `NOT NULL` | Operational code name or incident title |
| `description` | `TEXT` | `NOT NULL` | Detailed investigation narrative |
| `case_type` | `VARCHAR(100)` | `NOT NULL` | Category (e.g. Cybercrime, Narcotics) |
| `status` | `VARCHAR(50)` | `NOT NULL`, `DEFAULT 'Open'`, **CHECK** (`status IN ('Open', 'Under Investigation', 'On Hold', 'Closed')`) | Lifecycle stage |
| `priority` | `VARCHAR(50)` | `NOT NULL`, `DEFAULT 'Medium'`, **CHECK** (`priority IN ('Low', 'Medium', 'High', 'Critical')`) | Casework urgency |
| `lead_officer_id` | `VARCHAR(50)` | **FOREIGN KEY** $\to$ `officers(officer_id)` `ON DELETE SET NULL` | Assigned lead investigator |
| `incident_date` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Alleged crime timestamp |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Case filing timestamp |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Last modification timestamp |

#### 3. `people` (Subjects, Witnesses, Victims, Informants)
| Column Name | Data Type | Constraints & Key Attributes | Description |
|:---|:---|:---|:---|
| `person_id` | `VARCHAR(50)` | **PRIMARY KEY** | Unique individual identifier (e.g. `PER-001`) |
| `full_name` | `VARCHAR(150)` | `NOT NULL` | Individual full legal name |
| `category` | `VARCHAR(50)` | `NOT NULL`, `DEFAULT 'Subject'`, **CHECK** (`category IN ('Subject', 'Witness', 'Reporting Party', 'Other')`) | Legal designation |
| `contact_phone` | `VARCHAR(50)` | Nullable | Primary telecommunications number |
| `contact_email` | `VARCHAR(120)` | Nullable | Electronic mail address |
| `address` | `TEXT` | Nullable | Known residential or operating location |
| `notes` | `TEXT` | Nullable | Field intelligence notes and behavioral profile |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Intake timestamp |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Update timestamp |

#### 4. `organizations` (Commercial, Front, and Syndicate Entities)
| Column Name | Data Type | Constraints & Key Attributes | Description |
|:---|:---|:---|:---|
| `organization_id` | `VARCHAR(50)` | **PRIMARY KEY** | Organization identifier (e.g. `ORG-001`) |
| `name` | `VARCHAR(200)` | `NOT NULL` | Legal or corporate registered name |
| `org_type` | `VARCHAR(100)` | `NOT NULL` | Sector (Logistics, Corporate Front, Workshop) |
| `registration_number` | `VARCHAR(100)` | Nullable | Corporate registrar / tax ID |
| `address` | `TEXT` | Nullable | Registered corporate office address |
| `notes` | `TEXT` | Nullable | Intelligence summary |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Record update timestamp |

#### 5. `vehicles` (Impounded and Monitored Transport)
| Column Name | Data Type | Constraints & Key Attributes | Description |
|:---|:---|:---|:---|
| `vehicle_id` | `VARCHAR(50)` | **PRIMARY KEY** | Unique vehicle identifier (e.g. `VEH-001`) |
| `registration_number` | `VARCHAR(50)` | `NOT NULL`, **UNIQUE** | License plate registration number |
| `make` | `VARCHAR(100)` | `NOT NULL` | Manufacturer brand |
| `model` | `VARCHAR(100)` | `NOT NULL` | Vehicle model name |
| `color` | `VARCHAR(50)` | Nullable | Vehicle exterior color |
| `vehicle_type` | `VARCHAR(50)` | Nullable | Classification (Sedan, Commercial, SUV) |
| `description` | `TEXT` | Nullable | Distinguishing marks and surveillance history |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Record update timestamp |

#### 6. `devices` (Electronic Hardware Exhibits)
| Column Name | Data Type | Constraints & Key Attributes | Description |
|:---|:---|:---|:---|
| `device_id` | `VARCHAR(50)` | **PRIMARY KEY** | Exhibit device identifier (e.g. `DEV-001`) |
| `device_type` | `VARCHAR(100)` | `NOT NULL` | Form factor (Smartphone, Laptop, Server) |
| `model` | `VARCHAR(100)` | Nullable | Hardware model identifier |
| `serial_number` | `VARCHAR(100)` | `NOT NULL`, **UNIQUE** | Factory IMEI or hardware serial number |
| `notes` | `TEXT` | Nullable | Forensic extraction status |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Intake timestamp |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Modification timestamp |

#### 7. `locations` (Crime Scenes & Geospatial Points)
| Column Name | Data Type | Constraints & Key Attributes | Description |
|:---|:---|:---|:---|
| `location_id` | `VARCHAR(50)` | **PRIMARY KEY** | Location identifier (e.g. `LOC-001`) |
| `name` | `VARCHAR(200)` | `NOT NULL` | Common name or landmark designation |
| `address` | `TEXT` | Nullable | Street address |
| `city` | `VARCHAR(100)` | Nullable | City or municipality |
| `latitude` | `DOUBLE PRECISION` | Nullable | WGS84 GPS latitude coordinate |
| `longitude` | `DOUBLE PRECISION` | Nullable | WGS84 GPS longitude coordinate |
| `notes` | `TEXT` | Nullable | Site access notes |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Record timestamp |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Record timestamp |

#### 8. `evidence` (Seized Legal Exhibits)
| Column Name | Data Type | Constraints & Key Attributes | Description |
|:---|:---|:---|:---|
| `evidence_id` | `VARCHAR(50)` | **PRIMARY KEY** | Evidence tracking identifier (e.g. `EVD-001`) |
| `case_id` | `VARCHAR(50)` | `NOT NULL`, **FOREIGN KEY** $\to$ `cases(case_id)` `ON DELETE CASCADE` | Parent investigation case |
| `title` | `VARCHAR(200)` | `NOT NULL` | Description of physical/digital item |
| `description` | `TEXT` | Nullable | Detailed forensic condition notes |
| `evidence_type` | `VARCHAR(100)` | `NOT NULL` | Exhibit type (Physical, Digital, Document) |
| `storage_reference` | `VARCHAR(100)` | Nullable | Vault locker or warehouse shelf tag |
| `collected_date` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Seizure timestamp |
| `collected_by_officer_id` | `VARCHAR(50)` | **FOREIGN KEY** $\to$ `officers(officer_id)` `ON DELETE SET NULL` | Seizing officer |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | System intake timestamp |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Record timestamp |

#### 9. `evidence_custody` (Immutable Custody Audit Trail)
| Column Name | Data Type | Constraints & Key Attributes | Description |
|:---|:---|:---|:---|
| `custody_event_id` | `INTEGER` | **PRIMARY KEY** (Auto-increment) | Sequential audit entry ID |
| `evidence_id` | `VARCHAR(50)` | `NOT NULL`, **FOREIGN KEY** $\to$ `evidence(evidence_id)` `ON DELETE CASCADE` | Tracked exhibit |
| `officer_id` | `VARCHAR(50)` | `NOT NULL`, **FOREIGN KEY** $\to$ `officers(officer_id)` `ON DELETE RESTRICT` | Custodial transfer officer |
| `event_type` | `VARCHAR(100)` | `NOT NULL` | Action (Seized, Lab Analysis, Vault Stored) |
| `event_timestamp` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Exact chronological transfer time |
| `notes` | `TEXT` | Nullable | Legal handoff justification |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Immutable log creation timestamp |

#### 10. `case_activity` (Chronological Case Audit Log)
| Column Name | Data Type | Constraints & Key Attributes | Description |
|:---|:---|:---|:---|
| `activity_id` | `INTEGER` | **PRIMARY KEY** (Auto-increment) | Sequential activity event ID |
| `case_id` | `VARCHAR(50)` | `NOT NULL`, **FOREIGN KEY** $\to$ `cases(case_id)` `ON DELETE CASCADE` | Associated case |
| `activity_type` | `VARCHAR(100)` | `NOT NULL` | Transition type (STATUS_CHANGE, NOTE) |
| `title` | `VARCHAR(200)` | `NOT NULL` | Event summary label |
| `description` | `TEXT` | Nullable | Detailed transition context or diff |
| `officer_id` | `VARCHAR(50)` | **FOREIGN KEY** $\to$ `officers(officer_id)` `ON DELETE SET NULL` | Acting officer |
| `activity_timestamp` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Event timestamp |

---

### 1.2 Associative Junction Tables (12 Bridge Tables)

Every Many-to-Many association is resolved through a dedicated bridge table featuring composite primary keys and referential cascade deletes:

| Table Name | Composite Primary Key | Foreign Key 1 | Foreign Key 2 | Descriptive Attributes |
|:---|:---|:---|:---|:---|
| `case_people` | `(case_id, person_id)` | `cases(case_id)` `ON DELETE CASCADE` | `people(person_id)` `ON DELETE CASCADE` | `role_in_case VARCHAR(100)`, `notes TEXT`, `added_at TIMESTAMP` |
| `case_organizations` | `(case_id, organization_id)` | `cases(case_id)` `ON DELETE CASCADE` | `organizations(organization_id)` `ON DELETE CASCADE` | `association_type VARCHAR(100)`, `notes TEXT`, `added_at TIMESTAMP` |
| `case_vehicles` | `(case_id, vehicle_id)` | `cases(case_id)` `ON DELETE CASCADE` | `vehicles(vehicle_id)` `ON DELETE CASCADE` | `role_in_case VARCHAR(100)`, `notes TEXT`, `added_at TIMESTAMP` |
| `case_devices` | `(case_id, device_id)` | `cases(case_id)` `ON DELETE CASCADE` | `devices(device_id)` `ON DELETE CASCADE` | `role_in_case VARCHAR(100)`, `notes TEXT`, `added_at TIMESTAMP` |
| `case_locations` | `(case_id, location_id)` | `cases(case_id)` `ON DELETE CASCADE` | `locations(location_id)` `ON DELETE CASCADE` | `association_type VARCHAR(100)`, `notes TEXT`, `added_at TIMESTAMP` |
| `person_organizations` | `(person_id, organization_id)` | `people(person_id)` `ON DELETE CASCADE` | `organizations(organization_id)` `ON DELETE CASCADE` | `role VARCHAR(100)`, `added_at TIMESTAMP` |
| `person_vehicles` | `(person_id, vehicle_id)` | `people(person_id)` `ON DELETE CASCADE` | `vehicles(vehicle_id)` `ON DELETE CASCADE` | `relationship_type VARCHAR(100)`, `added_at TIMESTAMP` |
| `person_devices` | `(person_id, device_id)` | `people(person_id)` `ON DELETE CASCADE` | `devices(device_id)` `ON DELETE CASCADE` | `relationship_type VARCHAR(100)`, `added_at TIMESTAMP` |
| `evidence_people` | `(evidence_id, person_id)` | `evidence(evidence_id)` `ON DELETE CASCADE` | `people(person_id)` `ON DELETE CASCADE` | `association_type VARCHAR(100)`, `added_at TIMESTAMP` |
| `evidence_vehicles` | `(evidence_id, vehicle_id)` | `evidence(evidence_id)` `ON DELETE CASCADE` | `vehicles(vehicle_id)` `ON DELETE CASCADE` | `association_type VARCHAR(100)`, `added_at TIMESTAMP` |
| `evidence_devices` | `(evidence_id, device_id)` | `evidence(evidence_id)` `ON DELETE CASCADE` | `devices(device_id)` `ON DELETE CASCADE` | `association_type VARCHAR(100)`, `added_at TIMESTAMP` |
| `evidence_locations` | `(evidence_id, location_id)` | `evidence(evidence_id)` `ON DELETE CASCADE` | `locations(location_id)` `ON DELETE CASCADE` | `association_type VARCHAR(100)`, `added_at TIMESTAMP` |

---

## 2. Normalization Justification & Proofs

### 2.1 First Normal Form (1NF)
* **Requirement:** Attribute values must be atomic; no repeating groups, arrays, or comma-separated lists.
* **Verification:** In `people`, contact details are scalar. When an individual possesses multiple phone numbers or hardware, they are decoupled into `person_devices` rather than stored as an unnormalized delimited string. In `cases`, multiple suspects and exhibits are decoupled into junction tables.

### 2.2 Second Normal Form (2NF)
* **Requirement:** Must satisfy 1NF, and no non-prime attribute may partially depend on a composite candidate key.
* **Verification:** In junction tables such as `case_people(case_id, person_id)`, the attributes `role_in_case`, `notes`, and `added_at` depend strictly on the **entire composite key** `(case_id, person_id)`. Knowing only `case_id` or only `person_id` cannot determine an individual's role in a specific case.

### 2.3 Third Normal Form (3NF)
* **Requirement:** Must satisfy 2NF, and no non-prime attribute may transitively depend on a candidate key ($X \to Y \to Z$ eliminated).
* **Concrete Functional Dependency Proof:**
  * Unnormalized Design: `cases(case_id, title, lead_officer_id, officer_name, officer_department)`.
  * Functional Dependencies: $\text{case\_id} \to \text{lead\_officer\_id}$ and $\text{lead\_officer\_id} \to \text{officer\_department}$.
  * This induces a transitive dependency: $\text{case\_id} \to \text{officer\_department}$.
  * Decomposed Design: `cases` retains only the foreign key `lead_officer_id`, while `officer_name` and `officer_department` are isolated in `officers(officer_id, full_name, department)`. This eliminates transitive anomalies.

### 2.4 Boyce-Codd Normal Form (BCNF)
* **Requirement:** For every non-trivial functional dependency $X \to Y$, the determinant $X$ must be a **superkey**.
* **Verification:** In all relations, the determinants are candidate keys:
  * In `officers`: determinants are `officer_id`, `badge_number`, `contact_email` (all candidate keys).
  * In `vehicles`: determinants are `vehicle_id` and `registration_number` (both candidate keys).
  * In `devices`: determinants are `device_id` and `serial_number` (both candidate keys).
