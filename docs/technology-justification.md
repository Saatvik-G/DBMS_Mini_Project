# Intelligence Fusion Platform — Technology Justification & Architectural Analysis

**Course:** Database Management Systems Mini Project (UE24CS395/DBMS)  
**Authors:** Saatvik Gupta (`PES1UG24CS395`) & Satyam Goyal (`PES1UG24CS424`)  
**Architecture:** Polyglot Persistence (PostgreSQL Relational System of Record + MongoDB Unstructured Document Store)

---

## 1. Executive Architectural Overview

Modern intelligence fusion centers aggregate information from disparate sources: court filings, criminal registries, ballistics lab analyses, telecommunications intercepts, social media scrapers, and surveillance cameras. 

A central architectural dilemma in designing database management systems for law enforcement is that **no single database model satisfies all operational requirements**:
- Relational databases (RDBMS) enforce rigid schemas, primary-foreign key integrity, and ACID guarantees necessary for court-admissible chain of custody and case accounting.
- Document-oriented databases (NoSQL) provide schema agility, polymorphic record structures, horizontal partitioning, and high-performance full-text indexing required for unstructured digital forensics and multi-source intelligence reports.

The **Intelligence Fusion Platform** resolves this through **Polyglot Persistence**, pairing **PostgreSQL** as the core relational engine and **MongoDB** as the unstructured document engine, integrated via a unified FastAPI service layer.

---

## 2. Technology Selection & Architectural Matrix

| Parameter | PostgreSQL (Relational Core) | MongoDB (Document Engine) | Why Both Are Required |
|-----------|------------------------------|---------------------------|------------------------|
| **Data Role** | System of Record for Entities | Telemetry & Document Store | Strict identity vs heterogeneous payload |
| **Data Model** | Normalized Tables (3NF/BCNF) | Polymorphic BSON Documents | Avoid schema migrations for unknown devices |
| **Integrity Guarantees** | Full ACID (Atomicity, Consistency, Isolation, Durability) | Document-level atomicity, eventual consistency | Chain of custody must never permit phantom transfers |
| **Relationship Handling** | Foreign Keys & Junction Tables (M:N) | Denormalized embedded arrays or referenced IDs | Complex entity graph vs rapid document retrieval |
| **Indexing Strategy** | B-tree, Composite, Partial, Unique | Inverted Text Index, Compound, Vector HNSW | Exact ID lookup vs natural language search |
| **Primary Query Language** | ANSI SQL + PL/pgSQL (CTEs, Triggers) | MQL & Aggregation Pipelines ($match, $group) | Multi-table joins vs unstructured pipeline shaping |

---

## 3. Deep-Dive Rationale: Why Relational (PostgreSQL) for Core Entities

### 3.1 Chain of Custody & Legal Defensibility (ACID Compliance)
In legal proceedings, physical evidence and digital device logs must adhere to strict chain of custody regulations. If Officer A transfers seized encrypted drive #EVD-001 to Forensic Specialist Officer B, the operation must execute with absolute atomicity:
1. Evidence storage location and status are updated.
2. An immutable row in `evidence_custody` is created with a cryptographic hash.
3. If any step fails, the entire transaction rolls back via `ROLLBACK`.

Relational databases guarantee `SERIALIZABLE` or `READ COMMITTED` isolation levels with immediate consistency. Storing this in a distributed eventually consistent NoSQL store risks race conditions, missing custody links, and evidence being deemed inadmissible in court.

### 3.2 Normalized Entity Networks & 3NF Referential Integrity
The relationship between Cases, Suspects, Organizations, Vehicles, Devices, and Crime Scenes is inherently a dense many-to-many graph. Attempting to embed suspect arrays inside case documents causes:
- **Data Duplication:** A career criminal involved in 15 different cases would have their personal identifying information duplicated 15 times.
- **Update Anomalies:** Updating a suspect's phone number or alias in one case document leaves the other 14 out of sync.
- **Referential Integrity Loss:** Deleting a case must cleanly decouple or cascade without leaving orphaned suspect records, enforced natively by PostgreSQL foreign key constraints (`ON DELETE CASCADE`, `ON DELETE RESTRICT`).

---

## 4. Deep-Dive Rationale: Why Document Store (MongoDB) for Investigation Artifacts

### 4.1 Schema Polymorphism Across Forensics Sources
Unlike people or vehicles, investigation artifacts possess completely divergent internal schemas:
- **A CCTV Log** requires: `camera_id`, `resolution`, `fps`, `timestamp_range`, `bounding_boxes`, `vehicle_plates_detected`.
- **A WhatsApp/Signal Chat Export** requires: `chat_thread_id`, `participants`, `message_timestamps`, `attachment_hashes`, `is_ephemeral`.
- **A Forensic PDF Report** requires: `lab_accreditation`, `dna_alleles`, `fingerprint_minutiae_points`, `toxicology_readings`.

In PostgreSQL, accommodating these would require either 20+ specialized tables with deep sparse columns, or generic `JSONB` columns without native inverted text indexes. MongoDB naturally models these as polymorphic BSON documents sharing common envelop headers (`case_id`, `doc_type`, `classification`) while permitting unrestricted domain-specific `metadata`.

### 4.2 Natural Language Inverted Text & Vector Search
Investigative analysis frequently starts from fragmented keywords (e.g. *"dark blue sedan near warehouse with crypto wallet"*). MongoDB's weighted full-text search indexes tokenize, stem, and rank matching intelligence narratives with relevance scoring (`$meta: "textScore"`). Furthermore, MongoDB Atlas Vector Search enables embedding comparisons for semantic matching that catches synonyms missed by exact keyword queries.

---

## 5. Architectural Trade-Off Analysis

| Architectural Dimension | Monolithic RDBMS (PostgreSQL Only) | Monolithic NoSQL (MongoDB Only) | Polyglot Architecture (Implemented) |
|-------------------------|------------------------------------|----------------------------------|-------------------------------------|
| **Entity Integrity** | High (Foreign Keys, Triggers) | Low (Application-enforced integrity) | **High** (Guaranteed by PostgreSQL) |
| **Unstructured Ingestion** | Low (Requires JSON columns, slow migrations) | High (Native JSON document ingestion) | **High** (Direct BSON ingestion in MongoDB) |
| **Search Flexibility** | Medium (tsvector) | High (Text & Vector Search) | **High** (Unified hybrid search endpoint) |
| **Operational Overhead** | Low (Single DB service) | Low (Single DB service) | **Balanced** (Easily orchestrated via Docker Compose) |
| **Academic & Practical Merit** | Conventional | Unsuitable for relational DBMS project | **Demonstrates mastery of both paradigms** |

---

## 6. Conclusion

The Intelligence Fusion Platform proves that pairing an ACID-compliant relational system with a dynamic document store achieves maximum data integrity without compromising analytical agility. This architecture represents best-in-class design for modern high-assurance information systems.
