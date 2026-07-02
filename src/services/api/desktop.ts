/** 云桌面管理 API */

import { apiClient } from './client';
import type {
  CloudDesktop,
  DesktopPowerAction,
  DesktopPowerInfo,
  DesktopConfig,
  DesktopBilling,
  DesktopListFilter,
  RestorePoint,
} from '@/types';

export const desktopApi = {
  /** 获取桌面列表 */
  list: (filter?: DesktopListFilter) =>
    apiClient.get<{ items: CloudDesktop[]; total: number }>('/desktops', { params: filter }),

  /** 获取桌面详情 */
  getById: (id: string) =>
    apiClient.get<CloudDesktop>(`/desktops/${id}`),

  /** 电源操作 */
  powerAction: (desktopId: string, action: DesktopPowerAction) =>
    apiClient.post<void>(`/desktops/${desktopId}/power`, { action }),

  /** 获取电源状态 */
  getPowerInfo: (desktopId: string) =>
    apiClient.get<DesktopPowerInfo>(`/desktops/${desktopId}/power`),

  /** 获取桌面配置 */
  getConfig: (desktopId: string) =>
    apiClient.get<DesktopConfig>(`/desktops/${desktopId}/config`),

  /** 获取计费信息 */
  getBilling: (desktopId: string) =>
    apiClient.get<DesktopBilling>(`/desktops/${desktopId}/billing`),

  /** 重置密码 */
  resetPassword: (desktopId: string, newPassword: string) =>
    apiClient.post<void>(`/desktops/${desktopId}/password`, { password: newPassword }),

  /** 创建还原点 */
  createRestorePoint: (desktopId: string, name: string, description?: string) =>
    apiClient.post<RestorePoint>(`/desktops/${desktopId}/restore-points`, { name, description }),

  /** 获取还原点列表 */
  getRestorePoints: (desktopId: string) =>
    apiClient.get<RestorePoint[]>(`/desktops/${desktopId}/restore-points`),

  /** 从还原点恢复 */
  restoreFromPoint: (desktopId: string, pointId: string) =>
    apiClient.post<void>(`/desktops/${desktopId}/restore`, { pointId }),
};
