import { normaliseHeader } from './parser';

/**
 * Canonical target fields the import pipeline understands.
 * Keep this list in sync with src/catalog/productSchema.js.
 */
export const TARGET_FIELDS = {
  PRODUCT: [
    { key: 'sku', label: 'SKU / Part #', required: true },
    { key: 'name', label: 'Name / Description', required: true },
    { key: 'category', label: 'Category', required: false },
    { key: 'unit', label: 'Unit', required: false },
    { key: 'brand', label: 'Brand', required: false },
    { key: 'model', label: 'Model', required: false },
    { key: 'manufacturer', label: 'Manufacturer', required: false },
    { key: 'basePrice', label: 'Base price ($)', required: true },
    { key: 'currency', label: 'Currency', required: false },
    { key: 'gtin', label: 'GTIN / Barcode', required: false },
    { key: 'datasheetUrl', label: 'Datasheet URL', required: false },
  ],
  SUPPLIER_PRICE: [
    { key: 'sku', label: 'Product SKU', required: true },
    { key: 'supplierName', label: 'Supplier name', required: true },
    { key: 'supplierSku', label: 'Supplier SKU', required: false },
    { key: 'unitPrice', label: 'Unit price ($)', required: true },
    { key: 'currency', label: 'Currency', required: false },
    { key: 'moq', label: 'Min order qty', required: false },
    { key: 'packSize', label: 'Pack size', required: false },
    { key: 'freight', label: 'Freight ($)', required: false },
    { key: 'leadTimeDays', label: 'Lead time (days)', required: false },
    { key: 'effectiveFrom', label: 'Effective from', required: false },
    { key: 'sourceUrl', label: 'Source URL', required: false },
  ],
};

/**
 * Header alias map. Each entry is target-field-key → array of acceptable headers
 * (already normalised). When multiple preset hits compete, the first match wins.
 */
const ALIASES = {
  PRODUCT: {
    sku: ['sku', 'part_no', 'part_number', 'partnumber', 'code', 'item_code', 'product_code', 'stock_code'],
    name: ['name', 'description', 'product_name', 'item_name', 'product_description', 'desc'],
    category: ['category', 'group', 'class', 'product_class'],
    unit: ['unit', 'uom', 'unit_of_measure'],
    brand: ['brand', 'make'],
    model: ['model'],
    manufacturer: ['manufacturer', 'mfr', 'maker'],
    basePrice: ['price', 'list_price', 'rrp', 'unit_price', 'base_price', 'cost'],
    currency: ['currency', 'ccy'],
    gtin: ['gtin', 'barcode', 'ean', 'upc'],
    datasheetUrl: ['datasheet', 'datasheet_url', 'specsheet', 'url'],
  },
  SUPPLIER_PRICE: {
    sku: ['sku', 'product_sku', 'part_no', 'part_number', 'our_sku'],
    supplierName: ['supplier', 'supplier_name', 'vendor', 'vendor_name'],
    supplierSku: ['supplier_sku', 'vendor_sku', 'supplier_part'],
    unitPrice: ['unit_price', 'price', 'cost', 'net_price', 'list_price'],
    currency: ['currency', 'ccy'],
    moq: ['moq', 'min_order_qty', 'minimum_order'],
    packSize: ['pack_size', 'pack', 'qty_per_pack', 'units_per_pack'],
    freight: ['freight', 'shipping', 'delivery'],
    leadTimeDays: ['lead_time', 'lead_time_days', 'leadtime'],
    effectiveFrom: ['effective_from', 'effective_date', 'date'],
    sourceUrl: ['source', 'source_url', 'url'],
  },
};

/**
 * Given an array of raw CSV headers, return a mapping target-key → header.
 * Unmapped targets are absent from the result (the wizard then prompts the user).
 */
export function autoMapHeaders(headers, kind) {
  const aliasMap = ALIASES[kind] || {};
  const normalised = headers.map((h) => ({ raw: h, key: normaliseHeader(h) }));
  const mapping = {};
  for (const [targetKey, aliases] of Object.entries(aliasMap)) {
    const match = normalised.find((h) => aliases.includes(h.key));
    if (match) mapping[targetKey] = match.raw;
  }
  return mapping;
}
