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
