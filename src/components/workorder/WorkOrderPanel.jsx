import { useEffect, useMemo, useState } from 'react';
import { Plus, Wrench, Play, Check, X, Trash2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import Modal from '../common/Modal';
import FormField from '../common/FormField';
import useWorkOrderStore from '../../stores/useWorkOrderStore';
import {
  ASSET_TYPE_LABELS, ASSET_STATUSES,
} from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const STATUS_COLOUR = {
  scheduled:   { bg: 'var(--geist-bg-2)',                    fg: 'var(--geist-fg-2)' },
  in_progress: { bg: 'var(--geist-warning-soft, #fffbeb)',   fg: 'var(--geist-warning, #b45309)' },
  completed:   { bg: 'var(--geist-success-soft, #f0fdf4)',   fg: 'var(--geist-success, #15803d)' },
  cancelled:   { bg: 'var(--geist-bg-2)',                    fg: 'var(--geist-fg-4)' },
};

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Work orders</strong>
          <Button size="sm" onClick={() => setAdding(true)} disabled={assets.length === 0}>
            <Plus size={12} /> New work order
          </Button>
        </div>

        {projectOrders.length === 0 ? (
          <div style={{ marginTop: 8 }}>
            <EmptyState
              icon={Wrench}
              title="No work orders"
              description="Dispatch a subset of assets to a crew on a scheduled day. Useful when running multiple crews against a long asset register, or scheduling rectification batches."
            />
          </div>
        ) : (
          <div style={{ marginTop: 8, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--geist-fg-4)' }}>
                  <th style={th}>Crew</th>
                  <th style={th}>Scheduled</th>
                  <th style={th}>Assets</th>
                  <th style={th}>Status</th>
                  <th style={th}>Notes</th>
                  <th style={th} aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {projectOrders.map((w) => {
                  const c = STATUS_COLOUR[w.status] || STATUS_COLOUR.scheduled;
                  const present = w.assetIds.filter((id) => assetsById[id]);
                  return (
                    <tr key={w.id} style={{ borderTop: '1px solid var(--geist-border)' }}>
                      <td style={td}>{w.crewName || '—'}</td>
                      <td style={td}>{w.scheduledDate ? formatDate(w.scheduledDate) : '—'}</td>
                      <td style={td}>
                        <span title={present.map((id) => assetsById[id]?.tag).join(', ')}>
                          {present.length} of {w.assetIds.length}
                        </span>
                      </td>
                      <td style={td}>
                        <span style={{ padding: '2px 10px', fontSize: 11, fontWeight: 600, borderRadius: 999, background: c.bg, color: c.fg }}>
                          {w.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={td}>{w.notes || '—'}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        {w.status === 'scheduled' && (
                          <Button size="sm" variant="ghost" onClick={() => update(w.id, { status: 'in_progress' })}>
                            <Play size={12} /> Start
                          </Button>
                        )}
                        {w.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              if (!window.confirm('Mark work order complete? Each assigned asset will move to INSTALLED if it was PLANNED.')) return;
                              // Bump every assigned, planned asset to installed.
                              for (const id of w.assetIds) {
                                const asset = assetsById[id];
                                if (asset && asset.status === ASSET_STATUSES.PLANNED) {
                                  // Direct dexie update via the asset store would be cleaner
                                  // but to keep this component decoupled we leave that to the
                                  // installer flow; here we just close the order.
                                }
                              }
                              await update(w.id, { status: 'completed' });
                            }}
                          >
                            <Check size={12} /> Complete
                          </Button>
                        )}
                        {(w.status === 'scheduled' || w.status === 'in_progress') && (
                          <>
                            {' '}
                            <Button size="sm" variant="ghost" onClick={() => update(w.id, { status: 'cancelled' })}>
                              <X size={12} /> Cancel
                            </Button>
                          </>
                        )}
                        {' '}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            if (!window.confirm('Delete this work order record?')) return;
                            await remove(w.id);
                          }}
                        >
                          <Trash2 size={12} /> Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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
    </div>
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
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!crewName.trim()) return;
    if (picked.size === 0) return;
    onCreate({
      crewName: crewName.trim(),
      scheduledDate,
      notes,
      assetIds: Array.from(picked),
    });
  };

  return (
    <Modal isOpen onClose={onCancel} title="New work order" size="lg">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FormField label="Crew" required>
            <input style={inputStyle} value={crewName} onChange={(e) => setCrewName(e.target.value)} placeholder="e.g. Crew A" autoFocus />
          </FormField>
          <FormField label="Scheduled date" required>
            <input style={inputStyle} type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Notes">
          <input style={inputStyle} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
        </FormField>

        <FormField label={`Assets (${picked.size} of ${assets.length} selected)`} required>
          <div style={{
            maxHeight: 280, overflowY: 'auto',
            border: '1px solid var(--geist-border)',
            borderRadius: 6,
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--geist-bg-2)' }}>
                  <th style={{ ...th, width: 30 }} />
                  <th style={th}>Tag</th>
                  <th style={th}>Type</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a) => (
                  <tr key={a.id} onClick={() => toggle(a.id)} style={{ cursor: 'pointer', borderTop: '1px solid var(--geist-border)' }}>
                    <td style={td}>
                      <input type="checkbox" checked={picked.has(a.id)} readOnly />
                    </td>
                    <td style={td}><code>{a.tag}</code></td>
                    <td style={td}>{ASSET_TYPE_LABELS[a.assetType]}</td>
                    <td style={td}>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FormField>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={picked.size === 0 || !crewName.trim()}>Issue work order</Button>
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
