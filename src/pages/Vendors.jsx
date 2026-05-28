import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
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
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Vendors</h1>
        <Button onClick={() => setEditing('new')}>
          <Plus size={14} /> New vendor
        </Button>
      </div>

      <Card>
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, role, contact, notes" />
      </Card>

      {visible.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No vendors"
          description="Add manufacturers, suppliers and sub-contractors who appear in tested-system specs and cert pack references."
        />
      ) : (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--geist-fg-4)' }}>
                  <th style={th}>Name</th>
                  <th style={th}>Role</th>
                  <th style={th}>Email</th>
                  <th style={th}>Phone</th>
                  <th style={th}>Website</th>
                  <th style={th} aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {visible.map((v) => (
                  <tr key={v.id} style={{ borderTop: '1px solid var(--geist-border)' }}>
                    <td style={td}><strong>{v.name}</strong></td>
                    <td style={td}>{ROLES.find((r) => r.value === v.role)?.label || v.role}</td>
                    <td style={td}>{v.contactEmail || '—'}</td>
                    <td style={td}>{v.contactPhone || '—'}</td>
                    <td style={td}>
                      {v.website ? (
                        <a href={v.website} target="_blank" rel="noreferrer" style={{ color: 'var(--geist-info, #1d4ed8)' }}>
                          {v.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : '—'}
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(v)}>
                        <Pencil size={12} /> Edit
                      </Button>{' '}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          if (!window.confirm(`Remove ${v.name}?`)) return;
                          await remove(v.id);
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

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
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <FormField label="Name" required>
          <input style={inputStyle} value={form.name} onChange={(e) => set({ name: e.target.value })} autoFocus />
        </FormField>
        <FormField label="Role">
          <select style={inputStyle} value={form.role} onChange={(e) => set({ role: e.target.value })}>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </FormField>
        <FormField label="Contact email">
          <input style={inputStyle} type="email" value={form.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} />
        </FormField>
        <FormField label="Contact phone">
          <input style={inputStyle} value={form.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} />
        </FormField>
        <FormField label="Website">
          <input style={inputStyle} value={form.website} onChange={(e) => set({ website: e.target.value })} placeholder="https://" />
        </FormField>
        <FormField label="Notes">
          <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
        </FormField>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? 'Save' : 'Add vendor'}</Button>
        </div>
      </form>
    </Modal>
  );
}

const inputStyle = {
  padding: '8px 10px',
  border: '1px solid var(--geist-border-strong)',
  borderRadius: 4,
  background: 'var(--geist-bg)',
  color: 'var(--geist-fg)',
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box',
};
const th = { padding: '6px 10px', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 };
const td = { padding: '8px 10px', verticalAlign: 'middle' };
