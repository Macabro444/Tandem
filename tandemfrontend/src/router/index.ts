import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/auth/LoginView.vue';
import { useAuthStore } from '../stores/auth.store';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  // Admin routes
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/admin/DashboardView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/empresas',
    name: 'empresas',
    component: () => import('../views/admin/EmpresasView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN', 'COORDINADOR'] }
  },
  {
    path: '/empresas/:id',
    name: 'empresa-detalle',
    component: () => import('../views/admin/EmpresaDetalleView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN', 'COORDINADOR'] }
  },
  {
    path: '/contratos',
    name: 'contratos',
    component: () => import('../views/admin/ContratosView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../views/admin/UsersView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/cuestionarios-config',
    name: 'cuestionarios-config',
    component: () => import('../views/admin/CuestionariosConfigView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/asignar-cuestionarios',
    name: 'asignar-cuestionarios',
    component: () => import('../views/admin/AsignarCuestionariosView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/gestion-cuestionarios',
    name: 'gestion-cuestionarios',
    component: () => import('../views/admin/CuestionariosConfigView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  // Coordinator routes
  {
    path: '/coordinador/dashboard',
    name: 'coordinador-dashboard',
    component: () => import('../views/coordinator/DashboardCoordinadorView.vue'),
    meta: { requiresAuth: true, roles: ['COORDINADOR'] }
  },
  {
    path: '/coordinador/empleados',
    name: 'coordinador-empleados',
    component: () => import('../views/coordinator/EmpleadosView.vue'),
    meta: { requiresAuth: true, roles: ['COORDINADOR'] }
  },
  // Employee routes
  {
    path: '/empleado/dashboard',
    name: 'empleado-dashboard',
    component: () => import('../views/employee/DashboardEmpleadoView.vue'),
    meta: { requiresAuth: true, roles: ['EMPLEADO'] }
  },
  // ✅ RUTA CORREGIDA - CON PARÁMETRO ID
  {
    path: '/cuestionario-pwa/:id?',
    name: 'cuestionario-pwa',
    component: () => import('../views/employee/CuestionarioPWAView.vue'),
    meta: { requiresAuth: true, roles: ['EMPLEADO'] }
  },
  {
    path: '/reportes',
    name: 'reportes',
    component: () => import('../views/admin/ReportesView.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN', 'COORDINADOR'] }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore();

  // Si requiere autenticación y no está autenticado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  // Si está autenticado y va a login, redirigir según rol
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    const userRol = authStore.user?.rol_usuario;
    if (userRol === 'ADMIN') {
      return '/dashboard';
    } else if (userRol === 'COORDINADOR') {
      return '/coordinador/dashboard';
    } else if (userRol === 'EMPLEADO') {
      return '/empleado/dashboard';
    } else if (userRol === 'CAPTURISTA') {
      return '/digitalizacion';
    }
    return '/login';
  }

  // Verificar roles de la ruta
  if (to.meta.requiresAuth && to.meta.roles) {
    const userRol = authStore.user?.rol_usuario ?? '';
    const rolesPermitidos = to.meta.roles as string[];
    
    if (!userRol || !rolesPermitidos.includes(userRol)) {
      const roleRoutes: Record<string, string> = {
        'ADMIN': '/dashboard',
        'COORDINADOR': '/coordinador/dashboard',
        'EMPLEADO': '/empleado/dashboard',
        'CAPTURISTA': '/digitalizacion'
      };
      return roleRoutes[userRol] || '/login';
    }
  }
});

export default router;