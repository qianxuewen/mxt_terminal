/** 多协议类型定义 */

export type ProtocolType = 'spice' | 'rdp' | 'moonlight';

export interface ProtocolInfo {
  type: ProtocolType;
  label: string;
  icon: string;
  description: string;
  defaultPort: number;
}

export const PROTOCOLS: Record<ProtocolType, ProtocolInfo> = {
  spice:    { type: 'spice',    label: 'SPICE',    icon: '🖥', description: '高性能远程桌面协议', defaultPort: 5900 },
  rdp:      { type: 'rdp',      label: 'RDP',      icon: '🪟', description: 'Windows 远程桌面协议', defaultPort: 3389 },
  moonlight: { type: 'moonlight', label: 'Moonlight', icon: '🎮', description: '游戏串流协议',     defaultPort: 47989 },
};

// ── SPICE 配置 ──

export interface SpiceConfig {
  password?: string;
  colorDepth: 16 | 24 | 32;
  enableAudio: boolean;
  enableUsbRedirect: boolean;
  enableSmartcard: boolean;
}

export const DEFAULT_SPICE_CONFIG: SpiceConfig = {
  colorDepth: 32,
  enableAudio: true,
  enableUsbRedirect: true,
  enableSmartcard: false,
};

// ── RDP 配置 ──

export interface RdpConfig {
  username: string;
  password: string;
  domain?: string;
  desktopWidth: number;
  desktopHeight: number;
  enableClipboard: boolean;
  enableAudio: boolean;
  enablePrinter: boolean;
  gateway?: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
}

export const DEFAULT_RDP_CONFIG: RdpConfig = {
  username: '',
  password: '',
  desktopWidth: 1920,
  desktopHeight: 1080,
  enableClipboard: true,
  enableAudio: true,
  enablePrinter: false,
};

// ── Moonlight 配置 ──

export interface MoonlightConfig {
  serverId: string;
  serverName: string;
  appName: string;
  bitrate: number;        // kbps
  fps: number;
  resolution: { width: number; height: number };
  enableAudio: boolean;
  audioDevice: string;
}

export const DEFAULT_MOONLIGHT_CONFIG: MoonlightConfig = {
  serverId: '',
  serverName: '',
  appName: '桌面',
  bitrate: 20000,
  fps: 60,
  resolution: { width: 1920, height: 1080 },
  enableAudio: true,
  audioDevice: 'default',
};

// ── 统一连接配置 ──

export interface ConnectionConfig {
  id: string;
  name: string;
  protocol: ProtocolType;
  host: string;
  devicePort: number;
  servicePort: number;
  spiceConfig: SpiceConfig;
  rdpConfig: RdpConfig;
  moonlightConfig: MoonlightConfig;
}
