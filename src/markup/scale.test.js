import { describe, expect, it } from 'vitest';
import { applyDrawingScale, calibratePage, makePage } from './scale';

describe('scale', () => {
  it('makePage starts uncalibrated', () => {
    const p = makePage(1);
    expect(p.scale.isCalibrated).toBe(false);
    expect(p.scale.mmPerPx).toBe(1);
    expect(p.layers).toHaveLength(1);
  });
  it('two-point calibration sets mmPerPx', () => {
    const p = makePage(1);
    const cal = calibratePage(p, { x: 0, y: 0 }, { x: 100, y: 0 }, 1000);
    expect(cal.scale.isCalibrated).toBe(true);
    expect(cal.scale.mmPerPx).toBe(10);
  });
  it('drawing scale 1:100 at 96 dpi gives ≈26.46 mm/px', () => {
    const p = applyDrawingScale(makePage(1), 100, 96);
    expect(p.scale.mmPerPx).toBeCloseTo(26.458, 2);
  });
  it('rejects bad inputs', () => {
    expect(() => calibratePage(makePage(1), { x: 0, y: 0 }, { x: 100, y: 0 }, 0)).toThrow();
    expect(() => calibratePage(makePage(1), { x: 0, y: 0 }, { x: 0, y: 0 }, 1000)).toThrow();
  });
});
