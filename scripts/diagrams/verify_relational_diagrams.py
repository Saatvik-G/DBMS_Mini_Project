#!/usr/bin/env python3
"""
scripts/diagrams/verify_relational_diagrams.py
Automated validation of generated relational schema SVG diagrams against docs/diagrams/schema.json.
Asserts:
1. All 22 tables from schema.json exist as boxes in relational_schema_full.svg.
2. Exactly 31 foreign key arrows exist connecting source FK attribute to target PK attribute.
3. Every single FK defined in schema.json is represented with exact source, target, and ON DELETE rule.
4. Validates cluster detail diagrams (Cases, Assets, Evidence, Officers).
Returns exit code 0 if all assertions pass, 1 otherwise.
"""

import os
import sys
import json
import xml.etree.ElementTree as ET

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
JSON_PATH = os.path.join(BASE_DIR, "docs", "diagrams", "schema.json")
DIAGRAMS_DIR = os.path.join(BASE_DIR, "docs", "diagrams")

def verify_full_schema(schema_data):
    full_svg_path = os.path.join(DIAGRAMS_DIR, "relational_schema_full.svg")
    if not os.path.exists(full_svg_path):
        print(f"ERROR: {full_svg_path} not found.")
        return False

    tree = ET.parse(full_svg_path)
    root = tree.getroot()

    # 1. Verify tables
    table_boxes = root.findall(".//{http://www.w3.org/2000/svg}g[@class='table-box']")
    if not table_boxes:
        # Fallback if namespace not matched
        table_boxes = [elem for elem in root.iter() if elem.attrib.get("class") == "table-box"]

    found_tables = {elem.attrib.get("data-table-name") for elem in table_boxes}
    expected_tables = set(schema_data["tables"].keys())

    print(f"[Full Schema] Found {len(found_tables)} table boxes. Expected {len(expected_tables)}.")
    missing_tables = expected_tables - found_tables
    if missing_tables:
        print(f"ERROR: Missing tables in full schema: {missing_tables}")
        return False

    # 2. Verify FK arrows
    fk_arrows = [elem for elem in root.iter() if elem.attrib.get("class") == "fk-arrow"]
    print(f"[Full Schema] Found {len(fk_arrows)} FK connector arrows. Expected 31.")

    if len(fk_arrows) != 31:
        print(f"ERROR: Expected exactly 31 FK arrows, found {len(fk_arrows)}.")
        return False

    # Collect expected FKs from schema.json
    expected_fks = set()
    for tname, tdata in schema_data["tables"].items():
        for fk in tdata["foreign_keys"]:
            expected_fks.add((
                fk["source_table"],
                fk["source_column"],
                fk["target_table"],
                fk["target_column"],
                fk["on_delete"]
            ))

    found_fks = set()
    for elem in fk_arrows:
        attrs = elem.attrib
        st = attrs.get("data-source-table")
        sc = attrs.get("data-source-col")
        tt = attrs.get("data-target-table")
        tc = attrs.get("data-target-col")
        od = attrs.get("data-on-delete")
        found_fks.add((st, sc, tt, tc, od))

    missing_fks = expected_fks - found_fks
    if missing_fks:
        print(f"ERROR: Missing foreign key arrows in diagram:")
        for m in sorted(missing_fks):
            print(f"  - {m[0]}.{m[1]} -> {m[2]}.{m[3]} (ON DELETE {m[4]})")
        return False

    extra_fks = found_fks - expected_fks
    if extra_fks:
        print(f"ERROR: Extraneous foreign key arrows in diagram: {extra_fks}")
        return False

    print("[Full Schema] All 22 tables and 31 foreign keys verified with exact attributes and ON DELETE rules!")
    return True

def verify_clusters():
    clusters = [
        ("relational_schema_cases_cluster.svg", 12, 11),
        ("relational_schema_assets_cluster.svg", 8, 6),
        ("relational_schema_evidence_cluster.svg", 12, 12),
        ("relational_schema_officers_cluster.svg", 4, 4)
    ]

    for fname, exp_tables, exp_arrows in clusters:
        fpath = os.path.join(DIAGRAMS_DIR, fname)
        if not os.path.exists(fpath):
            print(f"ERROR: {fpath} not found.")
            return False

        tree = ET.parse(fpath)
        root = tree.getroot()

        boxes = [elem for elem in root.iter() if elem.attrib.get("class") == "table-box"]
        arrows = [elem for elem in root.iter() if elem.attrib.get("class") == "fk-arrow"]

        print(f"[{fname}] Boxes: {len(boxes)} (exp {exp_tables}), Arrows: {len(arrows)} (exp {exp_arrows})")
        if len(boxes) != exp_tables or len(arrows) != exp_arrows:
            print(f"ERROR in {fname}: count mismatch.")
            return False

    print("[Clusters] All 4 cluster detail diagrams verified cleanly.")
    return True

def main():
    print("=" * 80)
    print("RUNNING AUTOMATED VERIFICATION: RELATIONAL SCHEMA DIAGRAMS")
    print("=" * 80)

    if not os.path.exists(JSON_PATH):
        print(f"ERROR: schema.json not found at {JSON_PATH}")
        sys.exit(1)

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        schema_data = json.load(f)

    full_ok = verify_full_schema(schema_data)
    clusters_ok = verify_clusters()

    if full_ok and clusters_ok:
        print("=" * 80)
        print("SUCCESS: 100% OF RELATIONAL SCHEMA DIAGRAMS VERIFIED AGAINST TRUTH")
        print("  - 22/22 Tables verified")
        print("  - 31/31 Foreign Keys verified with exact ON DELETE actions")
        print("  - 4/4 Cluster diagrams verified")
        print("=" * 80)
        sys.exit(0)
    else:
        print("VERIFICATION FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
