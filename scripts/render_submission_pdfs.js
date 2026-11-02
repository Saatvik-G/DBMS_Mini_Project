// scripts/render_submission_pdfs.js
// Compiles all 11 HTML sources in docs/submission_html/ into publication-quality A4 PDFs in docs/submission/

import fs from 'fs';
import path from 'path';
import os from 'os';
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HTML_DIR = path.resolve(__dirname, '../docs/submission_html');
const SUBMISSION_DIR = path.resolve(__dirname, '../docs/submission');

os_ensure_dir(SUBMISSION_DIR);

function os_ensure_dir(d) {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const PDF_MAP = [
  { html: '01_ER_Diagram.html', pdf: '01_ER_Diagram.pdf' },
  { html: '02_Relational_Schema.html', pdf: '02_Relational_Schema.pdf' },
  { html: '03_SQL_DDL_Implementation.html', pdf: '03_SQL_DDL_Implementation.pdf' },
  { html: '04_NoSQL_Vector_Database_Creation.html', pdf: '04_NoSQL_Vector_Database_Creation.pdf' },
  { html: '05_Technology_Justification.html', pdf: '05_Technology_Justification.pdf' },
  { html: '06_DML_Operations.html', pdf: '06_DML_Operations.pdf' },
  { html: '07_Queries_Nested_Correlated_Recursive_Joins.html', pdf: '07_Queries_Nested_Correlated_Recursive_Joins.pdf' },
  { html: '08_Advanced_SQL_Procedure_Function_Trigger_CTE.html', pdf: '08_Advanced_SQL_Procedure_Function_Trigger_CTE.pdf' },
  { html: '09_NoSQL_Vector_Features_and_RUD.html', pdf: '09_NoSQL_Vector_Features_and_RUD.pdf' },
  { html: '10_Authentication_and_RBAC.html', pdf: '10_Authentication_and_RBAC.pdf' },
  { html: '11_Project_Report.html', pdf: '11_Project_Report.pdf' }
];

async function main() {
  console.log(`Connecting to Chrome at: ${chromePath}`);
  const tempUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-pdf-'));

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    userDataDir: tempUserDataDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  for (const item of PDF_MAP) {
    const htmlPath = path.join(HTML_DIR, item.html);
    const pdfPath = path.join(SUBMISSION_DIR, item.pdf);

    if (!fs.existsSync(htmlPath)) {
      console.warn(`HTML missing: ${htmlPath}`);
      continue;
    }

    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: ['load', 'networkidle0'] });

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 7.5pt; font-family: 'Times New Roman', serif; width: 100%; text-align: right; padding-right: 18mm; color: #64748b;">
          INTELLIGENCE FUSION PLATFORM — UE24CS395
        </div>`,
      footerTemplate: `
        <div style="font-size: 8pt; font-family: 'Times New Roman', serif; width: 100%; display: flex; justify-content: space-between; padding: 0 18mm; color: #475569;">
          <span>PES University • Dept of Computer Science and Engineering</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>`,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '18mm',
        right: '18mm'
      }
    });

    const stat = fs.statSync(pdfPath);
    console.log(`Rendered PDF: ${item.pdf} (${(stat.size / 1024).toFixed(1)} KB)`);
  }

  await browser.close();
  try {
    fs.rmSync(tempUserDataDir, { recursive: true, force: true });
  } catch (e) {}
  console.log('\nAll 11 Official Submission PDFs successfully generated in docs/submission/!');
}

main().catch(err => {
  console.error('Rendering error:', err);
  process.exit(1);
});
