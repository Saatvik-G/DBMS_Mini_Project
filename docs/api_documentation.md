# REST API Documentation

**Project Title:** Intelligence Fusion Platform  
**Project Type:** DBMS Mini Project  
**Team Members:**  
- **Saatvik Gupta** — PES1UG24CS395  
- **Satyam Goyal** — PES1UG24CS424  

Base URL: `http://localhost:8000/api`  
Interactive Swagger UI: `http://localhost:8000/docs`  
ReDoc: `http://localhost:8000/redoc`  

---

## 1. System & Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Live connection status for PostgreSQL/SQLite and MongoDB |
| `POST` | `/auth/login` | Authenticates officer badge and returns JWT bearer token |
| `GET` | `/auth/demo-accounts` | Returns pre-seeded demo accounts for testing |

---

## 2. Dashboard & Analytics Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/stats` | Aggregated record counts, charts, and recent activity feed |
| `GET` | `/analytics` | SQL GROUP BY distributions and MongoDB aggregation metrics |

---

## 3. Relational Entity Endpoints

### Cases
- `GET /cases` — List cases with filtering (`status`, `priority`, `officer_id`) and search.
- `POST /cases` — Create new investigation dossier.
- `GET /cases/{case_id}` — Detailed dossier including linked entities from junction tables and linked MongoDB documents.
- `PUT /cases/{case_id}` — Update case status, priority, or notes.
- `DELETE /cases/{case_id}` — Safely remove case; requires `force=true` if active evidence items exist.
- `POST /cases/{case_id}/link` — Add entity to junction table (`case_people`, `case_vehicles`, etc.).
- `POST /cases/{case_id}/unlink` — Remove entity from junction table.
- `POST /cases/{case_id}/activities` — Log chronological activity in `case_activity`.
- `GET /cases/{case_id}/timeline` — Chronological timeline combining SQL events and MongoDB timestamps.

### Entities
- `GET /people`, `POST /people`, `GET /people/{id}`, `PUT /people/{id}`, `DELETE /people/{id}`
- `GET /organizations`, `POST /organizations`, `GET /organizations/{id}`, `PUT /organizations/{id}`, `DELETE /organizations/{id}`
- `GET /vehicles`, `POST /vehicles`, `GET /vehicles/{id}`, `PUT /vehicles/{id}`, `DELETE /vehicles/{id}`
- `GET /devices`, `POST /devices`, `GET /devices/{id}`, `PUT /devices/{id}`, `DELETE /devices/{id}`
- `GET /locations`, `POST /locations`, `GET /locations/{id}`, `PUT /locations/{id}`, `DELETE /locations/{id}`
- `GET /officers`, `POST /officers`, `GET /officers/{id}`, `PUT /officers/{id}`

### Evidence & Chain of Custody
- `GET /evidence`, `POST /evidence`, `GET /evidence/{id}`, `PUT /evidence/{id}`, `DELETE /evidence/{id}`
- `GET /evidence/{id}/custody` — Retrieve sequential chain-of-custody log.
- `POST /evidence/{id}/custody` — Log custody transfer, lab checkout, or court presentation.

---

## 4. MongoDB Document Endpoints

- `GET /documents` — Search and filter documents by `document_type`, `source_type`, `case_id`, `tag`.
- `POST /documents` — Ingest polymorphic document with validated nested JSON metadata.
- `GET /documents/{id}` — Retrieve document and resolve linked SQL entity foreign keys.
- `PUT /documents/{id}` — Update document content or metadata fields.
- `DELETE /documents/{id}` — Delete document from MongoDB collection.

---

## 5. Cross-Database & Viva Endpoints

- `GET /search?q={term}&category={all|sql|nosql}` — Unified cross-database full-text search.
- `GET /relationships/{entity_type}/{entity_id}` — Graph node and edge generation.
- `GET /dbms-concepts/queries` — Predefined academic DBMS benchmark queries.
- `POST /dbms-concepts/execute/{query_id}` — Safe execution runner returning query execution timing and results.
