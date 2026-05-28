import { lazy, Suspense, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TitleBlock from './components/draft/TitleBlock';
import KeyLegend from './components/draft/KeyLegend';
import PencilProgress from './components/draft/PencilProgress';
import CommandPalette from './components/common/CommandPalette';
import { useLocalStorage } from './hooks/useLocalStorage';
import useProjectStore from './stores/useProjectStore';
import './App.css';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

const Projects         = lazy(() => import('./pages/Projects'));
const ProjectWorkspace = lazy(() => import('./pages/ProjectWorkspace'));
const MarkupPage       = lazy(() => import('./pages/Markup'));
const SystemLibrary    = lazy(() => import('./pages/SystemLibrary'));
const Catalog          = lazy(() => import('./pages/Catalog'));
const Vendors          = lazy(() => import('./pages/Vendors'));
const Admin            = lazy(() => import('./pages/Admin'));
const Settings         = lazy(() => import('./pages/Settings'));
const Profile          = lazy(() => import('./pages/Profile'));

const authRoutes = ['/login', '/register', '/forgot-password'];

const fallback = (
  <div style={{ padding: 32 }}>
    <PencilProgress label="drafting…" />
  </div>
);

const ROUTE_META = {
  '/':                { sheet: '01', subhead: 'Dashboard',         code: 'MASTER' },
  '/projects':        { sheet: '02', subhead: 'Project register',  code: 'INDEX' },
  '/markup':          { sheet: '03', subhead: 'Plan markup',       code: 'PLAN' },
  '/system-library':  { sheet: '04', subhead: 'Tested-system library', code: 'LIB' },
  '/catalog':         { sheet: '05', subhead: 'Symbol catalogue',  code: 'SYM' },
  '/vendors':         { sheet: '06', subhead: 'Vendors',           code: 'VND' },
  '/admin':           { sheet: '07', subhead: 'Audit log',         code: 'AUD' },
  '/settings':        { sheet: '08', subhead: 'Settings',          code: 'SET' },
  '/profile':         { sheet: '09', subhead: 'Profile',           code: 'USR' },
};

const SHEET_TOTAL = 9;

function findRouteMeta(pathname) {
  if (pathname.startsWith('/projects/')) {
    return { sheet: '02·a', subhead: 'Project workspace', code: 'PROJ' };
  }
  return ROUTE_META[pathname] || { sheet: '—', subhead: '', code: '—' };
}

export default function App() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('xact-sidebar-collapsed', false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const projects = useProjectStore((s) => s.projects);

  const isAuthPage = authRoutes.includes(location.pathname);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    );
  }

  const meta = findRouteMeta(location.pathname);

  // Derive title-block meta from current route. For project workspaces
  // surface the project's own code/name/client; everything else carries
  // the route's master code.
  let titleCode = meta.code;
  let titleName = meta.subhead;
  let titleClient;
  if (location.pathname.startsWith('/projects/')) {
    const id = location.pathname.split('/')[2];
    const project = projects.find((p) => p.id === id);
    if (project) {
      titleCode = project.code;
      titleName = project.name;
      titleClient = project.client;
    }
  }

  const companyName = (typeof window !== 'undefined' && localStorage.getItem('xact-company-name')) || 'XACT passive fire';

  return (
    <div className={`xc-shell ${sidebarCollapsed ? 'is-collapsed' : ''}`}>
      <div className={`xc-sheet ${sidebarCollapsed ? 'is-collapsed' : ''}`}>
        <span className="xc-corner-bl" aria-hidden="true" />
        <span className="xc-corner-br" aria-hidden="true" />

        <TitleBlock
          code={titleCode}
          name={titleName}
          client={titleClient || companyName}
          revision="B"
          sheetN={meta.sheet}
          sheetOf={SHEET_TOTAL}
        />

        <SubHead pathname={location.pathname} />

        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="xc-main app-content">
          <Suspense fallback={fallback}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectWorkspace />} />
              <Route path="/markup" element={<MarkupPage />} />
              <Route path="/system-library" element={<SystemLibrary />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Suspense>
        </main>

        <footer className="xc-foot">
          <KeyLegend />
          <span>scale 1:100</span>
          <span>rev B</span>
          <span>
            {new Date().toLocaleDateString('en-AU', {
              day: '2-digit', month: 'short', year: 'numeric',
            }).toUpperCase()}
          </span>
          <span>sheet {meta.sheet} of {SHEET_TOTAL}</span>
        </footer>
      </div>
      <CommandPalette />
    </div>
  );
}

function SubHead({ pathname }) {
  const meta = findRouteMeta(pathname);
  return (
    <div className="xc-sub">
      <div className="xc-sub-left">
        <span className="xc-sub-em">{meta.subhead || '—'}</span>
        <span className="xc-sub-divider">·</span>
        <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 11 }}>
          {pathname}
        </span>
      </div>
      <div className="xc-sub-right">
        AS 1530.4 · AS 4072.1 · AS 1851 § 16 · 17 · 18
      </div>
    </div>
  );
}
