import { centsToDollars } from './productSchema';

/**
 * Resolve the best supplier price for a product at a given date.
 *
 * Selection rules, in priority order:
 *   1. Preferred supplier (isPreferred=true), if the price is currently effective.
 *   2. Lowest landed-cost-per-unit (price + freight allocated across MOQ), effective today.
 *   3. Most recently uploaded effective price.
 */
export function bestSupplierPrice(prices, asOf = new Date().toISOString()) {
  const active = prices.filter((p) => isEffective(p, asOf));
  if (active.length === 0) return null;

  const preferred = active.filter((p) => p.isPreferred);
  if (preferred.length > 0) {
    return preferred.sort(byLandedAsc)[0];
  }
  return active.sort(byLandedAsc)[0];
}

export function landedCentsPerUnit(price) {
  const fx = price.fxRateToAUD ?? 1;
  const base = price.unitPriceCents * fx;
  const moq = price.moq && price.moq > 0 ? price.moq : 1;
  const freight = (price.freightCents ?? 0) / moq;
  return Math.round(base + freight);
}

function byLandedAsc(a, b) {
  return landedCentsPerUnit(a) - landedCentsPerUnit(b);
}

function isEffective(price, asOf) {
  const from = new Date(price.effectiveFrom).getTime();
  const to = price.effectiveTo ? new Date(price.effectiveTo).getTime() : Infinity;
  const t = new Date(asOf).getTime();
  return t >= from && t <= to;
}

/**
 * Summarise the multi-supplier alternatives for a product. Returns a sorted
 * list with deltas relative to the cheapest.
 */
export function compareSuppliers(prices, suppliers, asOf = new Date().toISOString()) {
  const active = prices.filter((p) => isEffective(p, asOf));
  if (active.length === 0) return [];
  const sorted = [...active].sort(byLandedAsc);
  const cheapest = landedCentsPerUnit(sorted[0]);
  return sorted.map((p) => {
    const supplier = suppliers.find((s) => s.id === p.supplierId);
    const landed = landedCentsPerUnit(p);
    return {
      supplierId: p.supplierId,
      supplierName: supplier?.name ?? 'Unknown',
      unitPriceCents: p.unitPriceCents,
      landedCentsPerUnit: landed,
      freightCents: p.freightCents,
      moq: p.moq,
      leadTimeDays: p.leadTimeDays,
      deltaCents: landed - cheapest,
      deltaPct: cheapest > 0 ? (landed - cheapest) / cheapest : 0,
      currency: p.currency,
      effectiveFrom: p.effectiveFrom,
      isPreferred: p.isPreferred,
      displayLanded: centsToDollars(landed),
    };
  });
}
