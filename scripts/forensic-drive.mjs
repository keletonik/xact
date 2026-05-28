#!/usr/bin/env node
/* Forensic driver. Boots a headless chromium against the running
 * Vite dev server, walks every route, captures every console
 * message (errors AND warnings AND unhandled rejections), and dumps
 * a structured report to /tmp/xact-forensic.json plus one screenshot
 * per route into /tmp/xact-shots/.
 *
 *   node scripts/forensic-drive.mjs [baseUrl]
 *
 * baseUrl defaults to http://localhost:5173.
 */

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.argv[2] || 'http://localhost:5173';
const SHOTS_DIR = '/tmp/xact-shots';
const REPORT = '/tmp/xact-forensic.json';

const ROUTES = [
  { path: '/', name: 'dashboard' },
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' },
  { path: '/forgot-password', name: 'forgot-password' },
  { path: '/opportunities', name: 'opportunities' },
  { path: '/projects', name: 'projects' },
  { path: '/takeoff', name: 'takeoff' },
  { path: '/markup', name: 'markup' },
  { path: '/catalog', name: 'catalog' },
  { path: '/servicing', name: 'servicing' },
  { path: '/quick-estimate', name: 'quick-estimate' },
  { path: '/estimates', name: 'estimates' },
  { path: '/proposals', name: 'proposals' },
  { path: '/price-book', name: 'price-book' },
  { path: '/vendors', name: 'vendors' },
  { path: '/reports', name: 'reports' },
  { path: '/admin', name: 'admin' },
  { path: '/settings', name: 'settings' },
  { path: '/notifications', name: 'notifications' },
  { path: '/help', name: 'help' },
  { path: '/profile', name: 'profile' },
];

async function main() {
  await mkdir(SHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();

  const report = { base: BASE, routes: {} };
  const sawAtAll = { errors: [], warnings: [] };

  for (const r of ROUTES) {
    const buckets = { errors: [], warnings: [], page_errors: [], failed_requests: [] };
    const handlerC = (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') buckets.errors.push(text);
      else if (type === 'warning') buckets.warnings.push(text);
    };
    const handlerP = (err) => buckets.page_errors.push(String(err && err.message || err));
    const handlerF = (req) =>
      buckets.failed_requests.push(`${req.method()} ${req.url()} ${req.failure()?.errorText}`);

    page.on('console', handlerC);
    page.on('pageerror', handlerP);
    page.on('requestfailed', handlerF);

    let nav_ok = true, nav_status = 0;
    try {
      const resp = await page.goto(BASE + r.path, { waitUntil: 'networkidle', timeout: 15000 });
      nav_status = resp ? resp.status() : 0;
    } catch (e) {
      nav_ok = false;
      buckets.errors.push('navigation: ' + String(e && e.message || e));
    }

    // Settle a beat for lazy chunks and useEffect cascades
    await page.waitForTimeout(800);

    const title = await page.title().catch(() => '');
    const url = page.url();

    const shot = `${SHOTS_DIR}/${r.name}.png`;
    try {
      await page.screenshot({ path: shot, fullPage: false });
    } catch (e) { /* fail open */ }

    report.routes[r.name] = {
      path: r.path,
      nav_ok,
      nav_status,
      title,
      final_url: url,
      console_errors: buckets.errors,
      console_warnings: buckets.warnings,
      page_errors: buckets.page_errors,
      failed_requests: buckets.failed_requests,
      screenshot: shot,
    };
    sawAtAll.errors.push(...buckets.errors.map(s => ({ route: r.name, msg: s })));
    sawAtAll.warnings.push(...buckets.warnings.map(s => ({ route: r.name, msg: s })));

    page.off('console', handlerC);
    page.off('pageerror', handlerP);
    page.off('requestfailed', handlerF);
  }

  report.summary = {
    routes_visited: Object.keys(report.routes).length,
    total_console_errors: sawAtAll.errors.length,
    total_console_warnings: sawAtAll.warnings.length,
    routes_with_errors: Object.entries(report.routes)
      .filter(([, v]) => v.console_errors.length > 0 || v.page_errors.length > 0)
      .map(([k]) => k),
  };

  await writeFile(REPORT, JSON.stringify(report, null, 2));
  console.log('Wrote', REPORT);
  console.log('Routes with errors:', report.summary.routes_with_errors.join(', ') || '(none)');
  console.log('Total console errors:', report.summary.total_console_errors);
  console.log('Total console warnings:', report.summary.total_console_warnings);

  await browser.close();
}

main().catch((e) => {
  console.error('forensic-drive failed:', e);
  process.exit(1);
});
