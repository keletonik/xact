import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import db from '../services/db';
import { MANUFACTURERS } from '../utils/constants';

/**
 * Vendor CRUD. Seeded on first run with the canonical AU passive-fire
 * manufacturers so the team has a starting roster to extend.
 */
const useVendorStore = create((set, get) => ({
  vendors: [],
  ready: false,

  async hydrate() {
    let vendors = await db.vendors.toArray();
    if (vendors.length === 0) {
      const now = new Date().toISOString();
      vendors = Object.values(MANUFACTURERS).map((name) => ({
        id: uuid(),
        name,
        role: 'manufacturer',
        contactEmail: '',
        contactPhone: '',
        website: '',
        notes: '',
        createdAt: now,
        updatedAt: now,
      }));
      await db.vendors.bulkPut(vendors);
    }
    vendors.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    set({ vendors, ready: true });
  },

  async create(input) {
    const now = new Date().toISOString();
    const vendor = {
      id: input.id || uuid(),
      name: input.name,
      role: input.role || 'supplier',
      contactEmail: input.contactEmail || '',
      contactPhone: input.contactPhone || '',
      website: input.website || '',
      notes: input.notes || '',
      createdAt: now,
      updatedAt: now,
    };
    await db.vendors.put(vendor);
    set((s) => ({ vendors: [...s.vendors, vendor].sort((a, b) => a.name.localeCompare(b.name)) }));
    return vendor;
  },

  async update(id, patch) {
    const current = await db.vendors.get(id);
    if (!current) return null;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    await db.vendors.put(next);
    set((s) => ({ vendors: s.vendors.map((v) => (v.id === id ? next : v)) }));
    return next;
  },

  async remove(id) {
    await db.vendors.delete(id);
    set((s) => ({ vendors: s.vendors.filter((v) => v.id !== id) }));
  },
}));

export default useVendorStore;
