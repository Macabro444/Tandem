<template>
  <div class="gestion-container">
    <!-- TOAST NOTIFICATIONS -->
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
          <button class="toast-close" @click="removeToast(index)" aria-label="Cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="toast-progress" :style="{ animationDuration: toast.duration + 'ms' }"></div>
      </div>
    </div>

    <!-- HEADER -->
    <div class="header">
      <div>
        <h1>Gestión de Cuestionarios</h1>
        <p class="subtitle">Crea y administra cuestionarios para los empleados</p>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nuevo Cuestionario
      </button>
    </div>

    <!-- Lista de cuestionarios -->
    <div class="cuestionarios-grid">
      <div v-for="cuest in cuestionarios" :key="cuest.id_cuestionario" class="cuestionario-card">
        <div class="card-header">
          <h3>{{ cuest.nombre }}</h3>
          <span class="status-badge" :class="cuest.activo ? 'active' : 'inactive'">
            {{ cuest.activo ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
        <div class="card-body">
          <p><strong>Tipo:</strong> {{ cuest.tipo_estudio }}</p>
          <p><strong>Reactivos:</strong> {{ cuest.total_reactivos || 0 }}</p>
          <p><strong>Fecha:</strong> {{ formatDate(cuest.fecha_creacion) }}</p>
        </div>
        <div class="card-actions">
          <button class="btn-icon btn-asignar" @click="asignarReactivos(cuest)" title="Asignar reactivos">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
          <button class="btn-icon" @click="editCuestionario(cuest)" title="Editar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7a8f" stroke-width="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
          <button class="btn-icon btn-danger" @click="deleteCuestionario(cuest.id_cuestionario)" title="Eliminar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      <div v-if="cuestionarios.length === 0" class="empty-state">
        <p>No hay cuestionarios creados</p>
      </div>
    </div>

    <!-- MODAL CREAR/EDITAR -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editando ? 'Editar Cuestionario' : 'Nuevo Cuestionario' }}</h2>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <form @submit.prevent="saveCuestionario">
          <div class="form-group">
            <label>Nombre del Cuestionario *</label>
            <input type="text" v-model="formData.nombre" required placeholder="Ej: Evaluación Enero-Abril 2024" />
          </div>
          <div class="form-group">
            <label>Tipo de Estudio *</label>
            <select v-model="formData.tipo_estudio" required>
              <option value="NOM_035">NOM-035</option>
              <option value="CLIMA_LABORAL">Clima Laboral</option>
            </select>
          </div>
          <div class="form-group">
            <label>Empresa *</label>
            <select v-model="formData.id_empresa" required>
              <option v-for="emp in empresas" :key="emp.id_empresa" :value="emp.id_empresa">
                {{ emp.nom_empresa }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Activo</label>
            <select v-model="formData.activo">
              <option :value="true">Activo</option>
              <option :value="false">Inactivo</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-outline" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL ASIGNAR REACTIVOS -->
    <div v-if="showAsignarModal" class="modal-overlay" @click.self="closeAsignarModal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h2>Asignar Reactivos: {{ cuestionarioSeleccionado?.nombre }}</h2>
          <button class="modal-close" @click="closeAsignarModal">✕</button>
        </div>

        <div class="filters-bar">
          <div class="filter-group">
            <label>Filtrar por dimensión</label>
            <select v-model="filtroDimension" class="filter-select">
              <option value="">Todas</option>
              <option v-for="dim in dimensionesFiltradas" :key="dim.id_dimension" :value="dim.id_dimension">
                {{ dim.nombre_dimension }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>Buscar</label>
            <input type="text" v-model="searchTerm" placeholder="Buscar..." class="filter-input" />
          </div>
          <div class="filter-group">
            <label>Seleccionados</label>
            <span class="seleccionados-count">{{ reactivosSeleccionados }} seleccionados</span>
          </div>
          <div class="filter-group" style="margin-left: auto;">
            <span class="total-reactivos-info">Total: {{ totalReactivos }} reactivos</span>
          </div>
        </div>

        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th style="width:40px;">
                  <input type="checkbox" v-model="selectAll" @change="toggleAll" />
                </th>
                <th style="width:60px;">ID</th>
                <th>Pregunta</th>
                <th style="width:150px;">Dimensión</th>
                <th style="width:80px;">Sección</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reactivo in reactivosFiltrados" :key="reactivo.id_reactivo">
                <td><input type="checkbox" v-model="reactivo.seleccionado" @change="actualizarSeleccionados" /></td>
                <td><span class="id-cell">#{{ reactivo.id_reactivo }}</span></td>
                <td class="texto-cell">{{ reactivo.texto_reactivo }}</td>
                <td><span class="dimension-cell">{{ reactivo.nombre_dimension || '—' }}</span></td>
                <td><span class="badge">{{ reactivo.seccion || reactivo.num_seccion || '—' }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="form-actions">
          <span class="total-reactivos">{{ reactivosSeleccionados }} de {{ totalReactivos }} reactivos seleccionados</span>
          <button type="button" class="btn-outline" @click="closeAsignarModal">Cancelar</button>
          <button type="button" class="btn-primary" @click="guardarAsignacion" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Guardar Asignación' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

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
// CONSTANTES
// =============================================
const API_URL = import.meta.env.VITE_FASTAPI_URL
  || (import.meta.env.PROD ? window.location.origin : 'http://localhost:8000');

// =============================================
// ESTADO
// =============================================
const cuestionarios = ref<any[]>([]);
const empresas = ref<any[]>([]);
const dimensiones = ref<any[]>([]);
const loading = ref(false);
const editando = ref(false);

// Modal
const showModal = ref(false);
const showAsignarModal = ref(false);
const cuestionarioSeleccionado = ref<any>(null);

// ✅ formData con id_cuestionario
const formData = ref({
  id_cuestionario: null as number | null,
  nombre: '',
  tipo_estudio: 'NOM_035',
  id_empresa: 1,
  activo: true
});

// Asignación
const filtroDimension = ref('');
const searchTerm = ref('');
const selectAll = ref(false);
const reactivosSeleccionados = ref(0);

// =============================================
// COMPUTED
// =============================================

// ✅ Solo dimensiones que coinciden con el tipo de estudio del cuestionario
const dimensionesFiltradas = computed(() => {
  if (!cuestionarioSeleccionado.value) return dimensiones.value;
  const tipo = cuestionarioSeleccionado.value.tipo_estudio;
  return dimensiones.value.filter(d => d.tipo_cuestionario === tipo);
});

// ✅ Reactivos filtrados por dimensión y búsqueda
const reactivosFiltrados = computed(() => {
  let result: any[] = [];
  
  // Solo reactivos de dimensiones del tipo correcto
  const dimsFiltradas = dimensionesFiltradas.value;
  for (const dim of dimsFiltradas) {
    if (dim.reactivos) {
      result = result.concat(dim.reactivos);
    }
  }
  
  // Filtrar por dimensión específica
  if (filtroDimension.value) {
    result = result.filter(r => r.id_dimension === Number(filtroDimension.value));
  }
  
  // Filtrar por búsqueda
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    result = result.filter(r => r.texto_reactivo.toLowerCase().includes(term));
  }
  
  return result;
});

const totalReactivos = computed(() => {
  let total = 0;
  for (const dim of dimensionesFiltradas.value) {
    if (dim.reactivos) total += dim.reactivos.length;
  }
  return total;
});

// =============================================
// MÉTODOS
// =============================================
const cargarCuestionarios = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${API_URL}/api/cuestionarios`);
    cuestionarios.value = res.data || [];
  } catch (error) {
    console.error('Error cargando cuestionarios:', error);
    showToast('Error al cargar cuestionarios', 'error');
  } finally {
    loading.value = false;
  }
};

const cargarEmpresas = async () => {
  try {
    const res = await axios.get(`${API_URL}/empresas`);
    empresas.value = res.data || [];
    if (empresas.value.length > 0) {
      formData.value.id_empresa = empresas.value[0].id_empresa;
    }
  } catch (error) {
    console.error('Error cargando empresas:', error);
    showToast('Error al cargar empresas', 'error');
  }
};

const cargarDimensiones = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/dimensiones`);
    const dims = res.data || [];
    
    for (const dim of dims) {
      const reactRes = await axios.get(`${API_URL}/api/reactivos?id_dimension=${dim.id_dimension}`);
      dim.reactivos = reactRes.data || [];
      for (const r of (dim.reactivos || [])) {
        r.seleccionado = false;
        // Asegurar que tenga el nombre de dimensión
        r.nombre_dimension = dim.nombre_dimension;
      }
    }
    
    dimensiones.value = dims;
  } catch (error) {
    console.error('Error cargando dimensiones:', error);
    showToast('Error al cargar dimensiones', 'error');
  }
};

const formatDate = (date: string) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('es-MX');
};

const openCreateModal = () => {
  editando.value = false;
  formData.value = {
    id_cuestionario: null,
    nombre: '',
    tipo_estudio: 'NOM_035',
    id_empresa: empresas.value[0]?.id_empresa || 1,
    activo: true
  };
  showModal.value = true;
};

const editCuestionario = (cuestionario: any) => {
  editando.value = true;
  formData.value = {
    id_cuestionario: cuestionario.id_cuestionario,
    nombre: cuestionario.nombre,
    tipo_estudio: cuestionario.tipo_estudio,
    id_empresa: cuestionario.id_empresa,
    activo: cuestionario.activo
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveCuestionario = async () => {
  loading.value = true;
  try {
    if (editando.value && formData.value.id_cuestionario) {
      await axios.put(`${API_URL}/api/cuestionarios/${formData.value.id_cuestionario}`, {
        nombre: formData.value.nombre,
        tipo_estudio: formData.value.tipo_estudio,
        activo: formData.value.activo
      });
      showToast('Cuestionario actualizado correctamente', 'success');
    } else {
      await axios.post(`${API_URL}/api/cuestionarios`, {
        nombre: formData.value.nombre,
        tipo_estudio: formData.value.tipo_estudio,
        id_empresa: formData.value.id_empresa,
        activo: formData.value.activo
      });
      showToast('Cuestionario creado correctamente', 'success');
    }
    await cargarCuestionarios();
    closeModal();
  } catch (error: any) {
    console.error('Error guardando:', error);
    showToast(`Error: ${error.response?.data?.detail || error.message}`, 'error');
  } finally {
    loading.value = false;
  }
};

const deleteCuestionario = async (id: number) => {
  if (!confirm('¿Eliminar este cuestionario?')) return;
  
  loading.value = true;
  try {
    await axios.delete(`${API_URL}/api/cuestionarios/${id}`);
    await cargarCuestionarios();
    showToast('Cuestionario eliminado correctamente', 'success');
  } catch (error: any) {
    console.error('Error eliminando:', error);
    showToast(`Error: ${error.response?.data?.detail || error.message}`, 'error');
  } finally {
    loading.value = false;
  }
};

const actualizarSeleccionados = () => {
  let count = 0;
  for (const dim of dimensionesFiltradas.value) {
    for (const reactivo of (dim.reactivos || [])) {
      if (reactivo.seleccionado) count++;
    }
  }
  reactivosSeleccionados.value = count;
};

const asignarReactivos = async (cuestionario: any) => {
  cuestionarioSeleccionado.value = cuestionario;
  showAsignarModal.value = true;
  reactivosSeleccionados.value = 0;
  selectAll.value = false;
  
  // Resetear selecciones en todas las dimensiones
  for (const dim of dimensiones.value) {
    for (const reactivo of (dim.reactivos || [])) {
      reactivo.seleccionado = false;
    }
  }
  
  // Cargar reactivos asignados actualmente
  try {
    const res = await axios.get(`${API_URL}/api/cuestionarios/${cuestionario.id_cuestionario}/reactivos`);
    const asignados = res.data || [];
    const idsAsignados = asignados.map((r: any) => r.id_reactivo);
    
    for (const dim of dimensiones.value) {
      for (const reactivo of (dim.reactivos || [])) {
        if (idsAsignados.includes(reactivo.id_reactivo)) {
          reactivo.seleccionado = true;
        }
      }
    }
    actualizarSeleccionados();
  } catch (error) {
    console.error('Error cargando reactivos asignados:', error);
  }
};

const closeAsignarModal = () => {
  showAsignarModal.value = false;
  cuestionarioSeleccionado.value = null;
  filtroDimension.value = '';
  searchTerm.value = '';
};

const toggleAll = () => {
  for (const reactivo of reactivosFiltrados.value) {
    reactivo.seleccionado = selectAll.value;
  }
  actualizarSeleccionados();
};

const guardarAsignacion = async () => {
  loading.value = true;
  try {
    const idsSeleccionados: number[] = [];
    // Solo considerar reactivos de dimensiones del tipo correcto
    for (const dim of dimensionesFiltradas.value) {
      for (const reactivo of (dim.reactivos || [])) {
        if (reactivo.seleccionado) {
          idsSeleccionados.push(reactivo.id_reactivo);
        }
      }
    }
    
    await axios.post(`${API_URL}/api/cuestionarios/${cuestionarioSeleccionado.value.id_cuestionario}/reactivos`, {
      ids_reactivos: idsSeleccionados
    });
    
    await cargarCuestionarios();
    showToast(`Asignados ${idsSeleccionados.length} reactivos correctamente`, 'success');
    closeAsignarModal();
  } catch (error: any) {
    console.error('Error guardando asignación:', error);
    showToast(`Error: ${error.response?.data?.detail || error.message}`, 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await cargarEmpresas();
  await cargarDimensiones();
  await cargarCuestionarios();
});
</script>

<style scoped>
.gestion-container {
  padding: 24px;
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
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
.btn-primary:hover { background: #1d4ed8; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-outline {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #4a5a6e;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-outline:hover { background: #f0f4f9; }

.cuestionarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.cuestionario-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  transition: all 0.2s;
}
.cuestionario-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.card-header h3 { font-size: 16px; color: #1a2332; margin: 0; }

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-badge.active { background: #d1fae5; color: #065f46; }
.status-badge.inactive { background: #f3f4f6; color: #6b7280; }

.card-body { color: #4a5a6e; font-size: 14px; }
.card-body p { margin: 4px 0; }

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f4f9;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-icon:hover { background: #f0f4f9; }
.btn-icon.btn-asignar:hover { background: #eef2ff; }
.btn-icon.btn-danger:hover { background: #fef2f2; }

.empty-state {
  text-align: center;
  padding: 40px;
  color: #6b7a8f;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-large { max-width: 800px; }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.modal-header h2 { font-size: 22px; color: #1a2332; margin: 0; }
.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7a8f;
  cursor: pointer;
}
.modal-close:hover { color: #1a2332; }

.form-group { margin-bottom: 16px; }
.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #4a5a6e;
  margin-bottom: 4px;
}
.form-group input, .form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  align-items: center;
}

/* ✅ FILTROS BAR */
.filters-bar {
  display: flex;
  gap: 12px;
  padding: 12px 0 16px 0;
  align-items: flex-end;
  flex-wrap: wrap;
  border-bottom: 1px solid #e8ecf0;
  margin-bottom: 8px;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.filter-group label {
  font-size: 11px;
  font-weight: 600;
  color: #4a5a6e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.filter-select, .filter-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  min-width: 180px;
  background: #fff;
  color: #1a2332;
}
.filter-select:focus, .filter-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}
.seleccionados-count {
  font-weight: 600;
  color: #2563eb;
  font-size: 14px;
  padding: 8px 12px;
  background: #eef2ff;
  border-radius: 8px;
}
.total-reactivos-info {
  font-size: 13px;
  color: #6b7a8f;
  padding: 8px 12px;
}

/* ✅ TABLA - CORREGIDO PARA VISIBILIDAD */
.table-container {
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e8ecf0;
  border-radius: 8px;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background: #fff;
}
.table th {
  padding: 12px 14px;
  text-align: left;
  background: #f8fafc;
  border-bottom: 2px solid #e8ecf0;
  position: sticky;
  top: 0;
  z-index: 2;
  color: #1a2332;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

/* ✅ CELDAS CON COLOR */
.id-cell {
  font-weight: 600;
  color: #2563eb;
}
.texto-cell {
  color: #1a2332;
  font-weight: 500;
}
.dimension-cell {
  color: #4a5a6e;
  font-size: 13px;
}

.table input[type="checkbox"] {
  width: 17px;
  height: 17px;
  cursor: pointer;
  accent-color: #2563eb;
}

.badge {
  padding: 3px 10px;
  border-radius: 12px;
  background: #fef3c7;
  color: #92400e;
  font-size: 12px;
  font-weight: 500;
}

.total-reactivos {
  flex: 1;
  color: #6b7a8f;
  font-size: 14px;
}

/* ✅ TOAST */
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
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  overflow: hidden;
  animation: slideInRight 0.4s ease forwards;
  border-left: 4px solid #2563eb;
}
.toast.success { border-left-color: #22c55e; }
.toast.error { border-left-color: #ef4444; }
.toast.warning { border-left-color: #f59e0b; }
.toast.info { border-left-color: #2563eb; }
.toast-content {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  gap: 12px;
}
.toast-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 20px; height: 20px; }
.toast.success .toast-icon { color: #22c55e; }
.toast.error .toast-icon { color: #ef4444; }
.toast.warning .toast-icon { color: #f59e0b; }
.toast.info .toast-icon { color: #2563eb; }
.toast-message { font-size: 14px; color: #1a2332; flex: 1; line-height: 1.4; }
.toast-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  padding: 4px 8px;
}
.toast-close:hover { color: #4a5a6e; }
.toast-progress {
  height: 3px;
  background: #2563eb;
  animation: progressBar linear forwards;
}
.toast.success .toast-progress { background: #22c55e; }
.toast.error .toast-progress { background: #ef4444; }
.toast.warning .toast-progress { background: #f59e0b; }

@keyframes slideInRight {
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes progressBar {
  from { width: 100%; }
  to { width: 0%; }
}

/* ✅ RESPONSIVE */
@media (max-width: 768px) {
  .gestion-container { padding: 16px; }
  .header { flex-direction: column; align-items: flex-start; }
  .cuestionarios-grid { grid-template-columns: 1fr; }
  .modal-content { padding: 20px; margin: 10px; }
  .modal-large { max-width: 100%; }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .filter-select, .filter-input { min-width: 100%; }
  .toast-container { top: 10px; right: 10px; max-width: calc(100% - 20px); }
  .toast-content { padding: 12px 14px; }
  .toast-message { font-size: 13px; }
  .table-container { max-height: 300px; }
  .table th, .table td { padding: 8px 10px; font-size: 13px; }
}
</style>
