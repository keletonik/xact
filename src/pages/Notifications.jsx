import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  Calendar,
  Wrench,
  ShieldCheck,
  Settings,
  Check,
  Trash2,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { notifications } from '../data/mockData';
import { timeAgo } from '../utils/helpers';

const iconMap = {
  alert: AlertTriangle,
  reminder: Calendar,
  'work-order': Wrench,
  compliance: ShieldCheck,
  system: Settings,
};

const iconColorMap = {
  critical: 'var(--color-danger-500)',
  high: 'var(--color-warning-500)',
  medium: 'var(--color-info-500)',
  low: 'var(--text-tertiary)',
};

export default function Notifications() {
  const [filter, setFilter] = useState('all');
  const [notifs, setNotifs] = useState(notifications);

  const filtered = filter === 'all' ? notifs : filter === 'unread' ? notifs.filter(n => !n.read) : notifs.filter(n => n.type === filter);

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
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
        {['all', 'unread', 'alert', 'reminder', 'work-order', 'compliance'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: filter === f ? 'var(--color-fire-500)' : 'var(--bg-card)',
              color: filter === f ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${filter === f ? 'var(--color-fire-500)' : 'var(--border-primary)'}`,
              textTransform: 'capitalize',
            }}
          >
            {f.replace('-', ' ')}
          </button>
        ))}
      </div>

      {notifs.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="No Notifications"
            description="You're all caught up! Notifications about inspections, compliance, and work orders will appear here."
          />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
            No notifications in this category
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((notif, i) => {
            const Icon = iconMap[notif.type] || Bell;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  style={{
                    opacity: notif.read ? 0.7 : 1,
                    borderLeft: notif.read ? 'none' : `3px solid ${iconColorMap[notif.priority] || 'var(--color-fire-500)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={18} style={{ color: iconColorMap[notif.priority] || 'var(--text-tertiary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{notif.title}</h3>
                        {!notif.read && (
                          <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-fire-500)',
                            flexShrink: 0,
                          }} />
                        )}
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {notif.message}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 6, display: 'inline-block' }}>
                        {timeAgo(notif.timestamp)}
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
