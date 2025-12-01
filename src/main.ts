import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Инициализация состояния авторизации при загрузке
// Store уже инициализирует токен из localStorage при создании,
// но вызываем restoreToken для гарантии синхронизации
const authStore = useAuthStore();
authStore.restoreToken();

app.mount('#app');

