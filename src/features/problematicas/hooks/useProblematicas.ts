import { useState, useCallback } from "react";
import {
  Problematica,
  PaginationInfo,
  ProblematicaQueryParams,
} from "../interfaces/problematica.interface";
import { problematicaApiService } from "../services/problematica-api.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";

/**
 * Hook para manejar lista de problemáticas con filtros, búsqueda y paginación
 * 
 * @example
 * ```tsx
 * const {
 *   problematicas,
 *   loading,
 *   pagination,
 *   loadRecomendadas,
 *   searchProblematicas,
 *   loadMore
 * } = useProblematicas();
 * ```
 */
export function useProblematicas() {
  const [problematicas, setProblematicas] = useState<Problematica[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar problemáticas recomendadas (sin paginación)
   * Ideal para el modal inicial
   */
  const loadRecomendadas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await problematicaApiService.getRecomendadas();
      setProblematicas(response.data);
      setPagination(null); // No hay paginación en recomendadas
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Error al cargar problemáticas";
      setError(errorMsg);
      handleToaster(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar todas las problemáticas con filtros y paginación
   */
  const loadAll = useCallback(async (params?: ProblematicaQueryParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await problematicaApiService.getAll(params);
      setProblematicas(response.data);
      setPagination(response.pagination || null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Error al cargar problemáticas";
      setError(errorMsg);
      handleToaster(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar problemáticas de un usuario específico
   */
  const loadByUsuario = useCallback(async (usuarioId: string, params?: ProblematicaQueryParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await problematicaApiService.getByUsuario(usuarioId, params);
      setProblematicas(response.data);
      setPagination(response.pagination || null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Error al cargar problemáticas del usuario";
      setError(errorMsg);
      handleToaster(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar problemáticas
   */
  const searchProblematicas = useCallback(async (query: string, params?: ProblematicaQueryParams) => {
    if (!query.trim()) {
      setProblematicas([]);
      setPagination(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await problematicaApiService.search({ 
        q: query, 
        ...params 
      });
      setProblematicas(response.data);
      setPagination(response.pagination || null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Error en la búsqueda";
      setError(errorMsg);
      handleToaster(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar más resultados (infinite scroll)
   */
  const loadMore = useCallback(async (params?: ProblematicaQueryParams) => {
    if (!pagination?.hasMore || loading) return;

    setLoading(true);
    setError(null);
    
    try {
      const nextPage = (pagination.page || 0) + 1;
      const response = await problematicaApiService.getAll({
        ...params,
        page: nextPage,
      });
      
      // Agregar nuevos resultados a los existentes
      setProblematicas((prev) => [...prev, ...response.data]);
      setPagination(response.pagination || null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Error al cargar más resultados";
      setError(errorMsg);
      handleToaster(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }, [pagination, loading]);

  /**
   * Resetear estado
   */
  const reset = useCallback(() => {
    setProblematicas([]);
    setPagination(null);
    setError(null);
  }, []);

  return {
    problematicas,
    loading,
    pagination,
    error,
    loadRecomendadas,
    loadAll,
    loadByUsuario,
    searchProblematicas,
    loadMore,
    reset,
  };
}
