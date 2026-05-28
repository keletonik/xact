#!/usr/bin/env node
/* Open the Projects page, click New Project, verify the modal renders
 * an opaque panel with a visible backdrop. Reports computed
 * background-color values so we can prove the token aliases resolved.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.argv[2] || 'http://localhost:5173';
const SHOTS = '/tmp/xact-modal-shots';
await mkdir(SHOTS, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(String(e?.message || e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

await page.goto(BASE + '/projects', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.screenshot({ path: `${SHOTS}/projects-before.png` });

// Click the New Project button (top-right CTA on the screenshot).
const trigger = page.getByRole('button', { name: /new project/i }).first();
await trigger.click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${SHOTS}/modal-open.png` });

// Probe computed styles
const probe = await page.evaluate(() => {
  const dialog = document.querySelector('[role="dialog"]');
  if (!dialog) return { found: false };
  const backdrop = dialog.parentElement;
  const ds = getComputedStyle(dialog);
  const bs = getComputedStyle(backdrop);
  return {
    found: true,
    dialog: {
      bg: ds.backgroundColor,
      border: ds.border,
      boxShadow: ds.boxShadow,
      borderRadius: ds.borderRadius,
      width: dialog.getBoundingClientRect().width,
    },
    backdrop: {
      bg: bs.backgroundColor,
      position: bs.position,
      zIndex: bs.zIndex,
    },
  };
});
await writeFile('/tmp/xact-modal-probe.json', JSON.stringify({ probe, errors }, null, 2));
console.log(JSON.stringify(probe, null, 2));
console.log('errors:', errors.length);

await browser.close();
