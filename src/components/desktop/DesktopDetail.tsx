import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDesktopStore } from '@/store/desktopStore';
import StatusIndicator from '@/components/common/StatusIndicator';
import Modal from '@/components/common/Modal';
import { toast } from '@/components/common/Toast';
import { theme, cardStyle, detailRowStyle, secondaryBtnStyle } from '@/theme';

const DesktopDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    desktops,
    powerInfo,
    desktopConfig,
    billingInfo,
    restorePoints,
    loading,
    fetchPowerInfo,
    fetchDesktopConfig,
    fetchBillingInfo,
    fetchRestorePoints,
    powerAction,
    resetPassword,
  } = useDesktopStore();

  const desktop = desktops.find((d) => d.id === id);
  const [showResetPwd, setShowResetPwd] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showRestorePoint, setShowRestorePoint] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPowerInfo(id);
      fetchDesktopConfig(id);
      fetchBillingInfo(id);
      fetchRestorePoints(id);
    }
  }, [id]);

  if (!desktop) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: theme.textTertiary }}>
        桌面未找到
      </div>
    );
  }

  const pwrInfo = powerInfo[desktop.id];
  const config = desktopConfig[desktop.id];
  const billing = billingInfo[desktop.id];

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.warning('密码长度至少6位');
      return;
    }
    try {
      await resetPassword(desktop.id, newPassword);
      toast.success('密码重置成功');
      setShowResetPwd(false);
      setNewPassword('');
    } catch {
      toast.error('密码重置失败');
    }
  };

  const sectionStyle: React.CSSProperties = {
    ...cardStyle,
    padding: 20,
    marginBottom: 16,
  };

  const containerStyle: React.CSSProperties = {
    padding: '24px 32px', height: '100%', overflow: 'auto',
    maxWidth: 900, margin: '0 auto',
  };

  const powerActions = [
    { action: 'start' as const, label: '开机', icon: '▶', color: '#19BE6B' },
    { action: 'stop' as const, label: '关机', icon: '⏹', color: '#FF4D4F' },
    { action: 'restart' as const, label: '重启', icon: '🔄', color: '#F5A623' },
    { action: 'suspend' as const, label: '休眠', icon: '💤', color: '#1871FF' },
  ];

  return (
    <div style={containerStyle}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none', border: 'none', color: theme.primary,
          fontSize: 14, cursor: 'pointer', marginBottom: 16, padding: 0,
        }}
      >
        ← 返回桌面列表
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <span style={{ fontSize: 40 }}>💻</span>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: theme.textPrimary }}>{desktop.name}</h1>
          <div style={{ marginTop: 4 }}>
            <StatusIndicator status={desktop.status} />
          </div>
        </div>
      </div>

      {/* Power Actions */}
      <div style={{ ...sectionStyle, padding: 16 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, color: theme.textTertiary }}>电源管理</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {powerActions.map(({ action, label, icon, color }) => (
            <button
              key={action}
              onClick={() => powerAction(desktop.id, action)}
              style={{
                flex: 1, padding: '10px', background: theme.bgPage,
                border: `1px solid ${color}30`, borderRadius: 8, color,
                fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 6,
              }}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>
        {pwrInfo && (
          <div style={{ marginTop: 12, fontSize: 13, color: theme.textTertiary }}>
            运行时长：{Math.floor((pwrInfo.uptime || 0) / 3600)}小时 | 上次操作：{pwrInfo.lastAction}
          </div>
        )}
      </div>

      {/* 基础信息 */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, color: theme.textTertiary }}>基础信息</h3>
        <div style={detailRowStyle}><span style={{ color: theme.textTertiary }}>桌面 ID</span><span style={{ color: theme.textSecondary }}>{desktop.id}</span></div>
        <div style={detailRowStyle}><span style={{ color: theme.textTertiary }}>操作系统</span><span style={{ color: theme.textSecondary }}>{desktop.osName}</span></div>
        <div style={detailRowStyle}><span style={{ color: theme.textTertiary }}>所属区域</span><span style={{ color: theme.textSecondary }}>{desktop.region || '-'}</span></div>
        <div style={detailRowStyle}><span style={{ color: theme.textTertiary }}>创建时间</span><span style={{ color: theme.textSecondary }}>{new Date(desktop.createdAt).toLocaleString('zh-CN')}</span></div>
        {desktop.expiredAt && (
          <div style={detailRowStyle}><span style={{ color: theme.textTertiary }}>到期时间</span><span style={{ color: '#F5A623' }}>{new Date(desktop.expiredAt).toLocaleString('zh-CN')}</span></div>
        )}
      </div>

      {/* 配置信息 */}
      {config && (
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14, color: theme.textTertiary }}>配置信息</h3>
          <div style={detailRowStyle}><span style={{ color: theme.textTertiary }}>CPU</span><span style={{ color: theme.textSecondary }}>{config.cpu} vCPU</span></div>
          <div style={detailRowStyle}><span style={{ color: theme.textTertiary }}>内存</span><span style={{ color: theme.textSecondary }}>{config.memory} GB</span></div>
          <div style={detailRowStyle}><span style={{ color: theme.textTertiary }}>系统盘</span><span style={{ color: theme.textSecondary }}>{config.diskSize} GB</span></div>
          <div style={detailRowStyle}><span style={{ color: theme.textTertiary }}>带宽</span><span style={{ color: theme.textSecondary }}>{config.bandwidth} Mbps</span></div>
        </div>
      )}

      {/* 计费信息 */}
      {billing && (
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14, color: theme.textTertiary }}>计费信息</h3>
          <div style={detailRowStyle}><span style={{ color: theme.textTertiary }}>计费模式</span><span style={{ color: theme.textSecondary }}>{billing.chargingMode === 'postpaid' ? '按量付费' : billing.chargingMode === 'prepaid' ? '包年包月' : '按月'}</span></div>
          <div style={detailRowStyle}><span style={{ color: theme.textTertiary }}>单价</span><span style={{ color: theme.textSecondary }}>¥{billing.price}/小时</span></div>
          <div style={detailRowStyle}><span style={{ color: theme.textTertiary }}>已消费</span><span style={{ color: theme.textSecondary }}>¥{billing.totalSpent}</span></div>
          <div style={detailRowStyle}><span style={{ color: theme.textTertiary }}>预计月消费</span><span style={{ color: '#F5A623' }}>¥{billing.estimatedMonthly}/月</span></div>
        </div>
      )}

      {/* Actions Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setShowResetPwd(true)}
          style={secondaryBtnStyle}
        >
          重置密码
        </button>
        <button
          onClick={() => setShowRestorePoint(true)}
          style={secondaryBtnStyle}
        >
          还原点管理
        </button>
      </div>

      {/* Reset Password Modal */}
      <Modal
        open={showResetPwd}
        title="重置桌面密码"
        onClose={() => { setShowResetPwd(false); setNewPassword(''); }}
        footer={
          <>
            <button onClick={() => setShowResetPwd(false)}
              style={{ padding: '8px 20px', background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textTertiary, cursor: 'pointer' }}>
              取消
            </button>
            <button onClick={handleResetPassword}
              style={{ padding: '8px 20px', background: theme.gradientPrimary, border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer' }}>
              确认重置
            </button>
          </>
        }
      >
        <p style={{ color: theme.textTertiary, fontSize: 13, marginBottom: 12 }}>设置新的桌面登录密码</p>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="输入新密码（至少6位）"
          style={{
            width: '100%', padding: '10px 14px', background: theme.bgInput,
            border: `1px solid ${theme.borderInput}`, borderRadius: 6, color: theme.textPrimary, fontSize: 14,
          }}
        />
      </Modal>

      {/* Restore Points Modal */}
      <Modal
        open={showRestorePoint}
        title="还原点管理"
        onClose={() => setShowRestorePoint(false)}
      >
        {restorePoints.length === 0 ? (
          <p style={{ color: theme.textTertiary, textAlign: 'center', padding: 20 }}>暂无还原点</p>
        ) : (
          restorePoints.map((rp) => (
            <div key={rp.id} style={{ padding: '12px 0', borderBottom: `1px solid ${theme.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: theme.textPrimary, fontSize: 14 }}>{rp.name}</div>
                <div style={{ color: theme.textTertiary, fontSize: 12 }}>{new Date(rp.createdAt).toLocaleString('zh-CN')} · {rp.size}MB</div>
              </div>
              <button style={{ padding: '6px 12px', background: theme.primaryLight, border: `1px solid ${theme.primary}40`, borderRadius: 6, color: theme.primary, fontSize: 12, cursor: 'pointer' }}>
                恢复
              </button>
            </div>
          ))
        )}
      </Modal>
    </div>
  );
};

export default DesktopDetail;
