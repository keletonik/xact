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

/**
 * Strip prototype-pollution vectors from a parsed row. Some upstream parsers
 * (notably SheetJS) preserve `__proto__` / `constructor` / `prototype` keys
 * verbatim if they appear in the source file — passing those into the rest of
 * the pipeline could mutate Object.prototype downstream.
 *
 * Defensive only: we don't trust user-uploaded spreadsheets.
 * See xlsx advisory GHSA-4r6h-8v6p-xvw6.
 */
const DENY_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
function sanitiseRow(row) {
  const out = Object.create(null);
  for (const key of Object.keys(row)) {
    if (DENY_KEYS.has(key)) continue;
    out[key] = row[key];
  }
  return out;
}

/**
 * Parse Excel files via ExcelJS (npm-maintained, 0 known vulnerabilities).
 *
 * Replaces SheetJS (xlsx@0.18.5), which has unpatched advisories
 * GHSA-4r6h-8v6p-xvw6 and GHSA-5pgg-2g8v-p4x9 that SheetJS will not fix on
 * the npm distribution.
 */
async function parseExcel(file, { previewRows } = {}) {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  const buf = await file.arrayBuffer();
  await wb.xlsx.load(buf);

  // Pick the first sheet that has rows.
  const ws = wb.worksheets.find((w) => w.rowCount > 0) || wb.worksheets[0];
  if (!ws) {
    return { rows: [], headers: [], warnings: ['Workbook contains no sheets'] };
  }

  // Read header row (first non-empty row).
  let headerRowIdx = 1;
  while (headerRowIdx <= ws.rowCount && !ws.getRow(headerRowIdx).hasValues) headerRowIdx++;
  const headerCells = ws.getRow(headerRowIdx).values || [];
  // ExcelJS row.values is 1-indexed (values[0] is undefined). Trim.
  const headers = headerCells.slice(1).map((h) => String(h ?? '').trim()).filter(Boolean);

  const rows = [];
  for (let r = headerRowIdx + 1; r <= ws.rowCount; r++) {
    if (previewRows && rows.length >= previewRows) break;
    const cells = ws.getRow(r).values || [];
    // Skip fully-empty rows.
    if (cells.slice(1).every((v) => v == null || v === '')) continue;
    const obj = Object.create(null);
    for (let i = 0; i < headers.length; i++) {
      const v = cells[i + 1];
      obj[headers[i]] = formatCell(v);
    }
    rows.push(obj);
  }

  const sheetsOther = wb.worksheets.filter((w) => w.id !== ws.id).map((w) => w.name);
  const warnings = sheetsOther.length > 0
    ? [`Imported sheet "${ws.name}". Other sheets ignored: ${sheetsOther.join(', ')}.`]
    : [];
  return { rows, headers, warnings };
}

function formatCell(v) {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object') {
    // ExcelJS represents hyperlinks/rich text/formulas as objects — pull out a text value.
    if ('text' in v && typeof v.text === 'string') return v.text;
    if ('result' in v) return String(v.result ?? '');
    if ('richText' in v && Array.isArray(v.richText)) {
      return v.richText.map((r) => r.text || '').join('');
    }
    if ('hyperlink' in v) return v.hyperlink;
    return String(v.toString());
  }
  return String(v);
}

// Exported for testing the sanitiser in isolation.
export { sanitiseRow as _sanitiseRow };

/** Slugify a header for matching against mapping presets. */
export function normaliseHeader(header) {
  return String(header)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
