import { create } from 'zustand';
import type {
  ConnectionState,
  ConnectionStateInfo,
  ConnectionMetrics,
  DisplaySettings,
  SPICEConfig,
  QualityPreset,
} from '@/types';
import { useDesktopStore } from './desktopStore';
import { platform } from '@/utils/platform';

// Tauri API bridge (avoids import error in web mode)
const tauriInvoke = async (cmd: string, args?: Record<string, unknown>): Promise<any> => {
  const w = window as any;
  if (w.__TAURI__?.invoke) {
    return w.__TAURI__.invoke(cmd, args);
  }
  throw new Error('Tauri API not available');
};

interface ConnectionStore {
  connections: Record<string, ConnectionStateInfo>;
  activeConnectionId: string | null;
  globalMetrics: ConnectionMetrics | null;
  qualityPresets: QualityPreset[];
  error: string | null;

  connect: (desktopId: string) => Promise<void>;
  disconnect: (desktopId: string) => Promise<void>;
  switchDisplayMode: (desktopId: string, mode: 'window' | 'fullscreen') => void;
  setQuality: (desktopId: string, quality: ConnectionStateInfo['displaySettings']['quality']) => void;
  setResolution: (desktopId: string, width: number, height: number) => void;
  updateMetrics: (desktopId: string, metrics: Partial<ConnectionMetrics>) => void;
  setError: (error: string | null) => void;
  getActiveConnection: () => ConnectionStateInfo | null;
}

const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  mode: 'window',
  quality: 'high',
  resolution: { width: 1920, height: 1080 },
  colorDepth: 32,
  frameRate: 60,
  scaling: 'fit',
  dpi: 96,
  enableHDR: false,
  multiMonitor: false,
};

const DEFAULT_SPICE_CONFIG: SPICEConfig = {
  host: '192.168.201.131',
  port: 5900,
  colorDepth: 32,
  enableAudio: true,
  enableUsbRedirect: true,
  enableSmartcard: false,
  enableFileTransfer: true,
  enableClipboard: true,
  resizeGuest: true,
};

const QUALITY_PRESETS: QualityPreset[] = [
  {
    name: 'low',
    label: '流畅优先',
    quality: 'low',
    bandwidth: 2,
    colorDepth: 16,
    description: '降低画质保证操作流畅，适合网络较差环境',
  },
  {
    name: 'medium',
    label: '均衡模式',
    quality: 'medium',
    bandwidth: 5,
    colorDepth: 24,
    description: '平衡画质与性能，适合一般网络环境',
  },
  {
    name: 'high',
    label: '画质优先',
    quality: 'high',
    bandwidth: 10,
    colorDepth: 32,
    description: '高清画质体验，建议带宽 10Mbps 以上',
  },
  {
    name: 'lossless',
    label: '无损模式',
    quality: 'lossless',
    bandwidth: 50,
    colorDepth: 32,
    description: '无损画质，适合设计、影音等专业场景',
  },
];

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  connections: {},
  activeConnectionId: null,
  globalMetrics: null,
  qualityPresets: QUALITY_PRESETS,
  error: null,

  connect: async (desktopId: string) => {
    const desktop = useDesktopStore.getState().desktops.find((d) => d.id === desktopId);
    if (!desktop) {
      set({ error: '桌面未找到' });
      return;
    }

    const spiceConfig = {
      ...DEFAULT_SPICE_CONFIG,
      host: desktop.ipAddress,
      port: desktop.spicePort,
      password: desktop.spicePassword,
    };

    set((s) => ({
      connections: {
        ...s.connections,
        [desktopId]: {
          state: 'connecting',
          desktopId,
          displaySettings: DEFAULT_DISPLAY_SETTINGS,
          spiceConfig,
        },
      },
      activeConnectionId: desktopId,
      error: null,
    }));

    try {
      if (platform.isTauri()) {
        // === 桌面端 (Tauri): 通过 FFI 调用系统 SPICE 客户端 ===
        await tauriInvoke('connect_spice', {
          host: spiceConfig.host,
          port: spiceConfig.port,
          password: spiceConfig.password || null,
        });

        set((s) => ({
          connections: {
            ...s.connections,
            [desktopId]: {
              ...s.connections[desktopId],
              state: 'connected' as ConnectionState,
              connectionId: `conn-${Date.now()}`,
              connectedAt: new Date().toISOString(),
            },
          },
        }));
      } else {
        // === Web / 开发模式: 直接显示连接信息页，不做 window.open() ===
        set((s) => ({
          connections: {
            ...s.connections,
            [desktopId]: {
              ...s.connections[desktopId],
              state: 'connected' as ConnectionState,
              connectionId: `conn-${Date.now()}`,
              connectedAt: new Date().toISOString(),
            },
          },
        }));
      }
    } catch (err: any) {
      set((s) => ({
        connections: {
          ...s.connections,
          [desktopId]: {
            ...s.connections[desktopId],
            state: 'error' as ConnectionState,
            error: err?.message || 'SPICE 连接失败',
          },
        },
        error: err?.message || 'SPICE 连接失败',
        activeConnectionId: null,
      }));
    }
  },

  disconnect: async (desktopId: string) => {
    set((s) => ({
      connections: {
        ...s.connections,
        [desktopId]: {
          ...s.connections[desktopId],
          state: 'disconnecting' as ConnectionState,
        },
      },
    }));

    try {
      // TODO: Actual SPICE disconnect
      await new Promise((r) => setTimeout(r, 500));

      set((s) => ({
        connections: {
          ...s.connections,
          [desktopId]: {
            ...s.connections[desktopId],
            state: 'disconnected' as ConnectionState,
            disconnectedAt: new Date().toISOString(),
            metrics: undefined,
          },
        },
        activeConnectionId: null,
      }));
    } catch {}
  },

  switchDisplayMode: (desktopId, mode) => {
    set((s) => ({
      connections: {
        ...s.connections,
        [desktopId]: {
          ...s.connections[desktopId],
          displaySettings: {
            ...s.connections[desktopId]?.displaySettings,
            mode,
          },
        },
      },
    }));
  },

  setQuality: (desktopId, quality) => {
    set((s) => ({
      connections: {
        ...s.connections,
        [desktopId]: {
          ...s.connections[desktopId],
          displaySettings: {
            ...s.connections[desktopId]?.displaySettings,
            quality,
          },
        },
      },
    }));
  },

  setResolution: (desktopId, width, height) => {
    set((s) => ({
      connections: {
        ...s.connections,
        [desktopId]: {
          ...s.connections[desktopId],
          displaySettings: {
            ...s.connections[desktopId]?.displaySettings,
            resolution: { width, height },
          },
        },
      },
    }));
  },

  updateMetrics: (desktopId, metrics) => {
    const current = get().connections[desktopId];
    if (!current) return;

    const updated = current.metrics ? { ...current.metrics, ...metrics } : (metrics as ConnectionMetrics);
    set((s) => ({
      connections: {
        ...s.connections,
        [desktopId]: {
          ...s.connections[desktopId],
          metrics: updated,
        },
      },
      globalMetrics: desktopId === get().activeConnectionId ? updated : get().globalMetrics,
    }));
  },

  setError: (error) => set({ error }),

  getActiveConnection: () => {
    const { activeConnectionId, connections } = get();
    return activeConnectionId ? connections[activeConnectionId] || null : null;
  },
}));
