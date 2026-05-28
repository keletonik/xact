import { lazy, Suspense, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CommandPalette from './components/common/CommandPalette';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

const Projects      = lazy(() => import('./pages/Projects'));
const MarkupPage    = lazy(() => import('./pages/Markup'));
const SystemLibrary = lazy(() => import('./pages/SystemLibrary'));
const Catalog       = lazy(() => import('./pages/Catalog'));
const Vendors       = lazy(() => import('./pages/Vendors'));
const Admin         = lazy(() => import('./pages/Admin'));
const Settings      = lazy(() => import('./pages/Settings'));
const Profile       = lazy(() => import('./pages/Profile'));

const authRoutes = ['/login', '/register', '/forgot-password'];

const fallback = (
  <div style={{ padding: 24, color: 'var(--color-text-tertiary, #64748b)' }}>Loading…</div>
);

export default function App() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('xact-sidebar-collapsed', false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="app-main">
        <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="app-content">
          <Suspense fallback={fallback}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<Projects />} />
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
      </div>
      <CommandPalette />
    </div>
  );
}
