import { useCallback, useEffect, useMemo, useState } from 'react';
import { Upload, Download, FileText, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import MarkupCanvas from '../components/markup/MarkupCanvas';
import MarkupToolbar from '../components/markup/MarkupToolbar';
import LayerPanel from '../components/markup/LayerPanel';
import SymbolPicker from '../components/markup/SymbolPicker';
import useMarkupStore from '../stores/useMarkupStore';
import useProjectStore from '../stores/useProjectStore';
import { buildLegend, downloadString, legendToCSV } from '../markup/exporters';

export default function MarkupPage() {
  const projects = useProjectStore((s) => s.projects);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? null);
  const drawings = useMarkupStore((s) => s.drawings);
  const markupDocs = useMarkupStore((s) => s.markupDocs);
  const hydrate = useMarkupStore((s) => s.hydrate);
  const uploadDrawing = useMarkupStore((s) => s.uploadDrawing);
  const addObject = useMarkupStore((s) => s.addObject);
  const updateObject = useMarkupStore((s) => s.updateObject);
  const removeObject = useMarkupStore((s) => s.removeObject);
  const calibrate = useMarkupStore((s) => s.calibrate);
  const addLayerFn = useMarkupStore((s) => s.addLayer);
  const updateLayerFn = useMarkupStore((s) => s.updateLayer);
  const removeLayerFn = useMarkupStore((s) => s.removeLayer);
  const setMarkupPageCount = useMarkupStore((s) => s.setMarkupPageCount);
  const getDrawingBlob = useMarkupStore((s) => s.getDrawingBlob);
  const deleteDrawing = useMarkupStore((s) => s.deleteDrawing);

  const [selectedDrawingId, setSelectedDrawingId] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [activeTool, setActiveTool] = useState(null);
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [snapGridPx, setSnapGridPx] = useState(0);
  const [orthoLocked, setOrthoLocked] = useState(false);
  const [placementSymbolId, setPlacementSymbolId] = useState(null);
  const [drawingBlob, setDrawingBlob] = useState(null);
  const [contentType, setContentType] = useState(null);

  useEffect(() => { hydrate(); }, [hydrate]);

  const projectDrawings = useMemo(
    () => drawings.filter((d) => !projectId || d.projectId === projectId),
    [drawings, projectId],
  );
  const drawing = projectDrawings.find((d) => d.id === selectedDrawingId) || projectDrawings[0] || null;
  const markupDoc = drawing ? markupDocs.find((d) => d.drawingId === drawing.id) : null;
  const page = markupDoc?.pages.find((p) => p.pageNumber === pageNumber) ?? markupDoc?.pages[0] ?? null;
  const activeLayerId = page?.layers[0]?.id;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!drawing) { setDrawingBlob(null); return; }
      const blob = await getDrawingBlob(drawing.id);
      if (!cancelled) {
        setDrawingBlob(blob);
        setContentType(drawing.contentType);
      }
    })();
    return () => { cancelled = true; };
  }, [drawing, getDrawingBlob]);

  // If a PDF, ask pdf.js for the real page count and persist it.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!drawing || !drawingBlob) return;
      if (drawing.contentType !== 'application/pdf') return;
      try {
        const { getPdfDocument } = await import('../components/markup/pdfPageRender');
        const doc = await getPdfDocument(drawingBlob);
        if (cancelled) return;
        if (markupDoc && markupDoc.pages.length !== doc.numPages) {
          await setMarkupPageCount(markupDoc.id, doc.numPages);
        }
      } catch (err) {
        console.error('Failed reading PDF page count', err);
      }
    })();
    return () => { cancelled = true; };
  }, [drawing, drawingBlob, markupDoc, setMarkupPageCount]);

  const handleUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!projectId) {
      window.alert('Pick a project first.');
      return;
    }
    const accepted = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!accepted.includes(file.type)) {
      window.alert('Supported file types: PDF, PNG, JPG, WEBP.');
      return;
    }
    const { drawing: created } = await uploadDrawing({ projectId, file, pageCount: 1 });
    setSelectedDrawingId(created.id);
    setPageNumber(1);
  }, [projectId, uploadDrawing]);

  const handleCommit = useCallback((obj) => {
    if (!markupDoc || !page) return;
    addObject(markupDoc.id, page.pageNumber, obj);
  }, [addObject, markupDoc, page]);

  const handleObjectSelected = useCallback((obj) => {
    if (!obj || !markupDoc || !page) return;
    if (obj.__delete) {
      removeObject(markupDoc.id, page.pageNumber, obj.__delete);
    }
  }, [markupDoc, page, removeObject]);

  const handleCalibrated = useCallback(({ mmPerPx }) => {
    if (!markupDoc || !page) return;
    calibrate(markupDoc.id, page.pageNumber, { x: 0, y: 0 }, { x: 1 / mmPerPx, y: 0 }, 1);
    setCalibrationMode(false);
  }, [calibrate, markupDoc, page]);

  const handleExportLegend = useCallback(() => {
    if (!markupDoc) return;
    const legend = buildLegend(markupDoc);
    downloadString(`${markupDoc.name || 'markup'}-legend.csv`, legendToCSV(legend));
  }, [markupDoc]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-height))' }}>
      {/* Top control row */}
      <div style={topRow}>
        <select value={projectId ?? ''} onChange={(e) => setProjectId(e.target.value || null)} style={select} aria-label="Project">
          <option value="">— Select project —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.code} · {p.name}</option>
          ))}
        </select>

        <select
          value={drawing?.id ?? ''}
          onChange={(e) => { setSelectedDrawingId(e.target.value); setPageNumber(1); }}
          style={select}
          disabled={projectDrawings.length === 0}
          aria-label="Drawing"
        >
          <option value="">— Select drawing —</option>
          {projectDrawings.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <label style={uploadBtn}>
          <Upload size={14} /> Upload
          <input type="file" accept="application/pdf,image/png,image/jpeg,image/webp" onChange={handleUpload} style={{ display: 'none' }} />
        </label>

        {drawing && (
          <button type="button" onClick={() => deleteDrawing(drawing.id).then(() => { setSelectedDrawingId(null); })} style={dangerBtn} title="Delete drawing" aria-label="Delete drawing">
            <Trash2 size={14} />
          </button>
        )}

        <div style={{ flex: 1 }} />

        {markupDoc && markupDoc.pages.length > 1 && (
          <div style={pageNav}>
            <button type="button" onClick={() => setPageNumber((n) => Math.max(1, n - 1))} aria-label="Previous page" style={navBtn}><ChevronLeft size={14} /></button>
            <span style={{ fontSize: 13 }}>Page {pageNumber} / {markupDoc.pages.length}</span>
            <button type="button" onClick={() => setPageNumber((n) => Math.min(markupDoc.pages.length, n + 1))} aria-label="Next page" style={navBtn}><ChevronRight size={14} /></button>
          </div>
        )}

        <button type="button" onClick={handleExportLegend} style={iconBtn} title="Export legend CSV" aria-label="Export legend">
          <Download size={14} /> Legend
        </button>
      </div>

      {/* Body: left rail (toolbar+symbols+layers) + canvas */}
      {!drawing || !markupDoc || !page ? (
        <div style={emptyState}>
          <FileText size={32} />
          <p>Upload a PDF or image to begin take-off.</p>
          <p style={{ fontSize: 12, color: '#64748b' }}>Hold ⌘/Ctrl + scroll to zoom; middle-click drag to pan; Esc to cancel a drawing tool.</p>
        </div>
      ) : (
        <div style={body}>
          <aside style={leftRail}>
            <MarkupToolbar
              activeTool={activeTool}
              onSelectTool={setActiveTool}
              calibrationMode={calibrationMode}
              onToggleCalibration={() => setCalibrationMode((v) => !v)}
              snapGridPx={snapGridPx}
              onSnapGridChange={setSnapGridPx}
              orthoLocked={orthoLocked}
              onToggleOrtho={() => setOrthoLocked((v) => !v)}
            />
            <LayerPanel
              page={page}
              activeLayerId={activeLayerId}
              onSetActiveLayer={() => {}}
              onAddLayer={() => addLayerFn(markupDoc.id, page.pageNumber, {})}
              onUpdateLayer={(layerId, patch) => updateLayerFn(markupDoc.id, page.pageNumber, layerId, patch)}
              onRemoveLayer={(layerId) => removeLayerFn(markupDoc.id, page.pageNumber, layerId)}
            />
            {activeTool === 'count' && (
              <SymbolPicker selectedSymbolId={placementSymbolId} onSelect={setPlacementSymbolId} />
            )}
            <div style={infoBox}>
              <strong>Scale</strong>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                {page.scale.isCalibrated
                  ? `${page.scale.mmPerPx.toFixed(4)} mm/px`
                  : 'Not calibrated — use the Calibrate button.'}
              </div>
              <div style={{ fontSize: 12, color: '#475569' }}>Page {page.pageNumber} of {markupDoc.pages.length}</div>
              <div style={{ fontSize: 12, color: '#475569' }}>Objects: {page.objects.length}</div>
            </div>
          </aside>
          <div style={canvasHost}>
            <MarkupCanvas
              drawingBlob={drawingBlob}
              drawingContentType={contentType}
              markupDoc={markupDoc}
              pageNumber={pageNumber}
              activeTool={activeTool}
              activeLayerId={activeLayerId}
              calibrationMode={calibrationMode}
              snapGridPx={snapGridPx}
              orthoLocked={orthoLocked}
              style={{ stroke: '#ef4444', fill: 'rgba(239,68,68,0.15)', strokeWidth: 2 }}
              placementSymbolId={placementSymbolId}
              onCommitObject={handleCommit}
              onCalibrated={handleCalibrated}
              onObjectSelected={handleObjectSelected}
              onObjectUpdated={(id, patch) => updateObject(markupDoc.id, page.pageNumber, id, patch)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const topRow = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
  background: 'white', borderBottom: '1px solid var(--border, #e5e7eb)',
};
const select = { padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border, #e5e7eb)', fontSize: 13, minWidth: 160 };
const uploadBtn = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: '#0f172a', color: 'white', borderRadius: 6, cursor: 'pointer', fontSize: 13 };
const iconBtn = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'white', color: '#0f172a', border: '1px solid var(--border, #e5e7eb)', borderRadius: 6, cursor: 'pointer', fontSize: 13 };
const dangerBtn = { ...iconBtn, color: '#b91c1c', borderColor: '#fca5a5' };
const pageNav = { display: 'inline-flex', alignItems: 'center', gap: 6 };
const navBtn = { background: 'white', border: '1px solid var(--border, #e5e7eb)', borderRadius: 6, padding: 4, cursor: 'pointer' };
const body = { display: 'flex', flex: 1, minHeight: 0 };
const leftRail = { width: 280, display: 'flex', flexDirection: 'column', gap: 10, padding: 10, overflow: 'auto', borderRight: '1px solid var(--border, #e5e7eb)', background: '#f8fafc' };
const canvasHost = { flex: 1, position: 'relative', minHeight: 0 };
const emptyState = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#475569', flex: 1, padding: 40, textAlign: 'center' };
const infoBox = { padding: 8, background: 'white', border: '1px solid var(--border, #e5e7eb)', borderRadius: 6 };
