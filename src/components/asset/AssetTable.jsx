import { useMemo, useState } from 'react';
import { Pencil, Trash2, Boxes, Search, X } from 'lucide-react';
import CalloutBalloon from '../draft/CalloutBalloon';
import InkStamp from '../draft/InkStamp';
import {
  ASSET_TYPES, ASSET_TYPE_LABELS,
  ASSET_STATUSES, ASSET_STATUS_LABELS,
  SUBSTRATE_LABELS,
} from '../../utils/constants';

function statusTone(status) {
  switch (status) {
    case ASSET_STATUSES.PLANNED:        return 'planned';
    case ASSET_STATUSES.INSTALLED:      return 'installed';
    case ASSET_STATUSES.RECTIFICATION:  return 'rectification';
    case ASSET_STATUSES.CERTIFIED:      return 'certified';
    case ASSET_STATUSES.NONCONFORMANCE: return 'nonconformance';
    default:                            return 'draft';
  }
}

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
      <div style={emptyDraft}>
        <Boxes size={20} color="var(--ink-4)" strokeWidth={2} />
        <span style={{ marginLeft: 10 }}>no assets drawn yet, drop a pin on a plan or add manually</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr auto', gap: 10, alignItems: 'center' }}>
        <div style={searchWrap}>
          <Search size={14} color="var(--ink-3)" style={{ marginRight: 8, flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="tag, FRL, notes"
            style={searchInput}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} style={searchClear} aria-label="Clear">
              <X size={12} />
            </button>
          )}
        </div>
        <select style={selectStyle} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">ALL TYPES</option>
          {Object.values(ASSET_TYPES).map((t) => (
            <option key={t} value={t}>{ASSET_TYPE_LABELS[t].toUpperCase()}</option>
          ))}
        </select>
        <select style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">ALL STATUSES</option>
          {Object.values(ASSET_STATUSES).map((s) => (
            <option key={s} value={s}>{ASSET_STATUS_LABELS[s].toUpperCase()}</option>
          ))}
        </select>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: 'var(--tracking-label)',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          whiteSpace: 'nowrap',
        }}>
          {visible.length}/{assets.length}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Tag', 'Type', 'Substrate', 'Required FRL', 'Achieved FRL', 'Status', ''].map((h, i) => (
                <th key={i} style={{
                  ...th,
                  textAlign: i === 6 ? 'right' : 'left',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => (
              <tr key={a.id} className="xc-sched-row" style={{ cursor: 'default' }}>
                <td style={td}><CalloutBalloon size="md">{a.tag}</CalloutBalloon></td>
                <td style={tdMono}>{ASSET_TYPE_LABELS[a.assetType]}</td>
                <td style={tdMono}>{a.substrate ? SUBSTRATE_LABELS[a.substrate] : '—'}</td>
                <td style={tdMono}>{a.requiredFrl || '—'}</td>
                <td style={tdMono}>{a.achievedFrl || '—'}</td>
                <td style={td}>
                  <InkStamp tone={statusTone(a.status)} size="sm" rotate={-2}>{a.status}</InkStamp>
                </td>
                <td style={{ ...td, whiteSpace: 'nowrap', textAlign: 'right' }}>
                  <button type="button" onClick={() => onEdit(a)} style={iconBtn} aria-label="Edit">
                    <Pencil size={12} />
                  </button>
                  {' '}
                  <button type="button" onClick={() => onDelete(a)} style={{ ...iconBtn, color: 'var(--accent)', borderColor: 'var(--accent)' }} aria-label="Delete">
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
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
  color: 'var(--ink-2)',
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
  appearance: 'none',
};
const iconBtn = {
  background: 'transparent',
  border: '1px solid var(--rule-strong)',
  padding: '5px 8px',
  cursor: 'pointer',
  color: 'var(--ink-3)',
  display: 'inline-flex',
  alignItems: 'center',
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
