import Papa from 'papaparse';

/**
 * Unified spreadsheet parser. Accepts CSV (text/csv, .csv) and Excel
 * (.xlsx, .xls) via SheetJS. Returns the same shape regardless of source:
 *   { rows: Array<Record<string,string>>, headers: string[], warnings: string[] }
 *
 * For CSV we use PapaParse (streamable, fastest path).
 * For Excel we lazy-load `xlsx` so the dep doesn't land in the initial bundle.
 */
export async function parseSpreadsheet(file, { previewRows } = {}) {
  const name = file.name?.toLowerCase() ?? '';
  if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.ods')) {
    return parseExcel(file, { previewRows });
  }
  return parseCSV(file, { previewRows });
}

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

async function parseExcel(file, { previewRows } = {}) {
  const XLSX = await import('xlsx');
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array', cellDates: true });
  // Heuristic: pick the first non-empty sheet.
  const sheetName = wb.SheetNames.find((n) => {
    const s = wb.Sheets[n];
    return s['!ref'] && s['!ref'] !== 'A1';
  }) || wb.SheetNames[0];
  if (!sheetName) {
    return { rows: [], headers: [], warnings: ['Workbook contains no sheets'] };
  }
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const trimmed = previewRows && previewRows > 0 ? rows.slice(0, previewRows) : rows;
  const sheetsOther = wb.SheetNames.filter((n) => n !== sheetName);
  const warnings = sheetsOther.length > 0
    ? [`Imported sheet "${sheetName}". Other sheets ignored: ${sheetsOther.join(', ')}.`]
    : [];
  return { rows: trimmed, headers, warnings };
}

/** Slugify a header for matching against mapping presets. */
export function normaliseHeader(header) {
  return String(header)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
