import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/common/Toast';
import Modal from '@/components/common/Modal';
import { theme, inputStyle, labelStyle, cardStyle } from '@/theme';

// 模拟登录设备历史
const MOCK_LOGIN_HISTORY = [
  { id: 1, device: 'Windows 桌面端', ip: '192.168.1.100', time: '2026-07-04 09:30:00', current: true },
  { id: 2, device: 'Web 浏览器 (Chrome)', ip: '192.168.1.101', time: '2026-07-03 14:20:00' },
  { id: 3, device: 'iOS 客户端', ip: '10.0.0.5', time: '2026-07-02 18:45:00' },
];

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const handleChangePassword = () => {
    if (!oldPwd || !newPwd || !confirmPwd) { toast.warning('请填写完整信息'); return; }
    if (newPwd !== confirmPwd) { toast.warning('两次输入的新密码不一致'); return; }
    if (newPwd.length < 6) { toast.warning('密码长度至少6位'); return; }
    toast.success('密码修改成功，请重新登录');
    setShowPwdModal(false);
    setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    setTimeout(() => { logout(); navigate('/login'); }, 1000);
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>账号安全</h2>

      {/* 用户信息 */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>用户信息</h3>
        <div style={{ ...cardStyle, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: theme.gradientLogo, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
              {user?.displayName?.[0] || 'U'}
            </div>
            <div>
              <div style={{ color: theme.textPrimary, fontSize: 18, fontWeight: 600 }}>{user?.displayName || '用户'}</div>
              <div style={{ color: theme.textTertiary, fontSize: 13 }}>{user?.email || ''}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={labelStyle}>用户名</label><div style={{ padding: '10px 14px', background: theme.bgInput, borderRadius: 6, color: theme.textPrimary, fontSize: 14, border: `1px solid ${theme.borderInput}` }}>{user?.username}</div></div>
            <div><label style={labelStyle}>邮箱</label><div style={{ padding: '10px 14px', background: theme.bgInput, borderRadius: 6, color: theme.textPrimary, fontSize: 14, border: `1px solid ${theme.borderInput}` }}>{user?.email || '未绑定'}</div></div>
            <div><label style={labelStyle}>手机号</label><div style={{ padding: '10px 14px', background: theme.bgInput, borderRadius: 6, color: theme.textPrimary, fontSize: 14, border: `1px solid ${theme.borderInput}` }}>{user?.phone || '未绑定'}</div></div>
            <div><label style={labelStyle}>组织</label><div style={{ padding: '10px 14px', background: theme.bgInput, borderRadius: 6, color: theme.textPrimary, fontSize: 14, border: `1px solid ${theme.borderInput}` }}>{user?.organizationName || '-'}</div></div>
          </div>
        </div>
      </div>

      {/* 安全设置 */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>安全设置</h3>
        <div style={{ ...cardStyle, padding: 20 }}>
          <button onClick={() => setShowPwdModal(true)} style={{ padding: '10px 24px', background: theme.primaryLight, border: `1px solid ${theme.primary}40`, borderRadius: 8, color: theme.primary, fontSize: 14, cursor: 'pointer' }}>
            修改密码
          </button>
        </div>
      </div>

      {/* 登录设备 */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>登录设备</h3>
        <div style={{ ...cardStyle, padding: 4 }}>
          {MOCK_LOGIN_HISTORY.map((d, i) => (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderTop: i > 0 ? `1px solid ${theme.borderLight}` : 'none',
            }}>
              <span style={{ fontSize: 20 }}>💻</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: theme.textPrimary, fontSize: 14 }}>{d.device}</span>
                  {(d as any).current && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: 'rgba(25,190,107,0.1)', color: theme.success }}>当前</span>}
                </div>
                <div style={{ color: theme.textTertiary, fontSize: 12, marginTop: 2 }}>{d.ip} · {d.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 修改密码弹窗 */}
      <Modal open={showPwdModal} title="修改密码" onClose={() => setShowPwdModal(false)} width={420}
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => setShowPwdModal(false)} style={{ flex: 1, padding: '10px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textSecondary, fontSize: 14, cursor: 'pointer' }}>取消</button>
            <button onClick={handleChangePassword} style={{ flex: 1, padding: '10px', background: theme.gradientPrimary, border: 'none', borderRadius: 6, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>确认修改</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>当前密码</label>
            <input style={inputStyle} type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} placeholder="输入当前密码" />
          </div>
          <div>
            <label style={labelStyle}>新密码</label>
            <input style={inputStyle} type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="至少6位" />
          </div>
          <div>
            <label style={labelStyle}>确认新密码</label>
            <input style={inputStyle} type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="再次输入新密码" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountSettings;
