// Renders scripts/og/og.html to public/og-image.jpg (1200x630).
// Needs playwright (or playwright-core with a Chromium path in CHROME).
import { chromium } from 'playwright-core';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ executablePath: process.env.CHROME });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(path.join(here, 'og.html')).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(here, '../../public/og-image.jpg'), type: 'jpeg', quality: 90 });
await browser.close();
console.log('wrote public/og-image.jpg');
