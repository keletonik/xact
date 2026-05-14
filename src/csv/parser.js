import Papa from 'papaparse';

/**
 * Thin wrapper around PapaParse that returns a promise and normalises headers.
 */
export function parseCSV(file, { previewRows } = {}) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (h) => h.trim(),
      preview: previewRows ?? 0,
      complete: (result) => {
        if (result.errors && result.errors.length > 0) {
          const fatal = result.errors.find((e) => e.type === 'Quotes' || e.type === 'Delimiter');
          if (fatal) {
            reject(new Error(`CSV parse error: ${fatal.message}`));
            return;
          }
        }
        resolve({
          rows: result.data,
          headers: result.meta.fields ?? [],
          warnings: (result.errors || []).map((e) => e.message),
        });
      },
      error: (err) => reject(err),
    });
  });
}

/** Slugify a header for matching against mapping presets. */
export function normaliseHeader(header) {
  return String(header)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
