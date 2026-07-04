import React, { useState } from 'react';
import { toast } from '@/components/common/Toast';
import Modal from '@/components/common/Modal';
import { theme, cardStyle } from '@/theme';

const About: React.FC = () => {
  const [showReset, setShowReset] = useState(false);

  const handleFactoryReset = () => {
    setShowReset(false);
    toast.success('正在恢复出厂设置...');
    setTimeout(() => toast.success('恢复完成，终端将重启'), 2000);
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>关于此终端</h2>

      {/* Logo + 名称 */}
      <div style={{ textAlign: 'center', padding: '32px 20px', ...cardStyle, marginBottom: 24 }}>
        <div style={{
          width: 72, height: 72, margin: '0 auto 12px',
          background: theme.gradientLogo,
          borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, boxShadow: '0 12px 40px rgba(24,113,255,0.25)',
        }}>
          ☁
        </div>
        <h1 style={{ margin: '0 0 2px', fontSize: 22, fontWeight: 700, color: theme.textPrimary }}>TP-LINK 云终端</h1>
        <p style={{ margin: '0 0 2px', color: theme.textTertiary, fontSize: 13 }}>TP-LINK Cloud Terminal Client</p>
        <p style={{ margin: 0, color: theme.textTertiary, fontSize: 12 }}>软件版本 1.0.0</p>
      </div>

      {/* 终端信息 */}
      <div style={{ ...cardStyle, padding: 20, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>终端信息</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <InfoRow label="设备名称" value="TP-LINK-CT-001" />
          <InfoRow label="MAC 地址" value="A4:5E:60:12:34:56" />
          <InfoRow label="硬件版本" value="TL-CT-V2.0" />
          <InfoRow label="软件版本" value="v1.0.0 (build 20260701)" />
          <InfoRow label="序列号" value="TLCT202600001" />
          <InfoRow label="运行时间" value="3 天 12 小时" />
        </div>
      </div>

      {/* 功能特色 */}
      <div style={{ ...cardStyle, padding: 20, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>功能特色</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '🖥', label: '云桌面管理', desc: '开机/关机/重启/休眠' },
            { icon: '🔗', label: 'SPICE 协议', desc: '高性能远程桌面协议' },
            { icon: '🔌', label: '外设支持', desc: 'USB/打印机/摄像头' },
            { icon: '🔒', label: '安全保障', desc: '水印/加密/录屏审计' },
          ].map(({ icon, label, desc }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', background: theme.bgPage, borderRadius: 8 }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <div>
                <div style={{ color: theme.textPrimary, fontSize: 13, fontWeight: 500 }}>{label}</div>
                <div style={{ color: theme.textTertiary, fontSize: 11 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 恢复出厂设置 */}
      <div style={{ ...cardStyle, padding: 20, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>恢复出厂设置</h3>
        <p style={{ color: theme.textTertiary, fontSize: 12, marginBottom: 12 }}>重置所有设置到出厂状态，终端将自动重启</p>
        <button
          onClick={() => setShowReset(true)}
          style={{
            padding: '10px 24px', background: 'rgba(255,77,79,0.06)',
            border: '1px solid rgba(255,77,79,0.2)', borderRadius: 8,
            color: '#FF4D4F', fontSize: 14, cursor: 'pointer',
          }}
        >
          恢复出厂设置
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 24, color: theme.textTertiary, fontSize: 11, lineHeight: 1.8 }}>
        <p>Copyright © 2025 TP-LINK. All rights reserved.</p>
      </div>

      {/* 确认弹窗 */}
      <Modal open={showReset} title="恢复出厂设置" onClose={() => setShowReset(false)} width={400}
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => setShowReset(false)} style={{ flex: 1, padding: '10px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textSecondary, fontSize: 14, cursor: 'pointer' }}>取消</button>
            <button onClick={handleFactoryReset} style={{ flex: 1, padding: '10px', background: '#FF4D4F', border: 'none', borderRadius: 6, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>确认恢复</button>
          </div>
        }
      >
        <p style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 1.6 }}>
          此操作将重置所有设置到出厂状态，包括网络配置、接入设置、账户信息等。此操作不可撤销，终端将自动重启。
        </p>
        <p style={{ color: '#FF4D4F', fontSize: 13, fontWeight: 500 }}>确定要继续吗？</p>
      </Modal>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ padding: '8px 0', borderBottom: `1px solid ${theme.borderLight}` }}>
    <div style={{ fontSize: 11, color: theme.textTertiary, marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 14, color: theme.textPrimary, fontWeight: 500, fontFamily: label === 'MAC 地址' || label === '序列号' ? 'Consolas, monospace' : undefined }}>{value}</div>
  </div>
);

export default About;
