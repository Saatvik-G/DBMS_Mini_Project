#!/usr/bin/env python3
"""
generate_all_diagrams.py
Generates academic-grade vector SVG diagrams for:
1. Chen Conceptual ER:
   - chen_overview.svg
   - chen_case_management.svg
   - chen_entities_assets.svg
   - chen_evidence_custody.svg
   - chen_officers_audit.svg
2. Crow's-Foot Logical/Physical Schema:
   - crowsfoot_full_schema.svg
   - crowsfoot_case_cluster.svg
   - crowsfoot_entities_assets.svg
   - crowsfoot_evidence_custody.svg
   - crowsfoot_officers_audit.svg
3. MongoDB Document & Polyglot Model:
   - mongodb_document_model.svg
4. System Architecture:
   - system_architecture.svg
5. Process Flowcharts:
   - flowchart_login_rbac.svg
   - flowchart_case_creation_sp_trigger.svg
   - flowchart_evidence_custody.svg
   - flowchart_unified_search.svg

All diagrams are built from the EXACT schema (database/sql/schema.sql and database/mongodb/collection-schema.json).
"""

import os
import math

OUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "docs", "diagrams"))
os.makedirs(OUT_DIR, exist_ok=True)

# -------------------------------------------------------------
# SVG Builder Primitives
# -------------------------------------------------------------
class SvgBuilder:
    def __init__(self, width, height, title="Diagram"):
        self.width = width
        self.height = height
        self.title = title
        self.elements = []
        self.defs = []

    def add_def(self, def_str):
        self.defs.append(def_str)

    def rect(self, x, y, w, h, fill="#ffffff", stroke="#1e293b", stroke_width=1.5, rx=0, ry=0, dash=None):
        dash_attr = f' stroke-dasharray="{dash}"' if dash else ''
        self.elements.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" ry="{ry}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{stroke_width}"{dash_attr} />'
        )

    def double_rect(self, x, y, w, h, fill="#ffffff", stroke="#1e293b", stroke_width=1.5, gap=4):
        self.rect(x, y, w, h, fill=fill, stroke=stroke, stroke_width=stroke_width)
        self.rect(x + gap, y + gap, w - 2*gap, h - 2*gap, fill="none", stroke=stroke, stroke_width=stroke_width)

    def diamond(self, cx, cy, rw, rh, fill="#ffffff", stroke="#1e293b", stroke_width=1.5):
        pts = f"{cx},{cy-rh} {cx+rw},{cy} {cx},{cy+rh} {cx-rw},{cy}"
        self.elements.append(
            f'<polygon points="{pts}" fill="{fill}" stroke="{stroke}" stroke-width="{stroke_width}" />'
        )

    def double_diamond(self, cx, cy, rw, rh, fill="#ffffff", stroke="#1e293b", stroke_width=1.5, gap=4):
        self.diamond(cx, cy, rw, rh, fill=fill, stroke=stroke, stroke_width=stroke_width)
        g_rw = rw - gap * (rw/rh)
        g_rh = rh - gap
        pts = f"{cx},{cy-g_rh} {cx+g_rw},{cy} {cx},{cy+g_rh} {cx-g_rw},{cy}"
        self.elements.append(
            f'<polygon points="{pts}" fill="none" stroke="{stroke}" stroke-width="{stroke_width}" />'
        )

    def ellipse(self, cx, cy, rx, ry, fill="#ffffff", stroke="#1e293b", stroke_width=1.5, dash=None, double=False):
        dash_attr = f' stroke-dasharray="{dash}"' if dash else ''
        self.elements.append(
            f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{stroke_width}"{dash_attr} />'
        )
        if double:
            self.elements.append(
                f'<ellipse cx="{cx}" cy="{cy}" rx="{rx-3}" ry="{ry-3}" '
                f'fill="none" stroke="{stroke}" stroke-width="{stroke_width}"{dash_attr} />'
            )

    def line(self, x1, y1, x2, y2, stroke="#1e293b", stroke_width=1.5, double=False, dash=None, gap=3, marker_end=None):
        dash_attr = f' stroke-dasharray="{dash}"' if dash else ''
        marker_attr = f' marker-end="url(#{marker_end})"' if marker_end else ''
        if not double:
            self.elements.append(
                f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
                f'stroke="{stroke}" stroke-width="{stroke_width}"{dash_attr}{marker_attr} />'
            )
        else:
            dx = x2 - x1
            dy = y2 - y1
            length = math.hypot(dx, dy)
            if length == 0:
                return
            px = -dy / length * (gap / 2.0)
            py = dx / length * (gap / 2.0)
            self.elements.append(
                f'<line x1="{x1+px}" y1="{y1+py}" x2="{x2+px}" y2="{y2+py}" '
                f'stroke="{stroke}" stroke-width="{stroke_width}"{dash_attr} />'
            )
            self.elements.append(
                f'<line x1="{x1-px}" y1="{y1-py}" x2="{x2-px}" y2="{y2-py}" '
                f'stroke="{stroke}" stroke-width="{stroke_width}"{dash_attr} />'
            )

    def polyline(self, pts, stroke="#1e293b", stroke_width=1.5, fill="none", dash=None, marker_end=None):
        pts_str = " ".join(f"{x},{y}" for x, y in pts)
        dash_attr = f' stroke-dasharray="{dash}"' if dash else ''
        marker_attr = f' marker-end="url(#{marker_end})"' if marker_end else ''
        self.elements.append(
            f'<polyline points="{pts_str}" fill="{fill}" stroke="{stroke}" '
            f'stroke-width="{stroke_width}"{dash_attr}{marker_attr} />'
        )

    def text(self, x, y, string, font_size=12, font_family="system-ui, -apple-system, sans-serif",
             font_weight="normal", anchor="middle", fill="#0f172a", underline=False, font_style="normal"):
        u_attr = ' text-decoration="underline"' if underline else ''
        style_attr = f' font-style="{font_style}"' if font_style != "normal" else ''
        self.elements.append(
            f'<text x="{x}" y="{y}" font-family="{font_family}" font-size="{font_size}" '
            f'font-weight="{font_weight}" text-anchor="{anchor}" fill="{fill}"{u_attr}{style_attr}>{string}</text>'
        )

    def render(self):
        defs_rendered = "\n".join(self.defs)
        elements_rendered = "\n".join(self.elements)
        return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.width} {self.height}" width="{self.width}" height="{self.height}">
<style>
  text {{ font-family: "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }}
  .title {{ font-size: 18px; font-weight: 700; fill: #0f172a; }}
  .subtitle {{ font-size: 12px; font-weight: 500; fill: #475569; }}
  .legend {{ font-size: 11px; fill: #334155; }}
  .mono {{ font-family: "JetBrains Mono", Consolas, "Courier New", monospace; }}
</style>
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 1 L 10 5 L 0 9 z" fill="#1e293b" />
  </marker>
  <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb" />
  </marker>
  <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706" />
  </marker>
{defs_rendered}
</defs>
<rect width="100%" height="100%" fill="#ffffff" />
{elements_rendered}
</svg>"""

    def save(self, filepath):
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(self.render())
        print(f"Generated: {filepath}")

# -------------------------------------------------------------
# 1. CHEN NOTATION DIAGRAMS
# -------------------------------------------------------------
def build_chen_overview():
    """
    Overview: 10 entities (8 strong, 2 weak), 12 M:N relationship diamonds, 5 1:N / identifying diamonds.
    Pure entities + relationship diamonds, clean cardinalities and participation.
    """
    svg = SvgBuilder(1200, 850, "Chen Conceptual ER - Complete Architecture Overview")

    # Header
    svg.text(600, 32, "Intelligence Fusion Platform — Conceptual ER Model (Chen Notation Overview)", 18, font_weight="700")
    svg.text(600, 52, "Showing all 10 Entities (8 Strong, 2 Weak) and 17 Key Relationships (12 M:N Bridges + 5 Identifying/Hierarchical)", 12, fill="#475569")

    # Legend at bottom
    ly = 780
    svg.rect(50, ly, 1100, 55, fill="#f8fafc", stroke="#cbd5e1", rx=4, ry=4)
    svg.text(120, ly + 25, "Legend:", 11, font_weight="700")
    # Strong entity
    svg.rect(170, ly + 12, 60, 26, fill="#ffffff", stroke="#1e293b", stroke_width=1.5)
    svg.text(200, ly + 29, "Entity", 10)
    # Weak entity
    svg.double_rect(245, ly + 12, 70, 26, fill="#ffffff", stroke="#1e293b", stroke_width=1.5)
    svg.text(280, ly + 29, "Weak Entity", 9)
    # Relationship
    svg.diamond(360, ly + 25, 25, 14, fill="#ffffff", stroke="#1e293b", stroke_width=1.5)
    svg.text(360, ly + 28, "Rel", 8)
    # Identifying Rel
    svg.double_diamond(430, ly + 25, 28, 15, fill="#ffffff", stroke="#1e293b", stroke_width=1.5)
    svg.text(430, ly + 28, "Id. Rel", 8)
    # Cardinality
    svg.line(480, ly + 25, 530, ly + 25, stroke="#1e293b", stroke_width=1.5)
    svg.text(505, ly + 18, "1 : N", 9, font_weight="600")
    # Total participation
    svg.line(550, ly + 25, 600, ly + 25, stroke="#1e293b", stroke_width=1.5, double=True)
    svg.text(575, ly + 18, "Total Part.", 9, font_weight="600")
    # Note on M:N
    svg.text(820, ly + 29, "Note: All 12 M:N associative junction tables are modeled as relationship diamonds.", 10, fill="#64748b", font_style="italic")

    # Entities layout
    # Center core: CASES (cx=600, cy=350)
    # Left: OFFICERS (cx=220, cy=180)
    # Top-Right: CASE_ACTIVITY (cx=980, cy=180) - Weak
    # Bottom-Center: EVIDENCE (cx=600, cy=550)
    # Bottom-Right: EVIDENCE_CUSTODY (cx=980, cy=550) - Weak
    # Assets & Parties Ring:
    # Top-Left: PEOPLE (cx=220, cy=350)
    # Bottom-Left: ORGANIZATIONS (cx=220, cy=520)
    # Right: VEHICLES (cx=980, cy=350)
    # Far-Right / Bottom: DEVICES (cx=600, cy=700)
    # Far-Left / Bottom: LOCATIONS (cx=220, cy=680)

    entities = {
        "officers": {"x": 160, "y": 140, "w": 120, "h": 50, "label": "OFFICERS", "weak": False},
        "cases": {"x": 540, "y": 290, "w": 120, "h": 50, "label": "CASES", "weak": False},
        "case_activity": {"x": 920, "y": 140, "w": 140, "h": 50, "label": "CASE_ACTIVITY", "weak": True},
        "evidence": {"x": 530, "y": 480, "w": 140, "h": 50, "label": "EVIDENCE", "weak": False},
        "evidence_custody": {"x": 900, "y": 480, "w": 160, "h": 50, "label": "EVIDENCE_CUSTODY", "weak": True},
        "people": {"x": 160, "y": 310, "w": 120, "h": 50, "label": "PEOPLE", "weak": False},
        "organizations": {"x": 140, "y": 460, "w": 160, "h": 50, "label": "ORGANIZATIONS", "weak": False},
        "vehicles": {"x": 920, "y": 310, "w": 120, "h": 50, "label": "VEHICLES", "weak": False},
        "devices": {"x": 920, "y": 640, "w": 120, "h": 50, "label": "DEVICES", "weak": False},
        "locations": {"x": 160, "y": 620, "w": 130, "h": 50, "label": "LOCATIONS", "weak": False},
    }

    # Draw entities
    for k, e in entities.items():
        if e["weak"]:
            svg.double_rect(e["x"], e["y"], e["w"], e["h"], fill="#f8fafc", stroke="#0f172a", stroke_width=1.5)
        else:
            svg.rect(e["x"], e["y"], e["w"], e["h"], fill="#f8fafc", stroke="#0f172a", stroke_width=1.5, rx=3, ry=3)
        svg.text(e["x"] + e["w"]/2, e["y"] + e["h"]/2 + 5, e["label"], 12, font_weight="700")

    # Relationships data
    # (E1, E2, diamond_cx, cy, rw, rh, name, card1, card2, weak_id, total_part_e2)
    relationships = [
        # Officers -> Cases (leads)
        ("officers", "cases", 380, 220, 45, 24, "assigned_lead", "1", "N", False, False),
        # Cases -> Case Activity (identifying)
        ("cases", "case_activity", 780, 210, 45, 24, "has_log", "1", "N", True, True),
        # Officers -> Case Activity (logged_by)
        ("officers", "case_activity", 600, 165, 45, 22, "logs_action", "1", "N", False, False),
        # Cases -> Evidence (holds)
        ("cases", "evidence", 600, 410, 42, 22, "case_evidence", "1", "N", False, True),
        # Evidence -> Evidence Custody (identifying)
        ("evidence", "evidence_custody", 780, 505, 48, 24, "custody_chain", "1", "N", True, True),
        # Officers -> Evidence Custody (custodian)
        ("officers", "evidence_custody", 480, 120, 44, 20, "officer_custody", "1", "N", False, False),

        # M:N Cases to People, Orgs, Vehicles, Devices, Locations
        ("cases", "people", 390, 315, 46, 22, "case_people", "M", "N", False, False),
        ("cases", "organizations", 380, 395, 48, 22, "case_orgs", "M", "N", False, False),
        ("cases", "vehicles", 800, 315, 46, 22, "case_vehicles", "M", "N", False, False),
        ("cases", "locations", 400, 490, 46, 22, "case_locs", "M", "N", False, False),

        # M:N People to Orgs, Vehicles, Devices
        ("people", "organizations", 220, 405, 42, 20, "member_of", "M", "N", False, False),
        ("people", "vehicles", 550, 260, 46, 20, "operates", "M", "N", False, False),
        ("people", "devices", 550, 350, 44, 20, "uses_device", "M", "N", False, False),

        # M:N Evidence to People, Vehicles, Devices, Locations
        ("evidence", "people", 400, 450, 46, 20, "evid_person", "M", "N", False, False),
        ("evidence", "vehicles", 780, 420, 46, 20, "evid_vehicle", "M", "N", False, False),
        ("evidence", "devices", 780, 600, 46, 20, "evid_device", "M", "N", False, False),
        ("evidence", "locations", 390, 580, 46, 20, "evid_loc", "M", "N", False, False),
    ]

    for r in relationships:
        e1_name, e2_name, cx, cy, rw, rh, label, c1, c2, is_id, is_total = r
        e1 = entities[e1_name]
        e2 = entities[e2_name]
        e1_center = (e1["x"] + e1["w"]/2, e1["y"] + e1["h"]/2)
        e2_center = (e2["x"] + e2["w"]/2, e2["y"] + e2["h"]/2)

        # Draw lines from e1 to diamond, diamond to e2
        svg.line(e1_center[0], e1_center[1], cx, cy, stroke="#334155", stroke_width=1.5)
        svg.line(cx, cy, e2_center[0], e2_center[1], stroke="#334155", stroke_width=1.5, double=is_total)

        # Draw diamond
        if is_id:
            svg.double_diamond(cx, cy, rw, rh, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
        else:
            svg.diamond(cx, cy, rw, rh, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
        svg.text(cx, cy + 4, label, 9, font_weight="600")

        # Cardinality labels
        # near e1
        t1x = e1_center[0] * 0.4 + cx * 0.6
        t1y = e1_center[1] * 0.4 + cy * 0.6 - 6
        svg.text(t1x, t1y, c1, 10, font_weight="700", fill="#1e293b")

        # near e2
        t2x = e2_center[0] * 0.4 + cx * 0.6
        t2y = e2_center[1] * 0.4 + cy * 0.6 - 6
        svg.text(t2x, t2y, c2, 10, font_weight="700", fill="#1e293b")

    out_path = os.path.join(OUT_DIR, "chen_overview.svg")
    svg.save(out_path)


def build_chen_case_cluster():
    """
    Cluster 1: Case Management (Cases, Case Activity, Officers, Lead Assignment, Activity Trigger)
    Complete with all attributes (ovals), underlined PKs, partial keys, relationship attributes.
    """
    svg = SvgBuilder(1100, 750, "Chen ER - Case Management Cluster")

    # Header
    svg.text(550, 32, "Chen ER Detail: Case Management & Audit Cluster", 18, font_weight="700")
    svg.text(550, 52, "Entities: CASES, CASE_ACTIVITY (Weak Entity), OFFICERS with complete attributes and cardinalities", 12, fill="#475569")

    # Central Entity: CASES
    cx, cy, cw, ch = 480, 320, 150, 56
    svg.rect(cx, cy, cw, ch, fill="#f8fafc", stroke="#0f172a", stroke_width=2, rx=3, ry=3)
    svg.text(cx + cw/2, cy + ch/2 + 5, "CASES", 14, font_weight="700")

    # CASES attributes (around CASES)
    case_attrs = [
        ("case_id", 320, 240, True, False, False),
        ("title", 430, 210, False, False, False),
        ("description", 550, 205, False, False, False),
        ("case_type", 660, 220, False, False, False),
        ("status", 700, 290, False, False, False),
        ("priority", 710, 350, False, False, False),
        ("incident_date", 700, 420, False, False, False),
        ("closed_at", 640, 470, False, False, False),
        ("created_at", 520, 480, False, False, False),
        ("updated_at", 400, 470, False, False, False),
    ]
    for name, ax, ay, is_pk, is_deriv, is_multi in case_attrs:
        svg.line(cx + cw/2, cy + ch/2, ax, ay, stroke="#64748b", stroke_width=1.2)
        svg.ellipse(ax, ay, 46, 18, fill="#ffffff", stroke="#334155", stroke_width=1.4)
        svg.text(ax, ay + 4, name, 10, font_weight="600" if is_pk else "normal", underline=is_pk)

    # Weak Entity: CASE_ACTIVITY
    ax, ay, aw, ah = 820, 540, 160, 54
    svg.double_rect(ax, ay, aw, ah, fill="#f8fafc", stroke="#0f172a", stroke_width=1.8)
    svg.text(ax + aw/2, ay + ah/2 + 5, "CASE_ACTIVITY", 13, font_weight="700")

    # Identifying Relationship: logs_activity (between CASES and CASE_ACTIVITY)
    rx, ry = 680, 500
    svg.line(cx + cw/2, cy + ch/2, rx, ry, stroke="#334155", stroke_width=1.5)
    svg.line(rx, ry, ax + aw/2, ay + ah/2, stroke="#334155", stroke_width=1.5, double=True)
    svg.double_diamond(rx, ry, 50, 25, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
    svg.text(rx, ry + 4, "logs_activity", 9, font_weight="600")
    svg.text(580, 410, "1", 11, font_weight="700")
    svg.text(770, 530, "N", 11, font_weight="700")

    # CASE_ACTIVITY attributes
    act_attrs = [
        ("activity_id", 840, 660, True),   # partial key
        ("activity_type", 950, 660, False),
        ("title", 1020, 590, False),
        ("description", 1020, 510, False),
        ("metadata_json", 980, 440, False),
        ("activity_timestamp", 860, 430, False),
    ]
    for name, px, py, is_pkey in act_attrs:
        svg.line(ax + aw/2, ay + ah/2, px, py, stroke="#64748b", stroke_width=1.2)
        svg.ellipse(px, py, 52, 18, fill="#ffffff", stroke="#334155", stroke_width=1.4)
        svg.text(px, py + 4, name, 9, font_style="italic" if is_pkey else "normal", underline=is_pkey)

    # Entity: OFFICERS
    ox, oy, ow, oh = 120, 320, 140, 56
    svg.rect(ox, oy, ow, oh, fill="#f8fafc", stroke="#0f172a", stroke_width=2, rx=3, ry=3)
    svg.text(ox + ow/2, oy + oh/2 + 5, "OFFICERS", 14, font_weight="700")

    # OFFICERS attributes
    off_attrs = [
        ("officer_id", 80, 220, True),
        ("badge_number", 190, 200, False),
        ("full_name", 100, 150, False),
        ("rank", 210, 140, False),
        ("department", 70, 430, False),
        ("contact_email", 80, 500, False),
        ("role", 180, 530, False),
        ("is_active", 80, 570, False),
    ]
    for name, px, py, is_pk in off_attrs:
        svg.line(ox + ow/2, oy + oh/2, px, py, stroke="#64748b", stroke_width=1.2)
        svg.ellipse(px, py, 46, 18, fill="#ffffff", stroke="#334155", stroke_width=1.4)
        svg.text(px, py + 4, name, 9, font_weight="600" if is_pk else "normal", underline=is_pk)

    # Relationship: assigned_lead (Officers -> Cases)
    lx, ly = 330, 348
    svg.line(ox + ow, oy + oh/2, lx, ly, stroke="#334155", stroke_width=1.5)
    svg.line(lx, ly, cx, cy + ch/2, stroke="#334155", stroke_width=1.5)
    svg.diamond(lx, ly, 45, 24, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
    svg.text(lx, ly + 4, "assigned_lead", 9, font_weight="600")
    svg.text(280, 335, "1", 11, font_weight="700")
    svg.text(420, 335, "N", 11, font_weight="700")

    # Relationship: performs (Officers -> Case Activity)
    pfx, pfy = 500, 640
    svg.line(ox + ow/2, oy + oh, pfx, pfy, stroke="#334155", stroke_width=1.5)
    svg.line(pfx, pfy, ax, ay + ah/2, stroke="#334155", stroke_width=1.5)
    svg.diamond(pfx, pfy, 45, 22, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
    svg.text(pfx, pfy + 4, "performs", 9, font_weight="600")
    svg.text(280, 560, "1", 11, font_weight="700")
    svg.text(760, 600, "N", 11, font_weight="700")

    # Caption / Footnote
    svg.rect(50, 700, 1000, 36, fill="#f1f5f9", stroke="#cbd5e1", rx=3, ry=3)
    svg.text(550, 722, "Figure A.1: Case Management Cluster (Chen Notation). Weak entity CASE_ACTIVITY exhibits total participation in identifying relationship.", 11, fill="#334155")

    out_path = os.path.join(OUT_DIR, "chen_case_management.svg")
    svg.save(out_path)


def build_chen_entities_assets():
    """
    Cluster 2: People, Organizations, Vehicles, Devices, Locations
    Showing entities with all attributes and M:N relationships between them.
    """
    svg = SvgBuilder(1150, 800, "Chen ER - People, Organizations & Assets Cluster")

    svg.text(575, 32, "Chen ER Detail: People, Organizations & Physical Assets Cluster", 18, font_weight="700")
    svg.text(575, 52, "Strong entities PEOPLE, ORGANIZATIONS, VEHICLES, DEVICES, LOCATIONS with association diamonds", 12, fill="#475569")

    # Center: PEOPLE
    px, py, pw, ph = 480, 280, 140, 54
    svg.rect(px, py, pw, ph, fill="#f8fafc", stroke="#0f172a", stroke_width=2, rx=3, ry=3)
    svg.text(px + pw/2, py + ph/2 + 5, "PEOPLE", 14, font_weight="700")

    # People attributes
    pattrs = [
        ("person_id", 340, 220, True),
        ("full_name", 430, 180, False),
        ("date_of_birth", 530, 170, False),
        ("national_id", 630, 180, False),
        ("category", 680, 230, False),
        ("contact_details", 670, 360, False),
        ("address", 580, 390, False),
        ("status", 460, 390, False),
        ("notes", 360, 360, False),
    ]
    for name, ax, ay, is_pk in pattrs:
        svg.line(px + pw/2, py + ph/2, ax, ay, stroke="#64748b", stroke_width=1.2)
        svg.ellipse(ax, ay, 46, 17, fill="#ffffff", stroke="#334155", stroke_width=1.4)
        svg.text(ax, ay + 4, name, 9, font_weight="600" if is_pk else "normal", underline=is_pk)

    # Top-Left: ORGANIZATIONS
    ox, oy, ow, oh = 120, 120, 160, 52
    svg.rect(ox, oy, ow, oh, fill="#f8fafc", stroke="#0f172a", stroke_width=2, rx=3, ry=3)
    svg.text(ox + ow/2, oy + oh/2 + 5, "ORGANIZATIONS", 13, font_weight="700")

    oattrs = [
        ("organization_id", 70, 40, True),
        ("name", 170, 35, False),
        ("organization_type", 280, 40, False),
        ("registration_number", 60, 220, False),
        ("address", 150, 225, False),
        ("contact_details", 250, 220, False),
    ]
    for name, ax, ay, is_pk in oattrs:
        svg.line(ox + ow/2, oy + oh/2, ax, ay, stroke="#64748b", stroke_width=1.2)
        svg.ellipse(ax, ay, 48, 16, fill="#ffffff", stroke="#334155", stroke_width=1.4)
        svg.text(ax, ay + 4, name, 8, font_weight="600" if is_pk else "normal", underline=is_pk)

    # M:N Relationship: member_of (People <-> Organizations)
    rel_po_x, rel_po_y = 330, 190
    svg.line(ox + ow, oy + oh/2, rel_po_x, rel_po_y, stroke="#334155", stroke_width=1.5)
    svg.line(rel_po_x, rel_po_y, px, py + ph/2, stroke="#334155", stroke_width=1.5)
    svg.diamond(rel_po_x, rel_po_y, 45, 22, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
    svg.text(rel_po_x, rel_po_y + 4, "member_of", 9, font_weight="600")
    # Rel attribute: role
    svg.line(rel_po_x, rel_po_y - 22, rel_po_x, rel_po_y - 45, stroke="#64748b", stroke_width=1.2)
    svg.ellipse(rel_po_x, rel_po_y - 55, 34, 15, fill="#ffffff", stroke="#334155", stroke_width=1.4)
    svg.text(rel_po_x, rel_po_y - 52, "role", 9)
    svg.text(260, 165, "M", 10, font_weight="700")
    svg.text(420, 240, "N", 10, font_weight="700")

    # Top-Right: VEHICLES
    vx, vy, vw, vh = 860, 120, 140, 52
    svg.rect(vx, vy, vw, vh, fill="#f8fafc", stroke="#0f172a", stroke_width=2, rx=3, ry=3)
    svg.text(vx + vw/2, vy + vh/2 + 5, "VEHICLES", 13, font_weight="700")

    vattrs = [
        ("vehicle_id", 840, 45, True),
        ("registration_number", 950, 40, False),
        ("make", 1060, 60, False),
        ("model", 1070, 120, False),
        ("color", 1070, 180, False),
        ("vehicle_type", 1030, 230, False),
    ]
    for name, ax, ay, is_pk in vattrs:
        svg.line(vx + vw/2, vy + vh/2, ax, ay, stroke="#64748b", stroke_width=1.2)
        svg.ellipse(ax, ay, 46, 16, fill="#ffffff", stroke="#334155", stroke_width=1.4)
        svg.text(ax, ay + 4, name, 8, font_weight="600" if is_pk else "normal", underline=is_pk)

    # M:N Relationship: operates (People <-> Vehicles)
    rel_pv_x, rel_pv_y = 740, 190
    svg.line(px + pw, py + ph/2, rel_pv_x, rel_pv_y, stroke="#334155", stroke_width=1.5)
    svg.line(rel_pv_x, rel_pv_y, vx, vy + vh/2, stroke="#334155", stroke_width=1.5)
    svg.diamond(rel_pv_x, rel_pv_y, 45, 22, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
    svg.text(rel_pv_x, rel_pv_y + 4, "operates", 9, font_weight="600")
    # Rel attribute: relationship_type
    svg.line(rel_pv_x, rel_pv_y - 22, rel_pv_x, rel_pv_y - 45, stroke="#64748b", stroke_width=1.2)
    svg.ellipse(rel_pv_x, rel_pv_y - 55, 48, 15, fill="#ffffff", stroke="#334155", stroke_width=1.4)
    svg.text(rel_pv_x, rel_pv_y - 52, "rel_type", 8)
    svg.text(670, 235, "M", 10, font_weight="700")
    svg.text(820, 165, "N", 10, font_weight="700")

    # Bottom-Right: DEVICES
    dx, dy, dw, dh = 860, 500, 140, 52
    svg.rect(dx, dy, dw, dh, fill="#f8fafc", stroke="#0f172a", stroke_width=2, rx=3, ry=3)
    svg.text(dx + dw/2, dy + dh/2 + 5, "DEVICES", 13, font_weight="700")

    dattrs = [
        ("device_id", 820, 600, True),
        ("device_type", 920, 620, False),
        ("manufacturer", 1030, 610, False),
        ("model", 1070, 550, False),
        ("serial_number", 1070, 480, False),
        ("imei", 1020, 430, False),
    ]
    for name, ax, ay, is_pk in dattrs:
        svg.line(dx + dw/2, dy + dh/2, ax, ay, stroke="#64748b", stroke_width=1.2)
        svg.ellipse(ax, ay, 46, 16, fill="#ffffff", stroke="#334155", stroke_width=1.4)
        svg.text(ax, ay + 4, name, 8, font_weight="600" if is_pk else "normal", underline=is_pk)

    # M:N Relationship: uses_device (People <-> Devices)
    rel_pd_x, rel_pd_y = 740, 440
    svg.line(px + pw, py + ph/2, rel_pd_x, rel_pd_y, stroke="#334155", stroke_width=1.5)
    svg.line(rel_pd_x, rel_pd_y, dx, dy + dh/2, stroke="#334155", stroke_width=1.5)
    svg.diamond(rel_pd_x, rel_pd_y, 45, 22, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
    svg.text(rel_pd_x, rel_pd_y + 4, "uses_device", 9, font_weight="600")
    svg.text(670, 390, "M", 10, font_weight="700")
    svg.text(820, 485, "N", 10, font_weight="700")

    # Bottom-Left: LOCATIONS
    lx, ly, lw, lh = 120, 500, 150, 52
    svg.rect(lx, ly, lw, lh, fill="#f8fafc", stroke="#0f172a", stroke_width=2, rx=3, ry=3)
    svg.text(lx + lw/2, ly + lh/2 + 5, "LOCATIONS", 13, font_weight="700")

    lattrs = [
        ("location_id", 80, 610, True),
        ("name", 180, 630, False),
        ("address", 280, 620, False),
        ("latitude", 50, 440, False),
        ("longitude", 50, 500, False),
        ("location_type", 70, 560, False),
    ]
    for name, ax, ay, is_pk in lattrs:
        svg.line(lx + lw/2, ly + lh/2, ax, ay, stroke="#64748b", stroke_width=1.2)
        svg.ellipse(ax, ay, 46, 16, fill="#ffffff", stroke="#334155", stroke_width=1.4)
        svg.text(ax, ay + 4, name, 8, font_weight="600" if is_pk else "normal", underline=is_pk)

    # Caption / Footnote
    svg.rect(50, 740, 1050, 36, fill="#f1f5f9", stroke="#cbd5e1", rx=3, ry=3)
    svg.text(575, 762, "Figure A.2: People, Organizations & Physical Assets Cluster (Chen Notation). Association attributes shown on diamonds.", 11, fill="#334155")

    out_path = os.path.join(OUT_DIR, "chen_entities_assets.svg")
    svg.save(out_path)


def build_chen_evidence_custody():
    """
    Cluster 3: Evidence & Chain of Custody
    Showing Evidence, Evidence Custody (Weak), Cases, Officers, and Evidence linking diamonds.
    """
    svg = SvgBuilder(1100, 750, "Chen ER - Evidence & Chain of Custody Cluster")

    svg.text(550, 32, "Chen ER Detail: Evidence & Chain of Custody Cluster", 18, font_weight="700")
    svg.text(550, 52, "Strong entity EVIDENCE and Weak entity EVIDENCE_CUSTODY with full custody transfer relationship", 12, fill="#475569")

    # EVIDENCE (Center)
    ex, ey, ew, eh = 460, 260, 160, 54
    svg.rect(ex, ey, ew, eh, fill="#f8fafc", stroke="#0f172a", stroke_width=2, rx=3, ry=3)
    svg.text(ex + ew/2, ey + eh/2 + 5, "EVIDENCE", 14, font_weight="700")

    # EVIDENCE attributes
    eattrs = [
        ("evidence_id", 320, 190, True),
        ("title", 410, 160, False),
        ("evidence_type", 510, 150, False),
        ("description", 610, 150, False),
        ("storage_location", 710, 170, False),
        ("status", 720, 240, False),
        ("chain_of_custody_hash", 720, 310, False),
        ("barcode", 690, 380, False),
        ("collection_date", 590, 400, False),
        ("created_at", 480, 410, False),
        ("updated_at", 370, 390, False),
    ]
    for name, ax, ay, is_pk in eattrs:
        svg.line(ex + ew/2, ey + eh/2, ax, ay, stroke="#64748b", stroke_width=1.2)
        svg.ellipse(ax, ay, 52, 17, fill="#ffffff", stroke="#334155", stroke_width=1.4)
        svg.text(ax, ay + 4, name, 8, font_weight="600" if is_pk else "normal", underline=is_pk)

    # Weak Entity: EVIDENCE_CUSTODY (Bottom-Right)
    ecx, ecy, ecw, ech = 780, 500, 180, 54
    svg.double_rect(ecx, ecy, ecw, ech, fill="#f8fafc", stroke="#0f172a", stroke_width=1.8)
    svg.text(ecx + ecw/2, ecy + ech/2 + 5, "EVIDENCE_CUSTODY", 12, font_weight="700")

    # Identifying Relationship: custody_log
    rx, ry = 680, 440
    svg.line(ex + ew/2, ey + eh/2, rx, ry, stroke="#334155", stroke_width=1.5)
    svg.line(rx, ry, ecx + ecw/2, ecy + ech/2, stroke="#334155", stroke_width=1.5, double=True)
    svg.double_diamond(rx, ry, 50, 25, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
    svg.text(rx, ry + 4, "custody_log", 9, font_weight="600")
    svg.text(580, 370, "1", 11, font_weight="700")
    svg.text(760, 480, "N", 11, font_weight="700")

    # EVIDENCE_CUSTODY attributes
    ecattrs = [
        ("custody_event_id", 800, 620, True),
        ("event_type", 920, 630, False),
        ("event_timestamp", 1030, 600, False),
        ("notes", 1040, 530, False),
        ("location", 1030, 460, False),
        ("verification_hash", 920, 420, False),
    ]
    for name, ax, ay, is_pk in ecattrs:
        svg.line(ecx + ecw/2, ecy + ech/2, ax, ay, stroke="#64748b", stroke_width=1.2)
        svg.ellipse(ax, ay, 50, 16, fill="#ffffff", stroke="#334155", stroke_width=1.4)
        svg.text(ax, ay + 4, name, 8, font_style="italic" if is_pk else "normal", underline=is_pk)

    # Parent Entity: CASES (Top-Left)
    cx, cy, cw, ch = 100, 260, 130, 52
    svg.rect(cx, cy, cw, ch, fill="#f8fafc", stroke="#0f172a", stroke_width=2, rx=3, ry=3)
    svg.text(cx + cw/2, cy + ch/2 + 5, "CASES", 13, font_weight="700")

    # Relationship: holds_evidence (Cases -> Evidence)
    rel_ce_x, rel_ce_y = 320, 286
    svg.line(cx + cw, cy + ch/2, rel_ce_x, rel_ce_y, stroke="#334155", stroke_width=1.5)
    svg.line(rel_ce_x, rel_ce_y, ex, ey + eh/2, stroke="#334155", stroke_width=1.5, double=True)
    svg.diamond(rel_ce_x, rel_ce_y, 45, 22, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
    svg.text(rel_ce_x, rel_ce_y + 4, "holds", 9, font_weight="600")
    svg.text(260, 275, "1", 10, font_weight="700")
    svg.text(410, 275, "N", 10, font_weight="700")

    # Parent Entity: OFFICERS (Bottom-Left)
    ox, oy, ow, oh = 100, 500, 140, 52
    svg.rect(ox, oy, ow, oh, fill="#f8fafc", stroke="#0f172a", stroke_width=2, rx=3, ry=3)
    svg.text(ox + ow/2, oy + oh/2 + 5, "OFFICERS", 13, font_weight="700")

    # Officers collected evidence
    rel_oe_x, rel_oe_y = 300, 420
    svg.line(ox + ow/2, oy, rel_oe_x, rel_oe_y, stroke="#334155", stroke_width=1.5)
    svg.line(rel_oe_x, rel_oe_y, ex, ey + eh, stroke="#334155", stroke_width=1.5)
    svg.diamond(rel_oe_x, rel_oe_y, 45, 22, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
    svg.text(rel_oe_x, rel_oe_y + 4, "collected_by", 9, font_weight="600")
    svg.text(220, 460, "1", 10, font_weight="700")
    svg.text(390, 360, "N", 10, font_weight="700")

    # Officers transferred custody
    rel_oc_x, rel_oc_y = 510, 526
    svg.line(ox + ow, oy + oh/2, rel_oc_x, rel_oc_y, stroke="#334155", stroke_width=1.5)
    svg.line(rel_oc_x, rel_oc_y, ecx, ecy + ech/2, stroke="#334155", stroke_width=1.5)
    svg.diamond(rel_oc_x, rel_oc_y, 48, 22, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
    svg.text(rel_oc_x, rel_oc_y + 4, "custodian", 9, font_weight="600")
    svg.text(280, 515, "1", 10, font_weight="700")
    svg.text(720, 515, "N", 10, font_weight="700")

    # Caption / Footnote
    svg.rect(50, 690, 1000, 36, fill="#f1f5f9", stroke="#cbd5e1", rx=3, ry=3)
    svg.text(550, 712, "Figure A.3: Evidence & Custody Cluster (Chen Notation). Demonstrating weak entity dependency and chain-of-custody logging.", 11, fill="#334155")

    out_path = os.path.join(OUT_DIR, "chen_evidence_custody.svg")
    svg.save(out_path)


def build_chen_officers_audit():
    """
    Cluster 4: Officers & System Audit
    Showing Officers, Roles, Case Activity, Custody, Cases.
    """
    svg = SvgBuilder(1100, 720, "Chen ER - Officers & System Audit Cluster")

    svg.text(550, 32, "Chen ER Detail: Officers, RBAC & Immutable Audit Logs", 18, font_weight="700")
    svg.text(550, 52, "Demonstrating how OFFICERS link to CASES (lead), CASE_ACTIVITY (audit trigger), and EVIDENCE_CUSTODY", 12, fill="#475569")

    # Center: OFFICERS
    ox, oy, ow, oh = 460, 280, 160, 56
    svg.rect(ox, oy, ow, oh, fill="#f8fafc", stroke="#0f172a", stroke_width=2, rx=3, ry=3)
    svg.text(ox + ow/2, oy + oh/2 + 5, "OFFICERS", 14, font_weight="700")

    # Officers attributes
    oattrs = [
        ("officer_id", 340, 200, True),
        ("badge_number", 430, 170, False),
        ("full_name", 540, 160, False),
        ("rank", 640, 170, False),
        ("department", 720, 220, False),
        ("contact_email", 730, 290, False),
        ("role", 720, 360, False),
        ("phone_number", 640, 410, False),
        ("is_active", 530, 420, False),
        ("created_at", 420, 410, False),
    ]
    for name, ax, ay, is_pk in oattrs:
        svg.line(ox + ow/2, oy + oh/2, ax, ay, stroke="#64748b", stroke_width=1.2)
        svg.ellipse(ax, ay, 48, 17, fill="#ffffff", stroke="#334155", stroke_width=1.4)
        svg.text(ax, ay + 4, name, 8, font_weight="600" if is_pk else "normal", underline=is_pk)

    # CASES (Top-Left)
    cx, cy, cw, ch = 100, 100, 140, 52
    svg.rect(cx, cy, cw, ch, fill="#f8fafc", stroke="#0f172a", stroke_width=2, rx=3, ry=3)
    svg.text(cx + cw/2, cy + ch/2 + 5, "CASES", 13, font_weight="700")

    # Rel: leads_case
    r1x, r1y = 300, 180
    svg.line(ox + ow/2, oy, r1x, r1y, stroke="#334155", stroke_width=1.5)
    svg.line(r1x, r1y, cx + cw, cy + ch/2, stroke="#334155", stroke_width=1.5)
    svg.diamond(r1x, r1y, 45, 22, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
    svg.text(r1x, r1y + 4, "assigned_lead", 9, font_weight="600")
    svg.text(390, 230, "1", 10, font_weight="700")
    svg.text(260, 130, "N", 10, font_weight="700")

    # CASE_ACTIVITY (Bottom-Left) - Weak
    ax, ay, aw, ah = 90, 480, 160, 52
    svg.double_rect(ax, ay, aw, ah, fill="#f8fafc", stroke="#0f172a", stroke_width=1.8)
    svg.text(ax + aw/2, ay + ah/2 + 5, "CASE_ACTIVITY", 12, font_weight="700")

    # Rel: logs_action
    r2x, r2y = 300, 430
    svg.line(ox + ow/2, oy + oh, r2x, r2y, stroke="#334155", stroke_width=1.5)
    svg.line(r2x, r2y, ax + aw, ay + ah/2, stroke="#334155", stroke_width=1.5)
    svg.diamond(r2x, r2y, 45, 22, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
    svg.text(r2x, r2y + 4, "logs_action", 9, font_weight="600")
    svg.text(390, 370, "1", 10, font_weight="700")
    svg.text(260, 490, "N", 10, font_weight="700")

    # EVIDENCE_CUSTODY (Right) - Weak
    ecx, ecy, ecw, ech = 860, 280, 170, 52
    svg.double_rect(ecx, ecy, ecw, ech, fill="#f8fafc", stroke="#0f172a", stroke_width=1.8)
    svg.text(ecx + ecw/2, ecy + ech/2 + 5, "EVIDENCE_CUSTODY", 12, font_weight="700")

    # Rel: custodian_of
    r3x, r3y = 740, 306
    svg.line(ox + ow, oy + oh/2, r3x, r3y, stroke="#334155", stroke_width=1.5)
    svg.line(r3x, r3y, ecx, ecy + ech/2, stroke="#334155", stroke_width=1.5)
    svg.diamond(r3x, r3y, 45, 22, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
    svg.text(r3x, r3y + 4, "custodian", 9, font_weight="600")
    svg.text(660, 295, "1", 10, font_weight="700")
    svg.text(820, 295, "N", 10, font_weight="700")

    # Caption / Footnote
    svg.rect(50, 650, 1000, 36, fill="#f1f5f9", stroke="#cbd5e1", rx=3, ry=3)
    svg.text(550, 672, "Figure A.4: Officers & System Audit Cluster (Chen Notation). Demonstrating accountability references across case leads and forensic audit trails.", 11, fill="#334155")

    out_path = os.path.join(OUT_DIR, "chen_officers_audit.svg")
    svg.save(out_path)

# -------------------------------------------------------------
# 2. CROW'S-FOOT NOTATION DIAGRAMS
# -------------------------------------------------------------
def draw_crowsfoot_card(svg, x, y, w, title, pks, fks, others, is_weak=False):
    """
    Draws a clean, publication-ready Crow's Foot table card.
    Header: title
    Compartment 1: Primary Keys (PK)
    Compartment 2: Foreign Keys (FK)
    Compartment 3: Non-key attributes
    """
    row_h = 16
    h_header = 24
    h_pk = len(pks) * row_h + (4 if pks else 0)
    h_fk = len(fks) * row_h + (4 if fks else 0)
    h_oth = len(others) * row_h + (4 if others else 0)
    total_h = h_header + h_pk + h_fk + h_oth + 6

    # Box outline
    bg = "#f8fafc" if not is_weak else "#ffffff"
    stroke = "#0f172a" if not is_weak else "#1e293b"
    stroke_w = 1.5 if not is_weak else 1.8
    svg.rect(x, y, w, total_h, fill=bg, stroke=stroke, stroke_width=stroke_w, rx=2, ry=2)

    # Header bar
    hbg = "#0f172a" if not is_weak else "#334155"
    svg.rect(x, y, w, h_header, fill=hbg, stroke=hbg, rx=2, ry=2)
    svg.text(x + w/2, y + 16, title.upper(), 11, font_weight="700", fill="#ffffff")

    curr_y = y + h_header + 4

    # PKs
    if pks:
        for col, ctype in pks:
            svg.text(x + 8, curr_y + 11, "PK", 9, font_weight="700", fill="#b45309", anchor="start")
            svg.text(x + 32, curr_y + 11, col, 9, font_weight="600", fill="#0f172a", anchor="start")
            svg.text(x + w - 8, curr_y + 11, ctype, 8, font_weight="normal", fill="#64748b", anchor="end")
            curr_y += row_h
        svg.line(x, curr_y + 1, x + w, curr_y + 1, stroke="#cbd5e1", stroke_width=1)
        curr_y += 3

    # FKs
    if fks:
        for col, ctype, ref in fks:
            svg.text(x + 8, curr_y + 11, "FK", 9, font_weight="700", fill="#2563eb", anchor="start")
            svg.text(x + 32, curr_y + 11, col, 9, font_weight="500", fill="#0f172a", anchor="start")
            svg.text(x + w - 8, curr_y + 11, ctype, 8, font_weight="normal", fill="#64748b", anchor="end")
            curr_y += row_h
        svg.line(x, curr_y + 1, x + w, curr_y + 1, stroke="#cbd5e1", stroke_width=1)
        curr_y += 3

    # Others
    if others:
        for col, ctype in others:
            svg.text(x + 32, curr_y + 11, col, 8.5, font_weight="normal", fill="#334155", anchor="start")
            svg.text(x + w - 8, curr_y + 11, ctype, 8, font_weight="normal", fill="#94a3b8", anchor="end")
            curr_y += row_h

    return {"x": x, "y": y, "w": w, "h": total_h, "top": (x + w/2, y), "bottom": (x + w/2, y + total_h),
            "left": (x, y + total_h/2), "right": (x + w, y + total_h/2)}


def draw_crows_foot_edge(svg, p1, p2, card1="one", card2="many"):
    """
    Draws orthogonal connection with Crow's foot ends:
    'one': two parallel ticks (mandatory one: ||-)
    'many': crow's foot fork with circle/tick (>|-)
    """
    x1, y1 = p1
    x2, y2 = p2

    # Draw line
    svg.line(x1, y1, x2, y2, stroke="#475569", stroke_width=1.3)

    # Ends decoration
    def draw_end(x, y, angle, kind):
        dx = math.cos(angle)
        dy = math.sin(angle)
        px = -dy
        py = dx
        if kind == "one":
            # Two perpendicular lines
            for d in [6, 12]:
                lx1 = x + dx * d + px * 5
                ly1 = y + dy * d + py * 5
                lx2 = x + dx * d - px * 5
                ly2 = y + dy * d - py * 5
                svg.line(lx1, ly1, lx2, ly2, stroke="#475569", stroke_width=1.3)
        elif kind == "many":
            # Crow's foot fork
            fork_len = 12
            spread = 6
            fx = x + dx * fork_len
            fy = y + dy * fork_len
            # branch 1
            svg.line(x, y, fx + px * spread, fy + py * spread, stroke="#475569", stroke_width=1.3)
            # branch 2
            svg.line(x, y, fx - px * spread, fy - py * spread, stroke="#475569", stroke_width=1.3)
            # tick
            svg.line(x + dx * 14 + px * 5, y + dy * 14 + py * 5,
                     x + dx * 14 - px * 5, y + dy * 14 - py * 5, stroke="#475569", stroke_width=1.3)

    angle1 = math.atan2(y2 - y1, x2 - x1)
    angle2 = math.atan2(y1 - y2, x1 - x2)
    draw_end(x1, y1, angle1, card1)
    draw_end(x2, y2, angle2, card2)


def build_crowsfoot_full_schema():
    """
    Full 22 tables schema in Crow's-foot notation.
    Organized into logical clusters with all keys, types, and relationships.
    """
    svg = SvgBuilder(1450, 1100, "Crow's-Foot Physical Schema - All 22 Relations")

    # Header
    svg.text(725, 30, "Intelligence Fusion Platform — Physical Relational Schema (Crow's-Foot Notation)", 18, font_weight="700")
    svg.text(725, 50, "Complete 22-Table Architecture: 10 Primary Entity/Audit Relations and 12 Associative Junction Tables", 12, fill="#475569")

    # Card layout
    # Row 1: Core Officers & Cases
    # OFFICERS (top-left)
    t_officers = draw_crowsfoot_card(svg, 40, 90, 200, "officers",
        [("officer_id", "VARCHAR(36)")],
        [],
        [("badge_number", "VARCHAR(20)"), ("full_name", "VARCHAR(100)"), ("role", "VARCHAR(20)"), ("rank", "VARCHAR(50)"), ("contact_email", "VARCHAR(100)")]
    )

    # CASES (top-center)
    t_cases = draw_crowsfoot_card(svg, 330, 90, 210, "cases",
        [("case_id", "VARCHAR(36)")],
        [("lead_officer_id", "VARCHAR(36)", "officers")],
        [("title", "VARCHAR(200)"), ("case_type", "VARCHAR(50)"), ("status", "VARCHAR(20)"), ("priority", "VARCHAR(20)"), ("incident_date", "DATE")]
    )

    # CASE_ACTIVITY (top-right)
    t_case_act = draw_crowsfoot_card(svg, 630, 90, 210, "case_activity",
        [("activity_id", "VARCHAR(36)")],
        [("case_id", "VARCHAR(36)", "cases"), ("officer_id", "VARCHAR(36)", "officers")],
        [("activity_type", "VARCHAR(50)"), ("title", "VARCHAR(200)"), ("activity_timestamp", "TIMESTAMPTZ")],
        is_weak=True
    )

    # EVIDENCE (row 2 center)
    t_evidence = draw_crowsfoot_card(svg, 330, 310, 210, "evidence",
        [("evidence_id", "VARCHAR(36)")],
        [("case_id", "VARCHAR(36)", "cases"), ("collected_by_officer_id", "VARCHAR(36)", "officers")],
        [("title", "VARCHAR(200)"), ("evidence_type", "VARCHAR(50)"), ("status", "VARCHAR(20)"), ("chain_of_custody_hash", "VARCHAR(64)")]
    )

    # EVIDENCE_CUSTODY (row 2 right)
    t_evid_cust = draw_crowsfoot_card(svg, 630, 310, 220, "evidence_custody",
        [("custody_event_id", "VARCHAR(36)")],
        [("evidence_id", "VARCHAR(36)", "evidence"), ("officer_id", "VARCHAR(36)", "officers")],
        [("event_type", "VARCHAR(50)"), ("event_timestamp", "TIMESTAMPTZ"), ("verification_hash", "VARCHAR(64)")],
        is_weak=True
    )

    # Secondary entities (Row 3 & 4)
    # PEOPLE (left)
    t_people = draw_crowsfoot_card(svg, 40, 350, 200, "people",
        [("person_id", "VARCHAR(36)")],
        [],
        [("full_name", "VARCHAR(100)"), ("date_of_birth", "DATE"), ("national_id", "VARCHAR(50)"), ("category", "VARCHAR(50)")]
    )

    # ORGANIZATIONS (row 4 left)
    t_orgs = draw_crowsfoot_card(svg, 40, 560, 200, "organizations",
        [("organization_id", "VARCHAR(36)")],
        [],
        [("name", "VARCHAR(150)"), ("organization_type", "VARCHAR(50)"), ("registration_number", "VARCHAR(50)")]
    )

    # VEHICLES (row 3 right-mid)
    t_vehicles = draw_crowsfoot_card(svg, 930, 90, 200, "vehicles",
        [("vehicle_id", "VARCHAR(36)")],
        [],
        [("registration_number", "VARCHAR(20)"), ("make", "VARCHAR(50)"), ("model", "VARCHAR(50)"), ("vehicle_type", "VARCHAR(30)")]
    )

    # DEVICES (row 3 right-far)
    t_devices = draw_crowsfoot_card(svg, 1200, 90, 200, "devices",
        [("device_id", "VARCHAR(36)")],
        [],
        [("device_type", "VARCHAR(50)"), ("manufacturer", "VARCHAR(50)"), ("model", "VARCHAR(50)"), ("serial_number", "VARCHAR(100)")]
    )

    # LOCATIONS (row 4 right)
    t_locations = draw_crowsfoot_card(svg, 1200, 350, 200, "locations",
        [("location_id", "VARCHAR(36)")],
        [],
        [("name", "VARCHAR(100)"), ("address", "TEXT"), ("location_type", "VARCHAR(50)"), ("latitude", "NUMERIC(10,8)")]
    )

    # 12 JUNCTION TABLES (placed cleanly in grids below)
    # Group A: Case Bridges (y = 550 .. 700)
    t_cp = draw_crowsfoot_card(svg, 300, 550, 180, "case_people",
        [("case_id", "VARCHAR(36)"), ("person_id", "VARCHAR(36)")],
        [("case_id", "VARCHAR(36)", "cases"), ("person_id", "VARCHAR(36)", "people")],
        [("role_in_case", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    t_co = draw_crowsfoot_card(svg, 510, 550, 180, "case_organizations",
        [("case_id", "VARCHAR(36)"), ("organization_id", "VARCHAR(36)")],
        [("case_id", "VARCHAR(36)", "cases"), ("organization_id", "VARCHAR(36)", "orgs")],
        [("association_type", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    t_cv = draw_crowsfoot_card(svg, 720, 550, 180, "case_vehicles",
        [("case_id", "VARCHAR(36)"), ("vehicle_id", "VARCHAR(36)")],
        [("case_id", "VARCHAR(36)", "cases"), ("vehicle_id", "VARCHAR(36)", "vehicles")],
        [("role_in_case", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    t_cd = draw_crowsfoot_card(svg, 930, 550, 180, "case_devices",
        [("case_id", "VARCHAR(36)"), ("device_id", "VARCHAR(36)")],
        [("case_id", "VARCHAR(36)", "cases"), ("device_id", "VARCHAR(36)", "devices")],
        [("role_in_case", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    t_cl = draw_crowsfoot_card(svg, 1140, 550, 180, "case_locations",
        [("case_id", "VARCHAR(36)"), ("location_id", "VARCHAR(36)")],
        [("case_id", "VARCHAR(36)", "cases"), ("location_id", "VARCHAR(36)", "locations")],
        [("association_type", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    # Group B: Person Bridges & Evidence Bridges (y = 750 .. 950)
    t_po = draw_crowsfoot_card(svg, 40, 770, 190, "person_organizations",
        [("person_id", "VARCHAR(36)"), ("organization_id", "VARCHAR(36)")],
        [("person_id", "VARCHAR(36)", "people"), ("organization_id", "VARCHAR(36)", "orgs")],
        [("role", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    t_pv = draw_crowsfoot_card(svg, 260, 770, 180, "person_vehicles",
        [("person_id", "VARCHAR(36)"), ("vehicle_id", "VARCHAR(36)")],
        [("person_id", "VARCHAR(36)", "people"), ("vehicle_id", "VARCHAR(36)", "vehicles")],
        [("relationship_type", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    t_pd = draw_crowsfoot_card(svg, 470, 770, 180, "person_devices",
        [("person_id", "VARCHAR(36)"), ("device_id", "VARCHAR(36)")],
        [("person_id", "VARCHAR(36)", "people"), ("device_id", "VARCHAR(36)", "devices")],
        [("relationship_type", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    t_ep = draw_crowsfoot_card(svg, 680, 770, 180, "evidence_people",
        [("evidence_id", "VARCHAR(36)"), ("person_id", "VARCHAR(36)")],
        [("evidence_id", "VARCHAR(36)", "evidence"), ("person_id", "VARCHAR(36)", "people")],
        [("association_type", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    t_ev = draw_crowsfoot_card(svg, 890, 770, 180, "evidence_vehicles",
        [("evidence_id", "VARCHAR(36)"), ("vehicle_id", "VARCHAR(36)")],
        [("evidence_id", "VARCHAR(36)", "evidence"), ("vehicle_id", "VARCHAR(36)", "vehicles")],
        [("association_type", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    t_ed = draw_crowsfoot_card(svg, 1100, 770, 180, "evidence_devices",
        [("evidence_id", "VARCHAR(36)"), ("device_id", "VARCHAR(36)")],
        [("evidence_id", "VARCHAR(36)", "evidence"), ("device_id", "VARCHAR(36)", "devices")],
        [("association_type", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    t_el = draw_crowsfoot_card(svg, 680, 930, 180, "evidence_locations",
        [("evidence_id", "VARCHAR(36)"), ("location_id", "VARCHAR(36)")],
        [("evidence_id", "VARCHAR(36)", "evidence"), ("location_id", "VARCHAR(36)", "locations")],
        [("association_type", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    # Key Crow's Foot relationship edges
    # Officers -> Cases
    draw_crows_foot_edge(svg, t_officers["right"], t_cases["left"], "one", "many")
    # Cases -> Case Activity
    draw_crows_foot_edge(svg, t_cases["right"], t_case_act["left"], "one", "many")
    # Cases -> Evidence
    draw_crows_foot_edge(svg, t_cases["bottom"], t_evidence["top"], "one", "many")
    # Evidence -> Evidence Custody
    draw_crows_foot_edge(svg, t_evidence["right"], t_evid_cust["left"], "one", "many")

    # Footer note
    svg.rect(40, 1040, 1370, 36, fill="#f8fafc", stroke="#cbd5e1", rx=3, ry=3)
    svg.text(725, 1062, "Figure B.1: Complete Relational Schema (Crow's-Foot Notation). Indicating primary keys (PK), foreign keys (FK), and 1:N cardinality forks.", 11, fill="#334155")

    out_path = os.path.join(OUT_DIR, "crowsfoot_full_schema.svg")
    svg.save(out_path)


def build_crowsfoot_clusters():
    """
    Builds the 4 detailed Crow's Foot cluster diagrams:
    - crowsfoot_case_cluster.svg
    - crowsfoot_entities_assets.svg
    - crowsfoot_evidence_custody.svg
    - crowsfoot_officers_audit.svg
    """
    # 1. Case Cluster
    svg1 = SvgBuilder(1100, 750, "Crow's-Foot - Case Management Cluster")
    svg1.text(550, 30, "Crow's-Foot Detail: Case Management Cluster", 18, font_weight="700")
    svg1.text(550, 50, "Detailed relations: CASES, CASE_ACTIVITY, OFFICERS, and associated case bridges", 12, fill="#475569")

    tc = draw_crowsfoot_card(svg1, 380, 100, 280, "cases",
        [("case_id", "VARCHAR(36)")],
        [("lead_officer_id", "VARCHAR(36)", "officers")],
        [("title", "VARCHAR(200)"), ("description", "TEXT"), ("case_type", "VARCHAR(50)"),
         ("status", "VARCHAR(20)"), ("priority", "VARCHAR(20)"), ("incident_date", "DATE"),
         ("closed_at", "TIMESTAMPTZ"), ("created_at", "TIMESTAMPTZ"), ("updated_at", "TIMESTAMPTZ")]
    )

    tof = draw_crowsfoot_card(svg1, 50, 100, 240, "officers",
        [("officer_id", "VARCHAR(36)")],
        [],
        [("badge_number", "VARCHAR(20)"), ("full_name", "VARCHAR(100)"), ("department", "VARCHAR(100)"),
         ("contact_email", "VARCHAR(100)"), ("phone_number", "VARCHAR(30)"), ("role", "VARCHAR(20)"),
         ("rank", "VARCHAR(50)"), ("is_active", "BOOLEAN"), ("created_at", "TIMESTAMPTZ")]
    )

    tca = draw_crowsfoot_card(svg1, 750, 100, 280, "case_activity",
        [("activity_id", "VARCHAR(36)")],
        [("case_id", "VARCHAR(36)", "cases"), ("officer_id", "VARCHAR(36)", "officers")],
        [("activity_type", "VARCHAR(50)"), ("title", "VARCHAR(200)"), ("description", "TEXT"),
         ("activity_timestamp", "TIMESTAMPTZ"), ("metadata_json", "TEXT")],
        is_weak=True
    )

    # Bridges
    tcp = draw_crowsfoot_card(svg1, 100, 480, 240, "case_people",
        [("case_id", "VARCHAR(36)"), ("person_id", "VARCHAR(36)")],
        [("case_id", "VARCHAR(36)", "cases"), ("person_id", "VARCHAR(36)", "people")],
        [("role_in_case", "VARCHAR(50)"), ("notes", "TEXT"), ("added_at", "TIMESTAMPTZ")]
    )

    tco = draw_crowsfoot_card(svg1, 400, 480, 260, "case_organizations",
        [("case_id", "VARCHAR(36)"), ("organization_id", "VARCHAR(36)")],
        [("case_id", "VARCHAR(36)", "cases"), ("organization_id", "VARCHAR(36)", "orgs")],
        [("association_type", "VARCHAR(50)"), ("notes", "TEXT"), ("added_at", "TIMESTAMPTZ")]
    )

    tcv = draw_crowsfoot_card(svg1, 720, 480, 240, "case_vehicles",
        [("case_id", "VARCHAR(36)"), ("vehicle_id", "VARCHAR(36)")],
        [("case_id", "VARCHAR(36)", "cases"), ("vehicle_id", "VARCHAR(36)", "vehicles")],
        [("role_in_case", "VARCHAR(50)"), ("notes", "TEXT"), ("added_at", "TIMESTAMPTZ")]
    )

    draw_crows_foot_edge(svg1, tof["right"], tc["left"], "one", "many")
    draw_crows_foot_edge(svg1, tc["right"], tca["left"], "one", "many")
    draw_crows_foot_edge(svg1, tc["bottom"], tcp["top"], "one", "many")
    draw_crows_foot_edge(svg1, tc["bottom"], tco["top"], "one", "many")
    draw_crows_foot_edge(svg1, tc["bottom"], tcv["top"], "one", "many")

    svg1.rect(50, 690, 1000, 36, fill="#f8fafc", stroke="#cbd5e1", rx=3, ry=3)
    svg1.text(550, 712, "Figure B.2: Case Management Cluster (Crow's-Foot Notation) with full attribute specifications.", 11, fill="#334155")
    svg1.save(os.path.join(OUT_DIR, "crowsfoot_case_cluster.svg"))

    # 2. Entities & Assets Cluster
    svg2 = SvgBuilder(1150, 780, "Crow's-Foot - Entities & Physical Assets Cluster")
    svg2.text(575, 30, "Crow's-Foot Detail: People, Organizations & Physical Assets", 18, font_weight="700")
    svg2.text(575, 50, "Full relational schema for non-case entities and cross-entity association junction tables", 12, fill="#475569")

    tp = draw_crowsfoot_card(svg2, 450, 90, 240, "people",
        [("person_id", "VARCHAR(36)")],
        [],
        [("full_name", "VARCHAR(100)"), ("date_of_birth", "DATE"), ("national_id", "VARCHAR(50)"),
         ("category", "VARCHAR(50)"), ("contact_details", "VARCHAR(150)"), ("address", "TEXT"),
         ("notes", "TEXT"), ("status", "VARCHAR(20)"), ("created_at", "TIMESTAMPTZ")]
    )

    torg = draw_crowsfoot_card(svg2, 50, 90, 250, "organizations",
        [("organization_id", "VARCHAR(36)")],
        [],
        [("name", "VARCHAR(150)"), ("organization_type", "VARCHAR(50)"), ("registration_number", "VARCHAR(50)"),
         ("address", "TEXT"), ("contact_details", "VARCHAR(150)"), ("status", "VARCHAR(20)")]
    )

    tveh = draw_crowsfoot_card(svg2, 850, 90, 240, "vehicles",
        [("vehicle_id", "VARCHAR(36)")],
        [],
        [("registration_number", "VARCHAR(20)"), ("make", "VARCHAR(50)"), ("model", "VARCHAR(50)"),
         ("color", "VARCHAR(30)"), ("vehicle_type", "VARCHAR(30)"), ("vin", "VARCHAR(50)")]
    )

    tdev = draw_crowsfoot_card(svg2, 850, 440, 240, "devices",
        [("device_id", "VARCHAR(36)")],
        [],
        [("device_type", "VARCHAR(50)"), ("manufacturer", "VARCHAR(50)"), ("model", "VARCHAR(50)"),
         ("serial_number", "VARCHAR(100)"), ("imei", "VARCHAR(50)"), ("status", "VARCHAR(20)")]
    )

    tloc = draw_crowsfoot_card(svg2, 50, 440, 250, "locations",
        [("location_id", "VARCHAR(36)")],
        [],
        [("name", "VARCHAR(100)"), ("address", "TEXT"), ("location_type", "VARCHAR(50)"),
         ("latitude", "NUMERIC(10,8)"), ("longitude", "NUMERIC(11,8)"), ("status", "VARCHAR(20)")]
    )

    # Bridges
    t_po = draw_crowsfoot_card(svg2, 450, 390, 240, "person_organizations",
        [("person_id", "VARCHAR(36)"), ("organization_id", "VARCHAR(36)")],
        [("person_id", "VARCHAR(36)", "people"), ("organization_id", "VARCHAR(36)", "orgs")],
        [("role", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    t_pv = draw_crowsfoot_card(svg2, 450, 560, 240, "person_vehicles",
        [("person_id", "VARCHAR(36)"), ("vehicle_id", "VARCHAR(36)")],
        [("person_id", "VARCHAR(36)", "people"), ("vehicle_id", "VARCHAR(36)", "vehicles")],
        [("relationship_type", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    draw_crows_foot_edge(svg2, tp["left"], t_po["right"], "one", "many")
    draw_crows_foot_edge(svg2, torg["right"], t_po["left"], "one", "many")
    draw_crows_foot_edge(svg2, tp["bottom"], t_pv["top"], "one", "many")
    draw_crows_foot_edge(svg2, tveh["left"], t_pv["right"], "one", "many")

    svg2.rect(50, 720, 1050, 36, fill="#f8fafc", stroke="#cbd5e1", rx=3, ry=3)
    svg2.text(575, 742, "Figure B.3: People, Organizations & Physical Assets Cluster (Crow's-Foot Notation).", 11, fill="#334155")
    svg2.save(os.path.join(OUT_DIR, "crowsfoot_entities_assets.svg"))

    # 3. Evidence & Custody Cluster
    svg3 = SvgBuilder(1100, 750, "Crow's-Foot - Evidence & Custody Cluster")
    svg3.text(550, 30, "Crow's-Foot Detail: Evidence & Chain of Custody", 18, font_weight="700")
    svg3.text(550, 50, "Full relational schema for EVIDENCE, EVIDENCE_CUSTODY, and cross-entity evidence links", 12, fill="#475569")

    te = draw_crowsfoot_card(svg3, 380, 100, 280, "evidence",
        [("evidence_id", "VARCHAR(36)")],
        [("case_id", "VARCHAR(36)", "cases"), ("collected_by_officer_id", "VARCHAR(36)", "officers")],
        [("title", "VARCHAR(200)"), ("evidence_type", "VARCHAR(50)"), ("description", "TEXT"),
         ("storage_location", "VARCHAR(100)"), ("status", "VARCHAR(20)"), ("barcode", "VARCHAR(50)"),
         ("chain_of_custody_hash", "VARCHAR(64)"), ("created_at", "TIMESTAMPTZ")]
    )

    tec = draw_crowsfoot_card(svg3, 760, 100, 280, "evidence_custody",
        [("custody_event_id", "VARCHAR(36)")],
        [("evidence_id", "VARCHAR(36)", "evidence"), ("officer_id", "VARCHAR(36)", "officers")],
        [("event_type", "VARCHAR(50)"), ("event_timestamp", "TIMESTAMPTZ"), ("notes", "TEXT"),
         ("location", "VARCHAR(100)"), ("verification_hash", "VARCHAR(64)")],
        is_weak=True
    )

    # Bridges
    tep = draw_crowsfoot_card(svg3, 60, 460, 220, "evidence_people",
        [("evidence_id", "VARCHAR(36)"), ("person_id", "VARCHAR(36)")],
        [("evidence_id", "VARCHAR(36)", "evidence"), ("person_id", "VARCHAR(36)", "people")],
        [("association_type", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    tev = draw_crowsfoot_card(svg3, 310, 460, 220, "evidence_vehicles",
        [("evidence_id", "VARCHAR(36)"), ("vehicle_id", "VARCHAR(36)")],
        [("evidence_id", "VARCHAR(36)", "evidence"), ("vehicle_id", "VARCHAR(36)", "vehicles")],
        [("association_type", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    ted = draw_crowsfoot_card(svg3, 560, 460, 220, "evidence_devices",
        [("evidence_id", "VARCHAR(36)"), ("device_id", "VARCHAR(36)")],
        [("evidence_id", "VARCHAR(36)", "evidence"), ("device_id", "VARCHAR(36)", "devices")],
        [("association_type", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    tel = draw_crowsfoot_card(svg3, 810, 460, 220, "evidence_locations",
        [("evidence_id", "VARCHAR(36)"), ("location_id", "VARCHAR(36)")],
        [("evidence_id", "VARCHAR(36)", "evidence"), ("location_id", "VARCHAR(36)", "locations")],
        [("association_type", "VARCHAR(50)"), ("added_at", "TIMESTAMPTZ")]
    )

    draw_crows_foot_edge(svg3, te["right"], tec["left"], "one", "many")
    draw_crows_foot_edge(svg3, te["bottom"], tep["top"], "one", "many")
    draw_crows_foot_edge(svg3, te["bottom"], tev["top"], "one", "many")
    draw_crows_foot_edge(svg3, te["bottom"], ted["top"], "one", "many")
    draw_crows_foot_edge(svg3, te["bottom"], tel["top"], "one", "many")

    svg3.rect(50, 690, 1000, 36, fill="#f8fafc", stroke="#cbd5e1", rx=3, ry=3)
    svg3.text(550, 712, "Figure B.4: Evidence & Chain of Custody Cluster (Crow's-Foot Notation).", 11, fill="#334155")
    svg3.save(os.path.join(OUT_DIR, "crowsfoot_evidence_custody.svg"))

    # 4. Officers & Audit Cluster
    svg4 = SvgBuilder(1100, 750, "Crow's-Foot - Officers & Audit Cluster")
    svg4.text(550, 30, "Crow's-Foot Detail: Officers, RBAC & Audit System", 18, font_weight="700")
    svg4.text(550, 50, "Detailed accountability mappings across system users, security roles, and audit trails", 12, fill="#475569")

    to = draw_crowsfoot_card(svg4, 390, 100, 280, "officers",
        [("officer_id", "VARCHAR(36)")],
        [],
        [("badge_number", "VARCHAR(20)"), ("full_name", "VARCHAR(100)"), ("department", "VARCHAR(100)"),
         ("contact_email", "VARCHAR(100)"), ("phone_number", "VARCHAR(30)"), ("role", "VARCHAR(20)"),
         ("rank", "VARCHAR(50)"), ("is_active", "BOOLEAN"), ("created_at", "TIMESTAMPTZ")]
    )

    tc = draw_crowsfoot_card(svg4, 50, 400, 280, "cases",
        [("case_id", "VARCHAR(36)")],
        [("lead_officer_id", "VARCHAR(36)", "officers")],
        [("title", "VARCHAR(200)"), ("status", "VARCHAR(20)"), ("priority", "VARCHAR(20)")]
    )

    tca = draw_crowsfoot_card(svg4, 400, 400, 280, "case_activity",
        [("activity_id", "VARCHAR(36)")],
        [("case_id", "VARCHAR(36)", "cases"), ("officer_id", "VARCHAR(36)", "officers")],
        [("activity_type", "VARCHAR(50)"), ("title", "VARCHAR(200)"), ("activity_timestamp", "TIMESTAMPTZ")],
        is_weak=True
    )

    tec = draw_crowsfoot_card(svg4, 750, 400, 280, "evidence_custody",
        [("custody_event_id", "VARCHAR(36)")],
        [("evidence_id", "VARCHAR(36)", "evidence"), ("officer_id", "VARCHAR(36)", "officers")],
        [("event_type", "VARCHAR(50)"), ("event_timestamp", "TIMESTAMPTZ"), ("verification_hash", "VARCHAR(64)")],
        is_weak=True
    )

    draw_crows_foot_edge(svg4, to["bottom"], tc["top"], "one", "many")
    draw_crows_foot_edge(svg4, to["bottom"], tca["top"], "one", "many")
    draw_crows_foot_edge(svg4, to["bottom"], tec["top"], "one", "many")

    svg4.rect(50, 690, 1000, 36, fill="#f8fafc", stroke="#cbd5e1", rx=3, ry=3)
    svg4.text(550, 712, "Figure B.5: Officers & Audit Cluster (Crow's-Foot Notation) illustrating RBAC user linkages.", 11, fill="#334155")
    svg4.save(os.path.join(OUT_DIR, "crowsfoot_officers_audit.svg"))

# -------------------------------------------------------------
# 3. MONGODB DOCUMENT MODEL DIAGRAM
# -------------------------------------------------------------
def build_mongodb_diagram():
    """
    MongoDB document model diagram:
    - investigation_documents collection with fields
    - polymorphic variants (witness statement, CCTV, phone extraction, chat export, financial report)
    - dotted polyglot reference lines to SQL tables (cases, people, vehicles, devices, locations)
    - 64-dim semantic embedding vector field
    """
    svg = SvgBuilder(1200, 850, "MongoDB Document Model & Polyglot References")

    # Header
    svg.text(600, 32, "Intelligence Fusion Platform — MongoDB Document Architecture & Polyglot Links", 18, font_weight="700")
    svg.text(600, 52, "Collection: investigation_documents with Polymorphic Payloads and Cross-Database SQL References", 12, fill="#475569")

    # Central MongoDB Document Box
    cx, cy, cw, ch = 380, 100, 420, 560
    svg.rect(cx, cy, cw, ch, fill="#f8fafc", stroke="#0f172a", stroke_width=2, rx=4, ry=4)

    # Collection header
    svg.rect(cx, cy, cw, 34, fill="#15803d", stroke="#15803d", rx=4, ry=4)
    svg.text(cx + cw/2, cy + 22, "COLLECTION: investigation_documents (BSON)", 13, font_weight="700", fill="#ffffff")

    fields = [
        ("_id", "ObjectId", "Primary key (auto-generated BSON identifier)"),
        ("case_id", "String / null", "Foreign reference -> PostgreSQL cases.case_id", True),
        ("document_type", "String", "Discriminator: 'witness_statement', 'cctv_log', etc."),
        ("title", "String (3..250)", "Descriptive intelligence heading"),
        ("content", "String", "Full-text textual narrative, statement, or raw dump"),
        ("summary", "String / null", "Executive summary of intelligence item"),
        ("source_type", "String / null", "'Field Interview', 'OSINT', 'Technical Intercept'"),
        ("source_name", "String / null", "Reporting device, agent station, or intercept node"),
        ("related_entity_ids", "Array<Object>", "[ { entity_type: 'person', entity_id: '...' } ]", True),
        ("tags", "Array<String>", "Keywords for inverted index text search"),
        ("metadata", "Object (Polymorphic)", "Dynamic schema payload keyed by document_type"),
        ("document_status", "String / null", "'Verified', 'Pending', 'Classified'"),
        ("embedding", "Array<Double>[64]", "64-dimensional dense semantic vector for cosine similarity"),
        ("created_at", "Date / ISODate", "Original recording timestamp"),
        ("ingested_at", "Date / ISODate", "Platform database ingestion timestamp"),
    ]

    curr_y = cy + 48
    for f in fields:
        fname = f[0]
        ftype = f[1]
        fdesc = f[2]
        is_polyglot = len(f) > 3 and f[3]

        fill_color = "#1e293b" if not is_polyglot else "#2563eb"
        svg.text(cx + 16, curr_y + 12, fname, 10, font_weight="700" if is_polyglot else "600", fill=fill_color, anchor="start")
        svg.text(cx + 175, curr_y + 12, ftype, 9, font_weight="normal", fill="#64748b", anchor="start")
        svg.text(cx + cw - 16, curr_y + 12, fdesc[:40], 8.5, font_weight="normal", fill="#94a3b8", anchor="end")

        svg.line(cx + 10, curr_y + 18, cx + cw - 10, curr_y + 18, stroke="#e2e8f0", stroke_width=0.8)
        curr_y += 33

    # Left: SQL Target Entities (Polyglot targets)
    # Box for Relational Database
    rx, ry, rw, rh = 40, 140, 260, 480
    svg.rect(rx, ry, rw, rh, fill="#ffffff", stroke="#2563eb", stroke_width=1.5, rx=4, ry=4, dash="4,4")
    svg.text(rx + rw/2, ry + 26, "POSTGRESQL RELATIONAL TARGETS", 11, font_weight="700", fill="#1e40af")
    svg.text(rx + rw/2, ry + 42, "(Polyglot Reference Endpoints)", 9.5, fill="#64748b")

    sql_targets = [
        ("cases", "case_id", ry + 70),
        ("people", "person_id", ry + 150),
        ("vehicles", "vehicle_id", ry + 230),
        ("devices", "device_id", ry + 310),
        ("locations", "location_id", ry + 390),
    ]

    for tname, col, ty in sql_targets:
        svg.rect(rx + 20, ty, rw - 40, 50, fill="#f8fafc", stroke="#93c5fd", stroke_width=1.2, rx=3, ry=3)
        svg.text(rx + rw/2, ty + 20, tname.upper(), 11, font_weight="700", fill="#1e3a8a")
        svg.text(rx + rw/2, ty + 36, f"PK: {col}", 9, font_weight="600", fill="#475569")

    # Polyglot reference lines (Dotted blue arrows from MongoDB to PostgreSQL)
    # 1. case_id -> cases
    svg.polyline([(cx + 10, cy + 90), (rx + rw - 10, ry + 95)], stroke="#2563eb", stroke_width=1.8, dash="4,4", marker_end="arrow-blue")
    # 2. related_entity_ids -> people, vehicles, devices, locations
    svg.polyline([(cx + 10, cy + 320), (rx + rw - 10, ry + 175)], stroke="#2563eb", stroke_width=1.5, dash="4,4", marker_end="arrow-blue")
    svg.polyline([(cx + 10, cy + 320), (rx + rw - 10, ry + 255)], stroke="#2563eb", stroke_width=1.5, dash="4,4", marker_end="arrow-blue")
    svg.polyline([(cx + 10, cy + 320), (rx + rw - 10, ry + 335)], stroke="#2563eb", stroke_width=1.5, dash="4,4", marker_end="arrow-blue")
    svg.polyline([(cx + 10, cy + 320), (rx + rw - 10, ry + 415)], stroke="#2563eb", stroke_width=1.5, dash="4,4", marker_end="arrow-blue")

    # Right: Polymorphic Variants (Metadata Payloads)
    px, py, pw, ph = 880, 100, 280, 560
    svg.rect(px, py, pw, ph, fill="#ffffff", stroke="#d97706", stroke_width=1.5, rx=4, ry=4, dash="4,4")
    svg.text(px + pw/2, py + 26, "POLYMORPHIC METADATA VARIANTS", 11, font_weight="700", fill="#b45309")
    svg.text(px + pw/2, py + 42, "(Dynamic Schemas per document_type)", 9.5, fill="#64748b")

    variants = [
        ("Witness Statement", "{ interviewer_badge, recording_device, sworn_oath: true, signature_hash }", py + 65),
        ("CCTV Footage Telemetry", "{ camera_id, fps: 30, resolution: '4K', frame_timestamps: [...], codec }", py + 160),
        ("Phone Extraction Dump", "{ extraction_tool: 'Cellebrite', os_version, contacts_count, call_logs }", py + 255),
        ("Forensic Chat Intercept", "{ platform: 'Signal', thread_id, encryption_verified: true, participants }", py + 350),
        ("Financial OSINT Audit", "{ bank_entity, routing_code, total_transacted, anomaly_flag: true }", py + 445),
    ]

    for vtitle, vpayload, vy in variants:
        svg.rect(px + 15, vy, pw - 30, 75, fill="#fffbeb", stroke="#fde68a", stroke_width=1.2, rx=3, ry=3)
        svg.text(px + 25, vy + 18, vtitle, 10, font_weight="700", fill="#92400e", anchor="start")
        # Split payload in 2 lines
        svg.text(px + 25, vy + 38, vpayload[:38], 8.5, font_family="monospace", fill="#78350f", anchor="start")
        if len(vpayload) > 38:
            svg.text(px + 25, vy + 54, vpayload[38:76], 8.5, font_family="monospace", fill="#78350f", anchor="start")

    # Connect metadata to variants
    svg.polyline([(cx + cw - 10, cy + 390), (px + 15, py + 290)], stroke="#d97706", stroke_width=1.8, dash="4,4", marker_end="arrow-amber")

    # Bottom Indexing and Vector Box
    bx, by, bw, bh = 40, 690, 1120, 120
    svg.rect(bx, by, bw, bh, fill="#f8fafc", stroke="#cbd5e1", rx=4, ry=4)
    svg.text(bx + 20, by + 24, "MONGODB INDEXING ARCHITECTURE & VECTOR RETRIEVAL:", 11, font_weight="700", fill="#0f172a", anchor="start")
    svg.text(bx + 20, by + 46, "1. Compound Index: { case_id: 1, created_at: -1 } — Rapid filtering of case-specific dossier records.", 9.5, fill="#334155", anchor="start")
    svg.text(bx + 20, by + 66, "2. Multikey Index: { related_entity_ids.entity_id: 1 } — Instant entity lookup across person/vehicle/device IDs.", 9.5, fill="#334155", anchor="start")
    svg.text(bx + 20, by + 86, "3. Full-Text Search Index: { title: 'text', content: 'text', tags: 'text' } — Weighted keyword matching across intelligence dumps.", 9.5, fill="#334155", anchor="start")
    svg.text(bx + 20, by + 106, "4. Vector Search Engine: 64-dimensional dense semantic embeddings evaluated via cosine similarity dot product.", 9.5, fill="#2563eb", font_weight="600", anchor="start")

    out_path = os.path.join(OUT_DIR, "mongodb_document_model.svg")
    svg.save(out_path)

# -------------------------------------------------------------
# 4. SYSTEM ARCHITECTURE DIAGRAM
# -------------------------------------------------------------
def build_system_architecture():
    """
    System architecture flowchart:
    Browser (Next.js) -> FastAPI (auth, routers) -> PostgreSQL (with SQLite fallback) & MongoDB
    JWT flow and cross-database search fan-out / merge shown as arrows.
    """
    svg = SvgBuilder(1200, 800, "System Architecture & Data Flow")

    svg.text(600, 32, "Intelligence Fusion Platform — End-to-End System Architecture", 18, font_weight="700")
    svg.text(600, 52, "Three-Tier Client-Server Architecture with Polyglot Persistence and Cross-Database Query Federation", 12, fill="#475569")

    # Tier 1: Client Tier (Top)
    c_x, c_y, c_w, c_h = 250, 90, 700, 110
    svg.rect(c_x, c_y, c_w, c_h, fill="#f8fafc", stroke="#0f172a", stroke_width=1.8, rx=4, ry=4)
    svg.rect(c_x, c_y, c_w, 28, fill="#0f172a", stroke="#0f172a", rx=4, ry=4)
    svg.text(c_x + c_w/2, c_y + 18, "CLIENT TIER: Next.js 15 + React 19 Single Page Application", 12, font_weight="700", fill="#ffffff")

    # Modules in Client Tier
    cmods = [
        ("Auth & JWT Storage", "LocalStorage / Memory", 280),
        ("App Router Views", "Cases, People, Evidence, Search", 470),
        ("Tailwind v4 UI Theme", "Dark Graphite & Muted Steel", 720),
    ]
    for mname, msub, mx in cmods:
        svg.rect(mx, c_y + 42, 190, 50, fill="#ffffff", stroke="#cbd5e1", stroke_width=1.2, rx=3, ry=3)
        svg.text(mx + 95, c_y + 62, mname, 10, font_weight="600")
        svg.text(mx + 95, c_y + 78, msub, 8.5, fill="#64748b")

    # Tier 2: Application / API Tier (Middle)
    a_x, a_y, a_w, a_h = 100, 270, 1000, 200
    svg.rect(a_x, a_y, a_w, a_h, fill="#f8fafc", stroke="#0f172a", stroke_width=1.8, rx=4, ry=4)
    svg.rect(a_x, a_y, a_w, 28, fill="#1e293b", stroke="#1e293b", rx=4, ry=4)
    svg.text(a_x + a_w/2, a_y + 18, "APPLICATION / API TIER: FastAPI (Python 3.13 Async REST Service)", 12, font_weight="700", fill="#ffffff")

    amods = [
        ("JWT Auth & Dual RBAC", "Bcrypt validation, Bearer token decode, DB Role Switch", 130, 240),
        ("Relational Domain Routers", "Cases, People, Orgs, Evidence, Analytics (/api/*)", 410, 250),
        ("Cross-DB Search Federator", "SQL ILIKE + Mongo Text + 64-dim Vector Engine", 700, 250),
        ("SQLAlchemy 2.0 ORM Engine", "Session pooling, transaction management, savepoints", 130, 130),
        ("Motor / PyMongo Driver", "Async MongoDB connector & JSON schema validation", 560, 130),
    ]
    # Draw amods in grid
    svg.rect(130, a_y + 44, 250, 60, fill="#ffffff", stroke="#cbd5e1", rx=3, ry=3)
    svg.text(255, a_y + 68, "JWT Auth & RBAC Guard", 10.5, font_weight="700")
    svg.text(255, a_y + 86, "Role dependencies & DB kernel grants", 9, fill="#64748b")

    svg.rect(420, a_y + 44, 320, 60, fill="#ffffff", stroke="#cbd5e1", rx=3, ry=3)
    svg.text(580, a_y + 68, "Relational Business Logic Routers", 10.5, font_weight="700")
    svg.text(580, a_y + 86, "Cases, People, Evidence, Stored Procedures", 9, fill="#64748b")

    svg.rect(780, a_y + 44, 290, 60, fill="#ffffff", stroke="#2563eb", stroke_width=1.5, rx=3, ry=3)
    svg.text(925, a_y + 68, "Cross-Database Search Federator", 10.5, font_weight="700", fill="#1e40af")
    svg.text(925, a_y + 86, "SQL ILIKE + Mongo Text + Vector Similarity", 9, fill="#2563eb")

    svg.rect(200, a_y + 120, 360, 60, fill="#ffffff", stroke="#cbd5e1", rx=3, ry=3)
    svg.text(380, a_y + 144, "SQLAlchemy 2.0 Async Session Pool", 10.5, font_weight="700")
    svg.text(380, a_y + 162, "Connection pooling, ACID transactions, triggers", 9, fill="#64748b")

    svg.rect(640, a_y + 120, 360, 60, fill="#ffffff", stroke="#cbd5e1", rx=3, ry=3)
    svg.text(820, a_y + 144, "Motor / PyMongo Client Engine", 10.5, font_weight="700")
    svg.text(820, a_y + 162, "BSON serialization, aggregations, vector math", 9, fill="#64748b")

    # Tier 3: Polyglot Persistence Tier (Bottom)
    # Box Left: PostgreSQL + SQLite Fallback
    p_x, p_y, p_w, p_h = 100, 540, 460, 180
    svg.rect(p_x, p_y, p_w, p_h, fill="#f8fafc", stroke="#2563eb", stroke_width=1.8, rx=4, ry=4)
    svg.rect(p_x, p_y, p_w, 28, fill="#1d4ed8", stroke="#1d4ed8", rx=4, ry=4)
    svg.text(p_x + p_w/2, p_y + 18, "RELATIONAL STORE: PostgreSQL 16 (SQLite Fallback)", 11.5, font_weight="700", fill="#ffffff")

    svg.text(p_x + 20, p_y + 55, "• 22 Normalized Tables (10 Entities + 12 Junction Bridges)", 9.5, fill="#1e293b", anchor="start")
    svg.text(p_x + 20, p_y + 75, "• Stored Procedures: sp_create_investigation_case", 9.5, fill="#1e293b", anchor="start")
    svg.text(p_x + 20, p_y + 95, "• Audit Triggers: trg_case_activity_audit (Immutable Logs)", 9.5, fill="#1e293b", anchor="start")
    svg.text(p_x + 20, p_y + 115, "• Functions & Recursive CTEs: fn_get_case_summary", 9.5, fill="#1e293b", anchor="start")
    svg.text(p_x + 20, p_y + 135, "• Dual-Tier RBAC: Schema-level GRANT / REVOKE roles", 9.5, fill="#1e293b", anchor="start")
    svg.text(p_x + 20, p_y + 155, "• ACID Guarantees: Multi-statement transactions with savepoints", 9.5, fill="#1e293b", anchor="start")

    # Box Right: MongoDB 7.0 Document & Vector Store
    m_x, m_y, m_w, m_h = 640, 540, 460, 180
    svg.rect(m_x, m_y, m_w, m_h, fill="#f8fafc", stroke="#15803d", stroke_width=1.8, rx=4, ry=4)
    svg.rect(m_x, m_y, m_w, 28, fill="#15803d", stroke="#15803d", rx=4, ry=4)
    svg.text(m_x + m_w/2, m_y + 18, "DOCUMENT & VECTOR STORE: MongoDB 7.0", 11.5, font_weight="700", fill="#ffffff")

    svg.text(m_x + 20, m_y + 55, "• Collection: investigation_documents (Polymorphic)", 9.5, fill="#1e293b", anchor="start")
    svg.text(m_x + 20, m_y + 75, "• Schema Validator: BSON $jsonSchema strict enforcement", 9.5, fill="#1e293b", anchor="start")
    svg.text(m_x + 20, m_y + 95, "• Semantic Vectors: 64-dimensional float embeddings", 9.5, fill="#1e293b", anchor="start")
    svg.text(m_x + 20, m_y + 115, "• Inverted Full-Text Indexes on (title, content, tags)", 9.5, fill="#1e293b", anchor="start")
    svg.text(m_x + 20, m_y + 135, "• Polyglot Links: Dotted references to cases and entities", 9.5, fill="#1e293b", anchor="start")
    svg.text(m_x + 20, m_y + 155, "• Aggregation Pipelines: $match, $unwind, $group metrics", 9.5, fill="#1e293b", anchor="start")

    # Arrows between Tiers
    # Client <-> API
    svg.line(550, c_y + c_h, 550, a_y, stroke="#0f172a", stroke_width=2, marker_end="arrow")
    svg.line(650, a_y, 650, c_y + c_h, stroke="#0f172a", stroke_width=2, marker_end="arrow")
    svg.text(530, 235, "REST JSON Requests (Bearer JWT)", 9, font_weight="600", anchor="end")
    svg.text(670, 235, "JSON Responses / 403 Forbidden", 9, font_weight="600", anchor="start")

    # API <-> PostgreSQL
    svg.line(330, a_y + a_h, 330, p_y, stroke="#2563eb", stroke_width=2, marker_end="arrow-blue")
    svg.line(380, p_y, 380, a_y + a_h, stroke="#2563eb", stroke_width=2, marker_end="arrow-blue")
    svg.text(310, 505, "SQL / Transactions", 9, font_weight="600", fill="#1e40af", anchor="end")
    svg.text(400, 505, "Result Rows / Tuples", 9, font_weight="600", fill="#1e40af", anchor="start")

    # API <-> MongoDB
    svg.line(820, a_y + a_h, 820, m_y, stroke="#15803d", stroke_width=2, marker_end="arrow")
    svg.line(870, m_y, 870, a_y + a_h, stroke="#15803d", stroke_width=2, marker_end="arrow")
    svg.text(800, 505, "BSON Queries / Vectors", 9, font_weight="600", fill="#166534", anchor="end")
    svg.text(890, 505, "Documents / Scores", 9, font_weight="600", fill="#166534", anchor="start")

    # Footer
    svg.rect(100, 745, 1000, 36, fill="#f8fafc", stroke="#cbd5e1", rx=3, ry=3)
    svg.text(600, 767, "Figure D.1: Unified Platform Architecture. Illustrating JWT authorization flows and cross-database search fan-out/merge.", 11, fill="#334155")

    out_path = os.path.join(OUT_DIR, "system_architecture.svg")
    svg.save(out_path)

# -------------------------------------------------------------
# 5. PROCESS FLOWCHARTS
# -------------------------------------------------------------
def build_flowchart_login_rbac():
    """
    Flowchart: Login + RBAC verification
    User input credentials -> FastAPI -> verify bcrypt -> issue JWT -> route role check -> database SET ROLE -> execute query
    """
    svg = SvgBuilder(900, 750, "Flowchart - Login & Dual-Tier RBAC Verification")

    svg.text(450, 32, "Process Flowchart: Login & Dual-Tier RBAC Enforcement", 17, font_weight="700")
    svg.text(450, 52, "Demonstrating Application-Layer (JWT Role Claims) and Database-Layer (PostgreSQL Roles) Authorization", 11.5, fill="#475569")

    # Steps
    # 1. Start: User inputs credentials (badge/email + password)
    svg.ellipse(450, 95, 110, 22, fill="#f8fafc", stroke="#0f172a", stroke_width=1.8)
    svg.text(450, 99, "User Enters Credentials", 11, font_weight="600")

    svg.line(450, 117, 450, 145, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 2. Process: POST /api/auth/login
    svg.rect(340, 145, 220, 42, fill="#ffffff", stroke="#0f172a", stroke_width=1.5, rx=3, ry=3)
    svg.text(450, 171, "FastAPI /api/auth/login", 11, font_weight="600")

    svg.line(450, 187, 450, 215, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 3. Decision: Password match? (Bcrypt)
    svg.diamond(450, 250, 80, 35, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
    svg.text(450, 248, "Bcrypt Verify", 10.5, font_weight="600")
    svg.text(450, 262, "Matches Hash?", 9, fill="#64748b")

    # No -> 401
    svg.line(530, 250, 680, 250, stroke="#ef4444", stroke_width=1.5, marker_end="arrow")
    svg.text(590, 242, "No", 10, font_weight="700", fill="#ef4444")
    svg.rect(680, 230, 140, 40, fill="#fef2f2", stroke="#ef4444", stroke_width=1.5, rx=3, ry=3)
    svg.text(750, 254, "401 Unauthorized", 10.5, font_weight="700", fill="#b91c1c")

    # Yes -> Issue JWT
    svg.line(450, 285, 450, 320, stroke="#16a34a", stroke_width=1.5, marker_end="arrow")
    svg.text(465, 305, "Yes", 10, font_weight="700", fill="#16a34a")

    # 4. Process: Issue Signed JWT (role, badge_number, exp)
    svg.rect(320, 320, 260, 44, fill="#ffffff", stroke="#0f172a", stroke_width=1.5, rx=3, ry=3)
    svg.text(450, 342, "Issue Signed HS256 JWT", 11, font_weight="600")
    svg.text(450, 356, "Payload: { role: 'Investigator', ... }", 9, fill="#475569")

    svg.line(450, 364, 450, 395, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 5. Process: Client calls Protected Endpoint with Bearer Token
    svg.rect(310, 395, 280, 42, fill="#ffffff", stroke="#0f172a", stroke_width=1.5, rx=3, ry=3)
    svg.text(450, 420, "Call Protected Endpoint with Bearer JWT", 11, font_weight="600")

    svg.line(450, 437, 450, 470, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 6. Decision: App Role Check (require_role)
    svg.diamond(450, 510, 95, 40, fill="#ffffff", stroke="#2563eb", stroke_width=1.8)
    svg.text(450, 506, "App Role Guard", 10.5, font_weight="700", fill="#1e40af")
    svg.text(450, 522, "Role Authorized?", 9, fill="#64748b")

    # No -> 403 Forbidden
    svg.line(545, 510, 680, 510, stroke="#ef4444", stroke_width=1.5, marker_end="arrow")
    svg.text(600, 502, "No", 10, font_weight="700", fill="#ef4444")
    svg.rect(680, 490, 140, 40, fill="#fef2f2", stroke="#ef4444", stroke_width=1.5, rx=3, ry=3)
    svg.text(750, 514, "403 Forbidden", 10.5, font_weight="700", fill="#b91c1c")

    # Yes -> DB Level Role Enforcement
    svg.line(450, 550, 450, 585, stroke="#16a34a", stroke_width=1.5, marker_end="arrow")
    svg.text(465, 570, "Yes", 10, font_weight="700", fill="#16a34a")

    # 7. Process: PostgreSQL SET ROLE or Schema Privileges
    svg.rect(300, 585, 300, 44, fill="#ffffff", stroke="#15803d", stroke_width=1.5, rx=3, ry=3)
    svg.text(450, 606, "DB-Level Role Execution (SET ROLE)", 11, font_weight="700", fill="#166534")
    svg.text(450, 620, "PostgreSQL Kernel evaluates TABLE GRANT / REVOKE", 8.5, fill="#475569")

    svg.line(450, 629, 450, 660, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 8. End: 200 OK Execution Success
    svg.ellipse(450, 685, 120, 24, fill="#f0fdf4", stroke="#16a34a", stroke_width=1.8)
    svg.text(450, 690, "200 OK: Data Returned", 11, font_weight="700", fill="#15803d")

    out_path = os.path.join(OUT_DIR, "flowchart_login_rbac.svg")
    svg.save(out_path)


def build_flowchart_case_sp_trigger():
    """
    Flowchart: Case creation via stored procedure + trigger writing case_activity
    """
    svg = SvgBuilder(900, 750, "Flowchart - Stored Procedure & Audit Trigger")

    svg.text(450, 32, "Process Flowchart: Case Creation & Automated Audit Trigger", 17, font_weight="700")
    svg.text(450, 52, "Execution of sp_create_investigation_case() and firing of trg_case_activity_audit", 11.5, fill="#475569")

    # 1. Start: Client sends POST /api/cases
    svg.ellipse(450, 95, 120, 22, fill="#f8fafc", stroke="#0f172a", stroke_width=1.8)
    svg.text(450, 99, "POST /api/cases Request", 11, font_weight="600")

    svg.line(450, 117, 450, 150, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 2. Process: FastAPI validates Pydantic model
    svg.rect(320, 150, 260, 42, fill="#ffffff", stroke="#0f172a", stroke_width=1.5, rx=3, ry=3)
    svg.text(450, 175, "Pydantic Schema Validation", 11, font_weight="600")

    svg.line(450, 192, 450, 225, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 3. Process: Invoke Stored Procedure
    svg.rect(280, 225, 340, 54, fill="#ffffff", stroke="#2563eb", stroke_width=1.8, rx=3, ry=3)
    svg.text(450, 248, "CALL sp_create_investigation_case(...)", 11, font_weight="700", fill="#1e40af")
    svg.text(450, 265, "Parameters: case_id, title, type, priority, lead_officer_id", 8.5, fill="#475569")

    svg.line(450, 279, 450, 315, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 4. Process: PostgreSQL executes INSERT into cases
    svg.rect(310, 315, 280, 44, fill="#ffffff", stroke="#0f172a", stroke_width=1.5, rx=3, ry=3)
    svg.text(450, 337, "INSERT INTO cases VALUES (...)", 11, font_weight="600")
    svg.text(450, 351, "Relational row stored with initial status", 8.5, fill="#64748b")

    svg.line(450, 359, 450, 395, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 5. Kernel Trigger fires: trg_case_activity_audit
    svg.rect(290, 395, 320, 56, fill="#fef3c7", stroke="#d97706", stroke_width=1.8, rx=3, ry=3)
    svg.text(450, 418, "TRIGGER FIRES: trg_case_activity_audit", 11, font_weight="700", fill="#92400e")
    svg.text(450, 436, "AFTER INSERT FOR EACH ROW on table cases", 9, fill="#78350f")

    svg.line(450, 451, 450, 485, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 6. Process: Trigger writes to case_activity
    svg.rect(270, 485, 360, 56, fill="#ffffff", stroke="#15803d", stroke_width=1.8, rx=3, ry=3)
    svg.text(450, 508, "INSERT INTO case_activity (activity_id, ...)", 11, font_weight="700", fill="#166534")
    svg.text(450, 526, "Writes immutable audit record: 'CASE_CREATED' + timestamp", 8.5, fill="#475569")

    svg.line(450, 541, 450, 575, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 7. Decision: Constraint or foreign key violation?
    svg.diamond(450, 610, 85, 35, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
    svg.text(450, 608, "Tx Success?", 10.5, font_weight="600")
    svg.text(450, 622, "No Violations?", 9, fill="#64748b")

    # Error -> ROLLBACK
    svg.line(535, 610, 680, 610, stroke="#ef4444", stroke_width=1.5, marker_end="arrow")
    svg.text(595, 602, "Error", 10, font_weight="700", fill="#ef4444")
    svg.rect(680, 590, 140, 40, fill="#fef2f2", stroke="#ef4444", stroke_width=1.5, rx=3, ry=3)
    svg.text(750, 614, "ROLLBACK Tx", 10.5, font_weight="700", fill="#b91c1c")

    # Success -> COMMIT
    svg.line(450, 645, 450, 675, stroke="#16a34a", stroke_width=1.5, marker_end="arrow")
    svg.text(465, 660, "OK", 10, font_weight="700", fill="#16a34a")

    # 8. End: 201 Created
    svg.ellipse(450, 700, 120, 24, fill="#f0fdf4", stroke="#16a34a", stroke_width=1.8)
    svg.text(450, 705, "201 Created: Case & Audit", 11, font_weight="700", fill="#15803d")

    out_path = os.path.join(OUT_DIR, "flowchart_case_creation_sp_trigger.svg")
    svg.save(out_path)


def build_flowchart_evidence_custody():
    """
    Flowchart: Evidence custody transfer transaction with savepoint / commit / rollback
    """
    svg = SvgBuilder(900, 750, "Flowchart - Evidence Custody Transfer Transaction")

    svg.text(450, 32, "Process Flowchart: Evidence Chain of Custody Transfer Transaction", 17, font_weight="700")
    svg.text(450, 52, "Demonstrating Atomic Multi-Statement Transaction with SAVEPOINT and Verification Hash Logging", 11.5, fill="#475569")

    # 1. Start: Custody transfer initiated
    svg.ellipse(450, 95, 130, 22, fill="#f8fafc", stroke="#0f172a", stroke_width=1.8)
    svg.text(450, 99, "Custody Transfer Request", 11, font_weight="600")

    svg.line(450, 117, 450, 150, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 2. Process: BEGIN TRANSACTION
    svg.rect(330, 150, 240, 40, fill="#ffffff", stroke="#0f172a", stroke_width=1.5, rx=3, ry=3)
    svg.text(450, 174, "BEGIN TRANSACTION", 11, font_weight="700")

    svg.line(450, 190, 450, 220, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 3. Process: SAVEPOINT custody_step
    svg.rect(320, 220, 260, 40, fill="#ffffff", stroke="#0f172a", stroke_width=1.5, rx=3, ry=3)
    svg.text(450, 244, "SAVEPOINT before_custody_update", 10.5, font_weight="600")

    svg.line(450, 260, 450, 290, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 4. Process: Verify Evidence Item Status & Compute SHA-256
    svg.rect(280, 290, 340, 54, fill="#ffffff", stroke="#2563eb", stroke_width=1.5, rx=3, ry=3)
    svg.text(450, 312, "Verify Evidence Exists & Status != 'Disposed'", 10.5, font_weight="600")
    svg.text(450, 330, "Compute verification_hash: SHA-256(item + timestamp)", 8.5, fill="#1e40af")

    svg.line(450, 344, 450, 375, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 5. Process: INSERT into evidence_custody
    svg.rect(290, 375, 320, 50, fill="#ffffff", stroke="#0f172a", stroke_width=1.5, rx=3, ry=3)
    svg.text(450, 398, "INSERT INTO evidence_custody (...)", 11, font_weight="600")
    svg.text(450, 414, "Logs from_officer, to_officer, action, hash", 8.5, fill="#64748b")

    svg.line(450, 425, 450, 455, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 6. Process: UPDATE evidence table location & status
    svg.rect(300, 455, 300, 50, fill="#ffffff", stroke="#0f172a", stroke_width=1.5, rx=3, ry=3)
    svg.text(450, 478, "UPDATE evidence SET storage_location = ...", 10.5, font_weight="600")
    svg.text(450, 494, "Syncs current custodian location with audit log", 8.5, fill="#64748b")

    svg.line(450, 505, 450, 535, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 7. Decision: Integrity check pass?
    svg.diamond(450, 570, 85, 35, fill="#ffffff", stroke="#0f172a", stroke_width=1.5)
    svg.text(450, 568, "Integrity OK?", 10.5, font_weight="600")
    svg.text(450, 582, "FKs valid?", 9, fill="#64748b")

    # Fail -> ROLLBACK TO SAVEPOINT
    svg.line(535, 570, 680, 570, stroke="#ef4444", stroke_width=1.5, marker_end="arrow")
    svg.text(595, 562, "Failed", 10, font_weight="700", fill="#ef4444")
    svg.rect(680, 550, 180, 40, fill="#fef2f2", stroke="#ef4444", stroke_width=1.5, rx=3, ry=3)
    svg.text(770, 574, "ROLLBACK TO SAVEPOINT", 10, font_weight="700", fill="#b91c1c")

    # Success -> RELEASE SAVEPOINT & COMMIT
    svg.line(450, 605, 450, 635, stroke="#16a34a", stroke_width=1.5, marker_end="arrow")
    svg.text(465, 620, "Pass", 10, font_weight="700", fill="#16a34a")

    svg.rect(320, 635, 260, 40, fill="#ffffff", stroke="#15803d", stroke_width=1.5, rx=3, ry=3)
    svg.text(450, 658, "COMMIT TRANSACTION", 11, font_weight="700", fill="#166534")

    svg.line(450, 675, 450, 700, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 8. End: Custody transfer recorded
    svg.ellipse(450, 715, 130, 20, fill="#f0fdf4", stroke="#16a34a", stroke_width=1.8)
    svg.text(450, 720, "Custody Transferred & Verified", 10.5, font_weight="700", fill="#15803d")

    out_path = os.path.join(OUT_DIR, "flowchart_evidence_custody.svg")
    svg.save(out_path)


def build_flowchart_unified_search():
    """
    Flowchart: Unified search merge
    SQL query + MongoDB text query + Semantic vector similarity fan-out -> Merge & rank
    """
    svg = SvgBuilder(950, 720, "Flowchart - Unified Cross-Database Search")

    svg.text(475, 32, "Process Flowchart: Unified Cross-Database Search Fan-Out & Merge", 17, font_weight="700")
    svg.text(475, 52, "Parallel Dispatch across PostgreSQL ILIKE, MongoDB Text Index, and 64-Dim Semantic Vector Engine", 11.5, fill="#475569")

    # 1. Start: User Enters Search Query
    svg.ellipse(475, 90, 130, 22, fill="#f8fafc", stroke="#0f172a", stroke_width=1.8)
    svg.text(475, 94, "User Enters Query String", 11, font_weight="600")

    svg.line(475, 112, 475, 145, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 2. Process: FastAPI /api/search Router Dispatches in Parallel
    svg.rect(330, 145, 290, 44, fill="#ffffff", stroke="#0f172a", stroke_width=1.5, rx=3, ry=3)
    svg.text(475, 168, "FastAPI /api/search Handler", 11, font_weight="700")
    svg.text(475, 182, "Asynchronous Parallel Fan-Out (asyncio.gather)", 9, fill="#475569")

    # Fan-Out lines
    svg.line(400, 189, 180, 240, stroke="#2563eb", stroke_width=1.5, marker_end="arrow-blue")
    svg.line(475, 189, 475, 240, stroke="#15803d", stroke_width=1.5, marker_end="arrow")
    svg.line(550, 189, 770, 240, stroke="#d97706", stroke_width=1.5, marker_end="arrow-amber")

    # Branch 1: PostgreSQL Relational Search
    svg.rect(70, 240, 220, 130, fill="#eff6ff", stroke="#2563eb", stroke_width=1.5, rx=3, ry=3)
    svg.text(180, 265, "BRANCH 1: PostgreSQL", 11, font_weight="700", fill="#1e40af")
    svg.text(180, 290, "ILIKE Pattern Matching", 9.5, font_weight="600")
    svg.text(180, 310, "Target Tables:", 9, fill="#475569")
    svg.text(180, 328, "cases, people, vehicles,", 8.5, font_family="monospace", fill="#334155")
    svg.text(180, 344, "devices, locations", 8.5, font_family="monospace", fill="#334155")

    # Branch 2: MongoDB Full-Text Search
    svg.rect(365, 240, 220, 130, fill="#f0fdf4", stroke="#15803d", stroke_width=1.5, rx=3, ry=3)
    svg.text(475, 265, "BRANCH 2: MongoDB Text", 11, font_weight="700", fill="#166534")
    svg.text(475, 290, "$text Inverted Index", 9.5, font_weight="600")
    svg.text(475, 310, "Target Collection:", 9, fill="#475569")
    svg.text(475, 328, "investigation_documents", 8.5, font_family="monospace", fill="#334155")
    svg.text(475, 344, "{ $search: query }", 8.5, font_family="monospace", fill="#334155")

    # Branch 3: Semantic Vector Search
    svg.rect(660, 240, 220, 130, fill="#fffbeb", stroke="#d97706", stroke_width=1.5, rx=3, ry=3)
    svg.text(770, 265, "BRANCH 3: Vector Similarity", 11, font_weight="700", fill="#92400e")
    svg.text(770, 290, "64-Dim Dense Embeddings", 9.5, font_weight="600")
    svg.text(770, 310, "Cosine Dot Product:", 9, fill="#475569")
    svg.text(770, 328, "doc.embedding · q_vec", 8.5, font_family="monospace", fill="#334155")
    svg.text(770, 344, "similarity >= min_score", 8.5, font_family="monospace", fill="#334155")

    # Fan-In lines
    svg.line(180, 370, 400, 430, stroke="#2563eb", stroke_width=1.5, marker_end="arrow-blue")
    svg.line(475, 370, 475, 430, stroke="#15803d", stroke_width=1.5, marker_end="arrow")
    svg.line(770, 370, 550, 430, stroke="#d97706", stroke_width=1.5, marker_end="arrow-amber")

    # 3. Process: Result Normalizer & Rank Merger
    svg.rect(290, 430, 370, 60, fill="#ffffff", stroke="#0f172a", stroke_width=1.8, rx=4, ry=4)
    svg.text(475, 455, "Score Normalization & Deduplication Merger", 11.5, font_weight="700")
    svg.text(475, 473, "Maps relational records + dossier docs + vector similarity ranks", 9, fill="#475569")

    svg.line(475, 490, 475, 525, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 4. Process: Category Tagging & Pagination
    svg.rect(320, 525, 310, 46, fill="#ffffff", stroke="#0f172a", stroke_width=1.5, rx=3, ry=3)
    svg.text(475, 548, "Category Partitioning & Slice", 11, font_weight="600")
    svg.text(475, 562, "{ cases: [...], documents: [...], people: [...] }", 8.5, font_family="monospace", fill="#64748b")

    svg.line(475, 571, 475, 605, stroke="#0f172a", stroke_width=1.5, marker_end="arrow")

    # 5. End: Return Merged JSON Payload to Next.js UI
    svg.ellipse(475, 630, 140, 24, fill="#f0fdf4", stroke="#16a34a", stroke_width=1.8)
    svg.text(475, 635, "Deliver Unified JSON Payload", 11, font_weight="700", fill="#15803d")

    out_path = os.path.join(OUT_DIR, "flowchart_unified_search.svg")
    svg.save(out_path)


# -------------------------------------------------------------
# MAIN GENERATION ENTRYPOINT
# -------------------------------------------------------------
def main():
    print("Generating Academic SVG Diagram Suite...")
    # 1. Chen Diagrams
    build_chen_overview()
    build_chen_case_cluster()
    build_chen_entities_assets()
    build_chen_evidence_custody()
    build_chen_officers_audit()

    # 2. Crow's Foot Diagrams
    build_crowsfoot_full_schema()
    build_crowsfoot_clusters()

    # 3. MongoDB Polyglot Model
    build_mongodb_diagram()

    # 4. System Architecture
    build_system_architecture()

    # 5. Process Flowcharts
    build_flowchart_login_rbac()
    build_flowchart_case_sp_trigger()
    build_flowchart_evidence_custody()
    build_flowchart_unified_search()

    print(f"\nAll SVGs successfully written to {OUT_DIR}")

if __name__ == "__main__":
    main()
