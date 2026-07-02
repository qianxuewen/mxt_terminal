import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/common/Toast';

const LoginPage: React.FC = () => {
  const { login, verifyMFA, loading, error, mfaRequired, mfaSessionId } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [organizationId, setOrganizationId] = useState('');
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
      await login({ username, password, organizationId: organizationId || undefined, rememberMe });
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
    background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0d0d2b 100%)',
    position: 'relative',
    overflow: 'hidden',
  };

  const cardStyle: React.CSSProperties = {
    width: 420,
    padding: '40px 32px',
    background: 'rgba(26, 26, 46, 0.9)',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    position: 'relative',
    zIndex: 1,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    background: loading ? 'linear-gradient(135deg, #4a6cf7, #6a3de8)' : 'linear-gradient(135deg, #4a6cf7, #6a3de8)',
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
    color: '#a0a0b8',
    marginBottom: 6,
  };

  if (mfaRequired) {
    return (
      <div style={containerStyle}>
        {/* Background decorative elements */}
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,108,247,0.15) 0%, transparent 70%)', top: '10%', left: '20%' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(106,61,232,0.1) 0%, transparent 70%)', bottom: '20%', right: '15%' }} />

        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
            <h2 style={{ margin: '0 0 8px', color: '#fff', fontSize: 22 }}>安全验证</h2>
            <p style={{ margin: 0, color: '#888', fontSize: 14 }}>请输入二次验证码</p>
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
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,108,247,0.12) 0%, transparent 70%)', top: '5%', left: '15%' }} />
      <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(106,61,232,0.08) 0%, transparent 70%)', bottom: '15%', right: '20%' }} />
      <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,255,0.06) 0%, transparent 70%)', top: '60%', left: '60%' }} />

      <div style={cardStyle}>
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #4a6cf7, #6a3de8)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              boxShadow: '0 8px 24px rgba(74,108,247,0.3)',
            }}
          >
            ☁
          </div>
          <h1 style={{ margin: '0 0 4px', color: '#fff', fontSize: 24, fontWeight: 700 }}>
            云终端
          </h1>
          <p style={{ margin: 0, color: '#888', fontSize: 14 }}>Cloud Terminal - 随时随地，云端办公</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>组织 ID（可选）</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="请输入组织 ID"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#4a6cf7')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>用户名</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#4a6cf7')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
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
              onFocus={(e) => (e.target.style.borderColor = '#4a6cf7')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
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
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#a0a0b8', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#4a6cf7' }}
              />
              记住登录状态
            </label>
            <span style={{ color: '#4a6cf7', fontSize: 13, cursor: 'pointer' }}>忘记密码？</span>
          </div>

          {error && (
            <div style={{ color: '#ff4d4f', fontSize: 13, marginBottom: 12, textAlign: 'center', padding: '8px 12px', background: 'rgba(255,77,79,0.1)', borderRadius: 6 }}>
              {error}
            </div>
          )}

          <button style={btnStyle} type="submit" disabled={loading}>
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>

        {/* SSO Login */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ color: '#666', fontSize: 12 }}>其他登录方式</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            {['SSO', 'OAuth', '企业微信'].map((method) => (
              <span
                key={method}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#a0a0b8',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
