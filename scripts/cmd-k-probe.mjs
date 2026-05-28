import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:5173';
const b = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
// click body first so keyboard goes there
await page.locator('body').click();
await page.waitForTimeout(100);

// what dialogs are in the dom right now?
const before = await page.locator('[role="dialog"]').count();
console.log('dialogs before keypress:', before);

// try every variant
for (const seq of ['Control+k', 'Control+K', 'Meta+k']) {
  await page.keyboard.press(seq);
  await page.waitForTimeout(500);
  const cnt = await page.locator('[role="dialog"]').count();
  const visible = await page.locator('[role="dialog"][aria-label="Command palette"]').isVisible().catch(() => false);
  console.log(seq, '-> dialogs=', cnt, 'palette visible=', visible);
  if (visible) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }
}
await b.close();
