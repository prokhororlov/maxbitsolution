import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useRootStore } from '@/stores';
import { API_BASE_URL } from '@/config';

const STORAGE_KEY = 'auth_token';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isStorageAvailable = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    if (!isStorageAvailable) return config;
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token || !config.headers) return config;
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response?.status === 401;
    if (!isUnauthorized) return Promise.reject(error);
    const $ = useRootStore();
    $.auth.clearToken();
    const isWindowAvailable = typeof window !== 'undefined';
    if (!isWindowAvailable) return Promise.reject(error);
    const pathname = window.location.pathname;
    const isAuthPage = pathname === '/login' || pathname === '/register';
    if (!isAuthPage) window.location.href = '/login';
    return Promise.reject(error);
  }
);

export default apiClient;

