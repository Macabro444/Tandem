<template>
  <div class="empleados-container">
    <div class="empleados-header">
      <div>
        <h1>Mis Empleados</h1>
        <p class="subtitle">Gestión de empleados de tu empresa</p>
        <p class="empresa-info" v-if="empresa">
          <span class="badge-empresa">{{ empresa.nom_empresa }}</span>
          <span class="licencias-info">
            Licencias: {{ licenciasUsadas }} / {{ licenciasTotal }}
            <span class="disponibles">({{ licenciasDisponibles }} disponibles)</span>
          </span>
        </p>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nuevo Empleado
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
            placeholder="Buscar por nombre o email..."
            class="filter-input search-input"
          />
        </div>
      </div>
      <div class="filter-group">
        <label>Rol</label>
        <select v-model="filterRol" class="filter-select">
          <option value="all">Todos</option>
          <option value="EMPLEADO">Empleado</option>
          <option value="COORDINADOR">Coordinador</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Status</label>
        <select v-model="filterStatus" class="filter-select">
          <option value="all">Todos</option>
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

    <!-- Tabla -->
    <div class="table-container">
      <div class="table-header">
        <span>Mostrando {{ filteredEmpleados.length }} de {{ empleados.length }} empleados</span>
      </div>

      <table class="empleados-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Status</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="6" class="loading-cell">Cargando empleados...</td>
          </tr>
          <tr v-else-if="filteredEmpleados.length === 0">
            <td colspan="6" class="empty-cell">No hay empleados registrados en tu empresa</td>
          </tr>
          <tr v-for="user in paginatedEmpleados" :key="user.id_usuario">
            <td>
              <div class="user-info">
                <div class="user-name">{{ user.nom_usuario }} {{ user.ap_usuario }}</div>
              </div>
            </td>
            <td>{{ user.email_usuario }}</td>
            <td>@{{ user.username }}</td>
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
            <td>
              <div class="action-buttons">
                <button class="btn-icon btn-edit" @click="openEditModal(user)" title="Editar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </button>
                <button class="btn-icon btn-danger" @click="confirmDelete(user)" title="Desactivar">
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
        <span>Mostrando {{ ((currentPage - 1) * itemsPerPage) + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredEmpleados.length) }} de {{ filteredEmpleados.length }}</span>
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
          <h2>Nuevo Empleado</h2>
          <button class="modal-close" @click="closeCreateModal">✕</button>
        </div>
        <form @submit.prevent="createEmpleado">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre *</label>
              <input type="text" v-model="newUser.nom_usuario" required />
            </div>
            <div class="form-group">
              <label>Apellido *</label>
              <input type="text" v-model="newUser.ap_usuario" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Email *</label>
              <input type="email" v-model="newUser.email_usuario" required />
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input type="text" v-model="newUser.tel_usuario" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Usuario *</label>
              <input type="text" v-model="newUser.username" required />
            </div>
            <div class="form-group">
              <label>Contraseña *</label>
              <input type="password" v-model="newUser.cont_usuario" required minlength="6" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Rol *</label>
              <select v-model="newUser.rol_usuario" class="filter-select" required>
                <option value="EMPLEADO">Empleado</option>
                <option value="COORDINADOR">Coordinador</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-outline" @click="closeCreateModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : 'Crear Empleado' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL EDITAR -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Editar Empleado</h2>
          <button class="modal-close" @click="closeEditModal">✕</button>
        </div>
        <form @submit.prevent="updateEmpleado">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre *</label>
              <input type="text" v-model="editUser.nom_usuario" required />
            </div>
            <div class="form-group">
              <label>Apellido *</label>
              <input type="text" v-model="editUser.ap_usuario" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Email *</label>
              <input type="email" v-model="editUser.email_usuario" required />
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input type="text" v-model="editUser.tel_usuario" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Usuario *</label>
              <input type="text" v-model="editUser.username" required />
            </div>
            <div class="form-group">
              <label>Contraseña</label>
              <input type="password" v-model="editUser.cont_usuario" placeholder="Dejar en blanco para no cambiar" />
              <small class="text-muted">Dejar en blanco para mantener la contraseña actual</small>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Rol *</label>
              <select v-model="editUser.rol_usuario" class="filter-select" required>
                <option value="EMPLEADO">Empleado</option>
                <option value="COORDINADOR">Coordinador</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Status</label>
              <select v-model="editUser.activo" class="filter-select">
                <option :value="true">Activo</option>
                <option :value="false">Inactivo</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-outline" @click="closeEditModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : 'Actualizar Empleado' }}
            </button>
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

const empresa = ref<any>(null);
const licenciasTotal = ref(0);
const licenciasUsadas = ref(0);
const licenciasDisponibles = ref(0);

const empleados = ref<any[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const searchTerm = ref('');
const filterRol = ref('all');
const filterStatus = ref('all');
const currentPage = ref(1);
const itemsPerPage = ref(5);

// Modals
const showCreateModal = ref(false);
const showEditModal = ref(false);

const newUser = ref({
  nom_usuario: '',
  ap_usuario: '',
  tel_usuario: '',
  email_usuario: '',
  username: '',
  cont_usuario: '',
  rol_usuario: 'EMPLEADO',
  id_empresa: null as number | null,
  primer_ingreso: true,
  activo: true
});

const editUser = ref({
  id_usuario: 0,
  nom_usuario: '',
  ap_usuario: '',
  tel_usuario: '',
  email_usuario: '',
  username: '',
  cont_usuario: '',
  rol_usuario: 'EMPLEADO',
  id_empresa: null as number | null,
  primer_ingreso: true,
  activo: true
});

const filteredEmpleados = computed(() => {
  let result = empleados.value;

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase().trim();
    result = result.filter(u => 
      u.nom_usuario?.toLowerCase().includes(term) ||
      u.ap_usuario?.toLowerCase().includes(term) ||
      `${u.nom_usuario} ${u.ap_usuario}`.toLowerCase().includes(term) ||
      u.email_usuario?.toLowerCase().includes(term)
    );
  }

  if (filterRol.value !== 'all') {
    result = result.filter(u => u.rol_usuario === filterRol.value);
  }

  if (filterStatus.value === 'activo') {
    result = result.filter(u => u.activo === true);
  } else if (filterStatus.value === 'inactivo') {
    result = result.filter(u => u.activo === false);
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredEmpleados.value.length / itemsPerPage.value));
const paginatedEmpleados = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredEmpleados.value.slice(start, start + itemsPerPage.value);
});

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

const loadData = async () => {
  isLoading.value = true;
  try {
    const empresaId = authStore.user?.id_empresa;
    if (!empresaId) {
      router.push('/login');
      return;
    }

    // 1. Obtener empresa
    empresa.value = await ApiService.getEmpresa(empresaId);

    // 2. Obtener licencias
    try {
      const lic = await ApiService.getLicenciasByEmpresa(empresaId);
      licenciasTotal.value = lic.total_licencias || 0;
      licenciasUsadas.value = lic.licencias_usadas || 0;
      licenciasDisponibles.value = lic.licencias_disponibles || 0;
    } catch (e) {
      console.log('Licencias no disponibles');
    }

    // 3. Obtener empleados de la empresa
    empleados.value = await ApiService.getUsersByEmpresa(empresaId);

  } catch (error) {
    console.error('Error cargando datos:', error);
    empleados.value = [];
  } finally {
    isLoading.value = false;
  }
};

const openCreateModal = () => {
  newUser.value.id_empresa = authStore.user?.id_empresa || null;
  showCreateModal.value = true;
};
const closeCreateModal = () => {
  showCreateModal.value = false;
  newUser.value = {
    nom_usuario: '',
    ap_usuario: '',
    tel_usuario: '',
    email_usuario: '',
    username: '',
    cont_usuario: '',
    rol_usuario: 'EMPLEADO',
    id_empresa: null,
    primer_ingreso: true,
    activo: true
  };
};

const openEditModal = (user: any) => {
  editUser.value = {
    id_usuario: user.id_usuario,
    nom_usuario: user.nom_usuario,
    ap_usuario: user.ap_usuario,
    tel_usuario: user.tel_usuario || '',
    email_usuario: user.email_usuario,
    username: user.username,
    cont_usuario: '',
    rol_usuario: user.rol_usuario,
    id_empresa: user.id_empresa,
    primer_ingreso: user.primer_ingreso,
    activo: user.activo
  };
  showEditModal.value = true;
};
const closeEditModal = () => { showEditModal.value = false; };

const createEmpleado = async () => {
  isSubmitting.value = true;
  try {
    newUser.value.id_empresa = authStore.user?.id_empresa || null;
    await ApiService.createUser(newUser.value);
    closeCreateModal();
    await loadData();
    alert('✅ Empleado creado correctamente');
  } catch (error: any) {
    console.error('Error:', error);
    alert(`Error al crear empleado: ${error.response?.data?.message || 'Verifica los datos'}`);
  } finally {
    isSubmitting.value = false;
  }
};

const updateEmpleado = async () => {
  isSubmitting.value = true;
  try {
    const dataToSend: any = {
      nom_usuario: editUser.value.nom_usuario,
      ap_usuario: editUser.value.ap_usuario,
      tel_usuario: editUser.value.tel_usuario || null,
      email_usuario: editUser.value.email_usuario,
      username: editUser.value.username,
      rol_usuario: editUser.value.rol_usuario,
      id_empresa: authStore.user?.id_empresa || null,
      primer_ingreso: editUser.value.primer_ingreso,
      activo: editUser.value.activo
    };

    if (editUser.value.cont_usuario) {
      dataToSend.cont_usuario = editUser.value.cont_usuario;
    }

    await ApiService.updateUser(editUser.value.id_usuario, dataToSend);
    closeEditModal();
    await loadData();
    alert('✅ Empleado actualizado correctamente');
  } catch (error: any) {
    console.error('Error:', error);
    alert(`Error al actualizar empleado: ${error.response?.data?.message || 'Verifica los datos'}`);
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDelete = async (user: any) => {
  if (confirm(`¿Desactivar al empleado "${user.nom_usuario} ${user.ap_usuario}"?`)) {
    try {
      await ApiService.deleteUser(user.id_usuario);
      await loadData();
      alert('✅ Empleado desactivado correctamente');
    } catch (error) {
      alert('Error al desactivar empleado');
    }
  }
};

const resetFilters = () => {
  searchTerm.value = '';
  filterRol.value = 'all';
  filterStatus.value = 'all';
  currentPage.value = 1;
};

const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };

onMounted(loadData);
</script>

<style scoped>
.empleados-container {
  padding: 24px;
  min-height: 100vh;
  background: #f5f7fa;
}

.empleados-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.empleados-header h1 {
  font-size: 26px;
  font-weight: 700;
  color: #1a2332;
  margin: 0;
}

.empleados-header .subtitle {
  color: #6b7a8f;
  font-size: 14px;
  margin: 4px 0 0;
}

.empresa-info {
  margin-top: 8px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.badge-empresa {
  display: inline-block;
  padding: 4px 12px;
  background: #eef2ff;
  color: #2563eb;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

.licencias-info {
  font-size: 13px;
  color: #4a5a6e;
}

.disponibles {
  color: #065f46;
  font-weight: 500;
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

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  color: #1a2332;
  min-width: 160px;
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

.empleados-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.empleados-table th {
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

.empleados-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f4f9;
  color: #1a2332;
}

.empleados-table tr:hover td {
  background: #fafbfc;
}

.user-name {
  font-weight: 600;
  color: #1a2332;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-coordinator {
  background: #dbeafe;
  color: #1e40af;
}

.role-employee {
  background: #d1fae5;
  color: #065f46;
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
  max-width: 600px;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .empleados-container { padding: 16px; }
  .empleados-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .filter-select, .filter-input { min-width: 100%; }
  .form-row { grid-template-columns: 1fr; }
  .table-footer { flex-direction: column; gap: 12px; align-items: flex-start; }
  .modal-content { padding: 20px; }
}
</style>