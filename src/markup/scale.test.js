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

describe('scale, regression: isCalibrated detection', () => {
  // Previously `Boolean(options.mmPerPx)` treated a literal mmPerPx of 1
  // as falsy because of the implicit nominal-scale collision. The fixed
  // implementation uses `!= null` so an explicitly-passed 1 reads as
  // calibrated, while an absent option reads as nominal.
  it('explicit mmPerPx of 1 is treated as calibrated', () => {
    const p = makePage(1, { mmPerPx: 1 });
    expect(p.scale.isCalibrated).toBe(true);
    expect(p.scale.mmPerPx).toBe(1);
  });

  it('explicit mmPerPx of 0.5 is treated as calibrated', () => {
    const p = makePage(1, { mmPerPx: 0.5 });
    expect(p.scale.isCalibrated).toBe(true);
    expect(p.scale.mmPerPx).toBe(0.5);
  });

  it('absent mmPerPx is treated as uncalibrated and falls back to nominal', () => {
    const p = makePage(1, {});
    expect(p.scale.isCalibrated).toBe(false);
    expect(p.scale.mmPerPx).toBe(1);
  });

  it('mmPerPx of null is treated as uncalibrated', () => {
    const p = makePage(1, { mmPerPx: null });
    expect(p.scale.isCalibrated).toBe(false);
  });
});
