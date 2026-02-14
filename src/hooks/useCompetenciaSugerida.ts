import { useState, useEffect } from "react";
import { sugerirCompetencia, ICompetenciaSugerida } from "@/services/competencias.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";

interface UseCompetenciaSugeridaProps {
  areaId: number | null;
  temaId: number | null;
  temaTexto?: string | null;
  enabled?: boolean;
}

interface UseCompetenciaSugeridaReturn {
  sugerencia: ICompetenciaSugerida | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearSugerencia: () => void;
}

/**
 * Hook personalizado para obtener sugerencia de competencia por IA
 * 
 * @param areaId - ID del área curricular
 * @param temaId - ID del tema seleccionado
 * @param enabled - Si es false, no se ejecuta la consulta automáticamente
 * @returns Estado de la sugerencia, loading, error y funciones auxiliares
 * 
 * @example
 * ```tsx
 * const { sugerencia, loading, clearSugerencia } = useCompetenciaSugerida({
 *   areaId: 7,
 *   temaId: 15,
 *   enabled: true
 * });
 * 
 * if (sugerencia) {
 *   console.log(sugerencia.competencia.nombre);
 * }
 * ```
 */
export function useCompetenciaSugerida({
  areaId,
  temaId,
  temaTexto,
  enabled = true,
}: UseCompetenciaSugeridaProps): UseCompetenciaSugeridaReturn {
  const [sugerencia, setSugerencia] = useState<ICompetenciaSugerida | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSugerencia = async () => {
    // Validaciones
    if (!areaId || (!temaId && !temaTexto)) {
      setSugerencia(null);
      return;
    }

    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await sugerirCompetencia(areaId, temaId, temaTexto || undefined);

      if (response.data && response.data.data) {
        setSugerencia(response.data.data);
      } else {
        throw new Error("No se pudo obtener sugerencia");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Error al sugerir competencia";
      setError(errorMessage);
      setSugerencia(null);
      
      // Solo mostrar toast si el error no es 404 (sin competencias disponibles)
      if (err.response?.status !== 404) {
        handleToaster(errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar automáticamente cuando cambien los parámetros
  useEffect(() => {
    fetchSugerencia();
  }, [areaId, temaId, temaTexto, enabled]);

  const clearSugerencia = () => {
    setSugerencia(null);
    setError(null);
  };

  return {
    sugerencia,
    loading,
    error,
    refetch: fetchSugerencia,
    clearSugerencia,
  };
}
