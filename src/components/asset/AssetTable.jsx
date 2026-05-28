import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import SearchInput from '../common/SearchInput';
import EmptyState from '../common/EmptyState';
import { Boxes } from 'lucide-react';
import {
  ASSET_TYPES, ASSET_TYPE_LABELS,
  ASSET_STATUSES, ASSET_STATUS_LABELS,
  SUBSTRATE_LABELS,
} from '../../utils/constants';

const statusColour = {
  [ASSET_STATUSES.PLANNED]:        { bg: 'var(--geist-bg-2)',                fg: 'var(--geist-fg-2)' },
  [ASSET_STATUSES.INSTALLED]:      { bg: 'var(--geist-info-soft, #eff6ff)',  fg: 'var(--geist-info, #1d4ed8)' },
  [ASSET_STATUSES.RECTIFICATION]:  { bg: 'var(--geist-warning-soft, #fffbeb)', fg: 'var(--geist-warning, #b45309)' },
  [ASSET_STATUSES.CERTIFIED]:      { bg: 'var(--geist-success-soft, #f0fdf4)', fg: 'var(--geist-success, #15803d)' },
  [ASSET_STATUSES.NONCONFORMANCE]: { bg: 'var(--geist-error-soft, #fef2f2)',  fg: 'var(--geist-error, #b91c1c)' },
};

export default function AssetTable({ assets, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assets
      .filter((a) => typeFilter === 'all' || a.assetType === typeFilter)
      .filter((a) => statusFilter === 'all' || a.status === statusFilter)
      .filter((a) => {
        if (!q) return true;
        return [a.tag, a.requiredFrl, a.achievedFrl, a.notes].some((v) => (v || '').toLowerCase().includes(q));
      })
      .sort((a, b) => (a.tag || '').localeCompare(b.tag || ''));
  }, [assets, search, typeFilter, statusFilter]);

  if (assets.length === 0) {
    return (
      <EmptyState
        icon={Boxes}
        title="No assets yet"
        description="Add the first asset (penetration, fire door, damper) to build the register."
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search tag, FRL, notes" />
        </div>
        <select style={selectStyle} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All types</option>
          {Object.values(ASSET_TYPES).map((t) => (
            <option key={t} value={t}>{ASSET_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <select style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {Object.values(ASSET_STATUSES).map((s) => (
            <option key={s} value={s}>{ASSET_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <span style={{ fontSize: 12, color: 'var(--geist-fg-4)' }}>{visible.length} of {assets.length}</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--geist-fg-4)' }}>
              <th style={th}>Tag</th>
              <th style={th}>Type</th>
              <th style={th}>Substrate</th>
              <th style={th}>Required FRL</th>
              <th style={th}>Achieved FRL</th>
              <th style={th}>Status</th>
              <th style={th} />
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => {
              const sc = statusColour[a.status] || statusColour[ASSET_STATUSES.PLANNED];
              return (
                <tr key={a.id} style={{ borderTop: '1px solid var(--geist-border)' }}>
                  <td style={td}><code>{a.tag}</code></td>
                  <td style={td}>{ASSET_TYPE_LABELS[a.assetType]}</td>
                  <td style={td}>{a.substrate ? SUBSTRATE_LABELS[a.substrate] : '—'}</td>
                  <td style={td}><code>{a.requiredFrl || '—'}</code></td>
                  <td style={td}><code>{a.achievedFrl || '—'}</code></td>
                  <td style={td}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '2px 8px', fontSize: 11, fontWeight: 600,
                      borderRadius: 999, background: sc.bg, color: sc.fg,
                    }}>
                      {ASSET_STATUS_LABELS[a.status]}
                    </span>
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <Button size="sm" variant="ghost" onClick={() => onEdit(a)}>
                      <Pencil size={12} /> Edit
                    </Button>{' '}
                    <Button size="sm" variant="ghost" onClick={() => onDelete(a)}>
                      <Trash2 size={12} /> Delete
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

const th = { padding: '6px 10px', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 };
const td = { padding: '8px 10px', verticalAlign: 'middle' };
const selectStyle = {
  padding: '6px 10px',
  border: '1px solid var(--geist-border-strong)',
  borderRadius: 4,
  background: 'var(--geist-bg)',
  fontSize: 12,
};
