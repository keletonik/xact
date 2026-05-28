import { useMemo, useState } from 'react';
import { Plus, ClipboardCheck, Play, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import FormField from '../common/FormField';
import InkStamp from '../draft/InkStamp';
import {
  INSPECTION_FREQUENCIES, INSPECTION_FREQUENCY_LABELS,
} from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

function statusTone(s) {
  switch (s) {
    case 'scheduled':   return 'draft';
    case 'in_progress': return 'rectification';
    case 'completed':   return 'certified';
    default:            return 'planned';
  }
}

export default function InspectionList({
  inspections, results, onSchedule, onPerform, onCancel,
}) {
  const [showSchedule, setShowSchedule] = useState(false);

  const sorted = useMemo(() => {
    const order = { scheduled: 0, in_progress: 1, completed: 2 };
    return [...inspections].sort((a, b) => {
      const oa = order[a.status] ?? 99;
      const ob = order[b.status] ?? 99;
      if (oa !== ob) return oa - ob;
      const da = a.scheduledDate || a.performedDate || '';
      const dbb = b.scheduledDate || b.performedDate || '';
      return dbb.localeCompare(da);
    });
  }, [inspections]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: 'var(--tracking-label)',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
        }}>
          AS 1851 inspection schedule
        </span>
        <button type="button" onClick={() => setShowSchedule(true)} style={inkBtn}>
          <Plus size={11} /> schedule
        </button>
      </div>

      {sorted.length === 0 ? (
        <div style={emptyDraft}>
          <ClipboardCheck size={20} color="var(--ink-4)" strokeWidth={2} />
          <span style={{ marginLeft: 10 }}>no inspections scheduled. start a baseline or annual cycle.</span>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Frequency', 'Scheduled', 'Performed', 'Result', 'Status', ''].map((h, i) => (
                  <th key={i} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((i) => {
                const rs = results[i.id] || [];
                const fails = rs.filter((r) => r.result === 'fail').length;
                return (
                  <tr key={i.id} className="xc-sched-row">
                    <td style={td}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        letterSpacing: 'var(--tracking-label)',
                        textTransform: 'uppercase',
                        color: 'var(--ink)',
                        fontWeight: 500,
                      }}>
                        {INSPECTION_FREQUENCY_LABELS[i.frequency]}
                      </span>
                    </td>
                    <td style={tdMono}>{i.scheduledDate ? formatDate(i.scheduledDate) : '—'}</td>
                    <td style={tdMono}>{i.performedDate ? formatDate(i.performedDate) : '—'}</td>
                    <td style={tdMono}>
                      {rs.length === 0 ? '—' : (
                        <span>
                          <span style={{ color: 'var(--status-certified-ink)' }}>{rs.length - fails}</span>
                          <span style={{ color: 'var(--ink-4)' }}> / </span>
                          <span style={{ color: 'var(--accent)' }}>{fails}</span>
                        </span>
                      )}
                    </td>
                    <td style={td}>
                      <InkStamp tone={statusTone(i.status)} size="sm" rotate={-2}>
                        {i.status.replace('_', ' ')}
                      </InkStamp>
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap', textAlign: 'right' }}>
                      {i.status !== 'completed' && (
                        <button type="button" onClick={() => onPerform(i)} style={inkBtn}>
                          <Play size={11} /> walk
                        </button>
                      )}
                      {i.status !== 'completed' && (
                        <>
                          {' '}
                          <button
                            type="button"
                            onClick={async () => {
                              if (!window.confirm('Cancel this inspection?')) return;
                              await onCancel(i.id);
                            }}
                            style={{ ...ghostBtn, color: 'var(--accent)', borderColor: 'var(--accent)' }}
                          >
                            <Trash2 size={11} /> cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showSchedule && (
        <ScheduleModal
          onClose={() => setShowSchedule(false)}
          onSchedule={async (input) => {
            await onSchedule(input);
            setShowSchedule(false);
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

function ScheduleModal({ onClose, onSchedule }) {
  const [frequency, setFrequency] = useState(INSPECTION_FREQUENCIES.ANNUAL);
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const submit = (e) => {
    e.preventDefault();
    onSchedule({ frequency, scheduledDate, notes });
  };

  return (
    <Modal isOpen onClose={onClose} title="Schedule inspection" subtitle="AS 1851 § 16, 17, 18">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FormField label="Frequency" required>
          <select style={modalInput} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            {Object.values(INSPECTION_FREQUENCIES).map((f) => (
              <option key={f} value={f}>{INSPECTION_FREQUENCY_LABELS[f]}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Scheduled date">
          <input style={modalInput} type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
        </FormField>
        <FormField label="Notes">
          <input style={modalInput} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="optional" />
        </FormField>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={ghostBtn}>cancel</button>
          <button type="submit" style={inkBtn}>schedule</button>
        </div>
      </form>
    </Modal>
  );
}

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
const modalInput = {
  width: '100%',
  background: 'var(--paper-1)',
  border: '1px solid var(--rule-strong)',
  padding: '10px 12px',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: 'var(--ink)',
};
const inkBtn = {
  background: 'var(--ink)',
  color: 'var(--paper-1)',
  border: '1px solid var(--ink)',
  padding: '7px 12px',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
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
  padding: '7px 12px',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
};
const emptyDraft = {
  padding: '40px 20px',
  textAlign: 'center',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink-4)',
};
