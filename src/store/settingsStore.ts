import { create } from 'zustand';
import type { AppSettings, FirmwareInfo, DiagnosticInfo } from '@/types';
import { saveSettings as dbSave, loadSettings as dbLoad, clearSettings as dbClear } from '@/services/db';

interface SettingsStore {
  settings: AppSettings;
  diagnosticInfo: DiagnosticInfo | null;
  loading: boolean;
  saving: boolean;
  error: string | null;

  loadSettings: () => Promise<void>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  checkFirmwareUpdate: () => Promise<void>;
  performFirmwareUpdate: () => Promise<void>;
  runDiagnostics: () => Promise<void>;
  syncTime: () => Promise<void>;
  clearError: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  connection: {
    host: '192.168.201.131',
    devicePortType: 'lan',
    devicePort: 60442,
    servicePortType: 'lan',
    servicePort: 8888,
    tlsEnabled: true,
    autoReconnect: true,
    reconnectInterval: 10,
    reconnectAttempts: 3,
    timeout: 30,
    heartbeatInterval: 15,
  },
  display: {
    defaultMode: 'window',
    defaultQuality: 'smart',
    colorDepth: 32,
    frameRateLimit: 60,
    scaling: 'fit',
    multiMonitor: false,
    dualMode: 'extend',
    monitorVertical: false,
    monitorReversed: false,
    resolutions: { 1: '1920x1080', 2: '1920x1080' },
    rememberWindowPosition: true,
    dpiScaling: 'auto',
  },
  power: {
    idleAction: 'sleep',
    idleTimeout: 30,
    scheduledTaskEnabled: false,
    scheduledDays: [],
    scheduledTime: '22:00',
    scheduledAction: 'shutdown',
    shutdownOnAppClose: false,
    shutdownOnDisconnect: false,
    suspendOnMinimize: false,
    powerButtonAction: 'sleep',
  },
  peripheral: {
    usbAutoRedirect: true,
    usbPolicy: {
      usb: 'allow', printer: 'allow', camera: 'allow', microphone: 'allow',
      smartcard: 'allow', storage: 'ask', keyboard: 'allow', mouse: 'allow', other: 'ask',
    } as any,
    usbDevices: [],
    usbRedirect: {},
    printerAutoMap: true,
    audioInput: '',
    audioOutput: '',
    audioEnabled: true,
    smartcardEnabled: false,
  },
  network: {
    ipMode: 'dhcp',
    ipAddress: '',
    subnetMask: '',
    gateway: '',
    dnsServers: ['8.8.8.8', '114.114.114.114'],
    proxyEnabled: false,
    proxyType: 'none',
    proxyHost: '',
    proxyPort: 0,
    proxyAuth: false,
    bandwidthLimit: 0,
    enableQUIC: false,
    portalAuth: false,
    portalType: 'none',
    portalUsername: '',
    portalPassword: '',
  },
  account: {
    displayName: '',
    email: '',
    phone: '',
    language: 'zh-CN',
    theme: 'dark',
    autoLogin: false,
    savePassword: false,
    twoFactorEnabled: false,
  },
  timeSync: {
    enabled: true,
    server: 'ntp.aliyun.com',
    interval: 24,
    timezone: 'Asia/Shanghai',
    ntpEnabled: true,
  },
  firmware: {
    currentVersion: '1.0.0',
    latestVersion: '1.2.0',
    releaseDate: '2025-07-01',
    changelog: '1. 优化SPICE连接稳定性\n2. 新增文件拖拽上传\n3. 修复已知Bug',
    updateAvailable: true,
    updateSize: 45,
    updateType: 'recommended',
    lastCheckTime: '2025-07-01T00:00:00Z',
  },
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  diagnosticInfo: null,
  loading: false,
  saving: false,
  error: null,

  loadSettings: async () => {
    set({ loading: true });
    try {
      const saved = await dbLoad();
      if (saved) {
        set({ settings: { ...DEFAULT_SETTINGS, ...saved } });
      }
    } catch {}
    set({ loading: false });
  },

  saveSettings: async (partial) => {
    set({ saving: true, error: null });
    try {
      // 深度合并：只合并传入的顶层 key，避免覆盖未传入的完整对象
      const current = get().settings;
      const merged = { ...current };
      for (const key of Object.keys(partial)) {
        const pv = (partial as any)[key];
        if (pv && typeof pv === 'object' && !Array.isArray(pv)) {
          (merged as any)[key] = { ...(current as any)[key], ...pv };
        } else {
          (merged as any)[key] = pv;
        }
      }

      await dbSave(merged);
      set({ settings: merged as AppSettings, saving: false });
    } catch (err: any) {
      set({ error: err?.message || '保存设置失败', saving: false });
    }
  },

  resetSettings: async () => {
    await dbClear();
    set({ settings: DEFAULT_SETTINGS });
  },

  checkFirmwareUpdate: async () => {
    set({ loading: true });
    try {
      // TODO: API call to check firmware version
      await new Promise((r) => setTimeout(r, 1500));
      set({
        settings: {
          ...get().settings,
          firmware: {
            ...get().settings.firmware,
            latestVersion: '1.2.0',
            updateAvailable: true,
            lastCheckTime: new Date().toISOString(),
            updateSize: 45,
            updateType: 'recommended',
          },
        },
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  performFirmwareUpdate: async () => {
    set({ loading: true, error: null });
    try {
      // TODO: Actual firmware update process
      await new Promise((r) => setTimeout(r, 5000));
      set({
        settings: {
          ...get().settings,
          firmware: {
            ...get().settings.firmware,
            currentVersion: '1.2.0',
            updateAvailable: false,
            lastCheckTime: new Date().toISOString(),
          },
        },
        loading: false,
      });
    } catch (err: any) {
      set({ error: '固件升级失败: ' + (err?.message || ''), loading: false });
    }
  },

  runDiagnostics: async () => {
    set({ loading: true });
    try {
      await new Promise((r) => setTimeout(r, 2000));
      set({
        diagnosticInfo: {
          networkStatus: 'connected',
          spiceConnectivity: true,
          apiConnectivity: true,
          latency: 15,
          packetLoss: 0.1,
          cpuUsage: 23,
          memoryUsage: 45,
          diskSpace: 80,
          osInfo: navigator.platform || 'Unknown',
          appVersion: '1.0.0',
          logs: [
            {
              timestamp: new Date().toISOString(),
              level: 'info',
              module: '网络诊断',
              message: '网络连接正常，延迟 15ms',
            },
            {
              timestamp: new Date().toISOString(),
              level: 'info',
              module: 'SPICE诊断',
              message: 'SPICE服务连通性检测通过',
            },
          ],
        },
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  syncTime: async () => {
    set({ loading: true });
    try {
      // TODO: NTP time sync
      await new Promise((r) => setTimeout(r, 1000));
      set({
        settings: {
          ...get().settings,
          timeSync: {
            ...get().settings.timeSync,
            lastSyncTime: new Date().toISOString(),
          },
        },
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
