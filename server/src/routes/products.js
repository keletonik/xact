import { Hono } from 'hono';
import { v4 as uuid } from 'uuid';
import { eq, and } from 'drizzle-orm';
import { db, schema } from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';

export const productsRouter = new Hono();

productsRouter.use('*', requireAuth);

productsRouter.get('/', async (c) => {
  const { orgId } = c.get('user');
  const rows = await db.select().from(schema.products).where(eq(schema.products.orgId, orgId));
  return c.json(rows);
});

productsRouter.get('/:id', async (c) => {
  const { orgId } = c.get('user');
  const id = c.req.param('id');
  const [row] = await db.select().from(schema.products)
    .where(and(eq(schema.products.orgId, orgId), eq(schema.products.id, id)));
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

productsRouter.post('/', async (c) => {
  const { orgId, userId } = c.get('user');
  const body = await c.req.json();
  const now = new Date().toISOString();
  const product = {
    id: body.id || uuid(),
    orgId,
    sku: body.sku || null,
    name: body.name,
    description: body.description || null,
    category: body.category,
    unit: body.unit,
    brand: body.brand || null,
    model: body.model || null,
    manufacturer: body.manufacturer || null,
    datasheetUrl: body.datasheetUrl || null,
    hsCode: body.hsCode || null,
    gtin: body.gtin || null,
    basePriceCents: body.basePriceCents ?? 0,
    currency: body.currency || 'AUD',
    tags: body.tags || [],
    standards: body.standards || [],
    isCustom: body.isCustom ?? true,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(schema.products).values(product);
  await audit(orgId, userId, 'product_created', 'product', product.id);
  return c.json(product, 201);
});

productsRouter.put('/:id', async (c) => {
  const { orgId, userId } = c.get('user');
  const id = c.req.param('id');
  let patch;
  try { patch = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  // Pre-flight: confirm the row exists in this org. Without this check we'd
  // return 200 for any caller (including cross-org), leaking nothing but
  // claiming success and polluting the audit log with no-ops.
  const [existing] = await db.select().from(schema.products)
    .where(and(eq(schema.products.orgId, orgId), eq(schema.products.id, id)));
  if (!existing) return c.json({ error: 'Not found' }, 404);
  // Never let the caller flip orgId — strip it before writing.
  delete patch.orgId;
  delete patch.id;
  patch.updatedAt = new Date().toISOString();
  await db.update(schema.products).set(patch)
    .where(and(eq(schema.products.orgId, orgId), eq(schema.products.id, id)));
  await audit(orgId, userId, 'product_updated', 'product', id);
  return c.json({ id });
});

productsRouter.delete('/:id', async (c) => {
  const { orgId, userId } = c.get('user');
  const id = c.req.param('id');
  const [existing] = await db.select().from(schema.products)
    .where(and(eq(schema.products.orgId, orgId), eq(schema.products.id, id)));
  if (!existing) return c.json({ error: 'Not found' }, 404);
  await db.delete(schema.products)
    .where(and(eq(schema.products.orgId, orgId), eq(schema.products.id, id)));
  await audit(orgId, userId, 'product_deleted', 'product', id);
  return c.json({ id });
});

async function audit(orgId, userId, action, entityType, entityId) {
  await db.insert(schema.auditEntries).values({
    id: uuid(), orgId, userId, action, entityType, entityId,
    at: new Date().toISOString(),
  });
}
