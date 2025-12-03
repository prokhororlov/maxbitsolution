import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useRootStore } from './stores';
import './styles/variables.css';
import './styles/utilities.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const $ = useRootStore();
$.auth.restoreToken();

app.mount('#app');

