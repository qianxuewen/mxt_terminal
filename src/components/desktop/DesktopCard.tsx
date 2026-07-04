import React from 'react';
import type { CloudDesktop } from '@/types';
import StatusIndicator from '@/components/common/StatusIndicator';
import { theme } from '@/theme';

interface DesktopCardProps {
  desktop: CloudDesktop;
  onConnect: (desktop: CloudDesktop) => void;
  onPowerAction: (desktop: CloudDesktop, action: 'start' | 'stop' | 'restart' | 'suspend') => void;
  onSettings: (desktop: CloudDesktop) => void;
}

const OS_ICONS: Record<string, string> = { windows: '🪟', linux: '🐧', ubuntu: '🐧', centos: '🐧' };

const DesktopCard: React.FC<DesktopCardProps> = ({ desktop, onConnect, onPowerAction, onSettings }) => {
  const isRunning = desktop.status === 'running';
  const osIcon = OS_ICONS[desktop.osType] || '💻';

  return (
    <div style={{
      background: theme.bgCard, borderRadius: 12,
      border: `1px solid ${isRunning ? 'rgba(24,113,255,0.15)' : theme.border}`,
      overflow: 'hidden', transition: 'all 0.25s ease',
      display: 'flex', flexDirection: 'column', height: '100%',
      boxShadow: theme.shadowCard,
    }}>
      {/* 头部 */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${theme.borderLight}` }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>{osIcon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desktop.name}</div>
          <StatusIndicator status={desktop.status} size="small" />
        </div>
      </div>

      {/* 规格 */}
      <div style={{ padding: '10px 16px', flex: 1 }}>
        <Row label="操作系统" value={desktop.osName} />
        <Row label="配置" value={`${desktop.cpu}vCPU / ${desktop.memory}GB / ${desktop.diskSize}GB`} />
        <Row label="区域" value={desktop.region || '-'} />
        {isRunning && <Row label="地址" value={`${desktop.ipAddress}:${desktop.spicePort}`} />}
      </div>

      {/* 操作 */}
      <div style={{ padding: '8px 16px', display: 'flex', gap: 6, borderTop: `1px solid ${theme.borderLight}` }}>
        {isRunning ? (
          <ActionBtn primary onClick={() => onConnect(desktop)}>连接桌面</ActionBtn>
        ) : (
          <ActionBtn onClick={() => onPowerAction(desktop, 'start')}>开机</ActionBtn>
        )}
        {isRunning && <ActionBtn onClick={() => onPowerAction(desktop, 'stop')}>关机</ActionBtn>}
        <ActionBtn onClick={() => onSettings(desktop)}>设置</ActionBtn>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, borderBottom: `1px solid ${theme.borderLight}` }}>
    <span style={{ color: theme.textTertiary }}>{label}</span>
    <span style={{ color: theme.textSecondary }}>{value}</span>
  </div>
);

const ActionBtn: React.FC<{ primary?: boolean; onClick: () => void; children: React.ReactNode }> = ({ primary, onClick, children }) => (
  <button onClick={(e) => { e.stopPropagation(); onClick(); }} style={{
    flex: 1, padding: '6px 12px', fontSize: 12,
    background: primary ? theme.gradientPrimary : theme.bgCard,
    border: primary ? 'none' : `1px solid ${theme.border}`, borderRadius: 6,
    color: primary ? '#fff' : theme.textSecondary, cursor: 'pointer',
    fontWeight: primary ? 500 : 400,
  }}>{children}</button>
);

export default DesktopCard;
