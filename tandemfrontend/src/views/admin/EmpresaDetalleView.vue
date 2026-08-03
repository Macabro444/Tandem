<template>
  <div class="detalle-container">
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

    <!-- Botón volver -->
    <div class="detalle-header">
      <button class="btn-back" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/>
          <path d="M12 19l-7-7 7-7"/>
        </svg>
        Volver a empresas
      </button>
      <div class="header-actions">
        <button class="btn-edit" @click="openEditModal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Editar
        </button>
        <button class="btn-status" :class="empresa?.activo ? 'btn-active' : 'btn-inactive'" @click="toggleStatus">
          {{ empresa?.activo ? 'Activo' : 'Inactivo' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">Cargando...</div>
    <div v-else-if="!empresa" class="error">Empresa no encontrada</div>
    <div v-else>
      <!-- Información General -->
      <div class="info-grid">
        <div class="info-card">
          <h3>Información General</h3>
          <div class="info-row">
            <span class="label">Nombre</span>
            <span class="value">{{ empresa.nom_empresa }}</span>
          </div>
          <div class="info-row">
            <span class="label">RFC</span>
            <span class="value">{{ empresa.rfc_empresa }}</span>
          </div>
          <div class="info-row">
            <span class="label">Código</span>
            <span class="value">{{ empresa.cod_empresa }}</span>
          </div>
          <div class="info-row">
            <span class="label">Giro</span>
            <span class="value">{{ empresa.giro_empresa || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="label">N° Empleados</span>
            <span class="value" style="color: #6b7280;">{{ empresa.num_empl_empresa || '0' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Cuotas</span>
            <span class="value">{{ empresa.cues_empresa || 0 }}</span>
          </div>
          <div class="info-row">
            <span class="label">Vigencia</span>
            <span class="value">{{ formatDate(empresa.inicio_empresa) }} — {{ formatDate(empresa.fin_empresa) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Status</span>
            <span class="status-badge" :class="empresa.activo ? 'status-active' : 'status-inactive'">
              {{ empresa.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <div class="info-row">
            <span class="label">Registro</span>
            <span class="value">{{ formatDate(empresa.created_at) }}</span>
          </div>
        </div>

        <!-- Dirección -->
        <div class="info-card">
          <h3>Dirección</h3>
          <div class="info-row">
            <span class="label">Calle</span>
            <span class="value">{{ empresa.calle_empresa || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Núm. Exterior</span>
            <span class="value">{{ empresa.ext_empresa || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Núm. Interior</span>
            <span class="value">{{ empresa.int_empresa || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Colonia</span>
            <span class="value">{{ empresa.col_empresa || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="label">C.P.</span>
            <span class="value">{{ empresa.cp_empresa || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Municipio</span>
            <span class="value">{{ empresa.mpio_empresa || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Estado</span>
            <span class="value">{{ empresa.estado_empresa || '—' }}</span>
          </div>
        </div>

        <!-- Contacto -->
        <div class="info-card">
          <h3>Contacto</h3>
          <div class="info-row">
            <span class="label">Nombre</span>
            <span class="value">{{ empresa.nom_resp_empresa || '—' }} {{ empresa.ap_resp_empresa || '' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Teléfono</span>
            <span class="value">{{ empresa.tel_resp_empresa || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Email</span>
            <span class="value">{{ empresa.email_resp_empresa || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="stats-section">
        <h3>Estadísticas</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-number">{{ stats.totalUsuarios }}</span>
            <span class="stat-label">Usuarios Registrados</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ stats.usuariosActivos }}</span>
            <span class="stat-label">Usuarios Activos</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ stats.totalContratos }}</span>
            <span class="stat-label">Contratos Activos</span>
          </div>
        </div>
      </div>

      <!-- Usuarios (3 primeros) -->
      <div class="table-section">
        <div class="section-header">
          <h3>Usuarios de la Empresa</h3>
          <button v-if="usuarios.length > 3" class="btn-ver-mas" @click="goToUsers">
            Ver todos ({{ usuarios.length }})
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
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
              <tr v-if="usuarios.length === 0">
                <td colspan="4" class="empty">No hay usuarios registrados</td>
              </tr>
              <tr v-for="user in usuarios.slice(0, 3)" :key="user.id_usuario">
                <td>{{ user.nom_usuario }} {{ user.ap_usuario }}</td>
                <td>{{ user.email_usuario }}</td>
                <td><span class="role-badge" :class="getRoleClass(user.rol_usuario)">{{ getRoleLabel(user.rol_usuario) }}</span></td>
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

      <!-- Contratos (3 primeros) -->
      <div class="table-section">
        <div class="section-header">
          <h3>Contratos de la Empresa</h3>
          <button v-if="contratos.length > 3" class="btn-ver-mas" @click="goToContratos">
            Ver todos ({{ contratos.length }})
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Contrato</th>
                <th>Vigencia</th>
                <th>Licencias</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="contratos.length === 0">
                <td colspan="4" class="empty">No hay contratos registrados</td>
              </tr>
              <tr v-for="contrato in contratos.slice(0, 3)" :key="contrato.id_contrato">
                <td>{{ contrato.nombre_contrato }}</td>
                <td>
                  {{ formatDate(contrato.fecha_inicio) }} 
                  <span style="color:#d1d5db; margin:0 4px;">→</span>
                  {{ formatDate(contrato.fecha_fin) }}
                </td>
                <td>{{ contrato.licencias_usadas || 0 }} / {{ contrato.total_licencias || 0 }}</td>
                <td>
                  <span class="status-badge" :class="getContratoStatusClass(contrato.estado_contrato)">
                    {{ getContratoStatusLabel(contrato.estado_contrato) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
            <div class="form-group">
              <label>Nombre *</label>
              <input type="text" v-model="editData.nom_empresa" required />
            </div>
            <div class="form-group">
              <label>RFC *</label>
              <input type="text" v-model="editData.rfc_empresa" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Giro</label>
              <input type="text" v-model="editData.giro_empresa" />
            </div>
            <div class="form-group">
              <label>N° Empleados</label>
              <input type="text" v-model="editData.num_empl_empresa" disabled style="background: #f3f4f6; color: #6b7280; cursor: not-allowed;" />
              <small class="text-muted" style="color: #6b7280; font-size: 11px;">Se actualiza automáticamente</small>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Código *</label>
              <input type="text" v-model="editData.cod_empresa" required />
            </div>
            <div class="form-group">
              <label>Cuotas</label>
              <input type="number" v-model="editData.cues_empresa" min="0" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Fecha Inicio</label>
              <input type="date" v-model="editData.inicio_empresa" />
            </div>
            <div class="form-group">
              <label>Fecha Fin</label>
              <input type="date" v-model="editData.fin_empresa" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Calle</label>
              <input type="text" v-model="editData.calle_empresa" />
            </div>
            <div class="form-group">
              <label>Núm. Exterior</label>
              <input type="text" v-model="editData.ext_empresa" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Núm. Interior</label>
              <input type="text" v-model="editData.int_empresa" />
            </div>
            <div class="form-group">
              <label>Colonia</label>
              <input type="text" v-model="editData.col_empresa" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>C.P.</label>
              <input type="text" v-model="editData.cp_empresa" />
            </div>
            <div class="form-group">
              <label>Municipio</label>
              <input type="text" v-model="editData.mpio_empresa" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Estado</label>
              <input type="text" v-model="editData.estado_empresa" />
            </div>
            <div class="form-group">
              <label>Activo</label>
              <select v-model="editData.activo" class="filter-select">
                <option :value="true">Activo</option>
                <option :value="false">Inactivo</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Contacto</label>
              <input type="text" v-model="editData.nom_resp_empresa" placeholder="Nombre" />
            </div>
            <div class="form-group">
              <label>Apellido</label>
              <input type="text" v-model="editData.ap_resp_empresa" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Teléfono</label>
              <input type="text" v-model="editData.tel_resp_empresa" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="editData.email_resp_empresa" />
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-outline" @click="closeEditModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : 'Actualizar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ApiService from '@/services/api.service';

const router = useRouter();
const route = useRoute();
const empresaId = Number(route.params.id);

// ===== TOAST SYSTEM =====
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
const empresa = ref<any>(null);
const usuarios = ref<any[]>([]);
const contratos = ref<any[]>([]);
const loading = ref(true);
const showEditModal = ref(false);
const isSubmitting = ref(false);

const stats = ref({
  totalUsuarios: 0,
  usuariosActivos: 0,
  totalContratos: 0
});

const editData = ref({
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

// ===== METHODS =====

// --- Lógica de fechas (alineada con el listado de empresas, basada en UTC) ---
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
// --- Fin lógica de fechas ---

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

const getContratoStatusClass = (estado: string) => {
  const classes: Record<string, string> = {
    'ACTIVO': 'status-active',
    'PENDIENTE': 'status-pendiente',
    'VENCIDO': 'status-vencido',
    'AGOTADO': 'status-agotado',
    'INACTIVO': 'status-inactive'
  };
  return classes[estado] || 'status-inactive';
};

const getContratoStatusLabel = (estado: string) => {
  const labels: Record<string, string> = {
    'ACTIVO': 'Activo',
    'PENDIENTE': 'Pendiente',
    'VENCIDO': 'Vencido',
    'AGOTADO': 'Agotado',
    'INACTIVO': 'Inactivo'
  };
  return labels[estado] || estado;
};

const goBack = () => router.push('/empresas');

const goToUsers = () => {
  router.push({ path: '/users', query: { empresa: String(empresaId) } });
};

const goToContratos = () => {
  router.push({ path: '/contratos', query: { empresa: String(empresaId) } });
};

const loadData = async () => {
  loading.value = true;
  try {
    const emp = await ApiService.getEmpresa(empresaId);
    empresa.value = emp;

    try {
      const allUsers = await ApiService.getUsers();
      usuarios.value = allUsers.filter((u: any) => u.id_empresa === empresaId);
      stats.value.totalUsuarios = usuarios.value.length;
      stats.value.usuariosActivos = usuarios.value.filter((u: any) => u.activo).length;
    } catch (e) {
      usuarios.value = [];
    }

    try {
      contratos.value = await ApiService.getContratosByEmpresa(empresaId);
      stats.value.totalContratos = contratos.value.filter((c: any) => c.estado_contrato === 'ACTIVO').length;
    } catch (e) {
      contratos.value = [];
    }

  } catch (error) {
    showToast('Error al cargar los datos', 'error');
    console.error('Error:', error);
  } finally {
    loading.value = false;
  }
};

const openEditModal = () => {
  editData.value = {
    ...empresa.value,
    inicio_empresa: formatDateForInput(empresa.value.inicio_empresa),
    fin_empresa: formatDateForInput(empresa.value.fin_empresa),
    num_empl_empresa: empresa.value.num_empl_empresa || '0'
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
};

const updateEmpresa = async () => {
  isSubmitting.value = true;
  try {
    const dataToSend = {
      ...editData.value,
      inicio_empresa: dateToISO(editData.value.inicio_empresa),
      fin_empresa: dateToISO(editData.value.fin_empresa),
    };
    await ApiService.updateEmpresa(empresaId, dataToSend);
    closeEditModal();
    await loadData();
    showToast('Empresa actualizada correctamente', 'success');
  } catch (error: any) {
    showToast(`Error: ${error.response?.data?.message || 'Error al actualizar'}`, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const toggleStatus = async () => {
  if (confirm(`¿${empresa.value.activo ? 'Desactivar' : 'Activar'} la empresa?`)) {
    try {
      await ApiService.updateEmpresa(empresaId, { activo: !empresa.value.activo });
      await loadData();
      showToast('Status actualizado correctamente', 'success');
    } catch (error) {
      showToast('Error al cambiar status', 'error');
    }
  }
};

onMounted(loadData);
</script>

<style scoped>
.detalle-container {
  padding: 24px;
  min-height: 100vh;
  background: #f5f7fa;
}

.detalle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #4a5a6e;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f0f4f9;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-edit {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-edit:hover {
  background: #1d4ed8;
}

.btn-status {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-active {
  background: #d1fae5;
  color: #065f46;
}

.btn-active:hover {
  background: #a7f3d0;
}

.btn-inactive {
  background: #fef2f2;
  color: #991b1b;
}

.btn-inactive:hover {
  background: #fecaca;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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
  padding-bottom: 12px;
  border-bottom: 1px solid #e8ecf0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f5f7fa;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  color: #6b7a8f;
  font-size: 14px;
}

.info-row .value {
  color: #1a2332;
  font-weight: 500;
  font-size: 14px;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

.stats-section {
  margin-bottom: 24px;
}

.stats-section h3 {
  font-size: 16px;
  color: #1a2332;
  margin: 0 0 16px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.stat-number {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #2563eb;
}

.stat-label {
  display: block;
  font-size: 13px;
  color: #6b7a8f;
  margin-top: 4px;
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
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: transparent;
  border: 1px solid #2563eb;
  border-radius: 6px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ver-mas:hover {
  background: #eef2ff;
}

.btn-ver-mas svg {
  transition: transform 0.2s;
}

.btn-ver-mas:hover svg {
  transform: translateX(2px);
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

.empty {
  text-align: center;
  color: #6b7a8f;
  padding: 20px !important;
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

.role-badge {
  padding: 2px 10px;
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

.loading,
.error {
  text-align: center;
  padding: 40px;
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
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}

input:disabled {
  background: #f3f4f6 !important;
  color: #6b7280 !important;
  cursor: not-allowed !important;
}

.text-muted {
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.btn-primary {
  padding: 10px 24px;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  padding: 10px 24px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #4a5a6e;
  cursor: pointer;
}

.btn-outline:hover {
  background: #f0f4f9;
}

@media (max-width: 768px) {
  .detalle-container {
    padding: 16px;
  }
  .detalle-header {
    flex-direction: column;
    align-items: stretch;
  }
  .header-actions {
    justify-content: flex-end;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
  .modal-content {
    padding: 20px;
  }
  .table {
    font-size: 12px;
  }
  .table th,
  .table td {
    padding: 6px 8px;
  }
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

/* ===== TOAST NOTIFICATIONS ===== */
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
</style>