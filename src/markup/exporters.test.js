import { describe, expect, it } from 'vitest';
import { buildLegend, legendToCSV } from './exporters';

function makeDoc(objects, pageNumber = 1, displayUnit = 'm') {
  return { pages: [{ pageNumber, displayUnit, objects }] };
}

function lengthObj({ symbolId = null, productId = null, assemblyId = null, mm = 1000 } = {}) {
  return {
    type: 'length',
    metadata: { symbolId, productId, assemblyId, quantity: 1, measuredValueMm: mm },
  };
}

function countObj({ symbolId, productId = null, assemblyId = null } = {}) {
  return {
    type: 'count',
    metadata: { symbolId, productId, assemblyId, quantity: 1, measuredValueMm: 0 },
  };
}

function areaObj({ mm2 = 1000000 } = {}) {
  return {
    type: 'area',
    metadata: { quantity: 1, measuredValueMm: mm2 },
  };
}

describe('buildLegend', () => {
  it('groups objects with the same symbol on the same page', () => {
    const doc = makeDoc([
      countObj({ symbolId: 'spr_upright' }),
      countObj({ symbolId: 'spr_upright' }),
      countObj({ symbolId: 'spr_pendant' }),
    ]);
    const legend = buildLegend(doc);
    expect(legend).toHaveLength(2);
    const upright = legend.find((r) => r.symbolId === 'spr_upright');
    expect(upright.count).toBe(2);
  });

  it('splits rows for the same symbol when productId differs', () => {
    // Regression: previous grouping key was (page, symbolId-or-type) only.
    // Two technicians mapping the same symbol to different product codes
    // silently collapsed and the second mapping was lost.
    const doc = makeDoc([
      countObj({ symbolId: 'spr_upright', productId: 'PROD-A' }),
      countObj({ symbolId: 'spr_upright', productId: 'PROD-B' }),
    ]);
    const legend = buildLegend(doc);
    expect(legend).toHaveLength(2);
    const products = legend.map((r) => r.productId).sort();
    expect(products).toEqual(['PROD-A', 'PROD-B']);
  });

  it('splits rows when assemblyId differs', () => {
    const doc = makeDoc([
      countObj({ symbolId: 'spr_pendant', assemblyId: 'ASM-1' }),
      countObj({ symbolId: 'spr_pendant', assemblyId: 'ASM-2' }),
    ]);
    const legend = buildLegend(doc);
    expect(legend).toHaveLength(2);
  });

  it('separates rows across pages', () => {
    const doc = {
      pages: [
        { pageNumber: 1, displayUnit: 'm', objects: [countObj({ symbolId: 'spr_upright' })] },
        { pageNumber: 2, displayUnit: 'm', objects: [countObj({ symbolId: 'spr_upright' })] },
      ],
    };
    const legend = buildLegend(doc);
    expect(legend).toHaveLength(2);
  });

  it('sums totalLengthMm for length/line/arrow objects', () => {
    const doc = makeDoc([
      lengthObj({ mm: 1500 }),
      lengthObj({ mm: 2500 }),
    ]);
    const legend = buildLegend(doc);
    expect(legend[0].totalLengthMm).toBe(4000);
    expect(legend[0].totalAreaMm2).toBe(0);
  });

  it('sums totalAreaMm2 for area/rectangle/cloud objects', () => {
    const doc = makeDoc([areaObj({ mm2: 500000 }), areaObj({ mm2: 1500000 })]);
    const legend = buildLegend(doc);
    expect(legend[0].totalAreaMm2).toBe(2000000);
    expect(legend[0].totalLengthMm).toBe(0);
  });

  it('formats display strings using the page displayUnit', () => {
    const doc = makeDoc([lengthObj({ mm: 1234 })], 1, 'mm');
    const legend = buildLegend(doc);
    expect(legend[0].displayLength).toBe('1234 mm');
  });
});

describe('legendToCSV', () => {
  it('emits the expected header row', () => {
    const csv = legendToCSV([]);
    expect(csv).toContain('Page,Type,Symbol,Count,Total length (mm),Total area (mm²),Product,Assembly');
  });

  it('escapes commas, quotes, and newlines in fields', () => {
    const legend = [{
      page: 1, type: 'count', symbolName: 'a, b "c"\nd', symbolId: null,
      productId: null, assemblyId: null, count: 1,
      totalLengthMm: 0, totalAreaMm2: 0, displayUnit: 'm',
    }];
    const csv = legendToCSV(legend);
    expect(csv).toContain('"a, b ""c""\nd"');
  });

  it('rounds totalLengthMm and totalAreaMm2 to integers in CSV', () => {
    const legend = [{
      page: 1, type: 'length', symbolName: null, symbolId: null,
      productId: null, assemblyId: null, count: 1,
      totalLengthMm: 1234.789, totalAreaMm2: 9876.123, displayUnit: 'm',
    }];
    const csv = legendToCSV(legend);
    expect(csv).toContain(',1235,9876,');
  });
});
