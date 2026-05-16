import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Circle, Line, Rect, Group, Text as KText, Arrow, Path, Transformer, Label, Tag } from 'react-konva';
import { instantiateTool } from '../../markup/tools';
import {
  formatArea, formatLength, formatAngle, polygonAreaPx, polylineLengthPx,
  labelAnchorFor, revisionCloudPath,
} from '../../markup/geometry';
import { calibratePage } from '../../markup/scale';
import { getSymbol } from '../../markup/symbolLibrary';
import { getPdfDocument, renderImage, renderPdfPage } from './pdfPageRender';

/**
 * MarkupCanvas — pdf.js raster + Konva overlay.
 *
 * Externally-controlled props this version added:
 *   - selectedIds (Set<string>)          : multi-select highlight; lasso writes here
 *   - onSelectionChange(setOrIds)        : owner store
 *   - onCursorMm({x, y} | null)          : feeds StatusBar
 *   - onZoomChange(scale)                : feeds StatusBar
 *   - stageScaleControl                  : optional controlled stage scale
 *   - showLabels (boolean)               : render measurement labels on shapes
 *   - onTransformObjects(ids, fn)        : when Transformer commits a resize/move
 */
export default function MarkupCanvas({
  drawingBlob,
  drawingContentType,
  markupDoc,
  pageNumber,
  activeTool,
  activeLayerId,
  calibrationMode = false,
  snapGridPx = 0,
  orthoLocked = false,
  style,
  placementSymbolId = null,
  placementProductId = null,
  placementAssemblyId = null,
  onCommitObject,
  onCalibrated,
  selectedIds = new Set(),
  onSelectionChange,
  onCursorMm,
  onZoomChange,
  stageScaleControl,
  showLabels = true,
  onTransformObjects,
}) {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const trRef = useRef(null);
  const [renderSize, setRenderSize] = useState({ width: 800, height: 600 });
  const renderScale = 1.5;
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [previewTick, setPreviewTick] = useState(0);
  const [calibState, setCalibState] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const panOrigin = useRef(null);
  const spacePressed = useRef(false);
  const [lasso, setLasso] = useState(null);   // { start: {x,y}, end: {x,y}, additive: bool }

  const page = useMemo(
    () => markupDoc.pages.find((p) => p.pageNumber === pageNumber) || markupDoc.pages[0],
    [markupDoc, pageNumber],
  );

  // Allow the caller to force a zoom level (status bar dropdown).
  useEffect(() => {
    if (stageScaleControl != null && Math.abs(stageScaleControl - stageScale) > 1e-3) {
      setStageScale(stageScaleControl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageScaleControl]);

  // Notify caller of zoom changes (e.g. from ctrl+wheel) so the status bar matches.
  useEffect(() => { onZoomChange?.(stageScale); }, [stageScale, onZoomChange]);

  // ------- raster render -------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!drawingBlob || !canvasRef.current) return;
      try {
        if (drawingContentType === 'application/pdf') {
          const doc = await getPdfDocument(drawingBlob);
          if (cancelled) return;
          const result = await renderPdfPage({ doc, pageNumber, canvas: canvasRef.current, scale: renderScale });
          if (cancelled) return;
          setRenderSize(result);
        } else {
          const result = await renderImage({ blob: drawingBlob, canvas: canvasRef.current, scale: renderScale });
          if (cancelled) return;
          setRenderSize(result);
        }
      } catch (err) {
        console.error('Markup render failed', err);
      }
    })();
    return () => { cancelled = true; };
  }, [drawingBlob, drawingContentType, pageNumber, renderScale]);

  // ------- tool instantiation -------
  const tool = useMemo(() => {
    if (!activeTool || calibrationMode) return null;
    return instantiateTool(activeTool);
  }, [activeTool, calibrationMode]);

  const toolCtx = useMemo(() => ({
    pageNumber: page.pageNumber,
    pageScale: page.scale,
    activeLayerId,
    snapGridPx,
    orthoLocked,
    style,
    symbolId: placementSymbolId,
    productId: placementProductId,
    assemblyId: placementAssemblyId,
  }), [page.pageNumber, page.scale, activeLayerId, snapGridPx, orthoLocked, style, placementSymbolId, placementProductId, placementAssemblyId]);

  // Space-key tracker
  useEffect(() => {
    const onSpaceDown = (e) => { if (e.code === 'Space') spacePressed.current = true; };
    const onSpaceUp   = (e) => { if (e.code === 'Space') spacePressed.current = false; };
    window.addEventListener('keydown', onSpaceDown);
    window.addEventListener('keyup', onSpaceUp);
    return () => { window.removeEventListener('keydown', onSpaceDown); window.removeEventListener('keyup', onSpaceUp); };
  }, []);

  // ------- pointer plumbing -------
  const getStagePoint = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    const t = stage.getAbsoluteTransform().copy().invert();
    return t.point(pos);
  }, []);

  // emit cursor-in-mm whenever the pointer moves
  const emitCursorMm = useCallback((p) => {
    if (!onCursorMm) return;
    if (!p) return onCursorMm(null);
    const k = page.scale?.mmPerPx ?? 1;
    onCursorMm({ x: p.x * k, y: p.y * k });
  }, [onCursorMm, page.scale]);

  const handlePointerDown = useCallback((e) => {
    const isTouch = e.evt.touches != null;
    const clientX = isTouch ? e.evt.touches[0]?.clientX : e.evt.clientX;
    const clientY = isTouch ? e.evt.touches[0]?.clientY : e.evt.clientY;
    const shift = e.evt.shiftKey;

    // pan: middle-mouse or Space+drag
    if (!isTouch && (e.evt.button === 1 || (e.evt.button === 0 && spacePressed.current))) {
      setIsPanning(true);
      panOrigin.current = { x: clientX, y: clientY, stage: { ...stagePos } };
      return;
    }
    const p = getStagePoint(); if (!p) return;

    if (calibrationMode) {
      if (!calibState) {
        setCalibState({ points: [p] });
      } else if (calibState.points.length === 1) {
        const pointA = calibState.points[0];
        const pointB = p;
        Promise.resolve().then(() => {
          const input = window.prompt('Enter the real-world length in millimetres for the line just drawn:');
          if (input == null || input === '') { setCalibState(null); return; }
          const mm = Number.parseFloat(input);
          if (!Number.isFinite(mm) || mm <= 0) { setCalibState(null); return; }
          try {
            calibratePage(page, pointA, pointB, mm);
            if (onCalibrated) onCalibrated({ pointA, pointB, knownMm: mm });
          } catch (err) { console.error('Calibration failed', err); }
          setCalibState(null);
        });
        setCalibState({ points: [pointA, pointB] });
      }
      return;
    }

    // No tool selected → selection mode
    if (!tool) {
      const stage = stageRef.current;
      const target = stage.getIntersection(stage.getPointerPosition());
      const id = target?.attrs?.['data-obj-id'] || target?.findAncestor?.('Group')?.attrs?.['data-obj-id'];

      if (id) {
        // clicking an object: shift toggles, plain replaces
        const next = new Set(shift ? selectedIds : []);
        if (shift && next.has(id)) next.delete(id); else next.add(id);
        onSelectionChange?.(next);
      } else {
        // empty space: start a lasso
        setLasso({ start: p, end: p, additive: shift });
        if (!shift) onSelectionChange?.(new Set());
      }
      return;
    }

    tool.onPointerDown?.(p, toolCtx);
    setPreviewTick((t) => t + 1);
    if (tool.type === 'count' || tool.type === 'text') {
      const out = tool.commit?.();
      if (out && onCommitObject) onCommitObject(out);
    }
  }, [calibrationMode, calibState, getStagePoint, onCalibrated, onCommitObject, onSelectionChange, page, selectedIds, stagePos, tool, toolCtx]);

  const handlePointerMove = useCallback((e) => {
    if (isPanning && panOrigin.current) {
      const isTouch = e.evt.touches != null;
      const cx = isTouch ? e.evt.touches[0]?.clientX : e.evt.clientX;
      const cy = isTouch ? e.evt.touches[0]?.clientY : e.evt.clientY;
      if (cx == null || cy == null) return;
      setStagePos({ x: panOrigin.current.stage.x + (cx - panOrigin.current.x), y: panOrigin.current.stage.y + (cy - panOrigin.current.y) });
      return;
    }
    const p = getStagePoint(); if (!p) return;
    emitCursorMm(p);

    if (lasso) { setLasso({ ...lasso, end: p }); return; }
    if (!tool) return;
    tool.onPointerMove?.(p, toolCtx);
    setPreviewTick((t) => t + 1);
  }, [emitCursorMm, getStagePoint, isPanning, lasso, tool, toolCtx]);

  const handlePointerUp = useCallback(() => {
    if (isPanning) { setIsPanning(false); panOrigin.current = null; return; }
    if (lasso) {
      const rect = rectFromTwoPoints(lasso.start, lasso.end);
      // Only treat as a real lasso if user actually dragged.
      if (rect.width > 4 || rect.height > 4) {
        const hit = page.objects
          .filter((o) => objectBoundingBoxIntersects(o, rect))
          .map((o) => o.id);
        const next = new Set(lasso.additive ? selectedIds : []);
        for (const id of hit) next.add(id);
        onSelectionChange?.(next);
      }
      setLasso(null);
      return;
    }
    const p = getStagePoint(); if (!p) return;
    if (!tool) return;
    const result = tool.onPointerUp?.(p, toolCtx);
    if (result && onCommitObject) onCommitObject(result);
    setPreviewTick((t) => t + 1);
  }, [getStagePoint, isPanning, lasso, onCommitObject, onSelectionChange, page.objects, selectedIds, tool, toolCtx]);

  const handleDblClick = useCallback(() => {
    if (!tool) return;
    const out = tool.onDblClick?.(null, toolCtx);
    if (out && onCommitObject) onCommitObject(out);
    setPreviewTick((t) => t + 1);
  }, [onCommitObject, tool, toolCtx]);

  // wheel zoom + key handling
  const handleWheel = useCallback((e) => {
    if (!(e.evt.ctrlKey || e.evt.metaKey)) return;
    e.evt.preventDefault();
    const scaleBy = 1.08;
    const oldScale = stageScale;
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = { x: (pointer.x - stagePos.x) / oldScale, y: (pointer.y - stagePos.y) / oldScale };
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setStageScale(newScale);
    setStagePos({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
  }, [stagePos, stageScale]);

  useEffect(() => {
    const onKey = (e) => {
      if (calibrationMode && calibState?.promptForLength && e.key === 'Enter') return;
      const tag = (e.target?.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      if (!tool) {
        if (e.key === 'Escape') onSelectionChange?.(new Set());
        return;
      }
      const res = tool.onKey?.(e, toolCtx);
      if (res && onCommitObject) onCommitObject(res);
      setPreviewTick((t) => t + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [calibrationMode, calibState, onCommitObject, onSelectionChange, tool, toolCtx]);

  // attach Transformer to selected nodes
  useEffect(() => {
    const tr = trRef.current;
    if (!tr || !stageRef.current) return;
    const layer = stageRef.current.findOne('Layer');
    if (!layer) return;
    const nodes = [];
    for (const id of selectedIds) {
      const found = layer.findOne(`[data-obj-id="${id}"]`);
      if (found) nodes.push(found);
    }
    tr.nodes(nodes);
    tr.getLayer()?.batchDraw();
  }, [selectedIds, page.objects, previewTick]);

  // commit Transformer changes back to the store as a translate + scale pivot
  const handleTransformEnd = useCallback(() => {
    const tr = trRef.current;
    if (!tr || !onTransformObjects) return;
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    // Read the matrix from Konva's transformer-bounding box, apply uniformly.
    const nodes = tr.nodes();
    if (nodes.length === 0) return;
    const box = tr.getClientRect({ relativeTo: stageRef.current });
    // Compute the pre-transform bounding box from the live objects.
    const objs = page.objects.filter((o) => selectedIds.has(o.id));
    const pre = aggregateBbox(objs);
    if (!pre || pre.width === 0 || pre.height === 0) return;
    const sx = box.width / pre.width;
    const sy = box.height / pre.height;
    const tx = box.x - pre.x * sx;
    const ty = box.y - pre.y * sy;
    onTransformObjects(ids, (p) => ({ x: p.x * sx + tx, y: p.y * sy + ty }));
    // reset transformer scaling back to 1 (we baked it into the data)
    for (const n of nodes) { n.scaleX(1); n.scaleY(1); n.rotation(0); }
  }, [onTransformObjects, page.objects, selectedIds]);

  const layerLookup = useMemo(() => Object.fromEntries(page.layers.map((l) => [l.id, l])), [page.layers]);
  const visibleObjects = page.objects.filter((o) => layerLookup[o.layerId]?.visible !== false);
  const previewObj = tool?.getPreview?.();
  const cursor = isPanning ? 'grabbing' : (activeTool ? 'crosshair' : (lasso ? 'crosshair' : 'default'));

  // ------- live readout (HUD) -------
  const readout = useMemo(() => {
    if (!previewObj || !page.scale) return null;
    if (previewObj.type === 'length' || previewObj.type === 'perimeter') {
      return formatLength(polylineLengthPx(previewObj.geometry.points) * page.scale.mmPerPx, page.displayUnit);
    }
    if (previewObj.type === 'area' || previewObj.type === 'cloud') {
      const a = polygonAreaPx(previewObj.geometry.points);
      return formatArea(a * page.scale.mmPerPx * page.scale.mmPerPx, page.displayUnit);
    }
    return null;
  }, [previewObj, page.scale, page.displayUnit]);

  return (
    <div style={{ position: 'relative', overflow: 'auto', background: 'var(--geist-bg-1, #fafafa)', width: '100%', height: '100%' }}>
      <div style={{ position: 'relative', width: renderSize.width, height: renderSize.height, transformOrigin: '0 0' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <Stage
          ref={stageRef}
          width={renderSize.width}
          height={renderSize.height}
          x={stagePos.x}
          y={stagePos.y}
          scaleX={stageScale}
          scaleY={stageScale}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          onDblClick={handleDblClick}
          onWheel={handleWheel}
          onMouseLeave={() => onCursorMm?.(null)}
          style={{ position: 'absolute', inset: 0, cursor }}
        >
          <Layer listening>
            {visibleObjects.map((obj) => (
              <ObjectShape
                key={obj.id}
                obj={obj}
                color={layerLookup[obj.layerId]?.color}
                opacity={layerLookup[obj.layerId]?.opacity ?? 1}
                isSelected={selectedIds.has(obj.id)}
                showLabel={showLabels}
                displayUnit={page.displayUnit}
                mmPerPx={page.scale.mmPerPx}
              />
            ))}
            {previewObj && (
              <ObjectShape obj={previewObj} color={style?.stroke || 'var(--geist-fg)'} opacity={0.7} isPreview displayUnit={page.displayUnit} mmPerPx={page.scale.mmPerPx} />
            )}
            {lasso && (
              <Rect
                x={Math.min(lasso.start.x, lasso.end.x)}
                y={Math.min(lasso.start.y, lasso.end.y)}
                width={Math.abs(lasso.end.x - lasso.start.x)}
                height={Math.abs(lasso.end.y - lasso.start.y)}
                fill="rgba(0,112,243,0.08)"
                stroke="#0070f3"
                strokeWidth={1}
                dash={[4, 4]}
              />
            )}
            {calibState?.points?.length === 1 && <Circle x={calibState.points[0].x} y={calibState.points[0].y} radius={6} fill="#10b981" />}
            {calibState?.points?.length === 2 && (
              <Line points={[calibState.points[0].x, calibState.points[0].y, calibState.points[1].x, calibState.points[1].y]} stroke="#10b981" strokeWidth={2} dash={[4, 4]} />
            )}
            <Transformer
              ref={trRef}
              rotateEnabled={false}
              flipEnabled={false}
              ignoreStroke
              borderStroke="#0070f3"
              borderStrokeWidth={1}
              anchorStroke="#0070f3"
              anchorFill="#fff"
              anchorSize={7}
              onTransformEnd={handleTransformEnd}
            />
          </Layer>
        </Stage>
      </div>
      {readout && <div style={readoutStyle} aria-live="polite">{readout}</div>}
      {!page.scale.isCalibrated && <div style={warningStyle}>Page not calibrated — measurements show nominal values.</div>}
      <span hidden data-tick={previewTick} />
    </div>
  );
}

/** Render any markup type. Adds an inline measurement label when showLabel is on. */
function ObjectShape({ obj, color, opacity = 1, isPreview = false, isSelected = false, showLabel = false, displayUnit = 'm', mmPerPx = 1 }) {
  const stroke = isSelected ? '#0070f3' : (obj.style?.stroke || color || 'var(--geist-fg)');
  const fill = obj.style?.fill ?? `rgba(${hexToRgb(stroke)},0.12)`;
  const strokeWidth = (obj.style?.strokeWidth ?? 2) * (isSelected ? 1.5 : 1);
  const dash = isPreview ? [6, 4] : obj.style?.dash || null;
  const common = { stroke, fill, strokeWidth, opacity, dash: dash || undefined, 'data-obj-id': obj.id };

  const label = showLabel && !isPreview ? measurementLabel(obj, displayUnit, mmPerPx) : null;
  const labelAt = label ? labelAnchorFor(obj) : null;

  let shape = null;
  if (obj.type === 'count') {
    const sym = obj.metadata?.symbolId ? getSymbol(obj.metadata.symbolId) : null;
    shape = (
      <Group x={obj.geometry.center.x} y={obj.geometry.center.y} data-obj-id={obj.id}>
        <Circle radius={obj.geometry.radius || 10} {...common} />
        {sym && <Path data={extractSinglePath(sym.svg)} scale={{ x: 0.8, y: 0.8 }} offset={{ x: 12, y: 12 }} stroke={stroke} strokeWidth={1.5} fill={fill} />}
      </Group>
    );
  } else if (obj.type === 'length' || obj.type === 'line' || obj.type === 'perimeter') {
    const pts = obj.geometry.points || [obj.geometry.from, obj.geometry.to];
    shape = <Line points={flatten(pts)} closed={obj.type === 'perimeter'} {...common} fill={obj.type === 'perimeter' ? fill : undefined} />;
  } else if (obj.type === 'arrow') {
    shape = <Arrow points={[obj.geometry.from.x, obj.geometry.from.y, obj.geometry.to.x, obj.geometry.to.y]} {...common} fill={stroke} />;
  } else if (obj.type === 'area') {
    shape = <Line points={flatten(obj.geometry.points)} closed {...common} />;
  } else if (obj.type === 'cloud') {
    // True revision-cloud: bumpy edges via parametric path.
    const d = revisionCloudPath(obj.geometry.points, { bumpSize: 8 });
    shape = <Path data={d} {...common} data-obj-id={obj.id} />;
  } else if (obj.type === 'rectangle' || obj.type === 'hyperlink') {
    const g = obj.geometry;
    shape = (
      <Group x={0} y={0} data-obj-id={obj.id}>
        <Rect x={g.x} y={g.y} width={g.width} height={g.height} {...common} dash={obj.type === 'hyperlink' ? [3, 3] : common.dash} />
        {obj.type === 'hyperlink' && (
          <KText x={g.x + 4} y={g.y + 4} text="🔗" fontSize={12} fill={stroke} listening={false} />
        )}
      </Group>
    );
  } else if (obj.type === 'diameter') {
    const g = obj.geometry;
    shape = (
      <Group data-obj-id={obj.id}>
        <Circle x={g.center.x} y={g.center.y} radius={g.radius} stroke={stroke} strokeWidth={strokeWidth} fill="transparent" opacity={opacity} dash={dash || undefined} />
        <Line points={[g.p1.x, g.p1.y, g.p2.x, g.p2.y]} stroke={stroke} strokeWidth={1} dash={[4, 3]} opacity={opacity} />
      </Group>
    );
  } else if (obj.type === 'angle') {
    const [a, b, c] = obj.geometry.points;
    shape = (
      <Group data-obj-id={obj.id}>
        <Line points={[a.x, a.y, b.x, b.y, c.x, c.y]} stroke={stroke} strokeWidth={strokeWidth} opacity={opacity} />
      </Group>
    );
  } else if (obj.type === 'text') {
    shape = <KText x={obj.geometry.position.x} y={obj.geometry.position.y} text={obj.metadata?.note ?? ''} fontSize={14} fill={stroke} data-obj-id={obj.id} />;
  } else if (obj.type === 'callout') {
    const a = obj.geometry.anchor;
    const b = obj.geometry.box;
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    shape = (
      <Group data-obj-id={obj.id}>
        <Line points={[a.x, a.y, cx, cy]} stroke={stroke} strokeWidth={1.5} opacity={opacity} />
        <Circle x={a.x} y={a.y} radius={3} fill={stroke} opacity={opacity} />
        <Rect x={b.x} y={b.y} width={b.width} height={b.height} fill="rgba(255,255,255,0.96)" stroke={stroke} strokeWidth={1.5} cornerRadius={4} opacity={opacity} />
        <KText x={b.x + 6} y={b.y + 6} width={b.width - 12} text={obj.metadata?.note ?? 'Note'} fontSize={12} fill="#0f172a" />
      </Group>
    );
  }

  return (
    <>
      {shape}
      {label && labelAt && (
        <Label x={labelAt.x} y={labelAt.y} offsetX={0} offsetY={0} listening={false}>
          <Tag fill="rgba(255,255,255,0.94)" stroke={stroke} strokeWidth={1} cornerRadius={3} pointerDirection="none" />
          <KText text={label} padding={3} fontSize={11} fill="#0f172a" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" />
        </Label>
      )}
    </>
  );
}

function measurementLabel(obj, displayUnit, mmPerPx) {
  const g = obj.geometry;
  switch (obj.type) {
    case 'length':
    case 'perimeter':
      return formatLength(polylineLengthPx(g.points || []) * mmPerPx, displayUnit);
    case 'line':
    case 'arrow':
      return formatLength(Math.hypot(g.to.x - g.from.x, g.to.y - g.from.y) * mmPerPx, displayUnit);
    case 'area':
    case 'cloud':
      return formatArea(polygonAreaPx(g.points || []) * mmPerPx * mmPerPx, displayUnit);
    case 'rectangle':
      return formatArea(Math.abs(g.width * g.height) * mmPerPx * mmPerPx, displayUnit);
    case 'diameter':
      return formatLength((g.radius * 2) * mmPerPx, displayUnit);
    case 'angle':
      return formatAngle(obj.metadata?.angleDeg);
    case 'count':
      return null; // counts don't get a label; the symbol speaks for itself
    default:
      return null;
  }
}

function rectFromTwoPoints(a, b) {
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) };
}

function objectBoundingBoxIntersects(obj, rect) {
  const bb = bboxFor(obj);
  if (!bb) return false;
  return !(bb.x + bb.width < rect.x || bb.x > rect.x + rect.width || bb.y + bb.height < rect.y || bb.y > rect.y + rect.height);
}

function bboxFor(obj) {
  const g = obj.geometry;
  if (!g) return null;
  if (g.points && g.points.length > 0) {
    const xs = g.points.map((p) => p.x), ys = g.points.map((p) => p.y);
    return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
  }
  if (g.from && g.to) {
    return { x: Math.min(g.from.x, g.to.x), y: Math.min(g.from.y, g.to.y), width: Math.abs(g.from.x - g.to.x), height: Math.abs(g.from.y - g.to.y) };
  }
  if (g.center && g.radius != null) {
    return { x: g.center.x - g.radius, y: g.center.y - g.radius, width: g.radius * 2, height: g.radius * 2 };
  }
  if (g.position) return { x: g.position.x - 4, y: g.position.y - 4, width: 80, height: 16 };
  if (g.anchor && g.box) {
    const x = Math.min(g.anchor.x, g.box.x), y = Math.min(g.anchor.y, g.box.y);
    return { x, y, width: Math.max(g.anchor.x, g.box.x + g.box.width) - x, height: Math.max(g.anchor.y, g.box.y + g.box.height) - y };
  }
  if (typeof g.x === 'number' && typeof g.y === 'number') return { x: g.x, y: g.y, width: g.width || 0, height: g.height || 0 };
  return null;
}

function aggregateBbox(objs) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, hits = 0;
  for (const o of objs) {
    const bb = bboxFor(o);
    if (!bb) continue;
    minX = Math.min(minX, bb.x); minY = Math.min(minY, bb.y);
    maxX = Math.max(maxX, bb.x + bb.width); maxY = Math.max(maxY, bb.y + bb.height);
    hits++;
  }
  if (hits === 0) return null;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function flatten(points) {
  const out = [];
  for (const p of points) { out.push(p.x, p.y); }
  return out;
}
function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return '15,23,42';
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)].join(',');
}
function extractSinglePath(svg) {
  const match = /d="([^"]+)"/.exec(svg);
  return match ? match[1] : '';
}

const readoutStyle = {
  position: 'sticky', bottom: 8, marginLeft: 8, marginRight: 'auto', display: 'inline-block',
  padding: '4px 10px', background: 'rgba(15,23,42,0.85)', color: 'white',
  borderRadius: 6, fontSize: 12, fontFamily: 'var(--geist-font-mono, ui-monospace)',
};
const warningStyle = {
  position: 'absolute', top: 8, left: 8,
  padding: '4px 8px', background: 'rgba(245,166,35,0.95)', color: '#422006',
  borderRadius: 6, fontSize: 12,
};
