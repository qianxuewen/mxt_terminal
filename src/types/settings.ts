/** 设置相关类型 */

import type { DisplayMode, DisplayQuality } from './connection';
import type { RedirectPolicy, PeripheralCategory } from './peripheral';
import type { ClipboardDirection } from './security';

export interface ConnectionSettings {
  host: string;
  port: number;
  tlsEnabled: boolean;
  autoReconnect: boolean;
  reconnectInterval: number;     // seconds
  reconnectAttempts: number;
  timeout: number;               // seconds
  heartbeatInterval: number;     // seconds
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
  autoSleepEnabled: boolean;
  autoSleepTimeout: number;       // minutes
  autoShutdownEnabled: boolean;
  autoShutdownTimeout: number;    // minutes
  shutdownOnAppClose: boolean;
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

export interface NetworkSettings {
  proxyEnabled: boolean;
  proxyType: 'http' | 'socks5' | 'none';
  proxyHost: string;
  proxyPort: number;
  proxyAuth: boolean;
  proxyUsername?: string;
  proxyPassword?: string;
  bandwidthLimit: number;         // Mbps, 0 for unlimited
  enableQUIC: boolean;
  dnsServers: string[];
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
