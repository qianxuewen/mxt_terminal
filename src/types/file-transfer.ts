/** 文件传输相关类型 */

export type TransferDirection = 'upload' | 'download';
export type TransferStatus = 'pending' | 'transferring' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type TransferMode = 'normal' | 'turbo';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;         // bytes
  type: 'file' | 'directory';
  mimeType?: string;
  modifiedAt: string;
  checksum?: string;
}

export interface TransferTask {
  id: string;
  direction: TransferDirection;
  name: string;
  localPath: string;
  remotePath: string;
  size: number;           // bytes
  transferred: number;    // bytes
  speed: number;          // bytes/s
  status: TransferStatus;
  mode: TransferMode;
  error?: string;
  createdAt: string;
  completedAt?: string;
  estimatedTimeRemaining?: number;  // seconds
}

export interface TransferOptions {
  mode: TransferMode;
  overwrite: 'ask' | 'always' | 'skip' | 'rename';
  preserveAttributes: boolean;
  bandwidthLimit?: number;    // KB/s, 0 for unlimited
  compression: boolean;
  encrypt: boolean;
}

export interface TransferHistoryItem {
  id: string;
  direction: TransferDirection;
  fileName: string;
  fileSize: number;
  status: TransferStatus;
  startTime: string;
  endTime?: string;
  avgSpeed?: number;
  targetPath: string;
}

export interface DiskInfo {
  path: string;
  name: string;
  totalSpace: number;    // bytes
  freeSpace: number;     // bytes
  fileSystem: string;
  isRemovable: boolean;
}

export interface DragDropData {
  files: FileItem[];
  source: 'local' | 'remote';
  target: 'local' | 'remote';
}
