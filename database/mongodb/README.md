# Intelligence Fusion Platform — MongoDB Implementation & Document Design

**Authors:** Saatvik Gupta (`PES1UG24CS395`) & Satyam Goyal (`PES1UG24CS424`)  
**Database:** MongoDB 6.0+ / 7.0+  
**Target Collection:** `intelligence_fusion.investigation_documents`

---

## 1. Document Architecture & Polyglot Linking

In criminal investigations and multi-agency intelligence fusion, telemetry data arrives in diverse, unpredictable, and rapidly evolving structures:
- Digital Forensics: Encrypted chat exports, burner phone memory dumps, IMEI/IMSI telemetry.
- Physical Surveillance: CCTV detection timestamps, vehicle license plate recognitions, geo-fences.
- Narrative Documents: Field witness statements, interrogation transcripts, confidential informant tips.

Relational databases require a rigid predefined schema (`CREATE TABLE`) that suffers from excessive NULL values or costly schema migrations when handling such varied forensic artifacts. MongoDB stores these as polymorphic BSON/JSON documents, linking back to relational entities via indexed foreign keys:
- `case_id`: Direct relational reference to PostgreSQL `cases(id)`.
- `entity_type` & `entity_id`: Dynamic polymorphic foreign key linking to `people`, `vehicles`, `devices`, or `locations`.

---

## 2. Directory Artifacts

| File | Purpose |
|------|---------|
| [`collection-schema.json`](file:///d:/DBMS%20Mini%20Project/database/mongodb/collection-schema.json) | JSON Schema validation rules applied to the `investigation_documents` collection. |
| [`indexes.js`](file:///d:/DBMS%20Mini%20Project/database/mongodb/indexes.js) | Executable script setting up weighted full-text indexes and compound query indexes. |
| [`rud-examples.js`](file:///d:/DBMS%20Mini%20Project/database/mongodb/rud-examples.js) | Standalone script with text search, aggregation pipelines, updates, and deletes. |
| [`sample-documents.json`](file:///d:/DBMS%20Mini%20Project/database/mongodb/sample-documents.json) | Clean export of all 26 polymorphic investigation documents used in the platform. |

---

## 3. How to Apply Indexes and Run Scripts

Using `mongosh` (MongoDB Shell):
```bash
# Connect to local or Atlas MongoDB
mongosh "mongodb://localhost:27017/intelligence_fusion"

# Execute index creation
load("database/mongodb/indexes.js")

# Execute RUD demonstrations and aggregations
load("database/mongodb/rud-examples.js")
```

---

## 4. Vector Search vs Fallback Text Search

- **MongoDB Atlas Vector Search:** Uses hierarchical navigable small world (HNSW) graphs on 384-dimensional dense embeddings (`vector_embedding` field) to match semantic meanings across unstructured intelligence.
- **Local / Offline Fallback:** When running without an active internet connection or Atlas cluster, the system executes weighted text search via MongoDB's `$text` operator and cosine similarity simulation across tokens in `backend/app/routers/documents.py`.
