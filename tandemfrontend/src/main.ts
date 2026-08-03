import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { registerSW } from 'virtual:pwa-register';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount('#app');

// Registro del Service Worker: actualiza automáticamente cuando hay una nueva versión
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nueva versión disponible, se aplicará automáticamente.');
  },
  onOfflineReady() {
    console.log('Tándem está listo para funcionar sin conexión.');
  },
});