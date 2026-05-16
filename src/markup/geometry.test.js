import { describe, expect, it } from 'vitest';
import {
  distancePx, polylineLengthPx, polygonAreaPx, polygonPerimeterPx,
  polygonAreaWithHolesPx, snapToGrid, orthoLock, pointInPolygon,
  formatLength, formatArea, pxToMm, angleDeg, formatAngle,
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
