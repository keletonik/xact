import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const breadcrumbMap = {
  '/': 'Dashboard',
  '/opportunities': 'Opportunities',
  '/projects': 'Projects',
  '/takeoff': 'Takeoff',
  '/estimates': 'Estimates',
  '/proposals': 'Proposals',
  '/price-book': 'Price Book',
  '/vendors': 'Vendors',
  '/reports': 'Reports',
  '/admin': 'Admin',
  '/settings': 'Settings',
  '/help': 'Help Center',
  '/notifications': 'Notifications',
  '/profile': 'Profile',
};

export default function Header({ onMobileMenuToggle }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageTitle = breadcrumbMap[location.pathname] ||
    Object.keys(breadcrumbMap).find((key) => key !== '/' && location.pathname.startsWith(key))
      ?.replace(/^\//, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) ||
    'Page';

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: 0,
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 90,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Left: Mobile menu + Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onMobileMenuToggle}
          style={{
            display: 'none',
            padding: 8,
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
          }}
          className="mobile-menu-btn"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            {breadcrumbMap[location.pathname] || pageTitle}
          </h1>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Search Toggle */}
        <AnimatePresence>
          {showSearch && (
            <motion.input
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              type="text"
              placeholder="Search anything..."
              autoFocus
              onBlur={() => setShowSearch(false)}
              style={{
                height: 36,
                padding: '0 12px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-focus)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            />
          )}
        </AnimatePresence>

        <HeaderButton icon={Search} onClick={() => setShowSearch(!showSearch)} tooltip="Search" />

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <HeaderButton
            icon={Bell}
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            tooltip="Notifications"
          />
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  width: 360,
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-primary)',
                  boxShadow: 'var(--shadow-xl)',
                  overflow: 'hidden',
                  zIndex: 100,
                }}
              >
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Notifications</span>
                  <button
                    onClick={() => navigate('/notifications')}
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-fire-500)',
                      fontWeight: 600,
                    }}
                  >
                    View All
                  </button>
                </div>
                <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                  No new notifications
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <HeaderButton
          icon={theme === 'dark' ? Sun : Moon}
          onClick={toggleTheme}
          tooltip={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        />

        {/* Separator */}
        <div style={{
          width: 1,
          height: 24,
          backgroundColor: 'var(--border-primary)',
          margin: '0 8px',
        }} />

        {/* Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #ea580c, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>
              PE
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.3 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Estimator
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                Senior Estimator
              </div>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  width: 220,
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-primary)',
                  boxShadow: 'var(--shadow-xl)',
                  overflow: 'hidden',
                  zIndex: 100,
                }}
              >
                <div style={{ padding: 4 }}>
                  <DropdownItem icon={User} label="Profile" onClick={() => { navigate('/profile'); setShowProfile(false); }} />
                  <DropdownItem icon={Settings} label="Settings" onClick={() => { navigate('/settings'); setShowProfile(false); }} />
                  <div style={{ height: 1, backgroundColor: 'var(--border-primary)', margin: '4px 0' }} />
                  <DropdownItem icon={LogOut} label="Sign Out" onClick={() => { navigate('/login'); setShowProfile(false); }} danger />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function HeaderButton({ icon: Icon, onClick, tooltip, badge }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-secondary)',
        position: 'relative',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <Icon size={18} />
      {badge && (
        <span style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'var(--color-danger-500)',
          border: '2px solid var(--bg-primary)',
        }} />
      )}
    </button>
  );
}

function DropdownItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.8125rem',
        fontWeight: 500,
        color: danger ? 'var(--color-danger-600)' : 'var(--text-primary)',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
