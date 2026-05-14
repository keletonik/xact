import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import db from '../services/db';
import { productSchema, dollarsToCents } from '../catalog/productSchema';
import { bestSupplierPrice, compareSuppliers } from '../catalog/supplierPricing';
import useAuditStore from './useAuditStore';

/**
 * Custom-product catalog backed by Dexie.
 *
 * The built-in starter packs live in src/domain/*, exposed through
 * usePriceBookStore. This store holds *user-defined* products and assemblies
 * (CSV-imported or manually authored).
 */
const useCatalogStore = create((set, get) => ({
  products: [],
  suppliers: [],
  supplierPrices: [],
  ready: false,

  async hydrate() {
    const [products, suppliers, supplierPrices] = await Promise.all([
      db.products.toArray(),
      db.suppliers.toArray(),
      db.supplierPrices.toArray(),
    ]);
    set({ products, suppliers, supplierPrices, ready: true });
  },

  async addProduct(input) {
    const draft = {
      id: input.id || uuid(),
      sku: input.sku || '',
      name: input.name,
      description: input.description || '',
      category: input.category,
      unit: input.unit,
      brand: input.brand || '',
      model: input.model || '',
      manufacturer: input.manufacturer || '',
      datasheetUrl: input.datasheetUrl || '',
      hsCode: input.hsCode || '',
      gtin: input.gtin || '',
      basePriceCents: input.basePriceCents ?? dollarsToCents(input.basePrice),
      currency: input.currency || 'AUD',
      tags: input.tags || [],
      standards: input.standards || [],
      isCustom: true,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const product = productSchema.parse(draft);
    await db.products.put(product);
    set((s) => ({ products: [...s.products, product] }));
    useAuditStore.getState().log('price_book_item_created', {
      entityType: 'product', entityId: product.id,
      description: `Added custom product "${product.name}"`,
    });
    return product;
  },

  async updateProduct(id, patch) {
    const existing = get().products.find((p) => p.id === id);
    if (!existing) throw new Error('Product not found');
    const updated = productSchema.parse({ ...existing, ...patch, updatedAt: new Date().toISOString() });
    await db.products.put(updated);
    set((s) => ({ products: s.products.map((p) => (p.id === id ? updated : p)) }));
    useAuditStore.getState().log('price_book_item_updated', {
      entityType: 'product', entityId: id,
      description: `Updated product "${updated.name}"`,
      previousValue: existing,
      newValue: updated,
    });
  },

  async archiveProduct(id) {
    return get().updateProduct(id, { isArchived: true });
  },

  async deleteProduct(id) {
    await db.products.delete(id);
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
    useAuditStore.getState().log('price_book_item_deleted', {
      entityType: 'product', entityId: id, description: `Deleted product ${id}`,
    });
  },

  async addSupplier(input) {
    const supplier = {
      id: input.id || uuid(),
      name: input.name,
      abn: input.abn || '',
      contact: input.contact || '',
      email: input.email || '',
      phone: input.phone || '',
      address: input.address || '',
      terms: input.terms || '',
      currency: input.currency || 'AUD',
      notes: input.notes || '',
    };
    await db.suppliers.put(supplier);
    set((s) => ({ suppliers: [...s.suppliers, supplier] }));
    return supplier;
  },

  async addSupplierPrice(input) {
    const price = {
      id: input.id || uuid(),
      productId: input.productId,
      supplierId: input.supplierId,
      supplierSku: input.supplierSku || '',
      unitPriceCents: input.unitPriceCents ?? dollarsToCents(input.unitPrice),
      currency: input.currency || 'AUD',
      fxRateToAUD: input.fxRateToAUD ?? 1,
      moq: input.moq ?? 1,
      packSize: input.packSize ?? 1,
      freightCents: input.freightCents ?? dollarsToCents(input.freight),
      leadTimeDays: input.leadTimeDays ?? 0,
      effectiveFrom: input.effectiveFrom || new Date().toISOString(),
      effectiveTo: input.effectiveTo || null,
      sourceUrl: input.sourceUrl || '',
      isPreferred: input.isPreferred ?? false,
      notes: input.notes || '',
    };
    await db.supplierPrices.put(price);
    set((s) => ({ supplierPrices: [...s.supplierPrices, price] }));
    return price;
  },

  async setPreferredSupplierPrice(productId, supplierPriceId) {
    const prices = get().supplierPrices.filter((p) => p.productId === productId);
    const updated = prices.map((p) => ({ ...p, isPreferred: p.id === supplierPriceId }));
    await db.supplierPrices.bulkPut(updated);
    set((s) => ({
      supplierPrices: s.supplierPrices.map((p) => {
        if (p.productId !== productId) return p;
        return { ...p, isPreferred: p.id === supplierPriceId };
      }),
    }));
  },

  async deleteSupplierPrice(id) {
    await db.supplierPrices.delete(id);
    set((s) => ({ supplierPrices: s.supplierPrices.filter((p) => p.id !== id) }));
  },

  bestPriceFor(productId) {
    const prices = get().supplierPrices.filter((p) => p.productId === productId);
    return bestSupplierPrice(prices);
  },

  compareFor(productId) {
    const prices = get().supplierPrices.filter((p) => p.productId === productId);
    return compareSuppliers(prices, get().suppliers);
  },
}));

export default useCatalogStore;
