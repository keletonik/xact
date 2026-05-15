import {
  MousePointer2, Hand, Ruler, Square, Hexagon, Type, Cloud, Slash, ArrowRight,
  MapPin, Crosshair, Circle, Triangle, Spline, Undo2, Redo2, Trash2,
} from 'lucide-react';

const TOOLS = [
  { id: null,         label: 'Select',     icon: MousePointer2,  group: 'nav' },
  { id: 'pan',        label: 'Pan',        icon: Hand,           group: 'nav' },
  { id: 'count',      label: 'Count',      icon: MapPin,         group: 'measure' },
  { id: 'length',     label: 'Length',     icon: Ruler,          group: 'measure' },
  { id: 'perimeter',  label: 'Perimeter',  icon: Spline,         group: 'measure' },
  { id: 'area',       label: 'Area',       icon: Hexagon,        group: 'measure' },
  { id: 'diameter',   label: 'Diameter',   icon: Circle,         group: 'measure' },
  { id: 'angle',      label: 'Angle',      icon: Triangle,       group: 'measure' },
  { id: 'rectangle',  label: 'Rectangle',  icon: Square,         group: 'shape' },
  { id: 'cloud',      label: 'Cloud',      icon: Cloud,          group: 'shape' },
  { id: 'line',       label: 'Line',       icon: Slash,          group: 'shape' },
  { id: 'arrow',      label: 'Arrow',      icon: ArrowRight,     group: 'shape' },
  { id: 'text',       label: 'Text',       icon: Type,           group: 'shape' },
];

export default function MarkupToolbar({
  activeTool, onSelectTool,
  calibrationMode, onToggleCalibration,
  snapGridPx, onSnapGridChange,
  orthoLocked, onToggleOrtho,
  canUndo, canRedo, onUndo, onRedo,
  onDeleteSelected, hasSelection,
}) {
  return (
    <div style={wrap}>
      <div style={group}>
        <button type="button" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl/Cmd Z)" aria-label="Undo" style={{ ...btn, opacity: canUndo ? 1 : 0.4 }}>
          <Undo2 size={18} strokeWidth={2.25} />
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl/Cmd Shift Z)" aria-label="Redo" style={{ ...btn, opacity: canRedo ? 1 : 0.4 }}>
          <Redo2 size={18} strokeWidth={2.25} />
        </button>
        <button type="button" onClick={onDeleteSelected} disabled={!hasSelection} title="Delete selected (Del)" aria-label="Delete selected" style={{ ...btn, opacity: hasSelection ? 1 : 0.4, color: hasSelection ? '#b91c1c' : undefined }}>
          <Trash2 size={18} strokeWidth={2.25} />
        </button>
      </div>
      <div style={divider} />
      <div style={group}>
        {TOOLS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id || (t.id === null && !activeTool);
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => onSelectTool(t.id === 'pan' ? null : t.id)}
              title={t.label}
              aria-label={t.label}
              aria-pressed={isActive}
              style={{ ...btn, ...(isActive ? btnActive : null) }}
            >
              <Icon size={18} strokeWidth={2.25} />
            </button>
          );
        })}
      </div>
      <div style={divider} />
      <button
        type="button"
        onClick={onToggleCalibration}
        aria-pressed={calibrationMode}
        title="Calibrate (2-point)"
        style={{ ...btn, ...(calibrationMode ? btnActive : null), display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px' }}
      >
        <Crosshair size={18} strokeWidth={2.25} /> Calibrate
      </button>
      <div style={divider} />
      <label style={lbl}>
        Snap
        <select value={String(snapGridPx)} onChange={(e) => onSnapGridChange(Number(e.target.value))} style={select}>
          <option value="0">off</option>
          <option value="5">5 px</option>
          <option value="10">10 px</option>
          <option value="20">20 px</option>
        </select>
      </label>
      <label style={lbl}>
        <input type="checkbox" checked={orthoLocked} onChange={onToggleOrtho} /> Ortho
      </label>
    </div>
  );
}

const wrap = {
  display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
  padding: '10px 12px', background: 'var(--surface, white)',
  borderBottom: '1px solid var(--border, #e5e7eb)', position: 'sticky', top: 0, zIndex: 5,
};
const group = { display: 'flex', gap: 4 };
const btn = {
  border: '1px solid var(--border, #d1d5db)',
  background: 'white',
  color: '#0f172a',                      // darker default for better contrast
  borderRadius: 6,
  padding: '8px 10px',                   // slightly larger hit target
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const btnActive = { background: '#0f172a', color: 'white', borderColor: '#0f172a' };
const divider = { width: 1, height: 28, background: 'var(--border, #d1d5db)', margin: '0 4px' };
const lbl = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0f172a' };
const select = { padding: '4px 8px', fontSize: 12, borderRadius: 4, border: '1px solid var(--border, #d1d5db)', color: '#0f172a' };
