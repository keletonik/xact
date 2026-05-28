import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import db, { putBlob, getBlob } from '../services/db';
import useAuditStore from './useAuditStore';
import { AUDIT_ACTIONS } from '../utils/constants';

/**
 * Photo capture per asset per stage. Each photo carries a SHA-256 hash
 * pointing into the `blobs` content-addressable store, so duplicate
 * uploads (the same JPEG dropped twice) dedupe automatically.
 *
 * objectURL cache: useObjectURL() resolves a blob hash to a usable
 * data: URL once and reuses it. Callers do not need to manage lifetimes;
 * the cache is bounded by the asset photo set which is small.
 */
const useObjectURLCache = new Map(); // hash -> objectURL

const usePhotoStore = create((set, get) => ({
  photos: [],
  ready: false,

  async hydrate() {
    const photos = await db.photos.toArray();
    photos.sort((a, b) => (a.takenAt || '').localeCompare(b.takenAt || ''));
    set({ photos, ready: true });
  },

  forAsset(assetId) {
    return get().photos.filter((p) => p.assetId === assetId);
  },

  forAssetByStage(assetId) {
    const byStage = {};
    for (const p of get().photos) {
      if (p.assetId !== assetId) continue;
      (byStage[p.stage] ??= []).push(p);
    }
    return byStage;
  },

  async addPhoto({ assetId, stage, file, notes = '', geo = null }) {
    const blobHash = await putBlob(file);
    const photo = {
      id: uuid(),
      assetId,
      stage,
      blobHash,
      takenAt: tryExifTakenAt(file) || new Date().toISOString(),
      capturedAt: new Date().toISOString(),
      mimeType: file.type || 'image/jpeg',
      sizeBytes: file.size || 0,
      notes,
      geo,
    };
    await db.photos.put(photo);
    set((s) => ({ photos: [...s.photos, photo] }));

    useAuditStore.getState().log(AUDIT_ACTIONS.PHOTO_CAPTURED, {
      entityType: 'photo', entityId: photo.id,
      description: `Captured ${stage} photo for asset`,
    });
    return photo;
  },

  async deletePhoto(id) {
    const photo = await db.photos.get(id);
    if (!photo) return;
    await db.photos.delete(id);
    // Keep the blob row even if no photo references it: blobs are dedupe-keyed
    // and the cost of orphaned hashes is small. A garbage-sweep job can prune.
    set((s) => ({ photos: s.photos.filter((p) => p.id !== id) }));
    useObjectURLCache.delete(photo.blobHash);
  },

  async updatePhoto(id, patch) {
    const current = await db.photos.get(id);
    if (!current) return null;
    const next = { ...current, ...patch };
    await db.photos.put(next);
    set((s) => ({ photos: s.photos.map((p) => (p.id === id ? next : p)) }));
    return next;
  },
}));

/** Resolve a stored blob hash to a usable object URL, cached. */
export async function resolveObjectURL(hash) {
  if (!hash) return null;
  const cached = useObjectURLCache.get(hash);
  if (cached) return cached;
  const blob = await getBlob(hash);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  useObjectURLCache.set(hash, url);
  return url;
}

/**
 * Pull an ISO date from a JPEG's EXIF DateTimeOriginal tag, if present.
 * Implemented as a small linear scan over the first 64 KB so we never
 * pull a full Image into memory for a quick timestamp read.
 *
 * Returns null on any failure; falls back to capture time.
 */
async function tryExifTakenAt(file) {
  if (!file?.type?.startsWith('image/jpeg')) return null;
  try {
    const head = await file.slice(0, 65536).arrayBuffer();
    const view = new DataView(head);
    if (view.getUint16(0) !== 0xFFD8) return null;
    // Find APP1 (EXIF) segment
    let offset = 2;
    while (offset < view.byteLength - 4) {
      const marker = view.getUint16(offset);
      const size = view.getUint16(offset + 2);
      if (marker === 0xFFE1) {
        const exifStart = offset + 4;
        // "Exif\0\0" header
        if (view.getUint32(exifStart) === 0x45786966) {
          const tiffStart = exifStart + 6;
          const little = view.getUint16(tiffStart) === 0x4949;
          const ifdOffset = readU32(view, tiffStart + 4, little);
          const dt = findExifDateTime(view, tiffStart, tiffStart + ifdOffset, little);
          if (dt) return parseExifDate(dt);
        }
        return null;
      }
      offset += 2 + size;
    }
  } catch {
    return null;
  }
  return null;
}

function readU16(view, offset, little) { return little ? view.getUint16(offset, true) : view.getUint16(offset, false); }
function readU32(view, offset, little) { return little ? view.getUint32(offset, true) : view.getUint32(offset, false); }

function findExifDateTime(view, tiffStart, ifdStart, little) {
  if (ifdStart + 2 > view.byteLength) return null;
  const entryCount = readU16(view, ifdStart, little);
  for (let i = 0; i < entryCount; i++) {
    const entryOffset = ifdStart + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) return null;
    const tag = readU16(view, entryOffset, little);
    // 0x0132 = DateTime, 0x9003 = DateTimeOriginal (usually under ExifSubIFD)
    if (tag === 0x0132 || tag === 0x9003) {
      const count = readU32(view, entryOffset + 4, little);
      const valueOffset = readU32(view, entryOffset + 8, little);
      const dataStart = tiffStart + valueOffset;
      if (dataStart + count > view.byteLength) return null;
      const bytes = new Uint8Array(view.buffer, dataStart, count);
      return new TextDecoder('ascii').decode(bytes).replace(/\0+$/, '');
    }
  }
  return null;
}

function parseExifDate(s) {
  // EXIF format: 'YYYY:MM:DD HH:MM:SS'
  const m = s.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, Y, Mo, D, H, Mi, S] = m;
  return new Date(`${Y}-${Mo}-${D}T${H}:${Mi}:${S}`).toISOString();
}

export default usePhotoStore;
