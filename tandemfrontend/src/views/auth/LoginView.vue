<template>
  <div class="login-container">
    <!-- Toast Notifications -->
    <div class="toast-container">
      <div 
        v-for="(toast, index) in toasts" 
        :key="index"
        class="toast"
        :class="toast.type"
      >
        <div class="toast-content">
          <span class="toast-icon">
            <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <svg v-else-if="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <svg v-else-if="toast.type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" @click="removeToast(index)" aria-label="Cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="toast-progress" :style="{ animationDuration: toast.duration + 'ms' }"></div>
      </div>
    </div>

    <div class="login-card">
      <div class="login-header">
        <div class="logo-container">
          <h1 class="logo-title">Tándem</h1>
        </div>
        <p class="logo-subtitle">Evaluación Organizacional</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label">Usuario</label>
          <div class="input-icon-wrapper">
            <span class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </span>
            <input
              type="text"
              v-model="username"
              class="form-input"
              placeholder="Nombre de usuario"
              :disabled="isLoading"
              required
              autofocus
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Contraseña</label>
          <div class="input-icon-wrapper">
            <span class="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="cont_usuario"
              class="form-input"
              placeholder="Contraseña"
              :disabled="isLoading"
              required
              @keyup.enter="handleLogin"
            />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="rememberMe" />
            <span class="checkmark"></span>
            Recordarme
          </label>
          <router-link to="/recuperar-password" class="forgot-link">
            ¿Olvidaste tu contraseña?
          </router-link>
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Ingresar al Sistema</span>
        </button>
      </form>

      <div class="login-footer">
        <p>© 2025 Grupo CREHCE · Plataforma Tándem</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

const toasts = ref<Toast[]>([]);

const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 5000) => {
  const toast: Toast = {
    id: Date.now() + Math.random(),
    message,
    type,
    duration
  };

  toasts.value.push(toast);

  setTimeout(() => {
    const index = toasts.value.findIndex(t => t.id === toast.id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  }, duration);
};

const removeToast = (index: number) => {
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

const username = ref('');
const cont_usuario = ref('');
const rememberMe = ref(false);
const showPassword = ref(false);
const isLoading = ref(false);

const handleLogin = async () => {
  if (!username.value || !cont_usuario.value) {
    showToast('Por favor, ingresa tu usuario y contraseña', 'warning', 5000);
    return;
  }

  isLoading.value = true;

  const result = await authStore.login(username.value, cont_usuario.value);

  if (result.success) {
    showToast(`Bienvenido, ${result.user?.nom_usuario || username.value}`, 'success', 5000);

    const redirect = route.query.redirect as string || '/dashboard';
    setTimeout(() => {
      router.push(redirect);
    }, 800);
  } else {
    // No se limpian los campos ni se recarga la página:
    // el usuario puede corregir directamente lo que escribió.
    showToast(result.error || 'Credenciales incorrectas', 'error', 5000);
  }

  isLoading.value = false;
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 20px;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.login-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a2332;
  letter-spacing: -0.5px;
  margin: 0;
}

.logo-subtitle {
  color: #6b7a8f;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 1px;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  color: #4a5a6e;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.input-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #9ca3af;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 12px 40px;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  color: #1a2332;
  font-size: 15px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-toggle {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #4a5a6e;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #4a5a6e;
  font-size: 14px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  display: inline-block;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox-label input:checked + .checkmark {
  background: #2563eb;
  border-color: #2563eb;
}

.checkbox-label input:checked + .checkmark::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 6px;
  height: 10px;
  border-right: 2px solid #ffffff;
  border-bottom: 2px solid #ffffff;
}

.forgot-link {
  color: #2563eb;
  font-size: 14px;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: #2563eb;
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(37, 99, 235, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 32px;
  text-align: center;
  border-top: 1px solid #e5e7eb;
  padding-top: 24px;
}

.login-footer p {
  color: #6b7a8f;
  font-size: 13px;
  margin: 0;
}

/* ===== TOAST NOTIFICATIONS ===== */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 380px;
  width: 100%;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  animation: slideInRight 0.4s ease forwards;
  border-left: 4px solid #2563eb;
}

.toast.success {
  border-left-color: #22c55e;
}

.toast.error {
  border-left-color: #ef4444;
}

.toast.warning {
  border-left-color: #f59e0b;
}

.toast.info {
  border-left-color: #2563eb;
}

.toast-content {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  gap: 12px;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.toast.success .toast-icon {
  color: #22c55e;
}

.toast.error .toast-icon {
  color: #ef4444;
}

.toast.warning .toast-icon {
  color: #f59e0b;
}

.toast.info .toast-icon {
  color: #2563eb;
}

.toast-message {
  font-size: 14px;
  color: #1a2332;
  flex: 1;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.toast-close:hover {
  color: #4a5a6e;
}

.toast-progress {
  height: 3px;
  background: #2563eb;
  animation: progressBar linear forwards;
}

.toast.success .toast-progress {
  background: #22c55e;
}

.toast.error .toast-progress {
  background: #ef4444;
}

.toast.warning .toast-progress {
  background: #f59e0b;
}

@keyframes slideInRight {
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes progressBar {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 20px;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .toast-container {
    top: 10px;
    right: 10px;
    max-width: calc(100% - 20px);
  }

  .toast-content {
    padding: 12px 14px;
  }

  .toast-message {
    font-size: 13px;
  }
}
</style>