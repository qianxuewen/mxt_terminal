import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/common/Toast';
import { theme } from '@/theme';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, verifyMFA, loading, error, mfaRequired, mfaSessionId } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.warning('请输入用户名和密码');
      return;
    }

    try {
      await login({ username, password, rememberMe });
      // If MFA is required, the store will set mfaRequired; don't show success toast yet
      if (!useAuthStore.getState().mfaRequired) {
        toast.success('登录成功');
      }
    } catch {
      toast.error('登录失败');
    }
  };

  const handleMFA = async () => {
    if (!mfaCode || mfaCode.length !== 6) {
      toast.warning('请输入完整的6位验证码');
      return;
    }
    try {
      await verifyMFA({
        sessionId: mfaSessionId || '',
        method: 'totp',
        code: mfaCode,
      });
      toast.success('验证通过，登录成功');
    } catch {
      toast.error('验证失败');
    }
  };

  const containerStyle: React.CSSProperties = {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${theme.bgPage} 0%, #E8F0FE 50%, ${theme.bgPage} 100%)`,
    position: 'relative',
    overflow: 'hidden',
  };

  const cardStyle: React.CSSProperties = {
    width: 420,
    padding: '40px 32px',
    background: theme.bgCard,
    borderRadius: 16,
    border: `1px solid ${theme.border}`,
    boxShadow: theme.shadowModal,
    position: 'relative',
    zIndex: 1,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: theme.bgInput,
    border: `1px solid ${theme.borderInput}`,
    borderRadius: 8,
    color: theme.textPrimary,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    background: loading ? theme.primary : theme.gradientPrimary,
    opacity: loading ? 0.7 : 1,
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 6,
  };

  if (mfaRequired) {
    return (
      <div style={containerStyle}>
        {/* Background decorative elements */}
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(24,113,255,0.08) 0%, transparent 70%)', top: '10%', left: '20%' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(24,113,255,0.05) 0%, transparent 70%)', bottom: '20%', right: '15%' }} />

        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
            <h2 style={{ margin: '0 0 8px', color: theme.textPrimary, fontSize: 22 }}>安全验证</h2>
            <p style={{ margin: 0, color: theme.textTertiary, fontSize: 14 }}>请输入二次验证码</p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>验证码</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="请输入 6 位验证码"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              maxLength={6}
            />
          </div>

          {error && (
            <div style={{ color: '#ff4d4f', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button style={btnStyle} onClick={handleMFA} disabled={loading}>
            {loading ? '验证中...' : '验证'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Background decorative elements */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(24,113,255,0.06) 0%, transparent 70%)', top: '5%', left: '15%' }} />
      <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(24,113,255,0.04) 0%, transparent 70%)', bottom: '15%', right: '20%' }} />
      <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,100,255,0.03) 0%, transparent 70%)', top: '60%', left: '60%' }} />

      {/* 设备设置入口 */}
      <div
        onClick={() => navigate('/settings')}
        style={{
          position: 'fixed', top: 20, right: 20, zIndex: 10,
          width: 40, height: 40, borderRadius: '50%',
          background: theme.bgCard, border: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: theme.shadow,
          fontSize: 20, color: theme.textSecondary,
        }}
        title="设备设置"
      >
        ⚙
      </div>

      <div style={cardStyle}>
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto 16px',
              background: theme.gradientLogo,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              boxShadow: '0 8px 24px rgba(24,113,255,0.25)',
            }}
          >
            ☁
          </div>
          <h1 style={{ margin: 0, color: theme.textPrimary, fontSize: 24, fontWeight: 700 }}>
            TP-LINK 云终端
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>用户名</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = theme.primary)}
              onBlur={(e) => (e.target.style.borderColor = theme.borderInput)}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>密码</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = theme.primary)}
              onBlur={(e) => (e.target.style.borderColor = theme.borderInput)}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: theme.textSecondary, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: theme.primary }}
              />
              记住登录状态
            </label>
            <span style={{ color: theme.primary, fontSize: 13, cursor: 'pointer' }}>忘记密码？</span>
          </div>

          {error && (
            <div style={{ color: '#ff4d4f', fontSize: 13, marginBottom: 12, textAlign: 'center', padding: '8px 12px', background: 'rgba(255,77,79,0.06)', borderRadius: 6 }}>
              {error}
            </div>
          )}

          <button style={btnStyle} type="submit" disabled={loading}>
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>
	      </div>
    </div>
  );
};

export default LoginPage;
