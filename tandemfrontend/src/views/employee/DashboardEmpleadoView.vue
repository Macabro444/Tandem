<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div>
        <h1>Mi Panel</h1>
        <p class="subtitle">Bienvenido, {{ authStore.user?.nom_usuario || 'Empleado' }}</p>
        <p v-if="empresaNombre" class="empresa-name">{{ empresaNombre }}</p>
      </div>
    </div>

    <div class="welcome-card">
      <div class="welcome-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <div class="welcome-text">
        <h2>¡Hola, {{ authStore.user?.nom_usuario || 'Usuario' }}!</h2>
        <p>Tu cuenta está activa y lista para participar en las evaluaciones.</p>
      </div>
    </div>

    <!-- Estado de Evaluaciones -->
    <div class="info-grid">
      <div class="info-card">
        <h3>📊 Estado de Evaluaciones</h3>
        <div class="info-item">
          <span class="label">Cuestionarios disponibles</span>
          <span class="value">{{ evaluaciones.cuestionarios_disponibles || 0 }}</span>
        </div>
        <div class="info-item">
          <span class="label">Completados</span>
          <span class="value">{{ evaluaciones.cuestionarios_completados || 0 }}</span>
        </div>
        <div class="info-item">
          <span class="label">Progreso total</span>
          <span class="value">{{ progreso }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progreso + '%' }"></div>
        </div>
      </div>

      <!-- Lista de Cuestionarios -->
      <div class="info-card cuestionarios-lista">
        <h3>📋 Mis Cuestionarios</h3>
        <div v-if="evaluaciones.cuestionarios?.length === 0" class="empty-text">
          No hay cuestionarios disponibles
        </div>
        <div v-for="cuest in evaluaciones.cuestionarios" :key="cuest.id_cuestionario" class="cuestionario-item">
          <div class="cuestionario-info">
            <span class="cuestionario-nombre">{{ cuest.nombre }}</span>
            <span class="cuestionario-tipo">{{ cuest.tipo_estudio }}</span>
          </div>
          <div class="cuestionario-estado">
            <span v-if="cuest.estado === 'COMPLETADO'" class="badge-completado">✅ Completado</span>
            <router-link v-else :to="`/cuestionario-pwa/${cuest.id_cuestionario}`" class="btn-responder">
              Responder
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="action-card">
      <h3>Acciones Rápidas</h3>
      <div class="action-grid">
        <button class="action-btn secondary" @click="handleLogout">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();
const API_URL = import.meta.env.VITE_FASTAPI_URL
  || (import.meta.env.PROD ? window.location.origin : 'http://localhost:8000');

const empresaNombre = ref('');
const evaluaciones = ref({
  cuestionarios_disponibles: 0,
  cuestionarios_completados: 0,
  cuestionarios: [] as any[]
});

const progreso = computed(() => {
  const total = evaluaciones.value.cuestionarios_disponibles + evaluaciones.value.cuestionarios_completados;
  return total > 0 ? Math.round((evaluaciones.value.cuestionarios_completados / total) * 100) : 0;
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const cargarDatos = async () => {
  try {
    const userId = authStore.user?.id_usuario;
    if (!userId) return;

    // Obtener evaluaciones del empleado
    const evalRes = await axios.get(`${API_URL}/api/empleado/evaluaciones/${userId}`);
    evaluaciones.value = evalRes.data;

    // Obtener nombre de la empresa
    if (authStore.user?.id_empresa) {
      try {
        const empresaRes = await axios.get(`${API_URL}/empresas/${authStore.user.id_empresa}`);
        empresaNombre.value = empresaRes.data?.nom_empresa || 'Sin empresa';
      } catch (e) {
        console.warn('Error cargando empresa:', e);
      }
    }
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
};

onMounted(async () => {
  if (!authStore.user) {
    await authStore.refreshUser();
  }
  await cargarDatos();
});
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

.welcome-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  margin-bottom: 24px;
}

.welcome-icon {
  width: 64px;
  height: 64px;
  background: #eef2ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.welcome-text h2 {
  font-size: 20px;
  color: #1a2332;
  margin: 0 0 4px 0;
}

.welcome-text p {
  color: #6b7a8f;
  font-size: 14px;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.info-card h3 {
  font-size: 16px;
  color: #1a2332;
  margin: 0 0 16px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f4f9;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  color: #6b7a8f;
}

.info-item .value {
  font-weight: 500;
  color: #1a2332;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e8ecf0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 12px;
}

.progress-fill {
  height: 100%;
  background: #2563eb;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.cuestionarios-lista {
  max-height: 400px;
  overflow-y: auto;
}

.empty-text {
  color: #6b7a8f;
  text-align: center;
  padding: 20px 0;
}

.cuestionario-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f4f9;
}

.cuestionario-item:last-child {
  border-bottom: none;
}

.cuestionario-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cuestionario-nombre {
  font-weight: 500;
  color: #1a2332;
  font-size: 14px;
}

.cuestionario-tipo {
  font-size: 12px;
  color: #6b7a8f;
}

.badge-completado {
  font-size: 13px;
  color: #22c55e;
  font-weight: 500;
}

.btn-responder {
  padding: 6px 16px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-responder:hover {
  background: #1d4ed8;
}

.action-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.action-card h3 {
  font-size: 16px;
  color: #1a2332;
  margin: 0 0 16px 0;
}

.action-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #4a5a6e;
}

.action-btn.secondary:hover {
  background: #e8ecf0;
}

@media (max-width: 768px) {
  .dashboard-container { padding: 16px; }
  .info-grid { grid-template-columns: 1fr; }
  .welcome-card { flex-direction: column; text-align: center; }
  .action-grid { flex-direction: column; }
  .action-btn { justify-content: center; }
}
</style>
