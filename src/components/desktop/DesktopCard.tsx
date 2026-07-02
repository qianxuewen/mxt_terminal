import React from 'react';
import type { CloudDesktop } from '@/types';
import StatusIndicator from '@/components/common/StatusIndicator';

interface DesktopCardProps {
  desktop: CloudDesktop;
  onConnect: (desktop: CloudDesktop) => void;
  onPowerAction: (desktop: CloudDesktop, action: 'start' | 'stop' | 'restart' | 'suspend') => void;
  onSettings: (desktop: CloudDesktop) => void;
}

const OS_ICONS: Record<string, string> = {
  windows: '🪟',
  linux: '🐧',
  ubuntu: '🐧',
  centos: '🐧',
};

const DesktopCard: React.FC<DesktopCardProps> = ({ desktop, onConnect, onPowerAction, onSettings }) => {
  const handleConnect = () => {
    if (desktop.status === 'running') {
      onConnect(desktop);
    }
  };

  const osIcon = OS_ICONS[desktop.osType] || '💻';
  const isRunning = desktop.status === 'running';

  return (
    <div
      style={{
        background: 'rgba(26, 26, 46, 0.9)',
        borderRadius: 12,
        border: `1px solid ${isRunning ? 'rgba(82, 196, 26, 0.2)' : 'rgba(255,255,255,0.06)'}`,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: isRunning ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <span style={{ fontSize: 28 }}>{osIcon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {desktop.name}
          </h3>
          <div style={{ marginTop: 4 }}>
            <StatusIndicator status={desktop.status} size="small" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 20px' }}>
        <SpecRow label="操作系统" value={desktop.osName} />
        <SpecRow label="配置" value={`${desktop.cpu} vCPU / ${desktop.memory}GB / ${desktop.diskSize}GB`} />
        <SpecRow label="区域" value={desktop.region || '-'} />
        {isRunning && (
          <SpecRow label="连接地址" value={`${desktop.ipAddress}:${desktop.spicePort}`} />
        )}
      </div>

      {/* Actions */}
      <div
        style={{
          padding: '12px 20px',
          display: 'flex',
          gap: 8,
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {isRunning ? (
          <ActionButton primary onClick={handleConnect}>
            连接桌面
          </ActionButton>
        ) : (
          <ActionButton onClick={() => onPowerAction(desktop, 'start')}>
            开机
          </ActionButton>
        )}

        {isRunning && (
          <ActionButton onClick={() => onPowerAction(desktop, 'stop')}>
            关机
          </ActionButton>
        )}

        <ActionButton onClick={() => onSettings(desktop)}>
          设置
        </ActionButton>
      </div>
    </div>
  );
};

/** 规格行 */
const SpecRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
    <span style={{ color: '#888' }}>{label}</span>
    <span style={{ color: '#ccc' }}>{value}</span>
  </div>
);

/** 操作按钮 */
const ActionButton: React.FC<{ primary?: boolean; onClick: () => void; children: React.ReactNode }> = ({
  primary,
  onClick,
  children,
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    style={{
      flex: 1,
      padding: '6px 12px',
      background: primary
        ? 'linear-gradient(135deg, #4a6cf7, #6a3de8)'
        : 'rgba(255,255,255,0.04)',
      border: primary ? 'none' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: 6,
      color: primary ? '#fff' : '#ccc',
      fontSize: 13,
      cursor: 'pointer',
      transition: 'all 0.2s',
    }}
  >
    {children}
  </button>
);

export default DesktopCard;
