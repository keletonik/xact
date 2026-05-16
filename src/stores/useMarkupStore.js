import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import db, { getBlob, putBlob } from '../services/db';
import { makePage, calibratePage } from '../markup/scale';
import { addLayer, removeLayer, updateLayer } from '../markup/layers';

/**
 * Drawings + markup documents store, backed by Dexie.
 *
 * A `Drawing` is the raw uploaded file (PDF, image). Its bytes live in the
 * `blobs` table content-addressed by SHA-256. A `MarkupDocument` is the
 * mutable per-drawing markup state; one MarkupDocument per Drawing.
 *
 * Undo/redo is in-memory (not persisted) and per-document. The stack stores
 * shallow snapshots of `pages` taken before each mutating action. Capped at
 * MAX_HISTORY entries — older snapshots are dropped to bound memory.
 */
const MAX_HISTORY = 50;

/** Deep-clone a markup object, assign a fresh uuid, and translate by (dx, dy). */
function offsetClone(o, dx, dy, pageNumber) {
  const clone = JSON.parse(JSON.stringify(o));
  clone.id = uuid();
  clone.pageNumber = pageNumber;
  clone.metadata = { ...clone.metadata };
  delete clone.metadata.groupId; // pasted copies are not part of the original group
  clone.geometry = translateGeom(clone.geometry, dx, dy);
  return clone;
}

function translateGeom(g, dx, dy) {
  if (!g) return g;
  if (g.points) return { ...g, points: g.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
  if (g.from && g.to) return { ...g, from: { x: g.from.x + dx, y: g.from.y + dy }, to: { x: g.to.x + dx, y: g.to.y + dy } };
  if (g.center) return { ...g, center: { x: g.center.x + dx, y: g.center.y + dy }, p1: g.p1 && { x: g.p1.x + dx, y: g.p1.y + dy }, p2: g.p2 && { x: g.p2.x + dx, y: g.p2.y + dy } };
  if (g.position) return { ...g, position: { x: g.position.x + dx, y: g.position.y + dy } };
  if (g.anchor && g.box) return { ...g, anchor: { x: g.anchor.x + dx, y: g.anchor.y + dy }, box: { ...g.box, x: g.box.x + dx, y: g.box.y + dy } };
  if (typeof g.x === 'number' && typeof g.y === 'number') return { ...g, x: g.x + dx, y: g.y + dy };
  return g;
}

function objIdsForGroup(doc, pageNumber, groupId) {
  const page = doc?.pages.find((p) => p.pageNumber === pageNumber);
  return (page?.objects || []).filter((o) => o.metadata?.groupId === groupId).map((o) => o.id);
}

function applyTransformToObject(o, fn) {
  const g = o.geometry;
  if (!g) return o;
  if (g.points) return { ...o, geometry: { ...g, points: g.points.map(fn) } };
  if (g.from && g.to) return { ...o, geometry: { ...g, from: fn(g.from), to: fn(g.to) } };
  if (g.center && g.p1 && g.p2) {
    const p1 = fn(g.p1), p2 = fn(g.p2);
    return { ...o, geometry: { ...g, p1, p2, center: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 } } };
  }
  if (g.center) return { ...o, geometry: { ...g, center: fn(g.center) } };
  if (g.position) return { ...o, geometry: { ...g, position: fn(g.position) } };
  if (g.anchor && g.box) {
    const a = fn(g.anchor);
    const b = fn({ x: g.box.x, y: g.box.y });
    return { ...o, geometry: { ...g, anchor: a, box: { ...g.box, x: b.x, y: b.y } } };
  }
  if (typeof g.x === 'number' && typeof g.y === 'number') {
    const p = fn({ x: g.x, y: g.y });
    return { ...o, geometry: { ...g, x: p.x, y: p.y } };
  }
  return o;
}

const useMarkupStore = create((set, get) => ({
  drawings: [],
  markupDocs: [],
  history: {},          // { [docId]: { past: [pagesSnapshot, …], future: [pagesSnapshot, …] } }
  clipboard: [],        // shallow copies of objects pending paste, no persistence
  ready: false,

  async hydrate() {
    const [drawings, markupDocs] = await Promise.all([
      db.drawings.toArray(),
      db.markupDocs.toArray(),
    ]);
    set({ drawings, markupDocs, ready: true });
  },

  async uploadDrawing({ projectId, file, pageCount = 1 }) {
    const hash = await putBlob(file);
    const drawing = {
      id: uuid(),
      projectId,
      name: file.name,
      filename: file.name,
      contentType: file.type,
      pageCount,
      sizeBytes: file.size,
      blobHash: hash,
      uploadedAt: new Date().toISOString(),
    };
    await db.drawings.put(drawing);

    const markupDoc = {
      id: uuid(),
      drawingId: drawing.id,
      projectId,
      name: file.name,
      pages: Array.from({ length: pageCount }, (_, i) => makePage(i + 1)),
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.markupDocs.put(markupDoc);
    set((s) => ({
      drawings: [...s.drawings, drawing],
      markupDocs: [...s.markupDocs, markupDoc],
    }));
    return { drawing, markupDoc };
  },

  async getDrawingBlob(drawingId) {
    const d = get().drawings.find((x) => x.id === drawingId);
    if (!d) return null;
    return getBlob(d.blobHash);
  },

  async setMarkupPageCount(markupDocId, pageCount) {
    const doc = get().markupDocs.find((d) => d.id === markupDocId);
    if (!doc) return;
    if (doc.pages.length === pageCount) return;
    const pages = [...doc.pages];
    while (pages.length < pageCount) pages.push(makePage(pages.length + 1));
    while (pages.length > pageCount) pages.pop();
    const updated = { ...doc, pages, updatedAt: new Date().toISOString() };
    await db.markupDocs.put(updated);
    set((s) => ({ markupDocs: s.markupDocs.map((d) => (d.id === markupDocId ? updated : d)) }));
  },

  /**
   * Internal mutator. Captures the previous `pages` into the per-doc history
   * stack before applying the change. Pass `{ skipHistory: true }` when the
   * caller is itself an undo/redo (so we don't record undo as a new edit).
   */
  async _updateDoc(markupDocId, mutator, { skipHistory } = {}) {
    const doc = get().markupDocs.find((d) => d.id === markupDocId);
    if (!doc) return;
    if (!skipHistory) {
      const past = (get().history[markupDocId]?.past || []).concat([JSON.stringify(doc.pages)]);
      const trimmed = past.length > MAX_HISTORY ? past.slice(past.length - MAX_HISTORY) : past;
      set((s) => ({ history: { ...s.history, [markupDocId]: { past: trimmed, future: [] } } }));
    }
    const updated = { ...doc, ...mutator(doc), updatedAt: new Date().toISOString() };
    await db.markupDocs.put(updated);
    set((s) => ({ markupDocs: s.markupDocs.map((d) => (d.id === markupDocId ? updated : d)) }));
  },

  async updatePage(markupDocId, pageNumber, mutator) {
    return get()._updateDoc(markupDocId, (doc) => ({
      pages: doc.pages.map((p) => (p.pageNumber === pageNumber ? mutator(p) : p)),
    }));
  },

  async addObject(markupDocId, pageNumber, obj) {
    return get().updatePage(markupDocId, pageNumber, (p) => ({ ...p, objects: [...p.objects, obj] }));
  },

  async updateObject(markupDocId, pageNumber, objId, patch) {
    return get().updatePage(markupDocId, pageNumber, (p) => ({
      ...p,
      objects: p.objects.map((o) => (o.id === objId ? { ...o, ...patch, metadata: { ...o.metadata, ...patch.metadata } } : o)),
    }));
  },

  async removeObject(markupDocId, pageNumber, objId) {
    return get().updatePage(markupDocId, pageNumber, (p) => ({
      ...p,
      objects: p.objects.filter((o) => o.id !== objId),
    }));
  },

  /**
   * Copy a list of objects to the in-memory clipboard. Pure metadata move,
   * not persisted. Subsequent paste() must produce new uuids so the
   * original and the paste both exist.
   */
  copyToClipboard(markupDocId, pageNumber, objIds) {
    const doc = get().markupDocs.find((d) => d.id === markupDocId);
    if (!doc) return 0;
    const page = doc.pages.find((p) => p.pageNumber === pageNumber);
    if (!page) return 0;
    const idSet = new Set(objIds);
    const copied = page.objects.filter((o) => idSet.has(o.id)).map((o) => JSON.parse(JSON.stringify(o)));
    set({ clipboard: copied });
    return copied.length;
  },

  /**
   * Paste the clipboard onto `pageNumber`, offset by `dx/dy` pixels.
   * Returns the new objects (with fresh uuids) so the caller can select them.
   */
  async pasteClipboard(markupDocId, pageNumber, dx = 10, dy = 10) {
    const items = get().clipboard;
    if (items.length === 0) return [];
    const fresh = items.map((o) => offsetClone(o, dx, dy, pageNumber));
    await get().updatePage(markupDocId, pageNumber, (p) => ({ ...p, objects: [...p.objects, ...fresh] }));
    return fresh;
  },

  /** Copy → paste in one shot, with offset, for the currently selected ids. */
  async duplicateObjects(markupDocId, pageNumber, objIds, dx = 10, dy = 10) {
    const n = get().copyToClipboard(markupDocId, pageNumber, objIds);
    if (n === 0) return [];
    return get().pasteClipboard(markupDocId, pageNumber, dx, dy);
  },

  /**
   * Stamp the same groupId on every selected object. Existing groupId is
   * overwritten — explicitly ungroup first if you want to nest.
   */
  async groupObjects(markupDocId, pageNumber, objIds) {
    if (!objIds || objIds.length < 2) return null;
    const groupId = uuid();
    const idSet = new Set(objIds);
    await get().updatePage(markupDocId, pageNumber, (p) => ({
      ...p,
      objects: p.objects.map((o) =>
        idSet.has(o.id) ? { ...o, metadata: { ...o.metadata, groupId } } : o,
      ),
    }));
    return groupId;
  },

  /** Strip groupId from every member of `groupId`. */
  async ungroupObjects(markupDocId, pageNumber, groupId) {
    if (!groupId) return 0;
    await get().updatePage(markupDocId, pageNumber, (p) => ({
      ...p,
      objects: p.objects.map((o) => {
        if (o.metadata?.groupId !== groupId) return o;
        const { groupId: _drop, ...rest } = o.metadata || {};
        void _drop;
        return { ...o, metadata: rest };
      }),
    }));
    return objIdsForGroup(get().markupDocs.find((d) => d.id === markupDocId), pageNumber, groupId).length;
  },

  /**
   * Apply a shape-preserving transform (translate, scale around a pivot, or
   * rotate around a pivot — caller supplies a function `(point) => point`)
   * to every object in `objIds`. Used by the Konva Transformer's onTransformEnd.
   */
  async transformObjects(markupDocId, pageNumber, objIds, fn) {
    const idSet = new Set(objIds);
    await get().updatePage(markupDocId, pageNumber, (p) => ({
      ...p,
      objects: p.objects.map((o) => (idSet.has(o.id) ? applyTransformToObject(o, fn) : o)),
    }));
  },

  async removeObjects(markupDocId, pageNumber, objIds) {
    if (!objIds || objIds.length === 0) return;
    const idSet = new Set(objIds);
    return get().updatePage(markupDocId, pageNumber, (p) => ({
      ...p,
      objects: p.objects.filter((o) => !idSet.has(o.id)),
    }));
  },

  async clearPage(markupDocId, pageNumber) {
    return get().updatePage(markupDocId, pageNumber, (p) => ({ ...p, objects: [] }));
  },

  async calibrate(markupDocId, pageNumber, pointA, pointB, knownMm) {
    return get().updatePage(markupDocId, pageNumber, (p) => calibratePage(p, pointA, pointB, knownMm));
  },

  async setDisplayUnit(markupDocId, pageNumber, displayUnit) {
    return get().updatePage(markupDocId, pageNumber, (p) => ({ ...p, displayUnit }));
  },

  async addLayer(markupDocId, pageNumber, attrs) {
    return get().updatePage(markupDocId, pageNumber, (p) => addLayer(p, attrs));
  },

  async updateLayer(markupDocId, pageNumber, layerId, patch) {
    return get().updatePage(markupDocId, pageNumber, (p) => updateLayer(p, layerId, patch));
  },

  async removeLayer(markupDocId, pageNumber, layerId) {
    return get().updatePage(markupDocId, pageNumber, (p) => removeLayer(p, layerId));
  },

  async undo(markupDocId) {
    const hist = get().history[markupDocId];
    if (!hist || hist.past.length === 0) return false;
    const doc = get().markupDocs.find((d) => d.id === markupDocId);
    if (!doc) return false;
    const previous = JSON.parse(hist.past[hist.past.length - 1]);
    const newPast = hist.past.slice(0, -1);
    const newFuture = [JSON.stringify(doc.pages), ...hist.future].slice(0, MAX_HISTORY);
    set((s) => ({ history: { ...s.history, [markupDocId]: { past: newPast, future: newFuture } } }));
    await get()._updateDoc(markupDocId, () => ({ pages: previous }), { skipHistory: true });
    return true;
  },

  async redo(markupDocId) {
    const hist = get().history[markupDocId];
    if (!hist || hist.future.length === 0) return false;
    const doc = get().markupDocs.find((d) => d.id === markupDocId);
    if (!doc) return false;
    const next = JSON.parse(hist.future[0]);
    const newFuture = hist.future.slice(1);
    const newPast = hist.past.concat([JSON.stringify(doc.pages)]).slice(-MAX_HISTORY);
    set((s) => ({ history: { ...s.history, [markupDocId]: { past: newPast, future: newFuture } } }));
    await get()._updateDoc(markupDocId, () => ({ pages: next }), { skipHistory: true });
    return true;
  },

  canUndo(markupDocId) {
    return (get().history[markupDocId]?.past?.length || 0) > 0;
  },

  canRedo(markupDocId) {
    return (get().history[markupDocId]?.future?.length || 0) > 0;
  },

  async deleteDrawing(drawingId) {
    const drawing = get().drawings.find((d) => d.id === drawingId);
    const doc = get().markupDocs.find((d) => d.drawingId === drawingId);
    await db.transaction('rw', db.drawings, db.markupDocs, async () => {
      await db.drawings.delete(drawingId);
      if (doc) await db.markupDocs.delete(doc.id);
    });
    set((s) => {
      const nextHistory = { ...s.history };
      if (doc) delete nextHistory[doc.id];
      return {
        drawings: s.drawings.filter((d) => d.id !== drawingId),
        markupDocs: s.markupDocs.filter((d) => d.drawingId !== drawingId),
        history: nextHistory,
      };
    });
    return drawing;
  },
}));

export default useMarkupStore;
