import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Ruler,
  Calculator,
  FileText,
  BookOpen,
  Building2,
  BarChart3,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Pencil,
  Package,
  Wrench,
} from 'lucide-react';
import XactLogo from '../common/XactLogo';

const mainNav = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/opportunities', label: 'Opportunities', icon: Users },
  { path: '/projects', label: 'Projects', icon: FolderOpen },
  { path: '/takeoff', label: 'Takeoff', icon: Ruler },
  { path: '/markup', label: 'Markup', icon: Pencil },
  { path: '/quick-estimate', label: 'Quick estimate', icon: Calculator },
  { path: '/estimates', label: 'Estimates', icon: Calculator },
  { path: '/proposals', label: 'Proposals', icon: FileText },
  { path: '/catalog', label: 'Catalog', icon: Package },
  { path: '/price-book', label: 'Price Book', icon: BookOpen },
  { path: '/vendors', label: 'Vendors', icon: Building2 },
  { path: '/servicing', label: 'Servicing', icon: Wrench },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

const bottomNav = [
  { path: '/admin', label: 'Admin', icon: Shield },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/help', label: 'Help', icon: HelpCircle },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        backgroundColor: '#0a0a0a',
        borderRight: '1px solid #1a1a1a',
        color: 'var(--text-sidebar)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-slow)',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        padding: collapsed ? '0 18px' : '0 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <XactLogo size="md" collapsed={collapsed} />
      </div>

      {/* Main Navigation */}
      <nav style={{
        flex: 1,
        padding: '12px 8px',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        <div style={{
          fontSize: '0.625rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'rgba(148,163,184,0.5)',
          padding: collapsed ? '8px 0' : '8px 12px',
          marginBottom: 4,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}>
          {!collapsed && 'Estimating'}
        </div>
        {mainNav.map((item) => (
          <SidebarLink
            key={item.path}
            item={item}
            collapsed={collapsed}
            isActive={
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path)
            }
          />
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div style={{
        padding: '8px 8px 12px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        {bottomNav.map((item) => (
          <SidebarLink
            key={item.path}
            item={item}
            collapsed={collapsed}
            isActive={location.pathname.startsWith(item.path)}
          />
        ))}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 44,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          color: 'var(--text-sidebar)',
          transition: 'all var(--transition-fast)',
          flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-sidebar-hover)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}

function SidebarLink({ item, collapsed, isActive }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: collapsed ? '10px 0' : '10px 12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 'var(--radius-md)',
        color: isActive ? 'var(--text-sidebar-active)' : 'var(--text-sidebar)',
        backgroundColor: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
        fontWeight: isActive ? 600 : 500,
        fontSize: '0.8125rem',
        transition: 'all var(--transition-fast)',
        marginBottom: 2,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textDecoration: 'none',
        position: 'relative',
      }}
      title={collapsed ? item.label : undefined}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-sidebar-hover)';
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <Icon size={18} style={{ flexShrink: 0 }} />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 2,
            height: 18,
            borderRadius: '0 2px 2px 0',
            background: 'var(--geist-accent)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </NavLink>
  );
}
