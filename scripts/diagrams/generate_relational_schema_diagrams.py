#!/usr/bin/env python3
"""
scripts/diagrams/generate_relational_schema_diagrams.py
Generates academic-grade relational schema diagrams directly from docs/diagrams/schema.json.
Produces:
1. relational_schema_full.svg: All 22 tables with all 31 foreign key arrows routed from FK port to PK port.
2. relational_schema_cases_cluster.svg: Cases cluster with case junctions and dimmed external stubs.
3. relational_schema_assets_cluster.svg: People, Orgs, Assets and their junctions.
4. relational_schema_evidence_cluster.svg: Evidence, custody, and evidence junctions.
5. relational_schema_officers_cluster.svg: Officers, activity audit, and cross-module linkages.
"""

import os
import sys
import json
import math

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
JSON_PATH = os.path.join(BASE_DIR, "docs", "diagrams", "schema.json")
OUT_DIR = os.path.join(BASE_DIR, "docs", "diagrams")
os.makedirs(OUT_DIR, exist_ok=True)

with open(JSON_PATH, "r", encoding="utf-8") as f:
    SCHEMA = json.load(f)

TABLES = SCHEMA["tables"]

# Color palette (Academic & Professional)
PALETTE = {
    "entity_header": "#1e3a8a",       # Deep blue
    "junction_header": "#065f46",     # Deep emerald
    "stub_header": "#64748b",         # Dimmed slate
    "header_text": "#ffffff",
    "box_bg": "#ffffff",
    "box_border": "#0f172a",
    "stub_border": "#94a3b8",
    "row_even": "#ffffff",
    "row_odd": "#f8fafc",
    "text_main": "#0f172a",
    "text_type": "#475569",
    "pk_badge": "#b91c1c",            # Crimson PK badge
    "fk_badge": "#1d4ed8",            # Blue FK badge
    "uq_badge": "#7c3aed",            # Purple UQ badge
    "line_cascade": "#2563eb",        # Solid blue
    "line_restrict": "#dc2626",       # Dashed crimson
    "line_setnull": "#d97706"         # Dotted amber
}

ROW_HEIGHT = 22
HEADER_HEIGHT = 32
TABLE_WIDTH = 280

def build_table_box(tbl_name, x, y, width=TABLE_WIDTH, is_stub=False, highlight_fks=None):
    """Generates SVG elements for a table box and calculates port coordinates."""
    tbl_data = TABLES.get(tbl_name)
    if not tbl_data:
        raise ValueError(f"Unknown table: {tbl_name}")

    columns = tbl_data["columns"]
    box_height = HEADER_HEIGHT + len(columns) * ROW_HEIGHT
    is_junction = tbl_data["table_type"] == "junction"
    
    if is_stub:
        header_fill = PALETTE["stub_header"]
        border_color = PALETTE["stub_border"]
        opacity = 'opacity="0.85"'
    elif is_junction:
        header_fill = PALETTE["junction_header"]
        border_color = PALETTE["junction_header"]
        opacity = ''
    else:
        header_fill = PALETTE["entity_header"]
        border_color = PALETTE["entity_header"]
        opacity = ''

    type_label = "JUNCTION" if is_junction else "ENTITY"
    if is_stub:
        type_label += " (EXTERNAL)"

    svg_parts = []
    svg_parts.append(f'<g class="table-box" data-table-name="{tbl_name}" {opacity}>')
    
    # Outer rectangle
    svg_parts.append(f'  <rect x="{x}" y="{y}" width="{width}" height="{box_height}" rx="4" ry="4" '
                     f'fill="{PALETTE["box_bg"]}" stroke="{border_color}" stroke-width="1.8" filter="url(#shadow)"/>')
    
    # Header rectangle
    svg_parts.append(f'  <path d="M {x} {y+4} Q {x} {y} {x+4} {y} L {x+width-4} {y} Q {x+width} {y} {x+width} {y+4} '
                     f'L {x+width} {y+HEADER_HEIGHT} L {x} {y+HEADER_HEIGHT} Z" fill="{header_fill}"/>')
    
    # Header text
    svg_parts.append(f'  <text x="{x+10}" y="{y+21}" fill="{PALETTE["header_text"]}" font-family="Segoe UI, Arial, sans-serif" '
                     f'font-size="13" font-weight="bold">{tbl_name}</text>')
    svg_parts.append(f'  <text x="{x+width-10}" y="{y+21}" fill="{PALETTE["header_text"]}" font-family="Segoe UI, Arial, sans-serif" '
                     f'font-size="9" font-weight="600" text-anchor="end" opacity="0.85">{type_label}</text>')
    
    ports = {}

    for i, col in enumerate(columns):
        row_y = y + HEADER_HEIGHT + i * ROW_HEIGHT
        row_bg = PALETTE["row_odd"] if i % 2 == 1 else PALETTE["row_even"]
        
        # Row background
        svg_parts.append(f'  <rect x="{x}" y="{row_y}" width="{width}" height="{ROW_HEIGHT}" fill="{row_bg}"/>')
        # Subtle divider
        svg_parts.append(f'  <line x1="{x}" y1="{row_y}" x2="{x+width}" y2="{row_y}" stroke="#e2e8f0" stroke-width="1"/>')
        
        # Badges
        col_name = col["name"]
        is_pk = col["primary_key"]
        is_fk = bool(col["foreign_key"])
        is_uq = col["unique"] and not is_pk
        
        badge_x = x + 8
        if is_pk:
            svg_parts.append(f'  <rect x="{badge_x}" y="{row_y+4}" width="18" height="14" rx="2" fill="{PALETTE["pk_badge"]}"/>')
            svg_parts.append(f'  <text x="{badge_x+9}" y="{row_y+15}" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" '
                             f'font-size="8.5" font-weight="bold" text-anchor="middle">PK</text>')
            badge_x += 22

        if is_fk:
            svg_parts.append(f'  <rect x="{badge_x}" y="{row_y+4}" width="18" height="14" rx="2" fill="{PALETTE["fk_badge"]}"/>')
            svg_parts.append(f'  <text x="{badge_x+9}" y="{row_y+15}" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" '
                             f'font-size="8.5" font-weight="bold" text-anchor="middle">FK</text>')
            badge_x += 22

        if is_uq:
            svg_parts.append(f'  <rect x="{badge_x}" y="{row_y+4}" width="18" height="14" rx="2" fill="{PALETTE["uq_badge"]}"/>')
            svg_parts.append(f'  <text x="{badge_x+9}" y="{row_y+15}" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" '
                             f'font-size="8.5" font-weight="bold" text-anchor="middle">UQ</text>')
            badge_x += 22

        # Column Name
        font_weight = "bold" if is_pk else ("600" if is_fk else "normal")
        font_style = "italic" if is_fk else "normal"
        text_decor = 'text-decoration="underline"' if is_pk else ''
        svg_parts.append(f'  <text x="{badge_x+4}" y="{row_y+15}" fill="{PALETTE["text_main"]}" '
                         f'font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="{font_weight}" '
                         f'font-style="{font_style}" {text_decor}>{col_name}</text>')
        
        # Data Type
        dtype_str = col["data_type"]
        if "TIMESTAMP" in dtype_str:
            dtype_str = "TIMESTAMPTZ"
        elif "VARCHAR" in dtype_str:
            dtype_str = dtype_str.replace("VARCHAR", "VARCHAR")
        svg_parts.append(f'  <text x="{x+width-8}" y="{row_y+15}" fill="{PALETTE["text_type"]}" '
                         f'font-family="Segoe UI, Consolas, monospace" font-size="9.5" text-anchor="end">{dtype_str}</text>')
        
        # Ports
        port_y = row_y + ROW_HEIGHT / 2
        ports[col_name] = {
            "left": (x, port_y),
            "right": (x + width, port_y),
            "center": (x + width / 2, port_y)
        }

    svg_parts.append('</g>')
    return "\n".join(svg_parts), ports, (x, y, width, box_height)


def draw_arrow(src_tbl, src_col, tgt_tbl, tgt_col, on_delete, all_ports, custom_routing=None, flip_sides=False):
    """
    Draws an arrow from source FK port to target PK port.
    Standard DBMS convention: Foreign key references PK, so arrow points towards target PK.
    """
    src_p = all_ports[src_tbl][src_col]
    tgt_p = all_ports[tgt_tbl][tgt_col]

    # Select line style and color based on ON DELETE action
    if on_delete == "CASCADE":
        stroke_color = PALETTE["line_cascade"]
        marker_id = "arrow-cascade"
        dash_attr = ""
    elif on_delete == "RESTRICT":
        stroke_color = PALETTE["line_restrict"]
        marker_id = "arrow-restrict"
        dash_attr = 'stroke-dasharray="6,3"'
    else: # SET NULL
        stroke_color = PALETTE["line_setnull"]
        marker_id = "arrow-setnull"
        dash_attr = 'stroke-dasharray="2,3"'

    # Determine default side connection if custom_routing not provided
    if custom_routing:
        path_d = custom_routing
        # Extract endpoints for data attributes
    else:
        # Auto cubic bezier routing
        if not flip_sides:
            if src_p["left"][0] > tgt_p["right"][0]:
                x1, y1 = src_p["left"]
                x2, y2 = tgt_p["right"]
                dx = abs(x2 - x1) * 0.5
                path_d = f"M {x1} {y1} C {x1 - dx} {y1}, {x2 + dx} {y2}, {x2} {y2}"
            elif src_p["right"][0] < tgt_p["left"][0]:
                x1, y1 = src_p["right"]
                x2, y2 = tgt_p["left"]
                dx = abs(x2 - x1) * 0.5
                path_d = f"M {x1} {y1} C {x1 + dx} {y1}, {x2 - dx} {y2}, {x2} {y2}"
            else:
                # Same column or stacked
                x1, y1 = src_p["right"]
                x2, y2 = tgt_p["right"]
                offset = max(x1, x2) + 40
                path_d = f"M {x1} {y1} C {offset} {y1}, {offset} {y2}, {x2} {y2}"
        else:
            x1, y1 = src_p["left"]
            x2, y2 = tgt_p["left"]
            offset = min(x1, x2) - 40
            path_d = f"M {x1} {y1} C {offset} {y1}, {offset} {y2}, {x2} {y2}"

    svg = (f'<g class="fk-arrow" data-source-table="{src_tbl}" data-source-col="{src_col}" '
           f'data-target-table="{tgt_tbl}" data-target-col="{tgt_col}" data-on-delete="{on_delete}">'
           f'  <path d="{path_d}" fill="none" stroke="{stroke_color}" stroke-width="1.8" '
           f'{dash_attr} marker-end="url(#{marker_id})"/>'
           f'</g>')
    return svg


# -----------------------------------------------------------------------------------------
# 1. FULL RELATIONAL SCHEMA (22 Tables, 31 FK Arrows)
# Layout: 4 Columns on an A3 Canvas (2400 x 1700)
# Column 1 (Left): Officers & System Audit (officers, cases, case_activity)
# Column 2 (Center-Left): 5 Case Junctions + Evidence Hub (case_people, case_orgs, case_vehicles, case_devices, case_locations, evidence, evidence_custody)
# Column 3 (Center-Right): Core Entities (people, organizations, vehicles, devices, locations)
# Column 4 (Right): Person Junctions & Evidence Junctions (person_orgs, person_vehicles, person_devices, evidence_people, evidence_vehicles, evidence_devices, evidence_locations)
# -----------------------------------------------------------------------------------------
def generate_full_schema_svg():
    width = 2500
    height = 1750
    
    # Table positions (col_x, y)
    # Col 1: Left (X = 60)
    col1_x = 60
    # Col 2: Center-Left (X = 580)
    col2_x = 580
    # Col 3: Center-Right (X = 1240)
    col3_x = 1240
    # Col 4: Right (X = 1880)
    col4_x = 1880

    positions = {
        # Col 1: Officers & Core Case Management
        "officers": (col1_x, 140),
        "cases": (col1_x, 460),
        "case_activity": (col1_x, 820),
        
        # Col 2: Evidence Core & Case Junctions
        "case_people": (col2_x, 140),
        "case_organizations": (col2_x, 320),
        "case_vehicles": (col2_x, 500),
        "case_devices": (col2_x, 680),
        "case_locations": (col2_x, 860),
        "evidence": (col2_x, 1080),
        "evidence_custody": (col2_x, 1440),

        # Col 3: Master Entity Repositories
        "people": (col3_x, 140),
        "organizations": (col3_x, 420),
        "vehicles": (col3_x, 680),
        "devices": (col3_x, 960),
        "locations": (col3_x, 1220),

        # Col 4: Associative Junctions (Person & Evidence)
        "person_organizations": (col4_x, 140),
        "person_vehicles": (col4_x, 300),
        "person_devices": (col4_x, 460),
        "evidence_people": (col4_x, 660),
        "evidence_vehicles": (col4_x, 820),
        "evidence_devices": (col4_x, 980),
        "evidence_locations": (col4_x, 1140)
    }

    table_svgs = []
    all_ports = {}
    box_rects = {}

    for tname, (x, y) in positions.items():
        svg_code, ports, rect = build_table_box(tname, x, y, width=TABLE_WIDTH, is_stub=False)
        table_svgs.append(svg_code)
        all_ports[tname] = ports
        box_rects[tname] = rect

    # Build all 31 FK arrows
    arrow_svgs = []
    
    # 1. cases.lead_officer_id -> officers.officer_id (SET NULL)
    src_p = all_ports["cases"]["lead_officer_id"]["left"]
    tgt_p = all_ports["officers"]["officer_id"]["left"]
    routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-50} {src_p[1]}, {tgt_p[0]-50} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
    arrow_svgs.append(draw_arrow("cases", "lead_officer_id", "officers", "officer_id", "SET NULL", all_ports, routing))

    # 2. case_activity.officer_id -> officers.officer_id (SET NULL)
    src_p = all_ports["case_activity"]["officer_id"]["left"]
    tgt_p = all_ports["officers"]["officer_id"]["left"]
    routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-100} {src_p[1]}, {tgt_p[0]-100} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
    arrow_svgs.append(draw_arrow("case_activity", "officer_id", "officers", "officer_id", "SET NULL", all_ports, routing))

    # 3. case_activity.case_id -> cases.case_id (CASCADE)
    src_p = all_ports["case_activity"]["case_id"]["left"]
    tgt_p = all_ports["cases"]["case_id"]["left"]
    routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-40} {src_p[1]}, {tgt_p[0]-40} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
    arrow_svgs.append(draw_arrow("case_activity", "case_id", "cases", "case_id", "CASCADE", all_ports, routing))

    # 4. evidence.collected_by_officer_id -> officers.officer_id (SET NULL)
    src_p = all_ports["evidence"]["collected_by_officer_id"]["left"]
    tgt_p = all_ports["officers"]["officer_id"]["right"]
    routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-150} {src_p[1]}, {tgt_p[0]+150} {tgt_p[1]+20}, {tgt_p[0]} {tgt_p[1]}"
    arrow_svgs.append(draw_arrow("evidence", "collected_by_officer_id", "officers", "officer_id", "SET NULL", all_ports, routing))

    # 5. evidence.case_id -> cases.case_id (RESTRICT)
    src_p = all_ports["evidence"]["case_id"]["left"]
    tgt_p = all_ports["cases"]["case_id"]["right"]
    routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-120} {src_p[1]}, {tgt_p[0]+120} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
    arrow_svgs.append(draw_arrow("evidence", "case_id", "cases", "case_id", "RESTRICT", all_ports, routing))

    # 6. evidence_custody.evidence_id -> evidence.evidence_id (CASCADE)
    src_p = all_ports["evidence_custody"]["evidence_id"]["right"]
    tgt_p = all_ports["evidence"]["evidence_id"]["right"]
    routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]+50} {src_p[1]}, {tgt_p[0]+50} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
    arrow_svgs.append(draw_arrow("evidence_custody", "evidence_id", "evidence", "evidence_id", "CASCADE", all_ports, routing))

    # 7. evidence_custody.officer_id -> officers.officer_id (RESTRICT)
    src_p = all_ports["evidence_custody"]["officer_id"]["left"]
    tgt_p = all_ports["officers"]["officer_id"]["left"]
    routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-220} {src_p[1]}, {tgt_p[0]-140} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
    arrow_svgs.append(draw_arrow("evidence_custody", "officer_id", "officers", "officer_id", "RESTRICT", all_ports, routing))

    # Case Junctions to cases.case_id (all CASCADE)
    for c_junc in ["case_people", "case_organizations", "case_vehicles", "case_devices", "case_locations"]:
        src_p = all_ports[c_junc]["case_id"]["left"]
        tgt_p = all_ports["cases"]["case_id"]["right"]
        routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-100} {src_p[1]}, {tgt_p[0]+80} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
        arrow_svgs.append(draw_arrow(c_junc, "case_id", "cases", "case_id", "CASCADE", all_ports, routing))

    # Case Junctions to their respective entity targets (all CASCADE)
    junc_target_map = {
        "case_people": ("person_id", "people", "person_id"),
        "case_organizations": ("organization_id", "organizations", "organization_id"),
        "case_vehicles": ("vehicle_id", "vehicles", "vehicle_id"),
        "case_devices": ("device_id", "devices", "device_id"),
        "case_locations": ("location_id", "locations", "location_id")
    }
    for junc, (sc, tt, tc) in junc_target_map.items():
        src_p = all_ports[junc][sc]["right"]
        tgt_p = all_ports[tt][tc]["left"]
        routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]+120} {src_p[1]}, {tgt_p[0]-120} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
        arrow_svgs.append(draw_arrow(junc, sc, tt, tc, "CASCADE", all_ports, routing))

    # Person Junctions to people.person_id (all CASCADE)
    for p_junc in ["person_organizations", "person_vehicles", "person_devices"]:
        src_p = all_ports[p_junc]["person_id"]["left"]
        tgt_p = all_ports["people"]["person_id"]["right"]
        routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-100} {src_p[1]}, {tgt_p[0]+80} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
        arrow_svgs.append(draw_arrow(p_junc, "person_id", "people", "person_id", "CASCADE", all_ports, routing))

    # Person Junctions to other entities (CASCADE)
    # person_organizations -> organizations
    src_p = all_ports["person_organizations"]["organization_id"]["left"]
    tgt_p = all_ports["organizations"]["organization_id"]["right"]
    routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-120} {src_p[1]}, {tgt_p[0]+100} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
    arrow_svgs.append(draw_arrow("person_organizations", "organization_id", "organizations", "organization_id", "CASCADE", all_ports, routing))

    # person_vehicles -> vehicles
    src_p = all_ports["person_vehicles"]["vehicle_id"]["left"]
    tgt_p = all_ports["vehicles"]["vehicle_id"]["right"]
    routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-120} {src_p[1]}, {tgt_p[0]+100} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
    arrow_svgs.append(draw_arrow("person_vehicles", "vehicle_id", "vehicles", "vehicle_id", "CASCADE", all_ports, routing))

    # person_devices -> devices
    src_p = all_ports["person_devices"]["device_id"]["left"]
    tgt_p = all_ports["devices"]["device_id"]["right"]
    routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-120} {src_p[1]}, {tgt_p[0]+100} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
    arrow_svgs.append(draw_arrow("person_devices", "device_id", "devices", "device_id", "CASCADE", all_ports, routing))

    # Evidence Junctions to evidence.evidence_id (CASCADE)
    for e_junc in ["evidence_people", "evidence_vehicles", "evidence_devices", "evidence_locations"]:
        src_p = all_ports[e_junc]["evidence_id"]["left"]
        tgt_p = all_ports["evidence"]["evidence_id"]["right"]
        routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-300} {src_p[1]}, {tgt_p[0]+200} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
        arrow_svgs.append(draw_arrow(e_junc, "evidence_id", "evidence", "evidence_id", "CASCADE", all_ports, routing))

    # Evidence Junctions to respective entity targets (CASCADE)
    ev_targets = {
        "evidence_people": ("person_id", "people", "person_id"),
        "evidence_vehicles": ("vehicle_id", "vehicles", "vehicle_id"),
        "evidence_devices": ("device_id", "devices", "device_id"),
        "evidence_locations": ("location_id", "locations", "location_id")
    }
    for e_junc, (sc, tt, tc) in ev_targets.items():
        src_p = all_ports[e_junc][sc]["left"]
        tgt_p = all_ports[tt][tc]["right"]
        routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-140} {src_p[1]}, {tgt_p[0]+120} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
        arrow_svgs.append(draw_arrow(e_junc, sc, tt, tc, "CASCADE", all_ports, routing))

    # Assemble complete SVG
    svg_out = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    
    <!-- Arrowhead markers -->
    <marker id="arrow-cascade" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
      <path d="M 0 1 L 8 4.5 L 0 8 Z" fill="{PALETTE["line_cascade"]}"/>
    </marker>
    <marker id="arrow-restrict" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
      <path d="M 0 1 L 8 4.5 L 0 8 Z" fill="{PALETTE["line_restrict"]}"/>
    </marker>
    <marker id="arrow-setnull" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
      <path d="M 0 1 L 8 4.5 L 0 8 Z" fill="{PALETTE["line_setnull"]}"/>
    </marker>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="#f8fafc"/>

  <!-- Canvas Header -->
  <rect x="0" y="0" width="{width}" height="90" fill="#0f172a"/>
  <text x="60" y="42" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="bold">
    Intelligence Fusion Platform - Complete Relational Database Schema
  </text>
  <text x="60" y="68" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="13">
    PES University | UE24CS395 DBMS Mini Project | Authors: Saatvik Gupta (PES1UG24CS395) &amp; Satyam Goyal (PES1UG24CS424) | Exact Catalog: 22 Tables (10 Entity/Audit + 12 Junction), 141 Columns, 31 Foreign Key Arrows
  </text>

  <!-- Legend Box (Top Right) -->
  <g transform="translate(1820, 15)">
    <rect x="0" y="0" width="620" height="62" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <!-- Line styles -->
    <line x1="20" y1="20" x2="60" y2="20" stroke="{PALETTE["line_cascade"]}" stroke-width="2" marker-end="url(#arrow-cascade)"/>
    <text x="70" y="24" fill="#e2e8f0" font-family="Segoe UI, Arial, sans-serif" font-size="11">ON DELETE CASCADE (26 FKs)</text>

    <line x1="20" y1="42" x2="60" y2="42" stroke="{PALETTE["line_restrict"]}" stroke-width="2" stroke-dasharray="6,3" marker-end="url(#arrow-restrict)"/>
    <text x="70" y="46" fill="#e2e8f0" font-family="Segoe UI, Arial, sans-serif" font-size="11">ON DELETE RESTRICT (2 FKs)</text>

    <line x1="260" y1="20" x2="300" y2="20" stroke="{PALETTE["line_setnull"]}" stroke-width="2" stroke-dasharray="2,3" marker-end="url(#arrow-setnull)"/>
    <text x="310" y="24" fill="#e2e8f0" font-family="Segoe UI, Arial, sans-serif" font-size="11">ON DELETE SET NULL (3 FKs)</text>

    <!-- Badges -->
    <rect x="260" y="34" width="18" height="14" rx="2" fill="{PALETTE["pk_badge"]}"/>
    <text x="269" y="45" fill="#fff" font-family="sans-serif" font-size="8.5" font-weight="bold" text-anchor="middle">PK</text>
    <text x="284" y="46" fill="#e2e8f0" font-family="sans-serif" font-size="11">Primary Key</text>

    <rect x="360" y="34" width="18" height="14" rx="2" fill="{PALETTE["fk_badge"]}"/>
    <text x="369" y="45" fill="#fff" font-family="sans-serif" font-size="8.5" font-weight="bold" text-anchor="middle">FK</text>
    <text x="384" y="46" fill="#e2e8f0" font-family="sans-serif" font-size="11">Foreign Key</text>

    <rect x="460" y="34" width="18" height="14" rx="2" fill="{PALETTE["uq_badge"]}"/>
    <text x="469" y="45" fill="#fff" font-family="sans-serif" font-size="8.5" font-weight="bold" text-anchor="middle">UQ</text>
    <text x="484" y="46" fill="#e2e8f0" font-family="sans-serif" font-size="11">Unique</text>
  </g>

  <!-- FK Arrows (drawn behind tables for cleaner ports) -->
  <g id="foreign-key-arrows">
    {"\n    ".join(arrow_svgs)}
  </g>

  <!-- Table Boxes -->
  <g id="table-boxes">
    {"\n    ".join(table_svgs)}
  </g>

</svg>"""

    out_file = os.path.join(OUT_DIR, "relational_schema_full.svg")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(svg_out)
    print(f"Generated: {out_file} (Tables: {len(positions)}, FK Arrows: {len(arrow_svgs)})")
    assert len(positions) == 22, f"Expected 22 tables, got {len(positions)}"
    assert len(arrow_svgs) == 31, f"Expected 31 FK arrows, got {len(arrow_svgs)}"


# -----------------------------------------------------------------------------------------
# 2. CLUSTER DETAIL DIAGRAM 1: Case Management Cluster (A4 Landscape: 1400 x 950)
# Tables: cases (Core), case_people, case_organizations, case_vehicles, case_devices, case_locations
# Stubs: officers, people, organizations, vehicles, devices, locations
# -----------------------------------------------------------------------------------------
def generate_cases_cluster_svg():
    width = 1500
    height = 980
    
    positions = {
        # Core
        "cases": (450, 360),
        
        # Junctions
        "case_people": (850, 110),
        "case_organizations": (850, 260),
        "case_vehicles": (850, 410),
        "case_devices": (850, 560),
        "case_locations": (850, 710),

        # External Stubs
        "officers": (70, 360),
        "people": (1200, 110),
        "organizations": (1200, 260),
        "vehicles": (1200, 410),
        "devices": (1200, 560),
        "locations": (1200, 710)
    }

    stubs = {"officers", "people", "organizations", "vehicles", "devices", "locations"}

    table_svgs = []
    all_ports = {}
    for tname, (x, y) in positions.items():
        is_stub = tname in stubs
        svg_code, ports, rect = build_table_box(tname, x, y, width=240 if is_stub else 260, is_stub=is_stub)
        table_svgs.append(svg_code)
        all_ports[tname] = ports

    arrow_svgs = []
    # 1. cases.lead_officer_id -> officers.officer_id (SET NULL)
    src_p = all_ports["cases"]["lead_officer_id"]["left"]
    tgt_p = all_ports["officers"]["officer_id"]["right"]
    arrow_svgs.append(draw_arrow("cases", "lead_officer_id", "officers", "officer_id", "SET NULL", all_ports,
                                 f"M {src_p[0]} {src_p[1]} C {src_p[0]-60} {src_p[1]}, {tgt_p[0]+60} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"))

    # Case junctions to cases.case_id
    for c_junc in ["case_people", "case_organizations", "case_vehicles", "case_devices", "case_locations"]:
        src_p = all_ports[c_junc]["case_id"]["left"]
        tgt_p = all_ports["cases"]["case_id"]["right"]
        routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-70} {src_p[1]}, {tgt_p[0]+70} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
        arrow_svgs.append(draw_arrow(c_junc, "case_id", "cases", "case_id", "CASCADE", all_ports, routing))

    # Case junctions to external entities
    junc_targets = [
        ("case_people", "person_id", "people", "person_id"),
        ("case_organizations", "organization_id", "organizations", "organization_id"),
        ("case_vehicles", "vehicle_id", "vehicles", "vehicle_id"),
        ("case_devices", "device_id", "devices", "device_id"),
        ("case_locations", "location_id", "locations", "location_id")
    ]
    for junc, sc, tt, tc in junc_targets:
        src_p = all_ports[junc][sc]["right"]
        tgt_p = all_ports[tt][tc]["left"]
        routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]+40} {src_p[1]}, {tgt_p[0]-40} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
        arrow_svgs.append(draw_arrow(junc, sc, tt, tc, "CASCADE", all_ports, routing))

    svg_out = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    <marker id="arrow-cascade" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
      <path d="M 0 1 L 8 4.5 L 0 8 Z" fill="{PALETTE["line_cascade"]}"/>
    </marker>
    <marker id="arrow-setnull" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
      <path d="M 0 1 L 8 4.5 L 0 8 Z" fill="{PALETTE["line_setnull"]}"/>
    </marker>
  </defs>

  <rect width="100%" height="100%" fill="#f8fafc"/>
  <rect x="0" y="0" width="{width}" height="70" fill="#0f172a"/>
  <text x="40" y="32" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="bold">
    Relational Schema Detail: Case Management Cluster
  </text>
  <text x="40" y="54" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="12">
    Focus on Cases entity, 5 multi-lateral case junctions, lead officer linkage, and external entity connections (11 FK Arrows)
  </text>

  <g id="foreign-key-arrows">
    {"\n    ".join(arrow_svgs)}
  </g>
  <g id="table-boxes">
    {"\n    ".join(table_svgs)}
  </g>
</svg>"""

    out_file = os.path.join(OUT_DIR, "relational_schema_cases_cluster.svg")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(svg_out)
    print(f"Generated: {out_file} (Tables: {len(positions)}, FK Arrows: {len(arrow_svgs)})")
    assert len(arrow_svgs) == 11, f"Expected 11 arrows in cases cluster, got {len(arrow_svgs)}"


# -----------------------------------------------------------------------------------------
# 3. CLUSTER DETAIL DIAGRAM 2: People, Organizations & Physical Assets Cluster
# Tables: people, organizations, vehicles, devices, locations
# Junctions: person_organizations, person_vehicles, person_devices
# Stubs: cases (external)
# -----------------------------------------------------------------------------------------
def generate_assets_cluster_svg():
    width = 1450
    height = 920

    positions = {
        # Core Master Entities
        "people": (100, 150),
        "organizations": (100, 480),
        "vehicles": (1050, 150),
        "devices": (1050, 480),
        "locations": (1050, 710),

        # Junctions
        "person_organizations": (580, 150),
        "person_vehicles": (580, 330),
        "person_devices": (580, 510)
    }

    table_svgs = []
    all_ports = {}
    for tname, (x, y) in positions.items():
        svg_code, ports, rect = build_table_box(tname, x, y, width=260, is_stub=False)
        table_svgs.append(svg_code)
        all_ports[tname] = ports

    arrow_svgs = []
    # person junctions to people.person_id (CASCADE)
    for p_junc in ["person_organizations", "person_vehicles", "person_devices"]:
        src_p = all_ports[p_junc]["person_id"]["left"]
        tgt_p = all_ports["people"]["person_id"]["right"]
        routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-80} {src_p[1]}, {tgt_p[0]+80} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
        arrow_svgs.append(draw_arrow(p_junc, "person_id", "people", "person_id", "CASCADE", all_ports, routing))

    # person_organizations -> organizations.organization_id
    src_p = all_ports["person_organizations"]["organization_id"]["left"]
    tgt_p = all_ports["organizations"]["organization_id"]["right"]
    routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-100} {src_p[1]}, {tgt_p[0]+100} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
    arrow_svgs.append(draw_arrow("person_organizations", "organization_id", "organizations", "organization_id", "CASCADE", all_ports, routing))

    # person_vehicles -> vehicles.vehicle_id
    src_p = all_ports["person_vehicles"]["vehicle_id"]["right"]
    tgt_p = all_ports["vehicles"]["vehicle_id"]["left"]
    routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]+80} {src_p[1]}, {tgt_p[0]-80} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
    arrow_svgs.append(draw_arrow("person_vehicles", "vehicle_id", "vehicles", "vehicle_id", "CASCADE", all_ports, routing))

    # person_devices -> devices.device_id
    src_p = all_ports["person_devices"]["device_id"]["right"]
    tgt_p = all_ports["devices"]["device_id"]["left"]
    routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]+80} {src_p[1]}, {tgt_p[0]-80} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
    arrow_svgs.append(draw_arrow("person_devices", "device_id", "devices", "device_id", "CASCADE", all_ports, routing))

    svg_out = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    <marker id="arrow-cascade" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
      <path d="M 0 1 L 8 4.5 L 0 8 Z" fill="{PALETTE["line_cascade"]}"/>
    </marker>
  </defs>

  <rect width="100%" height="100%" fill="#f8fafc"/>
  <rect x="0" y="0" width="{width}" height="70" fill="#0f172a"/>
  <text x="40" y="32" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="bold">
    Relational Schema Detail: People, Organizations &amp; Assets Cluster
  </text>
  <text x="40" y="54" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="12">
    Direct affiliations between individuals, corporate syndicates, vehicles, and hardware devices (6 FK Arrows)
  </text>

  <g id="foreign-key-arrows">
    {"\n    ".join(arrow_svgs)}
  </g>
  <g id="table-boxes">
    {"\n    ".join(table_svgs)}
  </g>
</svg>"""

    out_file = os.path.join(OUT_DIR, "relational_schema_assets_cluster.svg")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(svg_out)
    print(f"Generated: {out_file} (Tables: {len(positions)}, FK Arrows: {len(arrow_svgs)})")
    assert len(arrow_svgs) == 6, f"Expected 6 arrows in assets cluster, got {len(arrow_svgs)}"


# -----------------------------------------------------------------------------------------
# 4. CLUSTER DETAIL DIAGRAM 3: Evidence & Custody Cluster
# Tables: evidence, evidence_custody
# Junctions: evidence_people, evidence_vehicles, evidence_devices, evidence_locations
# Stubs: cases, officers, people, vehicles, devices, locations
# -----------------------------------------------------------------------------------------
def generate_evidence_cluster_svg():
    width = 1550
    height = 980

    positions = {
        # Core
        "evidence": (450, 200),
        "evidence_custody": (450, 620),

        # Junctions
        "evidence_people": (850, 110),
        "evidence_vehicles": (850, 270),
        "evidence_devices": (850, 430),
        "evidence_locations": (850, 590),

        # Stubs
        "cases": (80, 200),
        "officers": (80, 540),
        "people": (1220, 110),
        "vehicles": (1220, 270),
        "devices": (1220, 430),
        "locations": (1220, 590)
    }

    stubs = {"cases", "officers", "people", "vehicles", "devices", "locations"}

    table_svgs = []
    all_ports = {}
    for tname, (x, y) in positions.items():
        is_stub = tname in stubs
        svg_code, ports, rect = build_table_box(tname, x, y, width=240 if is_stub else 260, is_stub=is_stub)
        table_svgs.append(svg_code)
        all_ports[tname] = ports

    arrow_svgs = []
    # 1. evidence.case_id -> cases.case_id (RESTRICT)
    src_p = all_ports["evidence"]["case_id"]["left"]
    tgt_p = all_ports["cases"]["case_id"]["right"]
    arrow_svgs.append(draw_arrow("evidence", "case_id", "cases", "case_id", "RESTRICT", all_ports,
                                 f"M {src_p[0]} {src_p[1]} C {src_p[0]-60} {src_p[1]}, {tgt_p[0]+60} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"))

    # 2. evidence.collected_by_officer_id -> officers.officer_id (SET NULL)
    src_p = all_ports["evidence"]["collected_by_officer_id"]["left"]
    tgt_p = all_ports["officers"]["officer_id"]["right"]
    arrow_svgs.append(draw_arrow("evidence", "collected_by_officer_id", "officers", "officer_id", "SET NULL", all_ports,
                                 f"M {src_p[0]} {src_p[1]} C {src_p[0]-80} {src_p[1]}, {tgt_p[0]+80} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"))

    # 3. evidence_custody.evidence_id -> evidence.evidence_id (CASCADE)
    src_p = all_ports["evidence_custody"]["evidence_id"]["left"]
    tgt_p = all_ports["evidence"]["evidence_id"]["left"]
    arrow_svgs.append(draw_arrow("evidence_custody", "evidence_id", "evidence", "evidence_id", "CASCADE", all_ports,
                                 f"M {src_p[0]} {src_p[1]} C {src_p[0]-60} {src_p[1]}, {tgt_p[0]-60} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"))

    # 4. evidence_custody.officer_id -> officers.officer_id (RESTRICT)
    src_p = all_ports["evidence_custody"]["officer_id"]["left"]
    tgt_p = all_ports["officers"]["officer_id"]["right"]
    arrow_svgs.append(draw_arrow("evidence_custody", "officer_id", "officers", "officer_id", "RESTRICT", all_ports,
                                 f"M {src_p[0]} {src_p[1]} C {src_p[0]-100} {src_p[1]}, {tgt_p[0]+100} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"))

    # Evidence junctions to evidence.evidence_id (CASCADE)
    for e_junc in ["evidence_people", "evidence_vehicles", "evidence_devices", "evidence_locations"]:
        src_p = all_ports[e_junc]["evidence_id"]["left"]
        tgt_p = all_ports["evidence"]["evidence_id"]["right"]
        routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]-70} {src_p[1]}, {tgt_p[0]+70} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
        arrow_svgs.append(draw_arrow(e_junc, "evidence_id", "evidence", "evidence_id", "CASCADE", all_ports, routing))

    # Evidence junctions to targets
    ev_targets = [
        ("evidence_people", "person_id", "people", "person_id"),
        ("evidence_vehicles", "vehicle_id", "vehicles", "vehicle_id"),
        ("evidence_devices", "device_id", "devices", "device_id"),
        ("evidence_locations", "location_id", "locations", "location_id")
    ]
    for ej, sc, tt, tc in ev_targets:
        src_p = all_ports[ej][sc]["right"]
        tgt_p = all_ports[tt][tc]["left"]
        routing = f"M {src_p[0]} {src_p[1]} C {src_p[0]+40} {src_p[1]}, {tgt_p[0]-40} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"
        arrow_svgs.append(draw_arrow(ej, sc, tt, tc, "CASCADE", all_ports, routing))

    svg_out = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    <marker id="arrow-cascade" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
      <path d="M 0 1 L 8 4.5 L 0 8 Z" fill="{PALETTE["line_cascade"]}"/>
    </marker>
    <marker id="arrow-restrict" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
      <path d="M 0 1 L 8 4.5 L 0 8 Z" fill="{PALETTE["line_restrict"]}"/>
    </marker>
    <marker id="arrow-setnull" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
      <path d="M 0 1 L 8 4.5 L 0 8 Z" fill="{PALETTE["line_setnull"]}"/>
    </marker>
  </defs>

  <rect width="100%" height="100%" fill="#f8fafc"/>
  <rect x="0" y="0" width="{width}" height="70" fill="#0f172a"/>
  <text x="40" y="32" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="bold">
    Relational Schema Detail: Evidence &amp; Custody Audit Cluster
  </text>
  <text x="40" y="54" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="12">
    Chain of custody ledger, physical/digital evidence links, forensic associations, and integrity constraints (12 FK Arrows)
  </text>

  <g id="foreign-key-arrows">
    {"\n    ".join(arrow_svgs)}
  </g>
  <g id="table-boxes">
    {"\n    ".join(table_svgs)}
  </g>
</svg>"""

    out_file = os.path.join(OUT_DIR, "relational_schema_evidence_cluster.svg")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(svg_out)
    print(f"Generated: {out_file} (Tables: {len(positions)}, FK Arrows: {len(arrow_svgs)})")
    assert len(arrow_svgs) == 12, f"Expected 12 arrows in evidence cluster, got {len(arrow_svgs)}"


# -----------------------------------------------------------------------------------------
# 5. CLUSTER DETAIL DIAGRAM 4: Officers & System Audit Cluster
# Tables: officers, case_activity
# Stubs: cases, evidence, evidence_custody
# -----------------------------------------------------------------------------------------
def generate_officers_cluster_svg():
    width = 1200
    height = 800

    positions = {
        # Core
        "officers": (120, 180),
        "case_activity": (720, 180),

        # Stubs
        "cases": (720, 480),
        "evidence": (120, 480)
    }

    stubs = {"cases", "evidence"}

    table_svgs = []
    all_ports = {}
    for tname, (x, y) in positions.items():
        is_stub = tname in stubs
        svg_code, ports, rect = build_table_box(tname, x, y, width=280, is_stub=is_stub)
        table_svgs.append(svg_code)
        all_ports[tname] = ports

    arrow_svgs = []
    # 1. case_activity.officer_id -> officers.officer_id (SET NULL)
    src_p = all_ports["case_activity"]["officer_id"]["left"]
    tgt_p = all_ports["officers"]["officer_id"]["right"]
    arrow_svgs.append(draw_arrow("case_activity", "officer_id", "officers", "officer_id", "SET NULL", all_ports,
                                 f"M {src_p[0]} {src_p[1]} C {src_p[0]-100} {src_p[1]}, {tgt_p[0]+100} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"))

    # 2. case_activity.case_id -> cases.case_id (CASCADE)
    src_p = all_ports["case_activity"]["case_id"]["left"]
    tgt_p = all_ports["cases"]["case_id"]["left"]
    arrow_svgs.append(draw_arrow("case_activity", "case_id", "cases", "case_id", "CASCADE", all_ports,
                                 f"M {src_p[0]} {src_p[1]} C {src_p[0]-50} {src_p[1]}, {tgt_p[0]-50} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"))

    # 3. cases.lead_officer_id -> officers.officer_id (SET NULL)
    src_p = all_ports["cases"]["lead_officer_id"]["left"]
    tgt_p = all_ports["officers"]["officer_id"]["right"]
    arrow_svgs.append(draw_arrow("cases", "lead_officer_id", "officers", "officer_id", "SET NULL", all_ports,
                                 f"M {src_p[0]} {src_p[1]} C {src_p[0]-120} {src_p[1]}, {tgt_p[0]+120} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"))

    # 4. evidence.collected_by_officer_id -> officers.officer_id (SET NULL)
    src_p = all_ports["evidence"]["collected_by_officer_id"]["left"]
    tgt_p = all_ports["officers"]["officer_id"]["left"]
    arrow_svgs.append(draw_arrow("evidence", "collected_by_officer_id", "officers", "officer_id", "SET NULL", all_ports,
                                 f"M {src_p[0]} {src_p[1]} C {src_p[0]-60} {src_p[1]}, {tgt_p[0]-60} {tgt_p[1]}, {tgt_p[0]} {tgt_p[1]}"))

    svg_out = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    <marker id="arrow-cascade" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
      <path d="M 0 1 L 8 4.5 L 0 8 Z" fill="{PALETTE["line_cascade"]}"/>
    </marker>
    <marker id="arrow-setnull" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
      <path d="M 0 1 L 8 4.5 L 0 8 Z" fill="{PALETTE["line_setnull"]}"/>
    </marker>
  </defs>

  <rect width="100%" height="100%" fill="#f8fafc"/>
  <rect x="0" y="0" width="{width}" height="70" fill="#0f172a"/>
  <text x="40" y="32" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="bold">
    Relational Schema Detail: Officers &amp; System Audit Cluster
  </text>
  <text x="40" y="54" fill="#94a3b8" font-family="Segoe UI, Arial, sans-serif" font-size="12">
    Personnel management, operational activity trail, lead officer designation, and evidence recovery attribution (4 FK Arrows)
  </text>

  <g id="foreign-key-arrows">
    {"\n    ".join(arrow_svgs)}
  </g>
  <g id="table-boxes">
    {"\n    ".join(table_svgs)}
  </g>
</svg>"""

    out_file = os.path.join(OUT_DIR, "relational_schema_officers_cluster.svg")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(svg_out)
    print(f"Generated: {out_file} (Tables: {len(positions)}, FK Arrows: {len(arrow_svgs)})")
    assert len(arrow_svgs) == 4, f"Expected 4 arrows in officers cluster, got {len(arrow_svgs)}"


def main():
    print("Generating Academic Relational Schema Diagrams from schema.json...")
    generate_full_schema_svg()
    generate_cases_cluster_svg()
    generate_assets_cluster_svg()
    generate_evidence_cluster_svg()
    generate_officers_cluster_svg()
    print("All 5 relational schema SVGs generated cleanly.")

if __name__ == "__main__":
    main()
