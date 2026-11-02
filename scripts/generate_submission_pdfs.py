#!/usr/bin/env python3
"""
generate_submission_pdfs.py
Entrypoint runner to extract schema truth, generate all diagrams, verify relational diagrams,
compile HTML sources, and render official submission PDFs.
"""

import os
import sys
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
EXTRACT_SCHEMA_SCRIPT = os.path.join(SCRIPT_DIR, "diagrams", "extract_schema.py")
RELATIONAL_DIAGRAMS_SCRIPT = os.path.join(SCRIPT_DIR, "diagrams", "generate_relational_schema_diagrams.py")
VERIFY_DIAGRAMS_SCRIPT = os.path.join(SCRIPT_DIR, "diagrams", "verify_relational_diagrams.py")
ALL_DIAGRAMS_SCRIPT = os.path.join(SCRIPT_DIR, "diagrams", "generate_all_diagrams.py")
RENDER_PNGS_SCRIPT = os.path.join(SCRIPT_DIR, "diagrams", "render_pngs.js")
HTML_GEN_SCRIPT = os.path.join(SCRIPT_DIR, "generate_academic_pdfs.py")
RENDER_PDFS_SCRIPT = os.path.join(SCRIPT_DIR, "render_submission_pdfs.js")
INSPECT_PDFS_SCRIPT = os.path.join(SCRIPT_DIR, "inspect_pdfs.py")

def main():
    print("=" * 70)
    print("  INTELLIGENCE FUSION PLATFORM - DELIVERABLE BUILD PIPELINE")
    print("=" * 70)

    # 1. Extract Ground Truth Schema JSON
    print("\n[Step 1/6] Extracting Ground Truth schema.json (22 Tables, 141 Cols, 31 FKs)...")
    subprocess.run([sys.executable, EXTRACT_SCHEMA_SCRIPT], check=True)

    # 2. Generate Relational Schema Diagrams with Explicit Port Connections
    print("\n[Step 2/6] Generating Academic Relational Schema SVGs (Full + 4 Clusters)...")
    subprocess.run([sys.executable, RELATIONAL_DIAGRAMS_SCRIPT], check=True)

    # 3. Verify Relational Schema Diagrams
    print("\n[Step 3/6] Automated Verification of Relational Schema Diagrams...")
    subprocess.run([sys.executable, VERIFY_DIAGRAMS_SCRIPT], check=True)

    # Also generate other domain diagrams (Chen, Crowsfoot, Architecture, Flowcharts)
    print("\n[Additional] Generating Conceptual Chen, Polyglot, and Process Flow Diagrams...")
    subprocess.run([sys.executable, ALL_DIAGRAMS_SCRIPT], check=True)

    # 4. Render 300 DPI PNG Diagrams via Puppeteer
    print("\n[Step 4/6] Rasterizing 300 DPI Diagram PNGs via Puppeteer...")
    subprocess.run(["node", RENDER_PNGS_SCRIPT], check=True)

    # 5. Generate Academic HTML Deliverables
    print("\n[Step 5/6] Generating Academic HTML Sources (A4 Academic Layout)...")
    subprocess.run([sys.executable, HTML_GEN_SCRIPT], check=True)

    # 6. Compile Official Submission PDFs
    print("\n[Step 6/6] Compiling 11 Publication-Grade PDFs in docs/submission/...")
    subprocess.run(["node", RENDER_PDFS_SCRIPT], check=True)

    print("\n" + "=" * 70)
    print("  ALL 21 DIAGRAMS AND 11 SUBMISSION PDFS SUCCESSFULLY GENERATED!")
    print("=" * 70)

if __name__ == "__main__":
    main()
