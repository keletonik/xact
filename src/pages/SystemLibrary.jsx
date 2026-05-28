import { useEffect, useMemo, useState } from 'react';
import { Library, Plus, Pencil, Trash2, X } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
import FormField from '../components/common/FormField';
import useSystemLibraryStore from '../stores/useSystemLibraryStore';
import {
  SUBSTRATES, SUBSTRATE_LABELS,
  SERVICE_TYPES, SERVICE_TYPE_LABELS,
  TEST_STANDARDS, MANUFACTURERS,
} from '../utils/constants';
import { searchSystems } from '../domain/passiveFire';
import { validFrl } from '../utils/validators';

/**
 * Tested-system library. Matrix search is live: pick required FRL,
 * substrate, and a service type to see which tested systems comply.
 * CRUD lets the team curate the catalogue; bulk PDF import lands later.
 */
export default function SystemLibraryPage() {
  const systems = useSystemLibraryStore((s) => s.systems);
  const hydrate = useSystemLibraryStore((s) => s.hydrate);
  const addSystem = useSystemLibraryStore((s) => s.addSystem);
  const updateSystem = useSystemLibraryStore((s) => s.updateSystem);
  const deleteSystem = useSystemLibraryStore((s) => s.deleteSystem);

  useEffect(() => { hydrate(); }, [hydrate]);

  const [search, setSearch] = useState('');
  const [substrate, setSubstrate] = useState('all');
  const [service, setService] = useState('all');
  const [frl, setFrl] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | <systemId>

  const visible = useMemo(() => {
    const query = {
      requiredFrl: frl.trim() || null,
      substrate: substrate === 'all' ? null : substrate,
      serviceTypes: service === 'all' ? [] : [service],
    };
    const filtered = (frl || substrate !== 'all' || service !== 'all')
      ? searchSystems(systems, query)
      : [...systems].sort((a, b) => a.manufacturer.localeCompare(b.manufacturer));

    const q = search.trim().toLowerCase();
    return filtered.filter((s) => {
      if (!q) return true;
      return [s.manufacturer, s.systemName, s.testReportNo].some((v) => (v || '').toLowerCase().includes(q));
    });
  }, [systems, search, substrate, service, frl]);

  const editingSystem = editing && editing !== 'new'
    ? systems.find((s) => s.id === editing) || null
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Tested-system library</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--geist-fg-4)' }}>
            {visible.length} of {systems.length}
          </span>
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus size={14} /> Add system
          </Button>
        </div>
      </div>

      <Card>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--geist-fg-3)' }}>
          Matrix search: pick required FRL, substrate, and a service type to see which tested systems comply under AS 1530.4.
          Edit any row to keep the catalogue current; bulk PDF import from manufacturer schedules lands as part of phase 10 polish.
        </p>
      </Card>

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search manufacturer, system, report no" />
          <input
            value={frl}
            onChange={(e) => setFrl(e.target.value)}
            placeholder="Required FRL  -/120/120"
            style={inputStyle}
          />
          <select value={substrate} onChange={(e) => setSubstrate(e.target.value)} style={inputStyle}>
            <option value="all">Any substrate</option>
            {Object.values(SUBSTRATES).map((s) => (
              <option key={s} value={s}>{SUBSTRATE_LABELS[s]}</option>
            ))}
          </select>
          <select value={service} onChange={(e) => setService(e.target.value)} style={inputStyle}>
            <option value="all">Any service</option>
            {Object.values(SERVICE_TYPES).map((s) => (
              <option key={s} value={s}>{SERVICE_TYPE_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </Card>

      {visible.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No tested systems match"
          description="Loosen the matrix filters or clear the FRL field."
        />
      ) : (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--geist-fg-4)' }}>
                  <th style={th}>Manufacturer</th>
                  <th style={th}>System</th>
                  <th style={th}>Test report</th>
                  <th style={th}>Standard</th>
                  <th style={th}>Tested FRL</th>
                  <th style={th}>Substrates</th>
                  <th style={th}>Services</th>
                  <th style={th}>Opening (mm)</th>
                  <th style={th} aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => (
                  <tr key={s.id} style={{ borderTop: '1px solid var(--geist-border)' }}>
                    <td style={td}>{s.manufacturer}</td>
                    <td style={td}>
                      <div>{s.systemName}</div>
                      {s.notes && (
                        <div style={{ fontSize: 11, color: 'var(--geist-fg-4)', marginTop: 2 }}>
                          {s.notes}
                        </div>
                      )}
                    </td>
                    <td style={td}><code>{s.testReportNo || '—'}</code></td>
                    <td style={td}>{s.testStandard}</td>
                    <td style={td}><code style={{ fontSize: 12 }}>{s.testedFrl}</code></td>
                    <td style={td}>{s.substratesSupported?.map((k) => SUBSTRATE_LABELS[k]).join(', ') || '—'}</td>
                    <td style={td}>{s.servicesSupported?.map((k) => SERVICE_TYPE_LABELS[k]).join(', ') || '—'}</td>
                    <td style={td}>{s.openingSizeRangeMm ? `${s.openingSizeRangeMm[0]}–${s.openingSizeRangeMm[1]}` : '—'}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(s.id)}>
                        <Pencil size={12} /> Edit
                      </Button>{' '}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          if (!window.confirm(`Delete ${s.manufacturer} ${s.systemName}?`)) return;
                          await deleteSystem(s.id);
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

      {(editing === 'new' || editingSystem) && (
        <SystemEditor
          initial={editingSystem}
          onClose={() => setEditing(null)}
          onSave={async (form) => {
            if (editingSystem) await updateSystem(editingSystem.id, form);
            else await addSystem(form);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

const EMPTY_FORM = {
  manufacturer: MANUFACTURERS.HILTI,
  systemName: '',
  testReportNo: '',
  testStandard: TEST_STANDARDS.AS_1530_4,
  testedFrl: '-/120/120',
  substratesSupported: [],
  servicesSupported: [],
  openingMin: '',
  openingMax: '',
  notes: '',
};

function SystemEditor({ initial, onClose, onSave }) {
  const [form, setForm] = useState(() => initial ? {
    manufacturer: initial.manufacturer,
    systemName: initial.systemName,
    testReportNo: initial.testReportNo || '',
    testStandard: initial.testStandard,
    testedFrl: initial.testedFrl,
    substratesSupported: initial.substratesSupported || [],
    servicesSupported: initial.servicesSupported || [],
    openingMin: initial.openingSizeRangeMm?.[0] ?? '',
    openingMax: initial.openingSizeRangeMm?.[1] ?? '',
    notes: initial.notes || '',
  } : EMPTY_FORM);

  const [error, setError] = useState(null);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = (e) => {
    e.preventDefault();
    setError(null);
    if (!form.systemName.trim()) return setError('System name is required');
    const frlError = validFrl(form.testedFrl);
    if (frlError) return setError(frlError);
    if (form.substratesSupported.length === 0) return setError('Pick at least one substrate');
    if (form.servicesSupported.length === 0) return setError('Pick at least one service type');

    const min = form.openingMin === '' ? null : Number(form.openingMin);
    const max = form.openingMax === '' ? null : Number(form.openingMax);
    if ((min !== null && Number.isNaN(min)) || (max !== null && Number.isNaN(max))) {
      return setError('Opening size must be numeric');
    }
    if (min !== null && max !== null && min > max) {
      return setError('Opening min cannot exceed max');
    }

    onSave({
      manufacturer: form.manufacturer,
      systemName: form.systemName.trim(),
      testReportNo: form.testReportNo.trim(),
      testStandard: form.testStandard,
      testedFrl: form.testedFrl.trim(),
      substratesSupported: form.substratesSupported,
      servicesSupported: form.servicesSupported,
      openingSizeRangeMm: (min !== null && max !== null) ? [min, max] : null,
      notes: form.notes.trim(),
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={initial ? 'Edit tested system' : 'Add tested system'} size="lg">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FormField label="Manufacturer" required>
            <select style={inputStyle} value={form.manufacturer} onChange={(e) => set({ manufacturer: e.target.value })}>
              {Object.values(MANUFACTURERS).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </FormField>
          <FormField label="System name" required>
            <input style={inputStyle} value={form.systemName} onChange={(e) => set({ systemName: e.target.value })} autoFocus />
          </FormField>
          <FormField label="Test standard" required>
            <select style={inputStyle} value={form.testStandard} onChange={(e) => set({ testStandard: e.target.value })}>
              {Object.values(TEST_STANDARDS).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Test report number">
            <input style={inputStyle} value={form.testReportNo} onChange={(e) => set({ testReportNo: e.target.value })} placeholder="e.g. WF 412345" />
          </FormField>
          <FormField label="Tested FRL" required help="Format: -/120/120">
            <input style={inputStyle} value={form.testedFrl} onChange={(e) => set({ testedFrl: e.target.value })} />
          </FormField>
          <FormField label="Opening size range (mm)">
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={form.openingMin}
                onChange={(e) => set({ openingMin: e.target.value })}
                placeholder="min"
                inputMode="numeric"
              />
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={form.openingMax}
                onChange={(e) => set({ openingMax: e.target.value })}
                placeholder="max"
                inputMode="numeric"
              />
            </div>
          </FormField>
        </div>

        <FormField label="Substrates supported" required>
          <ChipGroup
            options={Object.values(SUBSTRATES).map((v) => ({ value: v, label: SUBSTRATE_LABELS[v] }))}
            selected={form.substratesSupported}
            onChange={(next) => set({ substratesSupported: next })}
          />
        </FormField>

        <FormField label="Service types supported" required>
          <ChipGroup
            options={Object.values(SERVICE_TYPES).map((v) => ({ value: v, label: SERVICE_TYPE_LABELS[v] }))}
            selected={form.servicesSupported}
            onChange={(next) => set({ servicesSupported: next })}
          />
        </FormField>

        <FormField label="Notes">
          <textarea
            style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
            value={form.notes}
            onChange={(e) => set({ notes: e.target.value })}
          />
        </FormField>

        {error && (
          <div style={{ color: 'var(--color-danger-500, #dc2626)', fontSize: 12 }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? 'Save changes' : 'Add system'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function ChipGroup({ options, selected, onChange }) {
  const toggle = (value) => {
    if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
    else onChange([...selected, value]);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            style={{
              fontSize: 12,
              padding: '4px 10px',
              borderRadius: 999,
              border: '1px solid ' + (active ? 'var(--geist-fg)' : 'var(--geist-border-strong)'),
              background: active ? 'var(--geist-fg)' : 'var(--geist-bg)',
              color: active ? 'var(--geist-bg)' : 'var(--geist-fg-2)',
              cursor: 'pointer',
            }}
          >
            {opt.label}
            {active && <X size={10} style={{ marginLeft: 4, verticalAlign: 'middle' }} />}
          </button>
        );
      })}
    </div>
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
const td = { padding: '8px 10px', verticalAlign: 'top' };
