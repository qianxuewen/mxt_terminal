import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import LoginPage from '@/components/auth/LoginPage';
import DesktopList from '@/components/desktop/DesktopList';
import DesktopDetail from '@/components/desktop/DesktopDetail';
import ConnectionView from '@/components/connection/ConnectionView';
import Settings from '@/components/settings/Settings';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import ToastContainer from '@/components/common/Toast';
import { toast } from '@/components/common/Toast';
import { theme } from '@/theme';

/** Protected route wrapper */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/** Main layout with sidebar - TP-LINK style dark blue sidebar */
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const navItems = isAuthenticated
    ? [
        { path: '/', icon: '🖥', label: '云桌面' },
        { path: '/security', icon: '🔒', label: '安全中心' },
        { path: '/settings', icon: '⚙', label: '设置' },
      ]
    : [
        { path: '/settings', icon: '⚙', label: '设置' },
      ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: theme.bgPage }}>
      {/* Sidebar - TP-LINK deep blue */}
      <div
        style={{
          width: sidebarCollapsed ? 64 : 220,
          background: theme.gradientSidebar,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '20px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              width: 36, height: 36,
              background: theme.gradientLogo,
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
              boxShadow: '0 4px 12px rgba(24,113,255,0.3)',
            }}
          >
            ☁
          </div>
          {!sidebarCollapsed && (
            <div>
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap' }}>TP-LINK 云终端</span>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 1 }}>TP-LINK Cloud Terminal</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(({ path, icon, label }) => (
            <div
              key={path}
              onClick={() => navigate(path)}
              style={{
                padding: '12px 14px', marginBottom: 2, borderRadius: 8, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                background: isActive(path) ? theme.bgSidebarActive : 'transparent',
                color: isActive(path) ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                fontSize: 14, fontWeight: isActive(path) ? 600 : 400,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive(path)) {
                  e.currentTarget.style.background = theme.bgSidebarHover;
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(path)) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                }
              }}
            >
              <span style={{ fontSize: 18, width: 24, textAlign: 'center', opacity: isActive(path) ? 1 : 0.7 }}>{icon}</span>
              {!sidebarCollapsed && <span>{label}</span>}
            </div>
          ))}
        </div>

        {/* User info / Device info */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {isAuthenticated ? (
            <>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                  padding: '8px', borderRadius: 8,
                }}
                onClick={() => navigate('/settings')}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: theme.gradientLogo,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 'bold', flexShrink: 0,
                  color: '#fff',
                }}>
                  {user?.displayName?.[0] || 'U'}
                </div>
                {!sidebarCollapsed && (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.displayName || '用户'}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{user?.organizationName || ''}</div>
                  </div>
                )}
              </div>
              <div
                onClick={() => { logout(); navigate('/login'); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  marginTop: 8, padding: '6px', borderRadius: 6, cursor: 'pointer',
                  color: 'rgba(255,255,255,0.5)', fontSize: 12,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#FF4D4F'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
              >
                退出登录
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                  padding: '8px', borderRadius: 8,
                }}
                onClick={() => navigate('/settings')}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>
                  ⚙
                </div>
                {!sidebarCollapsed && (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontSize: 13 }}>设备设置</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>未登录</div>
                  </div>
                )}
              </div>
              <div
                onClick={() => navigate('/login')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginTop: 8, padding: '8px', borderRadius: 8, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.08)', color: '#fff',
                  fontSize: 13, fontWeight: 500,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                🔑 登录
              </div>
            </>
          )}

          {/* Collapse button */}
          <div
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              textAlign: 'center', padding: '6px', cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4,
              borderRadius: 6,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = theme.bgSidebarHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            {sidebarCollapsed ? '▶' : '◀'}
          </div>
        </div>
      </div>

      {/* Main content - white/light background */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: theme.bgPage }}>
        {children}
      </div>
    </div>
  );
};

/** App entry component */
const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuthStore();
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  useEffect(() => { loadSettings(); }, []);

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
            <MainLayout>
              <Settings />
            </MainLayout>
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
