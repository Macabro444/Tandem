import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import ApiService from '@/services/api.service';

export interface User {
  id_usuario: number;
  nom_usuario?: string;
  ap_usuario?: string;
  username: string;
  email_usuario?: string;
  rol_usuario: 'ADMIN' | 'COORDINADOR' | 'EMPLEADO' | 'CAPTURISTA';
  id_empresa?: number;
  activo?: boolean;
  empresa?: {
    id_empresa: number;
    nom_empresa: string;
    rfc_empresa?: string;
  };
}

export interface LoginResponse {
  message: string;
  access_token: string;
  user: User;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.rol_usuario === 'ADMIN');
  const isCoordinator = computed(() => user.value?.rol_usuario === 'COORDINADOR');
  const isEmployee = computed(() => user.value?.rol_usuario === 'EMPLEADO');
  const isCapturista = computed(() => user.value?.rol_usuario === 'CAPTURISTA');

  function loadUserFromStorage() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }

  async function login(username: string, cont_usuario: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await ApiService.login(username, cont_usuario) as LoginResponse;

      token.value = response.access_token;

      // Guardar solo lo que viene del login (ya incluye empresa si la tiene)
      user.value = response.user;

      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      return { success: true, user: response.user };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al iniciar sesión';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async function verifyToken() {
    if (!token.value) return false;
    try {
      await ApiService.verifyToken();
      return true;
    } catch (error) {
      logout();
      return false;
    }
  }

  // Solo obtener el perfil del usuario, no cargar empresa aparte
  async function refreshUser() {
    if (!token.value) return;
    try {
      const userData = await ApiService.getMe();
      user.value = userData;
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {
      // Silenciado intencionalmente: si falla el refresco, se conserva el usuario actual
    }
  }

  loadUserFromStorage();

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    isCoordinator,
    isEmployee,
    isCapturista,
    login,
    logout,
    verifyToken,
    refreshUser,
    loadUserFromStorage
  };
});