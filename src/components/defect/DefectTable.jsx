import { useMemo, useState } from 'react';
import { Bug, CheckCheck, ShieldCheck, Search, X } from 'lucide-react';
import CalloutBalloon from '../draft/CalloutBalloon';
import InkStamp from '../draft/InkStamp';
import {
  DEFECT_CLASS_LABELS,
} from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

function severityTone(s) {
  switch (s) {
    case 'A': return 'nonconformance';
    case 'B': return 'rectification';
    case 'C': return 'planned';
    default:  return 'draft';
  }
}

function statusTone(s) {
  switch (s) {
    case 'open':        return 'nonconformance';
    case 'rectified':   return 'installed';
    case 'verified':    return 'certified';
    default:            return 'draft';
  }
}

export default function DefectTable({
  defects, assetsById, onMarkRectified, onVerify, onDelete,
}) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return defects
      .filter((d) => severityFilter === 'all' || d.severity === severityFilter)
      .filter((d) => statusFilter === 'all' || d.status === statusFilter)
      .filter((d) => {
        if (!q) return true;
        const tag = assetsById[d.assetId]?.tag || '';
        return [tag, d.description, d.rectifiedNotes].some((v) => (v || '').toLowerCase().includes(q));
      });
  }, [defects, search, severityFilter, statusFilter, assetsById]);

  if (defects.length === 0) {
    return (
      <div style={emptyDraft}>
        <ShieldCheck size={20} color="var(--ink-4)" strokeWidth={2} />
        <span style={{ marginLeft: 10 }}>no defects raised. clean register.</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr auto', gap: 10, alignItems: 'center' }}>
        <div style={searchWrap}>
          <Search size={14} color="var(--ink-3)" style={{ marginRight: 8 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="tag, description, notes"
            style={searchInput}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} style={searchClear}>
              <X size={12} />
            </button>
          )}
        </div>
        <select style={selectStyle} value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
          <option value="all">ALL CLASSES</option>
          {Object.entries(DEFECT_CLASS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.toUpperCase()}</option>
          ))}
        </select>
        <select style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">ALL STATUSES</option>
          <option value="open">OPEN</option>
          <option value="rectified">RECTIFIED</option>
          <option value="verified">VERIFIED</option>
        </select>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: 'var(--tracking-label)',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          whiteSpace: 'nowrap',
        }}>
          {visible.length}/{defects.length}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Asset', 'Class', 'Description', 'Raised', 'Due', 'Status', ''].map((h, i) => (
                <th key={i} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((d) => {
              const asset = assetsById[d.assetId];
              const overdue = d.status !== 'verified' && d.rectificationDueDate && new Date(d.rectificationDueDate) < new Date();
              return (
                <tr key={d.id} className="xc-sched-row">
                  <td style={td}>
                    <CalloutBalloon size="md">{asset?.tag || d.assetId.slice(0, 8)}</CalloutBalloon>
                  </td>
                  <td style={td}>
                    <InkStamp tone={severityTone(d.severity)} size="sm" rotate={-3}>
                      class {d.severity}
                    </InkStamp>
                  </td>
                  <td style={td}>
                    <div style={{ color: 'var(--ink)' }}>{d.description || '—'}</div>
                    {d.rectifiedNotes && (
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--ink-3)',
                        letterSpacing: '0.04em',
                        marginTop: 4,
                      }}>
                        ▸ rectified: {d.rectifiedNotes}
                      </div>
                    )}
                  </td>
                  <td style={tdMono}>{formatDate(d.raisedAt)}</td>
                  <td style={{ ...tdMono, color: overdue ? 'var(--accent)' : 'var(--ink-2)' }}>
                    {d.rectificationDueDate ? (
                      <>
                        {formatDate(d.rectificationDueDate)}
                        {overdue && (
                          <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            letterSpacing: 'var(--tracking-label)',
                            textTransform: 'uppercase',
                            color: 'var(--accent)',
                            marginTop: 2,
                            fontWeight: 600,
                          }}>
                            overdue
                          </div>
                        )}
                      </>
                    ) : '—'}
                  </td>
                  <td style={td}>
                    <InkStamp tone={statusTone(d.status)} size="sm" rotate={-2}>{d.status}</InkStamp>
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap', textAlign: 'right' }}>
                    {d.status === 'open' && (
                      <button
                        type="button"
                        onClick={async () => {
                          const note = window.prompt('Rectification note (what was done):');
                          if (note === null) return;
                          await onMarkRectified(d.id, { rectifiedNotes: note });
                        }}
                        style={ghostBtn}
                      >
                        <Bug size={11} /> rectify
                      </button>
                    )}
                    {d.status === 'rectified' && (
                      <button type="button" onClick={() => onVerify(d.id)} style={inkBtn}>
                        <CheckCheck size={11} /> verify
                      </button>
                    )}
                    {' '}
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm('Delete this defect record?')) return;
                        await onDelete(d.id);
                      }}
                      style={{ ...ghostBtn, color: 'var(--accent)', borderColor: 'var(--accent)' }}
                    >
                      delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
const td = {
  padding: '12px 14px',
  borderBottom: '1px solid var(--rule)',
  verticalAlign: 'middle',
};
const tdMono = {
  ...td,
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  letterSpacing: '0.04em',
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
const selectStyle = {
  background: 'var(--paper-1)',
  border: '1px solid var(--rule-strong)',
  padding: '8px 10px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink)',
};
const inkBtn = {
  background: 'var(--ink)',
  color: 'var(--paper-1)',
  border: '1px solid var(--ink)',
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
