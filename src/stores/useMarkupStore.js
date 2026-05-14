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
 */
const useMarkupStore = create((set, get) => ({
  drawings: [],
  markupDocs: [],
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

  async updatePage(markupDocId, pageNumber, mutator) {
    const doc = get().markupDocs.find((d) => d.id === markupDocId);
    if (!doc) return;
    const updated = {
      ...doc,
      pages: doc.pages.map((p) => (p.pageNumber === pageNumber ? mutator(p) : p)),
      updatedAt: new Date().toISOString(),
    };
    await db.markupDocs.put(updated);
    set((s) => ({ markupDocs: s.markupDocs.map((d) => (d.id === markupDocId ? updated : d)) }));
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

  async calibrate(markupDocId, pageNumber, pointA, pointB, knownMm) {
    return get().updatePage(markupDocId, pageNumber, (p) => calibratePage(p, pointA, pointB, knownMm));
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

  async deleteDrawing(drawingId) {
    const drawing = get().drawings.find((d) => d.id === drawingId);
    const doc = get().markupDocs.find((d) => d.drawingId === drawingId);
    await db.transaction('rw', db.drawings, db.markupDocs, async () => {
      await db.drawings.delete(drawingId);
      if (doc) await db.markupDocs.delete(doc.id);
    });
    set((s) => ({
      drawings: s.drawings.filter((d) => d.id !== drawingId),
      markupDocs: s.markupDocs.filter((d) => d.drawingId !== drawingId),
    }));
    return drawing;
  },
}));

export default useMarkupStore;
