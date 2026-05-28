import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import db, { resetDB } from '../services/db';
import useProjectStore from './useProjectStore';
import useAssetStore from './useAssetStore';
import useQuoteStore from './useQuoteStore';
import { ASSET_TYPES, ASSET_STATUSES, SUBSTRATES } from '../utils/constants';

beforeEach(async () => {
  await resetDB();
  useProjectStore.setState({ projects: [], selectedId: null, ready: false });
  useAssetStore.setState({ assets: [], specialisations: {}, ready: false });
  useQuoteStore.setState({ quotes: [], lineItemsByQuote: {}, ready: false });
});

async function seedProject() {
  return useProjectStore.getState().createProject({ name: 'Tower' });
}

describe('useQuoteStore', () => {
  it('auto-versions quotes per project', async () => {
    const p = await seedProject();
    const q1 = await useQuoteStore.getState().createQuote({ projectId: p.id });
    const q2 = await useQuoteStore.getState().createQuote({ projectId: p.id });
    expect(q1.version).toBe(1);
    expect(q2.version).toBe(2);
  });

  it('line total is qty × (unit + materials) in integer cents', async () => {
    const p = await seedProject();
    const q = await useQuoteStore.getState().createQuote({ projectId: p.id });
    const line = await useQuoteStore.getState().addLine(q.id, {
      description: 'PVC pen 100mm',
      assetType: ASSET_TYPES.PENETRATION,
      substrate: SUBSTRATES.CONCRETE_SLAB,
      requiredFrl: '-/120/120',
      qty: 5,
      unitRateCents: 8500,
      materialsCents: 4200,
    });
    expect(line.totalCents).toBe(5 * (8500 + 4200));
    const reloaded = await db.quotes.get(q.id);
    expect(reloaded.totalCents).toBe(line.totalCents);
  });

  it('updating a line recomputes totals and persists to the quote', async () => {
    const p = await seedProject();
    const q = await useQuoteStore.getState().createQuote({ projectId: p.id });
    const line = await useQuoteStore.getState().addLine(q.id, {
      description: 'door', assetType: ASSET_TYPES.FIRE_DOOR,
      qty: 1, unitRateCents: 100000, materialsCents: 0,
    });
    await useQuoteStore.getState().updateLine(q.id, line.id, { qty: 3 });
    const reloaded = await db.quotes.get(q.id);
    expect(reloaded.totalCents).toBe(300000);
  });

  it('only draft quotes accept new lines', async () => {
    const p = await seedProject();
    const q = await useQuoteStore.getState().createQuote({ projectId: p.id });
    await useQuoteStore.getState().setStatus(q.id, 'sent');
    await expect(
      useQuoteStore.getState().addLine(q.id, { assetType: ASSET_TYPES.PENETRATION, qty: 1 })
    ).rejects.toThrow();
  });

  it('convert: each line materialises qty PLANNED assets and records back ids', async () => {
    const p = await seedProject();
    const q = await useQuoteStore.getState().createQuote({ projectId: p.id });
    await useQuoteStore.getState().addLine(q.id, {
      description: 'PVC pen', assetType: ASSET_TYPES.PENETRATION,
      substrate: SUBSTRATES.CONCRETE_SLAB, requiredFrl: '-/120/120',
      qty: 3, unitRateCents: 5000, materialsCents: 0,
    });
    await useQuoteStore.getState().setStatus(q.id, 'sent');
    await useQuoteStore.getState().setStatus(q.id, 'accepted');

    const created = await useQuoteStore.getState().convertToAssets(q.id);
    const ids = Object.values(created).flat();
    expect(ids).toHaveLength(3);
    for (const aid of ids) {
      const asset = await db.assets.get(aid);
      expect(asset.status).toBe(ASSET_STATUSES.PLANNED);
      expect(asset.substrate).toBe(SUBSTRATES.CONCRETE_SLAB);
      expect(asset.requiredFrl).toBe('-/120/120');
    }
    // Re-converting should be a no-op (line already converted).
    const second = await useQuoteStore.getState().convertToAssets(q.id);
    expect(Object.values(second).flat()).toHaveLength(0);
  });

  it('convert requires accepted status', async () => {
    const p = await seedProject();
    const q = await useQuoteStore.getState().createQuote({ projectId: p.id });
    await useQuoteStore.getState().addLine(q.id, { assetType: ASSET_TYPES.PENETRATION, qty: 1 });
    await expect(useQuoteStore.getState().convertToAssets(q.id)).rejects.toThrow();
  });
});
