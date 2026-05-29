import { useEffect, useId, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Modal.
 *
 * Props:
 *   isOpen     boolean
 *   onClose    () => void
 *   title      string
 *   subtitle?  string
 *   size?      'sm' | 'md' | 'lg' | 'xl'  (default 'md')
 *   footer?    React node, rendered in a bottom action bar
 *   children
 *   initialFocusRef?  React ref of the element to focus first
 *   closeOnBackdrop?  default true
 *
 * What this carries that a plain JSX modal doesn't:
 *   - Portal to document.body so a transformed/filtered ancestor
 *     cannot trap the dialog inside its stacking context.
 *   - Escape key closes (window-scoped listener while open).
 *   - Focus trap: Tab and Shift+Tab cycle inside the dialog,
 *     focus restores to the trigger when the dialog closes.
 *   - role="dialog" + aria-modal="true" + aria-labelledby pointing
 *     at the title so screen readers announce the surface.
 *   - Counted body scroll lock: closing one modal while another
 *     is open does not unlock the body.
 *   - Hover uses e.currentTarget so the SVG child inside the close
 *     button does not eat the style mutation.
 */

let scrollLockCount = 0;

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function lockBody() {
  scrollLockCount += 1;
  if (scrollLockCount === 1) document.body.style.overflow = 'hidden';
}
function unlockBody() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) document.body.style.overflow = '';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  footer,
  initialFocusRef,
  closeOnBackdrop = true,
}) {
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const titleId = `modal-title-${useId()}`;

  // Capture the trigger element so focus can return on close.
  useEffect(() => {
    if (isOpen) triggerRef.current = document.activeElement;
  }, [isOpen]);

  // Body scroll lock with refcount so nested modals do not leak.
  useEffect(() => {
    if (!isOpen) return undefined;
    lockBody();
    return () => unlockBody();
  }, [isOpen]);

  // Auto-focus the first sensible element when the dialog opens.
  useEffect(() => {
    if (!isOpen) return;
    // One tick to let the children mount.
    const id = setTimeout(() => {
      const root = dialogRef.current;
      if (!root) return;
      if (initialFocusRef?.current && root.contains(initialFocusRef.current)) {
        initialFocusRef.current.focus();
        return;
      }
      const first = root.querySelector(FOCUSABLE_SELECTOR);
      if (first) first.focus();
      else root.focus();
    }, 0);
    return () => clearTimeout(id);
  }, [isOpen, initialFocusRef]);

  // Focus restore on close.
  useEffect(() => {
    if (isOpen) return undefined;
    return () => {
      if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
        triggerRef.current.focus();
      }
    };
  }, [isOpen]);

  // Escape closes; Tab is trapped within the dialog.
  const handleKey = useCallback((e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose?.();
      return;
    }
    if (e.key !== 'Tab') return;
    const root = dialogRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR))
      .filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (nodes.length === 0) {
      e.preventDefault();
      root.focus();
      return;
    }
    const first = nodes[0];
    const last  = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, handleKey]);

  const widthMap = { sm: 440, md: 560, lg: 720, xl: 900 };

  const body = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeOnBackdrop ? onClose : undefined}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--bg-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24,
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-primary)',
              width: '100%',
              maxWidth: widthMap[size],
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              outline: 'none',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-primary)',
            }}>
              <div>
                <h2 id={titleId} style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {title}
                </h2>
                {subtitle && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                style={{
                  padding: 6,
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                onFocus={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; }}
                onBlur={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div style={{
              padding: 24,
              overflowY: 'auto',
              flex: 1,
            }}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-primary)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
              }}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render into document.body so ancestor stacking contexts cannot
  // trap the overlay. Skips the portal during SSR; the host today
  // is a Vite SPA, but the guard keeps the component portable.
  if (typeof document === 'undefined') return null;
  return createPortal(body, document.body);
}
