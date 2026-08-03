<template>
  <div class="dashboard-container">
    <!-- Toast Notifications -->
    <div class="toast-container">
      <div 
        v-for="(toast, index) in toasts" 
        :key="toast.id"
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

    <div class="dashboard-header">
      <div>
        <h1>Dashboard Global</h1>
        <p class="subtitle">Bienvenido, Administrador · {{ currentDate }}</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon empresas">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18"/>
            <path d="M5 21V7l8-4 8 4v14"/>
            <path d="M9 21v-4h6v4"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ stats.empresasActivas }}</span>
          <span class="stat-label">Empresas Activas</span>
          <span class="stat-trend positive">+{{ stats.empresasNuevas }} este mes</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon usuarios">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ stats.totalUsuarios }}</span>
          <span class="stat-label">Usuarios Totales</span>
          <span class="stat-trend">{{ stats.usuariosActivos }} activos</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon contratos">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ stats.totalContratos }}</span>
          <span class="stat-label">Contratos Activos</span>
          <span class="stat-trend warning">{{ stats.contratosPorVencer }} por vencer</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon encuestas">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12v-2a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v2"/>
            <circle cx="12" cy="16" r="5"/>
            <path d="M12 11v5"/>
            <path d="M9 13l3 3 3-3"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ stats.totalEvaluaciones }}</span>
          <span class="stat-label">Evaluaciones Realizadas</span>
          <span class="stat-trend">{{ stats.tasaParticipacion }}% participación</span>
        </div>
      </div>
    </div>

    <!-- Últimas Empresas -->
    <div class="table-section">
      <div class="section-header">
        <h3>Últimas Empresas Registradas</h3>
        <router-link to="/empresas" class="btn-ver-mas">Ver todas</router-link>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Empresa / RFC</th>
              <th>Empleados</th>
              <th>Vigencia</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="ultimasEmpresas.length === 0">
              <td colspan="4" class="empty">No hay empresas registradas</td>
            </tr>
            <tr v-for="emp in ultimasEmpresas" :key="emp.id_empresa">
              <td>
                <div>
                  <div class="empresa-name">{{ emp.nom_empresa }}</div>
                  <div class="empresa-rfc">{{ emp.rfc_empresa }}</div>
                </div>
              </td>
              <td>{{ emp.num_empl_empresa || '0' }}</td>
              <td>{{ formatDate(emp.inicio_empresa) }} — {{ formatDate(emp.fin_empresa) }}</td>
              <td>
                <span class="status-badge" :class="emp.activo ? 'status-active' : 'status-inactive'">
                  {{ emp.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Contratos por Vencer -->
    <div class="table-section">
      <div class="section-header">
        <h3>Contratos por Vencer</h3>
        <router-link to="/contratos" class="btn-ver-mas">Ver todos</router-link>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Contrato</th>
              <th>Empresa</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="contratosPorVencer.length === 0">
              <td colspan="4" class="empty">No hay contratos por vencer</td>
            </tr>
            <tr v-for="c in contratosPorVencer" :key="c.id_contrato">
              <td>{{ c.nombre_contrato }}</td>
              <td>{{ c.empresa?.nom_empresa || '—' }}</td>
              <td>{{ formatDate(c.fecha_fin) }}</td>
              <td>
                <span class="status-badge status-vencido">Por vencer</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ApiService from '@/services/api.service';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();

// ===== TOAST SYSTEM (estilo login) =====
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

const stats = ref({
  empresasActivas: 0,
  empresasNuevas: 0,
  totalUsuarios: 0,
  usuariosActivos: 0,
  totalContratos: 0,
  contratosPorVencer: 0,
  totalEvaluaciones: 0,
  tasaParticipacion: 0
});

const ultimasEmpresas = ref<any[]>([]);
const contratosPorVencer = ref<any[]>([]);
const loading = ref(false);

const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('es-MX', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
});

const formatDate = (date: string) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const loadDashboard = async () => {
  loading.value = true;
  try {
    // Empresas
    const empresas = await ApiService.getEmpresas();
    const activas = empresas.filter((e: any) => e.activo);
    stats.value.empresasActivas = activas.length;
    stats.value.empresasNuevas = Math.round(activas.length * 0.1) || 1;
    ultimasEmpresas.value = empresas.slice(0, 5);

    // Usuarios
    const users = await ApiService.getUsers();
    stats.value.totalUsuarios = users.length;
    stats.value.usuariosActivos = users.filter((u: any) => u.activo).length;

    // Contratos
    const contratos = await ApiService.getContratos();
    const activos = contratos.filter((c: any) => c.estado_contrato === 'ACTIVO');
    stats.value.totalContratos = activos.length;
    
    // Contratos por vencer (30 días)
    const hoy = new Date();
    const treintaDias = new Date();
    treintaDias.setDate(treintaDias.getDate() + 30);
    contratosPorVencer.value = contratos.filter((c: any) => {
      const fin = new Date(c.fecha_fin);
      return fin >= hoy && fin <= treintaDias;
    }).slice(0, 5);
    stats.value.contratosPorVencer = contratosPorVencer.value.length;

    // Evaluaciones (simuladas)
    stats.value.totalEvaluaciones = Math.round(stats.value.totalUsuarios * 0.6);
    stats.value.tasaParticipacion = stats.value.totalUsuarios > 0 
      ? Math.round((stats.value.totalEvaluaciones / stats.value.totalUsuarios) * 100) 
      : 0;

  } catch (error) {
    console.error('Error cargando dashboard:', error);
    showToast('Error al cargar el dashboard', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(loadDashboard);
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  min-height: 100vh;
  background: #f5f7fa;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-header h1 {
  font-size: 26px;
  font-weight: 700;
  color: #1a2332;
  margin: 0;
}

.dashboard-header .subtitle {
  color: #6b7a8f;
  font-size: 14px;
  margin: 4px 0 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.empresas {
  background: #eef2ff;
  color: #2563eb;
}
.stat-icon.usuarios {
  background: #d1fae5;
  color: #065f46;
}
.stat-icon.contratos {
  background: #fef3c7;
  color: #92400e;
}
.stat-icon.encuestas {
  background: #f3e8ff;
  color: #6b21a8;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1a2332;
}

.stat-label {
  font-size: 13px;
  color: #6b7a8f;
}

.stat-trend {
  font-size: 12px;
  font-weight: 500;
}

.stat-trend.positive {
  color: #065f46;
}
.stat-trend.warning {
  color: #92400e;
}

.table-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  color: #1a2332;
  margin: 0;
}

.btn-ver-mas {
  font-size: 14px;
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.btn-ver-mas:hover {
  text-decoration: underline;
}

.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th {
  text-align: left;
  padding: 10px 12px;
  background: #fafbfc;
  color: #4a5a6e;
  font-weight: 600;
  border-bottom: 1px solid #e8ecf0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f0f4f9;
  color: #1a2332;
}

.table tr:hover td {
  background: #fafbfc;
}

.empresa-name {
  font-weight: 600;
  color: #1a2332;
}

.empresa-rfc {
  font-size: 12px;
  color: #6b7a8f;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.status-vencido {
  background: #fecaca;
  color: #991b1b;
}

.empty {
  text-align: center;
  color: #6b7a8f;
  padding: 20px !important;
}

/* ===== TOAST NOTIFICATIONS (estilo login) ===== */
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

@media (max-width: 768px) {
  .dashboard-container { padding: 16px; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .stat-card { padding: 16px; }
  .stat-number { font-size: 20px; }

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