import { Plus, Calculator } from 'lucide-react';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import { formatDate } from '../../utils/formatters';

const STATUS_COLOUR = {
  draft:      { bg: 'var(--geist-bg-2)',                  fg: 'var(--geist-fg-2)' },
  sent:       { bg: 'var(--geist-info-soft, #eff6ff)',    fg: 'var(--geist-info, #1d4ed8)' },
  accepted:   { bg: 'var(--geist-success-soft, #f0fdf4)', fg: 'var(--geist-success, #15803d)' },
  declined:   { bg: 'var(--geist-error-soft, #fef2f2)',   fg: 'var(--geist-error, #b91c1c)' },
  superseded: { bg: 'var(--geist-bg-2)',                  fg: 'var(--geist-fg-4)' },
};

export default function QuoteList({ quotes, onOpen, onCreate }) {
  if (quotes.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Quotes</strong>
          <Button size="sm" onClick={onCreate}><Plus size={12} /> New quote</Button>
        </div>
        <EmptyState
          icon={Calculator}
          title="No quotes yet"
          description="Quote line items map to asset shapes (penetration / door / damper). When accepted, each line materialises into planned assets."
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Quotes</strong>
        <Button size="sm" onClick={onCreate}><Plus size={12} /> New quote</Button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--geist-fg-4)' }}>
              <th style={th}>Version</th>
              <th style={th}>Created</th>
              <th style={th}>Status</th>
              <th style={th}>Total</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => {
              const c = STATUS_COLOUR[q.status] || STATUS_COLOUR.draft;
              return (
                <tr
                  key={q.id}
                  onClick={() => onOpen(q)}
                  style={{ cursor: 'pointer', borderTop: '1px solid var(--geist-border)' }}
                >
                  <td style={td}>v{q.version}</td>
                  <td style={td}>{formatDate(q.createdAt)}</td>
                  <td style={td}>
                    <span style={{
                      padding: '2px 10px', fontSize: 11, fontWeight: 600,
                      borderRadius: 999, background: c.bg, color: c.fg,
                    }}>
                      {q.status}
                    </span>
                  </td>
                  <td style={{ ...td, fontWeight: 600 }}>{formatMoney(q.totalCents)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatMoney(cents) {
  const dollars = (cents || 0) / 100;
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(dollars);
}

const th = { padding: '6px 10px', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 };
const td = { padding: '8px 10px', verticalAlign: 'middle' };
