#!/usr/bin/env python3
"""
generate_submission_pdfs.py
Entrypoint runner to generate all diagrams, HTML sources, and official submission PDFs.
"""

import os
import sys
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DIAGRAMS_SCRIPT = os.path.join(SCRIPT_DIR, "diagrams", "generate_all_diagrams.py")
RENDER_PNGS_SCRIPT = os.path.join(SCRIPT_DIR, "diagrams", "render_pngs.js")
HTML_GEN_SCRIPT = os.path.join(SCRIPT_DIR, "generate_academic_pdfs.py")
RENDER_PDFS_SCRIPT = os.path.join(SCRIPT_DIR, "render_submission_pdfs.js")

def main():
    print("=" * 70)
    print("  INTELLIGENCE FUSION PLATFORM - DELIVERABLE BUILD PIPELINE")
    print("=" * 70)

    # 1. Generate Vector SVGs
    print("\n[Step 1/4] Generating Academic Vector SVGs...")
    subprocess.run([sys.executable, DIAGRAMS_SCRIPT], check=True)

    # 2. Render 300 DPI PNG Diagrams
    print("\n[Step 2/4] Rasterizing 300 DPI Diagram PNGs via Puppeteer...")
    subprocess.run(["node", RENDER_PNGS_SCRIPT], check=True)

    # 3. Generate Academic HTML Deliverables
    print("\n[Step 3/4] Generating Academic HTML Sources (A4 Academic Layout)...")
    subprocess.run([sys.executable, HTML_GEN_SCRIPT], check=True)

    # 4. Compile Official Submission PDFs
    print("\n[Step 4/4] Compiling 11 Publication-Grade PDFs in docs/submission/...")
    subprocess.run(["node", RENDER_PDFS_SCRIPT], check=True)

    print("\n" + "=" * 70)
    print("  ALL 16 DIAGRAMS AND 11 SUBMISSION PDFS SUCCESSFULLY GENERATED!")
    print("=" * 70)

if __name__ == "__main__":
    main()
