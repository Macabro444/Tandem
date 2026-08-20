<template>
  <div class="reportes-container">
    <!-- TOAST -->
    <div class="toast-container">
      <div 
        v-for="(toast, index) in toasts" 
        :key="toast.id"
        class="toast"
        :class="toast.type"
      >
        <div class="toast-content">
          <span class="toast-icon">
            <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <svg v-else-if="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <svg v-else-if="toast.type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" @click="removeToast(index)">✕</button>
        </div>
        <div class="toast-progress" :style="{ animationDuration: toast.duration + 'ms' }"></div>
      </div>
    </div>

    <!-- HEADER -->
    <div class="header">
      <h1>Reportes de Cuestionarios</h1>
      <p class="subtitle">Visualiza los resultados de los cuestionarios aplicados</p>
    </div>

    <!-- SELECTOR DE CUESTIONARIO -->
    <div class="selector-bar">
      <div class="filter-group">
        <label>Selecciona un cuestionario</label>
        <select v-model="cuestionarioSeleccionado" class="filter-select" @change="cargarDashboard">
          <option value="">-- Selecciona un cuestionario --</option>
          <option v-for="cuest in cuestionarios" :key="cuest.id_cuestionario" :value="String(cuest.id_cuestionario)">
            {{ cuest.nombre }} - {{ cuest.nom_empresa }} ({{ cuest.total_respuestas }} respuestas)
          </option>
        </select>
      </div>
      <div class="filter-group" v-if="dashboardData.cuestionario">
        <label>Total respuestas</label>
        <span class="badge-total">{{ dashboardData.total_encuestas || 0 }}</span>
      </div>
      <button class="btn-primary" @click="exportarCSV" :disabled="!cuestionarioSeleccionado || loading">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Exportar CSV
      </button>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando datos...</p>
    </div>

    <!-- DASHBOARD -->
    <div v-else-if="dashboardData.cuestionario" class="dashboard-content">
      <!-- Información del cuestionario -->
      <div class="info-cuestionario">
        <h2>{{ dashboardData.cuestionario.nombre }}</h2>
        <div class="info-tags">
          <span class="tag">{{ dashboardData.cuestionario.tipo_estudio }}</span>
          <span class="tag">{{ dashboardData.cuestionario.nom_empresa }}</span>
          <span class="tag">{{ dashboardData.total_encuestas }} respuestas</span>
        </div>
      </div>

      <!-- Resumen general -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Puntaje promedio</span>
          <span class="stat-value">{{ dashboardData.promedio_general || 0 }}</span>
          <span class="stat-sub">puntos</span>
        </div>
        <div class="stat-card" :style="{ borderLeftColor: dashboardData.semaforo_global?.color || '#ccc' }">
          <span class="stat-label">Nivel de Riesgo</span>
          <span class="stat-value" :style="{ color: dashboardData.semaforo_global?.color || '#333' }">
            {{ dashboardData.semaforo_global?.nivel || 'Sin datos' }}
          </span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Puntaje Máximo</span>
          <span class="stat-value">{{ dashboardData.puntaje_maximo || 0 }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Puntaje Mínimo</span>
          <span class="stat-value">{{ dashboardData.puntaje_minimo || 0 }}</span>
        </div>
      </div>

      <!-- Retroalimentación y estrategias -->
      <div class="insights-grid">
        <section class="insight-card feedback-card">
          <div class="insight-heading">
            <span class="insight-icon" aria-hidden="true">💬</span>
            <h3>Retroalimentación del resultado</h3>
          </div>
          <p>{{ dashboardData.retroalimentacion || 'No hay información suficiente para generar una retroalimentación.' }}</p>
        </section>

        <section class="insight-card strategy-card">
          <div class="insight-heading">
            <span class="insight-icon" aria-hidden="true">🎯</span>
            <h3>Estrategias recomendadas</h3>
          </div>
          <ul v-if="dashboardData.estrategias?.length">
            <li v-for="estrategia in dashboardData.estrategias" :key="estrategia">{{ estrategia }}</li>
          </ul>
          <p v-else>No hay estrategias disponibles para este resultado.</p>
        </section>

        <p class="guidance-note">
          Estas recomendaciones son orientaciones preventivas para apoyar la toma de decisiones y no constituyen un diagnóstico médico o psicológico.
        </p>
      </div>

      <!-- Distribución de Riesgo -->
      <div class="card">
        <h3>Distribución de Riesgo</h3>
        <div class="distribucion-bars">
          <div v-for="(count, nivel) in dashboardData.distribucion_riesgo" :key="nivel" class="bar-item">
            <span class="bar-label">{{ nivel }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ 
                width: (dashboardData.distribucion_riesgo_porcentual[nivel] || 0) + '%',
                backgroundColor: obtenerColorNivel(String(nivel))
              }"></div>
            </div>
            <span class="bar-value">{{ count }} ({{ dashboardData.distribucion_riesgo_porcentual[nivel] || 0 }}%)</span>
          </div>
        </div>
      </div>

      <!-- Resumen por Dimensiones -->
      <div class="card">
        <h3>Resumen por Dimensiones</h3>
        <div class="dimensiones-grid">
          <div v-for="dim in dashboardData.resumen_dimensiones" :key="dim.id_dimension" class="dimension-card">
            <div class="dimension-header">
              <span class="dimension-nombre">{{ dim.nombre_dimension }}</span>
              <span class="dimension-promedio">{{ dim.promedio }}</span>
            </div>
            <div class="dimension-bar">
              <div class="bar-fill" :style="{ 
                width: (dim.promedio / 4 * 100) + '%',
                backgroundColor: dim.semaforo?.color || '#2563eb'
              }"></div>
            </div>
            <span class="dimension-semaforo" :style="{ color: dim.semaforo?.color }">
              {{ dim.semaforo?.nivel || 'Sin datos' }}
            </span>
          </div>
        </div>
      </div>

      <!-- ✅ Frecuencias por Pregunta - MEJORADO -->
      <div class="card">
        <h3>Frecuencias por Pregunta</h3>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th style="min-width:200px;">Pregunta</th>
                <th style="min-width:120px;">Dimensión</th>
                <th style="width:70px;">Promedio</th>
                <th style="width:60px;">0</th>
                <th style="width:60px;">1</th>
                <th style="width:60px;">2</th>
                <th style="width:60px;">3</th>
                <th style="width:60px;">4</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="preg in dashboardData.frecuencias_preguntas" :key="preg.id_reactivo">
                <td class="pregunta-texto">{{ preg.texto || 'Sin texto' }}</td>
                <td><span class="dimension-tag">{{ preg.dimension || 'Sin dimensión' }}</span></td>
                <td><strong class="promedio-valor">{{ preg.promedio || 0 }}</strong></td>
                <td class="porcentaje-cell">{{ preg.porcentajes[0] || 0 }}%</td>
                <td class="porcentaje-cell">{{ preg.porcentajes[1] || 0 }}%</td>
                <td class="porcentaje-cell">{{ preg.porcentajes[2] || 0 }}%</td>
                <td class="porcentaje-cell">{{ preg.porcentajes[3] || 0 }}%</td>
                <td class="porcentaje-cell">{{ preg.porcentajes[4] || 0 }}%</td>
              </tr>
              <tr v-if="dashboardData.frecuencias_preguntas.length === 0">
                <td colspan="8" class="empty-cell">No hay datos de preguntas disponibles</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- VACÍO -->
    <div v-else class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="9" y1="9" x2="15" y2="9"/>
        <line x1="9" y1="13" x2="15" y2="13"/>
        <line x1="9" y1="17" x2="13" y2="17"/>
      </svg>
      <h3>Selecciona un cuestionario</h3>
      <p>Elige un cuestionario para ver sus resultados</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const API_URL = import.meta.env.VITE_FASTAPI_URL
  || (import.meta.env.PROD ? window.location.origin : 'http://localhost:8000');

// =============================================
// TOAST SYSTEM
// =============================================
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

const toasts = ref<Toast[]>([]);

const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 5000) => {
  const toast: Toast = { id: Date.now() + Math.random(), message, type, duration };
  toasts.value.push(toast);
  setTimeout(() => {
    const index = toasts.value.findIndex(t => t.id === toast.id);
    if (index > -1) toasts.value.splice(index, 1);
  }, duration);
};

const removeToast = (index: number) => {
  if (index > -1) toasts.value.splice(index, 1);
};

// =============================================
// ESTADO
// =============================================
const cuestionarios = ref<any[]>([]);
const cuestionarioSeleccionado = ref<string>('');
const dashboardData = ref<any>({
  cuestionario: null,
  total_encuestas: 0,
  promedio_general: 0,
  puntaje_maximo: 0,
  puntaje_minimo: 0,
  semaforo_global: { nivel: 'Sin datos', color: '#CCCCCC' },
  distribucion_riesgo: {},
  distribucion_riesgo_porcentual: {},
  resumen_dimensiones: [],
  frecuencias_preguntas: [],
  retroalimentacion: '',
  estrategias: []
});
const loading = ref(false);

const esAdmin = computed(() => authStore.user?.rol_usuario === 'ADMIN');
const idEmpresa = computed(() => authStore.user?.id_empresa);

// =============================================
// MÉTODOS
// =============================================
const cargarCuestionarios = async () => {
  loading.value = true;
  try {
    let url = `${API_URL}/api/reportes/cuestionarios`;
    
    if (!esAdmin.value && idEmpresa.value) {
      url += `?id_empresa=${idEmpresa.value}`;
    }
    
    const res = await axios.get(url);
    cuestionarios.value = res.data || [];
    
    if (cuestionarios.value.length === 1) {
      cuestionarioSeleccionado.value = String(cuestionarios.value[0].id_cuestionario);
      await cargarDashboard();
    }
  } catch (error: any) {
    console.error('Error cargando cuestionarios:', error);
    showToast('Error al cargar cuestionarios', 'error');
  } finally {
    loading.value = false;
  }
};

const cargarDashboard = async () => {
  if (!cuestionarioSeleccionado.value) {
    dashboardData.value = {
      cuestionario: null,
      total_encuestas: 0,
      promedio_general: 0,
      puntaje_maximo: 0,
      puntaje_minimo: 0,
      semaforo_global: { nivel: 'Sin datos', color: '#CCCCCC' },
      distribucion_riesgo: {},
      distribucion_riesgo_porcentual: {},
      resumen_dimensiones: [],
      frecuencias_preguntas: [],
      retroalimentacion: '',
      estrategias: []
    };
    return;
  }
  
  loading.value = true;
  try {
    const idCuestionario = Number(cuestionarioSeleccionado.value);
    
    const res = await axios.get(`${API_URL}/api/reportes/dashboard-cuestionario`, {
      params: { id_cuestionario: idCuestionario }
    });
    dashboardData.value = res.data || {};
    
    // ✅ Log para depuración
    console.log('📊 Datos del dashboard:', dashboardData.value);
  } catch (error: any) {
    console.error('Error cargando dashboard:', error);
    showToast('Error al cargar datos del cuestionario', 'error');
    dashboardData.value = {
      cuestionario: null,
      total_encuestas: 0,
      promedio_general: 0,
      puntaje_maximo: 0,
      puntaje_minimo: 0,
      semaforo_global: { nivel: 'Sin datos', color: '#CCCCCC' },
      distribucion_riesgo: {},
      distribucion_riesgo_porcentual: {},
      resumen_dimensiones: [],
      frecuencias_preguntas: [],
      retroalimentacion: '',
      estrategias: []
    };
  } finally {
    loading.value = false;
  }
};

const exportarCSV = async () => {
  if (!cuestionarioSeleccionado.value) return;
  
  loading.value = true;
  try {
    const idCuestionario = Number(cuestionarioSeleccionado.value);
    
    const res = await axios.get(`${API_URL}/api/reportes/exportar-cuestionario`, {
      params: { id_cuestionario: idCuestionario }
    });
    
    if (res.data.csv_data) {
      const blob = new Blob([res.data.csv_data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = res.data.filename || `reporte_${cuestionarioSeleccionado.value}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Reporte exportado correctamente', 'success');
    }
  } catch (error: any) {
    console.error('Error exportando:', error);
    showToast('Error al exportar el reporte', 'error');
  } finally {
    loading.value = false;
  }
};

const obtenerColorNivel = (nivel: string): string => {
  const colores: Record<string, string> = {
    'Nulo': '#00E676',
    'Bajo': '#AEEA00',
    'Medio': '#FFD600',
    'Alto': '#FF6D00',
    'Muy Alto': '#D50000'
  };
  return colores[nivel] || '#6b7280';
};

onMounted(() => {
  cargarCuestionarios();
});
</script>

<style scoped>
.reportes-container {
  padding: 24px;
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  margin-bottom: 24px;
}
.header h1 {
  font-size: 26px;
  font-weight: 700;
  color: #1a2332;
  margin: 0;
}
.header .subtitle {
  color: #6b7a8f;
  font-size: 14px;
  margin: 4px 0 0;
}

/* Selector */
.selector-bar {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 24px;
  align-items: flex-end;
  flex-wrap: wrap;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: #4a5a6e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  min-width: 300px;
  background: #fff;
}
.badge-total {
  padding: 8px 16px;
  background: #eef2ff;
  color: #2563eb;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #1d4ed8; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e8ecf0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Dashboard */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-cuestionario {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.info-cuestionario h2 {
  font-size: 20px;
  color: #1a2332;
  margin: 0 0 8px 0;
}
.info-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tag {
  padding: 4px 12px;
  background: #f0f4f9;
  border-radius: 12px;
  font-size: 12px;
  color: #4a5a6e;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  border-left: 4px solid #2563eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.stat-label {
  font-size: 12px;
  color: #6b7a8f;
  text-transform: uppercase;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a2332;
  display: block;
}
.stat-sub {
  font-size: 14px;
  color: #6b7a8f;
}

/* Retroalimentación y estrategias */
.insights-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.insight-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border-top: 4px solid #2563eb;
}
.strategy-card { border-top-color: #0f766e; }
.insight-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.insight-heading h3 {
  margin: 0;
  color: #1a2332;
  font-size: 16px;
}
.insight-icon { font-size: 20px; }
.insight-card p,
.insight-card li {
  color: #4a5a6e;
  font-size: 14px;
  line-height: 1.6;
}
.insight-card p { margin: 0; }
.insight-card ul {
  margin: 0;
  padding-left: 20px;
}
.insight-card li + li { margin-top: 6px; }
.guidance-note {
  grid-column: 1 / -1;
  margin: -4px 0 0;
  padding: 10px 14px;
  border-radius: 8px;
  background: #eef2ff;
  color: #4f5f79;
  font-size: 12px;
}

/* Cards */
.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.card h3 {
  font-size: 16px;
  color: #1a2332;
  margin: 0 0 16px 0;
}

/* Distribución */
.distribucion-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.bar-label {
  min-width: 80px;
  font-size: 13px;
  font-weight: 500;
}
.bar-track {
  flex: 1;
  height: 20px;
  background: #f0f4f9;
  border-radius: 10px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}
.bar-value {
  min-width: 80px;
  font-size: 13px;
  color: #4a5a6e;
}

/* Dimensiones */
.dimensiones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.dimension-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px 16px;
}
.dimension-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dimension-nombre {
  font-weight: 500;
  font-size: 13px;
  color: #1a2332;
}
.dimension-promedio {
  font-weight: 700;
  font-size: 16px;
  color: #2563eb;
}
.dimension-bar {
  height: 6px;
  background: #e8ecf0;
  border-radius: 3px;
  margin: 8px 0;
  overflow: hidden;
}
.dimension-bar .bar-fill {
  height: 100%;
  border-radius: 3px;
}
.dimension-semaforo {
  font-size: 12px;
  font-weight: 500;
}

/* ✅ Tabla - CORREGIDA para mejor visibilidad */
.table-container {
  overflow-x: auto;
  border: 1px solid #e8ecf0;
  border-radius: 8px;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  background: #fff;
}
.table th {
  padding: 12px 14px;
  text-align: left;
  background: #f1f4f9;
  border-bottom: 2px solid #d1d5db;
  color: #1a2332;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
  z-index: 1;
}
.table td {
  padding: 12px 14px;
  border-bottom: 1px solid #f0f4f9;
  color: #1a2332;
  background: #fff;
}
.table tr:hover td {
  background: #f8fafc;
}
.table tr:last-child td {
  border-bottom: none;
}

.pregunta-texto {
  max-width: 300px;
  color: #1a2332;
  font-weight: 500;
  word-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
}

.dimension-tag {
  display: inline-block;
  padding: 3px 10px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.promedio-valor {
  color: #2563eb;
  font-size: 15px;
}

.porcentaje-cell {
  font-weight: 500;
  color: #1a2332;
  text-align: center;
}

.empty-cell {
  text-align: center;
  padding: 30px !important;
  color: #6b7a8f;
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.empty-state h3 {
  color: #1a2332;
  margin: 16px 0 8px 0;
}
.empty-state p {
  color: #6b7a8f;
}

/* TOAST */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 380px;
  pointer-events: none;
}
.toast {
  pointer-events: auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  overflow: hidden;
  animation: slideInRight 0.4s ease forwards;
  border-left: 4px solid #2563eb;
}
.toast.success { border-left-color: #22c55e; }
.toast.error { border-left-color: #ef4444; }
.toast.warning { border-left-color: #f59e0b; }
.toast-content {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  gap: 12px;
}
.toast-icon { flex-shrink: 0; }
.toast.success .toast-icon { color: #22c55e; }
.toast.error .toast-icon { color: #ef4444; }
.toast.warning .toast-icon { color: #f59e0b; }
.toast.info .toast-icon { color: #2563eb; }
.toast-message { flex: 1; font-size: 14px; color: #1a2332; }
.toast-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #9ca3af;
  cursor: pointer;
}
.toast-progress {
  height: 3px;
  background: #2563eb;
  animation: progressBar linear forwards;
}
@keyframes slideInRight {
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0%); opacity: 1; }
}
@keyframes progressBar {
  from { width: 100%; }
  to { width: 0%; }
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .reportes-container { padding: 16px; }
  .selector-bar { flex-direction: column; align-items: stretch; }
  .filter-select { min-width: 100%; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .insights-grid { grid-template-columns: 1fr; }
  .dimensiones-grid { grid-template-columns: 1fr; }
  .pregunta-texto { max-width: 150px; font-size: 12px; }
  .table th, .table td { padding: 8px 10px; font-size: 12px; }
}
</style>
