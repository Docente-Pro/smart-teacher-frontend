import { instance } from "./instance";

/**
 * Servicio para gestionar temas del currículo por ciclo
 */

export interface ITemaPorCiclo {
  id: number;
  tema: string;
  areaId: number;
  gradoId: number;
  cicloId: number;
  orden: number;
  descripcion: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  area?: {
    id: number;
    nombre: string;
    color: string;
    imagen: string;
  };
  grado?: {
    id: number;
    nombre: string;
  };
  ciclo?: {
    id: number;
    nombre: string;
    gradosAsociados: string;
  };
}

interface GetTemasParams {
  areaId?: number;
  gradoId?: number;
  cicloId?: number;
}

/**
 * Obtener todos los temas con filtros opcionales
 */
export function getTemasPorCiclo(params?: GetTemasParams) {
  const queryParams = new URLSearchParams();
  
  if (params?.areaId) queryParams.append('areaId', params.areaId.toString());
  if (params?.gradoId) queryParams.append('gradoId', params.gradoId.toString());
  if (params?.cicloId) queryParams.append('cicloId', params.cicloId.toString());
  
  const queryString = queryParams.toString();
  const url = queryString ? `/problemas-por-ciclo?${queryString}` : '/problemas-por-ciclo';
  
  return instance.get<{ message: string; data: ITemaPorCiclo[] }>(url);
}

/**
 * Obtener un tema específico por ID
 */
export function getTemaById(id: number) {
  return instance.get<{ message: string; data: ITemaPorCiclo }>(`/problemas-por-ciclo/${id}`);
}

/**
 * Crear un nuevo tema
 */
export interface CreateTemaData {
  tema: string;
  areaId: number;
  gradoId: number;
  cicloId: number;
  orden: number;
  descripcion?: string;
}

export function createTema(data: CreateTemaData) {
  return instance.post<{ message: string; data: ITemaPorCiclo }>('/problemas-por-ciclo', data);
}

/**
 * Actualizar un tema existente
 */
export interface UpdateTemaData {
  tema?: string;
  orden?: number;
  descripcion?: string;
  activo?: boolean;
}

export function updateTema(id: number, data: UpdateTemaData) {
  return instance.put<{ message: string; data: ITemaPorCiclo }>(`/problemas-por-ciclo/${id}`, data);
}

/**
 * Desactivar un tema (soft delete)
 */
export function deleteTema(id: number) {
  return instance.delete<{ message: string; data: ITemaPorCiclo }>(`/problemas-por-ciclo/${id}`);
}
