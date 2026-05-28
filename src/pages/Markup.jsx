import { useCallback, useEffect, useMemo, useState } from 'react';
import { Upload, Download, FileText, Trash2, MapPin } from 'lucide-react';
import MarkupCanvas from '../components/markup/MarkupCanvas';
import MarkupToolbar from '../components/markup/MarkupToolbar';
import LayerPanel from '../components/markup/LayerPanel';
import CustomisableSymbolPalette from '../components/markup/CustomisableSymbolPalette';
import DrawingScalePicker from '../components/markup/DrawingScalePicker';
import PropertiesPanel from '../components/markup/PropertiesPanel';
import MarkupsListPanel from '../components/markup/MarkupsListPanel';
import StatusBar from '../components/markup/StatusBar';
import AssetEditor from '../components/asset/AssetEditor';
import useMarkupStore from '../stores/useMarkupStore';
import useProjectStore from '../stores/useProjectStore';
import useAssetStore from '../stores/useAssetStore';
import useSystemLibraryStore from '../stores/useSystemLibraryStore';
import useToolbarPrefs from '../hooks/useToolbarPrefs';
import { buildLegend, downloadString, legendToCSV } from '../markup/exporters';
import { getPdfDocument } from '../components/markup/pdfPageRender';
import { sniffFileKind } from '../utils/fileSniff';

export default function MarkupPage() {
  const projects = useProjectStore((s) => s.projects);
  const hydrateProjects = useProjectStore((s) => s.hydrate);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? null);

  // Asset pin support: hydrate stores, filter to current drawing, and
  // when the user clicks the canvas in pin-mode open the AssetEditor
  // pre-filled with drawingId + location coordinates.
  const assets = useAssetStore((s) => s.assets);
  const specialisations = useAssetStore((s) => s.specialisations);
  const hydrateAssets = useAssetStore((s) => s.hydrate);
  const createAsset = useAssetStore((s) => s.createAsset);
  const updateAsset = useAssetStore((s) => s.updateAsset);
  const hydrateSystems = useSystemLibraryStore((s) => s.hydrate);

  const [assetPinMode, setAssetPinMode] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);   // null | 'new' | assetObject
  const [pendingPinLocation, setPendingPinLocation] = useState(null);

  // store selectors
  const drawings           = useMarkupStore((s) => s.drawings);
  const markupDocs         = useMarkupStore((s) => s.markupDocs);
  const hydrate            = useMarkupStore((s) => s.hydrate);
  const uploadDrawing      = useMarkupStore((s) => s.uploadDrawing);
  const addObject          = useMarkupStore((s) => s.addObject);
  const updateObject       = useMarkupStore((s) => s.updateObject);
  const removeObjects      = useMarkupStore((s) => s.removeObjects);
  const calibrate          = useMarkupStore((s) => s.calibrate);
  const setDisplayUnit     = useMarkupStore((s) => s.setDisplayUnit);
  const addLayerFn         = useMarkupStore((s) => s.addLayer);
  const updateLayerFn      = useMarkupStore((s) => s.updateLayer);
  const removeLayerFn      = useMarkupStore((s) => s.removeLayer);
  const setMarkupPageCount = useMarkupStore((s) => s.setMarkupPageCount);
  const getDrawingBlob     = useMarkupStore((s) => s.getDrawingBlob);
  const deleteDrawing      = useMarkupStore((s) => s.deleteDrawing);
  const undoFn             = useMarkupStore((s) => s.undo);
  const redoFn             = useMarkupStore((s) => s.redo);
  const history            = useMarkupStore((s) => s.history);
  const copyToClipboard    = useMarkupStore((s) => s.copyToClipboard);
  const pasteClipboard     = useMarkupStore((s) => s.pasteClipboard);
  const duplicateObjects   = useMarkupStore((s) => s.duplicateObjects);
  const groupObjects       = useMarkupStore((s) => s.groupObjects);
  const ungroupObjects     = useMarkupStore((s) => s.ungroupObjects);
  const transformObjects   = useMarkupStore((s) => s.transformObjects);

  const { prefs, togglePin, recordUse, resetDefaults } = useToolbarPrefs();

  // local UI state
  const [selectedDrawingId, setSelectedDrawingId] = useState(null);
  const [pageNumber, setPageNumber]               = useState(1);
  const [activeTool, setActiveTool]               = useState(null);
  const [calibrationMode, setCalibrationMode]     = useState(false);
  const [snapGridPx, setSnapGridPx]               = useState(0);
  const [orthoLocked, setOrthoLocked]             = useState(false);
  const [placementSymbolId, setPlacementSymbolId] = useState(null);
  const [drawingBlob, setDrawingBlob]             = useState(null);
  const [contentType, setContentType]             = useState(null);
  const [activeLayerOverride, setActiveLayerOverride] = useState(null);
  const [selectedIds, setSelectedIds]             = useState(() => new Set());
  // Track the drawing+page combo we last had selection for. When the user
  // navigates, derive a cleared selection during render instead of in an
  // effect (which React 19's lint correctly flags as a re-render cascade).
  const [lastDocPage, setLastDocPage] = useState({ id: null, pn: 1 });
  const [cursorMm, setCursorMm]                   = useState(null);
  const [zoom, setZoom]                           = useState(1);
  const [showLabels, setShowLabels]               = useState(true);
  const [rightPanel, setRightPanel]               = useState('properties'); // 'properties' | 'list'

  useEffect(() => { hydrate(); hydrateProjects(); hydrateAssets(); hydrateSystems(); }, [hydrate, hydrateProjects, hydrateAssets, hydrateSystems]);

  const projectDrawings = useMemo(
    () => drawings.filter((d) => !projectId || d.projectId === projectId),
    [drawings, projectId],
  );
  const drawing = projectDrawings.find((d) => d.id === selectedDrawingId) || projectDrawings[0] || null;
  const markupDoc = drawing ? markupDocs.find((d) => d.drawingId === drawing.id) : null;
  const page = markupDoc?.pages.find((p) => p.pageNumber === pageNumber) ?? markupDoc?.pages[0] ?? null;
  const activeLayerId = page
    ? (page.layers.find((l) => l.id === activeLayerOverride)?.id ?? page.layers[0]?.id)
    : null;

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

  // Set PDF page count
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!drawing || !drawingBlob) return;
      if (drawing.contentType !== 'application/pdf') return;
      try {
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

  // Reset selection when changing pages or docs (React 19-friendly: derive
  // during render rather than mutating in an effect).
  const currentKey = { id: drawing?.id ?? null, pn: pageNumber };
  if (currentKey.id !== lastDocPage.id || currentKey.pn !== lastDocPage.pn) {
    setLastDocPage(currentKey);
    if (selectedIds.size > 0) setSelectedIds(new Set());
  }

  const handleUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!projectId) { window.alert('Pick a project first.'); return; }
    const sniffed = await sniffFileKind(file);
    const accepted = ['pdf', 'png', 'jpeg', 'webp'];
    if (!sniffed || !accepted.includes(sniffed)) {
      window.alert(`Supported file types: PDF, PNG, JPG, WEBP. (Detected: ${sniffed || 'unknown'})`);
      return;
    }
    const { drawing: created } = await uploadDrawing({ projectId, file, pageCount: 1 });
    setSelectedDrawingId(created.id);
    setPageNumber(1);
  }, [projectId, uploadDrawing]);

  const handleCommit = useCallback((obj) => {
    if (!markupDoc || !page) return;
    addObject(markupDoc.id, page.pageNumber, obj);
    if (obj?.metadata?.symbolId) recordUse(obj.metadata.symbolId);
  }, [addObject, markupDoc, page, recordUse]);

  const handleDeleteSelected = useCallback(() => {
    if (!markupDoc || !page || selectedIds.size === 0) return;
    removeObjects(markupDoc.id, page.pageNumber, Array.from(selectedIds));
    setSelectedIds(new Set());
  }, [markupDoc, page, removeObjects, selectedIds]);

  const canUndo = markupDoc ? (history[markupDoc.id]?.past?.length || 0) > 0 : false;
  const canRedo = markupDoc ? (history[markupDoc.id]?.future?.length || 0) > 0 : false;
  const handleUndo = useCallback(() => { if (markupDoc) undoFn(markupDoc.id); }, [markupDoc, undoFn]);
  const handleRedo = useCallback(() => { if (markupDoc) redoFn(markupDoc.id); }, [markupDoc, redoFn]);

  const handleCalibrated = useCallback(({ pointA, pointB, knownMm }) => {
    if (!markupDoc || !page) return;
    calibrate(markupDoc.id, page.pageNumber, pointA, pointB, knownMm);
    setCalibrationMode(false);
  }, [calibrate, markupDoc, page]);

  const handleApplyScale = useCallback((mmPerPx) => {
    if (!markupDoc || !page) return;
    // synthesise two anchors so the store's calibrate() signature is respected
    const A = { x: 0, y: 0 };
    const B = { x: 1, y: 0 };
    calibrate(markupDoc.id, page.pageNumber, A, B, mmPerPx);
  }, [calibrate, markupDoc, page]);

  // Properties-panel updates wrap updateObject so the selection acts as one.
  const handleUpdateObject = useCallback((id, patch) => {
    if (!markupDoc || !page) return;
    updateObject(markupDoc.id, page.pageNumber, id, patch);
  }, [markupDoc, page, updateObject]);

  const handleExportLegend = useCallback(() => {
    if (!markupDoc) return;
    const legend = buildLegend(markupDoc);
    downloadString(`${markupDoc.name || 'markup'}-legend.csv`, legendToCSV(legend));
  }, [markupDoc]);

  // ----- Keyboard shortcuts: undo/redo + copy/paste/duplicate + group + delete -----
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      const meta = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      if (meta && !e.shiftKey && k === 'z') { e.preventDefault(); handleUndo(); return; }
      if (meta && ((e.shiftKey && k === 'z') || k === 'y')) { e.preventDefault(); handleRedo(); return; }
      if (!markupDoc || !page) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
        e.preventDefault(); handleDeleteSelected(); return;
      }
      if (meta && k === 'c' && selectedIds.size > 0) {
        e.preventDefault();
        copyToClipboard(markupDoc.id, page.pageNumber, Array.from(selectedIds));
        return;
      }
      if (meta && k === 'v') {
        e.preventDefault();
        pasteClipboard(markupDoc.id, page.pageNumber).then((fresh) => {
          setSelectedIds(new Set(fresh.map((o) => o.id)));
        });
        return;
      }
      if (meta && k === 'd' && selectedIds.size > 0) {
        e.preventDefault();
        duplicateObjects(markupDoc.id, page.pageNumber, Array.from(selectedIds)).then((fresh) => {
          setSelectedIds(new Set(fresh.map((o) => o.id)));
        });
        return;
      }
      if (meta && !e.shiftKey && k === 'g' && selectedIds.size > 1) {
        e.preventDefault();
        groupObjects(markupDoc.id, page.pageNumber, Array.from(selectedIds));
        return;
      }
      if (meta && e.shiftKey && k === 'g' && selectedIds.size > 0) {
        e.preventDefault();
        // ungroup the group of the first selected object
        const obj = page.objects.find((o) => selectedIds.has(o.id));
        if (obj?.metadata?.groupId) ungroupObjects(markupDoc.id, page.pageNumber, obj.metadata.groupId);
        return;
      }
      if (meta && k === 'a') {
        e.preventDefault();
        setSelectedIds(new Set(page.objects.map((o) => o.id)));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [copyToClipboard, duplicateObjects, groupObjects, handleDeleteSelected, handleRedo, handleUndo, markupDoc, page, pasteClipboard, selectedIds, ungroupObjects]);

  // expand selection to include all members of the group when one is clicked
  const selectionWithGroups = useMemo(() => {
    if (!page) return selectedIds;
    const out = new Set(selectedIds);
    const groupIds = new Set(
      Array.from(out).map((id) => page.objects.find((o) => o.id === id)?.metadata?.groupId).filter(Boolean),
    );
    if (groupIds.size === 0) return out;
    for (const o of page.objects) if (o.metadata?.groupId && groupIds.has(o.metadata.groupId)) out.add(o.id);
    return out;
  }, [page, selectedIds]);

  const selectedObjects = useMemo(() => {
    if (!page) return [];
    return page.objects.filter((o) => selectionWithGroups.has(o.id));
  }, [page, selectionWithGroups]);

  const handleTransform = useCallback((ids, fn) => {
    if (!markupDoc || !page) return;
    transformObjects(markupDoc.id, page.pageNumber, ids, fn);
  }, [markupDoc, page, transformObjects]);

  // Assets pinned to the currently visible drawing.
  const drawingAssets = useMemo(
    () => assets.filter((a) => drawing && a.drawingId === drawing.id && a.locationOnPlan),
    [assets, drawing],
  );

  const handleCreateAssetAt = useCallback((point) => {
    if (!drawing || !projectId) return;
    setPendingPinLocation(point);
    setEditingAsset('new');
  }, [drawing, projectId]);

  const handleSelectAssetPin = useCallback((assetId) => {
    const asset = assets.find((a) => a.id === assetId);
    if (asset) setEditingAsset(asset);
  }, [assets]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-height))' }}>
      {/* Top control row */}
      <div style={topRow}>
        <select value={projectId ?? ''} onChange={(e) => setProjectId(e.target.value || null)} style={select} aria-label="Project">
          <option value="">— Select project —</option>
          {projects.map((p) => (<option key={p.id} value={p.id}>{p.code} · {p.name}</option>))}
        </select>

        <select
          value={drawing?.id ?? ''}
          onChange={(e) => { setSelectedDrawingId(e.target.value); setPageNumber(1); }}
          style={select}
          disabled={projectDrawings.length === 0}
          aria-label="Drawing"
        >
          <option value="">— Select drawing —</option>
          {projectDrawings.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
        </select>

        <label style={uploadBtn}>
          <Upload size={14} strokeWidth={2.25} /> Upload
          <input type="file" accept="application/pdf,image/png,image/jpeg,image/webp" onChange={handleUpload} style={{ display: 'none' }} />
        </label>

        {drawing && (
          <button type="button" onClick={() => deleteDrawing(drawing.id).then(() => setSelectedDrawingId(null))} style={dangerBtn} title="Delete drawing" aria-label="Delete drawing">
            <Trash2 size={14} strokeWidth={2.25} />
          </button>
        )}

        <div style={{ flex: 1 }} />

        <label style={toggleLbl}>
          <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
          Labels
        </label>

        <button
          type="button"
          onClick={() => setAssetPinMode((v) => !v)}
          aria-pressed={assetPinMode}
          title={assetPinMode ? 'Click an empty spot on the plan to drop an asset pin' : 'Asset pin mode (off)'}
          style={{
            ...iconBtn,
            background: assetPinMode ? 'var(--geist-fg)' : 'transparent',
            color: assetPinMode ? 'var(--geist-bg)' : 'var(--geist-fg-2)',
            borderColor: assetPinMode ? 'var(--geist-fg)' : 'var(--geist-border-strong)',
          }}
          disabled={!drawing}
        >
          <MapPin size={14} strokeWidth={2.25} /> Pin asset{drawingAssets.length > 0 ? ` (${drawingAssets.length})` : ''}
        </button>

        <button type="button" onClick={handleExportLegend} style={iconBtn} title="Export legend CSV" aria-label="Export legend">
          <Download size={14} strokeWidth={2.25} /> Legend
        </button>
      </div>

      {!drawing || !markupDoc || !page ? (
        <div style={emptyState}>
          <FileText size={32} strokeWidth={2.25} />
          <p style={{ margin: 0 }}>Upload a PDF or image to begin take-off.</p>
          <p style={{ fontSize: 12, color: 'var(--geist-fg-4)' }}>
            Ctrl/⌘+scroll to zoom · middle-click drag to pan · Space+drag to pan · Esc to clear selection · Cmd-C/V/D for copy/paste/duplicate.
          </p>
        </div>
      ) : (
        <div style={body}>
          {/* Left rail */}
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
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onDeleteSelected={handleDeleteSelected}
              hasSelection={selectedIds.size > 0}
            />
            <DrawingScalePicker
              page={page}
              onApplyScale={handleApplyScale}
              onStartCalibration={() => setCalibrationMode((v) => !v)}
              calibrationMode={calibrationMode}
            />
            <LayerPanel
              page={page}
              activeLayerId={activeLayerId}
              onSetActiveLayer={(id) => setActiveLayerOverride(id)}
              onAddLayer={() => addLayerFn(markupDoc.id, page.pageNumber, {})}
              onUpdateLayer={(layerId, patch) => updateLayerFn(markupDoc.id, page.pageNumber, layerId, patch)}
              onRemoveLayer={(layerId) => removeLayerFn(markupDoc.id, page.pageNumber, layerId)}
            />
            <CustomisableSymbolPalette
              selectedSymbolId={placementSymbolId}
              onSelect={(id) => { setPlacementSymbolId(id); setActiveTool('count'); }}
              prefs={prefs}
              togglePin={togglePin}
              resetDefaults={resetDefaults}
            />
          </aside>

          {/* Canvas + status bar */}
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
              style={{ stroke: 'var(--geist-fg)', fill: 'rgba(15,23,42,0.10)', strokeWidth: 2 }}
              placementSymbolId={placementSymbolId}
              onCommitObject={handleCommit}
              onCalibrated={handleCalibrated}
              selectedIds={selectionWithGroups}
              onSelectionChange={setSelectedIds}
              onCursorMm={setCursorMm}
              onZoomChange={setZoom}
              stageScaleControl={zoom}
              showLabels={showLabels}
              onTransformObjects={handleTransform}
              assetPins={drawingAssets}
              assetPinMode={assetPinMode}
              selectedAssetId={editingAsset && editingAsset !== 'new' ? editingAsset.id : null}
              onCreateAssetAt={handleCreateAssetAt}
              onSelectAsset={handleSelectAssetPin}
            />
            {editingAsset && drawing && projectId && (
              <AssetEditor
                initial={editingAsset === 'new' ? null : editingAsset}
                defaultProjectId={projectId}
                defaultDrawingId={drawing.id}
                defaultLocation={editingAsset === 'new' ? pendingPinLocation : editingAsset.locationOnPlan}
                initialSpecialisation={editingAsset === 'new' ? null : specialisations[editingAsset.id]}
                onClose={() => { setEditingAsset(null); setPendingPinLocation(null); }}
                onSave={async ({ assetPatch, specialisation }) => {
                  if (editingAsset === 'new') {
                    await createAsset({ asset: assetPatch, specialisation });
                  } else {
                    await updateAsset(editingAsset.id, { asset: assetPatch, specialisation });
                  }
                  setEditingAsset(null);
                  setPendingPinLocation(null);
                }}
              />
            )}
            <StatusBar
              page={page}
              totalPages={markupDoc.pages.length}
              pageNumber={pageNumber}
              onSetPage={setPageNumber}
              cursorMm={cursorMm}
              zoom={zoom}
              onZoomChange={setZoom}
              displayUnit={page.displayUnit || 'm'}
              onDisplayUnitChange={(u) => setDisplayUnit(markupDoc.id, page.pageNumber, u)}
              activeTool={activeTool}
              selectionCount={selectedObjects.length}
            />
          </div>

          {/* Right rail: properties + markups list */}
          <aside style={rightRail}>
            <div style={tabsRow}>
              {['properties', 'list'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setRightPanel(k)}
                  aria-pressed={rightPanel === k}
                  style={{ ...tabBtn, ...(rightPanel === k ? tabBtnActive : null) }}
                >
                  {k === 'properties' ? 'Properties' : `Markups (${page.objects.length})`}
                </button>
              ))}
            </div>
            {rightPanel === 'properties' && (
              <PropertiesPanel
                selectedObjects={selectedObjects}
                page={page}
                onUpdate={handleUpdateObject}
              />
            )}
            {rightPanel === 'list' && (
              <MarkupsListPanel
                markupDoc={markupDoc}
                selectedIds={selectionWithGroups}
                onNavigate={(pn) => setPageNumber(pn)}
                onSelect={(id) => setSelectedIds(new Set([id]))}
              />
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

const topRow = { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--geist-bg)', borderBottom: '1px solid var(--geist-border)' };
const select = { padding: '6px 8px', borderRadius: 6, border: '1px solid var(--geist-border-strong)', fontSize: 13, minWidth: 180, color: 'var(--geist-fg)', background: 'var(--geist-bg)' };
const uploadBtn = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: 'var(--geist-fg)', color: 'var(--geist-bg)', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 };
const iconBtn = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'var(--geist-bg)', color: 'var(--geist-fg)', border: '1px solid var(--geist-border-strong)', borderRadius: 6, cursor: 'pointer', fontSize: 13 };
const dangerBtn = { ...iconBtn, color: 'var(--geist-error)', borderColor: 'var(--geist-error)' };
const toggleLbl = { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--geist-fg-2)' };
const body = { display: 'flex', flex: 1, minHeight: 0 };
const leftRail  = { width: 280, display: 'flex', flexDirection: 'column', gap: 10, padding: 10, overflow: 'auto', borderRight: '1px solid var(--geist-border)', background: 'var(--geist-bg-1)' };
const rightRail = { width: 340, display: 'flex', flexDirection: 'column', gap: 10, padding: 10, overflow: 'auto', borderLeft: '1px solid var(--geist-border)', background: 'var(--geist-bg-1)' };
const tabsRow = { display: 'flex', gap: 4 };
const tabBtn = { flex: 1, padding: '6px 8px', fontSize: 12, border: '1px solid var(--geist-border-strong)', background: 'var(--geist-bg)', color: 'var(--geist-fg-2)', cursor: 'pointer', borderRadius: 6 };
const tabBtnActive = { background: 'var(--geist-fg)', color: 'var(--geist-bg)', borderColor: 'var(--geist-fg)' };
const canvasHost = { flex: 1, position: 'relative', minHeight: 0, display: 'flex', flexDirection: 'column' };
const emptyState = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--geist-fg-3)', flex: 1, padding: 40, textAlign: 'center' };
