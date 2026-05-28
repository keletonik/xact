import { useMemo, useState } from 'react';
import { Bug, CheckCheck, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';
import SearchInput from '../common/SearchInput';
import EmptyState from '../common/EmptyState';
import {
  DEFECT_CLASS_LABELS,
} from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const SEVERITY_PALETTE = {
  A: { bg: 'var(--geist-error-soft, #fef2f2)',   fg: 'var(--geist-error, #b91c1c)' },
  B: { bg: 'var(--geist-warning-soft, #fffbeb)', fg: 'var(--geist-warning, #b45309)' },
  C: { bg: 'var(--geist-bg-2)',                  fg: 'var(--geist-fg-2)' },
};

const STATUS_PALETTE = {
  open:        { bg: 'var(--geist-error-soft, #fef2f2)',   fg: 'var(--geist-error, #b91c1c)' },
  in_progress: { bg: 'var(--geist-warning-soft, #fffbeb)', fg: 'var(--geist-warning, #b45309)' },
  rectified:   { bg: 'var(--geist-info-soft, #eff6ff)',    fg: 'var(--geist-info, #1d4ed8)' },
  verified:    { bg: 'var(--geist-success-soft, #f0fdf4)', fg: 'var(--geist-success, #15803d)' },
};

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
      <EmptyState
        icon={ShieldCheck}
        title="No defects raised"
        description="When inspections fail, defects land here with their AS 1851 class A/B/C and rectification due date."
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search tag, description, notes" />
        </div>
        <select style={selectStyle} value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
          <option value="all">All classes</option>
          {Object.entries(DEFECT_CLASS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="rectified">Rectified</option>
          <option value="verified">Verified</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--geist-fg-4)' }}>{visible.length} of {defects.length}</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--geist-fg-4)' }}>
              <th style={th}>Asset</th>
              <th style={th}>Class</th>
              <th style={th}>Description</th>
              <th style={th}>Raised</th>
              <th style={th}>Due</th>
              <th style={th}>Status</th>
              <th style={th} aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {visible.map((d) => {
              const asset = assetsById[d.assetId];
              const sev = SEVERITY_PALETTE[d.severity] || SEVERITY_PALETTE.B;
              const stat = STATUS_PALETTE[d.status] || STATUS_PALETTE.open;
              const overdue = d.status !== 'verified' && d.rectificationDueDate && new Date(d.rectificationDueDate) < new Date();
              return (
                <tr key={d.id} style={{ borderTop: '1px solid var(--geist-border)' }}>
                  <td style={td}><code>{asset?.tag || d.assetId.slice(0, 8)}</code></td>
                  <td style={td}>
                    <Chip bg={sev.bg} fg={sev.fg}>Class {d.severity}</Chip>
                  </td>
                  <td style={td}>
                    <div>{d.description || '—'}</div>
                    {d.rectifiedNotes && (
                      <div style={{ fontSize: 11, color: 'var(--geist-fg-4)', marginTop: 2 }}>
                        Rectified: {d.rectifiedNotes}
                      </div>
                    )}
                  </td>
                  <td style={td}>{formatDate(d.raisedAt)}</td>
                  <td style={td}>
                    {d.rectificationDueDate ? (
                      <span style={{ color: overdue ? 'var(--geist-error, #b91c1c)' : 'var(--geist-fg)' }}>
                        {formatDate(d.rectificationDueDate)}
                        {overdue && ' (overdue)'}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={td}>
                    <Chip bg={stat.bg} fg={stat.fg}>{d.status}</Chip>
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    {d.status === 'open' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          const note = window.prompt('Rectification note (what was done):');
                          if (note === null) return;
                          await onMarkRectified(d.id, { rectifiedNotes: note });
                        }}
                      >
                        <Bug size={12} /> Mark rectified
                      </Button>
                    )}
                    {d.status === 'rectified' && (
                      <Button size="sm" variant="ghost" onClick={() => onVerify(d.id)}>
                        <CheckCheck size={12} /> Verify
                      </Button>
                    )}
                    {' '}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (!window.confirm('Delete this defect record?')) return;
                        await onDelete(d.id);
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Chip({ bg, fg, children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', fontSize: 11, fontWeight: 600,
      borderRadius: 999, background: bg, color: fg,
    }}>
      {children}
    </span>
  );
}

const selectStyle = {
  padding: '6px 10px',
  border: '1px solid var(--geist-border-strong)',
  borderRadius: 4,
  background: 'var(--geist-bg)',
  fontSize: 12,
};
const th = { padding: '6px 10px', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 };
const td = { padding: '8px 10px', verticalAlign: 'middle' };
