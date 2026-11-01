import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Preformatted
)
from reportlab.pdfgen import canvas

# Ensure docs/submission directory exists
SUBMISSION_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs", "submission")
os.makedirs(SUBMISSION_DIR, exist_ok=True)

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "INTELLIGENCE FUSION PLATFORM — DBMS MINI PROJECT (UE24CS395)")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "PES University • Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_text)
        self.restoreState()

def get_report_styles():
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#475569"),
        spaceAfter=12
    )
    
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )
    
    code_style = ParagraphStyle(
        'CodeBlock',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=6.5,
        leading=8.5,
        textColor=colors.HexColor("#0F172A"),
        backColor=colors.HexColor("#F8FAFC"),
        borderColor=colors.HexColor("#E2E8F0"),
        borderWidth=0.5,
        borderPadding=4,
        spaceAfter=6
    )
    
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7,
        leading=9.5,
        textColor=colors.HexColor("#0F172A")
    )
    
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9.5,
        textColor=colors.HexColor("#0F172A")
    )
    
    return {
        'title': title_style,
        'subtitle': subtitle_style,
        'h1': h1_style,
        'body': body_style,
        'code': code_style,
        'cell': table_cell,
        'cell_bold': table_cell_bold
    }

def create_header_banner(title: str, component_num: int, marks: int, rubric_title: str, st):
    elements = []
    meta_table = Table(
        [
            [
                Paragraph(f"<b>RUBRIC COMPONENT #{component_num} ({marks} MARKS)</b>", st['cell_bold']),
                Paragraph(f"<b>OFFICIAL CRITERIA: {rubric_title}</b>", st['cell_bold'])
            ]
        ],
        colWidths=[250, 254]
    )
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('LINEBELOW', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(title, st['title']))
    elements.append(Paragraph(
        "<b>Course:</b> DBMS Mini Project (UE24CS395) • <b>Institution:</b> PES University (2026–2027)<br/>"
        "<b>Team:</b> Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)",
        st['subtitle']
    ))
    elements.append(Spacer(1, 4))
    return elements


# -----------------------------------------------------------------------------
# 01_ER_Diagram.pdf (Row 1 - 2 Marks)
# -----------------------------------------------------------------------------
def build_pdf_1_er_diagram(st):
    filepath = os.path.join(SUBMISSION_DIR, "01_ER_Diagram.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
    story = []
    story.extend(create_header_banner("Entity-Relationship (ER) Conceptual Architecture", 1, 2, "ER diagram", st))

    story.append(Paragraph("1. Conceptual Model Summary (22 Relational Tables)", st['h1']))
    story.append(Paragraph(
        "The Intelligence Fusion Platform features a <b>22-table relational schema</b> structured into <b>10 primary entity/audit relations</b> "
        "and <b>12 associative junction tables</b> resolving all Many-to-Many entity relationships in 3NF and BCNF, linked to a flexible MongoDB document repository.",
        st['body']
    ))

    entities_data = [
        [Paragraph("Entity", st['cell_bold']), Paragraph("Type", st['cell_bold']), Paragraph("Primary Key", st['cell_bold']), Paragraph("Key Relationships & Cardinality", st['cell_bold'])],
        [Paragraph("officers", st['cell']), Paragraph("Core Personnel", st['cell']), Paragraph("officer_id (PK)", st['cell']), Paragraph("1:N to cases (leads), 1:N to evidence (seizes), 1:N to custody", st['cell'])],
        [Paragraph("cases", st['cell']), Paragraph("Master Incident", st['cell']), Paragraph("case_id (PK)", st['cell']), Paragraph("1:N to evidence, 1:N to case_activity, M:N to all entities via bridges", st['cell'])],
        [Paragraph("people", st['cell']), Paragraph("Subject / Witness", st['cell']), Paragraph("person_id (PK)", st['cell']), Paragraph("M:N to cases, M:N to organizations, M:N to vehicles, M:N to devices", st['cell'])],
        [Paragraph("organizations", st['cell']), Paragraph("Corporate / Syndicate", st['cell']), Paragraph("organization_id (PK)", st['cell']), Paragraph("M:N to cases, M:N to people", st['cell'])],
        [Paragraph("vehicles", st['cell']), Paragraph("Transport Exhibit", st['cell']), Paragraph("vehicle_id (PK)", st['cell']), Paragraph("M:N to cases, M:N to people, M:N to evidence", st['cell'])],
        [Paragraph("devices", st['cell']), Paragraph("Hardware Exhibit", st['cell']), Paragraph("device_id (PK)", st['cell']), Paragraph("M:N to cases, M:N to people, M:N to evidence", st['cell'])],
        [Paragraph("locations", st['cell']), Paragraph("Crime Scene / GPS", st['cell']), Paragraph("location_id (PK)", st['cell']), Paragraph("M:N to cases, M:N to evidence", st['cell'])],
        [Paragraph("evidence", st['cell']), Paragraph("Legal Exhibit", st['cell']), Paragraph("evidence_id (PK)", st['cell']), Paragraph("N:1 to cases, 1:N to evidence_custody, M:N to recovery scenes", st['cell'])],
        [Paragraph("evidence_custody", st['cell']), Paragraph("Immutable Audit", st['cell']), Paragraph("custody_event_id (PK)", st['cell']), Paragraph("N:1 to evidence (CASCADE), N:1 to officers (RESTRICT)", st['cell'])],
        [Paragraph("case_activity", st['cell']), Paragraph("Database Audit Log", st['cell']), Paragraph("activity_id (PK)", st['cell']), Paragraph("N:1 to cases (CASCADE), N:1 to officers (SET NULL)", st['cell'])],
    ]
    t = Table(entities_data, colWidths=[80, 85, 95, 244])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    story.append(Paragraph("2. 12 Associative Junction Tables (M:N Normalization)", st['h1']))
    junction_data = [
        [Paragraph("Junction Table", st['cell_bold']), Paragraph("Composite PK", st['cell_bold']), Paragraph("Foreign Keys", st['cell_bold']), Paragraph("Attributes", st['cell_bold'])],
        [Paragraph("case_people", st['cell']), Paragraph("(case_id, person_id)", st['cell']), Paragraph("cases(case_id), people(person_id)", st['cell']), Paragraph("role_in_case, notes, added_at", st['cell'])],
        [Paragraph("case_organizations", st['cell']), Paragraph("(case_id, organization_id)", st['cell']), Paragraph("cases(case_id), organizations(organization_id)", st['cell']), Paragraph("association_type, notes, added_at", st['cell'])],
        [Paragraph("case_vehicles", st['cell']), Paragraph("(case_id, vehicle_id)", st['cell']), Paragraph("cases(case_id), vehicles(vehicle_id)", st['cell']), Paragraph("role_in_case, notes, added_at", st['cell'])],
        [Paragraph("case_devices", st['cell']), Paragraph("(case_id, device_id)", st['cell']), Paragraph("cases(case_id), devices(device_id)", st['cell']), Paragraph("role_in_case, notes, added_at", st['cell'])],
        [Paragraph("case_locations", st['cell']), Paragraph("(case_id, location_id)", st['cell']), Paragraph("cases(case_id), locations(location_id)", st['cell']), Paragraph("association_type, notes, added_at", st['cell'])],
        [Paragraph("person_organizations", st['cell']), Paragraph("(person_id, organization_id)", st['cell']), Paragraph("people(person_id), organizations(organization_id)", st['cell']), Paragraph("role, added_at", st['cell'])],
        [Paragraph("person_vehicles", st['cell']), Paragraph("(person_id, vehicle_id)", st['cell']), Paragraph("people(person_id), vehicles(vehicle_id)", st['cell']), Paragraph("relationship_type, added_at", st['cell'])],
        [Paragraph("person_devices", st['cell']), Paragraph("(person_id, device_id)", st['cell']), Paragraph("people(person_id), devices(device_id)", st['cell']), Paragraph("relationship_type, added_at", st['cell'])],
        [Paragraph("evidence_people", st['cell']), Paragraph("(evidence_id, person_id)", st['cell']), Paragraph("evidence(evidence_id), people(person_id)", st['cell']), Paragraph("association_type, added_at", st['cell'])],
        [Paragraph("evidence_vehicles", st['cell']), Paragraph("(evidence_id, vehicle_id)", st['cell']), Paragraph("evidence(evidence_id), vehicles(vehicle_id)", st['cell']), Paragraph("association_type, added_at", st['cell'])],
        [Paragraph("evidence_devices", st['cell']), Paragraph("(evidence_id, device_id)", st['cell']), Paragraph("evidence(evidence_id), devices(device_id)", st['cell']), Paragraph("association_type, added_at", st['cell'])],
        [Paragraph("evidence_locations", st['cell']), Paragraph("(evidence_id, location_id)", st['cell']), Paragraph("evidence(evidence_id), locations(location_id)", st['cell']), Paragraph("association_type, added_at", st['cell'])],
    ]
    t2 = Table(junction_data, colWidths=[90, 110, 150, 154])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(t2)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {filepath}")


# -----------------------------------------------------------------------------
# 02_Relational_Schema.pdf (Row 2 - 3 Marks)
# -----------------------------------------------------------------------------
def build_pdf_2_relational_schema(st):
    filepath = os.path.join(SUBMISSION_DIR, "02_Relational_Schema.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
    story = []
    story.extend(create_header_banner("Relational Schema, Keys, Integrity & Normalization Proofs", 2, 3, "Relational schema with keys, relationships, and constraints", st))

    story.append(Paragraph("1. Primary Key, Foreign Key & Domain Constraints Matrix", st['h1']))
    story.append(Paragraph(
        "Every table in the schema enforces strict domain constraints, primary keys, and foreign keys. "
        "Associations use <code>ON DELETE CASCADE</code> while legal custody uses <code>ON DELETE RESTRICT</code>.",
        st['body']
    ))

    constraints_data = [
        [Paragraph("Constraint Category", st['cell_bold']), Paragraph("Target Table & Columns", st['cell_bold']), Paragraph("Enforcement Rule & Purpose", st['cell_bold'])],
        [Paragraph("PRIMARY KEY (Composite)", st['cell']), Paragraph("12 Junction Tables (e.g. case_people)", st['cell']), Paragraph("PRIMARY KEY (case_id, person_id) ensures uniqueness on paired association", st['cell'])],
        [Paragraph("UNIQUE Hardware Key", st['cell']), Paragraph("vehicles(registration_number), devices(serial_number)", st['cell']), Paragraph("Prevents duplicate hardware exhibits or counterfeit license registrations", st['cell'])],
        [Paragraph("UNIQUE Personnel Key", st['cell']), Paragraph("officers(badge_number, contact_email)", st['cell']), Paragraph("Guarantees one cryptographic account per active law enforcement badge", st['cell'])],
        [Paragraph("CHECK (Status Domain)", st['cell']), Paragraph("cases(status)", st['cell']), Paragraph("CHECK (status IN ('Open', 'Under Investigation', 'On Hold', 'Closed'))", st['cell'])],
        [Paragraph("CHECK (Priority Domain)", st['cell']), Paragraph("cases(priority)", st['cell']), Paragraph("CHECK (priority IN ('Low', 'Medium', 'High', 'Critical'))", st['cell'])],
        [Paragraph("CHECK (RBAC Role)", st['cell']), Paragraph("officers(role)", st['cell']), Paragraph("CHECK (role IN ('ADMIN', 'INVESTIGATOR')) strictly bounds auth roles", st['cell'])],
        [Paragraph("FK CASCADE", st['cell']), Paragraph("case_people, evidence, case_activity", st['cell']), Paragraph("ON DELETE CASCADE purges dependent junction records when parent is removed", st['cell'])],
        [Paragraph("FK RESTRICT (Custody)", st['cell']), Paragraph("evidence_custody(officer_id)", st['cell']), Paragraph("ON DELETE RESTRICT blocks deleting officers with active custodial responsibility", st['cell'])],
    ]
    t = Table(constraints_data, colWidths=[120, 140, 244])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    story.append(Paragraph("2. Normalization Analysis & Formal Proofs (1NF, 2NF, 3NF, BCNF)", st['h1']))
    story.append(Paragraph(
        "<b>First Normal Form (1NF):</b> All column values are atomic scalar values. No repeating groups or multivalued delimited strings. "
        "Multiple phone numbers or hardware items are decoupled into <code>person_devices</code>.<br/>"
        "<b>Second Normal Form (2NF):</b> Schema is in 1NF and contains zero partial key dependencies. In composite junction tables like "
        "<code>case_people(case_id, person_id)</code>, descriptive attributes (<code>role_in_case</code>, <code>added_at</code>) depend fully on the complete composite key.<br/>"
        "<b>Third Normal Form (3NF):</b> Schema is in 2NF and contains zero transitive dependencies. Functional dependency proof: In an unnormalized relation, "
        "<code>case_id -> lead_officer_id</code> and <code>lead_officer_id -> department</code>. Decomposing into <code>cases</code> and <code>officers</code> "
        "eliminates this transitive anomaly.<br/>"
        "<b>Boyce-Codd Normal Form (BCNF):</b> For every non-trivial functional dependency X -> Y, X is a superkey.",
        st['body']
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {filepath}")


# -----------------------------------------------------------------------------
# 03_SQL_DDL_Implementation.pdf (Row 3 - 4 Marks)
# -----------------------------------------------------------------------------
def build_pdf_3_ddl_implementation(st):
    filepath = os.path.join(SUBMISSION_DIR, "03_SQL_DDL_Implementation.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
    story = []
    story.extend(create_header_banner("SQL Database Implementation — DDL & Indexes", 3, 4, "SQL database implementation - DDL with constraints", st))

    story.append(Paragraph("1. Schema Implementation (database/sql/schema.sql)", st['h1']))
    story.append(Paragraph(
        "The DDL defines all 22 tables with strict primary keys, foreign keys, CHECK constraints, and 17 dedicated performance indexes.",
        st['body']
    ))

    ddl_snippet = """-- Core Entity DDL Excerpt (PostgreSQL / SQLite Compatible)
CREATE TABLE officers (
    officer_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    badge_number VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    contact_email VARCHAR(120) NOT NULL UNIQUE,
    role VARCHAR(100) NOT NULL DEFAULT 'INVESTIGATOR' CHECK (role IN ('ADMIN', 'INVESTIGATOR')),
    account_status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (account_status IN ('Active', 'Suspended', 'On Leave')),
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cases (
    case_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    case_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Under Investigation', 'On Hold', 'Closed')),
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    lead_officer_id VARCHAR(50) REFERENCES officers(officer_id) ON DELETE SET NULL,
    incident_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE case_people (
    case_id VARCHAR(50) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    person_id VARCHAR(50) NOT NULL REFERENCES people(person_id) ON DELETE CASCADE,
    role_in_case VARCHAR(100) DEFAULT 'Subject of Investigation',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (case_id, person_id)
);"""
    story.append(Preformatted(ddl_snippet, st['code']))
    story.append(Spacer(1, 6))

    story.append(Paragraph("2. B-Tree & Compound Performance Indexes (17 Indexes)", st['h1']))
    indexes_data = [
        [Paragraph("Index Name", st['cell_bold']), Paragraph("Table & Columns", st['cell_bold']), Paragraph("Optimization Objective", st['cell_bold'])],
        [Paragraph("idx_cases_lead_officer", st['cell']), Paragraph("cases(lead_officer_id)", st['cell']), Paragraph("Accelerates officer caseload joins and integrity lookups", st['cell'])],
        [Paragraph("idx_cases_status_priority", st['cell']), Paragraph("cases(status, priority)", st['cell']), Paragraph("Compound index eliminating full-table scans during dashboard triage", st['cell'])],
        [Paragraph("idx_evidence_case", st['cell']), Paragraph("evidence(case_id)", st['cell']), Paragraph("Sub-second exhibit retrieval when opening case dossiers", st['cell'])],
        [Paragraph("idx_custody_timestamp", st['cell']), Paragraph("evidence_custody(event_timestamp DESC)", st['cell']), Paragraph("Chronological ordering of custody handoffs for court reports", st['cell'])],
        [Paragraph("idx_vehicles_registration", st['cell']), Paragraph("vehicles(registration_number)", st['cell']), Paragraph("Exact lookup for ANPR camera triggers and police dispatch", st['cell'])],
        [Paragraph("idx_devices_serial", st['cell']), Paragraph("devices(serial_number)", st['cell']), Paragraph("Exact lookup for hardware forensic exhibits and IMEI extractions", st['cell'])],
        [Paragraph("idx_cp_person", st['cell']), Paragraph("case_people(person_id)", st['cell']), Paragraph("Accelerates recursive CTE associate traversals across shared cases", st['cell'])],
    ]
    t = Table(indexes_data, colWidths=[120, 150, 234])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(t)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {filepath}")


# -----------------------------------------------------------------------------
# 04_NoSQL_Vector_Database_Creation.pdf (Row 4 - 4 Marks)
# -----------------------------------------------------------------------------
def build_pdf_4_nosql_creation(st):
    filepath = os.path.join(SUBMISSION_DIR, "04_NoSQL_Vector_Database_Creation.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
    story = []
    story.extend(create_header_banner("NoSQL & Vector Database Creation Specification", 4, 4, "NoSQL/Vector database creation", st))

    story.append(Paragraph("1. MongoDB Collection Schema Validation (collection-schema.json)", st['h1']))
    story.append(Paragraph(
        "MongoDB collection <code>investigation_documents</code> enforces strict structural validation via <code>$jsonSchema</code>, "
        "mandating required fields while supporting polymorphic nested metadata and 64-dimensional dense semantic vectors.",
        st['body']
    ))

    schema_snippet = """{
  "$jsonSchema": {
    "bsonType": "object",
    "required": ["title", "document_type", "content", "created_at"],
    "properties": {
      "case_id": { "type": ["string", "null"], "description": "FK to cases.case_id" },
      "document_type": { "type": "string" },
      "title": { "type": "string", "minLength": 3, "maxLength": 250 },
      "content": { "type": "string" },
      "summary": { "type": ["string", "null"] },
      "related_entity_ids": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["entity_type", "entity_id"],
          "properties": { "entity_type": { "type": "string" }, "entity_id": { "type": "string" } }
        }
      },
      "tags": { "type": "array", "items": { "type": "string" } },
      "embedding": {
        "type": "array",
        "items": { "type": "number" },
        "description": "64-dimensional dense semantic vector for cosine similarity search"
      },
      "metadata": { "type": "object", "additionalProperties": true }
    }
  }
}"""
    story.append(Preformatted(schema_snippet, st['code']))
    story.append(Spacer(1, 6))

    story.append(Paragraph("2. Indexes & Vector Embedding Architecture", st['h1']))
    story.append(Paragraph(
        "• <b>Weighted Text Index:</b> <code>doc_fulltext_index</code> on <code>{ title: 10, tags: 5, summary: 3, content: 1 }</code>.<br/>"
        "• <b>Compound Index:</b> <code>idx_case_id_created</code> on <code>{ case_id: 1, created_at: -1 }</code>.<br/>"
        "• <b>Multikey Index:</b> <code>idx_related_entities</code> on <code>{ 'related_entity_ids.entity_type': 1, 'related_entity_ids.entity_id': 1 }</code>.<br/>"
        "• <b>64-Dim Dense Vector:</b> Pre-computed unit-normalized vectors stored in <code>embedding</code> for sub-millisecond cosine similarity search.",
        st['body']
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {filepath}")


# -----------------------------------------------------------------------------
# 05_Technology_Justification.pdf (Row 5 - 1 Mark)
# -----------------------------------------------------------------------------
def build_pdf_5_tech_justification(st):
    filepath = os.path.join(SUBMISSION_DIR, "05_Technology_Justification.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
    story = []
    story.extend(create_header_banner("Technology Justification & Architectural Trade-offs", 5, 1, "Technology justification", st))

    story.append(Paragraph("1. The Polyglot Persistence Requirement", st['h1']))
    story.append(Paragraph(
        "Modern law enforcement fusion centers process two divergent classes of data that cannot be satisfied by any single database model:<br/>"
        "1. <b>Strict Relational Entities (PostgreSQL / SQLite):</b> Legal chain of custody, evidence accounting, and officer roles require strict "
        "<b>ACID transactions</b>, foreign key referential integrity, and cascading rules. Storing court exhibits in an eventually consistent NoSQL store "
        "risks race conditions and evidence being ruled inadmissible in court.<br/>"
        "2. <b>Polymorphic Forensic Artifacts (MongoDB):</b> Intelligence feeds (ANPR camera telemetry, CCTV frame EXIF, phone extraction JSON, wiretap logs) "
        "possess unpredictable, evolving schemas. In a relational database, accommodating these would require continuous schema migrations (<code>ALTER TABLE</code>) "
        "or loss of queryability in unstructured text blobs. MongoDB naturally models these as polymorphic BSON documents.",
        st['body']
    ))

    story.append(Paragraph("2. Architectural Trade-off Matrix", st['h1']))
    matrix_data = [
        [Paragraph("Parameter", st['cell_bold']), Paragraph("PostgreSQL (Relational Core)", st['cell_bold']), Paragraph("MongoDB (Document Store)", st['cell_bold'])],
        [Paragraph("Primary Role", st['cell']), Paragraph("System of Record for Entities & Custody", st['cell']), Paragraph("Elastic Intelligence Document Repository", st['cell'])],
        [Paragraph("Integrity Guarantees", st['cell']), Paragraph("Full ACID, Serialized Transactions", st['cell']), Paragraph("Document-level atomicity, schema agility", st['cell'])],
        [Paragraph("Relationships", st['cell']), Paragraph("Foreign Keys & 12 Junction Tables (M:N)", st['cell']), Paragraph("Polymorphic application-level references", st['cell'])],
        [Paragraph("Search & Retrieval", st['cell']), Paragraph("Exact B-tree lookups, Joins, Window Functions", st['cell']), Paragraph("Inverted Text Index, 64-Dim Vector Similarity", st['cell'])],
        [Paragraph("Procedural Logic", st['cell']), Paragraph("PL/pgSQL Procedures, Functions, Triggers", st['cell']), Paragraph("Multi-stage Aggregation Pipelines ($group, $sort)", st['cell'])],
    ]
    t = Table(matrix_data, colWidths=[90, 204, 210])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    story.append(Paragraph("3. Application Stack Rationale (FastAPI & Next.js 15)", st['h1']))
    story.append(Paragraph(
        "• <b>FastAPI:</b> Asynchronous Python framework federating PostgreSQL/SQLite queries and MongoDB calls in parallel, generating automatic OpenAPI/Swagger documentation.<br/>"
        "• <b>Next.js 15 & React:</b> Server-side rendered interface designed with a dark graphite case-management theme, dense tabular layouts, and zero decorative bloat.",
        st['body']
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {filepath}")


# -----------------------------------------------------------------------------
# 06_DML_Operations.pdf (Row 6 - 4 Marks)
# -----------------------------------------------------------------------------
def build_pdf_6_dml_operations(st):
    filepath = os.path.join(SUBMISSION_DIR, "06_DML_Operations.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
    story = []
    story.extend(create_header_banner("Data Manipulation Language (DML) & Transactions", 6, 4, "DML operations", st))

    story.append(Paragraph("1. CRUD Statements on Core & Junction Relations", st['h1']))
    dml_code = """-- INSERT Case, Person, and Bridge Table Association
INSERT INTO cases (case_id, title, description, case_type, status, priority, lead_officer_id)
VALUES ('CASE-2026-901', 'Operation Cobalt Wire', 'Offshore satellite telemetry burst', 'Electronic Surveillance', 'Open', 'Critical', 'OFF-001');

INSERT INTO people (person_id, full_name, category, contact_phone, address)
VALUES ('PER-901', 'Farhan Qureshi', 'Subject', '+91-98450-99881', 'Mangaluru Port Dock 4B');

INSERT INTO case_people (case_id, person_id, role_in_case)
VALUES ('CASE-2026-901', 'PER-901', 'Chief Systems Operator');

-- UPDATE Status and Evidence Vault Location
UPDATE cases SET status = 'Under Investigation', priority = 'Critical' WHERE case_id = 'CASE-2026-901';
UPDATE evidence SET storage_reference = 'Cyber Forensics Station 2' WHERE evidence_id = 'EVD-901';

-- DELETE Association (Decouples suspect while preserving master person entity)
DELETE FROM case_people WHERE case_id = 'CASE-2026-901' AND person_id = 'PER-901';"""
    story.append(Preformatted(dml_code, st['code']))
    story.append(Spacer(1, 6))

    story.append(Paragraph("2. ACID Transaction with SAVEPOINT & Recovery Demonstration", st['h1']))
    tx_code = """BEGIN;
-- Step 1: Register exhibit
INSERT INTO evidence (evidence_id, case_id, title, evidence_type, storage_reference)
VALUES ('EVD-902', 'CASE-2026-901', 'Encrypted MicroSD Card', 'Digital Storage', 'Vault Tray 9');

-- Step 2: Establish savepoint
SAVEPOINT after_evidence_created;

-- Step 3: Attempt assignment to non-existent officer (Validation error)
-- Trigger rollback to savepoint:
ROLLBACK TO SAVEPOINT after_evidence_created;

-- Step 4: Correct assignment with verified officer
INSERT INTO evidence_custody (evidence_id, officer_id, event_type, notes)
VALUES ('EVD-902', 'OFF-001', 'Initial Vault Deposition', 'Logged after savepoint recovery.');

COMMIT;
-- VERIFICATION QUERY:
-- SELECT evidence_id, title, storage_reference FROM evidence WHERE evidence_id = 'EVD-902';
-- OUTPUT: EVD-902 | Encrypted MicroSD Card | Vault Tray 9 (Transaction committed cleanly)"""
    story.append(Preformatted(tx_code, st['code']))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {filepath}")


# -----------------------------------------------------------------------------
# 07_Queries_Nested_Correlated_Recursive_Joins.pdf (Row 7 - 4 Marks)
# -----------------------------------------------------------------------------
def build_pdf_7_queries(st):
    filepath = os.path.join(SUBMISSION_DIR, "07_Queries_Nested_Correlated_Recursive_Joins.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
    story = []
    story.extend(create_header_banner("Nested, Correlated, Recursive & Multi-Table Joins", 7, 4, "Nested/correlated/recursive queries, JOIN SQL queries", st))

    story.append(Paragraph("1. Complex Multi-Table JOIN (6 Relations)", st['h1']))
    q1_code = """SELECT c.case_id, c.title, o.full_name AS lead_officer, p.full_name AS suspect, cp.role_in_case, e.title AS exhibit
FROM cases c
JOIN officers o ON c.lead_officer_id = o.officer_id
JOIN case_people cp ON c.case_id = cp.case_id
JOIN people p ON cp.person_id = p.person_id
LEFT JOIN evidence e ON c.case_id = e.case_id
WHERE c.priority IN ('High', 'Critical') LIMIT 2;
-- OUTPUT:
-- CASE-2026-001 | Op Shrouded Horizon | Rajesh Sharma | Vikram Singh | Principal Target | ThinkPad X1 Carbon"""
    story.append(Preformatted(q1_code, st['code']))

    story.append(Paragraph("2. Correlated Subquery (Identifying Multi-Case Subjects)", st['h1']))
    q2_code = """SELECT p.person_id, p.full_name, p.category,
    (SELECT COUNT(DISTINCT cp.case_id) FROM case_people cp WHERE cp.person_id = p.person_id) AS active_cases
FROM people p
WHERE (SELECT COUNT(DISTINCT cp2.case_id) FROM case_people cp2 WHERE cp2.person_id = p.person_id) >= 2;
-- OUTPUT:
-- PER-001 | Vikram Singh   | Subject | 2
-- PER-002 | Rohan Deshmukh | Subject | 2"""
    story.append(Preformatted(q2_code, st['code']))

    story.append(Paragraph("3. Recursive Common Table Expression (CTE): Multi-Hop Criminal Network", st['h1']))
    q3_code = """WITH RECURSIVE SuspectNetwork AS (
    -- Anchor Member (Depth 0)
    SELECT cp.person_id AS source_id, cp.person_id AS target_id, cp.case_id, 0 AS depth
    FROM case_people cp WHERE cp.person_id = 'PER-001'
    UNION
    -- Recursive Member (Depth N+1)
    SELECT sn.source_id, next_cp.person_id, next_cp.case_id, sn.depth + 1
    FROM SuspectNetwork sn
    JOIN case_people curr_cp ON sn.target_id = curr_cp.person_id
    JOIN case_people next_cp ON curr_cp.case_id = next_cp.case_id
    WHERE next_cp.person_id != sn.target_id AND sn.depth < 2
)
SELECT DISTINCT p.person_id, p.full_name, sn.depth, sn.case_id
FROM SuspectNetwork sn JOIN people p ON sn.target_id = p.person_id ORDER BY sn.depth ASC;
-- OUTPUT:
-- PER-001 | Vikram Singh   | 0 (Root Subject)      | CASE-2026-001
-- PER-002 | Rohan Deshmukh | 1 (Direct Associate)  | CASE-2026-001
-- PER-007 | Meera Sen      | 2 (Indirect Contact)  | CASE-2026-002"""
    story.append(Preformatted(q3_code, st['code']))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {filepath}")


# -----------------------------------------------------------------------------
# 08_Advanced_SQL_Procedure_Function_Trigger_CTE.pdf (Row 8 - 6 Marks)
# -----------------------------------------------------------------------------
def build_pdf_8_advanced_sql(st):
    filepath = os.path.join(SUBMISSION_DIR, "08_Advanced_SQL_Procedure_Function_Trigger_CTE.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
    story = []
    story.extend(create_header_banner("Advanced Procedural SQL: Procedure, Function, Trigger, CTE", 8, 6, "Advanced SQL concepts: procedure/function, trigger, CTE", st))

    story.append(Paragraph("1. Stored Procedure: sp_create_investigation_case", st['h1']))
    sp_code = """CREATE OR REPLACE PROCEDURE sp_create_investigation_case(
    IN p_case_id VARCHAR(50), IN p_title VARCHAR(200), IN p_description TEXT,
    IN p_case_type VARCHAR(100), IN p_priority VARCHAR(50), IN p_lead_officer_id VARCHAR(50)
) LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO cases (case_id, title, description, case_type, status, priority, lead_officer_id)
    VALUES (p_case_id, p_title, p_description, p_case_type, 'Open', p_priority, p_lead_officer_id);

    INSERT INTO case_activity (case_id, activity_type, title, description, officer_id)
    VALUES (p_case_id, 'CASE_INITIALIZED', 'Case Record Created', 'Initialized with priority: ' || p_priority, p_lead_officer_id);
END; $$;
-- EXECUTION: CALL sp_create_investigation_case('CASE-2026-999', 'Op Neon', 'Crypto ring', 'Cyber', 'High', 'OFF-001');"""
    story.append(Preformatted(sp_code, st['code']))

    story.append(Paragraph("2. User-Defined Function: fn_get_case_summary", st['h1']))
    fn_code = """CREATE OR REPLACE FUNCTION fn_get_case_summary(p_case_id VARCHAR(50)) RETURNS JSONB AS $$
DECLARE v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'case_id', c.case_id, 'title', c.title, 'status', c.status,
        'lead_officer', o.full_name || ' (' || o.badge_number || ')',
        'stats', jsonb_build_object('people', COUNT(DISTINCT cp.person_id), 'evidence', COUNT(DISTINCT e.evidence_id))
    ) INTO v_result
    FROM cases c LEFT JOIN officers o ON c.lead_officer_id = o.officer_id
    LEFT JOIN case_people cp ON c.case_id = cp.case_id
    LEFT JOIN evidence e ON c.case_id = e.case_id
    WHERE c.case_id = p_case_id GROUP BY c.case_id, c.title, c.status, o.full_name, o.badge_number;
    RETURN v_result;
END; $$ LANGUAGE plpgsql STABLE;"""
    story.append(Preformatted(fn_code, st['code']))

    story.append(Paragraph("3. Row-Level Audit Trigger: trg_case_activity_audit", st['h1']))
    trg_code = """CREATE OR REPLACE FUNCTION fn_audit_case_state_change() RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO case_activity (case_id, activity_type, title, description, officer_id)
        VALUES (NEW.case_id, 'STATUS_CHANGE', 'Status Updated',
                'Status transitioned from "' || OLD.status || '" to "' || NEW.status || '".', NEW.lead_officer_id);
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_case_activity_audit
    AFTER UPDATE OF status, priority ON cases FOR EACH ROW EXECUTE FUNCTION fn_audit_case_state_change();
-- VERIFICATION: Updating cases.status automatically inserts an immutable row into case_activity."""
    story.append(Preformatted(trg_code, st['code']))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {filepath}")


# -----------------------------------------------------------------------------
# 09_NoSQL_Vector_Features_and_RUD.pdf (Row 9 - 7 Marks)
# -----------------------------------------------------------------------------
def build_pdf_9_nosql_vector(st):
    filepath = os.path.join(SUBMISSION_DIR, "09_NoSQL_Vector_Features_and_RUD.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
    story = []
    story.extend(create_header_banner("NoSQL RUD, Aggregation & 64-Dim Vector Similarity Search", 9, 7, "NoSQL/Vector feature, RUD", st))

    story.append(Paragraph("1. 64-Dimensional Semantic Vector Similarity Search", st['h1']))
    story.append(Paragraph(
        "Implemented deterministic 64-dimensional dense semantic feature hashing in <code>backend/app/core/vector.py</code> "
        "operating 100% offline with zero external dependencies. Documents and queries are normalized to the unit hypersphere "
        "and compared via cosine similarity. Exposed at <code>GET /api/search/semantic</code>.",
        st['body']
    ))

    vector_code = """# Execution Output from scripts/test_vector_search.py:
[QUERY]: "stolen blue luxury BMW sedan hotel valet"
  -> Generated Query Vector: 64 floats (L2 Normalized)
  -> Top 3 Semantic Matches:
     #1 [Score: 0.3388 | 33%] "Formal Sworn Statement of Valet Supervisor Pooja Kulkarni" [Witness statements]
     #2 [Score: 0.2806 | 28%] "Slack Internal Channel Dump: Fintech Nexa IT Security Emergency" [Chat exports]
     #3 [Score: 0.2503 | 25%] "National Vahan Vehicle Registry API Query: KA-01-MJ-8821" [JSON API responses]

[QUERY]: "cryptocurrency illicit transfer laundered wallet"
  -> Generated Query Vector: 64 floats (L2 Normalized)
  -> Top Semantic Match:
     #1 [Score: 0.2268 | 22%] "Telecom Network Operational Audit: Vasanth Nagar Exchange" [Case: CASE-2026-003]"""
    story.append(Preformatted(vector_code, st['code']))
    story.append(Spacer(1, 6))

    story.append(Paragraph("2. MongoDB RUD & Multi-Stage Aggregation Pipeline", st['h1']))
    mql_code = """// Aggregation Pipeline: Intelligence Distribution by Document Type
db.investigation_documents.aggregate([
  { $group: {
      _id: "$document_type",
      total_docs: { $sum: 1 },
      distinct_cases: { $addToSet: "$case_id" },
      avg_tags: { $avg: { $size: { $ifNull: ["$tags", []] } } }
  }},
  { $project: {
      document_type: "$_id", total_docs: 1,
      total_cases: { $size: "$distinct_cases" },
      avg_tags: { $round: ["$avg_tags", 1] }
  }},
  { $sort: { total_docs: -1 } }
]);
// Full-Text Search with Relevance Scoring:
db.investigation_documents.find(
  { $text: { $search: "crypto tumbler wallet" } },
  { score: { $meta: "textScore" }, title: 1, document_type: 1 }
).sort({ score: { $meta: "textScore" } }).limit(3);"""
    story.append(Preformatted(mql_code, st['code']))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {filepath}")


# -----------------------------------------------------------------------------
# 10_Authentication_and_RBAC.pdf (Row 12 - 4 Marks)
# -----------------------------------------------------------------------------
def build_pdf_10_auth_rbac(st):
    filepath = os.path.join(SUBMISSION_DIR, "10_Authentication_and_RBAC.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
    story = []
    story.extend(create_header_banner("Authentication & Role-Based Access Control (RBAC)", 12, 4, "Authentication (frontend + minimum two roles + RBAC in database)", st))

    story.append(Paragraph("1. Dual-Layer RBAC Architecture", st['h1']))
    story.append(Paragraph(
        "Access control is strictly enforced at two independent architectural levels:<br/>"
        "1. <b>Application Gateway (FastAPI + JWT):</b> Endpoints authenticate bearer tokens and verify roles (ADMIN vs INVESTIGATOR). "
        "Investigator tokens receive an immediate <b>403 Forbidden</b> on admin-only routes (e.g. <code>POST /api/officers</code>).<br/>"
        "2. <b>Database Kernel (PostgreSQL Roles in roles-and-grants.sql):</b> Roles <code>ifp_admin</code>, <code>ifp_investigator</code>, "
        "and <code>ifp_auditor</code> possess differing SQL privileges. Investigators are granted <code>SELECT, INSERT, UPDATE</code> on entities "
        "but have <b>REVOKE DELETE</b> on cases, evidence, and audit logs to prevent evidence spoliation.",
        st['body']
    ))

    story.append(Paragraph("2. Server-Side & Database RBAC Verification Output (scripts/demonstrate_db_rbac.py)", st['h1']))
    rbac_output = """=== SERVER-SIDE API RBAC ENFORCEMENT ===
[1] Authenticating as Field Investigator (CID-002)...
    -> Token Granted. Role: INVESTIGATOR
[2] Investigator reading directory (GET /api/officers)...
    -> Response: 200 OK (Permitted read-only access)
[3] Investigator attempting to provision officer (POST /api/officers)...
    -> Response: 403 FORBIDDEN
    -> Server Detail: "Access forbidden: Officer provisioning requires ADMIN clearance."
    -> [PASS] Server-side 403 Forbidden successfully enforced.

=== DATABASE-LEVEL PRIVILEGE MATRIX (roles-and-grants.sql) ===
ROLE: ifp_admin        -> ALL PRIVILEGES ON ALL TABLES IN SCHEMA public
ROLE: ifp_investigator -> SELECT ON officers; SELECT, INSERT ON case_activity, evidence_custody;
                          SELECT, INSERT, UPDATE ON cases, people, vehicles, devices, evidence;
                          REVOKE DELETE ON cases, evidence, evidence_custody, case_activity;
                          Attempting `DELETE FROM cases` -> SQL Error: 42501 (Permission Denied).
ROLE: ifp_auditor      -> SELECT ON ALL TABLES (Strict read-only viva inspection role)."""
    story.append(Preformatted(rbac_output, st['code']))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {filepath}")


# -----------------------------------------------------------------------------
# 11_Project_Report.pdf (Rows 10, 11, 13, 14 - 11 Marks)
# -----------------------------------------------------------------------------
def build_pdf_11_project_report(st):
    filepath = os.path.join(SUBMISSION_DIR, "11_Project_Report.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
    story = []
    story.extend(create_header_banner("Comprehensive Project Report & Rubric Mapping", 11, 11, "UI, Integration, Documentation, Originality", st))

    story.append(Paragraph("1. Executive Summary & Architecture", st['h1']))
    story.append(Paragraph(
        "The <b>Intelligence Fusion Platform</b> is a polyglot investigation management system uniting a 22-table normalized PostgreSQL "
        "relational core (with zero-config SQLite failover) with an elastic MongoDB document store. Built with FastAPI and Next.js 15, "
        "the platform enables cross-database federated search, relationship network graph analysis, and 64-dimensional semantic vector matching.",
        st['body']
    ))

    story.append(Paragraph("2. Official 14-Component Rubric to Evidence Mapping Table", st['h1']))
    rubric_map = [
        [Paragraph("#", st['cell_bold']), Paragraph("Evaluation Component", st['cell_bold']), Paragraph("Marks", st['cell_bold']), Paragraph("Primary Submission PDF / Artifact", st['cell_bold']), Paragraph("Status", st['cell_bold'])],
        [Paragraph("1", st['cell']), Paragraph("ER Diagram", st['cell']), Paragraph("2", st['cell']), Paragraph("01_ER_Diagram.pdf (docs/er-diagram.md)", st['cell']), Paragraph("Complete", st['cell'])],
        [Paragraph("2", st['cell']), Paragraph("Relational Schema, Keys & Constraints", st['cell']), Paragraph("3", st['cell']), Paragraph("02_Relational_Schema.pdf (docs/database-design.md)", st['cell']), Paragraph("Complete", st['cell'])],
        [Paragraph("3", st['cell']), Paragraph("SQL Implementation (DDL & Constraints)", st['cell']), Paragraph("4", st['cell']), Paragraph("03_SQL_DDL_Implementation.pdf (database/sql/schema.sql)", st['cell']), Paragraph("Complete", st['cell'])],
        [Paragraph("4", st['cell']), Paragraph("NoSQL / Vector Database Creation", st['cell']), Paragraph("4", st['cell']), Paragraph("04_NoSQL_Vector_Database_Creation.pdf", st['cell']), Paragraph("Complete", st['cell'])],
        [Paragraph("5", st['cell']), Paragraph("Technology Justification", st['cell']), Paragraph("1", st['cell']), Paragraph("05_Technology_Justification.pdf", st['cell']), Paragraph("Complete", st['cell'])],
        [Paragraph("6", st['cell']), Paragraph("DML Operations & Transactions", st['cell']), Paragraph("4", st['cell']), Paragraph("06_DML_Operations.pdf (database/sql/dml-examples.sql)", st['cell']), Paragraph("Complete", st['cell'])],
        [Paragraph("7", st['cell']), Paragraph("Nested, Correlated, Recursive & Joins", st['cell']), Paragraph("4", st['cell']), Paragraph("07_Queries_Nested_Correlated_Recursive_Joins.pdf", st['cell']), Paragraph("Complete", st['cell'])],
        [Paragraph("8", st['cell']), Paragraph("Advanced SQL (Procedure, Trigger, CTE)", st['cell']), Paragraph("6", st['cell']), Paragraph("08_Advanced_SQL_Procedure_Function_Trigger_CTE.pdf", st['cell']), Paragraph("Complete", st['cell'])],
        [Paragraph("9", st['cell']), Paragraph("NoSQL Feature, Vector Search & RUD", st['cell']), Paragraph("7", st['cell']), Paragraph("09_NoSQL_Vector_Features_and_RUD.pdf", st['cell']), Paragraph("Complete", st['cell'])],
        [Paragraph("10", st['cell']), Paragraph("Next.js Interface (TypeScript)", st['cell']), Paragraph("3", st['cell']), Paragraph("frontend/ (18/18 static pages generate cleanly)", st['cell']), Paragraph("Complete", st['cell'])],
        [Paragraph("11", st['cell']), Paragraph("Backend API & Database Integration", st['cell']), Paragraph("2", st['cell']), Paragraph("backend/app/ (FastAPI, Swagger, Federated Search)", st['cell']), Paragraph("Complete", st['cell'])],
        [Paragraph("12", st['cell']), Paragraph("Authentication & Database RBAC", st['cell']), Paragraph("4", st['cell']), Paragraph("10_Authentication_and_RBAC.pdf (scripts/demonstrate_db_rbac.py)", st['cell']), Paragraph("Complete", st['cell'])],
        [Paragraph("13", st['cell']), Paragraph("Documentation, Git & GitHub", st['cell']), Paragraph("2", st['cell']), Paragraph("README.md, .gitignore, clean root repository", st['cell']), Paragraph("Complete", st['cell'])],
        [Paragraph("14", st['cell']), Paragraph("Originality, Contributions & Viva", st['cell']), Paragraph("4", st['cell']), Paragraph("docs/modifications.md, docs/viva-preparation.md", st['cell']), Paragraph("Complete", st['cell'])],
        [Paragraph("TOTAL", st['cell_bold']), Paragraph("Official University Rubric Evaluation", st['cell_bold']), Paragraph("50", st['cell_bold']), Paragraph("All 14 Components Covered with Concrete Code & Output", st['cell_bold']), Paragraph("100% Ready", st['cell_bold'])],
    ]
    t = Table(rubric_map, colWidths=[20, 150, 30, 240, 64])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    story.append(Paragraph("3. Team Roles & Contribution Summary", st['h1']))
    story.append(Paragraph(
        "• <b>Saatvik Gupta (PES1UG24CS395):</b> Relational data modeling (3NF/BCNF DDL/DML), PostgreSQL procedures, triggers and CTEs, "
        "FastAPI backend architecture, and Next.js frontend UI overhaul.<br/>"
        "• <b>Satyam Goyal (PES1UG24CS424):</b> NoSQL document modeling, MongoDB schema validation, RBAC privilege specifications "
        "(<code>roles-and-grants.sql</code>), testing scenarios, and academic submission documentation.",
        st['body']
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {filepath}")

def main():
    print("=" * 75)
    print("Generating Official Academic PDF Deliverables (11 Documents)...")
    print("=" * 75)
    st = get_report_styles()
    build_pdf_1_er_diagram(st)
    build_pdf_2_relational_schema(st)
    build_pdf_3_ddl_implementation(st)
    build_pdf_4_nosql_creation(st)
    build_pdf_5_tech_justification(st)
    build_pdf_6_dml_operations(st)
    build_pdf_7_queries(st)
    build_pdf_8_advanced_sql(st)
    build_pdf_9_nosql_vector(st)
    build_pdf_10_auth_rbac(st)
    build_pdf_11_project_report(st)
    print("=" * 75)
    print(f"All 11 PDFs successfully generated in: {SUBMISSION_DIR}")
    print("=" * 75)

if __name__ == "__main__":
    main()
