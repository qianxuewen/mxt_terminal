import React from 'react';
import type { DesktopStatus, ConnectionState, TransferStatus } from '@/types';

interface StatusIndicatorProps {
  status: DesktopStatus | ConnectionState | TransferStatus | string;
  size?: 'small' | 'default' | 'large';
  showLabel?: boolean;
  labelMap?: Record<string, string>;
}

const STATUS_COLORS: Record<string, string> = {
  // Desktop status
  running: '#52c41a',
  stopped: '#ff4d4f',
  suspended: '#faad14',
  starting: '#1890ff',
  stopping: '#ff7a45',
  error: '#ff4d4f',
  unknown: '#d9d9d9',
  // Connection status
  connected: '#52c41a',
  connecting: '#1890ff',
  disconnected: '#d9d9d9',
  disconnecting: '#faad14',
  // Transfer status
  completed: '#52c41a',
  transferring: '#1890ff',
  pending: '#d9d9d9',
  paused: '#faad14',
  failed: '#ff4d4f',
  cancelled: '#d9d9d9',
};

const STATUS_LABELS: Record<string, string> = {
  running: '运行中',
  stopped: '已关机',
  suspended: '已休眠',
  starting: '开机中',
  stopping: '关机中',
  error: '异常',
  unknown: '未知',
  connected: '已连接',
  connecting: '连接中',
  disconnected: '未连接',
  disconnecting: '断开中',
  completed: '已完成',
  transferring: '传输中',
  pending: '等待中',
  paused: '已暂停',
  failed: '失败',
  cancelled: '已取消',
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'default',
  showLabel = true,
  labelMap,
}) => {
  const sizeMap = { small: 6, default: 8, large: 12 };
  const dotSize = sizeMap[size] || 8;
  const color = STATUS_COLORS[status] || '#d9d9d9';
  const label = labelMap?.[status] || STATUS_LABELS[status] || status;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
          flexShrink: 0,
          boxShadow: `0 0 6px ${color}40`,
        }}
      />
      {showLabel && (
        <span style={{ fontSize: size === 'small' ? 12 : 14, color: '#e0e0e0' }}>
          {label}
        </span>
      )}
    </span>
  );
};

export default StatusIndicator;
