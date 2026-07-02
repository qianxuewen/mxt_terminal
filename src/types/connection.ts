/** 远程连接相关类型 */

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'error';
export type DisplayQuality = 'low' | 'medium' | 'high' | 'lossless';
export type DisplayMode = 'window' | 'fullscreen';

export interface ConnectionConfig {
  host: string;
  port: number;
  password?: string;
  protocol: 'spice';
  tls: boolean;
  caCertificate?: string;
  compression: boolean;
}

export interface SPICEConfig {
  host: string;
  port: number;
  password?: string;
  tlsPort?: number;
  tls?: boolean;
  caFile?: string;
  hostSubject?: string;
  colorDepth: 16 | 24 | 32;
  enableAudio: boolean;
  enableUsbRedirect: boolean;
  enableSmartcard: boolean;
  enableFileTransfer: boolean;
  enableClipboard: boolean;
  resizeGuest: boolean;
}

export interface DisplaySettings {
  mode: DisplayMode;
  quality: DisplayQuality;
  resolution: {
    width: number;
    height: number;
  };
  colorDepth: 16 | 24 | 32;
  frameRate: number;       // FPS target
  scaling: 'fit' | 'fill' | 'stretch' | 'original';
  dpi: number;
  enableHDR: boolean;
  multiMonitor: boolean;
  monitorLayout?: MonitorInfo[];
}

export interface MonitorInfo {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  primary: boolean;
}

export interface ConnectionMetrics {
  fps: number;
  latency: number;        // ms
  bandwidth: number;      // Mbps
  packetsLost: number;
  cpuUsage: number;       // percentage
  memoryUsage: number;    // percentage
  frameWidth: number;
  frameHeight: number;
  codec?: string;
  rtt: number;
  jitter: number;
}

export interface ConnectionStateInfo {
  state: ConnectionState;
  desktopId: string;
  connectionId?: string;
  connectedAt?: string;
  disconnectedAt?: string;
  error?: string;
  metrics?: ConnectionMetrics;
  displaySettings: DisplaySettings;
  spiceConfig: SPICEConfig;
}

export interface QualityPreset {
  name: string;
  label: string;
  quality: DisplayQuality;
  bandwidth: number;
  colorDepth: 16 | 24 | 32;
  description: string;
}
