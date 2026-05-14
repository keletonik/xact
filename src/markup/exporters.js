import { formatArea, formatLength } from './geometry';
import { getSymbol } from './symbolLibrary';

/**
 * Build a take-off legend grouped by (symbolId | type | page).
 * Returns one row per group with quantity/length/area totals.
 */
export function buildLegend(markupDoc) {
  const groups = new Map();
  for (const page of markupDoc.pages) {
    for (const obj of page.objects) {
      const key = `${page.pageNumber}::${obj.metadata?.symbolId || obj.type}`;
      const existing = groups.get(key) || {
        page: page.pageNumber,
        type: obj.type,
        symbolId: obj.metadata?.symbolId || null,
        symbolName: obj.metadata?.symbolId ? getSymbol(obj.metadata.symbolId)?.name : null,
        productId: obj.metadata?.productId ?? null,
        assemblyId: obj.metadata?.assemblyId ?? null,
        count: 0,
        totalLengthMm: 0,
        totalAreaMm2: 0,
        displayUnit: page.displayUnit,
      };
      existing.count += obj.metadata?.quantity ?? 1;
      if (obj.type === 'length' || obj.type === 'line' || obj.type === 'arrow') {
        existing.totalLengthMm += obj.metadata?.measuredValueMm ?? 0;
      } else if (obj.type === 'area' || obj.type === 'rectangle' || obj.type === 'cloud') {
        existing.totalAreaMm2 += obj.metadata?.measuredValueMm ?? 0;
      }
      groups.set(key, existing);
    }
  }
  return Array.from(groups.values()).map((row) => ({
    ...row,
    displayLength: formatLength(row.totalLengthMm, row.displayUnit),
    displayArea: formatArea(row.totalAreaMm2, row.displayUnit),
  }));
}

/** Serialise a legend to CSV text. */
export function legendToCSV(legend) {
  const headers = ['Page', 'Type', 'Symbol', 'Count', 'Total length (mm)', 'Total area (mm²)', 'Product', 'Assembly'];
  const rows = legend.map((row) => [
    row.page,
    row.type,
    row.symbolName || row.symbolId || '',
    row.count,
    Math.round(row.totalLengthMm),
    Math.round(row.totalAreaMm2),
    row.productId || '',
    row.assemblyId || '',
  ]);
  return [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
}

function csvCell(value) {
  const s = value == null ? '' : String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/** Trigger a browser file download from a string. */
export function downloadString(filename, text, mime = 'text/csv') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
