import { Plus, Calculator } from 'lucide-react';
import CalloutBalloon from '../draft/CalloutBalloon';
import InkStamp from '../draft/InkStamp';
import { formatDate } from '../../utils/formatters';

function statusTone(s) {
  switch (s) {
    case 'draft':      return 'draft';
    case 'sent':       return 'installed';
    case 'accepted':   return 'certified';
    case 'declined':   return 'nonconformance';
    case 'superseded': return 'planned';
    default:           return 'draft';
  }
}

function formatMoney(cents) {
  const dollars = (cents || 0) / 100;
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(dollars);
}

export default function QuoteList({ quotes, onOpen, onCreate }) {
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
          quote register
        </span>
        <button type="button" onClick={onCreate} style={inkBtn}>
          <Plus size={11} /> new quote
        </button>
      </div>

      {quotes.length === 0 ? (
        <div style={emptyDraft}>
          <Calculator size={20} color="var(--ink-4)" strokeWidth={2} />
          <span style={{ marginLeft: 10 }}>no quotes drafted. each accepted quote materialises into planned assets.</span>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Version', 'Created', 'Status', 'Total'].map((h, i) => (
                  <th key={i} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} onClick={() => onOpen(q)} className="xc-sched-row" style={{ cursor: 'pointer' }}>
                  <td style={td}><CalloutBalloon size="md">v{q.version}</CalloutBalloon></td>
                  <td style={tdMono}>{formatDate(q.createdAt)}</td>
                  <td style={td}>
                    <InkStamp tone={statusTone(q.status)} size="sm" rotate={-2}>{q.status}</InkStamp>
                  </td>
                  <td style={{ ...tdMono, fontWeight: 600, color: 'var(--ink)' }}>{formatMoney(q.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
const emptyDraft = {
  padding: '40px 20px',
  textAlign: 'center',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--ink-4)',
};
