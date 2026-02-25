import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Ruler, MousePointer, PenLine, Square, Circle, Minus,
  Plus, Eye, EyeOff, Layers, ZoomIn, ZoomOut, RotateCw,
  Upload, Settings, Trash2, Tag, Hash, Move,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import Tabs from '../components/common/Tabs';
import useTakeoffStore from '../stores/useTakeoffStore';
import useProjectStore from '../stores/useProjectStore';
import { TAKEOFF_OBJECT_TYPES, UNITS, FIRE_SCOPE_LABELS } from '../utils/constants';
import { formatNumber } from '../utils/formatters';

const TOOLS = [
  { id: 'select', label: 'Select', icon: MousePointer, shortcut: 'V' },
  { id: 'count', label: 'Count', icon: Hash, shortcut: 'C' },
  { id: 'linear', label: 'Linear', icon: Minus, shortcut: 'L' },
  { id: 'area', label: 'Area', icon: Square, shortcut: 'A' },
  { id: 'pan', label: 'Pan', icon: Move, shortcut: 'H' },
];

export default function Takeoff() {
  const { takeoffPackages, createTakeoffPackage, addLayer, addObject, toggleLayerVisibility, deleteObject, getTakeoffSummary } = useTakeoffStore();
  const projects = useProjectStore((s) => s.projects);
  const [activeTool, setActiveTool] = useState('select');
  const [selectedPackage, setSelectedPackage] = useState(takeoffPackages[0] || null);
  const [showAddLayer, setShowAddLayer] = useState(false);
  const [showAddObject, setShowAddObject] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [layerForm, setLayerForm] = useState({ name: '', color: '#3B82F6', trade: '', system: '', floor: '' });
  const [objectForm, setObjectForm] = useState({
    type: TAKEOFF_OBJECT_TYPES.COUNT, label: '', quantity: 1, unit: 'ea',
    zone: '', floor: '', system: '', layerId: '',
  });
  const [zoom, setZoom] = useState(100);

  const summary = selectedPackage ? getTakeoffSummary(selectedPackage.id) : { counts: 0, linear: 0, area: 0, objectCount: 0 };

  const currentLayers = selectedPackage?.layers || [];
  const currentObjects = selectedPackage?.objects || [];

  function handleAddLayer(e) {
    e.preventDefault();
    if (!selectedPackage) return;
    addLayer(selectedPackage.id, layerForm);
    setLayerForm({ name: '', color: '#3B82F6', trade: '', system: '', floor: '' });
    setShowAddLayer(false);
  }

  function handleAddObject(e) {
    e.preventDefault();
    if (!selectedPackage) return;
    addObject(selectedPackage.id, {
      ...objectForm,
      quantity: parseFloat(objectForm.quantity) || 0,
      layerId: objectForm.layerId || currentLayers[0]?.id,
    });
    setObjectForm({ type: TAKEOFF_OBJECT_TYPES.COUNT, label: '', quantity: 1, unit: 'ea', zone: '', floor: '', system: '', layerId: '' });
    setShowAddObject(false);
  }

  function handleCreatePackage() {
    const pkg = createTakeoffPackage({
      projectId: projects[0]?.id || null,
      name: `Takeoff ${takeoffPackages.length + 1}`,
    });
    setSelectedPackage(pkg);
  }

  // Keyboard shortcuts
  useState(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const tool = TOOLS.find((t) => t.shortcut.toLowerCase() === e.key.toLowerCase());
      if (tool) setActiveTool(tool.id);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-height))', overflow: 'hidden' }}>
      {/* Top Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
        borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-card)', flexShrink: 0,
      }}>
        {/* Package selector */}
        <select
          style={{
            padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
            background: 'var(--color-bg-input)', color: 'var(--color-text-primary)', fontSize: '0.8125rem',
          }}
          value={selectedPackage?.id || ''}
          onChange={(e) => setSelectedPackage(takeoffPackages.find((p) => p.id === e.target.value) || null)}
        >
          {takeoffPackages.length === 0 && <option value="">No packages</option>}
          {takeoffPackages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
          ))}
        </select>
        <Button size="sm" variant="secondary" onClick={handleCreatePackage} icon={Plus}>New Package</Button>

        <div style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 4px' }} />

        {/* Drawing Tools */}
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              title={`${tool.label} (${tool.shortcut})`}
              style={{
                width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                background: isActive ? 'var(--color-fire-500)' : 'transparent',
                color: isActive ? '#fff' : 'var(--color-text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Icon size={16} />
            </button>
          );
        })}

        <div style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 4px' }} />

        {/* Zoom */}
        <button onClick={() => setZoom((z) => Math.max(25, z - 25))} style={iconBtnStyle}><ZoomOut size={16} /></button>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', minWidth: 40, textAlign: 'center' }}>{zoom}%</span>
        <button onClick={() => setZoom((z) => Math.min(400, z + 25))} style={iconBtnStyle}><ZoomIn size={16} /></button>
        <button onClick={() => setZoom(100)} style={iconBtnStyle}><RotateCw size={14} /></button>

        <div style={{ flex: 1 }} />

        <Button size="sm" variant="secondary" icon={Upload} onClick={() => setShowUpload(true)}>Upload Plan</Button>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Canvas Area */}
        <div style={{ flex: 1, background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {!selectedPackage ? (
            <EmptyState
              icon={Ruler}
              title="No takeoff package"
              description="Create a takeoff package and upload plans to start measuring"
              primaryAction={{ label: 'New Package', onClick: handleCreatePackage }}
            />
          ) : (
            <div style={{
              width: '80%', height: '80%', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12,
            }}>
              <Upload size={48} style={{ color: 'var(--color-text-tertiary)' }} />
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Drop PDF plans here or click Upload Plan
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                Calibrate scale before taking measurements
              </div>
              {selectedPackage.calibrated && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-success-500)', fontWeight: 600 }}>
                  Scale calibrated: {selectedPackage.scale}
                </div>
              )}
            </div>
          )}

          {/* Measurement objects overlay list */}
          {currentObjects.length > 0 && (
            <div style={{
              position: 'absolute', bottom: 16, left: 16, right: 16,
              background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)', padding: 12,
              maxHeight: 200, overflowY: 'auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Measurements ({currentObjects.length})
                </span>
                <Button size="sm" variant="ghost" onClick={() => setShowAddObject(true)} icon={Plus}>Add</Button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Label</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Qty</th>
                    <th style={thStyle}>Unit</th>
                    <th style={thStyle}>Zone</th>
                    <th style={thStyle}>Floor</th>
                    <th style={{ ...thStyle, width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {currentObjects.map((obj) => (
                    <tr key={obj.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={tdStyle}>
                        <span style={{
                          fontSize: '0.625rem', padding: '2px 6px', borderRadius: 'var(--radius-full)',
                          background: obj.type === 'count' ? 'var(--color-info-50)' : obj.type === 'linear' ? 'var(--color-success-50)' : 'var(--color-warning-50)',
                          color: obj.type === 'count' ? 'var(--color-info-700)' : obj.type === 'linear' ? 'var(--color-success-700)' : 'var(--color-warning-700)',
                          fontWeight: 600, textTransform: 'uppercase',
                        }}>
                          {obj.type}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--color-text-primary)' }}>{obj.label || '-'}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{formatNumber(obj.quantity, obj.type === 'count' ? 0 : 2)}</td>
                      <td style={tdStyle}>{obj.unit}</td>
                      <td style={tdStyle}>{obj.zone || '-'}</td>
                      <td style={tdStyle}>{obj.floor || '-'}</td>
                      <td style={tdStyle}>
                        <button onClick={() => deleteObject(selectedPackage.id, obj.id)} style={{ ...iconBtnStyle, width: 24, height: 24 }}>
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Panel - Layers & Properties */}
        <div style={{
          width: 280, borderLeft: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
          display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
        }}>
          {/* Summary */}
          <div style={{ padding: 12, borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>Takeoff Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Counts', value: summary.counts, color: 'var(--color-info-500)' },
                { label: 'Linear (m)', value: formatNumber(summary.linear, 1), color: 'var(--color-success-500)' },
                { label: 'Area (m²)', value: formatNumber(summary.area, 1), color: 'var(--color-warning-500)' },
                { label: 'Objects', value: summary.objectCount, color: 'var(--color-text-secondary)' },
              ].map((s) => (
                <div key={s.label} style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--color-text-tertiary)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Layers */}
          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                <Layers size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Layers ({currentLayers.length})
              </span>
              <button onClick={() => setShowAddLayer(true)} style={{ ...iconBtnStyle, width: 24, height: 24 }}>
                <Plus size={12} />
              </button>
            </div>

            {currentLayers.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', padding: '12px 0', textAlign: 'center' }}>
                No layers yet. Add a layer to organise your takeoff.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {currentLayers.map((layer) => {
                  const layerObjects = currentObjects.filter((o) => o.layerId === layer.id);
                  return (
                    <div key={layer.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-secondary)',
                      fontSize: '0.75rem',
                    }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: layer.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, color: 'var(--color-text-primary)', fontWeight: 500 }}>{layer.name}</span>
                      <span style={{ fontSize: '0.625rem', color: 'var(--color-text-tertiary)' }}>{layerObjects.length}</span>
                      <button
                        onClick={() => selectedPackage && toggleLayerVisibility(selectedPackage.id, layer.id)}
                        style={{ ...iconBtnStyle, width: 22, height: 22 }}
                      >
                        {layer.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Add Objects */}
          <div style={{ padding: 12, borderTop: '1px solid var(--color-border)' }}>
            <Button size="sm" onClick={() => setShowAddObject(true)} icon={Plus} style={{ width: '100%' }}>Add Object</Button>
          </div>
        </div>
      </div>

      {/* Totals Footer */}
      <div style={{
        display: 'flex', gap: 24, padding: '8px 16px', borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-card)', fontSize: '0.75rem', flexShrink: 0,
      }}>
        <span><strong style={{ color: 'var(--color-info-500)' }}>{summary.counts}</strong> counts</span>
        <span><strong style={{ color: 'var(--color-success-500)' }}>{formatNumber(summary.linear, 1)}</strong> m linear</span>
        <span><strong style={{ color: 'var(--color-warning-500)' }}>{formatNumber(summary.area, 1)}</strong> m² area</span>
        <span style={{ color: 'var(--color-text-tertiary)' }}>{summary.objectCount} objects total</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: 'var(--color-text-tertiary)' }}>Tool: <strong>{TOOLS.find((t) => t.id === activeTool)?.label}</strong></span>
      </div>

      {/* Add Layer Modal */}
      <Modal isOpen={showAddLayer} onClose={() => setShowAddLayer(false)} title="Add Layer" size="sm">
        <form onSubmit={handleAddLayer}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Layer Name *</label>
              <input style={inputStyleLocal} value={layerForm.name} onChange={(e) => setLayerForm((f) => ({ ...f, name: e.target.value }))} required placeholder="e.g. Level 1 - Sprinkler" />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Color</label>
                <input type="color" value={layerForm.color} onChange={(e) => setLayerForm((f) => ({ ...f, color: e.target.value }))} style={{ width: '100%', height: 36, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} />
              </div>
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Trade / System</label>
                <input style={inputStyleLocal} value={layerForm.system} onChange={(e) => setLayerForm((f) => ({ ...f, system: e.target.value }))} placeholder="e.g. Sprinkler" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Floor</label>
              <input style={inputStyleLocal} value={layerForm.floor} onChange={(e) => setLayerForm((f) => ({ ...f, floor: e.target.value }))} placeholder="e.g. Level 1" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setShowAddLayer(false)} type="button">Cancel</Button>
            <Button type="submit">Add Layer</Button>
          </div>
        </form>
      </Modal>

      {/* Add Object Modal */}
      <Modal isOpen={showAddObject} onClose={() => setShowAddObject(false)} title="Add Takeoff Object" size="md">
        <form onSubmit={handleAddObject}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select style={inputStyleLocal} value={objectForm.type} onChange={(e) => setObjectForm((f) => ({ ...f, type: e.target.value, unit: e.target.value === 'count' ? 'ea' : e.target.value === 'linear' ? 'm' : 'm²' }))}>
                <option value="count">Count</option>
                <option value="linear">Linear</option>
                <option value="area">Area</option>
                <option value="volume">Volume</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Layer</label>
              <select style={inputStyleLocal} value={objectForm.layerId} onChange={(e) => setObjectForm((f) => ({ ...f, layerId: e.target.value }))}>
                {currentLayers.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Label</label>
              <input style={inputStyleLocal} value={objectForm.label} onChange={(e) => setObjectForm((f) => ({ ...f, label: e.target.value }))} placeholder="e.g. Pendant Head 68°C" />
            </div>
            <div>
              <label style={labelStyle}>Quantity</label>
              <input style={inputStyleLocal} type="number" step="0.01" value={objectForm.quantity} onChange={(e) => setObjectForm((f) => ({ ...f, quantity: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Unit</label>
              <select style={inputStyleLocal} value={objectForm.unit} onChange={(e) => setObjectForm((f) => ({ ...f, unit: e.target.value }))}>
                {Object.entries(UNITS).map(([k, v]) => (
                  <option key={k} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Zone</label>
              <input style={inputStyleLocal} value={objectForm.zone} onChange={(e) => setObjectForm((f) => ({ ...f, zone: e.target.value }))} placeholder="Zone A" />
            </div>
            <div>
              <label style={labelStyle}>Floor</label>
              <input style={inputStyleLocal} value={objectForm.floor} onChange={(e) => setObjectForm((f) => ({ ...f, floor: e.target.value }))} placeholder="Level 1" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>System</label>
              <input style={inputStyleLocal} value={objectForm.system} onChange={(e) => setObjectForm((f) => ({ ...f, system: e.target.value }))} placeholder="e.g. Sprinkler, Alarm" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setShowAddObject(false)} type="button">Cancel</Button>
            <Button type="submit">Add Object</Button>
          </div>
        </form>
      </Modal>

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Plans" size="md">
        <div style={{
          border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)',
          padding: '48px 24px', textAlign: 'center',
        }}>
          <Upload size={40} style={{ color: 'var(--color-text-tertiary)', marginBottom: 12 }} />
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
            Drag and drop PDF plan files here
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
            Supports PDF, DWG (converted), and image files
          </div>
          <Button variant="secondary">Browse Files</Button>
        </div>
      </Modal>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 };
const inputStyleLocal = {
  width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)', background: 'var(--color-bg-input)',
  color: 'var(--color-text-primary)', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box',
};
const iconBtnStyle = {
  width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
  background: 'transparent', color: 'var(--color-text-secondary)',
};
const thStyle = { padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.625rem' };
const tdStyle = { padding: '6px 8px', color: 'var(--color-text-secondary)' };
