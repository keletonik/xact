import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Pencil, Library, Package, Building2,
  Shield, Settings, ChevronLeft, ChevronRight, User,
} from 'lucide-react';

const operations = [
  { path: '/',                label: 'Dashboard',      icon: LayoutDashboard, code: '01' },
  { path: '/projects',        label: 'Projects',       icon: FolderOpen,      code: '02' },
  { path: '/markup',          label: 'Markup',         icon: Pencil,          code: '03' },
];

const library = [
  { path: '/system-library',  label: 'Systems',        icon: Library,         code: '04' },
  { path: '/catalog',         label: 'Symbols',        icon: Package,         code: '05' },
  { path: '/vendors',         label: 'Vendors',        icon: Building2,       code: '06' },
];

const system = [
  { path: '/admin',           label: 'Audit',          icon: Shield,          code: '07' },
  { path: '/settings',        label: 'Settings',       icon: Settings,        code: '08' },
  { path: '/profile',         label: 'Profile',        icon: User,            code: '09' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <aside className={`xc-rail xact-sidebar ${collapsed ? 'is-collapsed collapsed' : ''}`} aria-label="Primary navigation">
      <nav className="xact-nav" aria-label="Main">
        {!collapsed && <div className="xact-nav-section">Operations</div>}
        {operations.map((item) => (
          <SideLink key={item.path} item={item} active={isActive(item.path)} collapsed={collapsed} />
        ))}

        {!collapsed && <div className="xact-nav-section">Library</div>}
        {library.map((item) => (
          <SideLink key={item.path} item={item} active={isActive(item.path)} collapsed={collapsed} />
        ))}

        {!collapsed && <div className="xact-nav-section">System</div>}
        {system.map((item) => (
          <SideLink key={item.path} item={item} active={isActive(item.path)} collapsed={collapsed} />
        ))}
      </nav>

      <div className="xc-rail-foot" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: 'var(--tracking-label)',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
          }}>
            v2 · drafted
          </span>
        )}
        <button
          type="button"
          className="xact-collapse"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title="Toggle sidebar (Cmd/Ctrl+B)"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </aside>
  );
}

function SideLink({ item, active, collapsed }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      className={`xact-nav-item ${active ? 'active' : ''}`}
      title={collapsed ? item.label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '10px 0' : '8px 16px',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="xact-nav-ic"><Icon size={16} strokeWidth={2.25} /></span>
        {!collapsed && <span className="xact-nav-lbl">{item.label}</span>}
      </span>
      {!collapsed && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.08em',
          color: 'var(--ink-4)',
        }}>
          {item.code}
        </span>
      )}
    </NavLink>
  );
}
