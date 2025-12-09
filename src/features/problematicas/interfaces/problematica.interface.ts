// ============================================
// INTERFACES PARA PROBLEMÁTICAS
// ============================================

/**
 * Tipo de problemática
 */
export type TipoProblematica = 'recomendadas' | 'personalizadas' | 'todas';

/**
 * Creador de una problemática personalizada
 */
export interface ProblematicaCreador {
  id: string;
  nombre: string;
  email: string;
}

/**
 * Contadores de uso de una problemática
 */
export interface ProblematicaCount {
  usuarios: number;
  sesiones?: number;
}

/**
 * Problemática base (opcional, de la cual deriva)
 */
export interface ProblematicaBase {
  id: number;
  nombre: string;
  descripcion: string;
}

/**
 * Problemática (respuesta del backend)
 */
export interface Problematica {
  id: number;
  nombre: string;
  descripcion: string;
  esPersonalizada: boolean;
  creadaPorId: string | null;
  basadaEnId: number | null;
  basadaEn?: ProblematicaBase | null;
  creador?: ProblematicaCreador | null;
  createdAt: string;
  _count?: ProblematicaCount;
}

/**
 * Sugerencia de personalización basada en lo que hicieron usuarios similares
 */
export interface SugerenciaPersonalizacion {
  id: number;
  nombre: string;
  descripcion: string;
  basadaEnId: number;
  popularidad: number; // Número de usuarios que usaron esta personalización
  creadoPorUsuariosSimilares: boolean; // Si fue creado por usuarios con perfil similar
  creador?: {
    id: string;
    nombre: string;
    nivelEducativo?: string;
    grado?: string;
  };
  createdAt: string;
}

/**
 * Parámetros para obtener sugerencias de personalización
 */
export interface SugerenciasParams {
  basadaEnId: number; // ID de la problemática recomendada
  limite?: number; // Límite de sugerencias a retornar (default: 3)
  usuarioId?: string; // Para filtrar por perfil similar
}

/**
 * Paginación
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Response con paginación
 */
export interface ProblematicasResponse {
  message: string;
  data: Problematica[];
  pagination?: PaginationInfo;
}

/**
 * Parámetros de búsqueda/filtrado
 */
export interface ProblematicaQueryParams {
  page?: number;
  limit?: number;
  tipo?: TipoProblematica;
  usuarioId?: string;
  search?: string;
  q?: string; // Para búsqueda avanzada
}

/**
 * Request para crear problemática personalizada
 */
export interface CreateProblematicaRequest {
  nombre: string;
  descripcion: string;
  usuarioId: string;
  basadaEnId?: number; // Opcional: ID de la problemática original (si es una edición)
}

/**
 * Request para actualizar problemática
 */
export interface UpdateProblematicaRequest {
  nombre?: string;
  descripcion?: string;
}

/**
 * Request para seleccionar problemática (modal inicial)
 */
export interface SelectProblematicaRequest {
  problematicaId: number;
}
