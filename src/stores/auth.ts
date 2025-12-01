import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Функция для получения токена из localStorage
const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error reading token from localStorage:', error);
    return null;
  }
};

export const useAuthStore = defineStore('auth', () => {
  // Инициализируем токен из localStorage при создании store
  const token = ref<string | null>(getStoredToken());
  
  const isAuthenticated = computed(() => !!token.value);

  const setToken = (newToken: string) => {
    try {
      token.value = newToken;
      localStorage.setItem('auth_token', newToken);
    } catch (error) {
      console.error('Error saving token to localStorage:', error);
    }
  };

  const clearToken = () => {
    try {
      token.value = null;
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
  };

  const logout = () => {
    clearToken();
  };

  // Метод для восстановления токена при загрузке страницы
  const restoreToken = () => {
    const storedToken = getStoredToken();
    if (storedToken) {
      token.value = storedToken;
    }
  };

  return {
    token,
    isAuthenticated,
    setToken,
    clearToken,
    logout,
    restoreToken,
  };
});

