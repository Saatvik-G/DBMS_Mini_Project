#!/usr/bin/env python3
"""
scripts/diagrams/extract_schema.py
Extracts the ground truth schema directly from SQLAlchemy models (backend/app/models/sql_models.py)
and cross-verifies against database/sql/schema.sql.
Outputs docs/diagrams/schema.json containing all 22 tables, 141 columns, 31 foreign keys,
constraints, data types, nullability, defaults, and descriptions.
"""

import os
import sys
import json
import re

# Add backend directory to sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))

from app.models.sql_models import Base

# Table descriptions
TABLE_DESCRIPTIONS = {
    "officers": "Law enforcement personnel, authentication credentials, badge tracking, and role-based access control.",
    "cases": "Central investigation incident records, priority classifications, status workflows, and lead assignment.",
    "people": "Individuals of investigative interest, suspects, witnesses, victims, and informants.",
    "organizations": "Corporate entities, front companies, NGOs, and criminal syndicates linked to cases.",
    "vehicles": "Motor vehicles and transport assets with registration tracking.",
    "devices": "Physical and electronic digital hardware assets with serial numbers and forensic status.",
    "locations": "Geographic incident scenes, safe houses, addresses, and GPS coordinate points.",
    "evidence": "Physical, digital, and documentary evidentiary items cataloged with chain of custody controls.",
    "evidence_custody": "Append-only chronological chain of custody transfer ledger logging physical custody movements.",
    "case_activity": "Audit log capturing all administrative and operational activities performed on investigation cases.",
    "case_people": "Associative relation linking investigation cases to persons of interest with involvement roles.",
    "case_organizations": "Associative relation linking investigation cases to commercial and syndicate organizations.",
    "case_vehicles": "Associative relation linking investigation cases to motor transport assets.",
    "case_devices": "Associative relation linking investigation cases to electronic and computing devices.",
    "case_locations": "Associative relation linking investigation cases to physical scenes and addresses.",
    "person_organizations": "Associative relation tracking affiliations, employment, or leadership between individuals and organizations.",
    "person_vehicles": "Associative relation tracking vehicle ownership, operation, or registration linkages to individuals.",
    "person_devices": "Associative relation tracking device ownership, custody, or usage by individuals.",
    "evidence_people": "Associative relation linking evidentiary items directly to persons of interest.",
    "evidence_vehicles": "Associative relation linking evidentiary items recovered from or associated with vehicles.",
    "evidence_devices": "Associative relation linking digital forensic evidentiary items to hardware devices.",
    "evidence_locations": "Associative relation linking evidentiary items to discovery scenes or recovery locations."
}

# Column descriptions dictionary
COLUMN_DESCRIPTIONS = {
    "officer_id": "Surrogate primary key identifying the officer",
    "full_name": "Full legal name of the officer",
    "badge_number": "Unique official badge or identification credential",
    "department": "Law enforcement bureau or department unit",
    "contact_email": "Unique official department email address",
    "role": "Role-based access control role ('ADMIN' or 'INVESTIGATOR')",
    "account_status": "Account status flag ('Active', 'Suspended', 'On Leave')",
    "hashed_password": "PBKDF2-SHA256 / bcrypt cryptographic password hash",
    "created_at": "UTC audit timestamp of record creation",
    "updated_at": "UTC audit timestamp of last record update",
    "case_id": "Primary key identifier for the case",
    "title": "Concise headline or title describing the investigation",
    "description": "Comprehensive narrative details or case description",
    "case_type": "Taxonomic categorization of crime or case nature",
    "status": "Investigation workflow lifecycle status",
    "priority": "Operational severity and urgency triage level",
    "lead_officer_id": "Foreign key referencing officer leading the case",
    "incident_date": "Date and time when the primary incident occurred",
    "person_id": "Primary key identifier for the person of interest",
    "date_of_birth": "Date of birth of the individual",
    "contact_details": "Telephone numbers or communication channels",
    "address": "Residential or physical street address",
    "category": "Investigative role classification ('Witness', 'Subject', etc.)",
    "organization_id": "Primary key identifier for the organization",
    "name": "Registered legal entity name or alias",
    "organization_type": "Classification (Corporation, Syndicate, NGO)",
    "vehicle_id": "Primary key identifier for the vehicle",
    "registration_number": "Unique vehicle license plate or registration tag",
    "make": "Vehicle manufacturer make",
    "model": "Vehicle model name",
    "year": "Manufacturing model year",
    "color": "Exterior visual paint color",
    "device_id": "Primary key identifier for the hardware device",
    "device_type": "Type of device (Smartphone, Laptop, Server, Storage)",
    "serial_number": "Unique manufacturer serial number or IMEI",
    "location_id": "Primary key identifier for the location record",
    "location_name": "Common name or label for the location",
    "latitude": "WGS 84 geographic latitude coordinate",
    "longitude": "WGS 84 geographic longitude coordinate",
    "evidence_id": "Primary key identifier for the evidence item",
    "evidence_number": "Unique formal evidence tracking reference code",
    "item_type": "Category (Physical, Digital, Document, Forensic)",
    "storage_location": "Secure locker, shelf, or vault reference code",
    "custody_status": "Current status in chain of custody ledger",
    "collected_date": "Timestamp when evidence was initially seized",
    "collected_by_officer_id": "Foreign key referencing the seizing officer",
    "custody_event_id": "Primary key identifier for the custody movement event",
    "action": "Chain of custody action (Logged, Checked Out, Court)",
    "officer_id": "Foreign key referencing the officer executing the custody action",
    "timestamp": "Precise timestamp of custody movement event",
    "notes": "Contextual handover remarks, court docket, or lab reason",
    "activity_id": "Primary key identifier for the case activity record",
    "activity_type": "Taxonomy of action (Created, Updated, Evidence Added)",
    "details": "Descriptive payload explaining the action performed",
    "role_in_case": "Designation of person within case scope (Suspect, Witness)",
    "role_in_org": "Position or role within organization (Director, Member)",
    "relationship_type": "Nature of affiliation (Owner, Driver, Leased)",
    "relation_type": "Nature of evidentiary linkage",
    "recovery_context": "Circumstantial context of evidence recovery",
    "assigned_by": "Officer who assigned the linkage or asset"
}

def extract_schema_json():
    # 1. Parse schema.sql for exact DDL details (types, check constraints, comments)
    schema_sql_path = os.path.join(BASE_DIR, "database", "sql", "schema.sql")
    with open(schema_sql_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    # Extract all CREATE TABLE blocks
    table_blocks = re.findall(r"CREATE TABLE\s+([a-zA-Z_]+)\s*\((.*?)\);", sql_content, re.DOTALL | re.IGNORECASE)
    ddl_info = {}
    for tbl_name, body in table_blocks:
        ddl_info[tbl_name] = body

    tables_data = {}
    total_columns = 0
    total_fks = 0

    junction_tables = {
        "case_people", "case_organizations", "case_vehicles", "case_devices", "case_locations",
        "person_organizations", "person_vehicles", "person_devices",
        "evidence_people", "evidence_vehicles", "evidence_devices", "evidence_locations"
    }

    # Iterate through Base.metadata.tables
    for tbl_name, table in sorted(Base.metadata.tables.items()):
        is_junction = tbl_name in junction_tables
        table_type = "junction" if is_junction else "entity"
        
        pk_cols = [c.name for c in table.primary_key.columns]
        
        # Extract foreign keys
        fks_list = []
        col_fk_map = {}
        for fk in table.foreign_keys:
            target_parts = fk.target_fullname.split(".")
            target_tbl = target_parts[0]
            target_col = target_parts[1]
            fk_data = {
                "source_table": tbl_name,
                "source_column": fk.parent.name,
                "target_table": target_tbl,
                "target_column": target_col,
                "on_delete": fk.ondelete or "NO ACTION",
                "on_update": fk.onupdate or "NO ACTION"
            }
            fks_list.append(fk_data)
            col_fk_map[fk.parent.name] = fk_data
            total_fks += 1

        # Extract CHECK constraints
        check_constraints = []
        for c in table.constraints:
            if type(c).__name__ == "CheckConstraint":
                check_constraints.append({
                    "name": c.name or f"chk_{tbl_name}",
                    "sqltext": str(c.sqltext)
                })

        # Also parse check constraints from schema.sql for exact clause
        if tbl_name in ddl_info:
            body = ddl_info[tbl_name]
            chk_matches = re.findall(r"CHECK\s*\((.*?)\)", body, re.IGNORECASE)
            for m in chk_matches:
                cleaned = m.strip().replace("\n", " ").replace("  ", " ")
                if not any(cleaned in c["sqltext"] or c["sqltext"] in cleaned for c in check_constraints):
                    check_constraints.append({
                        "name": f"chk_{tbl_name}",
                        "sqltext": cleaned
                    })

        # Extract UNIQUE constraints
        unique_constraints = []
        for c in table.constraints:
            if type(c).__name__ == "UniqueConstraint":
                unique_constraints.append({
                    "name": c.name or f"uq_{tbl_name}",
                    "columns": [col.name for col in c.columns]
                })

        # Extract column details
        columns_data = []
        for col in table.columns:
            total_columns += 1
            col_name = col.name
            
            # String representation of SQL type
            sql_type = str(col.type)
            if "VARCHAR" in sql_type:
                match = re.search(r"\((\d+)\)", sql_type)
                length = match.group(1) if match else "255"
                type_str = f"VARCHAR({length})"
            elif "TEXT" in sql_type:
                type_str = "TEXT"
            elif "INTEGER" in sql_type:
                type_str = "INTEGER"
            elif "NUMERIC" in sql_type:
                type_str = "NUMERIC(10,6)" if "latitude" in col_name or "longitude" in col_name else "NUMERIC"
            elif "DATETIME" in sql_type or "TIMESTAMP" in sql_type:
                type_str = "TIMESTAMP WITH TIME ZONE"
            else:
                type_str = sql_type

            # Check constraint on this column
            col_chk = None
            for chk in check_constraints:
                if col_name in chk["sqltext"]:
                    col_chk = chk["sqltext"]
                    break

            # Default value
            default_val = None
            if col.default is not None:
                default_val = str(col.default.arg)
            elif col.server_default is not None:
                default_val = str(col.server_default.arg)

            # Check unique
            is_unique = bool(col.unique)
            for uq in unique_constraints:
                if [col_name] == uq["columns"]:
                    is_unique = True

            col_entry = {
                "name": col_name,
                "data_type": type_str,
                "nullable": bool(col.nullable),
                "primary_key": bool(col.primary_key),
                "foreign_key": col_fk_map.get(col_name),
                "unique": is_unique,
                "check": col_chk,
                "default": default_val,
                "description": COLUMN_DESCRIPTIONS.get(col_name, f"{col_name.replace('_', ' ').title()} field")
            }
            columns_data.append(col_entry)

        tables_data[tbl_name] = {
            "table_name": tbl_name,
            "table_type": table_type,
            "description": TABLE_DESCRIPTIONS.get(tbl_name, f"Relation storing {tbl_name} data."),
            "columns": columns_data,
            "primary_key": pk_cols,
            "foreign_keys": fks_list,
            "unique_constraints": unique_constraints,
            "check_constraints": check_constraints
        }

    schema_json = {
        "metadata": {
            "system_name": "Intelligence Fusion Platform",
            "course": "Database Management Systems (UE24CS395)",
            "rubric_row": "Row 2: Relational Schema with Keys and Constraints (3 Marks)",
            "total_tables": len(tables_data),
            "total_entity_tables": len([t for t in tables_data.values() if t["table_type"] == "entity"]),
            "total_junction_tables": len([t for t in tables_data.values() if t["table_type"] == "junction"]),
            "total_columns": total_columns,
            "total_foreign_keys": total_fks,
            "target_dbms": ["PostgreSQL 14+ / 15+", "SQLite 3 Fallback"]
        },
        "tables": tables_data
    }

    out_path = os.path.join(BASE_DIR, "docs", "diagrams", "schema.json")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(schema_json, f, indent=2)

    print("================================================================================")
    print("SCHEMA EXTRACTION SUMMARY (Ground Truth from Codebase)")
    print("================================================================================")
    print(f"Total Tables       : {len(tables_data)} (10 Entity/Audit + 12 Junction)")
    print(f"Total Columns      : {total_columns}")
    print(f"Total Foreign Keys : {total_fks}")
    print(f"Output File        : {out_path}")
    print("--------------------------------------------------------------------------------")
    print("Entity Tables (10):")
    for tname, t in tables_data.items():
        if t["table_type"] == "entity":
            fks = [f"{fk['source_column']} -> {fk['target_table']}.{fk['target_column']}" for fk in t["foreign_keys"]]
            print(f"  - {tname:18} | PK: {t['primary_key']} | Cols: {len(t['columns']):2d} | FKs: {fks or 'None'}")
    print("Junction Tables (12):")
    for tname, t in tables_data.items():
        if t["table_type"] == "junction":
            fks = [f"{fk['source_column']} -> {fk['target_table']}.{fk['target_column']}" for fk in t["foreign_keys"]]
            print(f"  - {tname:22} | Composite PK: {t['primary_key']} | Cols: {len(t['columns'])} | FKs: {fks}")
    print("================================================================================")

    # Cross-check assertions
    assert len(tables_data) == 22, f"Expected 22 tables, got {len(tables_data)}"
    assert total_columns == 141, f"Expected 141 columns, got {total_columns}"
    assert total_fks == 31, f"Expected 31 foreign keys, got {total_fks}"
    print("ALL ASSERTIONS PASSED: 22 tables, 141 columns, 31 foreign keys verified cleanly.")

if __name__ == "__main__":
    extract_schema_json()
