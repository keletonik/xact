import { lazy, Suspense, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CommandPalette from './components/common/CommandPalette';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';

// Eagerly loaded: the default landing page + auth (small, always needed).
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Lazily loaded: every other route. Pulled in when first navigated to. This
// keeps the initial bundle small; React.lazy + Vite emits a separate chunk
// per dynamic import.
const Opportunities = lazy(() => import('./pages/Opportunities'));
const Projects = lazy(() => import('./pages/Projects'));
const Takeoff = lazy(() => import('./pages/Takeoff'));
const MarkupPage = lazy(() => import('./pages/Markup'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Servicing = lazy(() => import('./pages/Servicing'));
const QuickEstimator = lazy(() => import('./pages/QuickEstimator'));
const Estimates = lazy(() => import('./pages/Estimates'));
const Proposals = lazy(() => import('./pages/Proposals'));
const PriceBook = lazy(() => import('./pages/PriceBook'));
const Vendors = lazy(() => import('./pages/Vendors'));
const Reports = lazy(() => import('./pages/Reports'));
const Admin = lazy(() => import('./pages/Admin'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Help = lazy(() => import('./pages/Help'));
const Profile = lazy(() => import('./pages/Profile'));

const authRoutes = ['/login', '/register', '/forgot-password'];

const fallback = (
  <div style={{ padding: 24, color: 'var(--color-text-tertiary, #64748b)' }}>Loading…</div>
);

export default function App() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('evalux-sidebar-collapsed', false);
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
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="app-main" style={{
        marginLeft: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
      }}>
        <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="app-content">
          <Suspense fallback={fallback}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<Projects />} />
              <Route path="/takeoff" element={<Takeoff />} />
              <Route path="/markup" element={<MarkupPage />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/servicing" element={<Servicing />} />
              <Route path="/quick-estimate" element={<QuickEstimator />} />
              <Route path="/estimates" element={<Estimates />} />
              <Route path="/proposals" element={<Proposals />} />
              <Route path="/price-book" element={<PriceBook />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/help" element={<Help />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
