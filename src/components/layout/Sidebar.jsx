import { NavLink, useLocation } from 'react-router-dom';
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
  HelpCircle,
  Pencil,
  Package,
  Wrench,
} from 'lucide-react';

const estimating = [
  { path: '/',                label: 'Dashboard',       icon: LayoutDashboard },
  { path: '/opportunities',   label: 'Opportunities',   icon: Users },
  { path: '/projects',        label: 'Projects',        icon: FolderOpen },
  { path: '/takeoff',         label: 'Takeoff',         icon: Ruler },
  { path: '/markup',          label: 'Markup',          icon: Pencil },
  { path: '/quick-estimate',  label: 'Quick estimate',  icon: Calculator },
  { path: '/estimates',       label: 'Estimates',       icon: Calculator },
  { path: '/proposals',       label: 'Proposals',       icon: FileText },
];

const catalogue = [
  { path: '/catalog',         label: 'Catalog',         icon: Package },
  { path: '/price-book',      label: 'Price Book',      icon: BookOpen },
  { path: '/vendors',         label: 'Vendors',         icon: Building2 },
  { path: '/servicing',       label: 'Servicing',       icon: Wrench },
];

const insights = [
  { path: '/reports',         label: 'Reports',         icon: BarChart3 },
];

const system = [
  { path: '/admin',           label: 'Admin',           icon: Shield },
  { path: '/settings',        label: 'Settings',        icon: Settings },
  { path: '/help',            label: 'Help',            icon: HelpCircle },
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
              <span className="xact-logo-tag">Estimating · 03</span>
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
        <div className="xact-nav-section">{collapsed ? '' : 'Estimating'}</div>
        {estimating.map((item) => (
          <SideLink key={item.path} item={item} active={isActive(item.path)} collapsed={collapsed} />
        ))}

        <div className="xact-nav-section">{collapsed ? '' : 'Catalogue'}</div>
        {catalogue.map((item) => (
          <SideLink key={item.path} item={item} active={isActive(item.path)} collapsed={collapsed} />
        ))}

        <div className="xact-nav-section">{collapsed ? '' : 'Insights'}</div>
        {insights.map((item) => (
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
