import { parseSpreadsheet } from '../csv/parser';
import { autoMapHeaders } from '../csv/mappingPresets';
import { applyProductImport, planProductImport } from '../csv/importPipeline';

/**
 * One-click bootstrap: load the bundled Flamesafe simPRO product export and
 * import it into the catalog using the auto-detected column mapping.
 *
 * The file lives at /public/seed/flamesafe-products.csv so it's served as a
 * static asset (Vercel/Replit/dev all the same path). We fetch it, hand it
 * to the same pipeline a manual upload uses, and surface the dry-run summary
 * so the caller can show a preview before applying.
 */
const FLAMESAFE_URL = '/seed/flamesafe-products.csv';

export async function planFlamesafeSeed() {
  const res = await fetch(FLAMESAFE_URL);
  if (!res.ok) throw new Error(`Could not fetch seed file (${res.status})`);
  const blob = await res.blob();
  const file = new File([blob], 'flamesafe-products.csv', { type: 'text/csv' });
  const parsed = await parseSpreadsheet(file);
  const mapping = autoMapHeaders(parsed.headers, 'PRODUCT');
  const plan = await planProductImport(parsed.rows, mapping);
  return { parsed, mapping, plan };
}

export async function applyFlamesafeSeed(plan) {
  return applyProductImport(plan);
}

/**
 * Equivalent helper for the supplier-price master Excel workbook.
 */
const SUPPLIER_PRICE_URL = '/seed/supplier-price-list-master.xlsx';

export async function planSupplierPriceSeed() {
  const res = await fetch(SUPPLIER_PRICE_URL);
  if (!res.ok) throw new Error(`Could not fetch seed file (${res.status})`);
  const blob = await res.blob();
  const file = new File([blob], 'supplier-price-list-master.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const parsed = await parseSpreadsheet(file);
  const mapping = autoMapHeaders(parsed.headers, 'SUPPLIER_PRICE');
  return { parsed, mapping };
}
