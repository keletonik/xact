import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import db, { resetDB } from '../services/db';
import useProjectStore from './useProjectStore';
import useAssetStore from './useAssetStore';
import useInspectionStore, { deriveDueDate } from './useInspectionStore';
import useDefectStore from './useDefectStore';
import {
  ASSET_TYPES, ASSET_STATUSES, INSPECTION_FREQUENCIES,
} from '../utils/constants';

beforeEach(async () => {
  await resetDB();
  useProjectStore.setState({ projects: [], selectedId: null, ready: false });
  useAssetStore.setState({ assets: [], specialisations: {}, ready: false });
  useInspectionStore.setState({ inspections: [], resultsByInspection: {}, ready: false });
  useDefectStore.setState({ defects: [], ready: false });
});

async function seed() {
  const project = await useProjectStore.getState().createProject({ name: 'Site A' });
  const a1 = await useAssetStore.getState().createAsset({
    asset: { projectId: project.id, assetType: ASSET_TYPES.PENETRATION, status: ASSET_STATUSES.INSTALLED },
  });
  const a2 = await useAssetStore.getState().createAsset({
    asset: { projectId: project.id, assetType: ASSET_TYPES.FIRE_DOOR, status: ASSET_STATUSES.INSTALLED },
  });
  return { project, a1, a2 };
}

describe('deriveDueDate', () => {
  it('class A → next day', () => {
    expect(deriveDueDate('A', '2026-05-29T00:00:00.000Z')).toBe('2026-05-30');
  });
  it('class B → +30 days', () => {
    expect(deriveDueDate('B', '2026-05-29T00:00:00.000Z')).toBe('2026-06-28');
  });
  it('class C → +90 days', () => {
    expect(deriveDueDate('C', '2026-05-29T00:00:00.000Z')).toBe('2026-08-27');
  });
});

describe('useInspectionStore', () => {
  it('schedules an inspection with default frequency', async () => {
    const { project } = await seed();
    const i = await useInspectionStore.getState().scheduleInspection({ projectId: project.id });
    expect(i.frequency).toBe(INSPECTION_FREQUENCIES.ANNUAL);
    expect(i.status).toBe('scheduled');
    expect(useInspectionStore.getState().inspections).toHaveLength(1);
  });

  it('completing with a FAIL raises a defect with derived due date', async () => {
    const { project, a1 } = await seed();
    const ins = await useInspectionStore.getState().scheduleInspection({ projectId: project.id });

    await useInspectionStore.getState().completeInspection(ins.id, {
      performedDate: '2026-05-29T00:00:00.000Z',
      results: [
        { assetId: a1.id, result: 'fail', defectClass: 'A', notes: 'No intumescent seal' },
      ],
    });

    const defects = useDefectStore.getState().defects;
    expect(defects).toHaveLength(1);
    expect(defects[0].severity).toBe('A');
    expect(defects[0].rectificationDueDate).toBe('2026-05-30');
    expect(defects[0].description).toBe('No intumescent seal');

    const asset = await db.assets.get(a1.id);
    expect(asset.status).toBe(ASSET_STATUSES.NONCONFORMANCE);
  });

  it('a PASS on a previously failing asset bumps it back from NONCONFORMANCE only via defect verification, not directly', async () => {
    const { project, a1 } = await seed();
    // First inspection fails the asset
    const ins1 = await useInspectionStore.getState().scheduleInspection({ projectId: project.id });
    await useInspectionStore.getState().completeInspection(ins1.id, {
      results: [{ assetId: a1.id, result: 'fail', defectClass: 'B', notes: 'gap > 3mm' }],
    });
    expect((await db.assets.get(a1.id)).status).toBe(ASSET_STATUSES.NONCONFORMANCE);

    // Second inspection passes
    const ins2 = await useInspectionStore.getState().scheduleInspection({ projectId: project.id });
    await useInspectionStore.getState().completeInspection(ins2.id, {
      results: [{ assetId: a1.id, result: 'pass' }],
    });
    // PASS rolls the asset out of NONCONFORMANCE back to INSTALLED.
    expect((await db.assets.get(a1.id)).status).toBe(ASSET_STATUSES.INSTALLED);
    // The original open defect is still there waiting for explicit rectify+verify.
    const openDefects = useDefectStore.getState().defects.filter((d) => d.status !== 'verified');
    expect(openDefects).toHaveLength(1);
  });

  it('cancel removes the inspection and its results', async () => {
    const { project } = await seed();
    const i = await useInspectionStore.getState().scheduleInspection({ projectId: project.id });
    await useInspectionStore.getState().cancelInspection(i.id);
    expect(useInspectionStore.getState().inspections).toHaveLength(0);
  });
});

describe('useDefectStore', () => {
  it('verify moves the asset back to INSTALLED when no other defects remain open', async () => {
    const { project, a1 } = await seed();
    const d = await useDefectStore.getState().raiseDefect({
      assetId: a1.id, severity: 'B', description: 'manual raise',
    });
    // Move asset to NONCONFORMANCE to simulate prior fail
    await db.assets.put({ ...(await db.assets.get(a1.id)), status: ASSET_STATUSES.NONCONFORMANCE });

    await useDefectStore.getState().markRectified(d.id, { rectifiedNotes: 'replaced collar' });
    await useDefectStore.getState().verify(d.id, {});

    expect((await db.assets.get(a1.id)).status).toBe(ASSET_STATUSES.INSTALLED);
  });

  it('verify leaves NONCONFORMANCE in place while other defects remain open on the same asset', async () => {
    const { project, a1 } = await seed();
    const d1 = await useDefectStore.getState().raiseDefect({ assetId: a1.id, severity: 'B', description: 'one' });
    const d2 = await useDefectStore.getState().raiseDefect({ assetId: a1.id, severity: 'C', description: 'two' });
    await db.assets.put({ ...(await db.assets.get(a1.id)), status: ASSET_STATUSES.NONCONFORMANCE });

    await useDefectStore.getState().markRectified(d1.id, { rectifiedNotes: '' });
    await useDefectStore.getState().verify(d1.id, {});

    expect((await db.assets.get(a1.id)).status).toBe(ASSET_STATUSES.NONCONFORMANCE);
    expect(useDefectStore.getState().defects.find((x) => x.id === d2.id).status).toBe('open');
  });
});
