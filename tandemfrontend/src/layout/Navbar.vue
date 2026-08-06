<template>
  <nav class="navbar" v-if="authStore.isAuthenticated">
    <div class="navbar-container">
      <router-link :to="dashboardLink" class="brand-link">
        <span class="brand-mark" aria-hidden="true">T</span>
        <span class="brand-text-group">
          <span class="brand-text">Tándem</span>
          <span class="brand-sub">Grupo CREHCE</span>
        </span>
      </router-link>

      <!-- Menú desktop (visible en pantallas grandes) -->
      <div class="navbar-menu navbar-menu--desktop">
        <div class="nav-links">
          <template v-if="authStore.isAdmin">
            <router-link to="/dashboard" class="nav-link">
              <IconGrid class="nav-icon" /> Dashboard
            </router-link>
            <router-link to="/empresas" class="nav-link">
              <IconBuilding class="nav-icon" /> Clientes
            </router-link>
            <router-link to="/contratos" class="nav-link">
              <IconFile class="nav-icon" /> Contratos
            </router-link>
            <router-link to="/users" class="nav-link">
              <IconUser class="nav-icon" /> Usuarios
            </router-link>
            <router-link to="/asignar-cuestionarios" class="nav-link">
              <IconClipboard class="nav-icon" /> Cuestionarios
            </router-link>
            <router-link to="/cuestionarios-config" class="nav-link">
              <IconSettings class="nav-icon" /> Reactivos
            </router-link>
            <router-link to="/reportes" class="nav-link">
              <IconChart class="nav-icon" /> Reportes
            </router-link>
          </template>

          <template v-if="authStore.isCoordinator">
            <router-link to="/coordinador/dashboard" class="nav-link">
              <IconGrid class="nav-icon" /> Mi panel
            </router-link>
            <router-link to="/coordinador/empleados" class="nav-link">
              <IconUsers class="nav-icon" /> Empleados
            </router-link>
            <router-link to="/reportes" class="nav-link">
              <IconChart class="nav-icon" /> Reportes
            </router-link>
          </template>

          <template v-if="authStore.isEmployee">
            <router-link to="/empleado/dashboard" class="nav-link">
              <IconGrid class="nav-icon" /> Mi panel
            </router-link>
          </template>

          <template v-if="authStore.isCapturista">
            <router-link to="/digitalizacion" class="nav-link">
              <IconClipboard class="nav-icon" /> Digitalización
            </router-link>
          </template>
        </div>

        <div class="navbar-divider"></div>

        <div class="navbar-user">
          <div class="user-avatar">{{ userInitials }}</div>
          <div class="user-info">
            <span class="user-name">{{ authStore.user?.nom_usuario || authStore.user?.username }}</span>
            <span class="user-role">{{ getRoleLabel(authStore.user?.rol_usuario) }}</span>
          </div>
          <button class="logout-btn" @click="handleLogout" title="Cerrar sesión">
            <IconLogout class="logout-icon" />
          </button>
        </div>
      </div>

      <!-- Botón hamburguesa (solo en móvil) -->
      <button
        class="navbar-toggle"
        :class="{ 'is-open': isMenuOpen }"
        @click="isMenuOpen = !isMenuOpen"
        :aria-expanded="isMenuOpen"
        aria-label="Abrir menú"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- Overlay + panel móvil -->
    <Transition name="fade">
      <div v-if="isMenuOpen" class="mobile-overlay" @click="closeMenu"></div>
    </Transition>

    <Transition name="slide">
      <div v-if="isMenuOpen" class="mobile-panel">
        <div class="mobile-panel-header">
          <div class="user-avatar user-avatar--lg">{{ userInitials }}</div>
          <div class="user-info">
            <span class="user-name">{{ authStore.user?.nom_usuario || authStore.user?.username }}</span>
            <span class="user-role">{{ getRoleLabel(authStore.user?.rol_usuario) }}</span>
          </div>
        </div>

        <div class="mobile-links">
          <template v-if="authStore.isAdmin">
            <router-link to="/dashboard" class="nav-link" @click="closeMenu">
              <IconGrid class="nav-icon" /> Dashboard
            </router-link>
            <router-link to="/empresas" class="nav-link" @click="closeMenu">
              <IconBuilding class="nav-icon" /> Clientes
            </router-link>
            <router-link to="/contratos" class="nav-link" @click="closeMenu">
              <IconFile class="nav-icon" /> Contratos
            </router-link>
            <router-link to="/users" class="nav-link" @click="closeMenu">
              <IconUser class="nav-icon" /> Usuarios
            </router-link>
            <router-link to="/asignar-cuestionarios" class="nav-link" @click="closeMenu">
              <IconClipboard class="nav-icon" /> Cuestionarios
            </router-link>
            <router-link to="/cuestionarios-config" class="nav-link" @click="closeMenu">
              <IconSettings class="nav-icon" /> Reactivos
            </router-link>
            <router-link to="/reportes" class="nav-link" @click="closeMenu">
              <IconChart class="nav-icon" /> Reportes
            </router-link>
          </template>

          <template v-if="authStore.isCoordinator">
            <router-link to="/coordinador/dashboard" class="nav-link" @click="closeMenu">
              <IconGrid class="nav-icon" /> Mi panel
            </router-link>
            <router-link to="/coordinador/empleados" class="nav-link" @click="closeMenu">
              <IconUsers class="nav-icon" /> Empleados
            </router-link>
            <router-link to="/reportes" class="nav-link" @click="closeMenu">
              <IconChart class="nav-icon" /> Reportes
            </router-link>
          </template>

          <template v-if="authStore.isEmployee">
            <router-link to="/empleado/dashboard" class="nav-link" @click="closeMenu">
              <IconGrid class="nav-icon" /> Mi panel
            </router-link>
          </template>

          <template v-if="authStore.isCapturista">
            <router-link to="/digitalizacion" class="nav-link" @click="closeMenu">
              <IconClipboard class="nav-icon" /> Digitalización
            </router-link>
          </template>
        </div>

        <button class="logout-btn logout-btn--full" @click="handleLogout">
          <IconLogout class="logout-icon" /> Cerrar sesión
        </button>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();
const isMenuOpen = ref(false);

const closeMenu = () => { isMenuOpen.value = false; };

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const getRoleLabel = (role?: string) => {
  const roles: Record<string, string> = {
    ADMIN: 'Administrador',
    COORDINADOR: 'Coordinador',
    EMPLEADO: 'Empleado',
    CAPTURISTA: 'Capturista'
  };
  return roles[role || ''] || role || 'Usuario';
};

const dashboardLink = computed(() => {
  const role = authStore.user?.rol_usuario;
  if (role === 'ADMIN') return '/dashboard';
  if (role === 'COORDINADOR') return '/coordinador/dashboard';
  if (role === 'EMPLEADO') return '/empleado/dashboard';
  return '/';
});

const userInitials = computed(() => {
  const name = authStore.user?.nom_usuario || authStore.user?.username || '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]!.charAt(0) + parts[1]!.charAt(0)).toUpperCase();
});

// --- Iconos SVG ---
const svgIcon = (paths: string, viewBox = '0 0 24 24') =>
  (props: any) =>
    h('svg', {
      viewBox,
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.8',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      ...props,
    }, [h('g', { innerHTML: paths })]);

const IconGrid = svgIcon(
  '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'
);
const IconBuilding = svgIcon(
  '<rect x="4" y="3" width="16" height="18" rx="1"/><line x1="8" y1="7" x2="8" y2="7.01"/><line x1="12" y1="7" x2="12" y2="7.01"/><line x1="16" y1="7" x2="16" y2="7.01"/><line x1="8" y1="11" x2="8" y2="11.01"/><line x1="12" y1="11" x2="12" y2="11.01"/><line x1="16" y1="11" x2="16" y2="11.01"/><line x1="9" y1="21" x2="9" y2="17" /><line x1="15" y1="21" x2="15" y2="17"/><line x1="9" y1="17" x2="15" y2="17"/>'
);
const IconFile = svgIcon(
  '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>'
);
const IconUser = svgIcon(
  '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6"/>'
);
const IconUsers = svgIcon(
  '<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.2 3-5.5 6.5-5.5s6.5 2.3 6.5 5.5"/><circle cx="17" cy="8.5" r="2.6"/><path d="M15.5 14.7c2.7.4 4.5 2.3 4.5 5"/>'
);
const IconChart = svgIcon(
  '<line x1="4" y1="20" x2="20" y2="20"/><rect x="6" y="12" width="3" height="6"/><rect x="11" y="8" width="3" height="10"/><rect x="16" y="4" width="3" height="14"/>'
);
const IconClipboard = svgIcon(
  '<rect x="6" y="4" width="12" height="17" rx="1.5"/><rect x="9" y="2.3" width="6" height="3" rx="1"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="15" y2="15"/>'
);
const IconLogout = svgIcon(
  '<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/><polyline points="15 16 20 12 15 8"/><line x1="20" y1="12" x2="9" y2="12"/>'
);
const IconSettings = svgIcon(
  '<circle cx="12" cy="12" r="2.5"/><path d="M19.2 8.6a2.5 2.5 0 0 1 0 6.8"/><path d="M4.8 8.6a2.5 2.5 0 0 0 0 6.8"/><path d="M8.6 4.8a2.5 2.5 0 0 1 6.8 0"/><path d="M8.6 19.2a2.5 2.5 0 0 0 6.8 0"/>'
);
</script>

<style scoped>
.navbar {
  --ink: #161a2e;
  --muted: #6b7280;
  --border: #e7e9f0;
  --accent: #4f46e5;
  --accent-soft: #eef1ff;

  background: #ffffff;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

/* Marca */
.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--ink);
  flex-shrink: 0;
}

.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  font-weight: 700;
  font-size: 17px;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

.brand-text-group {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-text {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--ink);
}

.brand-sub {
  font-size: 11px;
  color: var(--muted);
  font-weight: 500;
}

/* Menú desktop */
.navbar-menu--desktop {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 8px;
  color: var(--muted);
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
}

.nav-icon {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.nav-link:hover {
  background: #f5f6fa;
  color: var(--ink);
}

.nav-link.router-link-active {
  background: var(--accent-soft);
  color: var(--accent);
}

.navbar-divider {
  width: 1px;
  height: 28px;
  background: var(--border);
  margin: 0 6px;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 12.5px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-avatar--lg {
  width: 44px;
  height: 44px;
  font-size: 15px;
}

.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
}

.user-role {
  font-size: 11px;
  color: var(--muted);
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 36px;
  height: 36px;
  background: #fef2f2;
  border: none;
  border-radius: 8px;
  color: #dc2626;
  cursor: pointer;
  transition: background 0.15s ease;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: #fde3e3;
}

.logout-icon {
  width: 17px;
  height: 17px;
}

.logout-btn--full {
  width: 100%;
  height: 44px;
  font-size: 14px;
  font-weight: 600;
  margin-top: 8px;
}

/* Hamburguesa - solo móvil */
.navbar-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}

.navbar-toggle span {
  width: 20px;
  height: 2px;
  background: var(--ink);
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.2s ease;
}

.navbar-toggle.is-open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.navbar-toggle.is-open span:nth-child(2) {
  opacity: 0;
}
.navbar-toggle.is-open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Overlay y panel móvil */
.mobile-overlay {
  position: fixed;
  inset: 0;
  top: 64px;
  background: rgba(15, 17, 33, 0.35);
  z-index: 998;
}

.mobile-panel {
  position: fixed;
  top: 64px;
  right: 0;
  bottom: 0;
  width: min(320px, 82vw);
  background: #ffffff;
  border-left: 1px solid var(--border);
  z-index: 999;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
}

.mobile-panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.mobile-links {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mobile-links .nav-link {
  padding: 12px 14px;
  font-size: 14px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* ✅ Responsive: hamburguesa en móvil */
@media (max-width: 992px) {
  .navbar-menu--desktop {
    display: none !important;
  }

  .navbar-toggle {
    display: flex !important;
  }
}

@media (max-width: 480px) {
  .navbar-container {
    padding: 0 12px;
  }
  
  .brand-text {
    font-size: 14px;
  }
  
  .brand-mark {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }
}
</style>