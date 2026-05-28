import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Settings as SettingsIcon,
  User,
  Menu,
} from 'lucide-react';

const crumbMap = {
  '/':                'Dashboard',
  '/projects':        'Projects',
  '/markup':          'Markup',
  '/system-library':  'System library',
  '/catalog':         'Symbol catalog',
  '/vendors':         'Vendors',
  '/admin':           'Audit log',
  '/settings':        'Settings',
  '/profile':         'Profile',
};

const sectionFor = (path) => {
  if (path.startsWith('/admin') || path.startsWith('/settings') || path.startsWith('/profile')) return 'System';
  if (path.startsWith('/system-library') || path.startsWith('/catalog') || path.startsWith('/vendors')) return 'Library';
  return 'Operations';
};

const envBadge = (() => {
  if (typeof window === 'undefined') return 'LOCAL';
  const host = window.location.hostname;
  if (host === 'localhost' || host.startsWith('127.')) return 'DEV';
  if (host.includes('preview') || host.includes('vercel.app')) return 'PREV';
  return 'PROD';
})();

export default function Header({ onMobileMenuToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const current = crumbMap[location.pathname]
    || crumbMap[Object.keys(crumbMap).find((k) => k !== '/' && location.pathname.startsWith(k))]
    || 'Page';
  const section = sectionFor(location.pathname);

  const openCmd = () => {
    const evt = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
    document.dispatchEvent(evt);
  };

  return (
    <header className="xact-topbar" role="banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="xact-icon-btn mobile-menu-btn"
          aria-label="Open menu"
          style={{ display: 'none' }}
        >
          <Menu size={16} />
        </button>

        <div className="xact-nav-history" role="group" aria-label="History">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            title="Back (Alt+Left)"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => navigate(1)}
            aria-label="Forward"
            title="Forward (Alt+Right)"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <nav className="xact-crumbs" aria-label="Breadcrumb">
          <span>XACT</span>
          <span className="xact-crumb-sep">/</span>
          <span>{section}</span>
          <span className="xact-crumb-sep">/</span>
          <span className="cur">{current}</span>
          <span className="xact-env" title="Environment">{envBadge}</span>
        </nav>
      </div>

      <button
        type="button"
        onClick={openCmd}
        className="xact-search"
        aria-label="Open command palette"
      >
        <span className="xact-search-ic"><Search size={14} /></span>
        <span className="xact-search-txt">Search jobs, products, palettes…</span>
        <span className="xact-kbd">⌘ K</span>
      </button>

      <div className="xact-top-actions">
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
            className="xact-icon-btn"
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <Bell size={15} />
            <span className="xact-icon-btn-dot" aria-hidden="true" />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                role="dialog"
                aria-label="Notifications"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.14 }}
                style={popoverStyle()}
              >
                <div style={popoverHd()}>
                  <span style={{ fontFamily: 'var(--geist-font-mono)', fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--geist-fg-3)' }}>
                    Notifications
                  </span>
                  <button
                    type="button"
                    onClick={() => setNotifOpen(false)}
                    style={{ fontSize: 12, color: 'var(--geist-accent)', fontWeight: 600 }}
                  >
                    Close
                  </button>
                </div>
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--geist-fg-3)', fontSize: 12.5 }}>
                  No new notifications
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
            aria-expanded={profileOpen}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 8px 4px 4px',
              border: '1px solid var(--geist-border)',
              background: 'var(--geist-bg)',
              color: 'inherit',
              cursor: 'pointer',
              transition: 'background var(--geist-duration-fast) var(--geist-easing)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--geist-bg-2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--geist-bg)'}
          >
            <span style={{
              width: 28,
              height: 28,
              display: 'grid',
              placeItems: 'center',
              background: 'var(--geist-fg)',
              color: 'var(--geist-bg)',
              fontFamily: 'var(--geist-font-mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}>
              PE
            </span>
            <span style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>Estimator</span>
              <span style={{ display: 'block', fontSize: 10, color: 'var(--geist-fg-3)', fontFamily: 'var(--geist-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Senior</span>
            </span>
            <ChevronDown size={12} style={{ color: 'var(--geist-fg-3)' }} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.14 }}
                style={popoverStyle()}
              >
                <MenuRow icon={User}         label="Profile"  onClick={() => { setProfileOpen(false); navigate('/profile'); }} />
                <MenuRow icon={SettingsIcon} label="Settings" onClick={() => { setProfileOpen(false); navigate('/settings'); }} />
                <div style={{ height: 1, background: 'var(--geist-border)', margin: '4px 0' }} />
                <MenuRow icon={LogOut}       label="Sign out" tone="danger" onClick={() => { setProfileOpen(false); navigate('/login'); }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function MenuRow({ icon: Icon, label, onClick, tone }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitem"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        width: '100%',
        background: 'transparent',
        border: 0,
        color: tone === 'danger' ? 'var(--geist-error)' : 'var(--geist-fg)',
        fontSize: 13,
        cursor: 'pointer',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--geist-bg-2)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function popoverStyle() {
  return {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 8,
    width: 280,
    background: 'var(--geist-bg)',
    border: '1px solid var(--geist-border)',
    boxShadow: 'var(--geist-shadow-md)',
    padding: 6,
    zIndex: 100,
  };
}

function popoverHd() {
  return {
    padding: '10px 12px 8px',
    borderBottom: '1px solid var(--geist-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };
}
