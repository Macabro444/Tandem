<template>
  <div class="config-container">
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
    <div class="config-header">
      <div>
        <h1>Configuración de Cuestionarios</h1>
        <p class="subtitle">Gestiona dimensiones, reactivos y escalas para los cuestionarios</p>
      </div>
    </div>

    <!-- TABS -->
    <div class="tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'dimensiones' }"
        @click="activeTab = 'dimensiones'"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        Dimensiones
        <span class="badge">{{ dimensiones.length }}</span>
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'reactivos' }"
        @click="activeTab = 'reactivos'"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        Reactivos
        <span class="badge">{{ reactivos.length }}</span>
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'escalas' }"
        @click="activeTab = 'escalas'"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="19" x2="12" y2="5"/>
          <polyline points="5 12 12 5 19 12"/>
        </svg>
        Escalas
        <span class="badge">{{ escalas.length }}</span>
      </button>
    </div>

    <!-- TAB: DIMENSIONES -->
    <div v-if="activeTab === 'dimensiones'" class="tab-content">
      <div class="tab-header">
        <h3>Dimensiones</h3>
        <button class="btn-primary" @click="openModal('dimension')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva Dimensión
        </button>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Reactivos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="6" class="loading-cell">Cargando dimensiones...</td></tr>
            <tr v-else-if="dimensiones.length === 0"><td colspan="6" class="empty-cell">No hay dimensiones registradas</td></tr>
            <tr v-for="dim in dimensiones" :key="dim.id_dimension">
              <td>#{{ dim.id_dimension }}</td>
              <td><strong>{{ dim.nombre_dimension }}</strong></td>
              <td>{{ dim.concepto_descrip || '—' }}</td>
              <td>
                <span class="badge" :class="dim.tipo_cuestionario === 'NOM_035' ? 'badge-nom' : 'badge-clima'">
                  {{ dim.tipo_cuestionario }}
                </span>
              </td>
              <td>{{ dim.total_reactivos || 0 }}</td>
              <td>
                <div class="actions">
                  <button class="btn-icon" @click="editDimension(dim)" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </button>
                  <button class="btn-icon btn-danger" @click="deleteDimension(dim.id_dimension)" title="Eliminar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB: REACTIVOS -->
    <div v-if="activeTab === 'reactivos'" class="tab-content">
      <div class="tab-header">
        <h3>Reactivos</h3>
        <div class="tab-actions">
          <select v-model="filtroTipo" class="filter-select">
            <option value="">Todos los tipos</option>
            <option value="NOM_035">NOM-035</option>
            <option value="CLIMA_LABORAL">Clima Laboral</option>
          </select>
          <button class="btn-primary" @click="openModal('reactivo')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo Reactivo
          </button>
          <button class="btn-success" @click="openImportModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Importar Excel
          </button>
        </div>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>N° Oficial</th>
              <th>Texto</th>
              <th>Dimensión</th>
              <th>Sección</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="6" class="loading-cell">Cargando reactivos...</td></tr>
            <tr v-else-if="reactivosFiltrados.length === 0"><td colspan="6" class="empty-cell">No hay reactivos registrados</td></tr>
            <tr v-for="reac in reactivosFiltrados" :key="reac.id_reactivo">
              <td>#{{ reac.id_reactivo }}</td>
              <td>{{ reac.numero_oficial || '—' }}</td>
              <td>{{ reac.texto_reactivo }}</td>
              <td>{{ obtenerNombreDimension(reac.id_dimension) }}</td>
              <td><span class="badge badge-seccion">{{ reac.seccion || reac.num_seccion || '—' }}</span></td>
              <td>
                <div class="actions">
                  <button class="btn-icon" @click="editReactivo(reac)" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </button>
                  <button class="btn-icon btn-danger" @click="deleteReactivo(reac.id_reactivo)" title="Eliminar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB: ESCALAS -->
    <div v-if="activeTab === 'escalas'" class="tab-content">
      <div class="tab-header">
        <h3>Escalas de Calificación</h3>
        <button class="btn-primary" @click="openModal('escala')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva Escala
        </button>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="4" class="loading-cell">Cargando escalas...</td></tr>
            <tr v-else-if="escalas.length === 0"><td colspan="4" class="empty-cell">No hay escalas registradas</td></tr>
            <tr v-for="esc in escalas" :key="esc.id_escala">
              <td>#{{ esc.id_escala }}</td>
              <td><strong>{{ esc.nombre_escala }}</strong></td>
              <td>{{ esc.descripcion || '—' }}</td>
              <td>
                <div class="actions">
                  <button class="btn-icon" @click="editEscala(esc)" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </button>
                  <button class="btn-icon btn-danger" @click="deleteEscala(esc.id_escala)" title="Eliminar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL: CRUD -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ modalTitle }}</h2>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <form @submit.prevent="saveItem">
          <!-- DIMENSIÓN -->
          <template v-if="modalType === 'dimension'">
            <div class="form-group"><label>Nombre *</label><input type="text" v-model="formData.nombre_dimension" required /></div>
            <div class="form-group"><label>Descripción</label><textarea v-model="formData.concepto_descrip" rows="2"></textarea></div>
            <div class="form-group">
              <label>Tipo *</label>
              <select v-model="formData.tipo_cuestionario" required>
                <option value="NOM_035">NOM-035</option>
                <option value="CLIMA_LABORAL">Clima Laboral</option>
              </select>
            </div>
          </template>

          <!-- REACTIVO -->
          <template v-if="modalType === 'reactivo'">
            <div class="form-group">
              <label>Dimensión *</label>
              <select v-model="formData.id_dimension" required>
                <option value="">Selecciona una dimensión</option>
                <option v-for="dim in dimensiones" :key="dim.id_dimension" :value="dim.id_dimension">
                  {{ dim.nombre_dimension }} ({{ dim.tipo_cuestionario }})
                </option>
              </select>
            </div>
            <div class="form-group"><label>Texto del Reactivo *</label><textarea v-model="formData.texto_reactivo" rows="3" required></textarea></div>
            <div class="form-row">
              <div class="form-group"><label>N° Oficial</label><input type="number" v-model="formData.numero_oficial" /></div>
              <div class="form-group">
                <label>Sección *</label>
                <select v-model="formData.num_seccion" required>
                  <option value="I">I</option><option value="II">II</option>
                  <option value="III">III</option><option value="IV">IV</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Escala</label>
              <select v-model="formData.id_escala">
                <option :value="null">Sin escala</option>
                <option v-for="esc in escalas" :key="esc.id_escala" :value="esc.id_escala">{{ esc.nombre_escala }}</option>
              </select>
            </div>
          </template>

          <!-- ESCALA -->
          <template v-if="modalType === 'escala'">
            <div class="form-group"><label>Nombre *</label><input type="text" v-model="formData.nombre_escala" required /></div>
            <div class="form-group"><label>Descripción</label><textarea v-model="formData.descripcion" rows="2"></textarea></div>
          </template>

          <div class="form-actions">
            <button type="button" class="btn-outline" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: IMPORTAR EXCEL -->
    <div v-if="showImportModal" class="modal-overlay" @click.self="closeImportModal">
      <div class="modal-content modal-import">
        <div class="modal-header">
          <h2>Importar Reactivos desde Excel</h2>
          <button class="modal-close" @click="closeImportModal">✕</button>
        </div>
        <div class="import-info">
          <p>📋 Formato esperado:</p>
          <ul>
            <li><strong>texto_reactivo</strong> (obligatorio)</li>
            <li><strong>numero_oficial</strong> (opcional)</li>
            <li><strong>num_seccion</strong> (I, II, III o IV)</li>
            <li><strong>nombre_dimension</strong> (debe existir en el sistema)</li>
          </ul>
          <button class="btn-outline btn-sm" @click="downloadTemplate">📥 Descargar plantilla</button>
        </div>
        <div class="drop-zone" :class="{ 'drop-zone--active': isDragging }"
          @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop" @click="triggerFileInput">
          <div class="drop-zone-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p><strong>Arrastra tu archivo Excel aquí</strong></p>
            <p class="drop-zone-hint">o haz clic para seleccionar (.xlsx, .xls)</p>
            <p v-if="importFile" class="drop-zone-file">📎 {{ importFile.name }}</p>
          </div>
          <input ref="fileInputRef" type="file" accept=".xlsx,.xls" @change="handleFileSelect" style="display: none" />
        </div>
        <div v-if="importPreview.length > 0" class="import-preview">
          <h4>Vista previa ({{ importPreview.length }} reactivos)</h4>
          <div class="preview-table-container">
            <table class="table table-preview">
              <thead><tr><th>#</th><th>Texto</th><th>N° Oficial</th><th>Sección</th><th>Dimensión</th></tr></thead>
              <tbody>
                <tr v-for="(item, idx) in importPreview.slice(0, 10)" :key="idx">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ item.texto_reactivo }}</td>
                  <td>{{ item.numero_oficial || '—' }}</td>
                  <td>{{ item.num_seccion || '—' }}</td>
                  <td>{{ item.nombre_dimension || '—' }}</td>
                </tr>
                <tr v-if="importPreview.length > 10"><td colspan="5" class="empty-cell">... y {{ importPreview.length - 10 }} más</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-outline" @click="closeImportModal">Cancelar</button>
          <button type="button" class="btn-success" :disabled="isImporting || importPreview.length === 0" @click="importReactivos">
            {{ isImporting ? 'Importando...' : `Importar ${importPreview.length} reactivos` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';

// =============================================
// TIPOS
// =============================================
interface Dimension {
  id_dimension: number;
  nombre_dimension: string;
  concepto_descrip?: string;
  tipo_cuestionario: 'NOM_035' | 'CLIMA_LABORAL';
  total_reactivos?: number;
}

interface Reactivo {
  id_reactivo: number;
  id_dimension: number;
  texto_reactivo: string;
  numero_oficial?: number;
  num_seccion?: string;
  seccion?: string;
  id_escala?: number | null;
  nombre_dimension?: string;
}

interface Escala {
  id_escala: number;
  nombre_escala: string;
  descripcion?: string;
}

interface ReactivoImport {
  texto_reactivo: string;
  numero_oficial?: number | null;
  num_seccion: string;
  nombre_dimension: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

// =============================================
// TOAST SYSTEM
// =============================================
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
const API_URL = 'http://localhost:8000';

// =============================================
// ESTADO
// =============================================
const activeTab = ref<'dimensiones' | 'reactivos' | 'escalas'>('dimensiones');
const dimensiones = ref<Dimension[]>([]);
const reactivos = ref<Reactivo[]>([]);
const escalas = ref<Escala[]>([]);
const loading = ref(false);
const isSubmitting = ref(false);
const filtroTipo = ref<string>('');

// =============================================
// MODAL CRUD
// =============================================
const showModal = ref(false);
const modalType = ref<'dimension' | 'reactivo' | 'escala'>('dimension');
const modalTitle = ref('');
const editId = ref<number | null>(null);
const formData = ref<any>({});

// =============================================
// MODAL IMPORTACIÓN
// =============================================
const showImportModal = ref(false);
const importFile = ref<File | null>(null);
const importPreview = ref<ReactivoImport[]>([]);
const isImporting = ref(false);
const isDragging = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// =============================================
// FUNCIONES DE AYUDA
// =============================================
const obtenerNombreDimension = (id_dimension: number): string => {
  const dim = dimensiones.value.find(d => d.id_dimension === id_dimension);
  return dim?.nombre_dimension || '—';
};

// =============================================
// COMPUTED
// =============================================
const reactivosFiltrados = computed(() => {
  let resultado = reactivos.value;
  if (filtroTipo.value) {
    const idsDimensiones = dimensiones.value
      .filter(d => d.tipo_cuestionario === filtroTipo.value)
      .map(d => d.id_dimension);
    resultado = resultado.filter(r => idsDimensiones.includes(r.id_dimension));
  }
  return resultado;
});

// =============================================
// CRUD - CARGAR DATOS
// =============================================
const loadData = async () => {
  loading.value = true;
  try {
    const [dimRes, reactRes, escRes] = await Promise.all([
      axios.get<Dimension[]>(`${API_URL}/api/dimensiones`),
      axios.get<Reactivo[]>(`${API_URL}/api/reactivos`),
      axios.get<Escala[]>(`${API_URL}/api/escalas`)
    ]);
    dimensiones.value = dimRes.data || [];
    reactivos.value = reactRes.data || [];
    escalas.value = escRes.data || [];
  } catch (error: any) {
    console.error('Error cargando datos:', error);
    showToast(`Error al cargar datos: ${error.message}`, 'error');
  } finally {
    loading.value = false;
  }
};

// =============================================
// CRUD - MODALES
// =============================================
const openModal = (type: 'dimension' | 'reactivo' | 'escala', data?: any) => {
  modalType.value = type;
  editId.value = data?.id || null;
  
  if (type === 'dimension') {
    modalTitle.value = data ? 'Editar Dimensión' : 'Nueva Dimensión';
    formData.value = data ? { ...data } : { nombre_dimension: '', concepto_descrip: '', tipo_cuestionario: 'NOM_035' };
  } else if (type === 'reactivo') {
    modalTitle.value = data ? 'Editar Reactivo' : 'Nuevo Reactivo';
    formData.value = data ? { 
      id_reactivo: data.id_reactivo,
      id_dimension: data.id_dimension || '', 
      texto_reactivo: data.texto_reactivo || '', 
      numero_oficial: data.numero_oficial || null, 
      num_seccion: data.seccion || data.num_seccion || 'I', 
      id_escala: data.id_escala || null 
    } : { 
      id_dimension: '', texto_reactivo: '', numero_oficial: null, num_seccion: 'I', id_escala: null 
    };
  } else if (type === 'escala') {
    modalTitle.value = data ? 'Editar Escala' : 'Nueva Escala';
    formData.value = data ? { ...data } : { nombre_escala: '', descripcion: '' };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  formData.value = {};
  editId.value = null;
};

// =============================================
// CRUD - GUARDAR
// =============================================
const saveItem = async () => {
  isSubmitting.value = true;
  try {
    let url = '', method: 'post' | 'put' = 'post';
    
    if (modalType.value === 'dimension') {
      url = editId.value ? `${API_URL}/api/dimensiones/${editId.value}` : `${API_URL}/api/dimensiones`;
      method = editId.value ? 'put' : 'post';
    } else if (modalType.value === 'reactivo') {
      url = editId.value ? `${API_URL}/api/reactivos/${editId.value}` : `${API_URL}/api/reactivos`;
      method = editId.value ? 'put' : 'post';
    } else if (modalType.value === 'escala') {
      url = editId.value ? `${API_URL}/api/escalas/${editId.value}` : `${API_URL}/api/escalas`;
      method = editId.value ? 'put' : 'post';
    }
    
    await axios({ method, url, data: formData.value });
    closeModal();
    await loadData();
    showToast('Guardado correctamente', 'success');
  } catch (error: any) {
    console.error('Error guardando:', error);
    showToast(`Error: ${error.response?.data?.detail || error.message || 'Verifica los datos'}`, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// =============================================
// CRUD - ELIMINAR
// =============================================
const deleteDimension = async (id: number) => {
  if (confirm('¿Eliminar esta dimensión?')) {
    try {
      await axios.delete(`${API_URL}/api/dimensiones/${id}`);
      await loadData();
      showToast('Dimensión eliminada correctamente', 'success');
    } catch (error: any) {
      showToast(`Error: ${error.response?.data?.detail || error.message}`, 'error');
    }
  }
};

const deleteReactivo = async (id: number) => {
  if (confirm('¿Eliminar este reactivo?')) {
    try {
      await axios.delete(`${API_URL}/api/reactivos/${id}`);
      await loadData();
      showToast('Reactivo eliminado correctamente', 'success');
    } catch (error: any) {
      showToast(`Error: ${error.response?.data?.detail || error.message}`, 'error');
    }
  }
};

const deleteEscala = async (id: number) => {
  if (confirm('¿Eliminar esta escala?')) {
    try {
      await axios.delete(`${API_URL}/api/escalas/${id}`);
      await loadData();
      showToast('Escala eliminada correctamente', 'success');
    } catch (error: any) {
      showToast(`Error: ${error.response?.data?.detail || error.message}`, 'error');
    }
  }
};

const editDimension = (data: Dimension) => openModal('dimension', data);
const editReactivo = (data: Reactivo) => openModal('reactivo', data);
const editEscala = (data: Escala) => openModal('escala', data);

// =============================================
// IMPORTAR EXCEL
// =============================================
const openImportModal = () => {
  showImportModal.value = true;
  importFile.value = null;
  importPreview.value = [];
};

const closeImportModal = () => {
  showImportModal.value = false;
  importFile.value = null;
  importPreview.value = [];
  isDragging.value = false;
};

const triggerFileInput = () => {
  if (fileInputRef.value) fileInputRef.value.click();
};

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0 && files[0]) {
    processFile(files[0]);
  }
};

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0 && input.files[0]) {
    processFile(input.files[0]);
  }
  if (input) input.value = '';
};

const processFile = (file: File) => {
  const validExtensions = ['.xlsx', '.xls'];
  const isValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  
  if (!isValidExtension) {
    showToast('⚠️ Solo se permiten archivos Excel (.xlsx, .xls)', 'warning');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    showToast('⚠️ El archivo no debe superar los 5 MB', 'warning');
    return;
  }
  
  importFile.value = file;
  readExcelFile(file);
};

const readExcelFile = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        showToast('⚠️ El archivo no contiene hojas', 'warning');
        return;
      }
      
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        showToast('⚠️ No se pudo obtener el nombre de la primera hoja', 'warning');
        return;
      }
      
      const firstSheet = workbook.Sheets[firstSheetName];
      if (!firstSheet) {
        showToast('⚠️ No se pudo leer la primera hoja', 'warning');
        return;
      }
      
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      if (jsonData.length === 0) {
        showToast('⚠️ El archivo está vacío', 'warning');
        return;
      }
      
      const previewData: ReactivoImport[] = jsonData.map((row: any) => {
        const getKey = (keys: string[]) => {
          for (const key of keys) {
            const found = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
            if (found) return row[found];
          }
          return undefined;
        };
        
        return {
          texto_reactivo: String(getKey(['texto_reactivo', 'texto', 'reactivo']) || '').trim(),
          numero_oficial: getKey(['numero_oficial', 'numero', 'num', 'nro']) || null,
          num_seccion: String(getKey(['num_seccion', 'seccion', 'sección', 'section']) || 'I').toUpperCase(),
          nombre_dimension: String(getKey(['nombre_dimension', 'dimension', 'dimensión', 'nombre']) || '').trim()
        };
      }).filter(item => item.texto_reactivo && item.texto_reactivo.trim() !== '');
      
      importPreview.value = previewData;
      if (importPreview.value.length === 0) {
        showToast('⚠️ No se encontraron datos válidos en el archivo', 'warning');
      } else {
        showToast(`📊 ${importPreview.value.length} reactivos encontrados`, 'info', 3000);
      }
    } catch (error) {
      console.error('Error leyendo Excel:', error);
      showToast('❌ Error al leer el archivo. Verifica el formato.', 'error');
    }
  };
  reader.onerror = () => showToast('❌ Error al leer el archivo', 'error');
  reader.readAsArrayBuffer(file);
};

const downloadTemplate = () => {
  const template = [
    { texto_reactivo: 'Ejemplo: ¿Cómo calificas tu carga de trabajo?', numero_oficial: 1, num_seccion: 'I', nombre_dimension: 'Carga de trabajo' },
    { texto_reactivo: 'Ejemplo: ¿Recibes apoyo de tu supervisor?', numero_oficial: 2, num_seccion: 'II', nombre_dimension: 'Apoyo social' },
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(template);
  XLSX.utils.book_append_sheet(wb, ws, 'Reactivos');
  XLSX.writeFile(wb, 'plantilla_reactivos.xlsx');
  showToast('📥 Plantilla descargada', 'success', 2000);
};

const importReactivos = async () => {
  if (importPreview.value.length === 0) {
    showToast('No hay reactivos para importar', 'warning');
    return;
  }

  isImporting.value = true;
  let successCount = 0, errorCount = 0;
  const errors: string[] = [];

  try {
    const dimMap = new Map<string, number>();
    dimensiones.value.forEach(d => {
      if (d.nombre_dimension) dimMap.set(d.nombre_dimension.toLowerCase(), d.id_dimension);
    });

    for (const item of importPreview.value) {
      try {
        const dimName = item.nombre_dimension?.trim();
        if (!dimName) {
          errors.push(`❌ Dimensión no especificada para: "${item.texto_reactivo}"`);
          errorCount++;
          continue;
        }

        const dimId = dimMap.get(dimName.toLowerCase());
        if (!dimId) {
          errors.push(`❌ Dimensión no encontrada: "${dimName}"`);
          errorCount++;
          continue;
        }

        const seccion = item.num_seccion?.toString().toUpperCase();
        if (!['I', 'II', 'III', 'IV'].includes(seccion)) {
          errors.push(`❌ Sección inválida "${seccion}" para: "${item.texto_reactivo}"`);
          errorCount++;
          continue;
        }

        await axios.post(`${API_URL}/api/reactivos`, {
          id_dimension: dimId,
          texto_reactivo: item.texto_reactivo.trim(),
          numero_oficial: item.numero_oficial ? Number(item.numero_oficial) : null,
          num_seccion: seccion,
          id_escala: 1
        });
        successCount++;
      } catch (err: any) {
        errorCount++;
        errors.push(`❌ "${item.texto_reactivo}": ${err.response?.data?.detail || err.message}`);
      }
    }

    if (successCount > 0) showToast(`✅ ${successCount} reactivos importados correctamente`, 'success');
    if (errorCount > 0) showToast(`⚠️ ${errorCount} errores`, 'warning', 8000);

    await loadData();
    closeImportModal();
  } catch (error: any) {
    showToast(`❌ Error al importar: ${error.message}`, 'error');
  } finally {
    isImporting.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped>
/* ==========================================
   ESTILOS GENERALES
   ========================================== */
.config-container {
  padding: 24px;
  min-height: 100vh;
  background: #f5f7fa;
}

.config-header { margin-bottom: 24px; }
.config-header h1 { font-size: 26px; font-weight: 700; color: #1a2332; margin: 0; }
.config-header .subtitle { color: #6b7a8f; font-size: 14px; margin: 4px 0 0; }

/* TABS */
.tabs {
  display: flex;
  gap: 4px;
  background: #fff;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #4a5a6e;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.tab-btn:hover { background: #f0f4f9; }
.tab-btn.active { background: #2563eb; color: #fff; }
.tab-btn .badge {
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}
.tab-btn.active .badge { background: rgba(255,255,255,0.2); }
.tab-btn svg { flex-shrink: 0; }

/* TAB CONTENT */
.tab-content {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.tab-header h3 { font-size: 16px; color: #1a2332; margin: 0; }
.tab-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }

/* BOTONES */
.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
}
.btn-primary:hover { background: #1d4ed8; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-success {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #16a34a;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
}
.btn-success:hover { background: #15803d; }
.btn-success:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-outline {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #4a5a6e;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}
.btn-outline:hover { background: #f0f4f9; }
.btn-sm { padding: 4px 12px; font-size: 12px; }

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  color: #1a2332;
  min-width: 160px;
}

/* TABLAS */
.table-container { overflow-x: auto; }
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
.table tr:hover td { background: #fafbfc; }

/* BADGES */
.badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}
.badge-nom { background: #dbeafe; color: #1e40af; }
.badge-clima { background: #d1fae5; color: #065f46; }
.badge-seccion { background: #fef3c7; color: #92400e; }

/* ACCIONES */
.actions { display: flex; gap: 4px; }
.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7a8f;
  transition: all 0.2s;
}
.btn-icon:hover { background: #f0f4f9; color: #1a2332; }
.btn-icon.btn-danger:hover { background: #fef2f2; color: #dc2626; }

.loading-cell, .empty-cell {
  text-align: center;
  padding: 40px !important;
  color: #6b7a8f;
}

/* MODALES */
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
.modal-import { max-width: 720px !important; }
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

/* FORMULARIO */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}
.form-group label { font-size: 13px; font-weight: 500; color: #4a5a6e; }
.form-group input, .form-group textarea, .form-group select {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1a2332;
  background: #fff;
  font-family: inherit;
  width: 100%;
}
.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }

/* IMPORTAR EXCEL */
.import-info {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.import-info p { margin: 0 0 4px 0; font-weight: 600; font-size: 14px; }
.import-info ul { margin: 4px 0 0 0; padding-left: 20px; font-size: 13px; color: #1e293b; }

.drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafbfc;
}
.drop-zone:hover { background: #f1f5f9; border-color: #94a3b8; }
.drop-zone--active { border-color: #2563eb; background: #eff6ff; }
.drop-zone-content { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.drop-zone-content p { margin: 0; }
.drop-zone-hint { font-size: 13px; color: #64748b; }
.drop-zone-file { font-weight: 600; color: #2563eb !important; margin-top: 4px !important; }

.import-preview { margin-top: 16px; }
.import-preview h4 { font-size: 14px; margin: 0 0 8px 0; color: #1e293b; }
.preview-table-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.table-preview { font-size: 12px; }
.table-preview th { position: sticky; top: 0; background: #f8fafc; z-index: 1; }
.table-preview td { padding: 6px 10px; }

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
.toast-message { font-size: 14px; color: #1a2332; flex: 1; line-height: 1.4; white-space: pre-wrap; }
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

/* RESPONSIVE */
@media (max-width: 768px) {
  .config-container { padding: 16px; }
  .tabs { flex-wrap: wrap; }
  .tab-btn { flex: 1; justify-content: center; font-size: 12px; padding: 8px 12px; }
  .tab-btn svg { display: none; }
  .tab-header { flex-direction: column; align-items: flex-start; }
  .tab-actions { width: 100%; flex-direction: column; }
  .tab-actions > * { width: 100%; }
  .filter-select { width: 100%; }
  .form-row { grid-template-columns: 1fr; }
  .modal-content { padding: 20px; margin: 10px; }
  .modal-import { max-width: 100% !important; }
  .drop-zone { padding: 20px; }
  .toast-container { top: 10px; right: 10px; max-width: calc(100% - 20px); }
  .toast-content { padding: 12px 14px; }
  .toast-message { font-size: 13px; }
}
</style>