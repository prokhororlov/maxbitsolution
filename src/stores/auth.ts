import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '@/utils/api';
import { getApiErrorMessage } from '@/utils/errorHandler';

const STORAGE_KEY = 'auth_token';

const isStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (typeof localStorage === 'undefined') return false;
  return true;
};

const getStoredToken = (): string | null => {
  if (!isStorageAvailable()) return null;
  return localStorage.getItem(STORAGE_KEY);
};

const useAuthStoreImpl = defineStore('auth', () => {
  const token = ref<string | null>(getStoredToken());
  
  const isAuthenticated = computed(() => !!token.value);

  const setToken = (newToken: string) => {
    if (!isStorageAvailable()) return;
    token.value = newToken;
    localStorage.setItem(STORAGE_KEY, newToken);
  };

  const clearToken = () => {
    if (!isStorageAvailable()) return;
    token.value = null;
    localStorage.removeItem(STORAGE_KEY);
  };

  const logout = () => {
    clearToken();
  };

  const restoreToken = () => {
    const storedToken = getStoredToken();
    if (storedToken) {
      token.value = storedToken;
    }
  };

  const login = async (username: string, password: string) => {
    return apiClient
      .post<{ token: string }>('/login', { username, password })
      .then((response) => {
        setToken(response.data.token);
        return response.data.token;
      })
      .catch((err) => {
        throw new Error(getApiErrorMessage(err) || 'Ошибка входа');
      });
  };

  const register = async (username: string, password: string) => {
    return apiClient
      .post<{ token: string }>('/register', { username, password })
      .then((response) => {
        setToken(response.data.token);
        return response.data.token;
      })
      .catch((err) => {
        throw new Error(getApiErrorMessage(err) || 'Ошибка регистрации');
      });
  };

  return {
    token,
    isAuthenticated,
    setToken,
    clearToken,
    logout,
    restoreToken,
    login,
    register,
  };
});

export const useAuthStore = () => useAuthStoreImpl();

