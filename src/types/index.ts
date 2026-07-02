export * from './auth';
export * from './desktop';
export * from './connection';
export * from './file-transfer';
export * from './peripheral';
export * from './security';
export * from './settings';

/** 通用分页参数 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** 通用API响应 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  requestId?: string;
}

/** 通用列表响应 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
