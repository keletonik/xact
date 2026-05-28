import { useMemo, useState } from 'react';
import { Shield, Download } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
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
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Audit log</h1>
        <Button variant="ghost" onClick={download} disabled={entries.length === 0}>
          <Download size={14} /> Export CSV
        </Button>
      </div>

      <Card>
        <SearchInput value={search} onChange={setSearch} placeholder="Search action, description, user, entity" />
      </Card>

      {visible.length === 0 ? (
        <EmptyState icon={Shield} title="No audit entries" description="Actions taken in the app appear here." />
      ) : (
        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--geist-fg-4)' }}>
                <th style={th}>When</th>
                <th style={th}>Action</th>
                <th style={th}>Description</th>
                <th style={th}>User</th>
                <th style={th}>Entity</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((e) => (
                <tr key={e.id} style={{ borderTop: '1px solid var(--geist-border)' }}>
                  <td style={td}>{formatDateTime(e.timestamp)}</td>
                  <td style={td}><code>{e.action}</code></td>
                  <td style={td}>{e.description}</td>
                  <td style={td}>{e.userName}</td>
                  <td style={td}>{e.entityType ? `${e.entityType}/${(e.entityId || '').slice(0, 8)}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

const th = { padding: '6px 10px', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 };
const td = { padding: '8px 10px' };
