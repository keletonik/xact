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

const docCache = new Map();

export async function getPdfDocument(blob) {
  const cacheKey = await blobKey(blob);
  if (docCache.has(cacheKey)) return docCache.get(cacheKey);
  const pdfjs = await loadPdfJs();
  const buf = await blob.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: buf, isEvalSupported: false, disableFontFace: false });
  const doc = await loadingTask.promise;
  docCache.set(cacheKey, doc);
  return doc;
}

async function blobKey(blob) {
  return `${blob.size}:${blob.type}`;
}

/**
 * Render a page into a target <canvas> at a given pixel scale.
 * Returns { width, height } of the rendered page in CSS pixels.
 */
export async function renderPdfPage({ doc, pageNumber, canvas, scale = 1.5 }) {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const ctx = canvas.getContext('2d', { alpha: false });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;
  await page.render({ canvasContext: ctx, viewport }).promise;
  return { width: viewport.width, height: viewport.height };
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
  docCache.clear();
}
