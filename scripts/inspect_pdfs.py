#!/usr/bin/env python3
"""
inspect_pdfs.py
Uses pypdfium2 to inspect all 11 generated submission PDFs:
1. Validates page count of each PDF (verifying 05_Technology_Justification.pdf <= 2 pages)
2. Renders every single page to high-res PNG in docs/submission/inspection/
3. Analyzes pixel brightness / content to ensure zero blank pages exist
"""

import os
import pypdfium2 as pdfium
from PIL import Image

SUBMISSION_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "submission"))
INSPECTION_DIR = os.path.join(SUBMISSION_DIR, "inspection")
os.makedirs(INSPECTION_DIR, exist_ok=True)

PDF_FILES = [
    "01_ER_Diagram.pdf",
    "02_Relational_Schema.pdf",
    "03_SQL_DDL_Implementation.pdf",
    "04_NoSQL_Vector_Database_Creation.pdf",
    "05_Technology_Justification.pdf",
    "06_DML_Operations.pdf",
    "07_Queries_Nested_Correlated_Recursive_Joins.pdf",
    "08_Advanced_SQL_Procedure_Function_Trigger_CTE.pdf",
    "09_NoSQL_Vector_Features_and_RUD.pdf",
    "10_Authentication_and_RBAC.pdf",
    "11_Project_Report.pdf"
]

def main():
    print("=" * 70)
    print("  SUBMISSION PDF INSPECTION & PAGE-BY-PAGE VERIFICATION")
    print("=" * 70)

    total_pages_all = 0
    inspection_report = []

    for fname in PDF_FILES:
        fpath = os.path.join(SUBMISSION_DIR, fname)
        if not os.path.exists(fpath):
            print(f"[ERROR] Missing PDF: {fname}")
            continue

        pdf = pdfium.PdfDocument(fpath)
        num_pages = len(pdf)
        total_pages_all += num_pages

        base_name = os.path.splitext(fname)[0]
        page_statuses = []

        for p_idx in range(num_pages):
            page = pdf[p_idx]
            # Render at 150 DPI for inspection
            img = page.render(scale=2.083).to_pil()
            img_name = f"{base_name}_page_{p_idx + 1}.png"
            img_path = os.path.join(INSPECTION_DIR, img_name)
            img.save(img_path)

            # Check if page is blank (all white pixels)
            extrema = img.convert("L").getextrema()
            is_blank = (extrema[0] == 255 and extrema[1] == 255)
            status = "BLANK" if is_blank else f"OK ({img.size[0]}x{img.size[1]}px)"
            page_statuses.append((p_idx + 1, status, is_blank))

        is_tech_just = (fname == "05_Technology_Justification.pdf")
        length_ok = (num_pages <= 2) if is_tech_just else True

        blank_count = sum(1 for p in page_statuses if p[2])

        inspection_report.append({
            "name": fname,
            "pages": num_pages,
            "length_ok": length_ok,
            "blank_count": blank_count,
            "size_kb": os.path.getsize(fpath) / 1024
        })

        flag_str = "[PASS]" if (length_ok and blank_count == 0) else "[FLAG]"
        print(f"{flag_str} {fname:48} | {num_pages} pages | {os.path.getsize(fpath)/1024:7.1f} KB")

    print("=" * 70)
    print(f"Total PDFs Checked: {len(PDF_FILES)} | Total Pages Rendered: {total_pages_all}")
    print(f"Inspection PNGs saved to: {INSPECTION_DIR}")
    print("=" * 70)

    # Check 05 specifically
    tj = next(r for r in inspection_report if r["name"] == "05_Technology_Justification.pdf")
    if tj["pages"] <= 2:
        print(f"[VERIFIED] 05_Technology_Justification.pdf is strictly <= 2 pages ({tj['pages']} pages).")
    else:
        print(f"[WARNING] 05_Technology_Justification.pdf exceeded 2 pages ({tj['pages']} pages)!")

if __name__ == "__main__":
    main()
