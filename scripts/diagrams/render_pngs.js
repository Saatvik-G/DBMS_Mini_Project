// scripts/diagrams/render_pngs.js
// Rasterizes all SVGs in docs/diagrams/ into high-resolution 300 DPI PNGs using Puppeteer & Chrome.

import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIAGRAMS_DIR = path.resolve(__dirname, '../../docs/diagrams');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  console.log(`Scanning SVGs in: ${DIAGRAMS_DIR}`);
  const files = fs.readdirSync(DIAGRAMS_DIR).filter(f => f.endsWith('.svg'));
  console.log(`Found ${files.length} SVGs to rasterize to 300 DPI PNG.`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    userDataDir: path.resolve(__dirname, '../../.chrome-diagrams-prof'),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  for (const file of files) {
    const svgPath = path.join(DIAGRAMS_DIR, file);
    const pngPath = path.join(DIAGRAMS_DIR, file.replace('.svg', '.png'));

    const svgContent = fs.readFileSync(svgPath, 'utf8');

    // Extract viewBox or width/height
    const widthMatch = svgContent.match(/width="(\d+)"/);
    const heightMatch = svgContent.match(/height="(\d+)"/);
    const width = widthMatch ? parseInt(widthMatch[1], 10) : 1200;
    const height = heightMatch ? parseInt(heightMatch[1], 10) : 800;

    // 300 DPI = deviceScaleFactor 3.125 (300 / 96)
    await page.setViewport({
      width: width,
      height: height,
      deviceScaleFactor: 3.125
    });

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #ffffff; }
    svg { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

    await page.setContent(html, { waitUntil: 'load' });
    await page.screenshot({
      path: pngPath,
      type: 'png',
      omitBackground: false
    });

    const stat = fs.statSync(pngPath);
    console.log(`Rendered: ${path.basename(pngPath)} (${width * 3.125}x${height * 3.125} px, ${(stat.size / 1024).toFixed(1)} KB)`);
  }

  await browser.close();
  console.log('All PNG diagrams rendered at 300 DPI successfully!');
}

main().catch(err => {
  console.error('Rasterization error:', err);
  process.exit(1);
});
