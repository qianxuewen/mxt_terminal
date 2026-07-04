/**
 * 文件传输服务
 * 支持: 上传/下载、拖拽、传输队列管理、全速模式、断点续传
 */

import type { FileItem, TransferTask, TransferDirection, TransferStatus, TransferOptions, TransferMode } from '@/types';
import { v4 as uuid } from 'uuid';

type TransferCallback = (task: TransferTask) => void;

class FileTransferService {
  private tasks: Map<string, TransferTask> = new Map();
  private listeners: Set<TransferCallback> = new Set();
  private activeTransfers: number = 0;
  private maxConcurrent: number = 3;

  /** 添加上传任务 */
  async addUploadTask(
    localPath: string,
    remotePath: string,
    fileName: string,
    fileSize: number,
    options: TransferOptions
  ): Promise<TransferTask> {
    const task: TransferTask = {
      id: `upload-${uuid().slice(0, 8)}`,
      direction: 'upload',
      name: fileName,
      localPath,
      remotePath,
      size: fileSize,
      transferred: 0,
      speed: 0,
      status: 'pending',
      mode: options.mode,
      createdAt: new Date().toISOString(),
    };

    this.tasks.set(task.id, task);
    this.notifyListeners(task);

    if (this.activeTransfers < this.maxConcurrent) {
      this.processTask(task);
    }

    return task;
  }

  /** 添加下载任务 */
  async addDownloadTask(
    remoteFile: FileItem,
    localPath: string,
    options: TransferOptions
  ): Promise<TransferTask> {
    const task: TransferTask = {
      id: `download-${uuid().slice(0, 8)}`,
      direction: 'download',
      name: remoteFile.name,
      localPath,
      remotePath: remoteFile.path,
      size: remoteFile.size,
      transferred: 0,
      speed: 0,
      status: 'pending',
      mode: options.mode,
      createdAt: new Date().toISOString(),
    };

    this.tasks.set(task.id, task);
    this.notifyListeners(task);

    if (this.activeTransfers < this.maxConcurrent) {
      this.processTask(task);
    }

    return task;
  }

  /** 取消传输 */
  cancelTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && (task.status === 'transferring' || task.status === 'pending')) {
      task.status = 'cancelled';
      this.activeTransfers--;
      this.notifyListeners(task);
      this.processNextPending();
    }
  }

  /** 暂停/恢复 */
  togglePause(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    if (task.status === 'transferring') {
      task.status = 'paused';
    } else if (task.status === 'paused') {
      task.status = 'transferring';
      // Resume simulation
      this.processTask(task);
    }

    this.notifyListeners(task);
  }

  /** 设置并发数 */
  setMaxConcurrent(n: number): void {
    this.maxConcurrent = Math.max(1, Math.min(10, n));
  }

  /** 获取所有传输任务 */
  getTasks(): TransferTask[] {
    return Array.from(this.tasks.values());
  }

  /** 获取任务统计 */
  getStatistics() {
    const all = Array.from(this.tasks.values());
    return {
      total: all.length,
      completed: all.filter((t) => t.status === 'completed').length,
      failed: all.filter((t) => t.status === 'failed').length,
      transferring: all.filter((t) => t.status === 'transferring').length,
      pending: all.filter((t) => t.status === 'pending').length,
      totalBytes: all.reduce((s, t) => s + t.size, 0),
      transferredBytes: all.reduce((s, t) => s + t.transferred, 0),
    };
  }

  /** 监听任务变化 */
  onUpdate(callback: TransferCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // ========== Private ==========

  private async processTask(task: TransferTask): Promise<void> {
    this.activeTransfers++;
    task.status = 'transferring';
    this.notifyListeners(task);

    // Simulate file transfer
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(task.size / chunkSize);
    const startTime = Date.now();
    let lastTransferred = 0;

    for (let i = 0; i < totalChunks; i++) {
      const s = task.status as string;
      if (s === 'cancelled' || s === 'paused') {
        if (s === 'cancelled') this.activeTransfers--;
        return;
      }

      // Simulate network transfer delay
      await new Promise((r) => setTimeout(r, 50 + Math.random() * 50));

      const chunk = Math.min(chunkSize, task.size - task.transferred);
      task.transferred += chunk;

      // Calculate speed
      const elapsed = (Date.now() - startTime) / 1000;
      task.speed = elapsed > 0 ? task.transferred / elapsed : 0;

      // Estimated remaining
      const remainingBytes = task.size - task.transferred;
      task.estimatedTimeRemaining = task.speed > 0 ? remainingBytes / task.speed : 0;

      this.notifyListeners(task);
    }

    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    task.speed = task.size / ((Date.now() - startTime) / 1000);
    this.activeTransfers--;
    this.notifyListeners(task);
    this.processNextPending();
  }

  private processNextPending(): void {
    const pending = Array.from(this.tasks.values()).find((t) => t.status === 'pending');
    if (pending) {
      this.processTask(pending);
    }
  }

  private notifyListeners(task: TransferTask): void {
    this.listeners.forEach((cb) => cb({ ...task }));
  }
}

export const fileTransferService = new FileTransferService();
