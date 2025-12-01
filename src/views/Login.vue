<template>
  <div class="login-page">
    <h1>Вход</h1>
    <form @submit.prevent="handleSubmit" class="login-form">
      <div class="form-group">
        <label for="username">Логин</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="Введите логин"
          :class="{ error: usernameError }"
          @blur="validateUsername"
        />
        <span v-if="usernameError" class="error-message">{{ usernameError }}</span>
      </div>
      <div class="form-group">
        <label for="password">Пароль</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Введите пароль"
          :class="{ error: passwordError }"
          @blur="validatePassword"
        />
        <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
        <span v-if="apiError" class="error-message">{{ apiError }}</span>
      </div>
      <button type="submit" :disabled="isLoading" class="submit-button">Войти</button>
      <p class="register-link">
        Если у вас нет аккаунта
        <router-link to="/register">зарегистрируйтесь</router-link>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { validateUsername as validateUsernameUtil } from '@/utils/validation';
import { apiClient } from '@/utils/api';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const usernameError = ref<string | null>(null);
const passwordError = ref<string | null>(null);
const apiError = ref<string | null>(null);
const isLoading = ref(false);

const validateUsername = () => {
  usernameError.value = validateUsernameUtil(username.value);
};

const validatePassword = () => {
  passwordError.value = password.value ? null : 'Введите пароль';
};

const handleSubmit = () => {
  usernameError.value = validateUsernameUtil(username.value);
  passwordError.value = password.value ? null : 'Введите пароль';

  const hasErrors = usernameError.value || passwordError.value;
  if (hasErrors) {
    return;
  }

  apiError.value = null;
  isLoading.value = true;

  apiClient
    .post('/login', {
      username: username.value,
      password: password.value,
    })
    .then((response) => {
      const token = response.data.token;
      authStore.setToken(token);
      router.push({ name: 'my-bookings' });
    })
    .catch((error) => {
      const errorMessage =
        error.response?.data?.message || 'Неверный логин или пароль. Проверьте введенные данные и попробуйте снова';
      apiError.value = errorMessage;
    })
    .finally(() => {
      isLoading.value = false;
    });
};
</script>

<style scoped>
.login-page {
  max-width: 440px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
}

input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

input.error {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.error-message {
  display: block;
  color: #ff6b6b;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.submit-button {
  padding: 0.875rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  margin-top: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  font-family: inherit;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.register-link a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: underline;
  transition: color 0.3s ease;
}

.register-link a:hover {
  color: #fff;
}

/* Mobile styles */
@media (max-width: 768px) {
  .login-page {
    padding: 1rem;
  }

  .login-form {
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
}
</style>

