import { TAX_RATE } from '../utils/constants';

/**
 * Compute full estimate totals from line items + markups.
 *
 * Markups are applied sequentially to the net cost:
 *   Net → +Overhead → +Profit → +Contingency → +Risk → Subtotal → +Tax → Total
 *
 * Each markup is a percentage applied to the cumulative subtotal at that layer.
 */

export function computeEstimateTotals(lines, markups = {}, taxRate = TAX_RATE) {
  const materialCost = sumByCategory(lines, 'material');
  const labourCost = sumByCategory(lines, 'labour');
  const plantCost = sumByCategory(lines, 'plant');
  const subcontractCost = sumByCategory(lines, 'subcontract');
  const permitCost = sumByCategory(lines, 'permit');
  const preliminaryCost = sumByCategory(lines, 'preliminary');

  const directCost = materialCost + labourCost + plantCost + subcontractCost + permitCost + preliminaryCost;

  const overheadRate = markups.overhead || 0;
  const profitRate = markups.profit || 0;
  const contingencyRate = markups.contingency || 0;
  const riskRate = markups.risk || 0;

  const overheadAmount = round(directCost * overheadRate);
  const afterOverhead = directCost + overheadAmount;

  const profitAmount = round(afterOverhead * profitRate);
  const afterProfit = afterOverhead + profitAmount;

  const contingencyAmount = round(afterProfit * contingencyRate);
  const afterContingency = afterProfit + contingencyAmount;

  const riskAmount = round(afterContingency * riskRate);
  const subtotalExTax = round(afterContingency + riskAmount);

  const taxAmount = round(subtotalExTax * taxRate);
  const totalIncTax = round(subtotalExTax + taxAmount);

  const effectiveMargin = directCost > 0
    ? (subtotalExTax - directCost) / subtotalExTax
    : 0;

  return {
    breakdown: {
      material: round(materialCost),
      labour: round(labourCost),
      plant: round(plantCost),
      subcontract: round(subcontractCost),
      permit: round(permitCost),
      preliminary: round(preliminaryCost),
    },
    directCost: round(directCost),
    markups: {
      overhead: { rate: overheadRate, amount: overheadAmount },
      profit: { rate: profitRate, amount: profitAmount },
      contingency: { rate: contingencyRate, amount: contingencyAmount },
      risk: { rate: riskRate, amount: riskAmount },
    },
    subtotalExTax,
    taxRate,
    taxAmount,
    totalIncTax,
    effectiveMargin: round(effectiveMargin, 4),
    lineCount: lines.length,
  };
}

export function computeLineTotal(quantity, unitRate) {
  return round(quantity * unitRate);
}

export function reverseFromSellPrice(sellPrice, markups = {}, taxRate = TAX_RATE) {
  const taxMultiplier = 1 + taxRate;
  const exTax = sellPrice / taxMultiplier;

  const riskMultiplier = 1 + (markups.risk || 0);
  const contingencyMultiplier = 1 + (markups.contingency || 0);
  const profitMultiplier = 1 + (markups.profit || 0);
  const overheadMultiplier = 1 + (markups.overhead || 0);

  const directCost = exTax / (riskMultiplier * contingencyMultiplier * profitMultiplier * overheadMultiplier);
  return round(directCost);
}

function sumByCategory(lines, category) {
  return lines
    .filter(l => l.category === category)
    .reduce((sum, l) => sum + (l.total || 0), 0);
}

function round(value, dp = 2) {
  const factor = Math.pow(10, dp);
  return Math.round(value * factor) / factor;
}
