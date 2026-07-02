import { create } from 'zustand';
import type {
  CloudDesktop,
  DesktopPowerAction,
  DesktopPowerInfo,
  DesktopConfig,
  DesktopBilling,
  DesktopListFilter,
  RestorePoint,
} from '@/types';

interface DesktopStore {
  desktops: CloudDesktop[];
  selectedDesktop: CloudDesktop | null;
  powerInfo: Record<string, DesktopPowerInfo>;
  desktopConfig: Record<string, DesktopConfig>;
  billingInfo: Record<string, DesktopBilling>;
  restorePoints: RestorePoint[];
  loading: boolean;
  error: string | null;
  filter: DesktopListFilter;

  // Actions
  fetchDesktops: (filter?: Partial<DesktopListFilter>) => Promise<void>;
  selectDesktop: (desktop: CloudDesktop | null) => void;
  powerAction: (desktopId: string, action: DesktopPowerAction) => Promise<void>;
  fetchPowerInfo: (desktopId: string) => Promise<void>;
  fetchDesktopConfig: (desktopId: string) => Promise<void>;
  fetchBillingInfo: (desktopId: string) => Promise<void>;
  fetchRestorePoints: (desktopId: string) => Promise<void>;
  createRestorePoint: (desktopId: string, name: string) => Promise<void>;
  restoreFromPoint: (desktopId: string, pointId: string) => Promise<void>;
  resetPassword: (desktopId: string, newPassword: string) => Promise<void>;
  setFilter: (filter: Partial<DesktopListFilter>) => void;
  clearError: () => void;
}

const MOCK_DESKTOPS: CloudDesktop[] = [
  {
    id: 'd-001',
    name: '办公云桌面-Windows',
    description: '日常办公使用，已安装Office套件',
    status: 'running',
    osType: 'windows',
    osName: 'Windows Server 2022',
    cpu: 8,
    memory: 32,
    diskSize: 256,
    ipAddress: '192.168.201.131',
    spicePort: 5900,
    spicePassword: 'spice123',
    createdAt: '2025-01-15T08:00:00Z',
    expiredAt: '2026-12-31T23:59:59Z',
    region: '华东1',
    tags: { department: '研发部', env: 'production' },
  },
  {
    id: 'd-002',
    name: '开发云桌面-Linux',
    status: 'stopped',
    osType: 'linux',
    osName: 'Ubuntu 22.04 LTS',
    cpu: 4,
    memory: 16,
    diskSize: 128,
    ipAddress: '192.168.201.132',
    spicePort: 5901,
    createdAt: '2025-03-20T10:30:00Z',
    region: '华东1',
  },
  {
    id: 'd-003',
    name: '测试云桌面-Windows',
    status: 'suspended',
    osType: 'windows',
    osName: 'Windows 11 Pro',
    cpu: 4,
    memory: 8,
    diskSize: 128,
    ipAddress: '192.168.201.133',
    spicePort: 5902,
    createdAt: '2025-06-01T14:00:00Z',
    region: '华南1',
  },
];

const MOCK_POWER_INFO: Record<string, DesktopPowerInfo> = {
  'd-001': {
    id: 'd-001',
    status: 'running',
    uptime: 86400 * 7,
    lastAction: 'start',
    lastActionTime: '2025-06-24T09:00:00Z',
  },
  'd-002': {
    id: 'd-002',
    status: 'stopped',
    lastAction: 'stop',
    lastActionTime: '2025-06-28T18:00:00Z',
  },
  'd-003': {
    id: 'd-003',
    status: 'suspended',
    lastAction: 'suspend',
    lastActionTime: '2025-06-30T12:00:00Z',
  },
};

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  desktops: [],
  selectedDesktop: null,
  powerInfo: {},
  desktopConfig: {},
  billingInfo: {},
  restorePoints: [],
  loading: false,
  error: null,
  filter: { page: 1, pageSize: 12 },

  fetchDesktops: async (filter?: Partial<DesktopListFilter>) => {
    set({ loading: true, error: null });
    try {
      const currentFilter = { ...get().filter, ...filter };
      set({ filter: currentFilter });

      // TODO: Replace with API call
      await new Promise((r) => setTimeout(r, 600));
      set({ desktops: MOCK_DESKTOPS, loading: false });
    } catch (err: any) {
      set({ error: err?.message || '获取桌面列表失败', loading: false });
    }
  },

  selectDesktop: (desktop) => set({ selectedDesktop: desktop }),

  powerAction: async (desktopId: string, action: DesktopPowerAction) => {
    set({ loading: true, error: null });
    try {
      // TODO: Call power action API
      await new Promise((r) => setTimeout(r, 1500));

      const statusMap: Record<string, CloudDesktop['status']> = {
        start: 'running',
        stop: 'stopped',
        restart: 'running',
        suspend: 'suspended',
        resume: 'running',
      };

      // Update local state
      const desktops = get().desktops.map((d) =>
        d.id === desktopId ? { ...d, status: statusMap[action] || d.status } : d
      );
      const powerInfo = {
        ...get().powerInfo,
        [desktopId]: {
          ...get().powerInfo[desktopId],
          status: statusMap[action],
          lastAction: action,
          lastActionTime: new Date().toISOString(),
        },
      };

      set({ desktops, powerInfo, loading: false });
    } catch (err: any) {
      set({ error: err?.message || `电源操作失败: ${action}`, loading: false });
    }
  },

  fetchPowerInfo: async (desktopId: string) => {
    try {
      // TODO: API call
      await new Promise((r) => setTimeout(r, 300));
      set((s) => ({
        powerInfo: { ...s.powerInfo, [desktopId]: MOCK_POWER_INFO[desktopId] },
      }));
    } catch {}
  },

  fetchDesktopConfig: async (desktopId: string) => {
    try {
      await new Promise((r) => setTimeout(r, 300));
      set((s) => ({
        desktopConfig: {
          ...s.desktopConfig,
          [desktopId]: {
            id: desktopId,
            cpu: 8,
            memory: 32,
            diskSize: 256,
            bandwidth: 100,
          },
        },
      }));
    } catch {}
  },

  fetchBillingInfo: async (desktopId: string) => {
    try {
      await new Promise((r) => setTimeout(r, 300));
      set((s) => ({
        billingInfo: {
          ...s.billingInfo,
          [desktopId]: {
            id: desktopId,
            chargingMode: 'postpaid',
            price: 2.5,
            totalSpent: 1250.0,
            estimatedMonthly: 450.0,
            balance: 5000.0,
            autoRenew: true,
          },
        },
      }));
    } catch {}
  },

  fetchRestorePoints: async (desktopId: string) => {
    try {
      await new Promise((r) => setTimeout(r, 400));
      set({
        restorePoints: [
          {
            id: 'rp-001',
            name: '系统更新前备份',
            createdAt: '2025-06-20T10:00:00Z',
            type: 'manual',
            size: 4096,
          },
          {
            id: 'rp-002',
            name: '每日自动备份',
            createdAt: '2025-06-30T02:00:00Z',
            type: 'auto',
            size: 2048,
          },
        ],
      });
    } catch {}
  },

  createRestorePoint: async (desktopId: string, name: string) => {
    set({ loading: true });
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const newPoint: RestorePoint = {
        id: `rp-${Date.now()}`,
        name,
        createdAt: new Date().toISOString(),
        type: 'manual',
        size: 0,
      };
      set((s) => ({ restorePoints: [newPoint, ...s.restorePoints], loading: false }));
    } catch {
      set({ loading: false });
    }
  },

  restoreFromPoint: async (desktopId: string, pointId: string) => {
    set({ loading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 2000));
      set({ loading: false });
    } catch {
      set({ loading: false });
    }
  },

  resetPassword: async (desktopId: string, newPassword: string) => {
    set({ loading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 1000));
      set({ loading: false });
      return;
    } catch (err: any) {
      set({ error: err?.message || '重置密码失败', loading: false });
    }
  },

  setFilter: (filter) =>
    set((s) => ({ filter: { ...s.filter, ...filter } })),

  clearError: () => set({ error: null }),
}));
