import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

export function formatCurrency(value, decimals = 2) {
  if (value == null || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatNumber(value, decimals = 2) {
  if (value == null || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-AU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value, decimals = 1) {
  if (value == null || isNaN(value)) return '0%';
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  if (!isValid(d)) return '';
  return format(d, 'dd MMM yyyy');
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  if (!isValid(d)) return '';
  return format(d, 'dd MMM yyyy, HH:mm');
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  if (!isValid(d)) return '';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatQuantity(value, unit) {
  const formatted = formatNumber(value, value % 1 === 0 ? 0 : 2);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export function truncate(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str || '';
  return str.substring(0, maxLength) + '…';
}

export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateRef(prefix = 'EST', sequence = 1) {
  const padded = String(sequence).padStart(4, '0');
  return `${prefix}-${padded}`;
}
