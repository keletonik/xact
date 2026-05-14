import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import db, { resetDB } from '../services/db';
import {
  planProductImport, applyProductImport,
  planSupplierPriceImport, applySupplierPriceImport,
  rollbackBatch,
} from './importPipeline';

const PRODUCT_ROWS = [
  { sku: 'SKU001', name: 'Smoke detector', category: 'material', unit: 'ea', price: '120.00' },
  { sku: 'SKU002', name: 'MCP red',         category: 'material', unit: 'ea', price: '95.50' },
  { sku: '',       name: 'Missing SKU',     category: 'material', unit: 'ea', price: '12.00' },
  { sku: 'SKU003', name: '',                category: 'material', unit: 'ea', price: '50.00' }, // invalid: no name
];

const PRODUCT_MAPPING = { sku: 'sku', name: 'name', category: 'category', unit: 'unit', basePrice: 'price' };

describe('importPipeline (product)', () => {
  beforeEach(async () => { await resetDB(); });
  afterEach(async () => { await resetDB(); });

  it('plans creates and flags invalid rows', async () => {
    const plan = await planProductImport(PRODUCT_ROWS, PRODUCT_MAPPING);
    expect(plan.summary.creates).toBe(3);
    expect(plan.summary.updates).toBe(0);
    expect(plan.summary.errors).toBe(1);
    expect(plan.errors[0].reason).toMatch(/name/i);
  });

  it('converts dollars to integer cents', async () => {
    const plan = await planProductImport(PRODUCT_ROWS, PRODUCT_MAPPING);
    expect(plan.creates[0].basePriceCents).toBe(12000);
    expect(plan.creates[1].basePriceCents).toBe(9550);
  });

  it('apply persists creates and records the batch', async () => {
    const plan = await planProductImport(PRODUCT_ROWS, PRODUCT_MAPPING);
    const batchId = await applyProductImport(plan);
    const stored = await db.products.toArray();
    expect(stored.length).toBe(3);
    const batch = await db.importBatches.get(batchId);
    expect(batch.kind).toBe('products');
    expect(batch.summary.creates).toBe(3);
  });

  it('matches updates by SKU on re-import (empty-SKU rows can never match)', async () => {
    await applyProductImport(await planProductImport(PRODUCT_ROWS, PRODUCT_MAPPING));
    const repeat = await planProductImport(PRODUCT_ROWS, PRODUCT_MAPPING);
    // SKU001 + SKU002 update; the empty-SKU row cannot match and creates again.
    expect(repeat.summary.updates).toBe(2);
    expect(repeat.summary.creates).toBe(1);
  });

  it('rollback removes created rows', async () => {
    const plan = await planProductImport(PRODUCT_ROWS, PRODUCT_MAPPING);
    const batchId = await applyProductImport(plan);
    await rollbackBatch(batchId);
    const stored = await db.products.toArray();
    expect(stored.length).toBe(0);
  });
});

describe('importPipeline (supplier prices)', () => {
  beforeEach(async () => { await resetDB(); });
  afterEach(async () => { await resetDB(); });

  const PRICE_ROWS = [
    { sku: 'SKU001', vendor: 'Acme Fire', price: '$110.00', moq: '5' },
    { sku: 'SKU002', vendor: 'Acme Fire', price: '$85.50',  moq: '1' },
    { sku: 'SKU999', vendor: 'Acme Fire', price: '$50.00' }, // unknown SKU -> error
  ];
  const PRICE_MAPPING = { sku: 'sku', supplierName: 'vendor', unitPrice: 'price', moq: 'moq' };

  it('creates supplier rows and price rows; flags unknown SKUs', async () => {
    // seed products first
    const productPlan = await planProductImport(PRODUCT_ROWS, PRODUCT_MAPPING);
    await applyProductImport(productPlan);

    const plan = await planSupplierPriceImport(PRICE_ROWS, PRICE_MAPPING);
    expect(plan.summary.prices).toBe(2);
    expect(plan.summary.suppliers).toBe(1);
    expect(plan.summary.errors).toBe(1);

    const batchId = await applySupplierPriceImport(plan);
    expect((await db.supplierPrices.toArray()).length).toBe(2);
    expect((await db.suppliers.toArray()).length).toBe(1);

    await rollbackBatch(batchId);
    expect((await db.supplierPrices.toArray()).length).toBe(0);
  });
});
