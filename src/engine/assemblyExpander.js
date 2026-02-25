import { resolveUnitPrice } from './pricingLayers';

/**
 * Assemblies are templates that expand into multiple estimate lines.
 * An assembly has a list of component items, each with a formula for quantity
 * relative to the assembly's "driver" quantity.
 *
 * Assembly structure:
 * {
 *   id, name, description, scope,
 *   driverUnit: 'ea' | 'm' | 'm²',
 *   components: [
 *     {
 *       itemId, itemName, category, unit, basePrice,
 *       quantityFormula: (driverQty, variables) => number,
 *       wastagePercent, slackPercent
 *     }
 *   ],
 *   variables: { heightWork: false, afterHours: false, ... }
 * }
 */

export function expandAssembly(assembly, driverQuantity, variables = {}, pricingContext = {}) {
  if (!assembly || !assembly.components) return [];

  const mergedVars = { ...assembly.variables, ...variables };

  return assembly.components.map((component) => {
    const rawQty = typeof component.quantityFormula === 'function'
      ? component.quantityFormula(driverQuantity, mergedVars)
      : driverQuantity * (component.quantityMultiplier || 1);

    let adjustedQty = rawQty;

    if (component.wastagePercent) {
      adjustedQty *= (1 + component.wastagePercent / 100);
    }
    if (component.slackPercent) {
      adjustedQty *= (1 + component.slackPercent / 100);
    }

    const unitRate = resolveUnitPrice(
      {
        id: component.itemId,
        basePrice: component.basePrice,
        category: component.category,
      },
      pricingContext
    );

    const total = roundToDP(adjustedQty * unitRate, 2);

    return {
      itemId: component.itemId,
      itemName: component.itemName,
      category: component.category,
      unit: component.unit,
      quantity: roundToDP(adjustedQty, 2),
      unitRate,
      total,
      assemblyId: assembly.id,
      assemblyName: assembly.name,
      wastagePercent: component.wastagePercent || 0,
      slackPercent: component.slackPercent || 0,
    };
  });
}

export function computeAssemblyUnitCost(assembly, pricingContext = {}) {
  const lines = expandAssembly(assembly, 1, {}, pricingContext);
  return lines.reduce((sum, l) => sum + l.total, 0);
}

export function batchExpandAssemblies(assemblies, quantities, variables = {}, pricingContext = {}) {
  const allLines = [];

  for (const assembly of assemblies) {
    const qty = quantities[assembly.id] || 0;
    if (qty <= 0) continue;
    const lines = expandAssembly(assembly, qty, variables, pricingContext);
    allLines.push(...lines);
  }

  return allLines;
}

function roundToDP(value, dp) {
  const factor = Math.pow(10, dp);
  return Math.round(value * factor) / factor;
}
