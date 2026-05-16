import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resetDB } from '../services/db';
import useMarkupStore from './useMarkupStore';

const makeFile = (name = 'a.pdf', type = 'application/pdf') =>
  new File([new Uint8Array([1, 2, 3])], name, { type });

describe('useMarkupStore — undo / redo', () => {
  beforeEach(async () => {
    await resetDB();
    useMarkupStore.setState({ drawings: [], markupDocs: [], history: {}, ready: false });
  });
  afterEach(async () => { await resetDB(); });

  it('undo reverses the last addObject; redo reapplies', async () => {
    const { markupDoc } = await useMarkupStore.getState().uploadDrawing({
      projectId: 'p1', file: makeFile(), pageCount: 1,
    });
    const layerId = markupDoc.pages[0].layers[0].id;
    const obj = { id: 'o1', type: 'count', pageNumber: 1, layerId, geometry: { center: { x: 1, y: 1 }, radius: 5 }, style: {}, metadata: { quantity: 1, measuredValueMm: 0 } };

    await useMarkupStore.getState().addObject(markupDoc.id, 1, obj);
    let stored = useMarkupStore.getState().markupDocs.find((d) => d.id === markupDoc.id);
    expect(stored.pages[0].objects).toHaveLength(1);
    expect(useMarkupStore.getState().canUndo(markupDoc.id)).toBe(true);

    const undone = await useMarkupStore.getState().undo(markupDoc.id);
    expect(undone).toBe(true);
    stored = useMarkupStore.getState().markupDocs.find((d) => d.id === markupDoc.id);
    expect(stored.pages[0].objects).toHaveLength(0);
    expect(useMarkupStore.getState().canRedo(markupDoc.id)).toBe(true);

    await useMarkupStore.getState().redo(markupDoc.id);
    stored = useMarkupStore.getState().markupDocs.find((d) => d.id === markupDoc.id);
    expect(stored.pages[0].objects).toHaveLength(1);
    expect(stored.pages[0].objects[0].id).toBe('o1');
  });

  it('undo returns false when stack is empty', async () => {
    const { markupDoc } = await useMarkupStore.getState().uploadDrawing({
      projectId: 'p1', file: makeFile(), pageCount: 1,
    });
    expect(await useMarkupStore.getState().undo(markupDoc.id)).toBe(false);
    expect(await useMarkupStore.getState().redo(markupDoc.id)).toBe(false);
  });

  it('a fresh edit after undo clears the future stack', async () => {
    const { markupDoc } = await useMarkupStore.getState().uploadDrawing({
      projectId: 'p1', file: makeFile(), pageCount: 1,
    });
    const layerId = markupDoc.pages[0].layers[0].id;
    const mk = (id) => ({ id, type: 'count', pageNumber: 1, layerId, geometry: { center: { x: 0, y: 0 }, radius: 5 }, style: {}, metadata: {} });
    await useMarkupStore.getState().addObject(markupDoc.id, 1, mk('a'));
    await useMarkupStore.getState().addObject(markupDoc.id, 1, mk('b'));
    await useMarkupStore.getState().undo(markupDoc.id);
    expect(useMarkupStore.getState().canRedo(markupDoc.id)).toBe(true);
    await useMarkupStore.getState().addObject(markupDoc.id, 1, mk('c'));
    expect(useMarkupStore.getState().canRedo(markupDoc.id)).toBe(false);
  });

  it('copy / paste produces a fresh uuid and offsets geometry', async () => {
    const { markupDoc } = await useMarkupStore.getState().uploadDrawing({
      projectId: 'p1', file: makeFile(), pageCount: 1,
    });
    const layerId = markupDoc.pages[0].layers[0].id;
    await useMarkupStore.getState().addObject(markupDoc.id, 1, {
      id: 'src1', type: 'rectangle', pageNumber: 1, layerId,
      geometry: { x: 10, y: 20, width: 30, height: 40 },
      style: {}, metadata: {},
    });
    useMarkupStore.getState().copyToClipboard(markupDoc.id, 1, ['src1']);
    const fresh = await useMarkupStore.getState().pasteClipboard(markupDoc.id, 1, 5, 5);
    expect(fresh).toHaveLength(1);
    expect(fresh[0].id).not.toBe('src1');
    expect(fresh[0].geometry.x).toBe(15);
    expect(fresh[0].geometry.y).toBe(25);
    const stored = useMarkupStore.getState().markupDocs.find((d) => d.id === markupDoc.id);
    expect(stored.pages[0].objects).toHaveLength(2);
  });

  it('duplicate offsets by default and produces a fresh uuid', async () => {
    const { markupDoc } = await useMarkupStore.getState().uploadDrawing({
      projectId: 'p1', file: makeFile(), pageCount: 1,
    });
    const layerId = markupDoc.pages[0].layers[0].id;
    await useMarkupStore.getState().addObject(markupDoc.id, 1, {
      id: 'a', type: 'count', pageNumber: 1, layerId,
      geometry: { center: { x: 0, y: 0 }, radius: 5 }, style: {}, metadata: {},
    });
    const fresh = await useMarkupStore.getState().duplicateObjects(markupDoc.id, 1, ['a']);
    expect(fresh).toHaveLength(1);
    expect(fresh[0].id).not.toBe('a');
    expect(fresh[0].geometry.center.x).toBe(10);
    expect(fresh[0].geometry.center.y).toBe(10);
  });

  it('group stamps the same groupId on every member', async () => {
    const { markupDoc } = await useMarkupStore.getState().uploadDrawing({
      projectId: 'p1', file: makeFile(), pageCount: 1,
    });
    const layerId = markupDoc.pages[0].layers[0].id;
    await useMarkupStore.getState().addObject(markupDoc.id, 1, { id: 'a', type: 'count', pageNumber: 1, layerId, geometry: { center: { x: 0, y: 0 }, radius: 5 }, style: {}, metadata: {} });
    await useMarkupStore.getState().addObject(markupDoc.id, 1, { id: 'b', type: 'count', pageNumber: 1, layerId, geometry: { center: { x: 10, y: 0 }, radius: 5 }, style: {}, metadata: {} });
    const gid = await useMarkupStore.getState().groupObjects(markupDoc.id, 1, ['a', 'b']);
    expect(gid).toBeTruthy();
    const stored = useMarkupStore.getState().markupDocs.find((d) => d.id === markupDoc.id);
    expect(stored.pages[0].objects.every((o) => o.metadata.groupId === gid)).toBe(true);
    await useMarkupStore.getState().ungroupObjects(markupDoc.id, 1, gid);
    const after = useMarkupStore.getState().markupDocs.find((d) => d.id === markupDoc.id);
    expect(after.pages[0].objects.every((o) => o.metadata.groupId == null)).toBe(true);
  });

  it('transformObjects applies a point→point mapper to every geometry vertex', async () => {
    const { markupDoc } = await useMarkupStore.getState().uploadDrawing({
      projectId: 'p1', file: makeFile(), pageCount: 1,
    });
    const layerId = markupDoc.pages[0].layers[0].id;
    await useMarkupStore.getState().addObject(markupDoc.id, 1, {
      id: 'r', type: 'rectangle', pageNumber: 1, layerId,
      geometry: { x: 0, y: 0, width: 10, height: 10 }, style: {}, metadata: {},
    });
    // translate by (+5, +7)
    await useMarkupStore.getState().transformObjects(markupDoc.id, 1, ['r'], (p) => ({ x: p.x + 5, y: p.y + 7 }));
    const stored = useMarkupStore.getState().markupDocs.find((d) => d.id === markupDoc.id);
    expect(stored.pages[0].objects[0].geometry.x).toBe(5);
    expect(stored.pages[0].objects[0].geometry.y).toBe(7);
  });

  it('removeObjects deletes a batch', async () => {
    const { markupDoc } = await useMarkupStore.getState().uploadDrawing({
      projectId: 'p1', file: makeFile(), pageCount: 1,
    });
    const layerId = markupDoc.pages[0].layers[0].id;
    const mk = (id) => ({ id, type: 'count', pageNumber: 1, layerId, geometry: { center: { x: 0, y: 0 }, radius: 5 }, style: {}, metadata: {} });
    await useMarkupStore.getState().addObject(markupDoc.id, 1, mk('a'));
    await useMarkupStore.getState().addObject(markupDoc.id, 1, mk('b'));
    await useMarkupStore.getState().addObject(markupDoc.id, 1, mk('c'));
    await useMarkupStore.getState().removeObjects(markupDoc.id, 1, ['a', 'c']);
    const stored = useMarkupStore.getState().markupDocs.find((d) => d.id === markupDoc.id);
    expect(stored.pages[0].objects.map((o) => o.id)).toEqual(['b']);
  });
});
