// ============================================================================
// INTELLIGENCE FUSION PLATFORM — MONGODB RUD OPERATIONS & AGGREGATIONS
// Target: MongoDB Shell (mongosh)
// Authors: Saatvik Gupta (PES1UG24CS395) & Satyam Goyal (PES1UG24CS424)
// Subject: Database Management Systems (DBMS Mini Project)
// ============================================================================

db = db.getSiblingDB("intelligence_fusion");

// ============================================================================
// 1. READ OPERATIONS (R)
// ============================================================================

// 1.1 Full-Text Search with Relevance Score Projection & Sorting
print("--- 1.1 Full-Text Search for 'crypto transaction offshore' ---");
const searchResults = db.investigation_documents.find(
  { $text: { $search: "crypto transaction offshore" } },
  { score: { $meta: "textScore" }, title: 1, doc_type: 1, classification: 1, tags: 1 }
).sort({ score: { $meta: "textScore" } }).limit(5);

printjson(searchResults.toArray());

// 1.2 Aggregation Pipeline: Document Count and Distribution by Category per Case
print("--- 1.2 Aggregation: Document Category Distribution ---");
const categoryDistribution = db.investigation_documents.aggregate([
  {
    $group: {
      _id: "$doc_type",
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

// 1.3 Polymorphic Query: Fetch forensic evidence linked specifically to PERSON #1
print("--- 1.3 Documents Linked to Person #1 ---");
const personDocuments = db.investigation_documents.find({
  $or: [
    { entity_type: "PERSON", entity_id: 1 },
    { tags: { $in: ["suspect", "vikram_singh"] } }
  ]
}, { title: 1, doc_type: 1, classification: 1, created_at: 1 });

printjson(personDocuments.toArray());


// ============================================================================
// 2. UPDATE OPERATIONS (U)
// ============================================================================

// 2.1 Update Document Metadata and Append Security Tags
print("--- 2.1 Updating Document Tags and Classification ---");
const updateResult = db.investigation_documents.updateOne(
  { case_id: 1, doc_type: "WITNESS_STATEMENT" },
  {
    $set: {
      classification: "TOP_SECRET",
      "metadata.corroborated": true,
      updated_at: new Date()
    },
    $addToSet: {
      tags: "viva_verified_exhibit"
    }
  }
);
printjson(updateResult);

// 2.2 Bulk Increment of Review Count inside Dynamic Metadata
db.investigation_documents.updateMany(
  { case_id: 1 },
  {
    $inc: { "metadata.review_access_count": 1 },
    $currentDate: { updated_at: true }
  }
);


// ============================================================================
// 3. DELETE OPERATIONS (D)
// ============================================================================

// 3.1 Targeted Document Removal by Object ID or Case ID filter
print("--- 3.1 Removing Archival Draft Document ---");
const deleteResult = db.investigation_documents.deleteOne({
  title: /TEST_DRAFT_DO_NOT_FILE/i
});
printjson(deleteResult);


// ============================================================================
// 4. VECTOR SEARCH AGGREGATION PIPELINE (ATLAS COMPLIANT)
// ============================================================================

/*
  In MongoDB Atlas with an active Vector Search index:
  
  db.investigation_documents.aggregate([
    {
      $vectorSearch: {
        index: "vector_index_intelligence",
        path: "vector_embedding",
        queryVector: [0.021, -0.043, 0.089, ...], // 384-dimensional dense vector
        numCandidates: 50,
        limit: 5,
        filter: {
          classification: { $in: ["CONFIDENTIAL", "SECRET"] }
        }
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        doc_type: 1,
        content_text: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ]);
*/
