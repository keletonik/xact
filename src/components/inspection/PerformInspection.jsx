import { useMemo, useState } from 'react';
import { Check, X, AlertCircle, Save, ArrowLeft } from 'lucide-react';
import PaperCard from '../draft/PaperCard';
import CalloutBalloon from '../draft/CalloutBalloon';
import FormField from '../common/FormField';
import {
  ASSET_TYPE_LABELS, SUBSTRATE_LABELS,
  DEFECT_CLASSES, DEFECT_CLASS_LABELS,
  INSPECTION_FREQUENCY_LABELS,
} from '../../utils/constants';

/**
 * The walk-the-register inspection sheet. Drafted as a single
 * compliance log: scheduled date + notes at top, every asset row
 * carries pass/fail/N/A radios, a defect-class selector, and a
 * required note on fail. Save commits the entire log atomically.
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
      return setError(`${summary.pending} asset${summary.pending === 1 ? '' : 's'} still pending. mark each pass, fail, or N/A.`);
    }
    const failWithoutNote = assets.find((a) => {
      const r = results[a.id];
      return r.result === 'fail' && !r.notes.trim();
    });
    if (failWithoutNote) {
      return setError(`asset ${failWithoutNote.tag} marked fail but has no defect description.`);
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
      setError(err.message || 'save failed');
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button type="button" onClick={onCancel} style={crumbBtn}>
        <ArrowLeft size={11} /> back to inspections
      </button>

      <PaperCard
        title={`${INSPECTION_FREQUENCY_LABELS[inspection.frequency]} inspection`}
        meta={`scheduled ${inspection.scheduledDate || '—'}`}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
            walk the asset register
          </div>
          <div style={{ display: 'flex', gap: 14, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            <Tally label="pass" value={summary.pass} colour="var(--status-certified-ink)" />
            <Tally label="fail" value={summary.fail} colour="var(--accent)" />
            <Tally label="N/A"  value={summary.na} colour="var(--ink-4)" />
            <Tally label="pending" value={summary.pending} colour="var(--status-rectification-ink)" />
          </div>
        </div>
      </PaperCard>

      <PaperCard title="inspection log">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
          <FormField label="Performed date">
            <input style={modalInput} type="date" value={performedDate} onChange={(e) => setPerformedDate(e.target.value)} />
          </FormField>
          <FormField label="Inspection notes">
            <input style={modalInput} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="optional overall note" />
          </FormField>
        </div>
      </PaperCard>

      <PaperCard title="asset results" noPad>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Tag', 'Type', 'Substrate', 'FRL', 'Result', 'Class', 'Defect note'].map((h, i) => (
                  <th key={i} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => {
                const r = results[a.id];
                return (
                  <tr key={a.id} style={{ borderTop: '1px solid var(--rule)' }}>
                    <td style={td}><CalloutBalloon size="md">{a.tag}</CalloutBalloon></td>
                    <td style={tdMono}>{ASSET_TYPE_LABELS[a.assetType]}</td>
                    <td style={tdMono}>{a.substrate ? SUBSTRATE_LABELS[a.substrate] : '—'}</td>
                    <td style={tdMono}>{a.achievedFrl || a.requiredFrl || '—'}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <ResultButton current={r.result} value="pass" onClick={() => update(a.id, { result: 'pass' })} icon={Check}      label="Pass" colour="var(--status-certified-ink)" />
                        <ResultButton current={r.result} value="fail" onClick={() => update(a.id, { result: 'fail' })} icon={X}          label="Fail" colour="var(--accent)"  />
                        <ResultButton current={r.result} value="na"   onClick={() => update(a.id, { result: 'na' })}   icon={AlertCircle} label="N/A"  colour="var(--ink-3)" />
                      </div>
                    </td>
                    <td style={td}>
                      <select
                        style={{ ...tableInput, fontSize: 11 }}
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
                        style={tableInput}
                        value={r.notes}
                        onChange={(e) => update(a.id, { notes: e.target.value })}
                        placeholder={r.result === 'fail' ? 'required: describe defect' : 'optional'}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PaperCard>

      {error && (
        <div style={errBanner}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={ghostBtn}>cancel</button>
        <button type="button" onClick={submit} disabled={saving} style={{ ...inkBtn, opacity: saving ? 0.6 : 1 }}>
          <Save size={11} /> {saving ? 'committing…' : 'complete inspection'}
        </button>
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
        padding: '5px 7px',
        border: `1px solid ${active ? colour : 'var(--rule-strong)'}`,
        background: active ? colour : 'var(--paper-1)',
        color: active ? 'var(--paper-1)' : 'var(--ink-3)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}
    >
      <Icon size={11} /> {label}
    </button>
  );
}

function Tally({ label, value, colour }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 8, height: 8, background: colour, border: '1px solid var(--ink)' }} />
      <span style={{ color: 'var(--ink-3)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase' }}>{label}</span>
      <strong style={{ color: 'var(--ink)' }}>{value}</strong>
    </span>
  );
}

const crumbBtn = {
  background: 'transparent',
  border: 'none',
  color: 'var(--ink-3)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  padding: 0,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  textAlign: 'left',
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
const td = { padding: '10px 14px', verticalAlign: 'middle' };
const tdMono = { ...td, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.04em', color: 'var(--ink-2)' };
const tableInput = {
  width: '100%',
  background: 'var(--paper-1)',
  border: '1px solid var(--rule-strong)',
  padding: '6px 8px',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  color: 'var(--ink)',
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
const errBanner = {
  padding: '10px 14px',
  border: '1.5px solid var(--accent)',
  color: 'var(--accent)',
  backgroundImage: 'repeating-linear-gradient(45deg, rgba(200, 16, 46, 0.08) 0 8px, transparent 8px 16px)',
  backgroundColor: 'var(--paper-1)',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  letterSpacing: '0.04em',
};
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
  gap: 6,
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
