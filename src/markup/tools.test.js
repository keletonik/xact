import { describe, expect, it } from 'vitest';
import { instantiateTool, TOOL_FACTORIES } from './tools';

const ctx = {
  pageNumber: 1,
  pageScale: { mmPerPx: 10, isCalibrated: true },
  activeLayerId: 'L1',
  snapGridPx: 0,
  orthoLocked: false,
  style: { stroke: '#000', fill: 'rgba(0,0,0,0.1)', strokeWidth: 2 },
  symbolId: null,
  productId: null,
  assemblyId: null,
};

describe('markup tools', () => {
  it('all factories produce a non-null tool', () => {
    for (const name of Object.keys(TOOL_FACTORIES)) {
      const t = instantiateTool(name);
      expect(t).toBeTruthy();
      expect(t.type).toBeTruthy();
    }
  });

  it('count tool commits a single object on click', () => {
    const t = instantiateTool('count');
    t.onPointerDown({ x: 10, y: 20 }, ctx);
    const out = t.commit();
    expect(out.type).toBe('count');
    expect(out.geometry.center).toEqual({ x: 10, y: 20 });
    expect(out.metadata.quantity).toBe(1);
  });

  it('length tool computes mm via the page scale', () => {
    const t = instantiateTool('length');
    t.onPointerDown({ x: 0, y: 0 }, ctx);
    t.onPointerDown({ x: 100, y: 0 }, ctx);
    const out = t.commit();
    // 100 px * 10 mm/px = 1000 mm
    expect(out.metadata.measuredValueMm).toBe(1000);
  });

  it('area tool requires at least 3 points', () => {
    const t = instantiateTool('area');
    t.onPointerDown({ x: 0, y: 0 }, ctx);
    t.onPointerDown({ x: 10, y: 0 }, ctx);
    expect(t.commit()).toBeNull();
  });

  it('area tool computes mm² via page scale²', () => {
    const t = instantiateTool('area');
    t.onPointerDown({ x: 0, y: 0 }, ctx);
    t.onPointerDown({ x: 10, y: 0 }, ctx);
    t.onPointerDown({ x: 10, y: 10 }, ctx);
    t.onPointerDown({ x: 0, y: 10 }, ctx);
    const out = t.commit();
    // 100 px² * (10 mm/px)² = 10,000 mm²
    expect(out.metadata.measuredValueMm).toBe(10000);
  });

  it('rectangle finalises on pointer up', () => {
    const t = instantiateTool('rectangle');
    t.onPointerDown({ x: 5, y: 5 }, ctx);
    t.onPointerMove({ x: 15, y: 20 }, ctx);
    const out = t.onPointerUp({ x: 15, y: 20 }, ctx);
    expect(out.type).toBe('rectangle');
    expect(out.geometry.width).toBe(10);
    expect(out.geometry.height).toBe(15);
  });

  it('unknown tool name throws', () => {
    expect(() => instantiateTool('nope')).toThrow();
  });

  it('perimeter computes mm via page scale and ignores area', () => {
    const t = instantiateTool('perimeter');
    t.onPointerDown({ x: 0, y: 0 }, ctx);
    t.onPointerDown({ x: 10, y: 0 }, ctx);
    t.onPointerDown({ x: 10, y: 10 }, ctx);
    t.onPointerDown({ x: 0, y: 10 }, ctx);
    const out = t.commit();
    // 4 sides × 10 px × 10 mm/px = 400 mm
    expect(out.metadata.measuredValueMm).toBe(400);
    expect(out.type).toBe('perimeter');
  });

  it('diameter measures the distance between two clicks', () => {
    const t = instantiateTool('diameter');
    t.onPointerDown({ x: 0, y: 0 }, ctx);
    const out = t.onPointerUp({ x: 30, y: 40 }, ctx);
    // distance 50 px × 10 mm/px = 500 mm
    expect(out.metadata.measuredValueMm).toBe(500);
    expect(out.geometry.radius).toBe(25);
  });

  it('cloud commits a polygon (not a rectangle) once 3+ points are placed', () => {
    const t = instantiateTool('cloud');
    t.onPointerDown({ x: 0, y: 0 }, ctx);
    t.onPointerDown({ x: 10, y: 0 }, ctx);
    t.onPointerDown({ x: 5, y: 10 }, ctx);
    const out = t.commit();
    expect(out).toBeTruthy();
    expect(out.type).toBe('cloud');
    expect(out.geometry.points).toHaveLength(3);
    expect(out.geometry.closed).toBe(true);
  });

  it('cloud refuses to commit with fewer than 3 points', () => {
    const t = instantiateTool('cloud');
    t.onPointerDown({ x: 0, y: 0 }, ctx);
    t.onPointerDown({ x: 10, y: 0 }, ctx);
    expect(t.commit()).toBeNull();
  });

  it('callout commits on second click with anchor + box', () => {
    const t = instantiateTool('callout');
    expect(t.onPointerDown({ x: 50, y: 50 }, ctx)).toBeNull();
    const out = t.onPointerDown({ x: 100, y: 100 }, ctx);
    expect(out).toBeTruthy();
    expect(out.type).toBe('callout');
    expect(out.geometry.anchor).toEqual({ x: 50, y: 50 });
    expect(out.geometry.box.x).toBe(100);
    expect(out.geometry.box.y).toBe(100);
  });

  it('hyperlink commits with metadata.url initialised', () => {
    const t = instantiateTool('hyperlink');
    t.onPointerDown({ x: 0, y: 0 }, ctx);
    const out = t.onPointerUp({ x: 30, y: 20 }, ctx);
    expect(out.type).toBe('hyperlink');
    expect(out.metadata.url).toBe('');
    expect(out.geometry.width).toBe(30);
    expect(out.geometry.height).toBe(20);
  });

  it('angle commits on the third click and computes 90°', () => {
    const t = instantiateTool('angle');
    t.onPointerDown({ x: 10, y: 0 }, ctx);
    t.onPointerDown({ x: 0, y: 0 }, ctx);
    const out = t.onPointerDown({ x: 0, y: 10 }, ctx);
    expect(out.type).toBe('angle');
    expect(out.metadata.angleDeg).toBeCloseTo(90, 1);
  });
});
