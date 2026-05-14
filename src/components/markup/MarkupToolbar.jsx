import { MousePointer2, Hand, Ruler, Square, Hexagon, Type, Cloud, Slash, ArrowRight, MapPin, Crosshair } from 'lucide-react';

const TOOLS = [
  { id: null,        label: 'Select',     icon: MousePointer2 },
  { id: 'pan',       label: 'Pan',        icon: Hand },
  { id: 'count',     label: 'Count',      icon: MapPin },
  { id: 'length',    label: 'Length',     icon: Ruler },
  { id: 'area',      label: 'Area',       icon: Hexagon },
  { id: 'rectangle', label: 'Rectangle',  icon: Square },
  { id: 'cloud',     label: 'Cloud',      icon: Cloud },
  { id: 'line',      label: 'Line',       icon: Slash },
  { id: 'arrow',     label: 'Arrow',      icon: ArrowRight },
  { id: 'text',      label: 'Text',       icon: Type },
];

export default function MarkupToolbar({
  activeTool, onSelectTool,
  calibrationMode, onToggleCalibration,
  snapGridPx, onSnapGridChange,
  orthoLocked, onToggleOrtho,
}) {
  return (
    <div style={wrap}>
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
              <Icon size={16} />
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
        style={{ ...btn, ...(calibrationMode ? btnActive : null), display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <Crosshair size={16} /> Calibrate
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
  padding: '8px 12px', background: 'var(--surface, white)',
  borderBottom: '1px solid var(--border, #e5e7eb)', position: 'sticky', top: 0, zIndex: 5,
};
const group = { display: 'flex', gap: 4 };
const btn = {
  border: '1px solid var(--border, #e5e7eb)', background: 'white', borderRadius: 6,
  padding: '6px 8px', cursor: 'pointer',
};
const btnActive = { background: '#0f172a', color: 'white', borderColor: '#0f172a' };
const divider = { width: 1, height: 24, background: 'var(--border, #e5e7eb)', margin: '0 4px' };
const lbl = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 };
const select = { padding: '2px 6px', fontSize: 12, borderRadius: 4, border: '1px solid var(--border, #e5e7eb)' };
