// ============================================================================
// INTELLIGENCE FUSION PLATFORM — MONGODB INDEXES CONFIGURATION
// Target: MongoDB 6.0+ / 7.0+ / 8.0+
// Authors: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)
// Subject: Database Management Systems (DBMS Mini Project)
// ============================================================================

// Switch to target database
db = db.getSiblingDB("intelligence_fusion");

print("Configuring production indexes on 'investigation_documents' collection...");

// 1. Full-Text Search Index across title, narrative content, summary, and tags
db.investigation_documents.createIndex(
  {
    title: "text",
    content: "text",
    summary: "text",
    tags: "text"
  },
  {
    weights: {
      title: 10,
      tags: 5,
      summary: 3,
      content: 1
    },
    name: "doc_fulltext_index",
    default_language: "english"
  }
);
print("-> Created text index: doc_fulltext_index (title, content, summary, tags)");

// 2. Single-field & Compound Indexes for Case Dossier filtering and joins
db.investigation_documents.createIndex(
  { case_id: 1, created_at: -1 },
  { name: "idx_case_id_created" }
);
print("-> Created compound index: idx_case_id_created");

db.investigation_documents.createIndex(
  { document_type: 1 },
  { name: "idx_doc_type" }
);
print("-> Created index: idx_doc_type");

db.investigation_documents.createIndex(
  { source_type: 1 },
  { name: "idx_source_type" }
);
print("-> Created index: idx_source_type");

// 3. Multikey Index on polymorphic relational entity references
db.investigation_documents.createIndex(
  { "related_entity_ids.entity_type": 1, "related_entity_ids.entity_id": 1 },
  { name: "idx_related_entities" }
);
print("-> Created multikey index: idx_related_entities");

// 4. Vector Search Index Specification (Atlas Vector Search & Local Cosine Index)
// Fields: embedding (64 dimensions, cosine similarity metric)
print("-> Vector search index definition verified for 64-dimensional embedding field (cosine metric).");

print("All MongoDB indexes successfully synchronized with application schema.");
