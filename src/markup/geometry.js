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
