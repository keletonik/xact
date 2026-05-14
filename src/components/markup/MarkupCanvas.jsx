import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Circle, Line, Rect, Group, Text as KText, Arrow, Path } from 'react-konva';
import { instantiateTool } from '../../markup/tools';
import { formatArea, formatLength, polylineLengthPx, polygonAreaPx } from '../../markup/geometry';
import { calibratePage } from '../../markup/scale';
import { getSymbol } from '../../markup/symbolLibrary';
import { getPdfDocument, renderImage, renderPdfPage } from './pdfPageRender';

/**
 * MarkupCanvas
 * ============
 * Three-layer composition:
 *   1. <canvas> — PDF/image render (raster, immutable)
 *   2. <Stage> from react-konva — interactive overlay holding markup objects
 *   3. HUD — toolbar/layer panel/page navigator (rendered by the parent)
 *
 * Props:
 *   - drawingBlob          : Blob (PDF or image)
 *   - drawingContentType   : string (mime)
 *   - markupDoc            : MarkupDocument
 *   - pageNumber           : number (1-indexed)
 *   - activeTool           : string (one of TOOL_FACTORIES keys) or null
 *   - activeLayerId        : string
 *   - calibrationMode      : boolean
 *   - snapGridPx           : number | 0
 *   - orthoLocked          : boolean
 *   - style                : { stroke, fill, ... }
 *   - placementSymbolId    : string | null  (when placing a count w/ a symbol)
 *   - placementProductId   : string | null
 *   - onCommitObject       : (obj) => void
 *   - onCalibrated         : ({ mmPerPx }) => void
 *   - onObjectSelected     : (objOrNull) => void
 *   - onObjectUpdated      : (objId, patch) => void
 *   - onTransform          : (stageScale, x, y) => void
 *
 * Pan: middle-mouse drag, or hold Space + drag.
 * Zoom: ctrl/⌘ + wheel.
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
  onObjectSelected,
}) {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const [renderSize, setRenderSize] = useState({ width: 800, height: 600 });
  const renderScale = 1.5;
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [previewTick, setPreviewTick] = useState(0);
  const [calibState, setCalibState] = useState(null); // { points: [..], promptForLength: bool }
  const [isPanning, setIsPanning] = useState(false);
  const panOrigin = useRef(null);
  const [selectedId, setSelectedId] = useState(null);

  const page = useMemo(
    () => markupDoc.pages.find((p) => p.pageNumber === pageNumber) || markupDoc.pages[0],
    [markupDoc, pageNumber],
  );

  // ------- raster render -------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!drawingBlob || !canvasRef.current) return;
      try {
        if (drawingContentType === 'application/pdf') {
          const doc = await getPdfDocument(drawingBlob);
          if (cancelled) return;
          const result = await renderPdfPage({
            doc, pageNumber, canvas: canvasRef.current, scale: renderScale,
          });
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
  // Tools are stateful (they hold in-progress geometry), but we deliberately
  // reset their state whenever activeTool or calibrationMode changes.
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

  // ------- pointer plumbing -------
  const getStagePoint = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    const t = stage.getAbsoluteTransform().copy().invert();
    return t.point(pos);
  }, []);

  const handlePointerDown = useCallback((e) => {
    // pan
    if (e.evt.button === 1 || (e.evt.button === 0 && e.evt.spaceKey)) {
      setIsPanning(true);
      panOrigin.current = { x: e.evt.clientX, y: e.evt.clientY, stage: { ...stagePos } };
      return;
    }
    const p = getStagePoint(); if (!p) return;
    if (calibrationMode) {
      if (!calibState) {
        setCalibState({ points: [p] });
      } else if (calibState.points.length === 1) {
        const pointA = calibState.points[0];
        const pointB = p;
        // Defer the blocking prompt until after the current event loop turn so
        // React can flush the visual update of the second calibration point.
        Promise.resolve().then(() => {
          const input = window.prompt('Enter the real-world length in millimetres for the line just drawn:');
          if (input == null || input === '') { setCalibState(null); return; }
          const mm = Number.parseFloat(input);
          if (!Number.isFinite(mm) || mm <= 0) { setCalibState(null); return; }
          try {
            const newPage = calibratePage(page, pointA, pointB, mm);
            if (onCalibrated) onCalibrated({ mmPerPx: newPage.scale.mmPerPx, points: newPage.scale.calibrationPoints, knownMm: mm });
          } catch (err) {
            console.error('Calibration failed', err);
          }
          setCalibState(null);
        });
        setCalibState({ points: [pointA, pointB] });
      }
      return;
    }
    if (!tool) {
      // selection
      const stage = stageRef.current;
      const target = stage.getIntersection(stage.getPointerPosition());
      const id = target?.attrs?.['data-obj-id'] || target?.findAncestor?.('Group')?.attrs?.['data-obj-id'];
      if (id) {
        setSelectedId(id);
        const obj = page.objects.find((o) => o.id === id);
        if (obj && onObjectSelected) onObjectSelected(obj);
      } else {
        setSelectedId(null);
        if (onObjectSelected) onObjectSelected(null);
      }
      return;
    }
    tool.onPointerDown?.(p, toolCtx);
    setPreviewTick((t) => t + 1);
    // single-shot tools (count, text) commit immediately on click
    if (tool.type === 'count' || tool.type === 'text') {
      const out = tool.commit?.();
      if (out && onCommitObject) onCommitObject(out);
    }
  }, [calibrationMode, calibState, getStagePoint, onCalibrated, onCommitObject, onObjectSelected, page, stagePos, tool, toolCtx]);

  const handlePointerMove = useCallback((e) => {
    if (isPanning && panOrigin.current) {
      const dx = e.evt.clientX - panOrigin.current.x;
      const dy = e.evt.clientY - panOrigin.current.y;
      setStagePos({ x: panOrigin.current.stage.x + dx, y: panOrigin.current.stage.y + dy });
      return;
    }
    const p = getStagePoint(); if (!p) return;
    if (!tool) return;
    tool.onPointerMove?.(p, toolCtx);
    setPreviewTick((t) => t + 1);
  }, [getStagePoint, isPanning, tool, toolCtx]);

  const handlePointerUp = useCallback(() => {
    if (isPanning) { setIsPanning(false); panOrigin.current = null; return; }
    const p = getStagePoint(); if (!p) return;
    if (!tool) return;
    const result = tool.onPointerUp?.(p, toolCtx);
    if (result && onCommitObject) onCommitObject(result);
    setPreviewTick((t) => t + 1);
  }, [getStagePoint, isPanning, onCommitObject, tool, toolCtx]);

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
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, [stagePos, stageScale]);

  useEffect(() => {
    const onKey = (e) => {
      if (calibrationMode && calibState?.promptForLength && e.key === 'Enter') return;
      if (!tool) {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && onObjectSelected) {
          onObjectSelected({ __delete: selectedId });
        }
        return;
      }
      const res = tool.onKey?.(e, toolCtx);
      if (res && onCommitObject) onCommitObject(res);
      setPreviewTick((t) => t + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [calibrationMode, calibState, onCommitObject, onObjectSelected, selectedId, tool, toolCtx]);


  // ------- render markup objects -------
  const layerLookup = useMemo(() => Object.fromEntries(page.layers.map((l) => [l.id, l])), [page.layers]);
  const visibleObjects = page.objects.filter((o) => layerLookup[o.layerId]?.visible !== false);
  const previewObj = tool?.getPreview?.();

  // ------- live readout for the current tool -------
  const readout = useMemo(() => {
    if (!previewObj || !page.scale) return null;
    if (previewObj.type === 'length') {
      const lengthPx = polylineLengthPx(previewObj.geometry.points);
      return formatLength(lengthPx * page.scale.mmPerPx, page.displayUnit);
    }
    if (previewObj.type === 'area') {
      const areaPx = polygonAreaPx(previewObj.geometry.points);
      return formatArea(areaPx * page.scale.mmPerPx * page.scale.mmPerPx, page.displayUnit);
    }
    return null;
  }, [previewObj, page.scale, page.displayUnit]);

  return (
    <div style={{ position: 'relative', overflow: 'auto', background: '#f5f5f5', width: '100%', height: '100%' }}>
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
          style={{ position: 'absolute', inset: 0, cursor: isPanning ? 'grabbing' : activeTool ? 'crosshair' : 'default' }}
        >
          <Layer listening>
            {visibleObjects.map((obj) => (
              <ObjectShape key={obj.id} obj={obj} color={layerLookup[obj.layerId]?.color} opacity={layerLookup[obj.layerId]?.opacity ?? 1} isSelected={obj.id === selectedId} />
            ))}
            {previewObj && (
              <ObjectShape obj={previewObj} color={style?.stroke || '#ef4444'} opacity={0.7} isPreview />
            )}
            {calibState?.points?.length === 1 && (
              <Circle x={calibState.points[0].x} y={calibState.points[0].y} radius={6} fill="#10b981" />
            )}
            {calibState?.points?.length === 2 && (
              <Line
                points={[calibState.points[0].x, calibState.points[0].y, calibState.points[1].x, calibState.points[1].y]}
                stroke="#10b981" strokeWidth={2} dash={[4, 4]}
              />
            )}
          </Layer>
        </Stage>
      </div>
      {readout && (
        <div style={readoutStyle} aria-live="polite">{readout}</div>
      )}
      {!page.scale.isCalibrated && (
        <div style={warningStyle}>Page not calibrated — measurements show nominal values.</div>
      )}
      <span hidden data-tick={previewTick} />
    </div>
  );
}

function ObjectShape({ obj, color, opacity = 1, isPreview = false, isSelected = false }) {
  const stroke = isSelected ? '#3b82f6' : (obj.style?.stroke || color || '#ef4444');
  const fill = obj.style?.fill ?? `rgba(${hexToRgb(stroke)},0.15)`;
  const strokeWidth = (obj.style?.strokeWidth ?? 2) * (isSelected ? 1.5 : 1);
  const dash = isPreview ? [6, 4] : obj.style?.dash || null;
  const common = {
    stroke, fill, strokeWidth, opacity, dash: dash || undefined,
    'data-obj-id': obj.id,
  };
  if (obj.type === 'count') {
    const sym = obj.metadata?.symbolId ? getSymbol(obj.metadata.symbolId) : null;
    return (
      <Group x={obj.geometry.center.x} y={obj.geometry.center.y} data-obj-id={obj.id}>
        <Circle radius={obj.geometry.radius || 10} {...common} />
        {sym && (
          <Path data={extractSinglePath(sym.svg)} scale={{ x: 0.8, y: 0.8 }} offset={{ x: 12, y: 12 }} stroke={stroke} strokeWidth={1.5} fill={fill} />
        )}
      </Group>
    );
  }
  if (obj.type === 'length' || obj.type === 'line') {
    return (
      <Line points={flatten(obj.geometry.points || [obj.geometry.from, obj.geometry.to])} {...common} fill={undefined} />
    );
  }
  if (obj.type === 'arrow') {
    return (
      <Arrow points={[obj.geometry.from.x, obj.geometry.from.y, obj.geometry.to.x, obj.geometry.to.y]} {...common} fill={stroke} />
    );
  }
  if (obj.type === 'area' || obj.type === 'cloud') {
    return (
      <Line points={flatten(obj.geometry.points)} closed {...common} />
    );
  }
  if (obj.type === 'rectangle') {
    const g = obj.geometry;
    return <Rect x={g.x} y={g.y} width={g.width} height={g.height} {...common} />;
  }
  if (obj.type === 'text') {
    return <KText x={obj.geometry.position.x} y={obj.geometry.position.y} text={obj.metadata?.note ?? ''} fontSize={14} fill={stroke} data-obj-id={obj.id} />;
  }
  return null;
}

function flatten(points) {
  const out = [];
  for (const p of points) { out.push(p.x, p.y); }
  return out;
}

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return '239,68,68';
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)].join(',');
}

// Naive single-path extractor for the inlined symbol svg. The library's svgs are
// hand-authored and may contain multiple shape elements; this returns a best-effort
// 'd' attribute for Konva.Path rendering. If none, the toolbar icon is enough.
function extractSinglePath(svg) {
  const match = /d="([^"]+)"/.exec(svg);
  return match ? match[1] : '';
}

const readoutStyle = {
  position: 'sticky', bottom: 8, marginLeft: 8, marginRight: 'auto', display: 'inline-block',
  padding: '4px 10px', background: 'rgba(15,23,42,0.85)', color: 'white',
  borderRadius: 6, fontSize: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
};
const warningStyle = {
  position: 'absolute', top: 8, left: 8,
  padding: '4px 8px', background: 'rgba(250,204,21,0.95)', color: '#422006',
  borderRadius: 6, fontSize: 12,
};
