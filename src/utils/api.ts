import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = 'http://localhost:3022';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если получили 401 (Unauthorized), очищаем токен
    if (error.response?.status === 401) {
      try {
        const authStore = useAuthStore();
        authStore.clearToken();
        // Перенаправляем на страницу входа только если мы не на странице логина/регистрации
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      } catch (e) {
        // Если store недоступен, очищаем localStorage напрямую
        localStorage.removeItem('auth_token');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

