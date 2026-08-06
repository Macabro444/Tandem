import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para manejar errores
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login');

        // Si el 401 viene del propio intento de login (credenciales incorrectas),
        // no se limpia sesión ni se redirige: se deja que el componente
        // muestre el error y el usuario corrija sus datos sin recargar la página.
        if (error.response?.status === 401 && !isLoginRequest) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig) {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  // ========== AUTH ENDPOINTS ==========
  async login(username: string, cont_usuario: string) {
    return this.post('/auth/login', { username, cont_usuario });
  }

  async getProfile() {
    return this.get('/auth/profile');
  }

  async verifyToken() {
    return this.get('/auth/verify');
  }

  // ========== EMPRESAS ENDPOINTS ==========
  async getEmpresas() {
    return this.get('/empresas');
  }

  async getEmpresa(id: number) {
    return this.get(`/empresas/${id}`);
  }

  async createEmpresa(data: any) {
    return this.post('/empresas', data);
  }

  async deleteEmpresa(id: number) {
    return this.delete(`/empresas/${id}`);
  }

  async updateEmpresa(id: number, data: any) {
    return this.put(`/empresas/${id}`, data);
  }

  // ========== CONTRATOS ENDPOINTS ==========
  async getContratos() {
    return this.get('/contratos');
  }

  async getContratosByEmpresa(idEmpresa: number) {
    return this.get(`/contratos/empresa/${idEmpresa}`);
  }

  async getContrato(id: number) {
    return this.get(`/contratos/${id}`);
  }

  async createContrato(data: any) {
    return this.post('/contratos', data);
  }

  async updateContrato(id: number, data: any) {
    return this.patch(`/contratos/${id}`, data);
  }

  async deleteContrato(id: number) {
    return this.delete(`/contratos/${id}`);
  }

  // ========== USERS ENDPOINTS ==========
  async getUsers() {
    return this.get('/users');
  }

  async getUser(id: number) {
    return this.get(`/users/${id}`);
  }

  // Obtener mi propio perfil (para EMPLEADO)
  async getMe() {
    return this.get('/users/me');
  }

  async getUsersByEmpresa(idEmpresa: number) {
    return this.get(`/users/empresa/${idEmpresa}`);
  }

  async createUser(data: any) {
    return this.post('/users', data);
  }

  async deleteUser(id: number) {
    return this.delete(`/users/${id}`);
  }

  async getLicenciasByEmpresa(idEmpresa: number) {
    return this.get(`/users/licencias/empresa/${idEmpresa}`);
  }

  async updateUser(id: number, data: any) {
    return this.patch(`/users/${id}`, data);
  }

  // =============================================
  // ========== CUESTIONARIOS EMPRESA ==========
  // =============================================

  /**
   * Obtiene todos los reactivos asignados a una empresa
   */
  async getAsignacionesEmpresa(idEmpresa: number): Promise<any[]> {
    return this.get(`/cuestionarios-empresa/${idEmpresa}`);
  }

  /**
   * Asigna un reactivo a una empresa
   */
  async asignarReactivo(idEmpresa: number, idReactivo: number): Promise<any> {
    return this.post(`/cuestionarios-empresa`, {
      id_empresa: idEmpresa,
      id_reactivo: idReactivo
    });
  }

  /**
   * Desasigna un reactivo de una empresa
   */
  async desasignarReactivo(idEmpresa: number, idReactivo: number): Promise<any> {
    return this.delete(`/cuestionarios-empresa/${idEmpresa}/${idReactivo}`);
  }

  /**
   * Asigna todos los reactivos a una empresa
   */
  async asignarTodosReactivos(idEmpresa: number): Promise<any> {
    return this.post(`/cuestionarios-empresa/asignar-todos/${idEmpresa}`);
  }

  /**
   * Desasigna todos los reactivos de una empresa
   */
  async desasignarTodosReactivos(idEmpresa: number): Promise<any> {
    return this.delete(`/cuestionarios-empresa/desasignar-todos/${idEmpresa}`);
  }

  /**
   * Obtiene los reactivos de una empresa filtrados por tipo de estudio
   */
  async getReactivosByEmpresa(idEmpresa: number, tipoEstudio?: string): Promise<any[]> {
    let url = `/cuestionarios-empresa/${idEmpresa}/reactivos`;
    if (tipoEstudio) {
      url += `?tipo_estudio=${tipoEstudio}`;
    }
    return this.get(url);
  }

  // =============================================
// ========== COORDINADOR (FastAPI) ==========
// =============================================

/**
 * Obtiene el estado de evaluaciones de una empresa
 * para el dashboard del coordinador
 */
async getEvaluacionesEmpresa(idEmpresa: number): Promise<any> {
  const response = await axios.get(`${FASTAPI_URL}/api/coordinador/evaluaciones/${idEmpresa}`);
  return response.data;
}

  // =============================================
  // ========== REACTIVOS (FastAPI) ==========
  // =============================================

  /**
   * Obtiene todos los reactivos (desde FastAPI)
   */
  async getReactivosFastAPI(): Promise<any[]> {
    const response = await axios.get(`${FASTAPI_URL}/api/reactivos`);
    return response.data;
  }

  /**
   * Obtiene las dimensiones (desde FastAPI)
   */
  async getDimensionesFastAPI(): Promise<any[]> {
    const response = await axios.get(`${FASTAPI_URL}/api/dimensiones`);
    return response.data;
  }

  /**
   * Crea un reactivo en FastAPI
   */
  async createReactivoFastAPI(data: any): Promise<any> {
    const response = await axios.post(`${FASTAPI_URL}/api/reactivos`, data);
    return response.data;
  }

  /**
   * Actualiza un reactivo en FastAPI
   */
  async updateReactivoFastAPI(id: number, data: any): Promise<any> {
    const response = await axios.put(`${FASTAPI_URL}/api/reactivos/${id}`, data);
    return response.data;
  }

  /**
   * Elimina un reactivo en FastAPI
   */
  async deleteReactivoFastAPI(id: number): Promise<any> {
    const response = await axios.delete(`${FASTAPI_URL}/api/reactivos/${id}`);
    return response.data;
  }

  /**
   * Importa reactivos desde Excel a FastAPI
   */
  async importReactivosExcel(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${FASTAPI_URL}/api/configurar/reactivos-excel`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // =============================================
  // ========== ESCALAS (FastAPI) ==========
  // =============================================

  async getEscalasFastAPI(): Promise<any[]> {
    const response = await axios.get(`${FASTAPI_URL}/api/escalas`);
    return response.data;
  }

  async createEscalaFastAPI(data: any): Promise<any> {
    const response = await axios.post(`${FASTAPI_URL}/api/escalas`, data);
    return response.data;
  }

  async updateEscalaFastAPI(id: number, data: any): Promise<any> {
    const response = await axios.put(`${FASTAPI_URL}/api/escalas/${id}`, data);
    return response.data;
  }

  async deleteEscalaFastAPI(id: number): Promise<any> {
    const response = await axios.delete(`${FASTAPI_URL}/api/escalas/${id}`);
    return response.data;
  }

  // =============================================
  // ========== DIMENSIONES (FastAPI) ==========
  // =============================================

  async createDimensionFastAPI(data: any): Promise<any> {
    const response = await axios.post(`${FASTAPI_URL}/api/dimensiones`, data);
    return response.data;
  }

  async updateDimensionFastAPI(id: number, data: any): Promise<any> {
    const response = await axios.put(`${FASTAPI_URL}/api/dimensiones/${id}`, data);
    return response.data;
  }

  async deleteDimensionFastAPI(id: number): Promise<any> {
    const response = await axios.delete(`${FASTAPI_URL}/api/dimensiones/${id}`);
    return response.data;
  }
}

export default new ApiService();
