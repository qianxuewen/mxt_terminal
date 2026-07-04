import React from 'react';
import type { DesktopStatus, ConnectionState, TransferStatus } from '@/types';
import { theme } from '@/theme';

interface StatusIndicatorProps {
  status: DesktopStatus | ConnectionState | TransferStatus | string;
  size?: 'small' | 'default' | 'large';
  showLabel?: boolean;
  labelMap?: Record<string, string>;
}

const STATUS_COLORS: Record<string, string> = {
  // Desktop status
  running: '#19BE6B',
  stopped: '#FF4D4F',
  suspended: '#F5A623',
  starting: '#1871FF',
  stopping: '#FF7A45',
  error: '#FF4D4F',
  unknown: '#C0C8D4',
  // Connection status
  connected: '#19BE6B',
  connecting: '#1871FF',
  disconnected: '#C0C8D4',
  disconnecting: '#F5A623',
  // Transfer status
  completed: '#19BE6B',
  transferring: '#1871FF',
  pending: '#C0C8D4',
  paused: '#F5A623',
  failed: '#FF4D4F',
  cancelled: '#C0C8D4',
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
  const color = STATUS_COLORS[status] || '#C0C8D4';
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
          boxShadow: `0 0 6px ${color}60`,
        }}
      />
      {showLabel && (
        <span style={{ fontSize: size === 'small' ? 12 : 14, color: theme.textSecondary }}>
          {label}
        </span>
      )}
    </span>
  );
};

export default StatusIndicator;
