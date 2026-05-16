/**
 * Pure geometry helpers used by the markup engine.
 *
 * All inputs are in *page-pixel space*. The caller is responsible for converting
 * to mm via the page scale (see src/markup/scale.js).
 */

export function distancePx(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Total length of a polyline (open path). */
export function polylineLengthPx(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += distancePx(points[i - 1], points[i]);
  }
  return total;
}

/** Perimeter of a closed polygon (auto-closes to first point). */
export function polygonPerimeterPx(points) {
  if (points.length < 3) return 0;
  return polylineLengthPx([...points, points[0]]);
}

/** Shoelace area for a closed polygon. Always returns a positive value. */
export function polygonAreaPx(points) {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }
  return Math.abs(area) / 2;
}

/** Area of a polygon with optional cutouts (holes). All in page-pixel space. */
export function polygonAreaWithHolesPx(outer, holes = []) {
  const outerArea = polygonAreaPx(outer);
  const holeArea = holes.reduce((sum, h) => sum + polygonAreaPx(h), 0);
  return Math.max(0, outerArea - holeArea);
}

/** Convert a length in pixels to millimetres using a page scale. */
export function pxToMm(px, mmPerPx) {
  return px * mmPerPx;
}

/** Convert an area in px² to mm². */
export function pxAreaToMm2(pxArea, mmPerPx) {
  return pxArea * mmPerPx * mmPerPx;
}

/** Snap a point to the nearest grid intersection. */
export function snapToGrid(point, gridPx) {
  if (!gridPx || gridPx <= 0) return point;
  return {
    x: Math.round(point.x / gridPx) * gridPx,
    y: Math.round(point.y / gridPx) * gridPx,
  };
}

/** Lock movement to the dominant axis (ortho). */
export function orthoLock(origin, point) {
  const dx = Math.abs(point.x - origin.x);
  const dy = Math.abs(point.y - origin.y);
  return dx > dy ? { x: point.x, y: origin.y } : { x: origin.x, y: point.y };
}

/** Bounding box of a list of points. */
export function bounds(points) {
  if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Test whether a point lies inside a polygon (ray casting). */
export function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y))
      && (point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + 1e-12) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Angle in degrees between BA and BC, with B as the vertex. */
export function angleDeg(a, b, c) {
  const v1x = a.x - b.x, v1y = a.y - b.y;
  const v2x = c.x - b.x, v2y = c.y - b.y;
  const dot = v1x * v2x + v1y * v2y;
  const m1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const m2 = Math.sqrt(v2x * v2x + v2y * v2y);
  if (m1 === 0 || m2 === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / (m1 * m2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Format an angle for the HUD readout. */
export function formatAngle(deg) {
  if (deg == null || !Number.isFinite(deg)) return '—';
  return `${deg.toFixed(1)}°`;
}

/** Midpoint of two points. */
export function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Midpoint along a polyline at half the total length. */
export function polylineMidpoint(points) {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return { ...points[0] };
  const total = polylineLengthPx(points);
  let target = total / 2;
  for (let i = 1; i < points.length; i++) {
    const seg = distancePx(points[i - 1], points[i]);
    if (target <= seg) {
      const t = seg === 0 ? 0 : target / seg;
      return {
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
        y: points[i - 1].y + (points[i].y - points[i - 1].y) * t,
      };
    }
    target -= seg;
  }
  return { ...points[points.length - 1] };
}

/** Geometric centroid of a polygon (area-weighted, not just point-average). */
export function polygonCentroid(points) {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length < 3) return midpoint(points[0], points[points.length - 1] || points[0]);
  let cx = 0, cy = 0, a = 0;
  for (let i = 0; i < points.length; i++) {
    const p0 = points[i];
    const p1 = points[(i + 1) % points.length];
    const cross = p0.x * p1.y - p1.x * p0.y;
    a += cross;
    cx += (p0.x + p1.x) * cross;
    cy += (p0.y + p1.y) * cross;
  }
  a /= 2;
  if (a === 0) {
    const bb = bounds(points);
    return { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
  }
  return { x: cx / (6 * a), y: cy / (6 * a) };
}

/**
 * Generate a revision-cloud SVG-path-style sequence of points by replacing
 * straight polygon edges with a series of small outward arcs. Returns a Konva
 * Path 'data' string. Bumps face *outward* from the polygon centroid.
 *
 * `bumpSize` is the arc radius in pixels; `bumpsPerSide` is the approximate
 * count of bumps along the longest edge — others are scaled to keep bump
 * spacing roughly even.
 */
export function revisionCloudPath(points, { bumpSize = 8, density = 0.04 } = {}) {
  if (points.length < 3) return '';
  const cx = polygonCentroid(points).x;
  const cy = polygonCentroid(points).y;
  const seg = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const len = distancePx(a, b);
    const count = Math.max(1, Math.round(len * density));
    seg.push({ a, b, len, count });
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (const { a, b, count } of seg) {
    for (let i = 1; i <= count; i++) {
      const t = i / count;
      const px = a.x + (b.x - a.x) * t;
      const py = a.y + (b.y - a.y) * t;
      // outward normal at this midpoint along (a,b)
      const nx = (b.y - a.y);
      const ny = -(b.x - a.x);
      const nLen = Math.sqrt(nx * nx + ny * ny) || 1;
      const ux = nx / nLen, uy = ny / nLen;
      // ensure outward (away from centroid)
      const sign = ((px - cx) * ux + (py - cy) * uy) >= 0 ? 1 : -1;
      const sx = ux * bumpSize * sign;
      const sy = uy * bumpSize * sign;
      // sweep flag 1 = clockwise arc bulging outward
      d += ` A ${bumpSize} ${bumpSize} 0 0 1 ${px + sx * 0.001} ${py + sy * 0.001}`;
      d += ` A ${bumpSize} ${bumpSize} 0 0 1 ${px} ${py}`;
    }
  }
  d += ' Z';
  return d;
}

/** Return the on-canvas position to render a measurement label for a shape. */
export function labelAnchorFor(obj) {
  if (!obj?.geometry) return { x: 0, y: 0 };
  const g = obj.geometry;
  switch (obj.type) {
    case 'length':
    case 'perimeter':
      return polylineMidpoint(g.points || []);
    case 'area':
    case 'cloud':
      return polygonCentroid(g.points || []);
    case 'rectangle':
      return { x: g.x + g.width / 2, y: g.y + g.height / 2 };
    case 'diameter':
      return { x: g.center?.x ?? midpoint(g.p1, g.p2).x, y: g.center?.y ?? midpoint(g.p1, g.p2).y };
    case 'angle':
      return g.points && g.points[1] ? { ...g.points[1] } : { x: 0, y: 0 };
    case 'line':
    case 'arrow':
      return midpoint(g.from, g.to);
    case 'count':
      return g.center || { x: 0, y: 0 };
    case 'callout':
      return g.anchor || { x: 0, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

/** Smoothly format a length value with appropriate units. */
export function formatLength(mm, displayUnit = 'm') {
  if (mm == null || !Number.isFinite(mm)) return '—';
  switch (displayUnit) {
    case 'mm': return `${mm.toFixed(0)} mm`;
    case 'cm': return `${(mm / 10).toFixed(1)} cm`;
    case 'm':  return `${(mm / 1000).toFixed(2)} m`;
    case 'ft': return `${(mm / 304.8).toFixed(2)} ft`;
    case 'in': return `${(mm / 25.4).toFixed(2)} in`;
    default:   return `${(mm / 1000).toFixed(2)} m`;
  }
}

export function formatArea(mm2, displayUnit = 'm') {
  if (mm2 == null || !Number.isFinite(mm2)) return '—';
  switch (displayUnit) {
    case 'mm': return `${mm2.toFixed(0)} mm²`;
    case 'cm': return `${(mm2 / 100).toFixed(1)} cm²`;
    case 'm':  return `${(mm2 / 1e6).toFixed(2)} m²`;
    case 'ft': return `${(mm2 / 92903.04).toFixed(2)} ft²`;
    default:   return `${(mm2 / 1e6).toFixed(2)} m²`;
  }
}
