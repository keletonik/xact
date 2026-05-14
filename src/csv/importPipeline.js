import { v4 as uuid } from 'uuid';
import db from '../services/db';
import { dollarsToCents, productSchema, supplierPriceSchema, supplierSchema } from '../catalog/productSchema';
import { ITEM_CATEGORIES, UNITS } from '../utils/constants';

const CATEGORY_ALIASES = {
  material: ITEM_CATEGORIES.MATERIAL,
  materials: ITEM_CATEGORIES.MATERIAL,
  product: ITEM_CATEGORIES.MATERIAL,
  labour: ITEM_CATEGORIES.LABOUR,
  labor: ITEM_CATEGORIES.LABOUR,
  plant: ITEM_CATEGORIES.PLANT,
  equipment: ITEM_CATEGORIES.PLANT,
  subcontract: ITEM_CATEGORIES.SUBCONTRACT,
  subby: ITEM_CATEGORIES.SUBCONTRACT,
  permit: ITEM_CATEGORIES.PERMIT,
  fees: ITEM_CATEGORIES.PERMIT,
  preliminary: ITEM_CATEGORIES.PRELIMINARY,
  prelims: ITEM_CATEGORIES.PRELIMINARY,
};

const UNIT_ALIASES = {
  ea: UNITS.EACH, each: UNITS.EACH, no: UNITS.EACH, qty: UNITS.EACH, item: UNITS.EACH,
  m: UNITS.METRE, lm: UNITS.METRE, lin_m: UNITS.METRE, metre: UNITS.METRE, meter: UNITS.METRE,
  'm2': UNITS.SQ_METRE, sqm: UNITS.SQ_METRE, sq_m: UNITS.SQ_METRE, 'm^2': UNITS.SQ_METRE,
  'm3': UNITS.CU_METRE, cum: UNITS.CU_METRE, cu_m: UNITS.CU_METRE, 'm^3': UNITS.CU_METRE,
  hr: UNITS.HOUR, hour: UNITS.HOUR, hrs: UNITS.HOUR,
  day: UNITS.DAY, days: UNITS.DAY,
  lot: UNITS.LOT, set: UNITS.SET, roll: UNITS.ROLL, length: UNITS.LENGTH, pair: UNITS.PAIR,
  kg: UNITS.KG, l: UNITS.LITRE, lt: UNITS.LITRE,
};

function normaliseCategory(input) {
  if (!input) return ITEM_CATEGORIES.MATERIAL;
  const key = String(input).toLowerCase().trim();
  return CATEGORY_ALIASES[key] ?? ITEM_CATEGORIES.MATERIAL;
}

function normaliseUnit(input) {
  if (!input) return UNITS.EACH;
  const key = String(input).toLowerCase().trim().replace(/\s+/g, '_');
  return UNIT_ALIASES[key] ?? UNITS.EACH;
}

function pick(row, mapping, key) {
  const header = mapping[key];
  if (!header) return undefined;
  const value = row[header];
  if (value == null) return undefined;
  return String(value).trim();
}

/**
 * Build a dry-run plan from parsed CSV rows + a column mapping.
 * Does not write to the database. Returns { creates, updates, errors, summary }.
 */
export async function planProductImport(rows, mapping) {
  const errors = [];
  const creates = [];
  const updates = [];
  const existing = await db.products.toArray();
  const bySku = new Map(existing.filter((p) => p.sku).map((p) => [p.sku.toLowerCase(), p]));

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const sku = pick(r, mapping, 'sku') || '';
    const name = pick(r, mapping, 'name');
    if (!name) {
      errors.push({ row: i + 2, reason: 'Missing product name' });
      continue;
    }
    const draft = {
      id: uuid(),
      sku,
      name,
      description: '',
      category: normaliseCategory(pick(r, mapping, 'category')),
      unit: normaliseUnit(pick(r, mapping, 'unit')),
      brand: pick(r, mapping, 'brand') || '',
      model: pick(r, mapping, 'model') || '',
      manufacturer: pick(r, mapping, 'manufacturer') || '',
      datasheetUrl: pick(r, mapping, 'datasheetUrl') || '',
      gtin: pick(r, mapping, 'gtin') || '',
      hsCode: '',
      basePriceCents: dollarsToCents(pick(r, mapping, 'basePrice')),
      currency: (pick(r, mapping, 'currency') || 'AUD').toUpperCase(),
      tags: [],
      standards: [],
      isCustom: true,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = productSchema.safeParse(draft);
    if (!result.success) {
      errors.push({ row: i + 2, reason: result.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ') });
      continue;
    }

    const matchKey = sku.toLowerCase();
    const match = matchKey ? bySku.get(matchKey) : null;
    if (match) {
      updates.push({ existing: match, draft: { ...result.data, id: match.id, isCustom: match.isCustom } });
    } else {
      creates.push(result.data);
    }
  }
  return {
    creates,
    updates,
    errors,
    summary: { rows: rows.length, creates: creates.length, updates: updates.length, errors: errors.length },
  };
}

/**
 * Apply a previously-built plan in a single transaction. Returns the batch id.
 */
export async function applyProductImport(plan) {
  const batchId = uuid();
  await db.transaction('rw', db.products, db.importBatches, async () => {
    if (plan.creates.length > 0) await db.products.bulkPut(plan.creates);
    if (plan.updates.length > 0) {
      await db.products.bulkPut(plan.updates.map((u) => ({ ...u.draft, basePriceCents: u.draft.basePriceCents })));
    }
    await db.importBatches.put({
      id: batchId,
      kind: 'products',
      importedAt: new Date().toISOString(),
      summary: plan.summary,
      createdIds: plan.creates.map((c) => c.id),
      updatedIds: plan.updates.map((u) => u.existing.id),
    });
  });
  return batchId;
}

/**
 * Plan a supplier-price import. Auto-creates suppliers that don't yet exist.
 */
export async function planSupplierPriceImport(rows, mapping) {
  const errors = [];
  const priceCreates = [];
  const supplierCreates = [];

  const products = await db.products.toArray();
  const suppliers = await db.suppliers.toArray();
  const bySku = new Map(products.filter((p) => p.sku).map((p) => [p.sku.toLowerCase(), p]));
  const bySupplier = new Map(suppliers.map((s) => [s.name.toLowerCase(), s]));

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const sku = (pick(r, mapping, 'sku') || '').toLowerCase();
    const supplierName = pick(r, mapping, 'supplierName');
    if (!sku) { errors.push({ row: i + 2, reason: 'Missing SKU' }); continue; }
    if (!supplierName) { errors.push({ row: i + 2, reason: 'Missing supplier name' }); continue; }
    const product = bySku.get(sku);
    if (!product) { errors.push({ row: i + 2, reason: `No matching product for SKU "${sku}"` }); continue; }

    let supplier = bySupplier.get(supplierName.toLowerCase());
    if (!supplier) {
      supplier = supplierSchema.parse({
        id: uuid(),
        name: supplierName,
      });
      bySupplier.set(supplierName.toLowerCase(), supplier);
      supplierCreates.push(supplier);
    }

    const priceDraft = {
      id: uuid(),
      productId: product.id,
      supplierId: supplier.id,
      supplierSku: pick(r, mapping, 'supplierSku') || '',
      unitPriceCents: dollarsToCents(pick(r, mapping, 'unitPrice')),
      currency: (pick(r, mapping, 'currency') || supplier.currency || 'AUD').toUpperCase(),
      fxRateToAUD: 1,
      moq: Number.parseInt(pick(r, mapping, 'moq') || '1', 10) || 1,
      packSize: Number.parseInt(pick(r, mapping, 'packSize') || '1', 10) || 1,
      freightCents: dollarsToCents(pick(r, mapping, 'freight')),
      leadTimeDays: Number.parseInt(pick(r, mapping, 'leadTimeDays') || '0', 10) || 0,
      effectiveFrom: parseDate(pick(r, mapping, 'effectiveFrom')) || new Date().toISOString(),
      effectiveTo: null,
      sourceUrl: pick(r, mapping, 'sourceUrl') || '',
      isPreferred: false,
    };

    const parsed = supplierPriceSchema.safeParse(priceDraft);
    if (!parsed.success) {
      errors.push({ row: i + 2, reason: parsed.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ') });
      continue;
    }
    priceCreates.push(parsed.data);
  }

  return {
    priceCreates,
    supplierCreates,
    errors,
    summary: { rows: rows.length, prices: priceCreates.length, suppliers: supplierCreates.length, errors: errors.length },
  };
}

export async function applySupplierPriceImport(plan) {
  const batchId = uuid();
  await db.transaction('rw', db.suppliers, db.supplierPrices, db.importBatches, async () => {
    if (plan.supplierCreates.length > 0) await db.suppliers.bulkPut(plan.supplierCreates);
    if (plan.priceCreates.length > 0) {
      const stamped = plan.priceCreates.map((p) => ({ ...p, importBatchId: batchId }));
      await db.supplierPrices.bulkPut(stamped);
    }
    await db.importBatches.put({
      id: batchId,
      kind: 'supplier_prices',
      importedAt: new Date().toISOString(),
      summary: plan.summary,
    });
  });
  return batchId;
}

function parseDate(input) {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** Roll back an import batch by deleting everything inserted under it. */
export async function rollbackBatch(batchId) {
  const batch = await db.importBatches.get(batchId);
  if (!batch) throw new Error('Import batch not found');
  await db.transaction('rw', db.products, db.supplierPrices, db.suppliers, db.importBatches, async () => {
    if (batch.kind === 'products' && batch.createdIds) {
      await db.products.bulkDelete(batch.createdIds);
    }
    if (batch.kind === 'supplier_prices') {
      const prices = await db.supplierPrices.where('importBatchId').equals(batchId).toArray();
      await db.supplierPrices.bulkDelete(prices.map((p) => p.id));
    }
    await db.importBatches.delete(batchId);
  });
}
