import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, ClipboardCheck, MapPin, Plus, Wrench } from 'lucide-react';
import useServicingStore from '../stores/useServicingStore';
import useProjectStore from '../stores/useProjectStore';
import { AS1851_CADENCES } from '../servicing/schedules';

const ASSET_TYPES = Object.keys(AS1851_CADENCES);

export default function ServicingPage() {
  const ready = useServicingStore((s) => s.ready);
  const hydrate = useServicingStore((s) => s.hydrate);
  const sites = useServicingStore((s) => s.sites);
  const assets = useServicingStore((s) => s.serviceAssets);
  const workOrders = useServicingStore((s) => s.workOrders);
  const addSite = useServicingStore((s) => s.addSite);
  const addAsset = useServicingStore((s) => s.addAsset);
  const generateScheduledWorkOrders = useServicingStore((s) => s.generateScheduledWorkOrders);
  const completeWorkOrder = useServicingStore((s) => s.completeWorkOrder);
  const addReactiveWorkOrder = useServicingStore((s) => s.addReactiveWorkOrder);
  const projects = useProjectStore((s) => s.projects);

  const [tab, setTab] = useState('overview');
  const [addingSite, setAddingSite] = useState(false);
  const [addingAsset, setAddingAsset] = useState(false);
  const [reactiveForm, setReactiveForm] = useState(false);

  useEffect(() => { hydrate(); }, [hydrate]);

  const openWOs = useMemo(() => workOrders.filter((w) => w.status !== 'completed'), [workOrders]);
  const overdueWOs = useMemo(() => openWOs.filter((w) => new Date(w.scheduledFor) < new Date()), [openWOs]);
  const upcomingWOs = useMemo(() => openWOs.filter((w) => new Date(w.scheduledFor) >= new Date()).sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor)), [openWOs]);

  return (
    <div style={{ padding: 24 }}>
      <header style={pageHead}>
        <div>
          <h1 style={{ margin: 0 }}>Servicing</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>{ready ? `${sites.length} sites · ${assets.length} assets · ${openWOs.length} open WOs (${overdueWOs.length} overdue)` : 'Loading…'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" style={btn} onClick={() => generateScheduledWorkOrders(12)}><CalendarClock size={14} /> Generate WOs (12 mo)</button>
          <button type="button" style={btn} onClick={() => setReactiveForm(true)}><Wrench size={14} /> Raise reactive WO</button>
          <button type="button" style={btn} onClick={() => setAddingSite(true)}><MapPin size={14} /> New site</button>
          <button type="button" style={primary} onClick={() => setAddingAsset(true)} disabled={sites.length === 0}><Plus size={14} /> New asset</button>
        </div>
      </header>

      <nav style={tabs}>
        {['overview', 'sites', 'assets', 'workOrders'].map((id) => (
          <button key={id} type="button" onClick={() => setTab(id)} style={{ ...tab2, ...(tab === id ? tabActive : null) }}>
            {id === 'workOrders' ? 'Work orders' : id.charAt(0).toUpperCase() + id.slice(1)}
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        <div style={cards}>
          <StatCard label="Open work orders" value={openWOs.length} tone="default" />
          <StatCard label="Overdue" value={overdueWOs.length} tone={overdueWOs.length ? 'danger' : 'default'} />
          <StatCard label="Due in 30 days" value={upcomingWOs.filter((w) => (new Date(w.scheduledFor) - new Date()) < 30 * 86400000).length} tone="warning" />
          <StatCard label="Sites" value={sites.length} />
          <StatCard label="Assets" value={assets.length} />
        </div>
      )}

      {tab === 'sites' && (
        <table style={table}>
          <thead><tr><th style={th}>Name</th><th style={th}>Address</th><th style={th}>Project</th><th style={th}>Assets</th></tr></thead>
          <tbody>
            {sites.map((s) => (
              <tr key={s.id}>
                <td style={td}>{s.name}</td>
                <td style={td}>{s.address}</td>
                <td style={td}>{projects.find((p) => p.id === s.projectId)?.name || '—'}</td>
                <td style={td}>{assets.filter((a) => a.siteId === s.id).length}</td>
              </tr>
            ))}
            {sites.length === 0 && <tr><td style={{ ...td, textAlign: 'center', color: '#64748b' }} colSpan={4}>No sites yet.</td></tr>}
          </tbody>
        </table>
      )}

      {tab === 'assets' && (
        <table style={table}>
          <thead><tr>
            <th style={th}>Type</th><th style={th}>Site</th><th style={th}>Location</th>
            <th style={th}>Make / Model</th><th style={th}>Status</th><th style={th}>Last inspected</th>
          </tr></thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id}>
                <td style={td}>{a.type}</td>
                <td style={td}>{sites.find((s) => s.id === a.siteId)?.name || '—'}</td>
                <td style={td}>{a.location}</td>
                <td style={td}>{a.manufacturer} {a.model}</td>
                <td style={td}><StatusPill status={a.status} /></td>
                <td style={td}>{a.lastInspectedAt ? new Date(a.lastInspectedAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
            {assets.length === 0 && <tr><td style={{ ...td, textAlign: 'center', color: '#64748b' }} colSpan={6}>No assets yet.</td></tr>}
          </tbody>
        </table>
      )}

      {tab === 'workOrders' && (
        <table style={table}>
          <thead><tr>
            <th style={th}>Scheduled</th><th style={th}>Type</th><th style={th}>Scope</th>
            <th style={th}>Asset</th><th style={th}>Status</th><th style={th}>Actions</th>
          </tr></thead>
          <tbody>
            {workOrders.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor)).map((w) => {
              const asset = assets.find((a) => a.id === w.generatedFromAssetId);
              const overdue = new Date(w.scheduledFor) < new Date() && w.status !== 'completed';
              return (
                <tr key={w.id}>
                  <td style={td}>{new Date(w.scheduledFor).toLocaleDateString()} {overdue && <span style={{ color: '#dc2626', fontSize: 11 }}>· overdue</span>}</td>
                  <td style={td}>{w.type}</td>
                  <td style={td}>{w.scope}</td>
                  <td style={td}>{asset ? `${asset.type} @ ${asset.location}` : '—'}</td>
                  <td style={td}><StatusPill status={w.status} /></td>
                  <td style={td}>
                    {w.status !== 'completed' && (
                      <button style={linkBtn} onClick={() => completeWorkOrder(w.id, { labourMinutes: 30 })}><ClipboardCheck size={12} /> Complete</button>
                    )}
                  </td>
                </tr>
              );
            })}
            {workOrders.length === 0 && <tr><td style={{ ...td, textAlign: 'center', color: '#64748b' }} colSpan={6}>No work orders. Click "Generate WOs".</td></tr>}
          </tbody>
        </table>
      )}

      {addingSite && (
        <SiteForm projects={projects} onSave={async (data) => { await addSite(data); setAddingSite(false); }} onCancel={() => setAddingSite(false)} />
      )}
      {addingAsset && (
        <AssetForm sites={sites} projects={projects} onSave={async (data) => { await addAsset(data); setAddingAsset(false); }} onCancel={() => setAddingAsset(false)} />
      )}
      {reactiveForm && (
        <ReactiveForm projects={projects} assets={assets} onSave={async (data) => { await addReactiveWorkOrder(data); setReactiveForm(false); }} onCancel={() => setReactiveForm(false)} />
      )}
    </div>
  );
}

function SiteForm({ projects, onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', address: '', projectId: '' });
  return (
    <Modal title="New site" onCancel={onCancel} onSave={() => onSave(form)} canSave={!!form.name}>
      <Field label="Name"><input style={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Address"><input style={input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
      <Field label="Project (optional)">
        <select style={input} value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
          <option value="">—</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
        </select>
      </Field>
    </Modal>
  );
}

function AssetForm({ sites, projects, onSave, onCancel }) {
  const [form, setForm] = useState({
    siteId: sites[0]?.id || '', projectId: projects[0]?.id || '',
    type: ASSET_TYPES[0], location: '', manufacturer: '', model: '',
    installDate: new Date().toISOString().slice(0, 10),
  });
  return (
    <Modal title="New asset" onCancel={onCancel} onSave={() => onSave({ ...form, installDate: new Date(form.installDate).toISOString() })} canSave={!!form.siteId && !!form.type}>
      <Field label="Site">
        <select style={input} value={form.siteId} onChange={(e) => setForm({ ...form, siteId: e.target.value })}>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>
      <Field label="Asset type">
        <select style={input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {ASSET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Location label"><input style={input} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="L1 Foyer near lift" /></Field>
      <Field label="Manufacturer"><input style={input} value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} /></Field>
      <Field label="Model"><input style={input} value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></Field>
      <Field label="Install date"><input type="date" style={input} value={form.installDate} onChange={(e) => setForm({ ...form, installDate: e.target.value })} /></Field>
    </Modal>
  );
}

function ReactiveForm({ projects, assets, onSave, onCancel }) {
  const [form, setForm] = useState({ projectId: projects[0]?.id || '', scope: '', generatedFromAssetId: '' });
  return (
    <Modal title="Reactive work order" onCancel={onCancel} onSave={() => onSave(form)} canSave={!!form.scope}>
      <Field label="Project">
        <select style={input} value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
        </select>
      </Field>
      <Field label="Related asset (optional)">
        <select style={input} value={form.generatedFromAssetId} onChange={(e) => setForm({ ...form, generatedFromAssetId: e.target.value })}>
          <option value="">—</option>
          {assets.map((a) => <option key={a.id} value={a.id}>{a.type} @ {a.location}</option>)}
        </select>
      </Field>
      <Field label="Scope"><textarea style={{ ...input, minHeight: 80 }} value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} /></Field>
    </Modal>
  );
}

function Modal({ title, children, onCancel, onSave, canSave }) {
  return (
    <div style={modalBg}>
      <div style={{ width: 'min(520px, 96vw)', background: 'white', borderRadius: 8, padding: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>{title}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button type="button" style={btn} onClick={onCancel}>Cancel</button>
          <button type="button" style={primary} onClick={onSave} disabled={!canSave}>Save</button>
        </div>
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

function StatCard({ label, value, tone = 'default' }) {
  const color = tone === 'danger' ? '#dc2626' : tone === 'warning' ? '#b45309' : '#0f172a';
  return (
    <div style={{ flex: '1 1 160px', minWidth: 160, padding: 16, background: 'white', borderRadius: 8, border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const m = {
    active: { bg: '#dcfce7', fg: '#166534' },
    open: { bg: '#dbeafe', fg: '#1d4ed8' },
    in_progress: { bg: '#fef3c7', fg: '#92400e' },
    completed: { bg: '#e0e7ff', fg: '#3730a3' },
    defective: { bg: '#fee2e2', fg: '#991b1b' },
    retired: { bg: '#e5e7eb', fg: '#475569' },
  };
  const c = m[status] || { bg: '#e5e7eb', fg: '#475569' };
  return <span style={{ background: c.bg, color: c.fg, padding: '2px 8px', borderRadius: 999, fontSize: 11 }}>{status}</span>;
}

const pageHead = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, gap: 12, flexWrap: 'wrap' };
const tabs = { display: 'flex', gap: 4, borderBottom: '1px solid #e5e7eb', marginBottom: 16 };
const tab2 = { background: 'transparent', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: '#64748b', borderBottom: '2px solid transparent' };
const tabActive = { color: '#0f172a', borderBottomColor: '#0f172a' };
const cards = { display: 'flex', flexWrap: 'wrap', gap: 12 };
const input = { padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13 };
const btn = { padding: '6px 10px', background: 'white', color: '#0f172a', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 };
const primary = { ...btn, background: '#0f172a', color: 'white', border: 'none' };
const table = { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' };
const th = { textAlign: 'left', padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', fontSize: 12, color: '#475569' };
const td = { padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 13 };
const linkBtn = { background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer', padding: 4, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 };
const modalBg = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 };
