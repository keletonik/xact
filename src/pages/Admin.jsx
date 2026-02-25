import { useState, useMemo } from 'react';
import {
  Shield, Search, Download, Filter, Clock, User, FileText,
  Activity, Database, AlertTriangle, CheckCircle, RefreshCw,
  ChevronRight, BarChart3, Cpu, Flag,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import Tabs from '../components/common/Tabs';
import useAuditStore from '../stores/useAuditStore';
import usePriceBookStore from '../stores/usePriceBookStore';
import useEstimateStore from '../stores/useEstimateStore';
import useProjectStore from '../stores/useProjectStore';
import { AUDIT_ACTIONS } from '../utils/constants';
import { formatDateTime } from '../utils/formatters';
import { detectAnomalies } from '../utils/validators';

const ACTION_COLORS = {
  estimate_created: 'var(--color-info-500)',
  estimate_updated: 'var(--color-info-400)',
  estimate_version_created: 'var(--color-info-600)',
  line_added: 'var(--color-success-500)',
  line_updated: 'var(--color-success-400)',
  line_deleted: 'var(--color-danger-400)',
  price_book_item_created: 'var(--color-warning-500)',
  price_book_item_updated: 'var(--color-warning-400)',
  price_book_item_deleted: 'var(--color-danger-500)',
  ai_suggestion_created: 'var(--color-fire-400)',
  ai_suggestion_approved: 'var(--color-success-600)',
  ai_suggestion_rejected: 'var(--color-danger-600)',
  project_created: 'var(--color-info-500)',
  project_updated: 'var(--color-info-400)',
  proposal_generated: 'var(--color-fire-500)',
  proposal_sent: 'var(--color-fire-600)',
  proposal_accepted: 'var(--color-success-600)',
};

export default function Admin() {
  const auditEntries = useAuditStore((s) => s.entries);
  const exportCSV = useAuditStore((s) => s.exportCSV);
  const estimates = useEstimateStore((s) => s.estimates);
  const projects = useProjectStore((s) => s.projects);
  const pendingUpdates = usePriceBookStore((s) => s.pendingUpdates);
  const items = usePriceBookStore((s) => s.items);

  const [activeTab, setActiveTab] = useState('audit');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredAudit = useMemo(() => {
    let result = auditEntries;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) =>
        e.description.toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || e.userName.toLowerCase().includes(q)
      );
    }
    if (actionFilter !== 'all') {
      result = result.filter((e) => e.action === actionFilter);
    }
    return result;
  }, [auditEntries, search, actionFilter]);

  // Data integrity checks
  const integrityResults = useMemo(() => {
    const checks = [];

    // Check estimate totals consistency
    for (const est of estimates) {
      const lineSum = est.lines.reduce((s, l) => s + l.total, 0);
      const directCost = est.totals.directCost;
      if (Math.abs(lineSum - directCost) > 0.01) {
        checks.push({
          type: 'error',
          entity: `Estimate ${est.ref}`,
          message: `Line total sum (${lineSum.toFixed(2)}) doesn't match direct cost (${directCost.toFixed(2)})`,
        });
      }

      // Run anomaly detection on each estimate
      const anomalies = detectAnomalies(est.lines);
      for (const a of anomalies) {
        checks.push({
          type: a.severity,
          entity: `Estimate ${est.ref}`,
          message: a.message,
        });
      }
    }

    // Check for zero-price items
    const zeroPriceItems = items.filter((i) => i.basePrice === 0);
    if (zeroPriceItems.length > 0) {
      checks.push({
        type: 'warning',
        entity: 'Price Book',
        message: `${zeroPriceItems.length} items have zero base price`,
      });
    }

    if (checks.length === 0) {
      checks.push({
        type: 'success',
        entity: 'System',
        message: 'All data integrity checks passed',
      });
    }

    return checks;
  }, [estimates, items]);

  const tabs = [
    { id: 'audit', label: 'Audit Log', icon: Clock, count: auditEntries.length },
    { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
    { id: 'integrity', label: 'Data Integrity', icon: Database, count: integrityResults.filter((c) => c.type === 'error').length || undefined },
  ];

  function handleExportCSV() {
    const csv = exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const uniqueActions = [...new Set(auditEntries.map((e) => e.action))];

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Admin</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>Audit logs, diagnostics, and data integrity</p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            <SearchInput value={search} onChange={setSearch} placeholder="Search audit log..." />
            <select
              style={{
                padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                background: 'var(--color-bg-input)', color: 'var(--color-text-primary)', fontSize: '0.8125rem',
              }}
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="all">All Actions</option>
              {uniqueActions.map((a) => (
                <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <Button variant="secondary" icon={Download} onClick={handleExportCSV}>Export CSV</Button>
          </div>

          <Card padding="0">
            {filteredAudit.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                No audit entries {search || actionFilter !== 'all' ? 'match your filters' : 'yet'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                      {['Timestamp', 'Action', 'User', 'Description', 'Reason'].map((h) => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAudit.slice(0, 100).map((entry) => (
                      <tr key={entry.id} style={{ borderBottom: '1px solid var(--color-border)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ ...tdStyle, whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                          {formatDateTime(entry.timestamp)}
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            fontSize: '0.625rem', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                            background: `${ACTION_COLORS[entry.action] || 'var(--color-text-tertiary)'}15`,
                            color: ACTION_COLORS[entry.action] || 'var(--color-text-tertiary)',
                            fontWeight: 600,
                          }}>
                            {entry.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{entry.userName}</td>
                        <td style={{ ...tdStyle, color: 'var(--color-text-primary)', maxWidth: 300 }}>{entry.description}</td>
                        <td style={{ ...tdStyle, color: 'var(--color-text-tertiary)', fontStyle: entry.reason ? 'normal' : 'italic' }}>
                          {entry.reason || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Diagnostics Tab */}
      {activeTab === 'diagnostics' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Cpu size={18} style={{ color: 'var(--color-info-500)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>System Status</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Application', status: 'operational', color: 'var(--color-success-500)' },
                  { label: 'Price Book Engine', status: 'operational', color: 'var(--color-success-500)' },
                  { label: 'Cost Calculator', status: 'operational', color: 'var(--color-success-500)' },
                  { label: 'Price Scout Queue', status: `${pendingUpdates.filter((u) => u.status === 'pending').length} pending`, color: pendingUpdates.filter((u) => u.status === 'pending').length > 0 ? 'var(--color-warning-500)' : 'var(--color-success-500)' },
                ].map((s) => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{s.label}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: s.color, fontWeight: 500 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <BarChart3 size={18} style={{ color: 'var(--color-fire-500)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Platform Stats</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Projects', value: projects.length },
                  { label: 'Estimates', value: estimates.length },
                  { label: 'Price Book Items', value: items.length },
                  { label: 'Audit Entries', value: auditEntries.length },
                ].map((s) => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{s.label}</span>
                    <span style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Flag size={18} style={{ color: 'var(--color-warning-500)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Feature Flags</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Price Scout', enabled: true },
                  { label: 'Scope Checker', enabled: true },
                  { label: 'Assembly Recommender', enabled: true },
                  { label: 'Auto-Count (Premium)', enabled: false },
                  { label: 'Spec Parsing', enabled: false },
                ].map((f) => (
                  <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{f.label}</span>
                    <span style={{
                      fontSize: '0.625rem', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                      background: f.enabled ? 'var(--color-success-50)' : 'var(--color-bg-tertiary)',
                      color: f.enabled ? 'var(--color-success-700)' : 'var(--color-text-tertiary)',
                      fontWeight: 600,
                    }}>
                      {f.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Data Integrity Tab */}
      {activeTab === 'integrity' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Last check: just now | {integrityResults.length} result{integrityResults.length !== 1 ? 's' : ''}
            </span>
            <Button variant="secondary" size="sm" icon={RefreshCw}>Run Checks</Button>
          </div>

          <Card padding="0">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {integrityResults.map((check, i) => {
                const Icon = check.type === 'error' ? AlertTriangle : check.type === 'warning' ? AlertTriangle : CheckCircle;
                const color = check.type === 'error' ? 'var(--color-danger-500)' : check.type === 'warning' ? 'var(--color-warning-500)' : 'var(--color-success-500)';
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    borderBottom: i < integrityResults.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}>
                    <Icon size={16} style={{ color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{check.entity}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{check.message}</div>
                    </div>
                    <span style={{
                      fontSize: '0.625rem', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                      background: `${color}15`, color, fontWeight: 600, textTransform: 'uppercase',
                    }}>
                      {check.type}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '10px 12px', color: 'var(--color-text-secondary)' };
