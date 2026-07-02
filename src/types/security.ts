/** 安全与策略相关类型 */

export type WatermarkStyle = 'light' | 'dark';
export type WatermarkType = 'text' | 'image';
export type ClipboardDirection = 'localToRemote' | 'remoteToLocal' | 'both' | 'disabled';
export type ClipboardContentType = 'plaintext' | 'richtext' | 'image' | 'file';
export type AuditEventType = 'screen_capture' | 'clipboard' | 'file_transfer' | 'login' | 'peripheral' | 'print';

export interface WatermarkConfig {
  enabled: boolean;
  type: WatermarkType;
  content: string;
  style: WatermarkStyle;
  opacity: number;            // 0-1
  fontSize: number;
  fontColor: string;
  rotation: number;           // degrees
  density: number;            // number of watermarks
  dynamic: boolean;           // dynamic watermark (shows user info)
  userId?: string;
  userName?: string;
  timestamp?: string;
}

export interface ClipboardPolicy {
  direction: ClipboardDirection;
  allowedTypes: ClipboardContentType[];
  maxSize: number;            // bytes, 0 for unlimited
  auditEnabled: boolean;
  contentFilter?: string;     // regex filter
}

export interface ClipboardItem {
  id: string;
  content: string;
  type: ClipboardContentType;
  size: number;
  source: 'local' | 'remote';
  timestamp: string;
  direction: ClipboardDirection;
  blocked: boolean;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description?: string;
  watermark: WatermarkConfig;
  clipboard: ClipboardPolicy;
  usbRedirect: boolean;
  usbReadOnly: boolean;
  printerMapping: boolean;
  diskMapping: boolean;
  diskMappingReadOnly: boolean;
  screenRecording: boolean;
  screenRecordingRetentionDays: number;
  trustedDeviceOnly: boolean;
  trustedDeviceList: string[];
  maxLoginAttempts: number;
  sessionTimeout: number;        // minutes
}

export interface AuditRecord {
  id: string;
  eventType: AuditEventType;
  userId: string;
  userName: string;
  desktopId: string;
  timestamp: string;
  details: Record<string, any>;
  severity: 'info' | 'warning' | 'critical';
  screenshotUrl?: string;
  ipAddress?: string;
}

export interface ScreenRecording {
  id: string;
  desktopId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  fileSize: number;
  status: 'recording' | 'stopped' | 'error';
  riskEvents: AuditRecord[];
}

export interface TrustedDevice {
  id: string;
  deviceName: string;
  deviceId: string;
  platform: string;
  osVersion: string;
  macAddress: string;
  lastLogin: string;
  trusted: boolean;
}
