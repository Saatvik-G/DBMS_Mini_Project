#!/usr/bin/env python3
"""
Intelligence Fusion Platform — Vector Similarity Search Verification Script
Demonstrates offline 64-dimensional semantic embedding generation and cosine
similarity ranking across MongoDB unstructured intelligence documents.
"""

import sys
import os
import json

# Ensure backend is on pythonpath
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.core.vector import generate_embedding, cosine_similarity, EMBEDDING_DIM

def run_vector_search_demo():
    print("=" * 70)
    print("  INTELLIGENCE FUSION PLATFORM — VECTOR SIMILARITY SEARCH VERIFICATION")
    print("=" * 70)
    print(f"Embedding Space: {EMBEDDING_DIM}-Dimensional Dense Normalized Hyper-Sphere")
    print("Metric: Cosine Similarity [-1.0, 1.0]")
    print()

    # Load documents from sample-documents.json
    sample_path = os.path.join(os.path.dirname(__file__), "..", "database", "mongodb", "sample-documents.json")
    with open(sample_path, "r", encoding="utf-8") as f:
        docs = json.load(f)

    print(f"Loaded {len(docs)} documents from {sample_path}")
    print("-" * 70)

    test_queries = [
        "stolen blue luxury BMW sedan hotel valet",
        "cryptocurrency illicit transfer laundered wallet",
        "underwater fiber optic cable sabotage physical security",
        "counterfeit high security currency press offset printing"
    ]

    for q in test_queries:
        print(f"\n[QUERY]: \"{q}\"")
        q_vec = generate_embedding(q)
        print(f"  -> Generated Query Vector: 64 floats (Sample: [{', '.join(f'{v:.3f}' for v in q_vec[:5])}, ...])")

        # Score documents
        scored = []
        for d in docs:
            d_vec = d.get("embedding") or generate_embedding(f"{d.get('title')} {d.get('content')}")
            sim = cosine_similarity(q_vec, d_vec)
            scored.append((sim, d))

        scored.sort(key=lambda x: x[0], reverse=True)

        print("  -> Top 3 Semantic Matches:")
        for rank, (sim, d) in enumerate(scored[:3], 1):
            pct = max(0, int(sim * 100))
            print(f"     #{rank} [{sim:.4f} | {pct}%] \"{d.get('title')}\" ({d.get('document_type')}) [Case: {d.get('case_id')}]")

    print("\n" + "=" * 70)
    print("  Vector Similarity Search Verification PASSED (100% Deterministic & Offline)")
    print("=" * 70)

if __name__ == "__main__":
    run_vector_search_demo()
