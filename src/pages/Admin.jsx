import { useMemo, useState } from 'react';
import { Shield, Download, Search, X } from 'lucide-react';
import PaperCard from '../components/draft/PaperCard';
import CalloutBalloon from '../components/draft/CalloutBalloon';
import useAuditStore from '../stores/useAuditStore';
import { formatDateTime } from '../utils/formatters';

export default function Admin() {
  const entries = useAuditStore((s) => s.entries);
  const exportCSV = useAuditStore((s) => s.exportCSV);
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      [e.action, e.description, e.userName, e.entityType, e.entityId]
        .some((v) => (v || '').toLowerCase().includes(q))
    );
  }, [entries, search]);

  const download = () => {
    const csv = exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xact-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="xc-stagger" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'flex-end',
        gap: 22,
        borderBottom: '1.5px solid var(--rule-ink)',
        paddingBottom: 14,
      }}>
        <div>
          <div className="xc-stamp" style={{ marginBottom: 6 }}>system · audit log</div>
          <h1 className="xc-display-italic" style={{ margin: 0, fontSize: 48, lineHeight: 1 }}>
            Action ledger
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 12 }}>
            {entries.length} entries · {visible.length} shown
          </p>
        </div>
        <button type="button" onClick={download} disabled={entries.length === 0} style={{ ...inkBtn, opacity: entries.length === 0 ? 0.5 : 1 }}>
          <Download size={11} /> export csv
        </button>
      </section>

      <PaperCard title="filter · query">
        <div style={searchWrap}>
          <Search size={14} color="var(--ink-3)" style={{ marginRight: 8 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="action, description, user, entity"
            style={searchInput}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} style={searchClear}><X size={12} /></button>
          )}
        </div>
      </PaperCard>

      <PaperCard title="action ledger" meta="newest at top" noPad>
        {visible.length === 0 ? (
          <div style={emptyDraft}>
            <Shield size={20} color="var(--ink-4)" strokeWidth={2} />
            <span style={{ marginLeft: 10 }}>no entries on this filter</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['When', 'Action', 'Description', 'User', 'Entity'].map((h, i) => (
                    <th key={i} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((e) => (
                  <tr key={e.id} className="xc-sched-row">
                    <td style={tdMono}>{formatDateTime(e.timestamp)}</td>
                    <td style={td}>
                      <CalloutBalloon size="sm">{e.action.toLowerCase()}</CalloutBalloon>
                    </td>
                    <td style={td}>{e.description}</td>
                    <td style={tdMono}>{e.userName}</td>
                    <td style={tdMono}>{e.entityType ? `${e.entityType}/${(e.entityId || '').slice(0, 8)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PaperCard>

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
  gap: 5,
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
const emptyDraft = {
  padding: '40px 20px',
  textAlign: 'center',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink-4)',
};
