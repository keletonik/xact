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
    expect(out.metadata.measuredValueMm).toBe(400);
    expect(out.type).toBe('perimeter');
  });

  it('diameter measures the distance between two clicks', () => {
    const t = instantiateTool('diameter');
    t.onPointerDown({ x: 0, y: 0 }, ctx);
    const out = t.onPointerUp({ x: 30, y: 40 }, ctx);
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

describe('markup tools, regression: zero-size guards', () => {
  // Pin the no-op behaviour for click-without-drag gestures.
  it('rectangle: click-without-drag returns null', () => {
    const t = instantiateTool('rectangle');
    t.onPointerDown({ x: 5, y: 5 }, ctx);
    const out = t.onPointerUp({ x: 5, y: 5 }, ctx);
    expect(out).toBeNull();
  });

  it('rectangle: sub-pixel drag returns null', () => {
    const t = instantiateTool('rectangle');
    t.onPointerDown({ x: 5, y: 5 }, ctx);
    const out = t.onPointerUp({ x: 5.5, y: 5.5 }, ctx);
    expect(out).toBeNull();
  });

  it('line: click-without-drag returns null', () => {
    const t = instantiateTool('line');
    t.onPointerDown({ x: 10, y: 10 }, ctx);
    const out = t.onPointerUp({ x: 10, y: 10 }, ctx);
    expect(out).toBeNull();
  });

  it('arrow: click-without-drag returns null', () => {
    const t = instantiateTool('arrow');
    t.onPointerDown({ x: 0, y: 0 }, ctx);
    const out = t.onPointerUp({ x: 0, y: 0 }, ctx);
    expect(out).toBeNull();
  });

  it('diameter: click-without-drag returns null', () => {
    const t = instantiateTool('diameter');
    t.onPointerDown({ x: 0, y: 0 }, ctx);
    const out = t.onPointerUp({ x: 0, y: 0 }, ctx);
    expect(out).toBeNull();
  });

  it('hyperlink: click-without-drag returns null', () => {
    const t = instantiateTool('hyperlink');
    t.onPointerDown({ x: 0, y: 0 }, ctx);
    const out = t.onPointerUp({ x: 0, y: 0 }, ctx);
    expect(out).toBeNull();
  });
});

describe('markup tools, regression: preview cursor seeding', () => {
  // After pointer-down but before any pointer-move, the tool should render
  // a zero-area placeholder so the user sees immediate feedback.
  it('rectangle: getPreview returns a shape after pointer-down only', () => {
    const t = instantiateTool('rectangle');
    t.onPointerDown({ x: 5, y: 5 }, ctx);
    const preview = t.getPreview();
    expect(preview).not.toBeNull();
    expect(preview.type).toBe('rectangle');
    expect(preview.geometry.width).toBe(0);
    expect(preview.geometry.height).toBe(0);
  });

  it('line: getPreview returns a shape after pointer-down only', () => {
    const t = instantiateTool('line');
    t.onPointerDown({ x: 5, y: 5 }, ctx);
    const preview = t.getPreview();
    expect(preview).not.toBeNull();
    expect(preview.geometry.from).toEqual({ x: 5, y: 5 });
    expect(preview.geometry.to).toEqual({ x: 5, y: 5 });
  });

  it('diameter: getPreview returns a shape after pointer-down only', () => {
    const t = instantiateTool('diameter');
    t.onPointerDown({ x: 0, y: 0 }, ctx);
    const preview = t.getPreview();
    expect(preview).not.toBeNull();
    expect(preview.geometry.radius).toBe(0);
  });

  it('callout: getPreview returns a shape after first click', () => {
    const t = instantiateTool('callout');
    t.onPointerDown({ x: 20, y: 20 }, ctx);
    const preview = t.getPreview();
    expect(preview).not.toBeNull();
    expect(preview.geometry.anchor).toEqual({ x: 20, y: 20 });
  });
});

describe('markup tools, regression: hyperlink preview type', () => {
  it('preview type is hyperlink, not rectangle', () => {
    const t = instantiateTool('hyperlink');
    t.onPointerDown({ x: 0, y: 0 }, ctx);
    t.onPointerMove({ x: 20, y: 20 }, ctx);
    const preview = t.getPreview();
    expect(preview.type).toBe('hyperlink');
  });
});

describe('markup tools, regression: point isolation', () => {
  // Geometry stored on a tool must not alias the caller's point object.
  it('mutating the caller point after onPointerDown does not affect stored geometry', () => {
    const t = instantiateTool('count');
    const point = { x: 50, y: 50 };
    t.onPointerDown(point, ctx);
    point.x = 999;
    point.y = 999;
    const out = t.commit();
    expect(out.geometry.center.x).toBe(50);
    expect(out.geometry.center.y).toBe(50);
  });

  it('mutating the caller point after pushing onto a polyline tool does not affect stored geometry', () => {
    const t = instantiateTool('length');
    const a = { x: 0, y: 0 };
    const b = { x: 100, y: 0 };
    t.onPointerDown(a, ctx);
    t.onPointerDown(b, ctx);
    a.x = 999; b.x = 999;
    const out = t.commit();
    expect(out.geometry.points[0]).toEqual({ x: 0, y: 0 });
    expect(out.geometry.points[1]).toEqual({ x: 100, y: 0 });
  });
});
