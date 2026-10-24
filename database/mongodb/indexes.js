// ============================================================================
// INTELLIGENCE FUSION PLATFORM — MONGODB INDEXES CONFIGURATION
// Target: MongoDB 6.0+ / 7.0+
// Authors: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)
// Subject: Database Management Systems (DBMS Mini Project)
// ============================================================================

// Switch to target database
db = db.getSiblingDB("intelligence_fusion");

print("Creating indexes on 'investigation_documents' collection...");

// 1. Full-Text Search Index across title, textual narrative, and tags
db.investigation_documents.createIndex(
  {
    title: "text",
    content_text: "text",
    tags: "text"
  },
  {
    weights: {
      title: 10,
      tags: 5,
      content_text: 1
    },
    name: "idx_text_search_doc_content",
    default_language: "english"
  }
);
print("-> Created text index: idx_text_search_doc_content");

// 2. Compound Index for Case Dossier filtering
db.investigation_documents.createIndex(
  { case_id: 1, doc_type: 1, created_at: -1 },
  { name: "idx_case_doctype_created" }
);
print("-> Created compound index: idx_case_doctype_created");

// 3. Polymorphic Relational Entity Reference Index
db.investigation_documents.createIndex(
  { entity_type: 1, entity_id: 1 },
  { name: "idx_entity_polymorphic_ref" }
);
print("-> Created compound index: idx_entity_polymorphic_ref");

// 4. Security Classification & Date Index
db.investigation_documents.createIndex(
  { classification: 1, created_at: -1 },
  { name: "idx_classification_date" }
);
print("-> Created index: idx_classification_date");

// 5. Atlas Vector Search Index Configuration (for MongoDB Atlas deployments)
/*
  To configure Vector Search in MongoDB Atlas UI or CLI:
  {
    "fields": [
      {
        "type": "vector",
        "path": "vector_embedding",
        "numDimensions": 384,
        "similarity": "cosine"
      },
      {
        "type": "filter",
        "path": "classification"
      },
      {
        "type": "filter",
        "path": "case_id"
      }
    ]
  }
*/

print("All MongoDB indexes successfully applied.");
printjson(db.investigation_documents.getIndexes());
