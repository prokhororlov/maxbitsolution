<template>
  <div class="login-page">
    <h1>Вход</h1>
    <form @submit.prevent="handleSubmit" class="login-form glass-card">
      <div class="form-group">
        <label for="username">Логин</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="Введите логин"
          :class="{ error: usernameError }"
          class="glass-input"
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
          class="glass-input"
          @blur="validatePassword"
        />
        <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
        <span v-if="apiError" class="error-message">{{ apiError }}</span>
      </div>
      <button type="submit" :disabled="isLoading" class="submit-button glass-button">Войти</button>
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
import { useRootStore } from '@/stores';
import { validateUsername as validateUsernameUtil } from '@/utils/validation';

const router = useRouter();
const $ = useRootStore();

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
  if (hasErrors) return;
  apiError.value = null;
  isLoading.value = true;
  $.auth
    .login(username.value, password.value)
    .then(() => router.push({ name: 'my-bookings' }))
    .catch((error) => {
      apiError.value = error.message || 'Неверный логин или пароль. Проверьте введенные данные и попробуйте снова';
    })
    .finally(() => { isLoading.value = false; });
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
  border-radius: var(--radius-2xl);
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-muted);
  font-size: 0.95rem;
}

input {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  font-family: inherit;
}

input::placeholder {
  color: var(--text-disabled);
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
  margin-top: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--text-lighter);
  font-size: 0.9rem;
}

.register-link a {
  color: var(--text-muted);
  text-decoration: underline;
  transition: var(--transition-fast);
}

.register-link a:hover {
  color: var(--text-primary);
}

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

