import { useState, useMemo } from 'react';
import {
  BookOpen, Plus, Search, Edit3, Trash2, Package, DollarSign,
  Filter, Download, Upload, Tag, ArrowUpDown, AlertCircle, Check, X,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
import Tabs from '../components/common/Tabs';
import usePriceBookStore from '../stores/usePriceBookStore';
import { ITEM_CATEGORIES, ITEM_CATEGORY_LABELS, UNITS, FIRE_SCOPE_LABELS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import { useToast } from '../components/common/Toast';

export default function PriceBook() {
  const { items, assemblies, pendingUpdates, addItem, updateItem, deleteItem, approvePendingUpdate, rejectPendingUpdate } = usePriceBookStore();
  const [activeTab, setActiveTab] = useState('items');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(null);
  const [selectedAssembly, setSelectedAssembly] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'material', unit: 'ea', basePrice: '', brand: '', model: '' });
  const [editForm, setEditForm] = useState({});
  const [editReason, setEditReason] = useState('');

  const toast = useToast();

  const filteredItems = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) =>
        i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) ||
        (i.brand && i.brand.toLowerCase().includes(q)) || (i.model && i.model.toLowerCase().includes(q))
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter((i) => i.category === categoryFilter);
    }
    return result;
  }, [items, search, categoryFilter]);

  const filteredAssemblies = useMemo(() => {
    if (!search) return assemblies;
    const q = search.toLowerCase();
    return assemblies.filter((a) => a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
  }, [assemblies, search]);

  const pending = pendingUpdates.filter((u) => u.status === 'pending');

  const tabs = [
    { id: 'items', label: 'Items', count: items.length },
    { id: 'assemblies', label: 'Assemblies', count: assemblies.length },
    { id: 'pending', label: 'Pending Updates', count: pending.length },
  ];

  function handleAddItem(e) {
    e.preventDefault();
    addItem({ ...form, basePrice: parseFloat(form.basePrice) || 0 });
    setForm({ name: '', category: 'material', unit: 'ea', basePrice: '', brand: '', model: '' });
    setShowAddItem(false);
    toast.success('Item added to price book');
  }

  function handleSaveEdit() {
    if (!showEditItem) return;
    updateItem(showEditItem.id, {
      name: editForm.name,
      basePrice: parseFloat(editForm.basePrice) || 0,
      brand: editForm.brand,
      model: editForm.model,
    }, editReason);
    setShowEditItem(null);
    setEditReason('');
    toast.success('Item updated');
  }

  function openEdit(item) {
    setEditForm({ name: item.name, basePrice: item.basePrice, brand: item.brand || '', model: item.model || '' });
    setShowEditItem(item);
  }

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Price Book</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>
            Manage items, assemblies, and pricing ({items.length} items, {assemblies.length} assemblies)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" icon={Download}>Export</Button>
          <Button onClick={() => setShowAddItem(true)} icon={Plus}>Add Item</Button>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
        <SearchInput value={search} onChange={setSearch} placeholder={activeTab === 'items' ? 'Search items...' : 'Search assemblies...'} />
        {activeTab === 'items' && (
          <select
            style={{
              padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
              background: 'var(--color-bg-input)', color: 'var(--color-text-primary)', fontSize: '0.8125rem',
            }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {Object.entries(ITEM_CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        )}
      </div>

      {/* Items Tab */}
      {activeTab === 'items' && (
        <Card padding="0">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  {['Item ID', 'Name', 'Category', 'Unit', 'Base Price', 'Brand', 'Actions'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>{item.id}</td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.name}</td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: '0.625rem', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                        background: item.category === 'material' ? 'var(--color-info-50)' : item.category === 'labour' ? 'var(--color-success-50)' : 'var(--color-warning-50)',
                        color: item.category === 'material' ? 'var(--color-info-700)' : item.category === 'labour' ? 'var(--color-success-700)' : 'var(--color-warning-700)',
                        fontWeight: 600,
                      }}>
                        {ITEM_CATEGORY_LABELS[item.category] || item.category}
                      </span>
                    </td>
                    <td style={tdStyle}>{item.unit}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-fire-500)' }}>{formatCurrency(item.basePrice)}</td>
                    <td style={{ ...tdStyle, color: 'var(--color-text-tertiary)' }}>{item.brand || '-'}</td>
                    <td style={{ ...tdStyle, width: 80 }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => openEdit(item)} style={iconBtnStyle}><Edit3 size={13} /></button>
                        <button onClick={() => { deleteItem(item.id); toast.success('Item deleted'); }} style={iconBtnStyle}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredItems.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
              No items match your search
            </div>
          )}
        </Card>
      )}

      {/* Assemblies Tab */}
      {activeTab === 'assemblies' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
          {filteredAssemblies.map((asm) => (
            <Card key={asm.id} hover onClick={() => setSelectedAssembly(asm)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{asm.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{asm.description}</div>
                </div>
                <span style={{
                  fontSize: '0.625rem', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                  background: 'var(--color-fire-50)', color: 'var(--color-fire-700)', fontWeight: 600,
                }}>
                  {FIRE_SCOPE_LABELS[asm.scope] || asm.scope}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                <span>{asm.components?.length || 0} components</span>
                <span>Driver: {asm.driverUnit}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pending Updates Tab */}
      {activeTab === 'pending' && (
        <Card padding="0">
          {pending.length === 0 ? (
            <EmptyState
              icon={AlertCircle}
              title="No pending updates"
              description="Price Scout suggestions will appear here for review"
            />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  {['Item', 'Current Price', 'Proposed Price', 'Source', 'Confidence', 'Actions'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--color-text-primary)' }}>{u.itemName}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{formatCurrency(u.currentPrice)}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600, color: u.proposedPrice < u.currentPrice ? 'var(--color-success-600)' : 'var(--color-danger-600)' }}>
                      {formatCurrency(u.proposedPrice)}
                    </td>
                    <td style={tdStyle}>{u.source}</td>
                    <td style={tdStyle}>{Math.round((u.confidence || 0) * 100)}%</td>
                    <td style={{ ...tdStyle, width: 100 }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => { approvePendingUpdate(u.id); toast.success('Price update approved'); }} style={{ ...iconBtnStyle, color: 'var(--color-success-600)' }}><Check size={14} /></button>
                        <button onClick={() => { rejectPendingUpdate(u.id, 'Rejected by user'); toast.info('Price update rejected'); }} style={{ ...iconBtnStyle, color: 'var(--color-danger-600)' }}><X size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Assembly Detail Modal */}
      <Modal isOpen={!!selectedAssembly} onClose={() => setSelectedAssembly(null)} title={selectedAssembly?.name || 'Assembly'} size="lg">
        {selectedAssembly && (
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>{selectedAssembly.description}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  {['Component', 'Category', 'Unit', 'Multiplier', 'Base Price', 'Wastage'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedAssembly.components?.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--color-text-primary)' }}>{c.itemName}</td>
                    <td style={tdStyle}>{ITEM_CATEGORY_LABELS[c.category] || c.category}</td>
                    <td style={tdStyle}>{c.unit}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{c.quantityMultiplier || 'formula'}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{formatCurrency(c.basePrice)}</td>
                    <td style={tdStyle}>{c.wastagePercent ? `${c.wastagePercent}%` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={showAddItem} onClose={() => setShowAddItem(false)} title="Add Price Book Item" size="md">
        <form onSubmit={handleAddItem}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Item Name *</label>
              <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {Object.entries(ITEM_CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Unit</label>
              <select style={inputStyle} value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}>
                {Object.entries(UNITS).map(([k, v]) => (
                  <option key={k} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Base Price ($)</label>
              <input style={inputStyle} type="number" step="0.01" value={form.basePrice} onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))} required />
            </div>
            <div>
              <label style={labelStyle}>Brand</label>
              <input style={inputStyle} value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setShowAddItem(false)} type="button">Cancel</Button>
            <Button type="submit">Add Item</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Item Modal */}
      <Modal isOpen={!!showEditItem} onClose={() => setShowEditItem(null)} title="Edit Item" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input style={inputStyle} value={editForm.name || ''} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Base Price ($)</label>
            <input style={inputStyle} type="number" step="0.01" value={editForm.basePrice || ''} onChange={(e) => setEditForm((f) => ({ ...f, basePrice: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Reason for change *</label>
            <input style={inputStyle} value={editReason} onChange={(e) => setEditReason(e.target.value)} placeholder="e.g. Supplier price update" required />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Button variant="secondary" onClick={() => setShowEditItem(null)}>Cancel</Button>
          <Button onClick={handleSaveEdit}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}

const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '10px 12px', color: 'var(--color-text-secondary)' };
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
