/**
 * buildInstrumentoFromSesion.ts
 *
 * Utilidad compartida para construir un IInstrumentoEvaluacion
 * a partir de los datos de sesión (FREE o PREMIUM).
 *
 * Soporta:
 *  - "Lista de cotejo"      → columnas ["Sí", "No"]
 *  - "Escala valorativa"    → columnas ["Siempre", "A veces", "Nunca"]
 *  - "Rúbrica"              → requiere API (devuelve null para build local)
 *  - Fallback               → Lista de cotejo
 */

import type {
  IInstrumentoEvaluacion,
  IListaCotejo,
  IEscalaValoracion,
} from "@/interfaces/IInstrumentoEvaluacion";

export interface InstrumentoBuildParams {
  area: string;
  grado: string;
  competencia: string;
  evidencia: string;
  criterios: string[];
  /** Nombre del instrumento tal como viene del backend */
  instrumento: string;
}

/**
 * Construye un IInstrumentoEvaluacion localmente (lista de cotejo o escala).
 * Para rúbricas devuelve `null` (requiere llamada API).
 */
export function buildInstrumentoLocal(
  params: InstrumentoBuildParams,
): IInstrumentoEvaluacion | null {
  const tipo = (params.instrumento || "").toLowerCase().trim();

  const base = {
    area: params.area,
    grado: params.grado,
    competencia: params.competencia,
    evidencia: params.evidencia,
  };

  // Lista de cotejo
  if (tipo.includes("lista") || tipo.includes("cotejo")) {
    return {
      ...base,
      tipo: "lista_cotejo",
      criterios: params.criterios,
      columnas: ["Sí", "No"],
    } satisfies IListaCotejo;
  }

  // Escala valorativa
  if (tipo.includes("escala") || tipo.includes("valorati")) {
    return {
      ...base,
      tipo: "escala_valoracion",
      criterios: params.criterios,
      columnas: ["Siempre", "A veces", "Nunca"],
    } satisfies IEscalaValoracion;
  }

  // Rúbrica — necesita API, no se puede armar localmente
  if (tipo.includes("rúbrica") || tipo.includes("rubrica")) {
    return null;
  }

  // Fallback: lista de cotejo
  if (params.criterios.length > 0) {
    return {
      ...base,
      tipo: "lista_cotejo",
      criterios: params.criterios,
      columnas: ["Sí", "No"],
    } satisfies IListaCotejo;
  }

  return null;
}
