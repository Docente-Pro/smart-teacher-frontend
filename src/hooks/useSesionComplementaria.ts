import { useState, useCallback } from "react";
import { generarSesionComplementaria } from "@/services/unidad.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import type {
  TipoSesionComplementaria,
  ISesionComplementariaRequest,
  ISesionComplementariaResponse,
} from "@/interfaces/ISesionComplementaria";

// ─── Fases de generación ─────────────────────────────────────────────────────

export type SesionComplementariaPhase =
  | "idle"
  | "generating"
  | "done"
  | "error";

interface SesionComplementariaState {
  phase: SesionComplementariaPhase;
  isRunning: boolean;
  error: string | null;
  result: ISesionComplementariaResponse | null;
}

const PHASE_LABELS: Record<SesionComplementariaPhase, string> = {
  idle: "",
  generating: "Generando sesión complementaria con IA...",
  done: "¡Sesión complementaria lista!",
  error: "Ocurrió un error",
};

/**
 * Hook para generar una sesión complementaria (Tutoría o Plan Lector).
 *
 * Diferencias clave con la sesión curricular:
 *  - No requiere areaId (es transversal)
 *  - Duración fija de 45 minutos
 *  - Solo acepta tipo: "Tutoría" o "Plan Lector"
 *
 * @returns estado de la generación + función `run()` para iniciar
 */
export function useSesionComplementaria() {
  const [state, setState] = useState<SesionComplementariaState>({
    phase: "idle",
    isRunning: false,
    error: null,
    result: null,
  });

  const phaseLabel = PHASE_LABELS[state.phase];

  const run = useCallback(
    async (params: {
      tipo: TipoSesionComplementaria;
      titulo: string;
      descripcion?: string;
      unidadId?: string;
    }): Promise<ISesionComplementariaResponse | null> => {
      setState({ phase: "generating", isRunning: true, error: null, result: null });

      try {
        const body: ISesionComplementariaRequest = {
          tipo: params.tipo,
          actividadTitulo: params.titulo,
          descripcion: params.descripcion,
          unidadId: params.unidadId,
        };

        const response = await generarSesionComplementaria(body);

        setState({
          phase: "done",
          isRunning: false,
          error: null,
          result: response,
        });

        handleToaster(
          response.message || `¡Sesión de ${params.tipo} generada con éxito!`,
          "success",
        );

        return response;
      } catch (error: any) {
        console.error("Error al generar sesión complementaria:", error);
        const msg =
          error.response?.data?.message ||
          "Error al generar la sesión complementaria con IA";

        setState({
          phase: "error",
          isRunning: false,
          error: msg,
          result: null,
        });

        handleToaster(msg, "error");
        return null;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({ phase: "idle", isRunning: false, error: null, result: null });
  }, []);

  return {
    ...state,
    phaseLabel,
    run,
    reset,
  };
}
