import { useMemo, useState } from 'react';
import { Plus, ClipboardCheck, Play, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import FormField from '../common/FormField';
import Modal from '../common/Modal';
import {
  INSPECTION_FREQUENCIES, INSPECTION_FREQUENCY_LABELS,
} from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>AS 1851 inspections</strong>
        <Button size="sm" onClick={() => setShowSchedule(true)}>
          <Plus size={12} /> Schedule inspection
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No inspections yet"
          description="Schedule a baseline survey or routine inspection to walk the asset register."
        />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--geist-fg-4)' }}>
                <th style={th}>Frequency</th>
                <th style={th}>Scheduled</th>
                <th style={th}>Performed</th>
                <th style={th}>Result</th>
                <th style={th}>Status</th>
                <th style={th} aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((i) => {
                const rs = results[i.id] || [];
                const fails = rs.filter((r) => r.result === 'fail').length;
                return (
                  <tr key={i.id} style={{ borderTop: '1px solid var(--geist-border)' }}>
                    <td style={td}>{INSPECTION_FREQUENCY_LABELS[i.frequency]}</td>
                    <td style={td}>{i.scheduledDate ? formatDate(i.scheduledDate) : '—'}</td>
                    <td style={td}>{i.performedDate ? formatDate(i.performedDate) : '—'}</td>
                    <td style={td}>
                      {rs.length === 0 ? '—' : `${rs.length - fails} pass / ${fails} fail`}
                    </td>
                    <td style={td}>
                      <StatusPill status={i.status} />
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      {i.status !== 'completed' && (
                        <Button size="sm" variant="ghost" onClick={() => onPerform(i)}>
                          <Play size={12} /> Walk
                        </Button>
                      )}
                      {i.status !== 'completed' && (
                        <>
                          {' '}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              if (!window.confirm('Cancel this inspection?')) return;
                              await onCancel(i.id);
                            }}
                          >
                            <Trash2 size={12} /> Cancel
                          </Button>
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
    <Modal isOpen onClose={onClose} title="Schedule inspection">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <FormField label="Frequency" required>
          <select style={inputStyle} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            {Object.values(INSPECTION_FREQUENCIES).map((f) => (
              <option key={f} value={f}>{INSPECTION_FREQUENCY_LABELS[f]}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Scheduled date">
          <input style={inputStyle} type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
        </FormField>
        <FormField label="Notes">
          <input style={inputStyle} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
        </FormField>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">Schedule</Button>
        </div>
      </form>
    </Modal>
  );
}

function StatusPill({ status }) {
  const palette = {
    scheduled:   { bg: 'var(--geist-bg-2)',                  fg: 'var(--geist-fg-2)' },
    in_progress: { bg: 'var(--geist-warning-soft, #fffbeb)', fg: 'var(--geist-warning, #b45309)' },
    completed:   { bg: 'var(--geist-success-soft, #f0fdf4)', fg: 'var(--geist-success, #15803d)' },
  };
  const c = palette[status] || palette.scheduled;
  return (
    <span style={{
      padding: '2px 8px', fontSize: 11, fontWeight: 600,
      borderRadius: 999, background: c.bg, color: c.fg,
    }}>
      {status.replace('_', ' ')}
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
