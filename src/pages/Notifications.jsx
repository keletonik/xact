import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, AlertTriangle, Calculator, DollarSign,
  FolderOpen, FileText, Settings, Check, Activity,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import useAuditStore from '../stores/useAuditStore';
import usePriceBookStore from '../stores/usePriceBookStore';
import useEstimateStore from '../stores/useEstimateStore';
import { formatRelativeTime } from '../utils/formatters';

const actionIconMap = {
  project_created: FolderOpen,
  project_updated: FolderOpen,
  estimate_created: Calculator,
  estimate_updated: Calculator,
  estimate_line_added: Calculator,
  estimate_line_updated: Calculator,
  estimate_line_deleted: Calculator,
  estimate_version_created: Calculator,
  estimate_status_changed: Calculator,
  proposal_created: FileText,
  proposal_sent: FileText,
  price_book_item_updated: DollarSign,
  price_book_item_created: DollarSign,
  price_book_item_deleted: DollarSign,
  price_update_submitted: DollarSign,
  price_update_approved: DollarSign,
  price_update_rejected: DollarSign,
};

const actionColorMap = {
  project_created: 'var(--color-info-500)',
  estimate_created: 'var(--color-success-500)',
  estimate_status_changed: 'var(--color-warning-500)',
  price_update_submitted: 'var(--color-warning-500)',
  price_update_approved: 'var(--color-success-500)',
  price_update_rejected: 'var(--color-danger-500)',
  price_book_item_deleted: 'var(--color-danger-500)',
  estimate_line_deleted: 'var(--color-danger-500)',
  proposal_sent: 'var(--color-fire-500)',
};

export default function Notifications() {
  const auditEntries = useAuditStore((s) => s.entries);
  const pendingUpdates = usePriceBookStore((s) => s.pendingUpdates);
  const estimates = useEstimateStore((s) => s.estimates);
  const [filter, setFilter] = useState('all');
  const [readIds, setReadIds] = useState(new Set());

  const pending = pendingUpdates.filter((u) => u.status === 'pending');
  const emptyEstimates = estimates.filter((e) => e.status === 'draft' && e.lines.length === 0);

  const alerts = useMemo(() => {
    const items = [];
    if (pending.length > 0) {
      items.push({
        id: 'alert-pending-prices',
        type: 'alert',
        title: `${pending.length} Price Updates Pending`,
        description: 'Review and approve or reject pending price updates in the Price Book.',
        icon: AlertTriangle,
        color: 'var(--color-warning-500)',
        timestamp: new Date().toISOString(),
      });
    }
    if (emptyEstimates.length > 0) {
      items.push({
        id: 'alert-empty-estimates',
        type: 'alert',
        title: `${emptyEstimates.length} Empty Estimates`,
        description: 'Some draft estimates have no line items. Add items or assemblies to complete them.',
        icon: Calculator,
        color: 'var(--color-info-500)',
        timestamp: new Date().toISOString(),
      });
    }
    return items;
  }, [pending.length, emptyEstimates.length]);

  const notifications = useMemo(() => {
    const auditNotifs = auditEntries.slice(0, 50).map((entry) => ({
      id: entry.id,
      type: 'activity',
      title: entry.action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      description: entry.description,
      icon: actionIconMap[entry.action] || Activity,
      color: actionColorMap[entry.action] || 'var(--color-text-tertiary)',
      timestamp: entry.timestamp,
    }));
    return [...alerts, ...auditNotifs];
  }, [auditEntries, alerts]);

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter((n) => !readIds.has(n.id));
    if (filter === 'alerts') return notifications.filter((n) => n.type === 'alert');
    if (filter === 'activity') return notifications.filter((n) => n.type === 'activity');
    return notifications;
  }, [notifications, filter, readIds]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  function markAllRead() {
    setReadIds(new Set(notifications.map((n) => n.id)));
  }

  const filters = ['all', 'unread', 'alerts', 'activity'];

  return (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Notifications</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="secondary" icon={Check} onClick={markAllRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem', fontWeight: 600,
              backgroundColor: filter === f ? 'var(--color-fire-500)' : 'var(--color-bg-card)',
              color: filter === f ? '#fff' : 'var(--color-text-secondary)',
              border: `1px solid ${filter === f ? 'var(--color-fire-500)' : 'var(--color-border)'}`,
              textTransform: 'capitalize', cursor: 'pointer',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="No Notifications"
            description="You're all caught up! Notifications about estimates, pricing, and project activity will appear here."
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
            No notifications in this category
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((notif, i) => {
            const Icon = notif.icon;
            const isRead = readIds.has(notif.id);
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  style={{
                    opacity: isRead ? 0.7 : 1,
                    borderLeft: isRead ? 'none' : `3px solid ${notif.color}`,
                  }}
                  onClick={() => setReadIds((prev) => new Set([...prev, notif.id]))}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={18} style={{ color: notif.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{notif.title}</h3>
                        {!isRead && (
                          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-fire-500)', flexShrink: 0 }} />
                        )}
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        {notif.description}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 6, display: 'inline-block' }}>
                        {formatRelativeTime(notif.timestamp)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
