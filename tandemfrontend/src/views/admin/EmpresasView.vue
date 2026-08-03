<template>
  <div class="empresas-container">
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

    <div class="empresas-header">
      <div>
        <h1>Clientes</h1>
        <p class="subtitle">Gestión de empresas</p>
      </div>
      <button class="btn-primary" @click="openCreateModal" v-if="authStore.isAdmin">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Alta de Empresa
      </button>
    </div>

    <div class="filters-bar">
      <div class="filter-group">
        <label>Buscar</label>
        <div class="search-wrapper">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" v-model="searchTerm" placeholder="Buscar por nombre o RFC..." class="filter-input search-input"/>
        </div>
      </div>
      <div class="filter-group">
        <label>Estatus</label>
        <select v-model="filterStatus" class="filter-select">
          <option value="all">Todos los estatus</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
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

    <div class="table-container">
      <div class="table-header">
        <span>Mostrando {{ filteredEmpresas.length }} de {{ empresas.length }} empresas</span>
      </div>

      <table class="empresas-table">
        <thead>
          <tr>
            <th>Empresa / RFC</th>
            <th>Giro</th>
            <th>N° Empleados</th>
            <th>Vigencia</th>
            <th>Status</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="6" class="loading-cell">Cargando empresas...</td>
          </tr>
          <tr v-else-if="filteredEmpresas.length === 0">
            <td colspan="6" class="empty-cell">No hay empresas registradas</td>
          </tr>
          <tr v-for="empresa in paginatedEmpresas" :key="empresa.id_empresa">
            <td>
              <div class="empresa-info">
                <div class="empresa-name">{{ empresa.nom_empresa }}</div>
                <div class="empresa-rfc">{{ empresa.rfc_empresa }}</div>
              </div>
            </td>
            <td>{{ empresa.giro_empresa || '—' }}</td>
            <td>{{ empresa.num_empl_empresa || '0' }}</td>
            <td>
              <div class="fecha-info">
                <span>{{ formatDate(empresa.inicio_empresa) }}</span>
                <span class="fecha-separator">—</span>
                <span>{{ formatDate(empresa.fin_empresa) }}</span>
              </div>
            </td>
            <td>
              <span class="status-badge" :class="empresa.activo ? 'status-active' : 'status-inactive'">
                {{ empresa.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon" @click="goToDetalle(empresa.id_empresa)" title="Ver detalles">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button class="btn-icon btn-edit" @click="openEditModal(empresa)" title="Editar" v-if="authStore.isAdmin">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </button>
                <button class="btn-icon btn-danger" @click="confirmDelete(empresa)" title="Desactivar" v-if="authStore.isAdmin">
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
        <span>Mostrando {{ ((currentPage - 1) * itemsPerPage) + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredEmpresas.length) }} de {{ filteredEmpresas.length }}</span>
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
          <h2>Nueva Empresa</h2>
          <button class="modal-close" @click="closeCreateModal">✕</button>
        </div>
        <form @submit.prevent="createEmpresa">
          <div class="form-row">
            <div class="form-group"><label>Nombre *</label><input type="text" v-model="newEmpresa.nom_empresa" required /></div>
            <div class="form-group"><label>RFC *</label><input type="text" v-model="newEmpresa.rfc_empresa" required /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Giro</label><input type="text" v-model="newEmpresa.giro_empresa" /></div>
            <div class="form-group"><label>N° Empleados</label><input type="text" v-model="newEmpresa.num_empl_empresa" disabled /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Código Empresa *</label><input type="text" v-model="newEmpresa.cod_empresa" required /></div>
            <div class="form-group"><label>Cuotas</label><input type="number" v-model="newEmpresa.cues_empresa" min="0" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Fecha Inicio</label><input type="date" v-model="newEmpresa.inicio_empresa" /></div>
            <div class="form-group"><label>Fecha Fin</label><input type="date" v-model="newEmpresa.fin_empresa" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Calle</label><input type="text" v-model="newEmpresa.calle_empresa" /></div>
            <div class="form-group"><label>Núm. Exterior</label><input type="text" v-model="newEmpresa.ext_empresa" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Núm. Interior</label><input type="text" v-model="newEmpresa.int_empresa" /></div>
            <div class="form-group"><label>Colonia</label><input type="text" v-model="newEmpresa.col_empresa" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>C.P.</label><input type="text" v-model="newEmpresa.cp_empresa" /></div>
            <div class="form-group"><label>Municipio</label><input type="text" v-model="newEmpresa.mpio_empresa" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Estado</label><input type="text" v-model="newEmpresa.estado_empresa" /></div>
            <div class="form-group"><label>Activo</label><select v-model="newEmpresa.activo" class="filter-select"><option :value="true">Activo</option><option :value="false">Inactivo</option></select></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Contacto</label><input type="text" v-model="newEmpresa.nom_resp_empresa" placeholder="Nombre" /></div>
            <div class="form-group"><label>Apellido</label><input type="text" v-model="newEmpresa.ap_resp_empresa" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Teléfono</label><input type="text" v-model="newEmpresa.tel_resp_empresa" /></div>
            <div class="form-group"><label>Email</label><input type="email" v-model="newEmpresa.email_resp_empresa" /></div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-outline" @click="closeCreateModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">{{ isSubmitting ? 'Guardando...' : 'Crear Empresa' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL EDITAR -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Editar Empresa</h2>
          <button class="modal-close" @click="closeEditModal">✕</button>
        </div>
        <form @submit.prevent="updateEmpresa">
          <div class="form-row">
            <div class="form-group"><label>Nombre *</label><input type="text" v-model="editEmpresa.nom_empresa" required /></div>
            <div class="form-group"><label>RFC *</label><input type="text" v-model="editEmpresa.rfc_empresa" required /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Giro</label><input type="text" v-model="editEmpresa.giro_empresa" /></div>
            <div class="form-group"><label>N° Empleados</label><input type="text" v-model="editEmpresa.num_empl_empresa" disabled /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Código Empresa *</label><input type="text" v-model="editEmpresa.cod_empresa" required /></div>
            <div class="form-group"><label>Cuotas</label><input type="number" v-model="editEmpresa.cues_empresa" min="0" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Fecha Inicio</label><input type="date" v-model="editEmpresa.inicio_empresa" /></div>
            <div class="form-group"><label>Fecha Fin</label><input type="date" v-model="editEmpresa.fin_empresa" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Calle</label><input type="text" v-model="editEmpresa.calle_empresa" /></div>
            <div class="form-group"><label>Núm. Exterior</label><input type="text" v-model="editEmpresa.ext_empresa" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Núm. Interior</label><input type="text" v-model="editEmpresa.int_empresa" /></div>
            <div class="form-group"><label>Colonia</label><input type="text" v-model="editEmpresa.col_empresa" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>C.P.</label><input type="text" v-model="editEmpresa.cp_empresa" /></div>
            <div class="form-group"><label>Municipio</label><input type="text" v-model="editEmpresa.mpio_empresa" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Estado</label><input type="text" v-model="editEmpresa.estado_empresa" /></div>
            <div class="form-group"><label>Activo</label><select v-model="editEmpresa.activo" class="filter-select"><option :value="true">Activo</option><option :value="false">Inactivo</option></select></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Contacto</label><input type="text" v-model="editEmpresa.nom_resp_empresa" placeholder="Nombre" /></div>
            <div class="form-group"><label>Apellido</label><input type="text" v-model="editEmpresa.ap_resp_empresa" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Teléfono</label><input type="text" v-model="editEmpresa.tel_resp_empresa" /></div>
            <div class="form-group"><label>Email</label><input type="email" v-model="editEmpresa.email_resp_empresa" /></div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-outline" @click="closeEditModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">{{ isSubmitting ? 'Guardando...' : 'Actualizar Empresa' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ApiService from '@/services/api.service';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
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

// ===== DATA =====
const empresas = ref<any[]>([]);
const isLoading = ref(false);
const searchTerm = ref('');
const filterStatus = ref('all');
const currentPage = ref(1);
const itemsPerPage = ref(5);
const isSubmitting = ref(false);

const showCreateModal = ref(false);
const showEditModal = ref(false);

const newEmpresa = ref({
  nom_empresa: '',
  rfc_empresa: '',
  calle_empresa: '',
  ext_empresa: '',
  int_empresa: '',
  col_empresa: '',
  cp_empresa: '',
  mpio_empresa: '',
  estado_empresa: '',
  nom_resp_empresa: '',
  ap_resp_empresa: '',
  tel_resp_empresa: '',
  email_resp_empresa: '',
  giro_empresa: '',
  num_empl_empresa: '0',
  cod_empresa: '',
  cues_empresa: 0,
  inicio_empresa: '',
  fin_empresa: '',
  activo: true
});

const editEmpresa = ref({
  id_empresa: 0,
  nom_empresa: '',
  rfc_empresa: '',
  calle_empresa: '',
  ext_empresa: '',
  int_empresa: '',
  col_empresa: '',
  cp_empresa: '',
  mpio_empresa: '',
  estado_empresa: '',
  nom_resp_empresa: '',
  ap_resp_empresa: '',
  tel_resp_empresa: '',
  email_resp_empresa: '',
  giro_empresa: '',
  num_empl_empresa: '0',
  cod_empresa: '',
  cues_empresa: 0,
  inicio_empresa: '',
  fin_empresa: '',
  activo: true
});

// ===== COMPUTED =====
const filteredEmpresas = computed(() => {
  let result = empresas.value;
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    result = result.filter(e => e.nom_empresa?.toLowerCase().includes(term) || e.rfc_empresa?.toLowerCase().includes(term));
  }
  if (filterStatus.value === 'activo') result = result.filter(e => e.activo === true);
  else if (filterStatus.value === 'inactivo') result = result.filter(e => e.activo === false);
  return result;
});

const totalPages = computed(() => Math.ceil(filteredEmpresas.value.length / itemsPerPage.value));
const paginatedEmpresas = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredEmpresas.value.slice(start, start + itemsPerPage.value);
});

// ===== METHODS =====
const loadEmpresas = async () => {
  isLoading.value = true;
  try {
    empresas.value = await ApiService.getEmpresas();
  } catch (error) {
    showToast('Error al cargar empresas', 'error');
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

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

  if (result.getUTCFullYear() !== year || result.getUTCMonth() !== month || result.getUTCDate() !== day) {
    return null;
  }

  return result.toISOString();
};

const goToDetalle = (id: number) => router.push(`/empresas/${id}`);

const openCreateModal = () => {
  newEmpresa.value.num_empl_empresa = '0';
  showCreateModal.value = true;
};
const closeCreateModal = () => {
  showCreateModal.value = false;
  newEmpresa.value = {
    nom_empresa: '',
    rfc_empresa: '',
    calle_empresa: '',
    ext_empresa: '',
    int_empresa: '',
    col_empresa: '',
    cp_empresa: '',
    mpio_empresa: '',
    estado_empresa: '',
    nom_resp_empresa: '',
    ap_resp_empresa: '',
    tel_resp_empresa: '',
    email_resp_empresa: '',
    giro_empresa: '',
    num_empl_empresa: '0',
    cod_empresa: '',
    cues_empresa: 0,
    inicio_empresa: '',
    fin_empresa: '',
    activo: true
  };
};

const openEditModal = (empresa: any) => {
  editEmpresa.value = {
    ...empresa,
    inicio_empresa: formatDateForInput(empresa.inicio_empresa),
    fin_empresa: formatDateForInput(empresa.fin_empresa),
    num_empl_empresa: empresa.num_empl_empresa || '0'
  };
  showEditModal.value = true;
};
const closeEditModal = () => showEditModal.value = false;

const createEmpresa = async () => {
  isSubmitting.value = true;
  try {
    const dataToSend = {
      nom_empresa: newEmpresa.value.nom_empresa,
      rfc_empresa: newEmpresa.value.rfc_empresa,
      calle_empresa: newEmpresa.value.calle_empresa || null,
      ext_empresa: newEmpresa.value.ext_empresa || null,
      int_empresa: newEmpresa.value.int_empresa || null,
      col_empresa: newEmpresa.value.col_empresa || null,
      cp_empresa: newEmpresa.value.cp_empresa || null,
      mpio_empresa: newEmpresa.value.mpio_empresa || null,
      estado_empresa: newEmpresa.value.estado_empresa || null,
      nom_resp_empresa: newEmpresa.value.nom_resp_empresa || null,
      ap_resp_empresa: newEmpresa.value.ap_resp_empresa || null,
      tel_resp_empresa: newEmpresa.value.tel_resp_empresa || null,
      email_resp_empresa: newEmpresa.value.email_resp_empresa || null,
      giro_empresa: newEmpresa.value.giro_empresa || null,
      num_empl_empresa: '0',
      cod_empresa: newEmpresa.value.cod_empresa,
      cues_empresa: Number(newEmpresa.value.cues_empresa) || 0,
      inicio_empresa: dateToISO(newEmpresa.value.inicio_empresa),
      fin_empresa: dateToISO(newEmpresa.value.fin_empresa),
      activo: newEmpresa.value.activo !== undefined ? newEmpresa.value.activo : true
    };
    await ApiService.createEmpresa(dataToSend);
    closeCreateModal();
    await loadEmpresas();
    showToast('Empresa creada correctamente', 'success');
  } catch (error: any) {
    showToast(`Error: ${error.response?.data?.message || 'Verifica los datos'}`, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const updateEmpresa = async () => {
  isSubmitting.value = true;
  try {
    const dataToSend = {
      nom_empresa: editEmpresa.value.nom_empresa,
      rfc_empresa: editEmpresa.value.rfc_empresa,
      calle_empresa: editEmpresa.value.calle_empresa || null,
      ext_empresa: editEmpresa.value.ext_empresa || null,
      int_empresa: editEmpresa.value.int_empresa || null,
      col_empresa: editEmpresa.value.col_empresa || null,
      cp_empresa: editEmpresa.value.cp_empresa || null,
      mpio_empresa: editEmpresa.value.mpio_empresa || null,
      estado_empresa: editEmpresa.value.estado_empresa || null,
      nom_resp_empresa: editEmpresa.value.nom_resp_empresa || null,
      ap_resp_empresa: editEmpresa.value.ap_resp_empresa || null,
      tel_resp_empresa: editEmpresa.value.tel_resp_empresa || null,
      email_resp_empresa: editEmpresa.value.email_resp_empresa || null,
      giro_empresa: editEmpresa.value.giro_empresa || null,
      cod_empresa: editEmpresa.value.cod_empresa,
      cues_empresa: Number(editEmpresa.value.cues_empresa) || 0,
      inicio_empresa: dateToISO(editEmpresa.value.inicio_empresa),
      fin_empresa: dateToISO(editEmpresa.value.fin_empresa),
      activo: editEmpresa.value.activo !== undefined ? editEmpresa.value.activo : true
    };
    await ApiService.updateEmpresa(editEmpresa.value.id_empresa, dataToSend);
    closeEditModal();
    await loadEmpresas();
    showToast('Empresa actualizada correctamente', 'success');
  } catch (error: any) {
    showToast(`Error: ${error.response?.data?.message || 'Verifica los datos'}`, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDelete = async (empresa: any) => {
  if (confirm(`¿Desactivar "${empresa.nom_empresa}"?`)) {
    try {
      await ApiService.deleteEmpresa(empresa.id_empresa);
      await loadEmpresas();
      showToast('Empresa desactivada correctamente', 'success');
    } catch (error) {
      showToast('Error al desactivar', 'error');
    }
  }
};

const resetFilters = () => {
  searchTerm.value = '';
  filterStatus.value = 'all';
  currentPage.value = 1;
};

const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };

onMounted(() => loadEmpresas());
</script>

<style scoped>
.empresas-container {
  padding: 24px;
  min-height: 100vh;
  background: #f5f7fa;
}

.empresas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.empresas-header h1 {
  font-size: 26px;
  font-weight: 700;
  color: #1a2332;
  margin: 0;
}

.empresas-header .subtitle {
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

.filter-input,
.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  color: #1a2332;
  min-width: 180px;
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

.empresas-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.empresas-table th {
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

.empresas-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f4f9;
  color: #1a2332;
}

.empresas-table tr:hover td {
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

.fecha-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fecha-separator {
  color: #d1d5db;
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

.text-muted {
  font-size: 11px;
  color: #6b7a8f;
  margin-top: 4px;
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
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
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
  .empresas-container { padding: 16px; }
  .empresas-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .filter-input, .filter-select { min-width: 100%; }
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

input:disabled {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}
</style>