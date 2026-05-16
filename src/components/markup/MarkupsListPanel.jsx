import { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { formatArea, formatLength } from '../../markup/geometry';
import { getSymbol } from '../../markup/symbolLibrary';
import { buildLegend, downloadString, legendToCSV } from '../../markup/exporters';

/**
 * Bluebeam-style Markups List. One row per markup across every page, with
 * sort, filter-by-type, search-by-subject. Click a row to navigate to the
 * markup and select it.
 */
export default function MarkupsListPanel({ markupDoc, onNavigate, onSelect, selectedIds = new Set() }) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sort, setSort] = useState({ key: 'page', dir: 'asc' });

  const rows = useMemo(() => {
    const out = [];
    for (const page of markupDoc?.pages || []) {
      for (const obj of page.objects || []) {
        out.push({
          id: obj.id,
          page: page.pageNumber,
          type: obj.type,
          subject: obj.metadata?.subject || (obj.metadata?.symbolId ? getSymbol(obj.metadata.symbolId)?.name : '') || '',
          status: obj.metadata?.status || 'none',
          layer: page.layers.find((l) => l.id === obj.layerId)?.name || '',
          quantity: obj.metadata?.quantity ?? '',
          length: ['length', 'perimeter', 'line', 'arrow', 'diameter'].includes(obj.type) ? obj.metadata?.measuredValueMm ?? 0 : 0,
          area: ['area', 'rectangle', 'cloud'].includes(obj.type) ? obj.metadata?.measuredValueMm ?? 0 : 0,
          displayUnit: page.displayUnit,
        });
      }
    }
    return out;
  }, [markupDoc]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (typeFilter && r.type !== typeFilter) return false;
      if (q && !r.subject.toLowerCase().includes(q) && !r.type.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, typeFilter]);

  const sorted = useMemo(() => {
    const mul = sort.dir === 'desc' ? -1 : 1;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key]; const bv = b[sort.key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mul;
      return String(av || '').localeCompare(String(bv || '')) * mul;
    });
  }, [filtered, sort]);

  const types = useMemo(() => Array.from(new Set(rows.map((r) => r.type))).sort(), [rows]);

  const exportCsv = () => {
    if (!markupDoc) return;
    const legend = buildLegend(markupDoc);
    downloadString(`${markupDoc.name || 'markup'}-legend.csv`, legendToCSV(legend));
  };

  const handleSort = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  return (
    <div style={wrap}>
      <div style={head}>
        <strong style={{ fontSize: 13, color: 'var(--geist-fg)' }}>Markups</strong>
        <span style={muted}>{filtered.length} of {rows.length}</span>
        <button type="button" style={iconBtn} onClick={exportCsv} title="Export legend CSV" aria-label="Export legend CSV">
          <Download size={12} strokeWidth={2.25} />
        </button>
      </div>

      <div style={controls}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={12} strokeWidth={2.25} style={{ position: 'absolute', left: 6, top: 6, color: 'var(--geist-fg-4)' }} />
          <input
            placeholder="Search subject…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={search}
            aria-label="Search markups"
          />
        </div>
        <select style={select} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by type">
          <option value="">all types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <Th label="P" onClick={() => handleSort('page')} active={sort.key === 'page'} dir={sort.dir} />
              <Th label="Type" onClick={() => handleSort('type')} active={sort.key === 'type'} dir={sort.dir} />
              <Th label="Subject" onClick={() => handleSort('subject')} active={sort.key === 'subject'} dir={sort.dir} flex />
              <Th label="Qty" onClick={() => handleSort('quantity')} active={sort.key === 'quantity'} dir={sort.dir} align="right" />
              <Th label="Length" onClick={() => handleSort('length')} active={sort.key === 'length'} dir={sort.dir} align="right" />
              <Th label="Area"  onClick={() => handleSort('area')}   active={sort.key === 'area'}   dir={sort.dir} align="right" />
              <Th label="Status" onClick={() => handleSort('status')} active={sort.key === 'status'} dir={sort.dir} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const isSel = selectedIds.has(r.id);
              return (
                <tr
                  key={r.id}
                  onClick={() => { onNavigate?.(r.page); onSelect?.(r.id); }}
                  style={{ ...row, ...(isSel ? rowSel : null) }}
                >
                  <td style={td}>{r.page}</td>
                  <td style={td}>{r.type}</td>
                  <td style={tdSubject} title={r.subject}>{r.subject || <span style={{ color: 'var(--geist-fg-4)' }}>—</span>}</td>
                  <td style={tdRight}>{r.quantity || ''}</td>
                  <td style={tdRight}>{r.length ? formatLength(r.length, r.displayUnit) : ''}</td>
                  <td style={tdRight}>{r.area ? formatArea(r.area, r.displayUnit) : ''}</td>
                  <td style={td}><StatusChip s={r.status} /></td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: 'var(--geist-fg-4)', padding: 12 }}>
                {rows.length === 0 ? 'No markups yet — place one to populate this list.' : 'No matches.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ label, onClick, active, dir, align = 'left', flex = false }) {
  return (
    <th
      onClick={onClick}
      style={{
        ...th,
        textAlign: align,
        width: flex ? 'auto' : undefined,
        cursor: 'pointer',
        color: active ? 'var(--geist-fg)' : 'var(--geist-fg-3)',
      }}
      title={`Sort by ${label}`}
    >
      {label}{active ? (dir === 'asc' ? ' ▲' : ' ▼') : ''}
    </th>
  );
}

function StatusChip({ s }) {
  const map = {
    approved: { bg: 'var(--geist-success-soft)', fg: 'var(--geist-success)', label: 'OK' },
    rejected: { bg: 'var(--geist-error-soft)',   fg: 'var(--geist-error)',   label: 'X'  },
    review:   { bg: 'var(--geist-warning-soft)', fg: 'var(--geist-warning)', label: '?'  },
  };
  const v = map[s];
  if (!v) return <span style={{ color: 'var(--geist-fg-4)' }}>—</span>;
  return <span style={{ background: v.bg, color: v.fg, padding: '1px 6px', borderRadius: 999, fontWeight: 600, fontSize: 10 }}>{v.label}</span>;
}

const wrap = { padding: 8, background: 'var(--geist-bg)', border: '1px solid var(--geist-border)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 320 };
const head = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 };
const muted = { color: 'var(--geist-fg-4)', fontSize: 11 };
const iconBtn = { padding: 4, background: 'transparent', border: '1px solid var(--geist-border)', borderRadius: 4, cursor: 'pointer', color: 'var(--geist-fg-2)' };
const controls = { display: 'flex', gap: 4 };
const search = { width: '100%', padding: '4px 6px 4px 22px', fontSize: 11, border: '1px solid var(--geist-border-strong)', borderRadius: 4, color: 'var(--geist-fg)', background: 'var(--geist-bg)' };
const select = { padding: '4px 6px', fontSize: 11, border: '1px solid var(--geist-border-strong)', borderRadius: 4, color: 'var(--geist-fg)', background: 'var(--geist-bg)' };
const tableWrap = { maxHeight: 360, overflow: 'auto', border: '1px solid var(--geist-border)', borderRadius: 6 };
const table = { width: '100%', borderCollapse: 'collapse', fontSize: 11 };
const th = { textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid var(--geist-border)', background: 'var(--geist-bg-1)', position: 'sticky', top: 0, zIndex: 1, fontWeight: 600 };
const row = { cursor: 'pointer', borderBottom: '1px solid var(--geist-border-soft)' };
const rowSel = { background: 'var(--geist-accent-soft)' };
const td = { padding: '3px 6px', whiteSpace: 'nowrap', color: 'var(--geist-fg-2)' };
const tdRight = { ...td, textAlign: 'right', fontFamily: 'var(--geist-font-mono, ui-monospace)' };
const tdSubject = { ...td, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
