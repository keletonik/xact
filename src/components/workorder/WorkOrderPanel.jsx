import { useEffect, useMemo, useState } from 'react';
import { Plus, Wrench, Play, Check, X, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import FormField from '../common/FormField';
import PaperCard from '../draft/PaperCard';
import CalloutBalloon from '../draft/CalloutBalloon';
import InkStamp from '../draft/InkStamp';
import useWorkOrderStore from '../../stores/useWorkOrderStore';
import {
  ASSET_TYPE_LABELS, ASSET_STATUSES,
} from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

function statusTone(s) {
  switch (s) {
    case 'scheduled':   return 'draft';
    case 'in_progress': return 'rectification';
    case 'completed':   return 'certified';
    case 'cancelled':   return 'planned';
    default:            return 'draft';
  }
}

export default function WorkOrderPanel({ project, assets, assetsById }) {
  const workOrders = useWorkOrderStore((s) => s.workOrders);
  const hydrate = useWorkOrderStore((s) => s.hydrate);
  const create = useWorkOrderStore((s) => s.create);
  const update = useWorkOrderStore((s) => s.update);
  const remove = useWorkOrderStore((s) => s.remove);

  useEffect(() => { hydrate(); }, [hydrate]);

  const [adding, setAdding] = useState(false);
  const projectOrders = useMemo(
    () => workOrders.filter((w) => w.projectId === project.id),
    [workOrders, project.id],
  );

  return (
    <PaperCard
      title="work order register"
      meta={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          {projectOrders.length} on register
          <button type="button" onClick={() => setAdding(true)} disabled={assets.length === 0} style={inkBtn}>
            <Plus size={11} /> new
          </button>
        </span>
      }
      noPad
    >
      {projectOrders.length === 0 ? (
        <div style={emptyDraft}>
          <Wrench size={20} color="var(--ink-4)" strokeWidth={2} />
          <span style={{ marginLeft: 10 }}>no work orders. dispatch an asset subset to a crew on a scheduled day.</span>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Crew', 'Scheduled', 'Assets', 'Status', 'Notes', ''].map((h, i) => (
                  <th key={i} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projectOrders.map((w) => {
                const present = w.assetIds.filter((id) => assetsById[id]);
                return (
                  <tr key={w.id} className="xc-sched-row">
                    <td style={td}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        letterSpacing: '0.04em',
                        color: 'var(--ink)',
                        fontWeight: 500,
                      }}>
                        {w.crewName || '—'}
                      </span>
                    </td>
                    <td style={tdMono}>{w.scheduledDate ? formatDate(w.scheduledDate) : '—'}</td>
                    <td style={tdMono}>
                      <span title={present.map((id) => assetsById[id]?.tag).join(', ')}>
                        {present.length}/{w.assetIds.length}
                      </span>
                    </td>
                    <td style={td}>
                      <InkStamp tone={statusTone(w.status)} size="sm" rotate={-2}>
                        {w.status.replace('_', ' ')}
                      </InkStamp>
                    </td>
                    <td style={td}>{w.notes || '—'}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap', textAlign: 'right' }}>
                      {w.status === 'scheduled' && (
                        <button type="button" onClick={() => update(w.id, { status: 'in_progress' })} style={inkBtn}>
                          <Play size={11} /> start
                        </button>
                      )}
                      {w.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm('Mark work order complete?')) return;
                            await update(w.id, { status: 'completed' });
                          }}
                          style={inkBtn}
                        >
                          <Check size={11} /> complete
                        </button>
                      )}
                      {(w.status === 'scheduled' || w.status === 'in_progress') && (
                        <>
                          {' '}
                          <button type="button" onClick={() => update(w.id, { status: 'cancelled' })} style={ghostBtn}>
                            <X size={11} /> cancel
                          </button>
                        </>
                      )}
                      {' '}
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm('Delete this work order record?')) return;
                          await remove(w.id);
                        }}
                        style={{ ...ghostBtn, color: 'var(--accent)', borderColor: 'var(--accent)' }}
                        aria-label="Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {adding && (
        <CreateOrderModal
          assets={assets}
          onCancel={() => setAdding(false)}
          onCreate={async (input) => {
            await create({ ...input, projectId: project.id });
            setAdding(false);
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
    </PaperCard>
  );
}

function CreateOrderModal({ assets, onCancel, onCreate }) {
  const [crewName, setCrewName] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [picked, setPicked] = useState(() => new Set());

  const toggle = (id) => {
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!crewName.trim() || picked.size === 0) return;
    onCreate({
      crewName: crewName.trim(),
      scheduledDate,
      notes,
      assetIds: Array.from(picked),
    });
  };

  return (
    <Modal isOpen onClose={onCancel} title="New work order" size="lg" subtitle="Dispatch a crew">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FormField label="Crew" required>
            <input style={modalInput} value={crewName} onChange={(e) => setCrewName(e.target.value)} placeholder="e.g. Crew A" autoFocus />
          </FormField>
          <FormField label="Scheduled date" required>
            <input style={modalInput} type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Notes">
          <input style={modalInput} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="optional" />
        </FormField>
        <FormField label={`Assets (${picked.size} of ${assets.length} picked)`} required>
          <div style={{ maxHeight: 280, overflowY: 'auto', border: '1px solid var(--rule-strong)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--paper-2)' }}>
                  <th style={{ ...th, width: 30 }} />
                  <th style={th}>Tag</th>
                  <th style={th}>Type</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a) => (
                  <tr key={a.id} onClick={() => toggle(a.id)} style={{ cursor: 'pointer', borderTop: '1px solid var(--rule)' }}>
                    <td style={td}>
                      <input type="checkbox" checked={picked.has(a.id)} readOnly />
                    </td>
                    <td style={td}><CalloutBalloon size="sm">{a.tag}</CalloutBalloon></td>
                    <td style={tdMono}>{ASSET_TYPE_LABELS[a.assetType]}</td>
                    <td style={tdMono}>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FormField>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={ghostBtn}>cancel</button>
          <button type="submit" disabled={picked.size === 0 || !crewName.trim()} style={inkBtn}>issue work order</button>
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
  padding: '6px 10px',
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
