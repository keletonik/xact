import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { authRouter } from './routes/auth.js';
import { productsRouter } from './routes/products.js';

/**
 * Evalax API server (Hono + Drizzle + SQLite).
 *
 * For dev:
 *   cd server && npm install && npm run dev
 *
 * For prod (must set):
 *   JWT_SECRET        — at least 32 bytes from a CSPRNG
 *   ALLOWED_ORIGIN    — exact frontend origin(s), comma-separated
 *   DATABASE_URL      — Postgres URL (after swapping the driver)
 *   NODE_ENV=production
 */
const isProd = process.env.NODE_ENV === 'production';

// CORS allow-list. In production we never default to '*' — that would let any
// origin invoke the API with the user's bearer token. If ALLOWED_ORIGIN is
// unset in prod we hard-fail rather than ship a wildcard.
const rawOrigin = process.env.ALLOWED_ORIGIN;
if (isProd && (!rawOrigin || rawOrigin.trim() === '' || rawOrigin === '*')) {
  throw new Error(
    'ALLOWED_ORIGIN must be set to an explicit origin in production. ' +
    'Set it to the exact URL of the frontend, e.g. https://app.example.com.',
  );
}
const allowList = (rawOrigin || (isProd ? '' : 'http://localhost:5173,http://localhost:4173'))
  .split(',').map((s) => s.trim()).filter(Boolean);

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return ''; // same-origin / curl
    return allowList.includes(origin) ? origin : '';
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/', (c) => c.json({ service: 'evalax-api', status: 'ok', time: new Date().toISOString() }));
app.get('/healthz', (c) => c.json({ ok: true }));

app.route('/auth', authRouter);
app.route('/products', productsRouter);

const port = Number(process.env.PORT || 8787);

if (import.meta.url === `file://${process.argv[1]}`) {
  serve({ fetch: app.fetch, port }, ({ port }) => {
    console.log(`evalax-api listening on http://localhost:${port}`);
  });
}

export default app;
