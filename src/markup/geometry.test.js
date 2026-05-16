import { describe, expect, it } from 'vitest';
import {
  distancePx, polylineLengthPx, polygonAreaPx, polygonPerimeterPx,
  polygonAreaWithHolesPx, snapToGrid, orthoLock, pointInPolygon,
  formatLength, formatArea, pxToMm, angleDeg, formatAngle,
  revisionCloudPath,
} from './geometry';

describe('geometry', () => {
  it('distance is symmetric and zero for coincident', () => {
    expect(distancePx({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(distancePx({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
  });
  it('polyline length sums segments', () => {
    expect(polylineLengthPx([
      { x: 0, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 4 },
    ])).toBe(7);
  });
  it('polygon area: unit square', () => {
    expect(polygonAreaPx([
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 },
    ])).toBe(1);
  });
  it('polygon area: handles CW and CCW the same', () => {
    const ccw = polygonAreaPx([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]);
    const cw = polygonAreaPx([{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }]);
    expect(ccw).toBe(cw);
  });
  it('polygon perimeter: unit square == 4', () => {
    expect(polygonPerimeterPx([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }])).toBe(4);
  });
  it('polygon area with holes subtracts inner areas', () => {
    const outer = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }];
    const hole  = [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 }];
    expect(polygonAreaWithHolesPx(outer, [hole])).toBe(15);
  });
  it('polygon area with holes throws when hole area exceeds outer', () => {
    const outer = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }];
    // Hole of 9 sq units against outer of 4 sq units. Cannot be a valid hole.
    const hole = [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 3 }, { x: 0, y: 3 }];
    expect(() => polygonAreaWithHolesPx(outer, [hole])).toThrow(/hole area/);
  });
  it('snap to grid rounds to nearest', () => {
    expect(snapToGrid({ x: 12, y: 18 }, 10)).toEqual({ x: 10, y: 20 });
    expect(snapToGrid({ x: 5, y: 5 }, 0)).toEqual({ x: 5, y: 5 });
  });
  it('ortho lock picks dominant axis', () => {
    expect(orthoLock({ x: 0, y: 0 }, { x: 10, y: 3 })).toEqual({ x: 10, y: 0 });
    expect(orthoLock({ x: 0, y: 0 }, { x: 3, y: 10 })).toEqual({ x: 0, y: 10 });
  });
  it('point-in-polygon: inside vs outside', () => {
    const square = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
    expect(pointInPolygon({ x: 5, y: 5 }, square)).toBe(true);
    expect(pointInPolygon({ x: 15, y: 5 }, square)).toBe(false);
  });
  it('pxToMm respects scale', () => {
    expect(pxToMm(10, 2.5)).toBe(25);
  });
  it('formatters', () => {
    expect(formatLength(1234, 'mm')).toBe('1234 mm');
    expect(formatLength(1234, 'm')).toBe('1.23 m');
    expect(formatArea(2e6, 'm')).toBe('2.00 m²');
  });
  it('angle between BA and BC: right angle', () => {
    expect(angleDeg({ x: 10, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 10 })).toBeCloseTo(90, 1);
  });
  it('angle of a straight line is 180°', () => {
    expect(angleDeg({ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(180, 1);
  });
  it('angle: coincident points return 0 (defensive)', () => {
    expect(angleDeg({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 5, y: 5 })).toBe(0);
  });
  it('formatAngle prints degrees', () => {
    expect(formatAngle(45.123)).toBe('45.1°');
  });
});

describe('revisionCloudPath, bump arc generation', () => {
  // Regression: the previous implementation generated arc endpoints that
  // differed by ~0.001 px, collapsing the scallops into invisible dots.
  // These tests pin the new generator's externally-observable shape.

  const square = [
    { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 },
  ];

  it('returns empty for too-few points', () => {
    expect(revisionCloudPath([])).toBe('');
    expect(revisionCloudPath([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe('');
  });

  it('produces a closed path starting with M and ending with Z', () => {
    const d = revisionCloudPath(square, { bumpSize: 6, density: 0.05 });
    expect(d.startsWith('M ')).toBe(true);
    expect(d.endsWith(' Z')).toBe(true);
  });

  it('emits one or more arc commands for a non-degenerate polygon', () => {
    const d = revisionCloudPath(square, { bumpSize: 6, density: 0.05 });
    const arcCount = (d.match(/ A /g) || []).length;
    expect(arcCount).toBeGreaterThan(0);
  });

  it('arc endpoints are not collapsed onto the same point', () => {
    // The bug was that consecutive arc endpoints differed by 0.001 px,
    // producing visually invisible scallops. Verify endpoints are
    // separated by a meaningful distance.
    const d = revisionCloudPath(square, { bumpSize: 6, density: 0.05 });
    const arcPattern = / A [\d.]+ [\d.]+ 0 0 [01] ([\d.]+) ([\d.]+)/g;
    const endpoints = [];
    let m;
    while ((m = arcPattern.exec(d)) !== null) {
      endpoints.push({ x: parseFloat(m[1]), y: parseFloat(m[2]) });
    }
    expect(endpoints.length).toBeGreaterThan(2);
    // Consecutive endpoints should be at least 1 px apart for a 100-unit
    // square at density 0.05 (which gives ~5 bumps per side).
    for (let i = 1; i < endpoints.length; i++) {
      const dx = endpoints[i].x - endpoints[i - 1].x;
      const dy = endpoints[i].y - endpoints[i - 1].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      expect(dist).toBeGreaterThan(1);
    }
  });

  it('density controls bump count', () => {
    const sparse = revisionCloudPath(square, { bumpSize: 6, density: 0.02 });
    const dense  = revisionCloudPath(square, { bumpSize: 6, density: 0.1 });
    const sparseArcs = (sparse.match(/ A /g) || []).length;
    const denseArcs  = (dense.match(/ A /g) || []).length;
    expect(denseArcs).toBeGreaterThan(sparseArcs);
  });
});
