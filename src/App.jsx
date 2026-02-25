import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CommandPalette from './components/common/CommandPalette';
import Dashboard from './pages/Dashboard';
import Opportunities from './pages/Opportunities';
import Projects from './pages/Projects';
import Takeoff from './pages/Takeoff';
import Estimates from './pages/Estimates';
import Proposals from './pages/Proposals';
import PriceBook from './pages/PriceBook';
import Vendors from './pages/Vendors';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Help from './pages/Help';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';

const authRoutes = ['/login', '/register', '/forgot-password'];

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
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<Projects />} />
            <Route path="/takeoff" element={<Takeoff />} />
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
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
