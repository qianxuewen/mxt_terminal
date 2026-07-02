/**
 * 平台适配工具
 * 自动检测运行环境并提供平台相关功能
 */

export type PlatformType = 'web' | 'tauri' | 'electron' | 'unknown';
export type OSPlatform = 'windows' | 'macos' | 'linux' | 'unknown';

export const platform = {
  /** 检测当前运行平台 */
  getPlatform(): PlatformType {
    if (typeof window !== 'undefined') {
      // Tauri v1: window.__TAURI__ 对象
      if ((window as any).__TAURI__) return 'tauri';
      // Tauri 通常在 UserAgent 中包含 "Tauri"
      if (navigator.userAgent.includes('Tauri')) return 'tauri';
      if ((window as any).electronAPI) return 'electron';
      return 'web';
    }
    return 'unknown';
  },

  /** 检测操作系统 */
  getOS(): OSPlatform {
    if (typeof navigator === 'undefined') return 'unknown';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('win')) return 'windows';
    if (ua.includes('mac')) return 'macos';
    if (ua.includes('linux')) return 'linux';
    return 'unknown';
  },

  /** 是否为桌面端 */
  isDesktop(): boolean {
    const p = this.getPlatform();
    return p === 'tauri' || p === 'electron';
  },

  /** 是否为 Web 端 */
  isWeb(): boolean {
    return this.getPlatform() === 'web';
  },

  /** 是否为 Tauri */
  isTauri(): boolean {
    return this.getPlatform() === 'tauri';
  },

  /** 是否为 Linux */
  isLinux(): boolean {
    return this.getOS() === 'linux';
  },

  /** 是否为 Windows */
  isWindows(): boolean {
    return this.getOS() === 'windows';
  },

  /** 是否为 macOS */
  isMacOS(): boolean {
    return this.getOS() === 'macos';
  },

  /** 获取 SPICE 客户端类型 */
  getSPICEClientType(): 'gtk' | 'windows' | 'html5' | 'none' {
    const os = this.getOS();
    if (os === 'linux') return 'gtk';
    if (os === 'windows') return 'windows';
    return 'html5';
  },
};

/** SPICE 默认连接配置 */
export const SPICE_DEFAULT_CONFIG = {
  host: '192.168.201.131',
  port: 5900,
};
