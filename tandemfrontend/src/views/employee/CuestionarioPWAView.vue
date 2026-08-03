<template>
  <div class="cuestionario-container">
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
      <div class="header-content">
        <div class="header-left">
          <span class="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </span>
          <div>
            <h1>{{ nombreCuestionario || 'Cuestionario' }}</h1>
            <p class="subtitle">{{ authStore.user?.nom_usuario || 'Empleado' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- PROGRESO -->
    <div class="progress-section">
      <div class="progress-info">
        <span class="pregunta-numero">
          <strong>Pregunta {{ currentIndex + 1 }}</strong> de {{ cuestionario.length }}
        </span>
        <span class="progreso-porcentaje">{{ progreso }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progreso + '%' }">
          <span class="progress-label">{{ progreso }}%</span>
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <h3>Cargando cuestionario...</h3>
      <p>Por favor espera un momento</p>
    </div>

    <!-- CUESTIONARIO VACÍO -->
    <div v-else-if="cuestionario.length === 0" class="empty-container">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="9" y1="9" x2="15" y2="9"/>
          <line x1="9" y1="13" x2="15" y2="13"/>
          <line x1="9" y1="17" x2="13" y2="17"/>
        </svg>
      </div>
      <h3>No hay preguntas disponibles</h3>
      <p>El cuestionario aún no tiene reactivos asignados.</p>
      <button class="btn-primary" @click="recargar">Recargar</button>
    </div>

    <!-- PASO 1: CUESTIONARIO -->
    <div v-else-if="!mostrarSociodemograficos && !mostrarConfirmacion" class="card-pregunta">
      <div class="pregunta-header">
        <div class="badges">
          <span class="badge badge-seccion">Sección {{ preguntaActual?.num_seccion || 'I' }}</span>
          <span class="badge badge-dimension">{{ preguntaActual?.nombre_dimension || 'Sin dimensión' }}</span>
          <span class="badge badge-id">#{{ preguntaActual?.numero_oficial || '' }}</span>
        </div>
        <span class="pregunta-progreso">{{ currentIndex + 1 }}/{{ cuestionario.length }}</span>
      </div>
      
      <h2 class="pregunta-texto">{{ preguntaActual?.texto_reactivo || 'Cargando...' }}</h2>

      <div class="opciones">
        <div 
          v-for="opcion in opcionesRespuesta" 
          :key="opcion.valor"
          class="opcion-item"
          :class="{ 
            selected: respuestas[preguntaActual?.id_reactivo] === opcion.valor,
            hover: hoverOpcion === opcion.valor
          }"
          @click="seleccionarRespuesta(opcion.valor)"
          @mouseenter="hoverOpcion = opcion.valor"
          @mouseleave="hoverOpcion = null"
        >
          <span class="opcion-radio">
            <span v-if="respuestas[preguntaActual?.id_reactivo] === opcion.valor" class="radio-checked"></span>
          </span>
          <span class="opcion-texto">
            <span class="opcion-valor">{{ opcion.valor }}</span>
            {{ opcion.texto }}
          </span>
          <span v-if="respuestas[preguntaActual?.id_reactivo] === opcion.valor" class="opcion-check">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
        </div>
      </div>

      <div class="pregunta-actions">
        <button 
          class="btn-outline" 
          @click="irAtras" 
          :disabled="currentIndex === 0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Anterior
        </button>
        <button 
          class="btn-primary" 
          @click="irAdelante"
          :disabled="!tieneRespuesta"
        >
          {{ currentIndex === cuestionario.length - 1 ? 'Finalizar' : 'Siguiente' }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <div class="pregunta-footer">
        <span class="respuestas-total">{{ Object.keys(respuestas).length }} de {{ cuestionario.length }} respondidas</span>
        <span v-if="!tieneRespuesta" class="respuesta-pendiente">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          </svg>
          Selecciona una respuesta
        </span>
        <span v-else class="respuesta-ok">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Respondida
        </span>
      </div>
    </div>

    <!-- PASO 2: DATOS SOCIODEMOGRÁFICOS -->
    <div v-else-if="mostrarSociodemograficos && !mostrarConfirmacion" class="card-socio">
      <div class="card-header">
        <span class="card-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </span>
        <div>
          <h2>Datos requeridos</h2>
          <p class="socio-subtitle">Esta información es obligatoria y totalmente confidencial.</p>
        </div>
      </div>
      
      <p class="socio-obligatorio">* Todos los campos son obligatorios</p>

      <form @submit.prevent="guardarSociodemograficos" class="socio-form">
        <div class="form-group">
          <label>Área o Departamento *</label>
          <input 
            type="text" 
            v-model="sociodemograficos.area_trabaja" 
            required 
            placeholder="Ej: Recursos Humanos"
            :class="{ error: errores.area_trabaja }"
          />
          <span v-if="errores.area_trabaja" class="error-msg">Campo requerido</span>
        </div>

        <div class="form-group">
          <label>Puesto actual *</label>
          <input 
            type="text" 
            v-model="sociodemograficos.puesto_ocupa" 
            required 
            placeholder="Ej: Analista"
            :class="{ error: errores.puesto_ocupa }"
          />
          <span v-if="errores.puesto_ocupa" class="error-msg">Campo requerido</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Antigüedad *</label>
            <select v-model="sociodemograficos.antiguedad" required :class="{ error: errores.antiguedad }">
              <option value="">Selecciona una opción</option>
              <option value="< 1 año">Menos de 1 año</option>
              <option value="1-2 años">1-2 años</option>
              <option value="3-5 años">3-5 años</option>
              <option value="6-10 años">6-10 años</option>
              <option value="> 10 años">Más de 10 años</option>
            </select>
            <span v-if="errores.antiguedad" class="error-msg">Campo requerido</span>
          </div>

          <div class="form-group">
            <label>Tipo de Contrato *</label>
            <select v-model="sociodemograficos.tipo_contrato" required :class="{ error: errores.tipo_contrato }">
              <option value="">Selecciona una opción</option>
              <option value="Indeterminado">Indeterminado</option>
              <option value="Temporal">Temporal</option>
              <option value="Por obra">Por obra</option>
              <option value="Honorarios">Honorarios</option>
            </select>
            <span v-if="errores.tipo_contrato" class="error-msg">Campo requerido</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Escolaridad *</label>
            <select v-model="sociodemograficos.escolaridad" required :class="{ error: errores.escolaridad }">
              <option value="">Selecciona una opción</option>
              <option value="Primaria">Primaria</option>
              <option value="Secundaria">Secundaria</option>
              <option value="Preparatoria">Preparatoria</option>
              <option value="Técnico">Técnico</option>
              <option value="Licenciatura">Licenciatura</option>
              <option value="Maestría">Maestría</option>
              <option value="Doctorado">Doctorado</option>
            </select>
            <span v-if="errores.escolaridad" class="error-msg">Campo requerido</span>
          </div>

          <div class="form-group">
            <label>¿Tienes discapacidad? *</label>
            <select v-model="sociodemograficos.tiene_discapacidad" required :class="{ error: errores.tiene_discapacidad }">
              <option value="">Selecciona una opción</option>
              <option value="No">No</option>
              <option value="Sí">Sí</option>
            </select>
            <span v-if="errores.tiene_discapacidad" class="error-msg">Campo requerido</span>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-outline" @click="mostrarSociodemograficos = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Volver
          </button>
          <button type="submit" class="btn-primary" :disabled="enviando">
            <span v-if="enviando">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Enviando...
            </span>
            <span v-else>
              Guardar y Continuar
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </span>
          </button>
        </div>
      </form>
    </div>

    <!-- PASO 3: CONFIRMACIÓN -->
    <div v-else-if="mostrarConfirmacion" class="card-confirmacion">
      <div class="confirmation-animation">
        <div class="checkmark-circle">
          <div class="checkmark-draw">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>
      </div>
      
      <h2>¡Cuestionario Enviado con Éxito!</h2>
      <p>Tu participación ha sido registrada de forma segura y anónima.</p>
      
      <div class="resumen-confirmacion">
        <div class="resumen-item">
          <span class="resumen-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a5a6e" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="9" y1="9" x2="15" y2="9"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="13" y2="17"/>
            </svg>
          </span>
          <span class="resumen-texto">Preguntas respondidas</span>
          <span class="resumen-valor">{{ cuestionario.length }}</span>
        </div>
        <div class="resumen-item">
          <span class="resumen-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a5a6e" stroke-width="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </span>
          <span class="resumen-texto">Tipo de estudio</span>
          <span class="resumen-valor">{{ tipoEstudio === 'NOM_035' ? 'NOM-035' : 'Clima Laboral' }}</span>
        </div>
        <div class="resumen-item">
          <span class="resumen-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a5a6e" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          <span class="resumen-texto">Datos sociodemográficos</span>
          <span class="resumen-valor">Registrados</span>
        </div>
        <div class="resumen-item">
          <span class="resumen-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a5a6e" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="9" y1="9" x2="15" y2="9"/>
            </svg>
          </span>
          <span class="resumen-texto">Confidencialidad</span>
          <span class="resumen-valor">100% anónimo</span>
        </div>
      </div>

      <div class="confirmation-actions">
        <button class="btn-primary btn-large" @click="irAlDashboard">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          Ir al Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const API_URL = 'http://localhost:8000';

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

// =============================================
// ESTADO
// =============================================
const cuestionario = ref<any[]>([]);
const nombreCuestionario = ref('');
const currentIndex = ref(0);
const respuestas = ref<Record<number, number>>({});
const mostrarSociodemograficos = ref(false);
const mostrarConfirmacion = ref(false);
const enviando = ref(false);
const loading = ref(true);
const hoverOpcion = ref<number | null>(null);
const tipoEstudio = ref('NOM_035');
const idCuestionario = ref<number | null>(null);

const opcionesRespuesta = [
  { valor: 0, texto: 'Nunca' },
  { valor: 1, texto: 'Casi nunca' },
  { valor: 2, texto: 'Algunas veces' },
  { valor: 3, texto: 'Casi siempre' },
  { valor: 4, texto: 'Siempre' }
];

const sociodemograficos = ref({
  area_trabaja: '',
  puesto_ocupa: '',
  antiguedad: '',
  tipo_contrato: '',
  escolaridad: '',
  tiene_discapacidad: '',
  adscripcion: 'Oficinas Centrales',
  puesto_reporta: 'Supervisor'
});

const errores = ref<Record<string, boolean>>({
  area_trabaja: false,
  puesto_ocupa: false,
  antiguedad: false,
  tipo_contrato: false,
  escolaridad: false,
  tiene_discapacidad: false
});

// =============================================
// COMPUTED
// =============================================
const preguntaActual = computed(() => {
  return cuestionario.value[currentIndex.value] || null;
});

const progreso = computed(() => {
  if (cuestionario.value.length === 0) return 0;
  const respondidas = Object.keys(respuestas.value).length;
  return Math.round((respondidas / cuestionario.value.length) * 100);
});

const tieneRespuesta = computed(() => {
  if (!preguntaActual.value) return false;
  return respuestas.value[preguntaActual.value.id_reactivo] !== undefined;
});

// =============================================
// MÉTODOS
// =============================================
const cargarCuestionario = async () => {
  loading.value = true;
  try {
    const userId = authStore.user?.id_usuario;
    
    // Si no hay ID en la URL, redirigir al dashboard
    if (!idCuestionario.value) {
      showToast('No se especificó un cuestionario válido', 'error');
      router.push('/empleado/dashboard');
      return;
    }

    // Usar el nuevo endpoint que obtiene el cuestionario por ID
    const res = await axios.get(`${API_URL}/api/empleado/cuestionario/${idCuestionario.value}`, {
      params: {
        id_usuario: userId
      },
      timeout: 15000
    });
    
    const data = res.data;
    cuestionario.value = data.reactivos || [];
    nombreCuestionario.value = data.nombre || 'Cuestionario';
    tipoEstudio.value = data.tipo_estudio || 'NOM_035';
    
    if (cuestionario.value.length === 0) {
      showToast('No hay preguntas disponibles para este cuestionario.', 'warning');
    }
  } catch (error: any) {
    console.error('Error cargando cuestionario:', error);
    if (error.response?.status === 400) {
      showToast('Ya has completado este cuestionario', 'warning');
      setTimeout(() => router.push('/empleado/dashboard'), 2000);
    } else {
      showToast(`Error al cargar el cuestionario: ${error.message}`, 'error');
    }
  } finally {
    loading.value = false;
  }
};

const seleccionarRespuesta = (valor: number) => {
  if (preguntaActual.value) {
    respuestas.value[preguntaActual.value.id_reactivo] = valor;
    localStorage.setItem(`respuestas_temp_${idCuestionario.value}`, JSON.stringify(respuestas.value));
  }
};

const irAdelante = () => {
  if (!preguntaActual.value) return;
  
  if (!tieneRespuesta.value) {
    showToast('Por favor, selecciona una respuesta.', 'warning');
    return;
  }

  if (currentIndex.value === cuestionario.value.length - 1) {
    mostrarSociodemograficos.value = true;
  } else {
    currentIndex.value++;
  }
};

const irAtras = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const validarSociodemograficos = (): boolean => {
  let valido = true;
  const campos = ['area_trabaja', 'puesto_ocupa', 'antiguedad', 'tipo_contrato', 'escolaridad', 'tiene_discapacidad'];
  
  for (const campo of campos) {
    const valor = sociodemograficos.value[campo as keyof typeof sociodemograficos.value];
    errores.value[campo] = !valor || valor.trim() === '';
    if (errores.value[campo]) valido = false;
  }
  
  return valido;
};

const guardarSociodemograficos = async () => {
  if (!validarSociodemograficos()) {
    showToast('Por favor, completa todos los campos.', 'warning');
    return;
  }

  enviando.value = true;
  try {
    const payload = {
      id_cuestionario: idCuestionario.value,
      id_usuario: authStore.user?.id_usuario,
      respuestas: Object.entries(respuestas.value).map(([id, valor]) => ({
        id_reactivo: Number(id),
        valor_respondido: valor,
        texto_abierto: null
      }))
    };

    await axios.post(`${API_URL}/api/responder-cuestionario`, payload, { timeout: 15000 });
    
    localStorage.removeItem(`respuestas_temp_${idCuestionario.value}`);
    mostrarSociodemograficos.value = false;
    mostrarConfirmacion.value = true;
    showToast('¡Cuestionario enviado con éxito!', 'success');
  } catch (error: any) {
    console.error('Error guardando respuestas:', error);
    showToast(`Error al guardar: ${error.response?.data?.detail || error.message}`, 'error');
  } finally {
    enviando.value = false;
  }
};

const irAlDashboard = () => {
  router.push('/empleado/dashboard');
};

const recargar = () => {
  cargarCuestionario();
};

// =============================================
// LIFECYCLE
// =============================================
onMounted(() => {
  // Obtener ID de la URL
  const id = route.params.id;
  if (id) {
    idCuestionario.value = Number(id);
  }
  
  // Recuperar respuestas guardadas
  if (idCuestionario.value) {
    const saved = localStorage.getItem(`respuestas_temp_${idCuestionario.value}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          respuestas.value = parsed;
        }
      } catch (e) {
        console.warn('Error al cargar respuestas guardadas');
      }
    }
  }
  
  cargarCuestionario();
});
</script>

<style scoped>
/* ==========================================
   RESET Y BASE
   ========================================== */
* {
  box-sizing: border-box;
}

.cuestionario-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8ecf4 100%);
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* ==========================================
   HEADER
   ========================================== */
.header {
  background: #ffffff;
  border-bottom: 1px solid #e8ecf0;
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  font-size: 28px;
  line-height: 1;
}

.header h1 {
  font-size: 20px;
  font-weight: 700;
  color: #1a2332;
  margin: 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 13px;
  color: #6b7a8f;
  margin: 0;
}

.btn-salir {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-salir:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

/* ==========================================
   PROGRESO
   ========================================== */
.progress-section {
  max-width: 800px;
  margin: 20px auto 0;
  padding: 0 24px;
  width: 100%;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #4a5a6e;
  margin-bottom: 8px;
}

.pregunta-numero strong {
  color: #1a2332;
}

.progreso-porcentaje {
  font-weight: 600;
  color: #2563eb;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e8ecf0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  border-radius: 4px;
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 4px;
  min-width: 30px;
}

.progress-label {
  font-size: 9px;
  color: #fff;
  font-weight: 700;
  opacity: 0.8;
}

/* ==========================================
   LOADING
   ========================================== */
.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e8ecf0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 24px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container h3 {
  color: #1a2332;
  margin: 0 0 8px 0;
}

.loading-container p {
  color: #6b7a8f;
  margin: 0;
}

/* ==========================================
   EMPTY
   ========================================== */
.empty-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-container h3 {
  color: #1a2332;
  margin: 0 0 8px 0;
}

.empty-container p {
  color: #6b7a8f;
  margin: 0 0 24px 0;
}

/* ==========================================
   CARD PREGUNTA
   ========================================== */
.card-pregunta {
  max-width: 800px;
  margin: 24px auto;
  padding: 32px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  width: 100%;
  flex: 1;
  animation: fadeInUp 0.4s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.pregunta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 8px;
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge-seccion {
  background: #fef3c7;
  color: #92400e;
}

.badge-dimension {
  background: #dbeafe;
  color: #1e40af;
}

.badge-id {
  background: #f3f4f6;
  color: #6b7280;
}

.pregunta-progreso {
  font-size: 13px;
  color: #6b7a8f;
  font-weight: 500;
}

.pregunta-texto {
  font-size: 22px;
  font-weight: 600;
  color: #1a2332;
  margin: 0 0 28px 0;
  line-height: 1.6;
}

.opciones {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}

.opcion-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: #fff;
  position: relative;
}

.opcion-item:hover {
  border-color: #93c5fd;
  background: #f8fafc;
  transform: translateX(4px);
}

.opcion-item.selected {
  border-color: #2563eb;
  background: #eef2ff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.opcion-radio {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.opcion-item.selected .opcion-radio {
  border-color: #2563eb;
  background: #2563eb;
}

.radio-checked {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
}

.opcion-texto {
  flex: 1;
  font-size: 15px;
  color: #1a2332;
}

.opcion-valor {
  display: inline-block;
  min-width: 20px;
  font-weight: 600;
  color: #2563eb;
  margin-right: 4px;
}

.opcion-check {
  font-size: 18px;
  color: #2563eb;
  font-weight: 700;
}

.pregunta-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: #2563eb;
  border: none;
  border-radius: 10px;
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: #fff;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  color: #4a5a6e;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover:not(:disabled) {
  background: #f0f4f9;
  border-color: #9ca3af;
}

.btn-outline:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pregunta-footer {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #6b7a8f;
  padding-top: 12px;
  border-top: 1px solid #f0f4f9;
}

.respuesta-pendiente {
  color: #f59e0b;
  font-weight: 500;
}

.respuesta-ok {
  color: #22c55e;
  font-weight: 500;
}

/* ==========================================
   CARD SOCIODEMOGRÁFICOS
   ========================================== */
.card-socio {
  max-width: 800px;
  margin: 24px auto;
  padding: 32px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  width: 100%;
  animation: fadeInUp 0.4s ease;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 4px;
}

.card-icon {
  font-size: 32px;
}

.card-header h2 {
  font-size: 22px;
  color: #1a2332;
  margin: 0;
}

.socio-subtitle {
  color: #6b7a8f;
  font-size: 14px;
  margin: 0;
}

.socio-obligatorio {
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
  margin: 8px 0 20px 0;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 8px;
}

.socio-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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
  border: 2px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  color: #1a2332;
  background: #fff;
  transition: all 0.2s;
  width: 100%;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.form-group input.error,
.form-group select.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.error-msg {
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

/* ==========================================
   CARD CONFIRMACIÓN
   ========================================== */
.card-confirmacion {
  max-width: 600px;
  margin: 40px auto;
  padding: 48px 40px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  text-align: center;
  animation: fadeInUp 0.6s ease;
}

.confirmation-animation {
  margin-bottom: 24px;
}

.checkmark-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: popIn 0.6s ease;
}

.checkmark-draw {
  font-size: 40px;
  color: #fff;
  font-weight: 700;
}

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); }
}

.card-confirmacion h2 {
  font-size: 28px;
  color: #1a2332;
  margin: 0 0 8px 0;
}

.card-confirmacion p {
  color: #6b7a8f;
  font-size: 16px;
  margin: 0 0 28px 0;
}

.resumen-confirmacion {
  text-align: left;
  background: #f8fafc;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 28px;
}

.resumen-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e8ecf0;
}

.resumen-item:last-child {
  border-bottom: none;
}

.resumen-icon {
  font-size: 20px;
  margin-right: 14px;
  width: 32px;
  text-align: center;
}

.resumen-texto {
  flex: 1;
  color: #4a5a6e;
  font-size: 14px;
}

.resumen-valor {
  font-weight: 600;
  color: #1a2332;
  font-size: 14px;
  background: #eef2ff;
  padding: 2px 12px;
  border-radius: 12px;
}

.confirmation-actions {
  display: flex;
  justify-content: center;
}

.btn-large {
  padding: 14px 40px;
  font-size: 16px;
}

/* ==========================================
   TOAST NOTIFICATIONS
   ========================================== */
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

.toast.success .toast-icon { color: #22c55e; }
.toast.error .toast-icon { color: #ef4444; }
.toast.warning .toast-icon { color: #f59e0b; }
.toast.info .toast-icon { color: #2563eb; }

.toast-message {
  font-size: 14px;
  color: #1a2332;
  flex: 1;
  line-height: 1.4;
  white-space: pre-wrap;
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

/* ==========================================
   RESPONSIVE
   ========================================== */
@media (max-width: 768px) {
  .header {
    padding: 12px 16px;
  }
  
  .header h1 {
    font-size: 16px;
  }
  
  .logo {
    font-size: 22px;
  }
  
  .btn-salir {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .card-pregunta {
    margin: 16px;
    padding: 20px;
  }
  
  .card-socio {
    margin: 16px;
    padding: 20px;
  }
  
  .card-confirmacion {
    margin: 20px 16px;
    padding: 32px 20px;
  }
  
  .pregunta-texto {
    font-size: 18px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .pregunta-actions {
    flex-direction: column;
  }
  
  .pregunta-actions button {
    width: 100%;
    justify-content: center;
  }
  
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
  
  .resumen-confirmacion {
    padding: 12px 16px;
  }
}

@media (max-width: 480px) {
  .header-left {
    gap: 10px;
  }
  
  .subtitle {
    font-size: 11px;
  }
  
  .badges {
    flex-wrap: wrap;
  }
  
  .badge {
    font-size: 10px;
    padding: 2px 8px;
  }
  
  .opcion-item {
    padding: 12px 14px;
    font-size: 14px;
  }
  
  .opcion-texto {
    font-size: 13px;
  }
  
  .btn-primary,
  .btn-outline {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>