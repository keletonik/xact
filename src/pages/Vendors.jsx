import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Building2, Search, X } from 'lucide-react';
import PaperCard from '../components/draft/PaperCard';
import CalloutBalloon from '../components/draft/CalloutBalloon';
import RevisionStamp from '../components/draft/RevisionStamp';
import Modal from '../components/common/Modal';
import FormField from '../components/common/FormField';
import useVendorStore from '../stores/useVendorStore';

const ROLES = [
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'supplier',     label: 'Supplier' },
  { value: 'distributor',  label: 'Distributor' },
  { value: 'contractor',   label: 'Sub-contractor' },
];

export default function Vendors() {
  const vendors = useVendorStore((s) => s.vendors);
  const hydrate = useVendorStore((s) => s.hydrate);
  const create = useVendorStore((s) => s.create);
  const update = useVendorStore((s) => s.update);
  const remove = useVendorStore((s) => s.remove);

  useEffect(() => { hydrate(); }, [hydrate]);

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) =>
      [v.name, v.role, v.contactEmail, v.contactPhone, v.notes].some((x) => (x || '').toLowerCase().includes(q))
    );
  }, [vendors, search]);

  return (
    <div className="xc-stagger" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'flex-end',
        gap: 22,
        borderBottom: '1.5px solid var(--rule-ink)',
        paddingBottom: 14,
      }}>
        <div>
          <div className="xc-stamp" style={{ marginBottom: 6 }}>library · vendors</div>
          <h1 className="xc-display-italic" style={{ margin: 0, fontSize: 48, lineHeight: 1 }}>
            Vendor register
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 12 }}>
            {vendors.length} on file · {visible.length} shown
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RevisionStamp letter="B" />
          <button type="button" onClick={() => setEditing('new')} style={inkBtn}>
            <Plus size={11} /> new vendor
          </button>
        </div>
      </section>

      <PaperCard title="filter · query">
        <div style={searchWrap}>
          <Search size={14} color="var(--ink-3)" style={{ marginRight: 8 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="name, role, contact, notes"
            style={searchInput}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} style={searchClear}><X size={12} /></button>
          )}
        </div>
      </PaperCard>

      <PaperCard title="vendor schedule" meta="click row to edit" noPad>
        {visible.length === 0 ? (
          <div style={emptyDraft}>
            <Building2 size={20} color="var(--ink-4)" strokeWidth={2} />
            <span style={{ marginLeft: 10 }}>no vendors on this filter</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Name', 'Role', 'Email', 'Phone', 'Website', ''].map((h, i) => (
                  <th key={i} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((v) => (
                <tr key={v.id} className="xc-sched-row" onClick={() => setEditing(v)} style={{ cursor: 'pointer' }}>
                  <td style={td}>
                    <span className="xc-display-italic" style={{ fontSize: 16 }}>{v.name}</span>
                  </td>
                  <td style={td}>
                    <CalloutBalloon size="sm">
                      {(ROLES.find((r) => r.value === v.role)?.label || v.role).toLowerCase()}
                    </CalloutBalloon>
                  </td>
                  <td style={tdMono}>{v.contactEmail || '—'}</td>
                  <td style={tdMono}>{v.contactPhone || '—'}</td>
                  <td style={tdMono}>
                    {v.website ? (
                      <a href={v.website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--accent)' }}>
                        {v.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : '—'}
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap', textAlign: 'right' }}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setEditing(v); }} style={iconBtn} aria-label="Edit">
                      <Pencil size={12} />
                    </button>
                    {' '}
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!window.confirm(`Remove ${v.name}?`)) return;
                        await remove(v.id);
                      }}
                      style={{ ...iconBtn, color: 'var(--accent)', borderColor: 'var(--accent)' }}
                      aria-label="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </PaperCard>

      {editing && (
        <VendorEditor
          initial={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (form) => {
            if (editing === 'new') await create(form);
            else await update(editing.id, form);
            setEditing(null);
          }}
        />
      )}

      <style>{`
        .xc-sched-row { position: relative; }
        .xc-sched-row::after {
          content: "";
          position: absolute;
          left: 0; right: 100%; bottom: 0;
          height: 1.5px;
          background: var(--accent);
          transition: right 220ms var(--geist-easing);
        }
        .xc-sched-row:hover::after { right: 0; }
        .xc-sched-row:hover { background: rgba(200, 16, 46, 0.03) !important; }
      `}</style>
    </div>
  );
}

function VendorEditor({ initial, onClose, onSave }) {
  const [form, setForm] = useState(() => initial ? { ...initial } : {
    name: '', role: 'manufacturer', contactEmail: '', contactPhone: '', website: '', notes: '',
  });
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, name: form.name.trim() });
  };
  return (
    <Modal isOpen onClose={onClose} title={initial ? `Edit ${initial.name}` : 'New vendor'} size="md">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FormField label="Name" required>
          <input style={modalInput} value={form.name} onChange={(e) => set({ name: e.target.value })} autoFocus />
        </FormField>
        <FormField label="Role">
          <select style={modalInput} value={form.role} onChange={(e) => set({ role: e.target.value })}>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </FormField>
        <FormField label="Contact email">
          <input style={modalInput} type="email" value={form.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} />
        </FormField>
        <FormField label="Contact phone">
          <input style={modalInput} value={form.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} />
        </FormField>
        <FormField label="Website">
          <input style={modalInput} value={form.website} onChange={(e) => set({ website: e.target.value })} placeholder="https://" />
        </FormField>
        <FormField label="Notes">
          <textarea style={{ ...modalInput, minHeight: 60, resize: 'vertical' }} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
        </FormField>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={ghostBtn}>cancel</button>
          <button type="submit" style={inkBtn}>{initial ? 'save' : 'add vendor'}</button>
        </div>
      </form>
    </Modal>
  );
}

const inkBtn = {
  background: 'var(--ink)',
  color: 'var(--paper-1)',
  border: '1px solid var(--ink)',
  padding: '8px 14px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
};
const ghostBtn = {
  background: 'transparent',
  color: 'var(--ink-2)',
  border: '1px solid var(--rule-strong)',
  padding: '8px 14px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  cursor: 'pointer',
};
const iconBtn = {
  background: 'transparent',
  border: '1px solid var(--rule-strong)',
  padding: '5px 8px',
  cursor: 'pointer',
  color: 'var(--ink-3)',
  display: 'inline-flex',
};
const searchWrap = {
  display: 'flex',
  alignItems: 'center',
  background: 'var(--paper-1)',
  border: '1px solid var(--rule-strong)',
  padding: '8px 10px',
};
const searchInput = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 13,
  color: 'var(--ink)',
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.04em',
};
const searchClear = {
  background: 'transparent',
  border: 'none',
  color: 'var(--ink-4)',
  cursor: 'pointer',
  padding: 4,
};
const modalInput = {
  width: '100%',
  background: 'var(--paper-1)',
  border: '1px solid var(--rule-strong)',
  padding: '10px 12px',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: 'var(--ink)',
};
const th = {
  textAlign: 'left',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink-3)',
  fontWeight: 600,
  padding: '10px 14px',
  borderBottom: '1.5px solid var(--rule-ink)',
  background: 'var(--paper-2)',
};
const td = { padding: '12px 14px', borderBottom: '1px solid var(--rule)', verticalAlign: 'middle' };
const tdMono = { ...td, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.04em', color: 'var(--ink-2)' };
const emptyDraft = {
  padding: '40px 20px',
  textAlign: 'center',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink-4)',
};
