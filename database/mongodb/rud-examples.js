// ============================================================================
// INTELLIGENCE FUSION PLATFORM — MONGODB RUD OPERATIONS & VECTOR AGGREGATIONS
// Target: MongoDB Shell (mongosh) / Node.js MongoDB Driver
// Authors: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)
// Subject: Database Management Systems (DBMS Mini Project - UE24CS395)
// ============================================================================

db = db.getSiblingDB("intelligence_fusion");

// ============================================================================
// 1. CREATE OPERATION (C) — With 64-Dimensional Semantic Embedding
// ============================================================================
print("--- 1. Insert New Intelligence Document with 64-Dim Vector ---");
const newDoc = {
  document_type: "Digital forensics report",
  title: "Cryptocurrency Hardware Ledger Forensic Analysis (Model T)",
  content: "Physical extraction of cold-storage hardware ledger recovered during raid at Residency Road. Pin-bypass firmware analysis recovered 12 seed words linking to illicit tumbling pools.",
  summary: "Forensic cold-wallet seed extraction revealing automated crypto tumbler routing.",
  source_type: "Lab Extraction",
  source_name: "CID Cyber Forensics Cell Lab 4",
  created_at: new Date(),
  ingested_at: new Date(),
  case_id: "CASE-2026-002",
  related_entity_ids: [
    { entity_type: "device", entity_id: "DEV-001" },
    { entity_type: "officer", entity_id: "OFF-001" }
  ],
  tags: ["cold wallet", "crypto tumbler", "ledger", "seed words", "firmware bypass"],
  metadata: { firmware_version: "2.4.1", extraction_tool: "Cellebrite UFED 7.6" },
  document_status: "Verified",
  // 64-dimensional normalized embedding vector (sample)
  embedding: [
    0.021, -0.145, 0.089, -0.034, 0.112, 0.005, -0.078, 0.201,
    -0.045, 0.012, 0.156, -0.098, 0.034, -0.123, 0.067, 0.043,
    0.012, -0.087, 0.045, 0.198, -0.023, 0.076, -0.111, 0.054,
    -0.065, 0.134, -0.021, 0.089, -0.045, 0.012, 0.078, -0.154,
    0.032, -0.098, 0.045, 0.121, -0.067, 0.043, -0.089, 0.167,
    -0.012, 0.054, -0.123, 0.045, 0.078, -0.034, 0.112, -0.087,
    0.054, -0.021, 0.098, -0.067, 0.034, -0.145, 0.021, 0.089,
    -0.045, 0.123, -0.078, 0.034, 0.056, -0.012, 0.089, -0.045
  ]
};

const insertRes = db.investigation_documents.insertOne(newDoc);
print("Insert status: " + insertRes.acknowledged + " | Inserted ID: " + insertRes.insertedId);


// ============================================================================
// 2. READ OPERATIONS (R)
// ============================================================================

// 2.1 Full-Text Search with Relevance Score Projection & Sorting
print("\n--- 2.1 Full-Text Search for 'crypto tumbler wallet' ---");
const searchResults = db.investigation_documents.find(
  { $text: { $search: "crypto tumbler wallet" } },
  { score: { $meta: "textScore" }, title: 1, document_type: 1, case_id: 1, tags: 1 }
).sort({ score: { $meta: "textScore" } }).limit(3);

printjson(searchResults.toArray());

// 2.2 Aggregation Pipeline: Distribution by Document Type with Linked Cases
print("\n--- 2.2 Aggregation: Intelligence Documents by Type & Case Breadth ---");
const categoryDistribution = db.investigation_documents.aggregate([
  {
    $group: {
      _id: "$document_type",
      total_documents: { $sum: 1 },
      distinct_cases: { $addToSet: "$case_id" },
      avg_tags_count: { $avg: { $size: { $ifNull: ["$tags", []] } } }
    }
  },
  {
    $project: {
      document_type: "$_id",
      total_documents: 1,
      total_linked_cases: { $size: "$distinct_cases" },
      avg_tags_count: { $round: ["$avg_tags_count", 1] }
    }
  },
  { $sort: { total_documents: -1 } }
]);

printjson(categoryDistribution.toArray());

// 2.3 Polymorphic Query: Documents referencing Officer OFF-001 or Device DEV-001
print("\n--- 2.3 Polymorphic Reference Lookup: Officer OFF-001 or Device DEV-001 ---");
const entityDocs = db.investigation_documents.find({
  $or: [
    { "related_entity_ids.entity_id": "OFF-001" },
    { "related_entity_ids.entity_id": "DEV-001" },
    { case_id: "CASE-2026-001" }
  ]
}, { title: 1, document_type: 1, case_id: 1, source_name: 1 }).limit(3);

printjson(entityDocs.toArray());


// ============================================================================
// 3. UPDATE OPERATIONS (U)
// ============================================================================

// 3.1 Update Document Metadata and Append Security Tags
print("\n--- 3.1 Updating Document Security Classification and Corroboration ---");
const updateResult = db.investigation_documents.updateOne(
  { title: "Cryptocurrency Hardware Ledger Forensic Analysis (Model T)" },
  {
    $set: {
      document_status: "Verified",
      "metadata.corroborated": true,
      "metadata.audit_officer": "OFF-001"
    },
    $addToSet: {
      tags: "court-admissible"
    }
  }
);
print("Matched: " + updateResult.matchedCount + " | Modified: " + updateResult.modifiedCount);


// ============================================================================
// 4. DELETE OPERATIONS (D)
// ============================================================================

// 4.1 Delete the demonstration exhibit document
print("\n--- 4.1 Deleting Demonstration Document ---");
const deleteResult = db.investigation_documents.deleteOne({
  title: "Cryptocurrency Hardware Ledger Forensic Analysis (Model T)"
});
print("Deleted Count: " + deleteResult.deletedCount);
