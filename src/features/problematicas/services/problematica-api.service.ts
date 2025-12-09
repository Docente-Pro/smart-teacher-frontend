import { instance } from "@/services/instance";
import {
  ProblematicasResponse,
  ProblematicaQueryParams,
  CreateProblematicaRequest,
  UpdateProblematicaRequest,
  SelectProblematicaRequest,
  SugerenciasParams,
  SugerenciaPersonalizacion,
} from "../interfaces/problematica.interface";

/**
 * Servicio de API para problemáticas
 * Endpoints escalables con filtros y paginación
 */
export const problematicaApiService = {
  /**
   * GET /api/problematica - Lista con filtros y paginación
   */
  getAll: async (params?: ProblematicaQueryParams): Promise<ProblematicasResponse> => {
    const response = await instance.get("/problematica", { params });
    return response.data;
  },

  /**
   * GET /api/problematica/recomendadas - Solo recomendadas (sin paginación)
   * Perfecto para modales donde muestras todas las recomendadas
   */
  getRecomendadas: async (): Promise<ProblematicasResponse> => {
    const response = await instance.get("/problematica/recomendadas");
    return response.data;
  },

  /**
   * GET /api/problematica/usuario/:usuarioId - Las que creó el usuario
   */
  getByUsuario: async (
    usuarioId: string,
    params?: ProblematicaQueryParams
  ): Promise<ProblematicasResponse> => {
    const response = await instance.get(`/problematica/usuario/${usuarioId}`, { params });
    return response.data;
  },

  /**
   * GET /api/problematica/search - Búsqueda avanzada
   */
  search: async (params: ProblematicaQueryParams): Promise<ProblematicasResponse> => {
    const response = await instance.get("/problematica/search", { params });
    return response.data;
  },

  /**
   * GET /api/problematica/:id - Detalle de una problemática
   */
  getById: async (id: number): Promise<{ message: string; data: any }> => {
    const response = await instance.get(`/problematica/${id}`);
    return response.data;
  },

  /**
   * POST /api/problematica - Crear problemática personalizada
   */
  create: async (data: CreateProblematicaRequest): Promise<{ message: string; data: any }> => {
    const response = await instance.post("/problematica", data);
    return response.data;
  },

  /**
   * POST /api/problematica/seleccionar - Seleccionar problemática (modal inicial)
   * Actualiza automáticamente problematicaCompleta = true
   */
  seleccionar: async (data: SelectProblematicaRequest): Promise<{ message: string; data: any }> => {
    const response = await instance.post("/problematica/seleccionar", data);
    return response.data;
  },

  /**
   * PUT /api/problematica/:id - Actualizar problemática personalizada
   */
  update: async (
    id: number,
    data: UpdateProblematicaRequest
  ): Promise<{ message: string; data: any }> => {
    const response = await instance.put(`/problematica/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /api/problematica/:id - Eliminar problemática personalizada
   */
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await instance.delete(`/problematica/${id}`);
    return response.data;
  },

  /**
   * GET /api/problematica/sugerencias/:basadaEnId - Obtener sugerencias de personalización
   * Muestra cómo usuarios similares personalizaron esta problemática recomendada
   * 
   * @param params - Parámetros de filtrado (basadaEnId, limite, usuarioId)
   * @returns Sugerencias ordenadas por popularidad y similitud de perfil
   */
  getSugerencias: async (params: SugerenciasParams): Promise<{ 
    message: string; 
    data: SugerenciaPersonalizacion[] 
  }> => {
    const { basadaEnId, limite = 3, usuarioId } = params;
    const response = await instance.get(`/problematica/sugerencias/${basadaEnId}`, {
      params: { limite, usuarioId }
    });
    return response.data;
  },
};
