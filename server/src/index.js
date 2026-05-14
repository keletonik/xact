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
 * For prod:
 *   - Set DATABASE_URL to a Postgres connection string and switch the driver
 *     in src/db/client.js to drizzle-orm/postgres-js.
 *   - Set JWT_SECRET to a 256-bit secret.
 *   - Set ALLOWED_ORIGIN to your frontend origin.
 *   - Put the binary behind a reverse proxy that terminates TLS.
 */
const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
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
