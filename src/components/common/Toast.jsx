import { useState, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const COLORS = {
  success: { bg: 'var(--color-success-50)', border: 'var(--color-success-200)', icon: 'var(--color-success-600)' },
  warning: { bg: 'var(--color-warning-50)', border: 'var(--color-warning-200)', icon: 'var(--color-warning-600)' },
  error: { bg: 'var(--color-danger-50)', border: 'var(--color-danger-200)', icon: 'var(--color-danger-600)' },
  info: { bg: 'var(--color-info-50)', border: 'var(--color-info-200)', icon: 'var(--color-info-600)' },
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 8,
        maxWidth: 400,
      }}>
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || Info;
            const colors = COLORS[t.type] || COLORS.info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '12px 14px',
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-primary)',
                  minWidth: 280,
                }}
              >
                <Icon size={18} style={{ color: colors.icon, flexShrink: 0, marginTop: 1 }} />
                <span style={{ flex: 1 }}>{t.message}</span>
                <button
                  onClick={() => removeToast(t.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 2,
                    color: 'var(--color-text-tertiary)',
                    flexShrink: 0,
                  }}
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
