/**
 * Lazy PDF rendering helper. Wraps pdfjs-dist with a per-document cache so we
 * don't re-parse the same blob when navigating pages.
 *
 * pdf.js requires a worker. We use Vite's `?url` import to ship the worker as
 * a static asset.
 */

let pdfjsPromise = null;

async function loadPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import('pdfjs-dist');
      const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

// Two caches, keyed differently. The WeakMap keys by Blob identity:
// when the caller passes the same Blob instance twice we return the
// already-parsed document with zero work and zero GC pressure. The
// Map is the cross-instance cache, keyed by a real content hash, so
// two Blobs holding the same bytes hit once.
//
// The old key was `${size}:${type}` which collides for two different
// PDFs of identical size + mime type. Real risk for revisioned
// drawings where revisions are commonly within bytes of each other.
const docCacheByBlob = new WeakMap();
const docCacheByHash = new Map();

export async function getPdfDocument(blob) {
  const hit = docCacheByBlob.get(blob);
  if (hit) return hit;
  const hash = await blobHash(blob);
  const cached = docCacheByHash.get(hash);
  if (cached) {
    docCacheByBlob.set(blob, cached);
    return cached;
  }
  const pdfjs = await loadPdfJs();
  const buf = await blob.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: buf, isEvalSupported: false, disableFontFace: false });
  const doc = await loadingTask.promise;
  docCacheByBlob.set(blob, doc);
  docCacheByHash.set(hash, doc);
  return doc;
}

async function blobHash(blob) {
  const buf = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Render a page into a target <canvas> at a given pixel scale.
 * Returns { width, height, cancel } where cancel() aborts the
 * in-flight render. Pdf.js's RenderTask continues even when the
 * caller forgets it, so the canvas can end up half-painted by an
 * outdated page if the React effect re-fires before the previous
 * render finishes. The cancel handle lets the caller abort cleanly.
 */
export function renderPdfPage({ doc, pageNumber, canvas, scale = 1.5 }) {
  let renderTask = null;
  let cancelled = false;
  const promise = (async () => {
    const page = await doc.getPage(pageNumber);
    if (cancelled) throw new RenderCancelled();
    const viewport = page.getViewport({ scale });
    const ctx = canvas.getContext('2d', { alpha: false });
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    renderTask = page.render({ canvasContext: ctx, viewport });
    try {
      await renderTask.promise;
    } catch (e) {
      if (cancelled || e?.name === 'RenderingCancelledException') throw new RenderCancelled();
      throw e;
    }
    return { width: viewport.width, height: viewport.height };
  })();
  return {
    promise,
    cancel() {
      cancelled = true;
      if (renderTask) {
        try { renderTask.cancel(); } catch { /* idempotent */ }
      }
    },
  };
}

export class RenderCancelled extends Error {
  constructor() { super('render cancelled'); this.name = 'RenderCancelled'; }
}

/**
 * Render an image (PNG, JPG, TIFF) into a target canvas at native size.
 * For TIFF we fall back to bitmap creation (works in Chromium >=88, Firefox).
 */
export async function renderImage({ blob, canvas, scale = 1 }) {
  const bitmap = await createImageBitmap(blob);
  const width = bitmap.width * scale;
  const height = bitmap.height * scale;
  canvas.width = Math.floor(width);
  canvas.height = Math.floor(height);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, width, height);
  return { width, height };
}

export function clearPdfCache() {
  // WeakMap has no clear(); entries vanish when their Blob is GC'd.
  // The hash map is the long-lived one and gets emptied here.
  docCacheByHash.clear();
}
