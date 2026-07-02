import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from '@/components/common/Toast';

const AccountSettings: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { settings, saveSettings } = useSettingsStore();
  const acct = settings.account;

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
    background: active ? 'rgba(74,108,247,0.2)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? 'rgba(74,108,247,0.4)' : 'rgba(255,255,255,0.08)'}`,
    color: active ? '#4a6cf7' : '#999',
  });

  const handleLogout = () => {
    logout();
    toast.success('已退出登录');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 14, outline: 'none',
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#fff' }}>账户设置</h2>

      {/* User Info */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#fff' }}>用户信息</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #4a6cf7, #6a3de8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 'bold' }}>
            {user?.displayName?.[0] || 'U'}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{user?.displayName || '用户'}</div>
            <div style={{ color: '#888', fontSize: 13 }}>{user?.email || '未绑定邮箱'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>显示名称</label>
            <input style={inputStyle} defaultValue={acct.displayName || user?.displayName} placeholder="显示名称" />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>邮箱</label>
            <input style={inputStyle} defaultValue={acct.email || user?.email} placeholder="邮箱" />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>手机号</label>
            <input style={inputStyle} defaultValue={acct.phone || user?.phone} placeholder="手机号" />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>组织</label>
            <input style={{ ...inputStyle, opacity: 0.6 }} defaultValue={user?.organizationName || '-'} disabled />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#fff' }}>偏好设置</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>语言</label>
            <select style={inputStyle} value={acct.language} onChange={(e) => saveSettings({ account: { ...acct, language: e.target.value as any } })}>
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>主题</label>
            <select style={inputStyle} value={acct.theme} onChange={(e) => saveSettings({ account: { ...acct, theme: e.target.value as any } })}>
              <option value="dark">深色主题</option>
              <option value="light">浅色主题</option>
              <option value="auto">跟随系统</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button style={toggleStyle(acct.autoLogin)} onClick={() => saveSettings({ account: { ...acct, autoLogin: !acct.autoLogin } })}>自动登录</button>
          <button style={toggleStyle(acct.savePassword)} onClick={() => saveSettings({ account: { ...acct, savePassword: !acct.savePassword } })}>保存密码</button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => { saveSettings({ account: acct }); toast.success('设置已保存'); }}
          style={{ padding: '10px 32px', background: 'linear-gradient(135deg, #4a6cf7, #6a3de8)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          保存设置
        </button>
        <button onClick={handleLogout}
          style={{ padding: '10px 24px', background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.3)', borderRadius: 8, color: '#ff4d4f', fontSize: 14, cursor: 'pointer' }}>
          退出登录
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;
