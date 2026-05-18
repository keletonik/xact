// XACT — Dashboard widget grid (drag-reorder, hide/show, resize span)
const { useState: useStateD, useEffect: useEffectD, useRef: useRefD } = React;

const LS_KEY = 'xact_dashboard_layout_v2';

// Default layout — id, span, optional fixed height hint
const DEFAULT_LAYOUT = [
  { id: 'kpi-pipeline', span: 3, kind: 'kpi' },
  { id: 'kpi-active',   span: 3, kind: 'kpi' },
  { id: 'kpi-winrate',  span: 3, kind: 'kpi' },
  { id: 'kpi-cycle',    span: 3, kind: 'kpi' },
  { id: 'pipeline',     span: 8 },
  { id: 'activity',     span: 4 },
  { id: 'heatmap',      span: 8 },
  { id: 'winloss',      span: 4 },
  { id: 'kanban',       span: 12 },
  { id: 'proposals',    span: 12 },
];

const WIDGET_META = {
  'kpi-pipeline': { label: 'KPI · Pipeline',     group: 'KPIs',    spans: [3, 4, 6] },
  'kpi-active':   { label: 'KPI · Active',       group: 'KPIs',    spans: [3, 4, 6] },
  'kpi-winrate':  { label: 'KPI · Win Rate',     group: 'KPIs',    spans: [3, 4, 6] },
  'kpi-cycle':    { label: 'KPI · Bid Cycle',    group: 'KPIs',    spans: [3, 4, 6] },
  'pipeline':     { label: 'Pipeline Forecast',  group: 'Charts',  spans: [6, 8, 12] },
  'activity':     { label: 'Activity Feed',      group: 'Charts',  spans: [4, 6, 12] },
  'heatmap':      { label: 'Estimating Cadence', group: 'Charts',  spans: [6, 8, 12] },
  'winloss':      { label: 'Win Rate',           group: 'Charts',  spans: [4, 6, 12] },
  'kanban':       { label: 'Active Estimates',   group: 'Boards',  spans: [12] },
  'proposals':    { label: 'Proposals Table',    group: 'Tables',  spans: [12] },
};

function loadLayout() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { layout: DEFAULT_LAYOUT, hidden: [] };
    const parsed = JSON.parse(raw);
    // Validate: keep only known ids, append any new widgets
    const known = parsed.layout?.filter(w => WIDGET_META[w.id]) || [];
    const ids = new Set(known.map(w => w.id));
    DEFAULT_LAYOUT.forEach(w => { if (!ids.has(w.id)) known.push(w); });
    return { layout: known, hidden: parsed.hidden || [] };
  } catch { return { layout: DEFAULT_LAYOUT, hidden: [] }; }
}
function saveLayout(layout, hidden) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ layout, hidden })); } catch {}
}

// ─── Widget frame — drag handle, span chips, hide ───────────────────────────
function WidgetFrame({ widget, editing, onDragStart, onDragEnd, onDrop, isDragging, isOver, onHide, onSpan, children }) {
  const meta = WIDGET_META[widget.id];
  const spans = meta?.spans || [widget.span];

  return (
    <div
      className={`xc-widget span-${widget.span} ${editing ? 'editing' : ''} ${isDragging ? 'dragging' : ''} ${isOver ? 'over' : ''}`}
      onDragOver={(e) => { if (editing) { e.preventDefault(); onDrop(widget.id, 'over'); } }}
      onDragLeave={() => editing && onDrop(widget.id, 'leave')}
      onDrop={(e) => { if (editing) { e.preventDefault(); onDrop(widget.id, 'drop'); } }}>

      {editing && (
        <div className="xc-widget-chrome"
          draggable
          onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(widget.id); }}
          onDragEnd={onDragEnd}>
          <span className="xc-widget-grip" title="Drag to reorder">
            <svg width="10" height="14" viewBox="0 0 10 14"><g fill="currentColor">
              <circle cx="3" cy="2" r="1"/><circle cx="7" cy="2" r="1"/>
              <circle cx="3" cy="7" r="1"/><circle cx="7" cy="7" r="1"/>
              <circle cx="3" cy="12" r="1"/><circle cx="7" cy="12" r="1"/>
            </g></svg>
          </span>
          <span className="xc-widget-label">{meta?.label || widget.id}</span>
          {spans.length > 1 && (
            <span className="xc-widget-spans" onMouseDown={e => e.stopPropagation()}>
              {spans.map(s => (
                <button key={s}
                  className={`xc-widget-span ${s === widget.span ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onSpan(widget.id, s); }}
                  draggable={false}>
                  {s === 12 ? 'Full' : s === 8 ? '⅔' : s === 6 ? '½' : s === 4 ? '⅓' : '¼'}
                </button>
              ))}
            </span>
          )}
          <button className="xc-widget-hide" title="Hide widget"
            onClick={(e) => { e.stopPropagation(); onHide(widget.id); }}
            draggable={false}>×</button>
        </div>
      )}
      <div className="xc-widget-body">{children}</div>
    </div>
  );
}

// ─── Edit-mode toolbar (Done / Reset / Add hidden) ─────────────────────────
function WidgetToolbar({ editing, setEditing, hidden, layout, onShow, onResetLayout }) {
  const [pickerOpen, setPickerOpen] = useStateD(false);
  const wrapRef = useRefD(null);
  useEffectD(() => {
    const click = (e) => { if (!wrapRef.current?.contains(e.target)) setPickerOpen(false); };
    document.addEventListener('mousedown', click);
    return () => document.removeEventListener('mousedown', click);
  }, []);
  const hiddenIds = hidden.filter(id => WIDGET_META[id]);

  return (
    <div className="xc-widget-bar" ref={wrapRef}>
      <div className="xc-widget-bar-l">
        <span className="xc-mono xc-widget-bar-tag">DASHBOARD</span>
        {editing && (
          <span className="xc-widget-bar-hint">
            Drag the <b>⠿</b> handle to reorder · use spans to resize · × to hide
          </span>
        )}
      </div>
      <div className="xc-widget-bar-r">
        {editing && hiddenIds.length > 0 && (
          <div className="xc-widget-bar-pick">
            <button className="xc-chip" onClick={() => setPickerOpen(o => !o)}>
              + Add widget <small className="xc-mono">{hiddenIds.length}</small>
            </button>
            {pickerOpen && (
              <div className="xc-impexp-pop xc-widget-picker">
                <div className="xc-impexp-grp">HIDDEN WIDGETS</div>
                {hiddenIds.map(id => (
                  <button key={id} className="xc-impexp-item"
                    onClick={() => { onShow(id); setPickerOpen(false); }}>
                    <span className="xc-impexp-ext">+</span>
                    <span><b>{WIDGET_META[id].label}</b><small>{WIDGET_META[id].group}</small></span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {editing && (
          <button className="xc-chip" onClick={onResetLayout} title="Restore default layout">Reset</button>
        )}
        <button className={`xc-chip ${editing ? 'xc-chip-warn active' : ''}`}
          onClick={() => setEditing(e => !e)}>
          {editing ? (
            <><svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.5l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg> Done editing</>
          ) : (
            <><svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 9l1 1h2l5-5-2-2-5 5v1zM7 2l3 3" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg> Edit layout</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── The grid ───────────────────────────────────────────────────────────────
function WidgetGrid({ children, editing }) {
  return <div className={`xc-widget-grid ${editing ? 'editing' : ''}`}>{children}</div>;
}

// ─── Hook to manage layout state ────────────────────────────────────────────
function useDashboardLayout() {
  const [state, setState] = useStateD(loadLayout);
  const [editing, setEditing] = useStateD(false);
  const [drag, setDrag] = useStateD(null);
  const [over, setOver] = useStateD(null);

  useEffectD(() => { saveLayout(state.layout, state.hidden); }, [state]);

  const onDragStart = (id) => setDrag(id);
  const onDragEnd = () => { setDrag(null); setOver(null); };
  const onDrop = (targetId, phase) => {
    if (phase === 'over') setOver(targetId);
    else if (phase === 'leave') { /* keep last over until drop */ }
    else if (phase === 'drop') {
      if (drag && drag !== targetId) {
        setState(s => {
          const layout = [...s.layout];
          const from = layout.findIndex(w => w.id === drag);
          const to = layout.findIndex(w => w.id === targetId);
          if (from < 0 || to < 0) return s;
          const [moved] = layout.splice(from, 1);
          layout.splice(to, 0, moved);
          return { ...s, layout };
        });
      }
      setDrag(null); setOver(null);
    }
  };
  const onHide = (id) => setState(s => ({ ...s, hidden: [...new Set([...s.hidden, id])] }));
  const onShow = (id) => setState(s => ({ ...s, hidden: s.hidden.filter(x => x !== id) }));
  const onSpan = (id, span) => setState(s => ({
    ...s,
    layout: s.layout.map(w => w.id === id ? { ...w, span } : w)
  }));
  const onResetLayout = () => { setState({ layout: DEFAULT_LAYOUT, hidden: [] }); };

  const visible = state.layout.filter(w => !state.hidden.includes(w.id));

  return {
    editing, setEditing,
    layout: state.layout, hidden: state.hidden, visible,
    drag, over, onDragStart, onDragEnd, onDrop, onHide, onShow, onSpan, onResetLayout
  };
}

window.XACT_DASH = { WidgetFrame, WidgetGrid, WidgetToolbar, useDashboardLayout, DEFAULT_LAYOUT, WIDGET_META };
