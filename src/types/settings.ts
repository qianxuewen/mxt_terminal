/** 设置相关类型 */

import type { DisplayMode, DisplayQuality } from './connection';
import type { RedirectPolicy, PeripheralCategory } from './peripheral';
import type { ClipboardDirection } from './security';

export interface ConnectionSettings {
  host: string;
  devicePortType: 'lan' | 'wan' | 'other';
  devicePort: number;
  servicePortType: 'lan' | 'wan' | 'other';
  servicePort: number;
  tlsEnabled: boolean;
  autoReconnect: boolean;
  reconnectInterval: number;
  reconnectAttempts: number;
  timeout: number;
  heartbeatInterval: number;
}

export interface DisplaySettingsConfig {
  defaultMode: DisplayMode;
  defaultQuality: DisplayQuality;
  colorDepth: 16 | 24 | 32;
  frameRateLimit: number;
  scaling: 'fit' | 'fill' | 'stretch' | 'original';
  multiMonitor: boolean;
  rememberWindowPosition: boolean;
  windowPosition?: { x: number; y: number };
  windowSize?: { width: number; height: number };
  dpiScaling: 'auto' | '100' | '125' | '150' | '175' | '200';
}

export interface PowerSettings {
  // 空闲节能
  idleAction: 'none' | 'sleep' | 'shutdown';
  idleTimeout: number;            // minutes
  // 定时任务
  scheduledTaskEnabled: boolean;
  scheduledDays: number[];        // 0=Sun, 1=Mon ... 6=Sat
  scheduledTime: string;          // HH:mm
  scheduledAction: 'shutdown' | 'restart';
  // 其它
  shutdownOnAppClose: boolean;
  shutdownOnDisconnect: boolean;
  suspendOnMinimize: boolean;
  powerButtonAction: 'sleep' | 'shutdown' | 'lock' | 'none';
}

export interface PeripheralSettings {
  usbAutoRedirect: boolean;
  usbPolicy: Record<PeripheralCategory, RedirectPolicy>;
  printerAutoMap: boolean;
  audioInput: string;           // device ID or name
  audioOutput: string;
  audioEnabled: boolean;
  smartcardEnabled: boolean;
}

export type IPMode = 'dhcp' | 'static';

export interface NetworkSettings {
  // 基础网络
  ipMode: IPMode;
  ipAddress: string;
  subnetMask: string;
  gateway: string;
  dnsServers: string[];
  // 代理
  proxyEnabled: boolean;
  proxyType: 'http' | 'socks5' | 'none';
  proxyHost: string;
  proxyPort: number;
  proxyAuth: boolean;
  proxyUsername?: string;
  proxyPassword?: string;
  // 高级
  bandwidthLimit: number;
  enableQUIC: boolean;
  portalAuth: boolean;
  portalType: 'none' | 'web' | 'pppoe' | '8021x' | 'l2tp' | 'pptp';
  portalUsername: string;
  portalPassword: string;
}

export interface AccountSettings {
  displayName: string;
  email: string;
  phone: string;
  language: 'zh-CN' | 'en-US' | 'ja-JP';
  theme: 'light' | 'dark' | 'auto';
  autoLogin: boolean;
  savePassword: boolean;
  twoFactorEnabled: boolean;
}

export interface FirmwareInfo {
  currentVersion: string;
  latestVersion?: string;
  releaseDate?: string;
  changelog?: string;
  updateAvailable: boolean;
  updateSize?: number;            // MB
  updateType: 'critical' | 'recommended' | 'optional';
  lastCheckTime?: string;
}

export interface TimeSyncConfig {
  enabled: boolean;
  server: string;
  interval: number;               // hours
  lastSyncTime?: string;
  timezone: string;
  ntpEnabled: boolean;
}

export interface DiagnosticInfo {
  networkStatus: 'connected' | 'disconnected' | 'limited';
  spiceConnectivity: boolean;
  apiConnectivity: boolean;
  latency: number;
  packetLoss: number;
  cpuUsage: number;
  memoryUsage: number;
  diskSpace: number;
  osInfo: string;
  appVersion: string;
  logs: DiagnosticLog[];
}

export interface DiagnosticLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  module: string;
  message: string;
  details?: string;
}

export interface AppSettings {
  connection: ConnectionSettings;
  display: DisplaySettingsConfig;
  power: PowerSettings;
  peripheral: PeripheralSettings;
  network: NetworkSettings;
  account: AccountSettings;
  timeSync: TimeSyncConfig;
  firmware: FirmwareInfo;
}
