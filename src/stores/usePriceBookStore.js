import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import useAuditStore from './useAuditStore';
import { SPRINKLER_ITEMS, SPRINKLER_ASSEMBLIES } from '../domain/sprinklerPack';
import { ALARM_ITEMS, ALARM_ASSEMBLIES } from '../domain/alarmPack';
import { PASSIVE_FIRE_ITEMS, PASSIVE_FIRE_ASSEMBLIES } from '../domain/passiveFirePack';
import { PORTABLE_ITEMS, PORTABLE_ASSEMBLIES } from '../domain/portableEquipmentPack';

const allItems = [...SPRINKLER_ITEMS, ...ALARM_ITEMS, ...PASSIVE_FIRE_ITEMS, ...PORTABLE_ITEMS];
const allAssemblies = [...SPRINKLER_ASSEMBLIES, ...ALARM_ASSEMBLIES, ...PASSIVE_FIRE_ASSEMBLIES, ...PORTABLE_ASSEMBLIES];

const usePriceBookStore = create((set, get) => ({
  items: allItems,
  assemblies: allAssemblies,
  supplierOverrides: {},
  pendingUpdates: [],

  getItem(id) {
    return get().items.find((i) => i.id === id);
  },

  getItemsByCategory(category) {
    return get().items.filter((i) => i.category === category);
  },

  searchItems(query) {
    const q = query.toLowerCase();
    return get().items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        (i.brand && i.brand.toLowerCase().includes(q)) ||
        (i.model && i.model.toLowerCase().includes(q))
    );
  },

  addItem(data) {
    const item = {
      id: data.id || uuid(),
      name: data.name,
      category: data.category,
      unit: data.unit,
      basePrice: data.basePrice,
      brand: data.brand || '',
      model: data.model || '',
    };

    set((state) => ({
      items: [...state.items, item],
    }));

    useAuditStore.getState().log('price_book_item_created', {
      entityType: 'price_book_item',
      entityId: item.id,
      description: `Added item "${item.name}" at $${item.basePrice}/${item.unit}`,
    });

    return item;
  },

  updateItem(id, updates, reason = '') {
    const prev = get().items.find((i) => i.id === id);
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    }));

    useAuditStore.getState().log('price_book_item_updated', {
      entityType: 'price_book_item',
      entityId: id,
      description: `Updated item "${prev?.name}"`,
      previousValue: prev,
      newValue: { ...prev, ...updates },
      reason,
    });
  },

  deleteItem(id) {
    const item = get().items.find((i) => i.id === id);
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));

    useAuditStore.getState().log('price_book_item_deleted', {
      entityType: 'price_book_item',
      entityId: id,
      description: `Deleted item "${item?.name}"`,
    });
  },

  getAssembly(id) {
    return get().assemblies.find((a) => a.id === id);
  },

  getAssembliesByScope(scope) {
    return get().assemblies.filter((a) => a.scope === scope);
  },

  searchAssemblies(query) {
    const q = query.toLowerCase();
    return get().assemblies.filter(
      (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    );
  },

  addAssembly(data) {
    const assembly = {
      id: data.id || uuid(),
      ...data,
    };

    set((state) => ({
      assemblies: [...state.assemblies, assembly],
    }));

    useAuditStore.getState().log('assembly_created', {
      entityType: 'assembly',
      entityId: assembly.id,
      description: `Created assembly "${assembly.name}"`,
    });

    return assembly;
  },

  updateAssembly(id, updates, reason = '') {
    const prev = get().assemblies.find((a) => a.id === id);
    set((state) => ({
      assemblies: state.assemblies.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));

    useAuditStore.getState().log('assembly_updated', {
      entityType: 'assembly',
      entityId: id,
      description: `Updated assembly "${prev?.name}"`,
      previousValue: prev,
      newValue: { ...prev, ...updates },
      reason,
    });
  },

  setSupplierOverride(itemId, price) {
    set((state) => ({
      supplierOverrides: { ...state.supplierOverrides, [itemId]: price },
    }));
  },

  addPendingUpdate(update) {
    set((state) => ({
      pendingUpdates: [...state.pendingUpdates, { id: uuid(), ...update, createdAt: new Date().toISOString(), status: 'pending' }],
    }));
  },

  approvePendingUpdate(updateId) {
    const update = get().pendingUpdates.find((u) => u.id === updateId);
    if (!update) return;

    get().updateItem(update.itemId, { basePrice: update.proposedPrice }, `Approved price update from ${update.source}`);

    set((state) => ({
      pendingUpdates: state.pendingUpdates.map((u) =>
        u.id === updateId ? { ...u, status: 'approved', approvedAt: new Date().toISOString() } : u
      ),
    }));

    useAuditStore.getState().log('ai_suggestion_approved', {
      entityType: 'price_update',
      entityId: updateId,
      description: `Approved price update for "${update.itemName}" to $${update.proposedPrice}`,
    });
  },

  rejectPendingUpdate(updateId, reason = '') {
    set((state) => ({
      pendingUpdates: state.pendingUpdates.map((u) =>
        u.id === updateId ? { ...u, status: 'rejected', rejectedAt: new Date().toISOString(), rejectionReason: reason } : u
      ),
    }));

    useAuditStore.getState().log('ai_suggestion_rejected', {
      entityType: 'price_update',
      entityId: updateId,
      description: `Rejected price update`,
      reason,
    });
  },
}));

export default usePriceBookStore;
