<template>
  <div class="users-container">
    <div class="users-header">
      <div>
        <h1>Gestión de Usuarios</h1>
        <p class="subtitle">Administra el personal interno y empleados de las empresas</p>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nuevo Usuario
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
            placeholder="Buscar por nombre, apellido o email..."
            class="filter-input search-input"
          />
        </div>
      </div>
      <div class="filter-group">
        <label>Rol</label>
        <select v-model="filterRol" class="filter-select">
          <option value="all">Todos los roles</option>
          <option value="ADMIN">Administrador</option>
          <option value="COORDINADOR">Coordinador</option>
          <option value="EMPLEADO">Empleado</option>
          <option value="CAPTURISTA">Capturista</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Empresa</label>
        <select v-model="filterEmpresa" class="filter-select">
          <option value="all">Todas las empresas</option>
          <option v-for="emp in empresas" :key="emp.id_empresa" :value="emp.id_empresa">
            {{ emp.nom_empresa }}
          </option>
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
        <span>Mostrando {{ filteredUsers.length }} de {{ users.length }} usuarios</span>
      </div>

      <table class="users-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Empresa</th>
            <th>Status</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="6" class="loading-cell">Cargando usuarios...</td>
          </tr>
          <tr v-else-if="filteredUsers.length === 0">
            <td colspan="6" class="empty-cell">No hay usuarios registrados</td>
          </tr>
          <tr v-for="user in paginatedUsers" :key="user.id_usuario">
            <td>
              <div class="user-info">
                <div class="user-name">{{ user.nom_usuario }} {{ user.ap_usuario }}</div>
                <div class="user-username">@{{ user.username }}</div>
              </div>
            </td>
            <td>{{ user.email_usuario }}</td>
            <td>
              <span class="role-badge" :class="getRoleClass(user.rol_usuario)">
                {{ getRoleLabel(user.rol_usuario) }}
              </span>
            </td>
            <td>{{ user.empresa?.nom_empresa || '—' }}</td>
            <td>
              <span class="status-badge" :class="user.activo ? 'status-active' : 'status-inactive'">
                {{ user.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon" @click="viewUser(user)" title="Ver detalles">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
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
        <span>Mostrando {{ ((currentPage - 1) * itemsPerPage) + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} de {{ filteredUsers.length }}</span>
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
          <h2>Nuevo Usuario</h2>
          <button class="modal-close" @click="closeCreateModal">✕</button>
        </div>
        <form @submit.prevent="createUser">
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
                <option value="">Selecciona un rol</option>
                <option value="ADMIN">Administrador</option>
                <option value="COORDINADOR">Coordinador</option>
                <option value="EMPLEADO">Empleado</option>
                <option value="CAPTURISTA">Capturista</option>
              </select>
            </div>
            <div class="form-group" v-if="newUser.rol_usuario === 'COORDINADOR' || newUser.rol_usuario === 'EMPLEADO'">
              <label>Empresa *</label>
              <select v-model="newUser.id_empresa" class="filter-select" required>
                <option value="">Selecciona una empresa</option>
                <option v-for="emp in empresas" :key="emp.id_empresa" :value="emp.id_empresa">
                  {{ emp.nom_empresa }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-outline" @click="closeCreateModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : 'Crear Usuario' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL EDITAR -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Editar Usuario</h2>
          <button class="modal-close" @click="closeEditModal">✕</button>
        </div>
        <form @submit.prevent="updateUser">
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
                <option value="ADMIN">Administrador</option>
                <option value="COORDINADOR">Coordinador</option>
                <option value="EMPLEADO">Empleado</option>
                <option value="CAPTURISTA">Capturista</option>
              </select>
            </div>
            <div class="form-group" v-if="editUser.rol_usuario === 'COORDINADOR' || editUser.rol_usuario === 'EMPLEADO'">
              <label>Empresa *</label>
              <select v-model="editUser.id_empresa" class="filter-select" required>
                <option v-for="emp in empresas" :key="emp.id_empresa" :value="emp.id_empresa">
                  {{ emp.nom_empresa }}
                </option>
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
            <div class="form-group">
              <label>Primer Ingreso</label>
              <select v-model="editUser.primer_ingreso" class="filter-select">
                <option :value="true">Sí</option>
                <option :value="false">No</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-outline" @click="closeEditModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : 'Actualizar Usuario' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL DETALLE -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal-content modal-detail">
        <div class="modal-header">
          <h2>Detalle de Usuario</h2>
          <button class="modal-close" @click="closeDetailModal">✕</button>
        </div>
        <div v-if="selectedUser" class="detail-content">
          <div class="detail-row"><span class="detail-label">Nombre</span><span class="detail-value">{{ selectedUser.nom_usuario }} {{ selectedUser.ap_usuario }}</span></div>
          <div class="detail-row"><span class="detail-label">Usuario</span><span class="detail-value">@{{ selectedUser.username }}</span></div>
          <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">{{ selectedUser.email_usuario }}</span></div>
          <div class="detail-row"><span class="detail-label">Teléfono</span><span class="detail-value">{{ selectedUser.tel_usuario || '—' }}</span></div>
          <div class="detail-row"><span class="detail-label">Rol</span><span class="detail-value">{{ getRoleLabel(selectedUser.rol_usuario) }}</span></div>
          <div class="detail-row"><span class="detail-label">Empresa</span><span class="detail-value">{{ selectedUser.empresa?.nom_empresa || '—' }}</span></div>
          <div class="detail-row"><span class="detail-label">Primer Ingreso</span><span class="detail-value">{{ selectedUser.primer_ingreso ? 'Sí' : 'No' }}</span></div>
          <div class="detail-row"><span class="detail-label">Status</span>
            <span class="status-badge" :class="selectedUser.activo ? 'status-active' : 'status-inactive'">
              {{ selectedUser.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <div class="detail-row"><span class="detail-label">Registro</span><span class="detail-value">{{ formatDate(selectedUser.created_at) }}</span></div>
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

const users = ref<any[]>([]);
const empresas = ref<any[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const searchTerm = ref('');
const filterRol = ref('all');
const filterEmpresa = ref('all');
const filterStatus = ref('all');
const currentPage = ref(1);
const itemsPerPage = ref(5);

// Modals
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDetailModal = ref(false);
const selectedUser = ref<any>(null);

const newUser = ref({
  nom_usuario: '',
  ap_usuario: '',
  tel_usuario: '',
  email_usuario: '',
  username: '',
  cont_usuario: '',
  rol_usuario: '',
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
  rol_usuario: '',
  id_empresa: null as number | null,
  primer_ingreso: true,
  activo: true
});

const filteredUsers = computed(() => {
  let result = users.value;

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

  if (filterEmpresa.value !== 'all') {
    result = result.filter(u => u.id_empresa === Number(filterEmpresa.value));
  }

  if (filterStatus.value === 'activo') {
    result = result.filter(u => u.activo === true);
  } else if (filterStatus.value === 'inactivo') {
    result = result.filter(u => u.activo === false);
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage.value));
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredUsers.value.slice(start, start + itemsPerPage.value);
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

const loadEmpresas = async () => {
  try {
    empresas.value = await ApiService.getEmpresas();
  } catch (error) {
    console.error('Error cargando empresas:', error);
  }
};

const loadUsers = async () => {
  isLoading.value = true;
  try {
    users.value = await ApiService.getUsers();
  } catch (error) {
    console.error('Error cargando usuarios:', error);
  } finally {
    isLoading.value = false;
  }
};

const openCreateModal = () => { showCreateModal.value = true; };
const closeCreateModal = () => {
  showCreateModal.value = false;
  newUser.value = {
    nom_usuario: '',
    ap_usuario: '',
    tel_usuario: '',
    email_usuario: '',
    username: '',
    cont_usuario: '',
    rol_usuario: '',
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

const viewUser = (user: any) => {
  selectedUser.value = user;
  showDetailModal.value = true;
};
const closeDetailModal = () => { showDetailModal.value = false; };

const createUser = async () => {
  isSubmitting.value = true;
  try {
    await ApiService.createUser(newUser.value);
    closeCreateModal();
    await loadUsers();
    alert('✅ Usuario creado correctamente');
  } catch (error: any) {
    console.error('Error:', error);
    alert(`Error al crear usuario: ${error.response?.data?.message || 'Verifica los datos'}`);
  } finally {
    isSubmitting.value = false;
  }
};

const updateUser = async () => {
  isSubmitting.value = true;
  try {
    const dataToSend: any = {
      nom_usuario: editUser.value.nom_usuario,
      ap_usuario: editUser.value.ap_usuario,
      tel_usuario: editUser.value.tel_usuario || null,
      email_usuario: editUser.value.email_usuario,
      username: editUser.value.username,
      rol_usuario: editUser.value.rol_usuario,
      id_empresa: editUser.value.id_empresa || null,
      primer_ingreso: editUser.value.primer_ingreso,
      activo: editUser.value.activo
    };

    if (editUser.value.cont_usuario) {
      dataToSend.cont_usuario = editUser.value.cont_usuario;
    }

    await ApiService.updateUser(editUser.value.id_usuario, dataToSend);
    closeEditModal();
    await loadUsers();
    alert('✅ Usuario actualizado correctamente');
  } catch (error: any) {
    console.error('Error:', error);
    alert(`Error al actualizar usuario: ${error.response?.data?.message || 'Verifica los datos'}`);
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDelete = async (user: any) => {
  if (confirm(`¿Desactivar al usuario "${user.nom_usuario} ${user.ap_usuario}"?`)) {
    try {
      await ApiService.deleteUser(user.id_usuario);
      await loadUsers();
      alert('✅ Usuario desactivado correctamente');
    } catch (error) {
      alert('Error al desactivar usuario');
    }
  }
};

const resetFilters = () => {
  searchTerm.value = '';
  filterRol.value = 'all';
  filterEmpresa.value = 'all';
  filterStatus.value = 'all';
  currentPage.value = 1;
};

const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };

onMounted(async () => {
  await loadEmpresas();
  await loadUsers();
  
  if (route.query.empresa) {
    filterEmpresa.value = route.query.empresa as string;
  }
});
</script>

<style scoped>
.users-container {
  padding: 24px;
  min-height: 100vh;
  background: #f5f7fa;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.users-header h1 {
  font-size: 26px;
  font-weight: 700;
  color: #1a2332;
  margin: 0;
}

.users-header .subtitle {
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

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.users-table th {
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

.users-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f4f9;
  color: #1a2332;
}

.users-table tr:hover td {
  background: #fafbfc;
}

.user-name {
  font-weight: 600;
  color: #1a2332;
}

.user-username {
  font-size: 12px;
  color: #6b7a8f;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
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

@media (max-width: 768px) {
  .users-container { padding: 16px; }
  .users-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .filter-select, .filter-input { min-width: 100%; }
  .form-row { grid-template-columns: 1fr; }
  .table-footer { flex-direction: column; gap: 12px; align-items: flex-start; }
  .modal-content { padding: 20px; }
}
</style>