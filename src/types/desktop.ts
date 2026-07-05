/** 云桌面相关类型 */

export type DesktopStatus = 'running' | 'stopped' | 'suspended' | 'starting' | 'stopping' | 'error' | 'unknown';
export type DesktopPowerAction = 'start' | 'stop' | 'restart' | 'suspend' | 'resume';
export type OSType = 'windows' | 'linux' | 'ubuntu' | 'centos' | 'custom';

export interface CloudDesktop {
  id: string;
  name: string;
  description?: string;
  status: DesktopStatus;
  osType: OSType;
  osName: string;
  cpu: number;        // vCPU cores
  memory: number;     // GB
  diskSize: number;   // GB
  ipAddress: string;
  spicePort: number;
  spicePassword?: string;
  createdAt: string;
  expiredAt?: string;
  imageName?: string;
  region?: string;
  tags?: Record<string, string>;
}

export interface DesktopPowerInfo {
  id: string;
  status: DesktopStatus;
  uptime?: number;       // seconds
  lastAction?: DesktopPowerAction;
  lastActionTime?: string;
  scheduledAction?: {
    action: DesktopPowerAction;
    time: string;
  };
}

export interface DesktopConfig {
  id: string;
  cpu: number;
  memory: number;
  diskSize: number;
  gpu?: {
    model: string;
    vram: number;     // GB
  };
  bandwidth: number;   // Mbps
}

export interface DesktopBilling {
  id: string;
  chargingMode: 'prepaid' | 'postpaid' | 'monthly';
  price: number;        // per hour or per month
  totalSpent: number;
  estimatedMonthly: number;
  balance: number;
  autoRenew: boolean;
}

export interface DesktopListFilter {
  status?: DesktopStatus;
  search?: string;
  page: number;
  pageSize: number;
}

export interface DesktopListResponse {
  items: CloudDesktop[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RestorePoint {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  type: 'manual' | 'auto' | 'system';
  size: number;           // MB
}
