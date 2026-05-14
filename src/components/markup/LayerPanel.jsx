import { Eye, EyeOff, Lock, LockOpen, Plus, Trash2 } from 'lucide-react';

export default function LayerPanel({ page, activeLayerId, onSetActiveLayer, onAddLayer, onUpdateLayer, onRemoveLayer }) {
  return (
    <div style={wrap}>
      <div style={head}>
        <strong>Layers</strong>
        <button type="button" onClick={onAddLayer} title="Add layer" style={iconBtn} aria-label="Add layer"><Plus size={14} /></button>
      </div>
      <ul style={list}>
        {page.layers.map((layer) => {
          const isActive = layer.id === activeLayerId;
          return (
            <li key={layer.id} style={{ ...row, ...(isActive ? rowActive : null) }} onClick={() => onSetActiveLayer(layer.id)}>
              <span style={{ ...swatch, background: layer.color }} aria-hidden />
              <input
                value={layer.name}
                onChange={(e) => onUpdateLayer(layer.id, { name: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                style={nameInput}
                aria-label={`Layer name (${layer.name})`}
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onUpdateLayer(layer.id, { visible: !layer.visible }); }}
                title={layer.visible ? 'Hide' : 'Show'}
                style={iconBtn}
                aria-label={layer.visible ? 'Hide layer' : 'Show layer'}
              >
                {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onUpdateLayer(layer.id, { locked: !layer.locked }); }}
                title={layer.locked ? 'Unlock' : 'Lock'}
                style={iconBtn}
                aria-label={layer.locked ? 'Unlock layer' : 'Lock layer'}
              >
                {layer.locked ? <Lock size={14} /> : <LockOpen size={14} />}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemoveLayer(layer.id); }}
                title="Delete layer"
                style={iconBtn}
                aria-label="Delete layer"
                disabled={page.layers.length === 1}
              >
                <Trash2 size={14} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const wrap = { padding: 8, background: 'white', border: '1px solid var(--border, #e5e7eb)', borderRadius: 6, minWidth: 220 };
const head = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 };
const list = { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 };
const row = { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 4, cursor: 'pointer' };
const rowActive = { background: '#eff6ff', border: '1px solid #93c5fd' };
const swatch = { width: 12, height: 12, borderRadius: 3, flexShrink: 0 };
const nameInput = { flex: 1, border: 'none', background: 'transparent', fontSize: 13, padding: 0 };
const iconBtn = { background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' };
