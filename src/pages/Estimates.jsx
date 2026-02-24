import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator, Plus, Search, FileText, DollarSign, Layers, Clock,
  ArrowUpDown, MoreVertical, Copy, Trash2, CheckCircle, Send,
  ChevronRight, Package, AlertTriangle, TrendingUp,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import SearchInput from '../components/common/SearchInput';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Tabs from '../components/common/Tabs';
import useEstimateStore from '../stores/useEstimateStore';
import useProjectStore from '../stores/useProjectStore';
import usePriceBookStore from '../stores/usePriceBookStore';
import { expandAssembly } from '../engine/assemblyExpander';
import { ESTIMATE_STATUSES, ESTIMATE_STATUS_LABELS, ITEM_CATEGORIES, ITEM_CATEGORY_LABELS } from '../utils/constants';
import { formatCurrency, formatDate, formatRelativeTime, formatPercent, formatNumber } from '../utils/formatters';

export default function Estimates() {
  const { estimates, createEstimate, selectEstimate, addLine, addLines, updateLine, deleteLine, updateMarkups, createVersion, updateStatus } = useEstimateStore();
  const projects = useProjectStore((s) => s.projects);
  const assemblies = usePriceBookStore((s) => s.assemblies);
  const items = usePriceBookStore((s) => s.items);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [showAddLine, setShowAddLine] = useState(false);
  const [showAddAssembly, setShowAddAssembly] = useState(false);
  const [showMarkups, setShowMarkups] = useState(false);
  const [createForm, setCreateForm] = useState({ projectId: '', name: '' });
  const [lineForm, setLineForm] = useState({ description: '', category: 'material', unit: 'ea', quantity: 0, unitRate: 0, itemId: '' });
  const [assemblyForm, setAssemblyForm] = useState({ assemblyId: '', quantity: 1 });
  const [markupForm, setMarkupForm] = useState({ overhead: 10, profit: 8, contingency: 5, risk: 2 });

  const filtered = useMemo(() => {
    let result = estimates;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) =>
        e.name.toLowerCase().includes(q) || e.ref.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((e) => e.status === statusFilter);
    }
    return result;
  }, [estimates, search, statusFilter]);

  function handleCreateEstimate(e) {
    e.preventDefault();
    const est = createEstimate({
      projectId: createForm.projectId || projects[0]?.id,
      name: createForm.name || 'New Estimate',
    });
    setCreateForm({ projectId: '', name: '' });
    setShowCreate(false);
    setSelectedEstimate(est);
  }

  function handleAddLine(e) {
    e.preventDefault();
    if (!selectedEstimate) return;
    addLine(selectedEstimate.id, {
      ...lineForm,
      quantity: parseFloat(lineForm.quantity) || 0,
      unitRate: parseFloat(lineForm.unitRate) || 0,
    });
    setLineForm({ description: '', category: 'material', unit: 'ea', quantity: 0, unitRate: 0, itemId: '' });
    setShowAddLine(false);
    setSelectedEstimate(useEstimateStore.getState().getEstimate(selectedEstimate.id));
  }

  function handleAddAssembly(e) {
    e.preventDefault();
    if (!selectedEstimate) return;
    const assembly = assemblies.find((a) => a.id === assemblyForm.assemblyId);
    if (!assembly) return;
    const expanded = expandAssembly(assembly, parseFloat(assemblyForm.quantity) || 1);
    addLines(selectedEstimate.id, expanded.map((l) => ({
      ...l, description: l.itemName,
    })));
    setAssemblyForm({ assemblyId: '', quantity: 1 });
    setShowAddAssembly(false);
    setSelectedEstimate(useEstimateStore.getState().getEstimate(selectedEstimate.id));
  }

  function handleSaveMarkups() {
    if (!selectedEstimate) return;
    updateMarkups(selectedEstimate.id, {
      overhead: markupForm.overhead / 100,
      profit: markupForm.profit / 100,
      contingency: markupForm.contingency / 100,
      risk: markupForm.risk / 100,
    });
    setShowMarkups(false);
    setSelectedEstimate(useEstimateStore.getState().getEstimate(selectedEstimate.id));
  }

  function handleSnapshot() {
    if (!selectedEstimate) return;
    createVersion(selectedEstimate.id, 'Manual snapshot');
    setSelectedEstimate(useEstimateStore.getState().getEstimate(selectedEstimate.id));
  }

  function selectItem(item) {
    setLineForm((f) => ({
      ...f,
      description: item.name,
      category: item.category,
      unit: item.unit,
      unitRate: item.basePrice,
      itemId: item.id,
    }));
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      {!selectedEstimate ? (
        <>
          {/* List View */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Estimates</h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>Build and manage cost estimates</p>
            </div>
            <Button onClick={() => setShowCreate(true)} icon={Plus}>New Estimate</Button>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <SearchInput value={search} onChange={setSearch} placeholder="Search estimates..." />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Calculator}
              title="No estimates yet"
              description="Create your first estimate to start building pricing"
              primaryAction={{ label: 'New Estimate', onClick: () => setShowCreate(true) }}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
              {filtered.map((est) => {
                const project = projects.find((p) => p.id === est.projectId);
                return (
                  <motion.div key={est.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card hover onClick={() => { setSelectedEstimate(est); setMarkupForm({ overhead: (est.markups.overhead || 0) * 100, profit: (est.markups.profit || 0) * 100, contingency: (est.markups.contingency || 0) * 100, risk: (est.markups.risk || 0) * 100 }); }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--color-text-tertiary)' }}>{est.ref}</div>
                          <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{est.name}</div>
                        </div>
                        <StatusBadge status={est.status} />
                      </div>
                      {project && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>{project.name}</div>}
                      <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                        <span>{est.lines.length} lines</span>
                        <span>{est.versions.length} versions</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                        <div>
                          <div style={{ fontSize: '0.625rem', color: 'var(--color-text-tertiary)' }}>Total (inc. GST)</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-fire-500)' }}>{formatCurrency(est.totals.totalIncTax)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.625rem', color: 'var(--color-text-tertiary)' }}>Margin</div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-success-600)' }}>{formatPercent(est.totals.effectiveMargin)}</div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Estimate Builder */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <button onClick={() => setSelectedEstimate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', fontSize: '0.8125rem' }}>Estimates</button>
            <ChevronRight size={14} style={{ color: 'var(--color-text-tertiary)' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{selectedEstimate.ref} - {selectedEstimate.name}</span>
            <div style={{ flex: 1 }} />
            <StatusBadge status={selectedEstimate.status} />
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            {/* Main Grid */}
            <div style={{ flex: 1 }}>
              {/* Action Toolbar */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <Button size="sm" icon={Plus} onClick={() => setShowAddLine(true)}>Add Line</Button>
                <Button size="sm" variant="secondary" icon={Package} onClick={() => setShowAddAssembly(true)}>Add Assembly</Button>
                <Button size="sm" variant="secondary" icon={Copy} onClick={handleSnapshot}>Save Version</Button>
                <div style={{ flex: 1 }} />
                <Button size="sm" variant="secondary" icon={DollarSign} onClick={() => setShowMarkups(true)}>Markups</Button>
              </div>

              {/* Estimate Lines Grid */}
              <Card padding="0">
                {selectedEstimate.lines.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center' }}>
                    <Calculator size={40} style={{ color: 'var(--color-text-tertiary)', marginBottom: 8 }} />
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>No line items yet</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 12 }}>Add items or expand assemblies to build your estimate</div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <Button size="sm" onClick={() => setShowAddLine(true)} icon={Plus}>Add Line</Button>
                      <Button size="sm" variant="secondary" onClick={() => setShowAddAssembly(true)} icon={Package}>Add Assembly</Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                          {['Description', 'Category', 'Unit', 'Qty', 'Rate', 'Total', ''].map((h) => (
                            <th key={h} style={{
                              padding: '10px 12px', textAlign: h === 'Qty' || h === 'Rate' || h === 'Total' ? 'right' : 'left',
                              fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-tertiary)',
                              textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEstimate.lines.map((line) => (
                          <tr key={line.id} style={{ borderBottom: '1px solid var(--color-border)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--color-text-primary)', maxWidth: 250 }}>
                              {line.description}
                              {line.assemblyName && (
                                <div style={{ fontSize: '0.625rem', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                                  from: {line.assemblyName}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <span style={{
                                fontSize: '0.625rem', padding: '2px 6px', borderRadius: 'var(--radius-full)',
                                background: line.category === 'material' ? 'var(--color-info-50)' : line.category === 'labour' ? 'var(--color-success-50)' : 'var(--color-warning-50)',
                                color: line.category === 'material' ? 'var(--color-info-700)' : line.category === 'labour' ? 'var(--color-success-700)' : 'var(--color-warning-700)',
                                fontWeight: 600,
                              }}>
                                {ITEM_CATEGORY_LABELS[line.category] || line.category}
                              </span>
                            </td>
                            <td style={{ padding: '8px 12px', color: 'var(--color-text-secondary)' }}>{line.unit}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {formatNumber(line.quantity, line.quantity % 1 === 0 ? 0 : 2)}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                              {formatCurrency(line.unitRate)}
                            </td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {formatCurrency(line.total)}
                            </td>
                            <td style={{ padding: '8px 12px', width: 32 }}>
                              <button onClick={() => { deleteLine(selectedEstimate.id, line.id); setSelectedEstimate(useEstimateStore.getState().getEstimate(selectedEstimate.id)); }}
                                style={{ ...iconBtnStyle, width: 24, height: 24 }}>
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>

            {/* Totals Sidebar */}
            <div style={{ width: 280, flexShrink: 0 }}>
              <Card>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>Estimate Totals</div>

                {/* Cost Breakdown */}
                {Object.entries(selectedEstimate.totals.breakdown).map(([key, value]) => (
                  value > 0 && (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{key}</span>
                      <span style={{ fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>{formatCurrency(value)}</span>
                    </div>
                  )
                ))}

                <div style={{ borderTop: '1px solid var(--color-border)', margin: '8px 0', padding: '8px 0 4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600 }}>
                    <span style={{ color: 'var(--color-text-primary)' }}>Direct Cost</span>
                    <span style={{ fontFamily: 'monospace' }}>{formatCurrency(selectedEstimate.totals.directCost)}</span>
                  </div>
                </div>

                {/* Markups */}
                <div style={{ borderTop: '1px solid var(--color-border)', margin: '8px 0', padding: '8px 0' }}>
                  {Object.entries(selectedEstimate.totals.markups).map(([key, { rate, amount }]) => (
                    amount > 0 && (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{key} ({formatPercent(rate)})</span>
                        <span style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>{formatCurrency(amount)}</span>
                      </div>
                    )
                  ))}
                </div>

                <div style={{ borderTop: '2px solid var(--color-border)', padding: '10px 0 4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal (ex. GST)</span>
                    <span style={{ fontFamily: 'monospace' }}>{formatCurrency(selectedEstimate.totals.subtotalExTax)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 8 }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>GST ({formatPercent(selectedEstimate.totals.taxRate)})</span>
                    <span style={{ fontFamily: 'monospace' }}>{formatCurrency(selectedEstimate.totals.taxAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700 }}>
                    <span style={{ color: 'var(--color-text-primary)' }}>Total (inc. GST)</span>
                    <span style={{ color: 'var(--color-fire-500)', fontFamily: 'monospace' }}>{formatCurrency(selectedEstimate.totals.totalIncTax)}</span>
                  </div>
                </div>

                <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Effective Margin</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-success-600)' }}>{formatPercent(selectedEstimate.totals.effectiveMargin)}</span>
                  </div>
                </div>

                {/* Versions */}
                {selectedEstimate.versions.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
                      Versions ({selectedEstimate.versions.length})
                    </div>
                    {selectedEstimate.versions.map((v) => (
                      <div key={v.id} style={{ fontSize: '0.75rem', padding: '6px 0', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>v{v.versionNumber}</span>
                        <span style={{ fontFamily: 'monospace', color: 'var(--color-text-tertiary)' }}>{formatCurrency(v.metadata.totalIncTax)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Create Estimate Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Estimate" size="sm">
        <form onSubmit={handleCreateEstimate}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Estimate Name</label>
              <input style={inputStyle} value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Base Estimate Rev A" />
            </div>
            <div>
              <label style={labelStyle}>Project</label>
              <select style={inputStyle} value={createForm.projectId} onChange={(e) => setCreateForm((f) => ({ ...f, projectId: e.target.value }))}>
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.ref} - {p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setShowCreate(false)} type="button">Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>

      {/* Add Line Modal */}
      <Modal isOpen={showAddLine} onClose={() => setShowAddLine(false)} title="Add Line Item" size="md">
        <form onSubmit={handleAddLine}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Quick Select from Price Book</label>
            <select style={inputStyle} value="" onChange={(e) => { const item = items.find((i) => i.id === e.target.value); if (item) selectItem(item); }}>
              <option value="">-- Select item --</option>
              {Object.entries(ITEM_CATEGORY_LABELS).map(([cat, catLabel]) => (
                <optgroup key={cat} label={catLabel}>
                  {items.filter((i) => i.category === cat).slice(0, 20).map((i) => (
                    <option key={i.id} value={i.id}>{i.name} — ${i.basePrice}/{i.unit}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description *</label>
              <input style={inputStyle} value={lineForm.description} onChange={(e) => setLineForm((f) => ({ ...f, description: e.target.value }))} required />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={lineForm.category} onChange={(e) => setLineForm((f) => ({ ...f, category: e.target.value }))}>
                {Object.entries(ITEM_CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Unit</label>
              <input style={inputStyle} value={lineForm.unit} onChange={(e) => setLineForm((f) => ({ ...f, unit: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Quantity</label>
              <input style={inputStyle} type="number" step="0.01" value={lineForm.quantity} onChange={(e) => setLineForm((f) => ({ ...f, quantity: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Unit Rate ($)</label>
              <input style={inputStyle} type="number" step="0.01" value={lineForm.unitRate} onChange={(e) => setLineForm((f) => ({ ...f, unitRate: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setShowAddLine(false)} type="button">Cancel</Button>
            <Button type="submit">Add Line</Button>
          </div>
        </form>
      </Modal>

      {/* Add Assembly Modal */}
      <Modal isOpen={showAddAssembly} onClose={() => setShowAddAssembly(false)} title="Add Assembly" size="md">
        <form onSubmit={handleAddAssembly}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Assembly</label>
              <select style={inputStyle} value={assemblyForm.assemblyId} onChange={(e) => setAssemblyForm((f) => ({ ...f, assemblyId: e.target.value }))}>
                <option value="">Select assembly...</option>
                {assemblies.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} — {a.description}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Driver Quantity</label>
              <input style={inputStyle} type="number" step="0.01" value={assemblyForm.quantity} onChange={(e) => setAssemblyForm((f) => ({ ...f, quantity: e.target.value }))} />
              {assemblyForm.assemblyId && (
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                  Unit: {assemblies.find((a) => a.id === assemblyForm.assemblyId)?.driverUnit || 'ea'}
                  {' | Components: '}
                  {assemblies.find((a) => a.id === assemblyForm.assemblyId)?.components.length || 0}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setShowAddAssembly(false)} type="button">Cancel</Button>
            <Button type="submit">Expand & Add</Button>
          </div>
        </form>
      </Modal>

      {/* Markups Modal */}
      <Modal isOpen={showMarkups} onClose={() => setShowMarkups(false)} title="Edit Markups" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { key: 'overhead', label: 'Overhead (%)' },
            { key: 'profit', label: 'Profit (%)' },
            { key: 'contingency', label: 'Contingency (%)' },
            { key: 'risk', label: 'Risk (%)' },
          ].map((m) => (
            <div key={m.key}>
              <label style={labelStyle}>{m.label}</label>
              <input style={inputStyle} type="number" step="0.5" min="0" max="100" value={markupForm[m.key]} onChange={(e) => setMarkupForm((f) => ({ ...f, [m.key]: parseFloat(e.target.value) || 0 }))} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Button variant="secondary" onClick={() => setShowMarkups(false)}>Cancel</Button>
          <Button onClick={handleSaveMarkups}>Apply Markups</Button>
        </div>
      </Modal>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 };
const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)', background: 'var(--color-bg-input)',
  color: 'var(--color-text-primary)', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box',
};
const iconBtnStyle = {
  width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
  background: 'transparent', color: 'var(--color-text-tertiary)',
};
