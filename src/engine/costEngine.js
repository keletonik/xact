import { expandAssembly } from './assemblyExpander';
import { computeEstimateTotals, computeLineTotal } from './markupCalculator';
import { resolveUnitPrice } from './pricingLayers';

/**
 * Central cost engine that coordinates pricing, assembly expansion,
 * and total computation for an entire estimate.
 */

export function buildEstimateFromTakeoff(takeoffObjects, mappings, assemblies, pricingContext) {
  const lines = [];

  for (const obj of takeoffObjects) {
    const mapping = mappings[obj.id];
    if (!mapping) continue;

    if (mapping.type === 'assembly') {
      const assembly = assemblies.find(a => a.id === mapping.assemblyId);
      if (!assembly) continue;

      const expanded = expandAssembly(assembly, obj.quantity, mapping.variables || {}, pricingContext);
      for (const line of expanded) {
        lines.push({
          ...line,
          takeoffObjectId: obj.id,
          zone: obj.zone,
          floor: obj.floor,
          system: obj.system,
        });
      }
    } else if (mapping.type === 'item') {
      const unitRate = resolveUnitPrice(
        { id: mapping.itemId, basePrice: mapping.basePrice, category: mapping.category },
        pricingContext,
      );
      lines.push({
        itemId: mapping.itemId,
        itemName: mapping.itemName,
        category: mapping.category,
        unit: mapping.unit,
        quantity: obj.quantity,
        unitRate,
        total: computeLineTotal(obj.quantity, unitRate),
        takeoffObjectId: obj.id,
        zone: obj.zone,
        floor: obj.floor,
        system: obj.system,
      });
    }
  }

  return lines;
}

export function recomputeEstimate(lines, markups, taxRate) {
  const recomputed = lines.map(line => ({
    ...line,
    total: computeLineTotal(line.quantity, line.unitRate),
  }));

  const totals = computeEstimateTotals(recomputed, markups, taxRate);

  return { lines: recomputed, totals };
}

export function createEstimateSnapshot(estimate) {
  return {
    snapshotAt: new Date().toISOString(),
    lines: JSON.parse(JSON.stringify(estimate.lines)),
    markups: { ...estimate.markups },
    totals: { ...estimate.totals },
    metadata: {
      lineCount: estimate.lines.length,
      totalExTax: estimate.totals.subtotalExTax,
      totalIncTax: estimate.totals.totalIncTax,
    },
  };
}

export function diffEstimateVersions(versionA, versionB) {
  const changes = [];
  const mapA = new Map(versionA.lines.map(l => [l.itemId + ':' + (l.takeoffObjectId || ''), l]));
  const mapB = new Map(versionB.lines.map(l => [l.itemId + ':' + (l.takeoffObjectId || ''), l]));

  for (const [key, lineB] of mapB) {
    const lineA = mapA.get(key);
    if (!lineA) {
      changes.push({ type: 'added', line: lineB });
    } else {
      const diffs = [];
      if (lineA.quantity !== lineB.quantity) {
        diffs.push({ field: 'quantity', from: lineA.quantity, to: lineB.quantity });
      }
      if (lineA.unitRate !== lineB.unitRate) {
        diffs.push({ field: 'unitRate', from: lineA.unitRate, to: lineB.unitRate });
      }
      if (lineA.total !== lineB.total) {
        diffs.push({ field: 'total', from: lineA.total, to: lineB.total });
      }
      if (diffs.length > 0) {
        changes.push({ type: 'modified', line: lineB, previousLine: lineA, diffs });
      }
    }
  }

  for (const [key, lineA] of mapA) {
    if (!mapB.has(key)) {
      changes.push({ type: 'removed', line: lineA });
    }
  }

  const totalDiff = {
    from: versionA.totals?.totalIncTax || 0,
    to: versionB.totals?.totalIncTax || 0,
    delta: (versionB.totals?.totalIncTax || 0) - (versionA.totals?.totalIncTax || 0),
  };

  return { changes, totalDiff, changeCount: changes.length };
}
