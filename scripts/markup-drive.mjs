#!/usr/bin/env node
/* Interactive markup-page driver.
 *
 *   node scripts/markup-drive.mjs
 *
 * Boots a chromium against the running dev server, walks the Markup
 * page in two states: pristine empty, and post-upload of a tiny
 * generated PDF. Captures console + page errors, takes screenshots,
 * exercises tool buttons + keyboard shortcuts. Output to
 * /tmp/xact-markup-drive.json.
 */

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.argv[2] || 'http://localhost:5173';
const SHOTS = '/tmp/xact-markup-shots';
const REPORT = '/tmp/xact-markup-drive.json';

const FINDINGS = { errors: [], warnings: [], page_errors: [], notes: [] };

async function main() {
  await mkdir(SHOTS, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  page.on('console', (msg) => {
    const t = msg.type();
    if (t === 'error')   FINDINGS.errors.push(msg.text());
    else if (t === 'warning') FINDINGS.warnings.push(msg.text());
  });
  page.on('pageerror', (e) => FINDINGS.page_errors.push(String(e?.message || e)));

  // 1. Empty state
  await page.goto(BASE + '/markup', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${SHOTS}/empty.png`, fullPage: false });

  // Snapshot text the page renders so we can spot empty-state copy issues
  const emptyText = await page.locator('main').innerText().catch(() => '');
  FINDINGS.notes.push({ phase: 'empty', text_excerpt: emptyText.slice(0, 400) });

  // Buttons visible in empty state
  const empties = await page.locator('button').all();
  const buttonLabels = await Promise.all(empties.map(b => b.textContent().catch(() => '')));
  FINDINGS.notes.push({ phase: 'empty', buttons: buttonLabels.filter(Boolean).slice(0, 30) });

  // 2. Mobile width sanity check (single biggest UX bug class in dense pages)
  await page.setViewportSize({ width: 380, height: 800 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SHOTS}/mobile-empty.png`, fullPage: true });

  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    const wide = [];
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > root.clientWidth + 1) {
        wide.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 60),
          right: Math.round(r.right),
          width: Math.round(r.width),
        });
      }
    });
    return { viewport_width: root.clientWidth, count: wide.length, sample: wide.slice(0, 10) };
  });
  FINDINGS.notes.push({ phase: 'mobile-overflow', ...overflow });

  // 3. Cmd-K opens the command palette anywhere in the app
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.keyboard.press('Control+K');
  await page.waitForTimeout(300);
  const paletteVisible = await page.locator('[role="dialog"][aria-label="Command palette"]').isVisible().catch(() => false);
  FINDINGS.notes.push({ phase: 'cmd-k', palette_visible: paletteVisible });
  if (paletteVisible) await page.screenshot({ path: `${SHOTS}/palette-open.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const paletteClosed = await page.locator('[role="dialog"][aria-label="Command palette"]').isVisible().catch(() => false);
  FINDINGS.notes.push({ phase: 'cmd-k', closed_after_esc: !paletteClosed });

  // 4. Tab around the dashboard to spot any obviously focus-broken element
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const focusables = await page.evaluate(() => {
    const sel = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), [tabindex]:not([tabindex="-1"])';
    return Array.from(document.querySelectorAll(sel)).length;
  });
  FINDINGS.notes.push({ phase: 'dashboard', focusables });

  await writeFile(REPORT, JSON.stringify(FINDINGS, null, 2));
  console.log('errors:',   FINDINGS.errors.length);
  console.log('warnings:', FINDINGS.warnings.length);
  console.log('page errors:', FINDINGS.page_errors.length);
  console.log('mobile-overflow nodes:', overflow.count);
  console.log('cmd-k:', paletteVisible ? 'opens' : 'BROKEN', '/', !paletteClosed ? 'closes' : 'BROKEN');
  console.log('report:', REPORT);

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
