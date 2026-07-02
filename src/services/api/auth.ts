/** 认证相关 API */

import { apiClient } from './client';
import type { LoginRequest, LoginResponse, MFARequest, UserInfo, SSOConfig } from '@/types';

export const authApi = {
  /** 用户名密码登录 */
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', data),

  /** MFA 验证 */
  verifyMFA: (data: MFARequest) =>
    apiClient.post<LoginResponse>('/auth/mfa/verify', data),

  /** 获取 MFA 配置 */
  getMFASetup: (sessionId: string) =>
    apiClient.get<{ methods: string[]; preferredMethod: string }>(`/auth/mfa/setup?sessionId=${sessionId}`),

  /** 刷新 Token */
  refreshToken: (refreshToken: string) =>
    apiClient.post<LoginResponse>('/auth/refresh', { refreshToken }),

  /** 登出 */
  logout: () =>
    apiClient.post<void>('/auth/logout'),

  /** 获取当前用户信息 */
  getCurrentUser: () =>
    apiClient.get<UserInfo>('/auth/me'),

  /** 更新用户信息 */
  updateProfile: (data: Partial<UserInfo>) =>
    apiClient.put<UserInfo>('/auth/profile', data),

  /** 获取 SSO 配置 */
  getSSOConfig: (organizationId: string) =>
    apiClient.get<SSOConfig>(`/auth/sso/${organizationId}`),

  /** SSO 登录 */
  ssoLogin: (provider: string, code: string) =>
    apiClient.post<LoginResponse>(`/auth/sso/${provider}/callback`, { code }),

  /** 获取组织列表 */
  getOrganizations: () =>
    apiClient.get<Array<{ id: string; name: string; logo?: string }>>('/auth/organizations'),
};
