import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Download, Calculator } from 'lucide-react';
import useCatalogStore from '../stores/useCatalogStore';
import { LABOUR_TASKS, labourCost, applyOnCosts } from '../labour/productivityMatrix';
import { centsToDollars } from '../catalog/productSchema';
import { REGIONS, REGION_LABELS, ACCESS_DIFFICULTY } from '../utils/constants';

/**
 * Single-screen estimator for minor jobs (service callouts, small upgrades).
 * For majors, the user uses Projects → Takeoff → Estimate.
 */
export default function QuickEstimatorPage() {
  const products = useCatalogStore((s) => s.products);
  const hydrate = useCatalogStore((s) => s.hydrate);
  const ready = useCatalogStore((s) => s.ready);
  useEffect(() => { hydrate(); }, [hydrate]);

  const [region, setRegion] = useState(REGIONS.NSW);
  const [access, setAccess] = useState(ACCESS_DIFFICULTY.STANDARD);
  const [margin, setMargin] = useState(0.20);
  const [overhead, setOverhead] = useState(0.10);
  const [onCostPct, setOnCostPct] = useState(0.35);
  const [taxRate, setTaxRate] = useState(0.10);
  const [travelMinutes, setTravelMinutes] = useState(60);
  const [travelRate, setTravelRate] = useState(115);
  const [items, setItems] = useState([]);
  const [labour, setLabour] = useState([]);

  const addItem = (productId) => {
    if (!productId) return;
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setItems((arr) => [...arr, { id: crypto.randomUUID(), productId, qty: 1, unitPriceCents: p.basePriceCents }]);
  };

  const addLabour = (taskId) => {
    const t = LABOUR_TASKS.find((x) => x.id === taskId);
    if (!t) return;
    setLabour((arr) => [...arr, { id: crypto.randomUUID(), taskId, qty: 1 }]);
  };

  const totals = useMemo(() => {
    const itemCost = items.reduce((sum, i) => sum + i.qty * i.unitPriceCents, 0);
    const labourDirect = labour.reduce((sum, l) => {
      const t = LABOUR_TASKS.find((x) => x.id === l.taskId);
      return sum + labourCost(t, l.qty, { region, access });
    }, 0);
    const labourFullyLoaded = applyOnCosts(labourDirect, onCostPct);
    const travelCost = Math.round((travelMinutes / 60) * travelRate * 100);
    const rawCost = itemCost + labourFullyLoaded + travelCost;
    const withOverhead = Math.round(rawCost * (1 + overhead));
    const withMargin = Math.round(withOverhead / (1 - margin));
    const tax = Math.round(withMargin * taxRate);
    const total = withMargin + tax;
    return { itemCost, labourDirect, labourFullyLoaded, travelCost, rawCost, withOverhead, withMargin, tax, total };
  }, [items, labour, region, access, margin, overhead, onCostPct, taxRate, travelMinutes, travelRate]);

  const exportQuote = () => {
    const lines = [
      ['Quick estimate'],
      ['Generated', new Date().toISOString()],
      [],
      ['Materials'],
      ['Product', 'Qty', 'Unit price', 'Total'],
    ];
    for (const it of items) {
      const p = products.find((x) => x.id === it.productId);
      lines.push([p?.name || it.productId, it.qty, centsToDollars(it.unitPriceCents).toFixed(2), centsToDollars(it.qty * it.unitPriceCents).toFixed(2)]);
    }
    lines.push([], ['Labour'], ['Task', 'Qty', 'Direct cost']);
    for (const l of labour) {
      const t = LABOUR_TASKS.find((x) => x.id === l.taskId);
      lines.push([t?.task || l.taskId, l.qty, centsToDollars(labourCost(t, l.qty, { region, access })).toFixed(2)]);
    }
    lines.push([], ['Totals']);
    Object.entries(totals).forEach(([k, v]) => lines.push([k, centsToDollars(v).toFixed(2)]));
    const csv = lines.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'quick-estimate.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Quick estimator</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>One-screen minor-works quote. {ready ? `${products.length} products available.` : 'Loading…'}</p>
        </div>
        <button type="button" style={primary} onClick={exportQuote}><Download size={14} /> Export</button>
      </header>

      <section style={card}>
        <h2 style={h2}>Parameters</h2>
        <div style={paramGrid}>
          <Field label="Region">
            <select style={input} value={region} onChange={(e) => setRegion(e.target.value)}>
              {Object.entries(REGION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Access difficulty">
            <select style={input} value={access} onChange={(e) => setAccess(e.target.value)}>
              {Object.values(ACCESS_DIFFICULTY).map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label={`Margin (${(margin * 100).toFixed(0)}%)`}>
            <input style={input} type="range" min="0" max="0.6" step="0.01" value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
          </Field>
          <Field label={`Overhead (${(overhead * 100).toFixed(0)}%)`}>
            <input style={input} type="range" min="0" max="0.5" step="0.01" value={overhead} onChange={(e) => setOverhead(Number(e.target.value))} />
          </Field>
          <Field label={`Labour on-costs (${(onCostPct * 100).toFixed(0)}%)`}>
            <input style={input} type="range" min="0" max="0.8" step="0.01" value={onCostPct} onChange={(e) => setOnCostPct(Number(e.target.value))} />
          </Field>
          <Field label={`Tax / GST (${(taxRate * 100).toFixed(0)}%)`}>
            <input style={input} type="range" min="0" max="0.25" step="0.005" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
          </Field>
          <Field label="Travel minutes">
            <input style={input} type="number" min="0" value={travelMinutes} onChange={(e) => setTravelMinutes(Number(e.target.value))} />
          </Field>
          <Field label="Travel rate ($/hr)">
            <input style={input} type="number" min="0" value={travelRate} onChange={(e) => setTravelRate(Number(e.target.value))} />
          </Field>
        </div>
      </section>

      <section style={card}>
        <div style={sectionHead}>
          <h2 style={h2}>Materials</h2>
          <ProductPicker products={products} onPick={addItem} />
        </div>
        <table style={table}>
          <thead><tr><th style={th}>Product</th><th style={th}>Qty</th><th style={th}>Unit price</th><th style={th}>Line total</th><th style={th}></th></tr></thead>
          <tbody>
            {items.map((it) => {
              const p = products.find((x) => x.id === it.productId);
              return (
                <tr key={it.id}>
                  <td style={td}>{p?.name || it.productId}</td>
                  <td style={td}><input style={qtyInput} type="number" min="0" step="0.5" value={it.qty} onChange={(e) => setItems((arr) => arr.map((x) => x.id === it.id ? { ...x, qty: Number(e.target.value) } : x))} /></td>
                  <td style={td}><input style={qtyInput} type="number" min="0" step="0.01" value={(it.unitPriceCents / 100).toFixed(2)} onChange={(e) => setItems((arr) => arr.map((x) => x.id === it.id ? { ...x, unitPriceCents: Math.round(Number(e.target.value) * 100) } : x))} /></td>
                  <td style={td}>${centsToDollars(it.qty * it.unitPriceCents).toFixed(2)}</td>
                  <td style={td}><button style={iconBtn} onClick={() => setItems((arr) => arr.filter((x) => x.id !== it.id))} aria-label="Remove material"><Trash2 size={14} /></button></td>
                </tr>
              );
            })}
            {items.length === 0 && <tr><td style={{ ...td, textAlign: 'center', color: '#64748b' }} colSpan={5}>Pick a product to add.</td></tr>}
          </tbody>
        </table>
      </section>

      <section style={card}>
        <div style={sectionHead}>
          <h2 style={h2}>Labour</h2>
          <select style={input} onChange={(e) => { addLabour(e.target.value); e.target.value = ''; }} defaultValue="">
            <option value="">+ Add labour task…</option>
            {LABOUR_TASKS.map((t) => <option key={t.id} value={t.id}>{t.task} ({t.unit})</option>)}
          </select>
        </div>
        <table style={table}>
          <thead><tr><th style={th}>Task</th><th style={th}>Qty</th><th style={th}>Trade</th><th style={th}>Direct cost</th><th style={th}></th></tr></thead>
          <tbody>
            {labour.map((l) => {
              const t = LABOUR_TASKS.find((x) => x.id === l.taskId);
              return (
                <tr key={l.id}>
                  <td style={td}>{t?.task}</td>
                  <td style={td}><input style={qtyInput} type="number" min="0" step="0.5" value={l.qty} onChange={(e) => setLabour((arr) => arr.map((x) => x.id === l.id ? { ...x, qty: Number(e.target.value) } : x))} /></td>
                  <td style={td}>{t?.trade}</td>
                  <td style={td}>${centsToDollars(labourCost(t, l.qty, { region, access })).toFixed(2)}</td>
                  <td style={td}><button style={iconBtn} onClick={() => setLabour((arr) => arr.filter((x) => x.id !== l.id))} aria-label="Remove labour"><Trash2 size={14} /></button></td>
                </tr>
              );
            })}
            {labour.length === 0 && <tr><td style={{ ...td, textAlign: 'center', color: '#64748b' }} colSpan={5}>Pick a labour task.</td></tr>}
          </tbody>
        </table>
      </section>

      <section style={card}>
        <h2 style={h2}><Calculator size={18} style={{ verticalAlign: 'middle' }} /> Totals</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: 6, fontSize: 14 }}>
          {[
            ['Materials', totals.itemCost],
            ['Labour (fully loaded)', totals.labourFullyLoaded],
            ['Travel', totals.travelCost],
            ['Raw cost', totals.rawCost],
            ['+ Overhead', totals.withOverhead],
            ['+ Margin (markup to target)', totals.withMargin],
            ['Tax', totals.tax],
            ['TOTAL', totals.total],
          ].map(([label, v], i) => (
            <div key={label} style={{ display: 'contents' }}>
              <div style={{ color: '#475569', fontWeight: i === 7 ? 700 : 400 }}>{label}</div>
              <div style={{ textAlign: 'right', fontWeight: i === 7 ? 700 : 400, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>${centsToDollars(v).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductPicker({ products, onPick }) {
  const [q, setQ] = useState('');
  const visible = useMemo(() => {
    if (!q) return products.slice(0, 8);
    const lower = q.toLowerCase();
    return products.filter((p) => (p.name || '').toLowerCase().includes(lower) || (p.sku || '').toLowerCase().includes(lower)).slice(0, 8);
  }, [products, q]);
  return (
    <div style={{ position: 'relative' }}>
      <input style={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" aria-label="Search products" />
      {q && (
        <div style={dropdown}>
          {visible.map((p) => (
            <button key={p.id} type="button" style={dropItem} onClick={() => { onPick(p.id); setQ(''); }}>
              <strong>{p.name}</strong><span style={{ color: '#64748b' }}> · {p.sku} · ${centsToDollars(p.basePriceCents).toFixed(2)}</span>
            </button>
          ))}
          {visible.length === 0 && <div style={dropItem}>No matches.</div>}
        </div>
      )}
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

const card = { background: 'white', borderRadius: 8, padding: 16, marginBottom: 16, border: '1px solid #e5e7eb' };
const h2 = { margin: '0 0 12px', fontSize: 15 };
const sectionHead = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 };
const paramGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 };
const input = { padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13 };
const qtyInput = { ...input, width: 90 };
const primary = { padding: '6px 10px', background: '#0f172a', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 };
const iconBtn = { background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' };
const table = { width: '100%', borderCollapse: 'collapse' };
const th = { textAlign: 'left', padding: '6px 8px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', fontSize: 12, color: '#475569' };
const td = { padding: '6px 8px', borderBottom: '1px solid #f1f5f9', fontSize: 13 };
const dropdown = { position: 'absolute', top: '100%', right: 0, background: 'white', border: '1px solid #e5e7eb', borderRadius: 6, marginTop: 4, minWidth: 280, maxHeight: 280, overflow: 'auto', zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' };
const dropItem = { display: 'block', textAlign: 'left', width: '100%', padding: '6px 10px', border: 'none', background: 'white', cursor: 'pointer', fontSize: 13 };
