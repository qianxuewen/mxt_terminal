import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoginPage from '@/components/auth/LoginPage';
import DesktopList from '@/components/desktop/DesktopList';
import DesktopDetail from '@/components/desktop/DesktopDetail';
import ConnectionView from '@/components/connection/ConnectionView';
import Settings from '@/components/settings/Settings';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import ToastContainer from '@/components/common/Toast';
import { toast } from '@/components/common/Toast';

/** Protected route wrapper */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/** Main layout with sidebar */
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const navItems = [
    { path: '/', icon: '🖥', label: '云桌面' },
    { path: '/security', icon: '🔒', label: '安全中心' },
    { path: '/settings', icon: '⚙', label: '设置' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a14' }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarCollapsed ? 64 : 220,
          background: 'rgba(16, 16, 30, 0.95)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #4a6cf7, #6a3de8)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}
          >
            ☁
          </div>
          {!sidebarCollapsed && (
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap' }}>云终端</span>
          )}
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '8px' }}>
          {navItems.map(({ path, icon, label }) => (
            <div
              key={path}
              onClick={() => navigate(path)}
              style={{
                padding: '10px 12px', marginBottom: 2, borderRadius: 8, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                background: isActive(path) ? 'rgba(74,108,247,0.15)' : 'transparent',
                color: isActive(path) ? '#4a6cf7' : '#999',
                fontSize: 14, transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (!isActive(path)) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={(e) => { if (!isActive(path)) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 18 }}>{icon}</span>
              {!sidebarCollapsed && <span>{label}</span>}
            </div>
          ))}
        </div>

        {/* User info */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              padding: '8px', borderRadius: 8,
            }}
            onClick={() => navigate('/settings')}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4a6cf7, #6a3de8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 'bold', flexShrink: 0,
            }}>
              {user?.displayName?.[0] || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.displayName || '用户'}
                </div>
                <div style={{ color: '#666', fontSize: 11 }}>{user?.organizationName || ''}</div>
              </div>
            )}
          </div>

          {/* Collapse button */}
          <div
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ textAlign: 'center', padding: '4px', cursor: 'pointer', color: '#666', fontSize: 12, marginTop: 4 }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
};

/** App entry component */
const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuthStore();

  // Check stored auth
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
    // Auth store handles rehydration on login
  }, []);

  return (
    <>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        } />

        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <DesktopList />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/desktop/:id" element={
          <ProtectedRoute>
            <ConnectionView />
          </ProtectedRoute>
        } />

        <Route path="/desktop/:id/settings" element={
          <ProtectedRoute>
            <MainLayout>
              <DesktopDetail />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/security" element={
          <ProtectedRoute>
            <MainLayout>
              <SecurityDashboard />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer />
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
