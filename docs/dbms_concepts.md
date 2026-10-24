# DBMS Concepts & Viva Defense Guide

**Project Title:** Intelligence Fusion Platform  
**Project Type:** College DBMS Mini Project  
**Team Members:**  
- **Saatvik Gupta** — PES1UG24CS395  
- **Satyam Goyal** — PES1UG24CS424  

---

## 1. Why a Dual-Database (SQL + NoSQL) Architecture?

### The Core Problem in Investigation Systems
Investigation domains contain two fundamentally different types of data:
1. **Structured Entity Records:** Cases, people, registered vehicles, physical evidence items, and police officers have fixed, predictable schemas. They require strict relational integrity, foreign key validation, and transactional ACID properties.
2. **Unstructured / Semi-Structured Field Documents:** Witness depositions, CCTV camera telemetry, extracted Signal/WhatsApp chats, telecom fiber testing logs, and external API responses do not fit into rigid relational tables. Their attributes vary wildly from document to document.

### Solution: Polyglot Persistence
- **PostgreSQL** acts as the single source of truth for all structured entities and their associations.
- **MongoDB** acts as the dynamic document repository for polymorphic intelligence artifacts.
- The two databases are unified through **validated foreign key references** (`case_id` and `related_entity_ids`) in MongoDB documents that point to SQL primary keys.

---

## 2. Relational Schema Normalization (1NF to BCNF)

### 1NF (Atomic Attributes)
- Every column stores an atomic value. For instance, rather than storing comma-delimited suspect phone numbers or an array of associated vehicle IDs inside the `cases` table, each relationship is broken out into dedicated tables.

### 2NF (Full Functional Dependency)
- The schema satisfies 1NF.
- In junction tables with composite primary keys (e.g. `case_people` with `(case_id, person_id)` as the composite PK), attributes such as `role_in_case` depend on the whole key.

### 3NF (Transitive Dependencies Removed)
- The schema satisfies 2NF.
- There are no transitive dependencies ($A \to B \to C$). For example, an officer's badge number, email, and department are stored in `officers`, not duplicated across every `cases` row.

---

## 3. Key SQL Queries Implemented in the Project

### A. 3-Table Relational Join
Demonstrates joining primary entity tables through foreign key constraints:
```sql
SELECT 
    c.case_id, 
    c.title AS case_title, 
    c.status, 
    o.full_name AS lead_officer, 
    e.evidence_id, 
    e.title AS evidence_title
FROM cases c
JOIN officers o ON c.lead_officer_id = o.officer_id
JOIN evidence e ON e.case_id = c.case_id
ORDER BY c.case_id ASC;
```

### B. Many-to-Many Bridge Table Query
Extracts relationships maintained through the `case_people` junction table:
```sql
SELECT 
    c.case_id, 
    c.title, 
    p.person_id, 
    p.full_name, 
    p.category, 
    cp.role_in_case
FROM case_people cp
JOIN cases c ON cp.case_id = c.case_id
JOIN people p ON cp.person_id = p.person_id;
```

### C. Aggregate Analysis with GROUP BY and HAVING
Finds active investigators managing multiple cases:
```sql
SELECT 
    o.officer_id, 
    o.full_name, 
    COUNT(c.case_id) AS total_assigned_cases
FROM officers o
JOIN cases c ON o.officer_id = c.lead_officer_id
GROUP BY o.officer_id, o.full_name
HAVING COUNT(c.case_id) >= 1;
```

---

## 4. Key MongoDB Concepts Implemented

### A. Dynamic Schema & Nested Metadata
A document can store arbitrary nested objects without altering the schema for other documents:
```json
{
  "document_type": "CCTV metadata",
  "metadata": {
    "speed_kmph": 118,
    "lane": "Outbound Express 2",
    "anpr_ocr_confidence": 0.984
  }
}
```

### B. Aggregation Pipeline
Aggregates document counts grouped by their source type:
```javascript
db.investigation_documents.aggregate([
  { $group: { _id: "$source_type", total: { $sum: 1 } } },
  { $sort: { total: -1 } }
]);
```

### C. Full-Text Compound Index
```javascript
db.investigation_documents.createIndex({
  title: "text",
  content: "text",
  summary: "text",
  tags: "text"
});
```

---

## 5. Referential Integrity & Deletion Rules

1. **Cascade Delete on Junction Tables:** Deleting a case or person cascades automatically to `case_people` and `person_vehicles` to prevent dangling references.
2. **Restrict Delete on Evidence:** Cases containing active legal evidence items cannot be deleted without an explicit `force=true` parameter. This enforces evidence retention compliance.
3. **Set Null on Officer Retirement:** When an officer record is deleted, `lead_officer_id` in `cases` is set to `NULL` to keep the case dossier intact.
