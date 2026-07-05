import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/common/Toast';
import Modal from '@/components/common/Modal';
import { theme } from '@/theme';

const STORAGE_KEY = 'login_credentials';

interface SavedAccount { username: string; password: string }
interface CredentialStore { accounts: SavedAccount[]; autoLogin: boolean }

const loadCreds = (): CredentialStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.username) return { accounts: [{ username: parsed.username, password: parsed.password || '' }], autoLogin: !!parsed.autoLogin };
      return parsed;
    }
  } catch {}
  return { accounts: [], autoLogin: false };
};

const saveCreds = (store: CredentialStore) => localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, verifyMFA, loading, error, mfaRequired, mfaSessionId, isAuthenticated, clearError } = useAuthStore();

  const stored = loadCreds();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberPwd, setRememberPwd] = useState(false);
  const [autoLogin, setAutoLogin] = useState(stored.autoLogin);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(stored.accounts);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showAccountList, setShowAccountList] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regEmail, setRegEmail] = useState('');

  const persistAccounts = (accounts: SavedAccount[]) => {
    setSavedAccounts(accounts);
    saveCreds({ accounts, autoLogin });
  };

  const validate = (): boolean => {
    const errs: { username?: string; password?: string } = {};
    if (!username.trim()) errs.username = '请输入用户名';
    else if (username.trim().length < 2) errs.username = '用户名至少2个字符';
    if (!password) errs.password = '请输入密码';
    else if (password.length < 6) errs.password = '密码至少6位';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // 自动登录：仅首次打开客户端时执行
  useEffect(() => {
    if (localStorage.getItem('logged_out')) return;
    const first = savedAccounts[0];
    if (autoLogin && first?.username && first?.password && !isAuthenticated) {
      const timer = setTimeout(() => {
        login({ username: first.username, password: first.password, rememberMe: true })
          .then(() => localStorage.removeItem('logged_out'))
          .catch(() => {});
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login({ username, password, rememberMe: rememberPwd || autoLogin });
      // 保存到账号列表（最多5个）
      if (rememberPwd) {
        const updated = savedAccounts.filter(a => a.username !== username);
        updated.unshift({ username, password });
        persistAccounts(updated.slice(0, 5));
      }
      saveCreds({ accounts: savedAccounts, autoLogin });
      if (!useAuthStore.getState().mfaRequired) toast.success('登录成功');
    } catch (err: any) {
      toast.error(err?.message || '登录失败');
    }
  };

  const handleMFA = async () => {
    if (!mfaCode || mfaCode.length !== 6) { toast.warning('请输入完整的6位验证码'); return; }
    try {
      await verifyMFA({ sessionId: mfaSessionId || '', method: 'totp', code: mfaCode });
      toast.success('验证通过，登录成功');
    } catch { toast.error('验证失败'); }
  };

  // 选择已保存的账号 → 自动填入账号密码 + 勾选记住密码
  const selectAccount = (acc: SavedAccount) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setRememberPwd(true);
    setShowAccountList(false);
    setErrors({});
    clearError();
  };

  // 删除已保存的账号
  const deleteAccount = (usr: string) => {
    const updated = savedAccounts.filter(a => a.username !== usr);
    persistAccounts(updated);
    setShowDeleteConfirm(null);
    if (username === usr) { setUsername(''); setPassword(''); }
    toast.success('已删除账号');
  };

  // 自动填入最近登录的账号密码
  useEffect(() => {
    if (savedAccounts.length > 0 && savedAccounts[0].username && !username) {
      setUsername(savedAccounts[0].username);
      setPassword(savedAccounts[0].password);
    }
  }, []);

  // 输入新账号时清空密码和错误提示
  const handleUsernameChange = (val: string) => {
    setPassword('');
    setUsername(val);
    setErrors(e => ({ ...e, username: undefined }));
    clearError();
  };

  // 创建账号
  const handleRegister = async () => {
    if (!regUsername || !regPassword || !regConfirm) { toast.warning('请填写完整信息'); return; }
    if (regPassword.length < 6) { toast.warning('密码至少6位'); return; }
    if (regPassword !== regConfirm) { toast.warning('两次输入的密码不一致'); return; }
    if (regEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) { toast.warning('邮箱格式不正确'); return; }
    // 模拟注册
    await new Promise(r => setTimeout(r, 500));
    // 将新账号保存到凭据列表
    const updated = savedAccounts.filter(a => a.username !== regUsername);
    updated.unshift({ username: regUsername, password: regPassword });
    persistAccounts(updated.slice(0, 5));
    // 填入登录表单
    setUsername(regUsername);
    setPassword(regPassword);
    setRememberPwd(true);
    setShowRegister(false);
    setRegUsername(''); setRegPassword(''); setRegConfirm(''); setRegEmail('');
    toast.success('账号创建成功，请登录');
  };

  const containerStyle: React.CSSProperties = {
    height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: `linear-gradient(135deg, ${theme.bgPage} 0%, #E8F0FE 50%, ${theme.bgPage} 100%)`,
    position: 'relative', overflow: 'hidden',
  };

  const cardStyle: React.CSSProperties = {
    width: 420, padding: '40px 32px', background: theme.bgCard, borderRadius: 16,
    border: `1px solid ${theme.border}`, boxShadow: theme.shadowModal, position: 'relative', zIndex: 1,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', background: theme.bgInput,
    border: `1px solid ${theme.borderInput}`, borderRadius: 8, color: theme.textPrimary,
    fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
  };

  const btnStyle: React.CSSProperties = {
    width: '100%', padding: '12px', background: loading ? theme.primary : theme.gradientPrimary,
    opacity: loading ? 0.7 : 1, border: 'none', borderRadius: 8, color: '#fff',
    fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, color: theme.textSecondary, marginBottom: 6,
  };

  if (mfaRequired) {
    return (
      <div style={containerStyle}>
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
            <input style={inputStyle} type="text" placeholder="请输入 6 位验证码" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} maxLength={6} />
          </div>
          {error && <div style={{ color: '#ff4d4f', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</div>}
          <button style={btnStyle} onClick={handleMFA} disabled={loading}>{loading ? '验证中...' : '验证'}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(24,113,255,0.06) 0%, transparent 70%)', top: '5%', left: '15%' }} />
      <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(24,113,255,0.04) 0%, transparent 70%)', bottom: '15%', right: '20%' }} />
      <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,100,255,0.03) 0%, transparent 70%)', top: '60%', left: '60%' }} />

      <div onClick={() => navigate('/settings')} style={{ position: 'fixed', top: 20, right: 20, zIndex: 10, width: 40, height: 40, borderRadius: '50%', background: theme.bgCard, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: theme.shadow, fontSize: 20, color: theme.textSecondary }} title="设备设置">⚙</div>

      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', background: theme.gradientLogo, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, boxShadow: '0 8px 24px rgba(24,113,255,0.25)' }}>☁</div>
          <h1 style={{ margin: 0, color: theme.textPrimary, fontSize: 24, fontWeight: 700 }}>TP-LINK 云终端</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <label style={labelStyle}>用户名</label>
            <div style={{ position: 'relative' }}>
              <input style={{ ...inputStyle, borderColor: errors.username ? '#FF4D4F' : theme.borderInput, paddingRight: savedAccounts.length > 0 ? 40 : 16 }}
                type="text" placeholder="请输入用户名" value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                onFocus={(e) => { clearError(); e.target.style.borderColor = errors.username ? '#FF4D4F' : theme.primary; }}
                onBlur={(e) => { setTimeout(() => { setShowAccountList(false); if (!errors.username) e.target.style.borderColor = theme.borderInput; }, 300); }}
                onClick={() => setShowAccountList(false)} />
              {savedAccounts.length > 0 && (
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: theme.textTertiary, fontSize: 12, cursor: 'pointer' }}
                  onMouseDown={() => setShowAccountList(!showAccountList)}>▼</span>
              )}
            </div>
            {errors.username && <div style={{ color: '#FF4D4F', fontSize: 12, marginTop: 4 }}>{errors.username}</div>}
            {/* 账号下拉列表 — 与输入框无缝衔接 */}
            {showAccountList && savedAccounts.length > 0 && (
              <div style={{ position: 'absolute', left: 0, right: 0, zIndex: 10, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: theme.shadowLg, maxHeight: 180, overflow: 'auto', marginTop: 2 }}>
                {savedAccounts.map((acc, idx) => (
                  <div key={acc.username}
                    onMouseDown={() => selectAccount(acc)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer', borderBottom: idx < savedAccounts.length - 1 ? `1px solid ${theme.borderLight}` : 'none', fontSize: 14 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = theme.bgCardHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <span style={{ color: theme.textPrimary }}>{acc.username}</span>
                    <span style={{ color: theme.textTertiary, fontSize: 16, cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}
                      onMouseDown={(e) => { e.stopPropagation(); setShowDeleteConfirm(acc.username); }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,77,79,0.1)'; e.currentTarget.style.color = '#FF4D4F'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textTertiary; }}
                    >🗑</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>密码</label>
            <input style={{ ...inputStyle, borderColor: errors.password ? '#FF4D4F' : theme.borderInput }} type="password" placeholder="请输入密码（至少6位）" value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(e => ({ ...e, password: undefined })); clearError(); }}
              onFocus={(e) => { clearError(); e.target.style.borderColor = errors.password ? '#FF4D4F' : theme.primary; }}
              onBlur={(e) => { if (!errors.password) e.target.style.borderColor = theme.borderInput; }} />
            {errors.password && <div style={{ color: '#FF4D4F', fontSize: 12, marginTop: 4 }}>{errors.password}</div>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: theme.textSecondary, fontSize: 13 }}>
              <input type="checkbox" checked={rememberPwd} onChange={(e) => {
                const checked = e.target.checked;
                setRememberPwd(checked);
                // 取消勾选时从已保存列表中删除当前账号
                if (!checked && username && savedAccounts.some(a => a.username === username)) {
                  const updated = savedAccounts.filter(a => a.username !== username);
                  persistAccounts(updated);
                }
              }} style={{ accentColor: theme.primary }} /> 记住密码
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: theme.textSecondary, fontSize: 13 }}>
              <input type="checkbox" checked={autoLogin} onChange={(e) => setAutoLogin(e.target.checked)} style={{ accentColor: theme.primary }} /> 自动登录
            </label>
          </div>

          {error && <div style={{ color: '#ff4d4f', fontSize: 13, marginBottom: 12, textAlign: 'center', padding: '8px 12px', background: 'rgba(255,77,79,0.06)', borderRadius: 6 }}>{error}</div>}

          <button style={btnStyle} type="submit" disabled={loading}>{loading ? '登录中...' : '登 录'}</button>
        </form>

        {/* 创建账号 */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ color: theme.textTertiary, fontSize: 13 }}>还没有账号？</span>
          <span onClick={() => setShowRegister(true)} style={{ color: theme.primary, fontSize: 13, cursor: 'pointer', marginLeft: 4 }}>创建账号</span>
        </div>
      </div>

      {/* 创建账号弹窗 */}
      <Modal open={showRegister} title="创建账号" onClose={() => setShowRegister(false)} width={420}
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => setShowRegister(false)} style={{ flex: 1, padding: '10px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textSecondary, fontSize: 14, cursor: 'pointer' }}>取消</button>
            <button onClick={handleRegister} style={{ flex: 1, padding: '10px', background: theme.gradientPrimary, border: 'none', borderRadius: 6, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>创建</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>用户名 <span style={{ color: '#FF4D4F' }}>*</span></label>
            <input style={inputStyle} type="text" placeholder="请输入用户名" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>密码 <span style={{ color: '#FF4D4F' }}>*</span></label>
            <input style={inputStyle} type="password" placeholder="至少6位" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>确认密码 <span style={{ color: '#FF4D4F' }}>*</span></label>
            <input style={inputStyle} type="password" placeholder="再次输入密码" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>邮箱（可选）</label>
            <input style={inputStyle} type="email" placeholder="用于找回密码" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
          </div>
        </div>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal open={!!showDeleteConfirm} title="删除账号" onClose={() => setShowDeleteConfirm(null)} width={360}
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => setShowDeleteConfirm(null)} style={{ flex: 1, padding: '10px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textSecondary, fontSize: 14, cursor: 'pointer' }}>取消</button>
            <button onClick={() => showDeleteConfirm && deleteAccount(showDeleteConfirm)} style={{ flex: 1, padding: '10px', background: '#FF4D4F', border: 'none', borderRadius: 6, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>确认删除</button>
          </div>
        }
      >
        <p style={{ color: theme.textSecondary, fontSize: 14 }}>确定要删除账号 <strong>{showDeleteConfirm}</strong> 的保存信息吗？</p>
      </Modal>
    </div>
  );
};

export default LoginPage;
