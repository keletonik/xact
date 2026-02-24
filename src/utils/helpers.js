import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns';

export function formatDate(date, pattern = 'MMM dd, yyyy') {
  if (!date) return '—';
  return format(new Date(date), pattern);
}

export function formatDateTime(date) {
  if (!date) return '—';
  return format(new Date(date), 'MMM dd, yyyy h:mm a');
}

export function timeAgo(date) {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(date) {
  if (!date) return false;
  return isBefore(new Date(date), new Date());
}

export function isDueSoon(date, days = 7) {
  if (!date) return false;
  const d = new Date(date);
  return isAfter(d, new Date()) && isBefore(d, addDays(new Date(), days));
}

export function getStatusColor(status) {
  const map = {
    active: 'success',
    passed: 'success',
    compliant: 'success',
    completed: 'success',
    operational: 'success',
    open: 'info',
    'in-progress': 'info',
    'in progress': 'info',
    scheduled: 'info',
    pending: 'warning',
    'needs-attention': 'warning',
    'due-soon': 'warning',
    warning: 'warning',
    failed: 'danger',
    expired: 'danger',
    overdue: 'danger',
    'non-compliant': 'danger',
    critical: 'danger',
    'out-of-service': 'danger',
    inactive: 'neutral',
    closed: 'neutral',
    cancelled: 'neutral',
  };
  return map[status?.toLowerCase()] || 'neutral';
}

export function getPriorityColor(priority) {
  const map = {
    critical: 'danger',
    high: 'danger',
    medium: 'warning',
    low: 'info',
    none: 'neutral',
  };
  return map[priority?.toLowerCase()] || 'neutral';
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function truncate(str, length = 50) {
  if (!str) return '';
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

export function formatNumber(num) {
  if (num === null || num === undefined) return '—';
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatCurrency(num) {
  if (num === null || num === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

export function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
