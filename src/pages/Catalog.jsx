import { useEffect, useMemo, useState } from 'react';
import { Download, Plus, Search, Upload } from 'lucide-react';
import useCatalogStore from '../stores/useCatalogStore';
import { centsToDollars } from '../catalog/productSchema';
import { ITEM_CATEGORIES, ITEM_CATEGORY_LABELS, UNITS } from '../utils/constants';
import CSVImportWizard from '../components/csv/CSVImportWizard';

export default function CatalogPage() {
  const products = useCatalogStore((s) => s.products);
  const suppliers = useCatalogStore((s) => s.suppliers);
  const supplierPrices = useCatalogStore((s) => s.supplierPrices);
  const ready = useCatalogStore((s) => s.ready);
  const hydrate = useCatalogStore((s) => s.hydrate);
  const addProduct = useCatalogStore((s) => s.addProduct);
  const updateProduct = useCatalogStore((s) => s.updateProduct);
  const deleteProduct = useCatalogStore((s) => s.deleteProduct);
  const compareFor = useCatalogStore((s) => s.compareFor);

  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('');
  const [showImport, setShowImport] = useState(null);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => { hydrate(); }, [hydrate]);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return products
      .filter((p) => !p.isArchived)
      .filter((p) => !category || p.category === category)
      .filter((p) => {
        if (!q) return true;
        return [p.name, p.sku, p.brand, p.model].some((v) => (v || '').toLowerCase().includes(q));
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [products, filter, category]);

  const exportCSV = () => {
    const headers = ['sku', 'name', 'category', 'unit', 'brand', 'model', 'base_price_aud', 'currency'];
    const lines = [headers.join(',')];
    for (const p of visible) {
      lines.push([
        csv(p.sku), csv(p.name), p.category, p.unit, csv(p.brand), csv(p.model),
        centsToDollars(p.basePriceCents).toFixed(2), p.currency,
      ].join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'catalog.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 24 }}>
      <header style={pageHead}>
        <div>
          <h1 style={{ margin: 0 }}>Catalog</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>{ready ? `${products.length} custom products · ${suppliers.length} suppliers · ${supplierPrices.length} supplier prices` : 'Loading…'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" style={btn} onClick={() => setShowImport('PRODUCT')}><Upload size={14} /> Import products</button>
          <button type="button" style={btn} onClick={() => setShowImport('SUPPLIER_PRICE')}><Upload size={14} /> Import supplier prices</button>
          <button type="button" style={btn} onClick={exportCSV}><Download size={14} /> Export</button>
          <button type="button" style={primary} onClick={() => setAdding(true)}><Plus size={14} /> New product</button>
        </div>
      </header>

      <div style={filters}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 8, top: 8, color: '#94a3b8' }} />
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search by name, SKU, brand…" style={{ ...input, paddingLeft: 28 }} aria-label="Search catalog" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={input} aria-label="Filter by category">
          <option value="">All categories</option>
          {Object.entries(ITEM_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <table style={table}>
        <thead><tr>
          <th style={th}>SKU</th><th style={th}>Name</th><th style={th}>Category</th><th style={th}>Unit</th>
          <th style={th}>Brand / Model</th><th style={th}>Base price</th><th style={th}>Suppliers</th><th style={th}>Actions</th>
        </tr></thead>
        <tbody>
          {visible.map((p) => {
            const cmp = compareFor(p.id);
            const cheapest = cmp[0];
            return (
              <tr key={p.id}>
                <td style={td}><code>{p.sku}</code></td>
                <td style={td}>{p.name}</td>
                <td style={td}>{ITEM_CATEGORY_LABELS[p.category] || p.category}</td>
                <td style={td}>{p.unit}</td>
                <td style={td}>{p.brand} {p.model && <>· {p.model}</>}</td>
                <td style={td}>${centsToDollars(p.basePriceCents).toFixed(2)}</td>
                <td style={td}>
                  {cmp.length === 0 ? <span style={{ color: '#94a3b8', fontSize: 12 }}>none</span> :
                    <>
                      <strong>${cheapest.displayLanded.toFixed(2)}</strong>
                      <span style={{ fontSize: 11, color: '#64748b' }}> · {cheapest.supplierName}{cmp.length > 1 ? ` (+${cmp.length - 1})` : ''}</span>
                    </>
                  }
                </td>
                <td style={td}>
                  <button style={linkBtn} onClick={() => setEditing(p)}>Edit</button>
                  <button style={{ ...linkBtn, color: '#b91c1c' }} onClick={() => { if (confirm('Delete product?')) deleteProduct(p.id); }}>Delete</button>
                </td>
              </tr>
            );
          })}
          {visible.length === 0 && (
            <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: '#64748b' }}>No products. Try importing a CSV.</td></tr>
          )}
        </tbody>
      </table>

      {showImport && (
        <Modal>
          <CSVImportWizard kind={showImport} onCancel={() => setShowImport(null)} onDone={() => { setShowImport(null); hydrate(); }} />
        </Modal>
      )}
      {(adding || editing) && (
        <Modal>
          <ProductEditor
            product={editing}
            onSave={async (data) => {
              if (editing) {
                await updateProduct(editing.id, data);
              } else {
                await addProduct(data);
              }
              setAdding(false); setEditing(null);
            }}
            onCancel={() => { setAdding(false); setEditing(null); }}
          />
        </Modal>
      )}
    </div>
  );
}

function ProductEditor({ product, onSave, onCancel }) {
  const [form, setForm] = useState(() => product || {
    sku: '', name: '', category: ITEM_CATEGORIES.MATERIAL, unit: UNITS.EACH,
    brand: '', model: '', manufacturer: '', datasheetUrl: '',
    basePriceCents: 0, currency: 'AUD',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const priceDollars = (form.basePriceCents || 0) / 100;
  return (
    <div style={{ width: 'min(560px, 96vw)', background: 'white', borderRadius: 8, padding: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
      <h2 style={{ marginTop: 0, fontSize: 18 }}>{product ? 'Edit product' : 'New product'}</h2>
      <div style={grid}>
        <Field label="SKU"><input style={input} value={form.sku} onChange={(e) => set('sku', e.target.value)} /></Field>
        <Field label="Name"><input style={input} value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Category">
          <select style={input} value={form.category} onChange={(e) => set('category', e.target.value)}>
            {Object.entries(ITEM_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Unit">
          <select style={input} value={form.unit} onChange={(e) => set('unit', e.target.value)}>
            {Object.values(UNITS).map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </Field>
        <Field label="Brand"><input style={input} value={form.brand} onChange={(e) => set('brand', e.target.value)} /></Field>
        <Field label="Model"><input style={input} value={form.model} onChange={(e) => set('model', e.target.value)} /></Field>
        <Field label="Manufacturer"><input style={input} value={form.manufacturer} onChange={(e) => set('manufacturer', e.target.value)} /></Field>
        <Field label="Datasheet URL"><input style={input} value={form.datasheetUrl} onChange={(e) => set('datasheetUrl', e.target.value)} placeholder="https://…" /></Field>
        <Field label="Base price (AUD)"><input style={input} type="number" step="0.01" value={priceDollars} onChange={(e) => set('basePriceCents', Math.round(Number(e.target.value) * 100))} /></Field>
        <Field label="Currency"><input style={input} value={form.currency} onChange={(e) => set('currency', e.target.value.toUpperCase())} maxLength={3} /></Field>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button type="button" style={btn} onClick={onCancel}>Cancel</button>
        <button type="button" style={primary} onClick={() => onSave(form)} disabled={!form.name}>Save</button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
      <span style={{ color: '#475569' }}>{label}</span>
      {children}
    </label>
  );
}

function Modal({ children }) {
  return (
    <div style={modalBg}>
      <div style={modalInner}>{children}</div>
    </div>
  );
}

function csv(val) {
  const s = val == null ? '' : String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

const pageHead = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, gap: 12, flexWrap: 'wrap' };
const filters = { display: 'flex', gap: 8, marginBottom: 12 };
const input = { padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, minWidth: 200 };
const btn = { padding: '6px 10px', background: 'white', color: '#0f172a', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 };
const primary = { ...btn, background: '#0f172a', color: 'white', border: 'none' };
const table = { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' };
const th = { textAlign: 'left', padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', fontSize: 12, color: '#475569' };
const td = { padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 13 };
const linkBtn = { background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer', padding: 4, marginRight: 4, fontSize: 13 };
const modalBg = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 };
const modalInner = { maxWidth: '100%' };
const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
