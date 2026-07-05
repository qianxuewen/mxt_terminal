import { create } from 'zustand';
import type { UserInfo, AuthState, LoginRequest, MFARequest, MFASetupInfo } from '@/types';

interface AuthStore extends AuthState {
  // Pending login (for MFA flow)
  pendingCredentials: LoginRequest | null;
  // Actions
  login: (req: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  verifyMFA: (req: MFARequest) => Promise<void>;
  refreshSession: () => Promise<void>;
  updateUser: (user: Partial<UserInfo>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// Mock user for development
const MOCK_USER: UserInfo = {
  id: 'u-001',
  username: 'admin',
  displayName: '管理员',
  email: 'admin@example.com',
  phone: '13800138000',
  role: 'admin',
  organizationId: '',
  organizationName: '',
  permissions: ['desktop:*', 'settings:*', 'admin:*'],
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  mfaRequired: false,
  mfaSessionId: null,
  pendingCredentials: null,

  // Actions
  login: async (req: LoginRequest) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual API call
      await new Promise((r) => setTimeout(r, 1000));

      // 账号密码校验
      if (!req.username || !req.password) {
        throw new Error('请输入账号和密码');
      }
      if (req.password.length < 6) {
        throw new Error('密码错误');
      }
      // 校验：admin 为内置管理员，其它账号从已保存的凭据中匹配
      const isAdmin = req.username === 'admin' && req.password === 'admin123';
      // 检查已注册账号（从 local storage 读取）
      let registered = false;
      try {
        const raw = localStorage.getItem('login_credentials');
        if (raw) {
          const creds = JSON.parse(raw);
          const accounts = creds.accounts || (creds.username ? [{ username: creds.username, password: creds.password }] : []);
          registered = accounts.some((a: any) => a.username === req.username && a.password === req.password);
        }
      } catch {}
      if (!isAdmin && !registered) {
        set({ error: '账号或密码错误', loading: false });
        return;
      }

      // Check MFA requirement (mock)
      if (req.username === 'admin' && !req.rememberMe) {
        set({
          mfaRequired: true,
          mfaSessionId: 'session-mock-001',
          loading: false,
          pendingCredentials: req,
        });
        return;
      }

      const userInfo: UserInfo = {
        ...MOCK_USER,
        username: req.username,
        displayName: req.username,
      };

      localStorage.removeItem('logged_out');
      set({
        isAuthenticated: true,
        user: userInfo,
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        loading: false,
        error: null,
        mfaRequired: false,
        mfaSessionId: null,
      });

      // Persist auth state
      if (req.rememberMe) {
        localStorage.setItem('auth_user', JSON.stringify(userInfo));
        localStorage.setItem('auth_token', 'mock-access-token-' + Date.now());
      }
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message || '登录失败，请检查用户名和密码',
      });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      // TODO: Call logout API
      await new Promise((r) => setTimeout(r, 300));
    } finally {
      localStorage.setItem('logged_out', 'true');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      set({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
        error: null,
        mfaRequired: false,
        mfaSessionId: null,
      });
    }
  },

  verifyMFA: async (req: MFARequest) => {
    set({ loading: true, error: null });
    try {
      // TODO: Call MFA verification API
      await new Promise((r) => setTimeout(r, 800));

      if (req.code !== '123456') {
        throw new Error('验证码错误');
      }

      // Get pending credentials from initial login
      const pending = get().pendingCredentials;

      const userInfo: UserInfo = {
        ...MOCK_USER,
        username: pending?.username || 'admin',
        displayName: pending?.username || '管理员',
      };

      set({
        isAuthenticated: true,
        user: userInfo,
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        loading: false,
        error: null,
        mfaRequired: false,
        mfaSessionId: null,
        pendingCredentials: null,
      });

      localStorage.setItem('auth_user', JSON.stringify(userInfo));
      localStorage.setItem('auth_token', 'mock-access-token-' + Date.now());
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message || '验证失败',
      });
    }
  },

  refreshSession: async () => {
    try {
      // TODO: Call refresh token API
      set({ loading: false });
    } catch {
      get().logout();
    }
  },

  updateUser: (user: Partial<UserInfo>) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...user } });
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ loading }),
}));
