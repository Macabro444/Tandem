<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div>
        <h1>Panel de Coordinador</h1>
        <p class="subtitle">Bienvenido, {{ authStore.user?.nom_usuario || 'Coordinador' }}</p>
        <p class="empresa-name">{{ empresa?.nom_empresa || 'Cargando...' }}</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon licencias">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ licencias.disponibles }}</span>
          <span class="stat-label">Licencias Disponibles</span>
          <span class="stat-trend">de {{ licencias.total }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon empleados">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ stats.empleadosRegistrados }}</span>
          <span class="stat-label">Empleados Registrados</span>
          <span class="stat-trend">{{ stats.empleadosActivos }} activos</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon evaluaciones">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12v-2a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v2"/>
            <circle cx="12" cy="16" r="5"/>
            <path d="M12 11v5"/>
            <path d="M9 13l3 3 3-3"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ stats.evaluacionesCompletadas }}</span>
          <span class="stat-label">Evaluaciones Completadas</span>
          <span class="stat-trend">{{ stats.tasaParticipacion }}% participación</span>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-section">
      <div class="progress-header">
        <span>Progreso de Evaluaciones</span>
        <span>{{ stats.evaluacionesCompletadas }} / {{ stats.empleadosRegistrados * totalCuestionarios || 1 }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: stats.tasaParticipacion + '%' }"></div>
      </div>
    </div>

    <!-- Últimos Empleados -->
    <div class="table-section">
      <div class="section-header">
        <h3>Últimos Empleados Registrados</h3>
        <router-link to="/coordinador/empleados" class="btn-ver-mas">Ver todos</router-link>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4" class="empty">Cargando empleados...</td>
            </tr>
            <tr v-else-if="ultimasAltas.length === 0">
              <td colspan="4" class="empty">No hay empleados registrados en tu empresa</td>
            </tr>
            <tr v-for="user in ultimasAltas" :key="user.id_usuario">
              <td>{{ user.nom_usuario }} {{ user.ap_usuario }}</td>
              <td>{{ user.email_usuario }}</td>
              <td>
                <span class="role-badge" :class="getRoleClass(user.rol_usuario)">
                  {{ getRoleLabel(user.rol_usuario) }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="user.activo ? 'status-active' : 'status-inactive'">
                  {{ user.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ApiService from '@/services/api.service';
import { useAuthStore } from '@/stores/auth.store';
import axios from 'axios';

const authStore = useAuthStore();
const PYTHON_API = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000';

const empresa = ref<any>(null);
const licencias = ref({ total: 0, disponibles: 0 });
const stats = ref({
  empleadosRegistrados: 0,
  empleadosActivos: 0,
  evaluacionesCompletadas: 0,
  tasaParticipacion: 0
});
const totalCuestionarios = ref(0);
const ultimasAltas = ref<any[]>([]);
const loading = ref(false);

const getRoleLabel = (rol: string) => {
  const roles: Record<string, string> = {
    'ADMIN': 'Administrador',
    'COORDINADOR': 'Coordinador',
    'EMPLEADO': 'Empleado',
    'CAPTURISTA': 'Capturista'
  };
  return roles[rol] || rol;
};

const getRoleClass = (rol: string) => {
  const classes: Record<string, string> = {
    'ADMIN': 'role-admin',
    'COORDINADOR': 'role-coordinator',
    'EMPLEADO': 'role-employee',
    'CAPTURISTA': 'role-capturista'
  };
  return classes[rol] || '';
};

const loadDashboard = async () => {
  loading.value = true;
  try {
    const empresaId = authStore.user?.id_empresa;
    if (!empresaId) {
      console.warn('No hay empresa asignada al coordinador');
      loading.value = false;
      return;
    }

    // 1. Obtener datos de la empresa
    empresa.value = await ApiService.getEmpresa(empresaId);

    // 2. Obtener licencias
    try {
      const lic = await ApiService.getLicenciasByEmpresa(empresaId);
      licencias.value = {
        total: lic.total_licencias || 0,
        disponibles: lic.licencias_disponibles || 0
      };
    } catch (e) {
      console.warn('Licencias no disponibles:', e);
      licencias.value = { total: 0, disponibles: 0 };
    }

    // 3. Obtener empleados de la empresa (SOLO EMPLEADOS)
    try {
      const empleados = await ApiService.getUsersByEmpresa(empresaId);
      const soloEmpleados = empleados.filter((u: any) => u.rol_usuario === 'EMPLEADO');
      
      stats.value.empleadosRegistrados = soloEmpleados.length;
      stats.value.empleadosActivos = soloEmpleados.filter((u: any) => u.activo === true).length;

      // 4. ÚLTIMOS 3 empleados
      ultimasAltas.value = soloEmpleados
        .sort((a: any, b: any) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 3);

      // 5. OBTENER EVALUACIONES REALES DESDE PYTHON
      try {
        const evalRes = await axios.get(`${PYTHON_API}/api/coordinador/evaluaciones/${empresaId}`);
        const data = evalRes.data;
        
        // Guardar datos
        totalCuestionarios.value = data.total_cuestionarios || 0;
        stats.value.evaluacionesCompletadas = data.total_completados || 0;
        stats.value.tasaParticipacion = Math.round(data.tasa_participacion || 0);
          
        console.log('📊 Evaluaciones obtenidas:', data);
        console.log('📊 Empleados:', soloEmpleados.length);
        console.log('📊 Cuestionarios:', data.total_cuestionarios);
      } catch (e) {
        console.warn('Error obteniendo evaluaciones:', e);
        stats.value.evaluacionesCompletadas = 0;
        stats.value.tasaParticipacion = 0;
        totalCuestionarios.value = 0;
      }

    } catch (e) {
      console.warn('Error obteniendo empleados:', e);
      stats.value.empleadosRegistrados = 0;
      stats.value.empleadosActivos = 0;
      ultimasAltas.value = [];
    }

  } catch (error) {
    console.error('Error cargando dashboard:', error);
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

.dashboard-header .empresa-name {
  color: #2563eb;
  font-weight: 600;
  font-size: 16px;
  margin-top: 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.stat-icon.licencias {
  background: #eef2ff;
  color: #2563eb;
}
.stat-icon.empleados {
  background: #d1fae5;
  color: #065f46;
}
.stat-icon.evaluaciones {
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
  color: #6b7a8f;
}

.progress-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #4a5a6e;
  margin-bottom: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e8ecf0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2563eb;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.table-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
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

.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.role-admin {
  background: #fef3c7;
  color: #92400e;
}
.role-coordinator {
  background: #dbeafe;
  color: #1e40af;
}
.role-employee {
  background: #d1fae5;
  color: #065f46;
}
.role-capturista {
  background: #f3e8ff;
  color: #6b21a8;
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

.empty {
  text-align: center;
  color: #6b7a8f;
  padding: 20px !important;
}

@media (max-width: 768px) {
  .dashboard-container { padding: 16px; }
  .stats-grid { grid-template-columns: 1fr; }
  .stat-card { padding: 16px; }
  .stat-number { font-size: 20px; }
}
</style>
