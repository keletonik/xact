import { useMemo, useState } from 'react';
import { Check, X, AlertCircle, Save, ArrowLeft } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import FormField from '../common/FormField';
import {
  ASSET_TYPE_LABELS, SUBSTRATE_LABELS,
  DEFECT_CLASSES, DEFECT_CLASS_LABELS,
  INSPECTION_FREQUENCY_LABELS,
} from '../../utils/constants';

/**
 * Walk every asset in the project for an inspection, capture pass /
 * fail / na per asset, and a defect class plus note on fail.
 *
 * No partial save: the form gathers all results in memory and writes
 * one inspection on Save so the audit trail and defect raising stay
 * atomic. For a partial walk, the user marks remaining items as
 * pending in their own session and re-enters later (defect can be
 * raised manually in the meantime).
 */
export default function PerformInspection({ inspection, assets, onCancel, onSave }) {
  const [results, setResults] = useState(() => {
    const out = {};
    for (const a of assets) {
      out[a.id] = { result: 'pending', defectClass: 'B', notes: '' };
    }
    return out;
  });
  const [performedDate, setPerformedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const summary = useMemo(() => {
    const counts = { pass: 0, fail: 0, na: 0, pending: 0 };
    for (const a of assets) counts[results[a.id]?.result || 'pending'] += 1;
    return counts;
  }, [assets, results]);

  const update = (assetId, patch) => {
    setResults((r) => ({ ...r, [assetId]: { ...r[assetId], ...patch } }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (summary.pending > 0) {
      return setError(`${summary.pending} asset${summary.pending === 1 ? '' : 's'} still pending. Mark each pass, fail, or N/A.`);
    }
    const failWithoutNote = assets.find((a) => {
      const r = results[a.id];
      return r.result === 'fail' && !r.notes.trim();
    });
    if (failWithoutNote) {
      return setError(`Asset ${failWithoutNote.tag} marked fail but has no defect description.`);
    }

    setSaving(true);
    try {
      await onSave({
        performedDate: new Date(performedDate).toISOString(),
        notes,
        results: assets.map((a) => ({
          assetId: a.id,
          result: results[a.id].result,
          defectClass: results[a.id].result === 'fail' ? results[a.id].defectClass : null,
          notes: results[a.id].notes,
        })),
      });
    } catch (err) {
      setError(err.message || 'Save failed');
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Button variant="ghost" size="sm" onClick={onCancel}>
        <ArrowLeft size={12} /> Back to inspections
      </Button>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{INSPECTION_FREQUENCY_LABELS[inspection.frequency]} inspection</strong>
            <div style={{ fontSize: 12, color: 'var(--geist-fg-4)', marginTop: 2 }}>
              Scheduled {inspection.scheduledDate || '—'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, alignItems: 'center' }}>
            <Tally label="pass" value={summary.pass} colour="var(--geist-success, #15803d)" />
            <Tally label="fail" value={summary.fail} colour="var(--geist-error, #b91c1c)" />
            <Tally label="N/A"  value={summary.na} colour="var(--geist-fg-4)" />
            <Tally label="pending" value={summary.pending} colour="var(--geist-warning, #b45309)" />
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FormField label="Performed date">
            <input style={inputStyle} type="date" value={performedDate} onChange={(e) => setPerformedDate(e.target.value)} />
          </FormField>
          <FormField label="Inspection notes">
            <input style={inputStyle} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional overall note" />
          </FormField>
        </div>
      </Card>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--geist-fg-4)' }}>
                <th style={th}>Tag</th>
                <th style={th}>Type</th>
                <th style={th}>Substrate</th>
                <th style={th}>FRL</th>
                <th style={th}>Result</th>
                <th style={th}>Class</th>
                <th style={th}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => {
                const r = results[a.id];
                return (
                  <tr key={a.id} style={{ borderTop: '1px solid var(--geist-border)' }}>
                    <td style={td}><code>{a.tag}</code></td>
                    <td style={td}>{ASSET_TYPE_LABELS[a.assetType]}</td>
                    <td style={td}>{a.substrate ? SUBSTRATE_LABELS[a.substrate] : '—'}</td>
                    <td style={td}><code>{a.achievedFrl || a.requiredFrl || '—'}</code></td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <ResultButton current={r.result} value="pass" onClick={() => update(a.id, { result: 'pass' })} icon={Check}      label="Pass" colour="var(--geist-success, #15803d)" />
                        <ResultButton current={r.result} value="fail" onClick={() => update(a.id, { result: 'fail' })} icon={X}          label="Fail" colour="var(--geist-error, #b91c1c)"  />
                        <ResultButton current={r.result} value="na"   onClick={() => update(a.id, { result: 'na' })}   icon={AlertCircle} label="N/A"  colour="var(--geist-fg-3)" />
                      </div>
                    </td>
                    <td style={td}>
                      <select
                        style={{ ...inputStyle, padding: '4px 6px', fontSize: 12 }}
                        value={r.defectClass}
                        onChange={(e) => update(a.id, { defectClass: e.target.value })}
                        disabled={r.result !== 'fail'}
                      >
                        {Object.values(DEFECT_CLASSES).map((c) => (
                          <option key={c} value={c}>{DEFECT_CLASS_LABELS[c]}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ ...td, minWidth: 220 }}>
                      <input
                        style={{ ...inputStyle, padding: '4px 6px', fontSize: 12 }}
                        value={r.notes}
                        onChange={(e) => update(a.id, { notes: e.target.value })}
                        placeholder={r.result === 'fail' ? 'Defect description (required)' : 'Optional'}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {error && (
        <div style={{ color: 'var(--color-danger-500, #dc2626)', fontSize: 12 }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="button" onClick={submit} disabled={saving} loading={saving}>
          <Save size={12} /> Complete inspection
        </Button>
      </div>
    </div>
  );
}

function ResultButton({ current, value, onClick, icon: Icon, label, colour }) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      style={{
        padding: '4px 6px',
        border: '1px solid ' + (active ? colour : 'var(--geist-border)'),
        background: active ? colour : 'var(--geist-bg)',
        color: active ? 'var(--geist-bg)' : 'var(--geist-fg-3)',
        borderRadius: 4,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontSize: 11,
      }}
    >
      <Icon size={11} /> {label}
    </button>
  );
}

function Tally({ label, value, colour }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: colour }} />
      <span style={{ color: 'var(--geist-fg-3)' }}>{label}</span>
      <strong style={{ color: 'var(--geist-fg)' }}>{value}</strong>
    </span>
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
