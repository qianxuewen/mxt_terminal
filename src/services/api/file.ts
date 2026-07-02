/** 文件传输相关 API */

import { apiClient } from './client';
import type { FileItem, TransferHistoryItem, DiskInfo } from '@/types';

export const fileApi = {
  /** 列举目录文件 */
  listFiles: (desktopId: string, path: string) =>
    apiClient.get<FileItem[]>(`/transfer/${desktopId}/files`, { params: { path } }),

  /** 获取磁盘列表 */
  getDisks: (desktopId: string) =>
    apiClient.get<DiskInfo[]>(`/transfer/${desktopId}/disks`),

  /** 创建目录 */
  createDirectory: (desktopId: string, path: string) =>
    apiClient.post<void>(`/transfer/${desktopId}/directory`, { path }),

  /** 上传文件 */
  upload: (desktopId: string, localPath: string, remotePath: string, onProgress?: (pct: number) => void) => {
    const formData = new FormData();
    formData.append('file', new Blob()); // Will be replaced by actual File
    formData.append('remotePath', remotePath);
    return apiClient.upload<void>(`/transfer/${desktopId}/upload`, formData, onProgress);
  },

  /** 下载文件 */
  download: (desktopId: string, remotePath: string, localPath: string, onProgress?: (pct: number) => void) =>
    apiClient.download(`/transfer/${desktopId}/download?path=${encodeURIComponent(remotePath)}`, localPath, onProgress),

  /** 获取传输历史 */
  getHistory: (desktopId: string) =>
    apiClient.get<TransferHistoryItem[]>(`/transfer/${desktopId}/history`),

  /** 取消传输 */
  cancelTransfer: (taskId: string) =>
    apiClient.post<void>(`/transfer/${taskId}/cancel`),

  /** 暂停/恢复传输 */
  toggleTransfer: (taskId: string, paused: boolean) =>
    apiClient.post<void>(`/transfer/${taskId}/toggle`, { paused }),
};
