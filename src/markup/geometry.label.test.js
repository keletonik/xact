import { describe, expect, it } from 'vitest';
import { midpoint, polylineMidpoint, polygonCentroid, labelAnchorFor, revisionCloudPath } from './geometry';

describe('geometry — label / centroid helpers', () => {
  it('midpoint of two points', () => {
    expect(midpoint({ x: 0, y: 0 }, { x: 10, y: 20 })).toEqual({ x: 5, y: 10 });
  });
  it('polyline midpoint hits the middle of a straight segment', () => {
    const m = polylineMidpoint([{ x: 0, y: 0 }, { x: 10, y: 0 }]);
    expect(m.x).toBeCloseTo(5, 5);
    expect(m.y).toBeCloseTo(0, 5);
  });
  it('polyline midpoint is at the joint of two equal segments', () => {
    const m = polylineMidpoint([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }]);
    // Total length 20; midpoint at distance 10 along the path = the joint at (10, 0).
    expect(m.x).toBeCloseTo(10, 5);
    expect(m.y).toBeCloseTo(0, 5);
  });
  it('polygon centroid of a unit square is its centre', () => {
    const c = polygonCentroid([
      { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 },
    ]);
    expect(c.x).toBeCloseTo(5, 5);
    expect(c.y).toBeCloseTo(5, 5);
  });
  it('labelAnchorFor: rectangle returns the centre', () => {
    expect(labelAnchorFor({ type: 'rectangle', geometry: { x: 10, y: 20, width: 40, height: 60 } })).toEqual({ x: 30, y: 50 });
  });
  it('labelAnchorFor: diameter falls back to the midpoint of p1/p2', () => {
    const a = labelAnchorFor({ type: 'diameter', geometry: { p1: { x: 0, y: 0 }, p2: { x: 10, y: 10 } } });
    expect(a.x).toBe(5); expect(a.y).toBe(5);
  });
  it('labelAnchorFor: callout returns the anchor point', () => {
    const a = labelAnchorFor({ type: 'callout', geometry: { anchor: { x: 7, y: 9 }, box: { x: 0, y: 0, width: 100, height: 20 } } });
    expect(a).toEqual({ x: 7, y: 9 });
  });

  it('revisionCloudPath generates a closed Path d for a triangle', () => {
    const d = revisionCloudPath([
      { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 },
    ], { bumpSize: 6, density: 0.05 });
    expect(typeof d).toBe('string');
    expect(d.startsWith('M ')).toBe(true);
    expect(d.endsWith(' Z')).toBe(true);
    // Should contain at least one arc operator.
    expect(d).toMatch(/ A /);
  });
  it('revisionCloudPath returns empty string for too-few points', () => {
    expect(revisionCloudPath([])).toBe('');
    expect(revisionCloudPath([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe('');
  });
});
