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

// Resolve mm-per-px from the tool context. Defaults to 1 when the
// page has not been calibrated yet, so tools never crash on commit
// when an operator forgets to calibrate first. The committed
// geometry is preserved; the measuredValueMm is provisional until
// the page is calibrated and the object is re-measured.
function mmPerPx(ctx) {
  return ctx?.pageScale?.mmPerPx ?? 1;
}

// Click-drag commit threshold in page pixels. Below this, a click-without-drag
// gesture is treated as no-op rather than producing a zero-size shape that
// pollutes the legend.
const MIN_DRAG_PX = 2;

function applyConstraints(point, ctx, origin = null) {
  let p = point;
  if (ctx.snapGridPx) p = snapToGrid(p, ctx.snapGridPx);
  if (ctx.orthoLocked && origin) p = orthoLock(origin, p);
  // Always clone at the boundary so a later mutation of the caller's point
  // object cannot propagate into a tool's stored geometry.
  return { x: p.x, y: p.y };
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
          measuredValueMm: lengthPx * mmPerPx(ctx),
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
          measuredValueMm: areaPx * mmPerPx(ctx) * mmPerPx(ctx),
          perimeterMm: perimeterPx * mmPerPx(ctx),
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
      // Seed cursor so the very first getPreview() after pointer-down can
      // render a zero-area placeholder, giving the user immediate visual
      // feedback before any mouse-move event arrives.
      cursor = origin;
    },
    onPointerMove(point, ctx) {
      ctxRef = ctx;
      if (origin) cursor = applyConstraints(point, ctx, origin);
    },
    onPointerUp(point, ctx) {
      ctxRef = ctx;
      if (origin) {
        const finalPoint = applyConstraints(point, ctx, origin);
        if (distancePx(origin, finalPoint) < MIN_DRAG_PX) {
          origin = null; cursor = null;
          return null;
        }
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
          measuredValueMm: geom.width * geom.height * mmPerPx(ctx) * mmPerPx(ctx),
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

// ---------- Cloud (revision cloud with bumpy edges, drawn as a polygon) ----------
// Authoring UX matches the area tool. Click points around the region you
// want clouded, double-click / Enter to commit. The rendering layer applies
// the bumpy revision-cloud path computed by `revisionCloudPath`.
export function makeCloudTool() {
  let points = [];
  let cursor = null;
  let ctxRef = null;
  return {
    type: 'cloud',
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
        type: 'cloud',
        layerId: ctxRef?.activeLayerId,
        geometry: { points: preview, closed: true },
        style: ctxRef?.style ?? COMMON.defaultStyle(),
      };
    },
    commit() {
      if (points.length < 3) { points = []; cursor = null; return null; }
      const ctx = ctxRef;
      const out = {
        id: uuid(),
        type: 'cloud',
        pageNumber: ctx.pageNumber,
        layerId: ctx.activeLayerId,
        geometry: { points: [...points], closed: true },
        style: ctx.style ?? COMMON.defaultStyle(),
        metadata: { quantity: 1, measuredValueMm: 0, note: '' },
      };
      points = []; cursor = null;
      return out;
    },
  };
}

// ---------- Callout (anchor + leader + text-box) ----------
// Two-click placement: first click sets the *anchor* (where the leader
// points to), second click sets the text-box origin. The box auto-sizes
// to the placeholder text until the user edits it via the Properties
// panel.
export function makeCalloutTool() {
  let anchor = null;
  let cursor = null;
  let ctxRef = null;
  return {
    type: 'callout',
    onPointerDown(point, ctx) {
      ctxRef = ctx;
      const p = applyConstraints(point, ctx);
      if (!anchor) {
        anchor = p;
        // Seed cursor at the anchor so the leader preview shows immediately
        // rather than waiting for the first mouse-move event.
        cursor = p;
        return null;
      }
      const out = {
        id: uuid(),
        type: 'callout',
        pageNumber: ctx.pageNumber,
        layerId: ctx.activeLayerId,
        geometry: {
          anchor: { ...anchor },
          box: { x: p.x, y: p.y, width: 140, height: 36 },
        },
        style: ctx.style ?? COMMON.defaultStyle(),
        metadata: { quantity: 0, measuredValueMm: 0, note: 'New note' },
      };
      anchor = null; cursor = null;
      return out;
    },
    onPointerMove(point, ctx) {
      ctxRef = ctx;
      if (anchor) cursor = applyConstraints(point, ctx, anchor);
    },
    onPointerUp() { return null; },
    onKey(e) {
      if (e.key === 'Escape') { anchor = null; cursor = null; }
      return null;
    },
    getPreview() {
      if (!anchor || !cursor) return null;
      return {
        id: 'preview',
        type: 'callout',
        layerId: ctxRef?.activeLayerId,
        geometry: {
          anchor: { ...anchor },
          box: { x: cursor.x, y: cursor.y, width: 140, height: 36 },
        },
        style: ctxRef?.style ?? COMMON.defaultStyle(),
      };
    },
    commit() { return null; },
  };
}

// ---------- Hyperlink (invisible hit region; metadata.url) ----------
// Authoring UX = rectangle. Stored with metadata.url so the renderer can
// draw a faint link-icon overlay; clicking in "select" mode opens the URL.
export function makeHyperlinkTool() {
  const inner = makeRectangleTool();
  return {
    ...inner,
    type: 'hyperlink',
    // Relabel the in-flight preview so the renderer can show the link-icon
    // overlay during draw rather than swapping appearance at commit.
    getPreview() {
      const preview = inner.getPreview.call(inner);
      if (!preview) return null;
      return { ...preview, type: 'hyperlink' };
    },
    onPointerUp(point, ctx) {
      const out = inner.onPointerUp.call(inner, point, ctx);
      if (out) {
        out.type = 'hyperlink';
        out.metadata = { ...out.metadata, url: '', quantity: 0, measuredValueMm: 0, note: '' };
      }
      return out;
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
      cursor = origin;
    },
    onPointerMove(point, ctx) {
      ctxRef = ctx;
      if (origin) cursor = applyConstraints(point, ctx, origin);
    },
    onPointerUp(point, ctx) {
      ctxRef = ctx;
      if (origin) {
        const finalPoint = applyConstraints(point, ctx, origin);
        if (distancePx(origin, finalPoint) < MIN_DRAG_PX) {
          origin = null; cursor = null;
          return null;
        }
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
            measuredValueMm: distancePx(origin, finalPoint) * mmPerPx(ctx),
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
      cursor = origin;
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
      if (diameterPx < MIN_DRAG_PX) {
        origin = null; cursor = null;
        return null;
      }
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
          measuredValueMm: diameterPx * mmPerPx(ctx),
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
          measuredValueMm: perimeterPx * mmPerPx(ctx),
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
  callout: makeCalloutTool,
  hyperlink: makeHyperlinkTool,
  text: makeTextTool,
  line: () => makeLineTool({ arrow: false }),
  arrow: () => makeLineTool({ arrow: true }),
};

export function instantiateTool(toolType) {
  const factory = TOOL_FACTORIES[toolType];
  if (!factory) throw new Error(`Unknown tool type: ${toolType}`);
  return factory();
}
