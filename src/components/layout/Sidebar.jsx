import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Pencil,
  Library,
  Package,
  Building2,
  Shield,
  Settings,
  ChevronLeft,
  User,
} from 'lucide-react';

const operations = [
  { path: '/',                label: 'Dashboard',      icon: LayoutDashboard },
  { path: '/projects',        label: 'Projects',       icon: FolderOpen },
  { path: '/markup',          label: 'Markup',         icon: Pencil },
];

const library = [
  { path: '/system-library',  label: 'System library', icon: Library },
  { path: '/catalog',         label: 'Symbol catalog', icon: Package },
  { path: '/vendors',         label: 'Vendors',        icon: Building2 },
];

const system = [
  { path: '/admin',           label: 'Audit log',      icon: Shield },
  { path: '/settings',        label: 'Settings',       icon: Settings },
  { path: '/profile',         label: 'Profile',        icon: User },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <aside className={`xact-sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Primary navigation">
      <div className="xact-side-hd">
        <div className="xact-logo">
          <span className="xact-logo-mark" aria-hidden="true">X</span>
          {!collapsed && (
            <span className="xact-logo-txt">
              <span className="xact-logo-name">XACT</span>
              <span className="xact-logo-tag">Passive fire</span>
            </span>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            className="xact-collapse"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            title="Collapse sidebar (Cmd/Ctrl+B)"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      <nav className="xact-nav" aria-label="Main">
        <div className="xact-nav-section">{collapsed ? '' : 'Operations'}</div>
        {operations.map((item) => (
          <SideLink key={item.path} item={item} active={isActive(item.path)} collapsed={collapsed} />
        ))}

        <div className="xact-nav-section">{collapsed ? '' : 'Library'}</div>
        {library.map((item) => (
          <SideLink key={item.path} item={item} active={isActive(item.path)} collapsed={collapsed} />
        ))}
      </nav>

      <div className="xact-side-ft">
        {system.map((item) => (
          <SideLink key={item.path} item={item} active={isActive(item.path)} collapsed={collapsed} />
        ))}
        {collapsed && (
          <button
            type="button"
            className="xact-collapse"
            onClick={onToggle}
            aria-label="Expand sidebar"
            title="Expand sidebar (Cmd/Ctrl+B)"
            style={{ alignSelf: 'center', marginTop: 6 }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
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
    >
      <span className="xact-nav-ic"><Icon size={16} /></span>
      <span className="xact-nav-lbl">{item.label}</span>
    </NavLink>
  );
}
