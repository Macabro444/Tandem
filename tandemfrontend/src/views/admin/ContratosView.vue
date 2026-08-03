<template>
  <div class="contratos-container">
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

    <div class="contratos-header">
      <div>
        <h1>Gestión de Contratos</h1>
        <p class="subtitle">Administra los contratos de las empresas</p>
      </div>
      <button class="btn-primary" @click="openCreateModal" v-if="authStore.isAdmin">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nuevo Contrato
      </button>
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <div class="filter-group">
        <label>Buscar</label>
        <div class="search-wrapper">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            v-model="searchTerm" 
            placeholder="Buscar por nombre del contrato..."
            class="filter-input search-input"
          />
        </div>
      </div>
      <div class="filter-group">
        <label>Empresa</label>
        <select v-model="filterEmpresa" class="filter-select" @change="loadContratos">
          <option value="all">Todas las empresas</option>
          <option v-for="emp in empresas" :key="emp.id_empresa" :value="emp.id_empresa">
            {{ emp.nom_empresa }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Estado</label>
        <select v-model="filterEstado" class="filter-select">
          <option value="all">Todos</option>
          <option value="ACTIVO">Activos</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="VENCIDO">Vencidos</option>
          <option value="AGOTADO">Agotados</option>
          <option value="INACTIVO">Inactivos</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Mostrar</label>
        <select v-model="itemsPerPage" class="filter-select" style="min-width: 80px;">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </div>
      <button class="btn-outline" @click="resetFilters">Limpiar filtros</button>
    </div>

    <!-- Tabla -->
    <div class="table-container">
      <div class="table-header">
        <span>Mostrando {{ filteredContratos.length }} de {{ contratos.length }} contratos</span>
      </div>

      <table class="contratos-table">
        <thead>
          <tr>
            <th>Contrato</th>
            <th>Empresa</th>
            <th>Vigencia</th>
            <th>Licencias</th>
            <th>Cuestionarios</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="7" class="loading-cell">Cargando contratos...</td>
          </tr>
          <tr v-else-if="filteredContratos.length === 0">
            <td colspan="7" class="empty-cell">No hay contratos registrados</td>
          </tr>
          <tr v-for="contrato in paginatedContratos" :key="contrato.id_contrato">
            <td>
              <div class="contrato-info">
                <div class="contrato-nombre">{{ contrato.nombre_contrato }}</div>
                <div class="contrato-id">#{{ contrato.id_contrato }}</div>
              </div>
            </td>
            <td>{{ contrato.empresa?.nom_empresa || '—' }}</td>
            <td>
              <div class="fecha-info">
                <span>{{ formatDate(contrato.fecha_inicio) }}</span>
                <span class="fecha-separator">→</span>
                <span>{{ formatDate(contrato.fecha_fin) }}</span>
              </div>
            </td>
            <td>
              <div class="cuotas-info">
                <span class="cuotas-usadas">{{ contrato.licencias_usadas || 0 }}</span>
                <span class="cuotas-separator">/</span>
                <span class="cuotas-total">{{ contrato.total_licencias || 0 }}</span>
                <span class="cuotas-disponibles" v-if="contrato.licencias_disponibles !== undefined">
                  ({{ contrato.licencias_disponibles }} disp.)
                </span>
              </div>
            </td>
            <td>
              <div class="cuotas-info">
                <span class="cuotas-usadas">{{ contrato.cuestionarios_usados || 0 }}</span>
                <span class="cuotas-separator">/</span>
                <span class="cuotas-total">{{ contrato.total_cuestionarios || 0 }}</span>
                <span class="cuotas-disponibles" v-if="contrato.cuestionarios_disponibles !== undefined">
                  ({{ contrato.cuestionarios_disponibles }} disp.)
                </span>
              </div>
            </td>
            <td>
              <span class="status-badge" :class="getStatusClass(contrato.estado_contrato)">
                {{ getStatusLabel(contrato.estado_contrato) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon" @click="viewContrato(contrato)" title="Ver detalles">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button class="btn-icon btn-edit" @click="openEditModal(contrato)" title="Editar" v-if="authStore.isAdmin">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </button>
                <button class="btn-icon btn-danger" @click="confirmDelete(contrato)" title="Eliminar" v-if="authStore.isAdmin">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="table-footer">
        <span>Mostrando {{ ((currentPage - 1) * itemsPerPage) + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredContratos.length) }} de {{ filteredContratos.length }}</span>
        <div class="pagination-controls">
          <button @click="prevPage" :disabled="currentPage === 1" class="btn-pagination">Anterior</button>
          <span class="pagination-current">{{ currentPage }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-pagination">Siguiente</button>
        </div>
      </div>
    </div>

    <!-- MODAL CREAR -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Nuevo Contrato</h2>
          <button class="modal-close" @click="closeCreateModal">✕</button>
        </div>
        <form @submit.prevent="createContrato">
          <div class="form-group">
            <label>Empresa *</label>
            <select v-model="newContrato.id_empresa" class="filter-select" required>
              <option value="">Selecciona una empresa</option>
              <option v-for="emp in empresas" :key="emp.id_empresa" :value="emp.id_empresa">
                {{ emp.nom_empresa }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Nombre del Contrato *</label>
            <input type="text" v-model="newContrato.nombre_contrato" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Fecha Inicio *</label>
              <input type="date" v-model="newContrato.fecha_inicio" required />
            </div>
            <div class="form-group">
              <label>Fecha Fin *</label>
              <input type="date" v-model="newContrato.fecha_fin" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Total Licencias *</label>
              <input type="number" v-model="newContrato.total_licencias" required min="1" />
            </div>
            <div class="form-group">
              <label>Licencias Usadas</label>
              <input type="number" v-model="newContrato.licencias_usadas" min="0" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Total Cuestionarios *</label>
              <input type="number" v-model="newContrato.total_cuestionarios" required min="1" />
            </div>
            <div class="form-group">
              <label>Cuestionarios Usados</label>
              <input type="number" v-model="newContrato.cuestionarios_usados" min="0" />
            </div>
          </div>
          <div class="form-group">
            <label>Activo</label>
            <select v-model="newContrato.activo" class="filter-select">
              <option :value="true">Activo</option>
              <option :value="false">Inactivo</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-outline" @click="closeCreateModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : 'Crear Contrato' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL EDITAR -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Editar Contrato</h2>
          <button class="modal-close" @click="closeEditModal">✕</button>
        </div>
        <form @submit.prevent="updateContrato">
          <div class="form-group">
            <label>Empresa *</label>
            <select v-model="editContrato.id_empresa" class="filter-select" required>
              <option v-for="emp in empresas" :key="emp.id_empresa" :value="emp.id_empresa">
                {{ emp.nom_empresa }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Nombre del Contrato *</label>
            <input type="text" v-model="editContrato.nombre_contrato" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Fecha Inicio *</label>
              <input type="date" v-model="editContrato.fecha_inicio" required />
            </div>
            <div class="form-group">
              <label>Fecha Fin *</label>
              <input type="date" v-model="editContrato.fecha_fin" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Total Licencias *</label>
              <input type="number" v-model="editContrato.total_licencias" required min="1" />
            </div>
            <div class="form-group">
              <label>Licencias Usadas</label>
              <input type="number" v-model="editContrato.licencias_usadas" min="0" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Total Cuestionarios *</label>
              <input type="number" v-model="editContrato.total_cuestionarios" required min="1" />
            </div>
            <div class="form-group">
              <label>Cuestionarios Usados</label>
              <input type="number" v-model="editContrato.cuestionarios_usados" min="0" />
            </div>
          </div>
          <div class="form-group">
            <label>Activo</label>
            <select v-model="editContrato.activo" class="filter-select">
              <option :value="true">Activo</option>
              <option :value="false">Inactivo</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-outline" @click="closeEditModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : 'Actualizar Contrato' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL DETALLE -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal-content modal-detail">
        <div class="modal-header">
          <h2>Detalle de Contrato</h2>
          <button class="modal-close" @click="closeDetailModal">✕</button>
        </div>
        <div v-if="selectedContrato" class="detail-content">
          <div class="detail-row"><span class="detail-label">ID</span><span class="detail-value">#{{ selectedContrato.id_contrato }}</span></div>
          <div class="detail-row"><span class="detail-label">Nombre</span><span class="detail-value">{{ selectedContrato.nombre_contrato }}</span></div>
          <div class="detail-row"><span class="detail-label">Empresa</span><span class="detail-value">{{ selectedContrato.empresa?.nom_empresa || '—' }}</span></div>
          <div class="detail-row"><span class="detail-label">Fecha Inicio</span><span class="detail-value">{{ formatDate(selectedContrato.fecha_inicio) }}</span></div>
          <div class="detail-row"><span class="detail-label">Fecha Fin</span><span class="detail-value">{{ formatDate(selectedContrato.fecha_fin) }}</span></div>
          <div class="detail-row"><span class="detail-label">Licencias</span><span class="detail-value">{{ selectedContrato.licencias_usadas || 0 }} / {{ selectedContrato.total_licencias || 0 }}</span></div>
          <div class="detail-row"><span class="detail-label">Cuestionarios</span><span class="detail-value">{{ selectedContrato.cuestionarios_usados || 0 }} / {{ selectedContrato.total_cuestionarios || 0 }}</span></div>
          <div class="detail-row"><span class="detail-label">Estado</span>
            <span class="status-badge" :class="getStatusClass(selectedContrato.estado_contrato)">
              {{ getStatusLabel(selectedContrato.estado_contrato) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ApiService from '@/services/api.service';
import { useAuthStore } from '@/stores/auth.store';

const route = useRoute();
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

const contratos = ref<any[]>([]);
const empresas = ref<any[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const searchTerm = ref('');
const filterEmpresa = ref('all');
const filterEstado = ref('all');
const currentPage = ref(1);
const itemsPerPage = ref(5);

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDetailModal = ref(false);
const selectedContrato = ref<any>(null);

const newContrato = ref({
  id_empresa: '',
  nombre_contrato: '',
  fecha_inicio: '',
  fecha_fin: '',
  total_licencias: 1,
  licencias_usadas: 0,
  total_cuestionarios: 1,
  cuestionarios_usados: 0,
  activo: true
});

const editContrato = ref({
  id_contrato: 0,
  id_empresa: '',
  nombre_contrato: '',
  fecha_inicio: '',
  fecha_fin: '',
  total_licencias: 1,
  licencias_usadas: 0,
  total_cuestionarios: 1,
  cuestionarios_usados: 0,
  activo: true
});

const filteredContratos = computed(() => {
  let result = contratos.value;

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase().trim();
    result = result.filter(c => 
      c.nombre_contrato?.toLowerCase().includes(term)
    );
  }

  if (filterEmpresa.value !== 'all') {
    result = result.filter(c => c.id_empresa === Number(filterEmpresa.value));
  }

  if (filterEstado.value !== 'all') {
    result = result.filter(c => c.estado_contrato === filterEstado.value);
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredContratos.value.length / itemsPerPage.value));
const paginatedContratos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredContratos.value.slice(start, start + itemsPerPage.value);
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

const formatDateForInput = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dateToISO = (dateStr: string | null | undefined): string | null => {
  if (!dateStr) return null;
  if (typeof dateStr !== 'string') return null;
  if (!dateStr.includes('-')) return null;

  if (dateStr.includes('T')) return dateStr;

  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;

  const [yearPart, monthPart, dayPart] = parts;
  if (!yearPart || !monthPart || !dayPart) return null;

  const year = parseInt(yearPart, 10);
  const month = parseInt(monthPart, 10) - 1;
  const day = parseInt(dayPart, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  if (year < 1900 || year > 2100) return null;
  if (month < 0 || month > 11) return null;
  if (day < 1 || day > 31) return null;

  const result = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

  if (
    result.getUTCFullYear() !== year ||
    result.getUTCMonth() !== month ||
    result.getUTCDate() !== day
  ) {
    return null;
  }

  return result.toISOString();
};

const getStatusClass = (estado: string) => {
  const classes: Record<string, string> = {
    'ACTIVO': 'status-active',
    'PENDIENTE': 'status-pendiente',
    'VENCIDO': 'status-vencido',
    'AGOTADO': 'status-agotado',
    'INACTIVO': 'status-inactive'
  };
  return classes[estado] || 'status-inactive';
};

const getStatusLabel = (estado: string) => {
  const labels: Record<string, string> = {
    'ACTIVO': 'Activo',
    'PENDIENTE': 'Pendiente',
    'VENCIDO': 'Vencido',
    'AGOTADO': 'Agotado',
    'INACTIVO': 'Inactivo'
  };
  return labels[estado] || estado;
};

const loadEmpresas = async () => {
  try {
    empresas.value = await ApiService.getEmpresas();
  } catch (error) {
    console.error('Error cargando empresas:', error);
  }
};

const loadContratos = async () => {
  isLoading.value = true;
  try {
    if (filterEmpresa.value !== 'all') {
      contratos.value = await ApiService.getContratosByEmpresa(Number(filterEmpresa.value));
    } else {
      contratos.value = await ApiService.getContratos();
    }
  } catch (error) {
    console.error('Error cargando contratos:', error);
    showToast('Error al cargar contratos', 'error');
  } finally {
    isLoading.value = false;
  }
};

const openCreateModal = () => { showCreateModal.value = true; };
const closeCreateModal = () => {
  showCreateModal.value = false;
  newContrato.value = {
    id_empresa: '',
    nombre_contrato: '',
    fecha_inicio: '',
    fecha_fin: '',
    total_licencias: 1,
    licencias_usadas: 0,
    total_cuestionarios: 1,
    cuestionarios_usados: 0,
    activo: true
  };
};

const openEditModal = (contrato: any) => {
  editContrato.value = {
    ...contrato,
    fecha_inicio: formatDateForInput(contrato.fecha_inicio),
    fecha_fin: formatDateForInput(contrato.fecha_fin)
  };
  showEditModal.value = true;
};
const closeEditModal = () => { showEditModal.value = false; };

const viewContrato = (contrato: any) => {
  selectedContrato.value = contrato;
  showDetailModal.value = true;
};
const closeDetailModal = () => { showDetailModal.value = false; };

const createContrato = async () => {
  isSubmitting.value = true;
  try {
    const dataToSend = {
      ...newContrato.value,
      id_empresa: Number(newContrato.value.id_empresa),
      fecha_inicio: dateToISO(newContrato.value.fecha_inicio),
      fecha_fin: dateToISO(newContrato.value.fecha_fin),
    };
    await ApiService.createContrato(dataToSend);
    closeCreateModal();
    await loadContratos();
    showToast('Contrato creado correctamente', 'success');
  } catch (error: any) {
    console.error('Error:', error);
    showToast(`Error al crear contrato: ${error.response?.data?.message || 'Verifica los datos'}`, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const updateContrato = async () => {
  isSubmitting.value = true;
  try {
    const dataToSend = {
      ...editContrato.value,
      id_empresa: Number(editContrato.value.id_empresa),
      fecha_inicio: dateToISO(editContrato.value.fecha_inicio),
      fecha_fin: dateToISO(editContrato.value.fecha_fin),
    };
    await ApiService.updateContrato(editContrato.value.id_contrato, dataToSend);
    closeEditModal();
    await loadContratos();
    showToast('Contrato actualizado correctamente', 'success');
  } catch (error: any) {
    console.error('Error:', error);
    showToast(`Error al actualizar contrato: ${error.response?.data?.message || 'Verifica los datos'}`, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDelete = async (contrato: any) => {
  if (confirm(`¿Desactivar el contrato "${contrato.nombre_contrato}"?`)) {
    try {
      await ApiService.deleteContrato(contrato.id_contrato);
      await loadContratos();
      showToast('Contrato desactivado correctamente', 'success');
    } catch (error) {
      showToast('Error al desactivar contrato', 'error');
    }
  }
};

const resetFilters = () => {
  searchTerm.value = '';
  filterEmpresa.value = 'all';
  filterEstado.value = 'all';
  currentPage.value = 1;
  loadContratos();
};

const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };

onMounted(async () => {
  await loadEmpresas();
  await loadContratos();
  
  if (route.query.empresa) {
    filterEmpresa.value = route.query.empresa as string;
  }
});
</script>

<style scoped>
.contratos-container {
  padding: 24px;
  min-height: 100vh;
  background: #f5f7fa;
}

.contratos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.contratos-header h1 {
  font-size: 26px;
  font-weight: 700;
  color: #1a2332;
  margin: 0;
}

.contratos-header .subtitle {
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
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover { background: #1d4ed8; }

.btn-outline {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #4a5a6e;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: #f0f4f9;
  border-color: #9ca3af;
}

.filters-bar {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 20px;
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

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #9ca3af;
}

.search-input {
  padding-left: 36px !important;
}

.filter-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  color: #1a2332;
  min-width: 200px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  color: #1a2332;
  min-width: 160px;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.table-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  overflow: hidden;
}

.table-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e8ecf0;
  color: #6b7a8f;
  font-size: 14px;
}

.contratos-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.contratos-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #4a5a6e;
  border-bottom: 1px solid #e8ecf0;
  background: #fafbfc;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contratos-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f4f9;
  color: #1a2332;
}

.contratos-table tr:hover td {
  background: #fafbfc;
}

.contrato-nombre {
  font-weight: 600;
  color: #1a2332;
}

.contrato-id {
  font-size: 12px;
  color: #6b7a8f;
}

.fecha-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.fecha-separator {
  color: #d1d5db;
}

.cuotas-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cuotas-usadas {
  font-weight: 600;
  color: #2563eb;
}

.cuotas-total {
  color: #6b7a8f;
}

.cuotas-disponibles {
  font-size: 11px;
  color: #059669;
  margin-left: 4px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-pendiente {
  background: #fef3c7;
  color: #92400e;
}

.status-vencido {
  background: #fecaca;
  color: #991b1b;
}

.status-agotado {
  background: #fde68a;
  color: #78350f;
}

.status-inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.btn-icon {
  padding: 4px 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7a8f;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f0f4f9;
  color: #1a2332;
}

.btn-icon.btn-edit:hover {
  background: #eef2ff;
  color: #2563eb;
}

.btn-icon.btn-danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-top: 1px solid #e8ecf0;
  color: #6b7a8f;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-pagination {
  padding: 6px 14px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #4a5a6e;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-pagination:hover:not(:disabled) {
  background: #f0f4f9;
}

.btn-pagination:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-current {
  font-weight: 600;
  color: #1a2332;
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 40px !important;
  color: #6b7a8f;
}

/* Modal */
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-detail {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 22px;
  color: #1a2332;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7a8f;
  cursor: pointer;
}

.modal-close:hover {
  color: #1a2332;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #4a5a6e;
}

.form-group input,
.form-group select {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1a2332;
  background: #fff;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f4f9;
}

.detail-label {
  color: #6b7a8f;
}

.detail-value {
  font-weight: 500;
  color: #1a2332;
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
  .contratos-container { padding: 16px; }
  .contratos-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .filter-select, .filter-input { min-width: 100%; }
  .form-row { grid-template-columns: 1fr; }
  .table-footer { flex-direction: column; gap: 12px; align-items: flex-start; }
  .modal-content { padding: 20px; }

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