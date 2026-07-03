import React from 'react';
import type { CloudDesktop } from '@/types';
import StatusIndicator from '@/components/common/StatusIndicator';

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
      background: 'rgba(26, 26, 46, 0.9)', borderRadius: 12,
      border: `1px solid ${isRunning ? 'rgba(82, 196, 26, 0.2)' : 'rgba(255,255,255,0.06)'}`,
      overflow: 'hidden', transition: 'all 0.3s ease',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* 头部 */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>{osIcon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desktop.name}</div>
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
      <div style={{ padding: '8px 16px', display: 'flex', gap: 6, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
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
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
    <span style={{ color: '#888' }}>{label}</span>
    <span style={{ color: '#ccc' }}>{value}</span>
  </div>
);

const ActionBtn: React.FC<{ primary?: boolean; onClick: () => void; children: React.ReactNode }> = ({ primary, onClick, children }) => (
  <button onClick={(e) => { e.stopPropagation(); onClick(); }} style={{
    flex: 1, padding: '6px 12px', fontSize: 12,
    background: primary ? 'linear-gradient(135deg, #4a6cf7, #6a3de8)' : 'rgba(255,255,255,0.04)',
    border: primary ? 'none' : '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
    color: primary ? '#fff' : '#bbb', cursor: 'pointer',
  }}>{children}</button>
);

export default DesktopCard;
