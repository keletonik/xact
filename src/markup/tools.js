import { v4 as uuid } from 'uuid';
import { angleDeg, distancePx, orthoLock, polygonAreaPx, polygonPerimeterPx, polylineLengthPx, snapToGrid } from './geometry';

/**
 * Markup tool registry.
 *
 * Each tool is a *factory* that returns:
 *   { onPointerDown(point, ctx), onPointerMove(point, ctx), onPointerUp(point, ctx),
 *     onDblClick(point, ctx), onKey(event, ctx), getPreview(), commit() }
 *
 * The caller (markup canvas) constructs a tool, hands it pointer events, and
 * either renders its in-progress preview or, when commit() returns a non-null
 * object, appends that object to the active layer.
 *
 * All coordinates are in page-pixel space. The "ctx" carries:
 *   { snapGridPx, orthoLocked, pageScale (mmPerPx), activeLayerId, style, symbolId, productId }
 */

const COMMON = {
  defaultStyle: () => ({ stroke: '#ef4444', strokeWidth: 2, fill: 'rgba(239,68,68,0.15)', opacity: 1, dash: null }),
};

function applyConstraints(point, ctx, origin = null) {
  let p = point;
  if (ctx.snapGridPx) p = snapToGrid(p, ctx.snapGridPx);
  if (ctx.orthoLocked && origin) p = orthoLock(origin, p);
  return p;
}

// ---------- Count (place a symbol marker) ----------
export function makeCountTool() {
  let placed = null;
  return {
    type: 'count',
    onPointerDown(point, ctx) {
      const p = applyConstraints(point, ctx);
      placed = {
        id: uuid(),
        type: 'count',
        pageNumber: ctx.pageNumber,
        layerId: ctx.activeLayerId,
        geometry: { center: p, radius: 10 },
        style: ctx.style ?? COMMON.defaultStyle(),
        metadata: {
          symbolId: ctx.symbolId ?? null,
          productId: ctx.productId ?? null,
          assemblyId: ctx.assemblyId ?? null,
          quantity: 1,
          measuredValueMm: 0,
          note: '',
        },
      };
    },
    onPointerMove() {},
    onPointerUp() {},
    onKey() {},
    getPreview() { return placed; },
    commit() {
      const out = placed;
      placed = null;
      return out;
    },
  };
}

// ---------- Length (polyline → length in mm) ----------
export function makeLengthTool() {
  let points = [];
  let cursor = null;
  let ctxRef = null;
  return {
    type: 'length',
    onPointerDown(point, ctx) {
      ctxRef = ctx;
      const origin = points[points.length - 1] || null;
      const p = applyConstraints(point, ctx, origin);
      points.push(p);
    },
    onPointerMove(point, ctx) {
      ctxRef = ctx;
      const origin = points[points.length - 1] || null;
      cursor = applyConstraints(point, ctx, origin);
    },
    onPointerUp() {},
    onDblClick() {
      return this.commit();
    },
    onKey(e) {
      if (e.key === 'Enter' || e.key === 'Escape') return this.commit();
      if (e.key === 'Backspace' && points.length > 0) points.pop();
      return null;
    },
    getPreview() {
      if (points.length === 0) return null;
      const preview = cursor ? [...points, cursor] : points;
      return {
        id: 'preview',
        type: 'length',
        layerId: ctxRef?.activeLayerId,
        geometry: { points: preview },
        style: ctxRef?.style ?? COMMON.defaultStyle(),
      };
    },
    commit() {
      if (points.length < 2) { points = []; cursor = null; return null; }
      const ctx = ctxRef;
      const lengthPx = polylineLengthPx(points);
      const out = {
        id: uuid(),
        type: 'length',
        pageNumber: ctx.pageNumber,
        layerId: ctx.activeLayerId,
        geometry: { points: [...points] },
        style: ctx.style ?? COMMON.defaultStyle(),
        metadata: {
          symbolId: null,
          productId: ctx.productId ?? null,
          assemblyId: ctx.assemblyId ?? null,
          quantity: 1,
          measuredValueMm: lengthPx * ctx.pageScale.mmPerPx,
          note: '',
        },
      };
      points = []; cursor = null;
      return out;
    },
  };
}

// ---------- Area (polygon → area in mm²) ----------
export function makeAreaTool() {
  let points = [];
  let cursor = null;
  let ctxRef = null;
  return {
    type: 'area',
    onPointerDown(point, ctx) {
      ctxRef = ctx;
      const origin = points[points.length - 1] || null;
      const p = applyConstraints(point, ctx, origin);
      points.push(p);
    },
    onPointerMove(point, ctx) {
      ctxRef = ctx;
      const origin = points[points.length - 1] || null;
      cursor = applyConstraints(point, ctx, origin);
    },
    onPointerUp() {},
    onDblClick() {
      return this.commit();
    },
    onKey(e) {
      if (e.key === 'Enter' || e.key === 'Escape') return this.commit();
      if (e.key === 'Backspace' && points.length > 0) points.pop();
      return null;
    },
    getPreview() {
      if (points.length === 0) return null;
      const preview = cursor ? [...points, cursor] : points;
      return {
        id: 'preview',
        type: 'area',
        layerId: ctxRef?.activeLayerId,
        geometry: { points: preview, closed: true },
        style: ctxRef?.style ?? COMMON.defaultStyle(),
      };
    },
    commit() {
      if (points.length < 3) { points = []; cursor = null; return null; }
      const ctx = ctxRef;
      const areaPx = polygonAreaPx(points);
      const perimeterPx = polygonPerimeterPx(points);
      const out = {
        id: uuid(),
        type: 'area',
        pageNumber: ctx.pageNumber,
        layerId: ctx.activeLayerId,
        geometry: { points: [...points], closed: true },
        style: ctx.style ?? COMMON.defaultStyle(),
        metadata: {
          symbolId: null,
          productId: ctx.productId ?? null,
          assemblyId: ctx.assemblyId ?? null,
          quantity: 1,
          measuredValueMm: areaPx * ctx.pageScale.mmPerPx * ctx.pageScale.mmPerPx,
          perimeterMm: perimeterPx * ctx.pageScale.mmPerPx,
          note: '',
        },
      };
      points = []; cursor = null;
      return out;
    },
  };
}

// ---------- Rectangle ----------
export function makeRectangleTool() {
  let origin = null;
  let cursor = null;
  let ctxRef = null;
  return {
    type: 'rectangle',
    onPointerDown(point, ctx) {
      ctxRef = ctx;
      origin = applyConstraints(point, ctx);
    },
    onPointerMove(point, ctx) {
      ctxRef = ctx;
      if (origin) cursor = applyConstraints(point, ctx, origin);
    },
    onPointerUp(point, ctx) {
      ctxRef = ctx;
      if (origin) {
        const finalPoint = applyConstraints(point, ctx, origin);
        return this._buildAndReset(finalPoint);
      }
      return null;
    },
    onKey() { return null; },
    getPreview() {
      if (!origin || !cursor) return null;
      return {
        id: 'preview',
        type: 'rectangle',
        layerId: ctxRef?.activeLayerId,
        geometry: rectGeom(origin, cursor),
        style: ctxRef?.style ?? COMMON.defaultStyle(),
      };
    },
    commit() {
      return null;
    },
    _buildAndReset(finalPoint) {
      const geom = rectGeom(origin, finalPoint);
      const ctx = ctxRef;
      const out = {
        id: uuid(),
        type: 'rectangle',
        pageNumber: ctx.pageNumber,
        layerId: ctx.activeLayerId,
        geometry: geom,
        style: ctx.style ?? COMMON.defaultStyle(),
        metadata: {
          quantity: 1,
          measuredValueMm: geom.width * geom.height * ctx.pageScale.mmPerPx * ctx.pageScale.mmPerPx,
          note: '',
        },
      };
      origin = null; cursor = null;
      return out;
    },
  };
}

function rectGeom(a, b) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
}

// ---------- Text / callout ----------
export function makeTextTool() {
  let placed = null;
  return {
    type: 'text',
    onPointerDown(point, ctx) {
      const p = applyConstraints(point, ctx);
      placed = {
        id: uuid(),
        type: 'text',
        pageNumber: ctx.pageNumber,
        layerId: ctx.activeLayerId,
        geometry: { position: p },
        style: { ...COMMON.defaultStyle(), fill: '#0f172a', stroke: 'transparent', strokeWidth: 0 },
        metadata: { quantity: 0, measuredValueMm: 0, note: 'New note' },
      };
    },
    onPointerMove() {},
    onPointerUp() {},
    onKey() {},
    getPreview() { return placed; },
    commit() {
      const out = placed; placed = null; return out;
    },
  };
}

// ---------- Cloud (revision cloud) ----------
export function makeCloudTool() {
  // Same authoring UX as Rectangle, different render hint.
  const inner = makeRectangleTool();
  return {
    ...inner,
    type: 'cloud',
    _buildAndReset(point) {
      const obj = inner._buildAndReset(point);
      if (obj) obj.type = 'cloud';
      return obj;
    },
  };
}

// ---------- Line / arrow ----------
export function makeLineTool({ arrow = false } = {}) {
  let origin = null;
  let cursor = null;
  let ctxRef = null;
  return {
    type: arrow ? 'arrow' : 'line',
    onPointerDown(point, ctx) {
      ctxRef = ctx;
      origin = applyConstraints(point, ctx);
    },
    onPointerMove(point, ctx) {
      ctxRef = ctx;
      if (origin) cursor = applyConstraints(point, ctx, origin);
    },
    onPointerUp(point, ctx) {
      ctxRef = ctx;
      if (origin) {
        const finalPoint = applyConstraints(point, ctx, origin);
        const geom = { from: origin, to: finalPoint };
        const out = {
          id: uuid(),
          type: arrow ? 'arrow' : 'line',
          pageNumber: ctx.pageNumber,
          layerId: ctx.activeLayerId,
          geometry: geom,
          style: ctx.style ?? COMMON.defaultStyle(),
          metadata: {
            quantity: 1,
            measuredValueMm: distancePx(origin, finalPoint) * ctx.pageScale.mmPerPx,
            note: '',
          },
        };
        origin = null; cursor = null;
        return out;
      }
      return null;
    },
    onKey() { return null; },
    getPreview() {
      if (!origin || !cursor) return null;
      return {
        id: 'preview',
        type: arrow ? 'arrow' : 'line',
        layerId: ctxRef?.activeLayerId,
        geometry: { from: origin, to: cursor },
        style: ctxRef?.style ?? COMMON.defaultStyle(),
      };
    },
    commit() { return null; },
  };
}

// ---------- Diameter (2-point across a circle) ----------
export function makeDiameterTool() {
  let origin = null;
  let cursor = null;
  let ctxRef = null;
  return {
    type: 'diameter',
    onPointerDown(point, ctx) {
      ctxRef = ctx;
      origin = applyConstraints(point, ctx);
    },
    onPointerMove(point, ctx) {
      ctxRef = ctx;
      if (origin) cursor = applyConstraints(point, ctx, origin);
    },
    onPointerUp(point, ctx) {
      ctxRef = ctx;
      if (!origin) return null;
      const finalPoint = applyConstraints(point, ctx, origin);
      const diameterPx = distancePx(origin, finalPoint);
      const cx = (origin.x + finalPoint.x) / 2;
      const cy = (origin.y + finalPoint.y) / 2;
      const radius = diameterPx / 2;
      const out = {
        id: uuid(),
        type: 'diameter',
        pageNumber: ctx.pageNumber,
        layerId: ctx.activeLayerId,
        geometry: { center: { x: cx, y: cy }, radius, p1: origin, p2: finalPoint },
        style: ctx.style ?? COMMON.defaultStyle(),
        metadata: {
          quantity: 1,
          measuredValueMm: diameterPx * ctx.pageScale.mmPerPx,
          note: '',
        },
      };
      origin = null; cursor = null;
      return out;
    },
    onKey() { return null; },
    getPreview() {
      if (!origin || !cursor) return null;
      const cx = (origin.x + cursor.x) / 2;
      const cy = (origin.y + cursor.y) / 2;
      const radius = distancePx(origin, cursor) / 2;
      return {
        id: 'preview',
        type: 'diameter',
        layerId: ctxRef?.activeLayerId,
        geometry: { center: { x: cx, y: cy }, radius, p1: origin, p2: cursor },
        style: ctxRef?.style ?? COMMON.defaultStyle(),
      };
    },
    commit() { return null; },
  };
}

// ---------- Angle (3 points: vertex + two rays) ----------
export function makeAngleTool() {
  let points = [];
  let cursor = null;
  let ctxRef = null;
  return {
    type: 'angle',
    onPointerDown(point, ctx) {
      ctxRef = ctx;
      const origin = points[points.length - 1] || null;
      const p = applyConstraints(point, ctx, origin);
      points.push(p);
      if (points.length === 3) return this.commit();
      return null;
    },
    onPointerMove(point, ctx) {
      ctxRef = ctx;
      const origin = points[points.length - 1] || null;
      cursor = applyConstraints(point, ctx, origin);
    },
    onPointerUp() { return null; },
    onKey(e) {
      if (e.key === 'Escape') { points = []; cursor = null; return null; }
      return null;
    },
    getPreview() {
      if (points.length === 0) return null;
      const preview = cursor ? [...points, cursor] : points;
      return {
        id: 'preview',
        type: 'angle',
        layerId: ctxRef?.activeLayerId,
        geometry: { points: preview },
        style: ctxRef?.style ?? COMMON.defaultStyle(),
      };
    },
    commit() {
      if (points.length < 3) return null;
      const ctx = ctxRef;
      const [a, b, c] = points;
      const deg = angleDeg(a, b, c);
      const out = {
        id: uuid(),
        type: 'angle',
        pageNumber: ctx.pageNumber,
        layerId: ctx.activeLayerId,
        geometry: { points: [a, b, c] },
        style: ctx.style ?? COMMON.defaultStyle(),
        metadata: {
          quantity: 1,
          measuredValueMm: 0,
          angleDeg: deg,
          note: '',
        },
      };
      points = []; cursor = null;
      return out;
    },
  };
}

// ---------- Perimeter (closed polyline → perimeter only) ----------
export function makePerimeterTool() {
  let points = [];
  let cursor = null;
  let ctxRef = null;
  return {
    type: 'perimeter',
    onPointerDown(point, ctx) {
      ctxRef = ctx;
      const origin = points[points.length - 1] || null;
      const p = applyConstraints(point, ctx, origin);
      points.push(p);
    },
    onPointerMove(point, ctx) {
      ctxRef = ctx;
      const origin = points[points.length - 1] || null;
      cursor = applyConstraints(point, ctx, origin);
    },
    onPointerUp() { return null; },
    onDblClick() { return this.commit(); },
    onKey(e) {
      if (e.key === 'Enter' || e.key === 'Escape') return this.commit();
      if (e.key === 'Backspace' && points.length > 0) points.pop();
      return null;
    },
    getPreview() {
      if (points.length === 0) return null;
      const preview = cursor ? [...points, cursor] : points;
      return {
        id: 'preview',
        type: 'perimeter',
        layerId: ctxRef?.activeLayerId,
        geometry: { points: preview, closed: true },
        style: ctxRef?.style ?? COMMON.defaultStyle(),
      };
    },
    commit() {
      if (points.length < 3) { points = []; cursor = null; return null; }
      const ctx = ctxRef;
      const perimeterPx = polygonPerimeterPx(points);
      const out = {
        id: uuid(),
        type: 'perimeter',
        pageNumber: ctx.pageNumber,
        layerId: ctx.activeLayerId,
        geometry: { points: [...points], closed: true },
        style: ctx.style ?? COMMON.defaultStyle(),
        metadata: {
          quantity: 1,
          measuredValueMm: perimeterPx * ctx.pageScale.mmPerPx,
          note: '',
        },
      };
      points = []; cursor = null;
      return out;
    },
  };
}

export const TOOL_FACTORIES = {
  count: makeCountTool,
  length: makeLengthTool,
  area: makeAreaTool,
  perimeter: makePerimeterTool,
  diameter: makeDiameterTool,
  angle: makeAngleTool,
  rectangle: makeRectangleTool,
  cloud: makeCloudTool,
  text: makeTextTool,
  line: () => makeLineTool({ arrow: false }),
  arrow: () => makeLineTool({ arrow: true }),
};

export function instantiateTool(toolType) {
  const factory = TOOL_FACTORIES[toolType];
  if (!factory) throw new Error(`Unknown tool type: ${toolType}`);
  return factory();
}
