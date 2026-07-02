/** HTTP API 客户端 - 基于 Axios */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.cloud-terminal.local/v1';

class ApiClient {
  private instance: AxiosInstance;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            const token = localStorage.getItem('auth_token');
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return this.instance(originalRequest);
          } catch {
            // Token refresh failed, redirect to login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.location.href = '/login';
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = new Promise(async (resolve, reject) => {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await this.instance.post('/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        this.refreshPromise = null;
      }
    });

    return this.refreshPromise;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  async upload<T>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    });
    return response.data;
  }

  async download(url: string, filename: string, onProgress?: (progress: number) => void): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob',
      onDownloadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    });

    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

export const apiClient = new ApiClient();
