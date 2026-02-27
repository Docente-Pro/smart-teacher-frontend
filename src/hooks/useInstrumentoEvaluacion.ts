import { useCallback, useState } from "react";
import type { ISesionPremiumSesion } from "@/interfaces/ISesionPremium";
import type {
  IInstrumentoEvaluacion,
  IListaCotejo,
  IEscalaValoracion,
  IRubrica,
  IGuardarInstrumentoResponse,
} from "@/interfaces/IInstrumentoEvaluacion";
import { generarRubrica, guardarInstrumento } from "@/services/instrumento.service";

// ============================================
// HELPERS — Extraer campos de la sesión
// ============================================

/** Número de filas vacías para la lista de estudiantes (aún sin datos reales) */
const FILAS_VACIAS = 15;

/**
 * Extrae el string seguro de un campo que puede ser un objeto con .nombre o un string.
 */
function safeString(val: unknown): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object" && "nombre" in val)
    return String((val as Record<string, unknown>).nombre ?? "");
  return "";
}

/**
 * Extrae los campos comunes que requieren los 3 instrumentos, desde la sesión premium.
 */
function extractCampos(sesion: ISesionPremiumSesion) {
  const proposito = sesion.propositoAprendizaje?.[0];
  const datos = (sesion.datosGenerales ?? {}) as Record<string, unknown>;

  return {
    area: safeString(sesion.area) || String(datos.area ?? ""),
    grado: safeString(sesion.grado) || String(datos.grado ?? ""),
    competencia: proposito?.competencia ?? "",
    evidencia: proposito?.evidencia ?? "",
    criterios: proposito?.criteriosEvaluacion ?? [],
    instrumento: proposito?.instrumento ?? "",
    tema: String((sesion as Record<string, unknown>).tema ?? datos.tema ?? ""),
  };
}

// ============================================
// BUILDERS — Armar instrumentos locales
// ============================================

function buildListaCotejo(sesion: ISesionPremiumSesion): IListaCotejo {
  const { area, grado, competencia, evidencia, criterios } = extractCampos(sesion);
  return {
    tipo: "lista_cotejo",
    area,
    grado,
    competencia,
    evidencia,
    criterios,
    columnas: ["Sí", "No"],
  };
}

function buildEscalaValoracion(sesion: ISesionPremiumSesion): IEscalaValoracion {
  const { area, grado, competencia, evidencia, criterios } = extractCampos(sesion);
  return {
    tipo: "escala_valoracion",
    area,
    grado,
    competencia,
    evidencia,
    criterios,
    columnas: ["Siempre", "A veces", "Nunca"],
  };
}

// ============================================
// HOOK — useInstrumentoEvaluacion
// ============================================

export interface UseInstrumentoEvaluacionReturn {
  /** Instrumento generado/armado (null si aún no se ha construido) */
  instrumento: IInstrumentoEvaluacion | null;
  /** URL de S3 donde se guardó el instrumento (null hasta que se persista) */
  savedUrl: string | null;
  /** Indica si la rúbrica se está generando vía IA */
  isGenerating: boolean;
  /** Indica si se está guardando en backend */
  isSaving: boolean;
  /** Error de la última operación */
  error: string | null;
  /** Número de filas vacías para la tabla de estudiantes */
  filasVacias: number;
  /**
   * Genera / arma el instrumento según `sesion.propositoAprendizaje[0].instrumento`.
   *  - "Lista de cotejo"        → se arma en cliente
   *  - "Escala valorativa"      → se arma en cliente
   *  - "Rúbrica"                → POST /api/ia/generar-rubrica
   */
  generarInstrumento: (sesion: ISesionPremiumSesion) => Promise<IInstrumentoEvaluacion | null>;
  /**
   * Persiste el instrumento actual con POST /api/ia/guardar-instrumento.
   * Devuelve la respuesta con la URL de S3.
   */
  guardar: (sesionId?: string) => Promise<IGuardarInstrumentoResponse | null>;
  /**
   * Genera y guarda en un solo paso.
   */
  generarYGuardar: (
    sesion: ISesionPremiumSesion,
    sesionId?: string,
  ) => Promise<IGuardarInstrumentoResponse | null>;
}

export function useInstrumentoEvaluacion(): UseInstrumentoEvaluacionReturn {
  const [instrumento, setInstrumento] = useState<IInstrumentoEvaluacion | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Generar / armar ─────────────────────────────────────────────────────

  const generarInstrumento = useCallback(
    async (sesion: ISesionPremiumSesion): Promise<IInstrumentoEvaluacion | null> => {
      setError(null);
      const campos = extractCampos(sesion);
      const tipo = campos.instrumento.toLowerCase().trim();

      try {
        // Lista de cotejo — local
        if (tipo.includes("lista") || tipo.includes("cotejo")) {
          const lc = buildListaCotejo(sesion);
          setInstrumento(lc);
          return lc;
        }

        // Escala valorativa — local
        if (tipo.includes("escala") || tipo.includes("valorati")) {
          const ev = buildEscalaValoracion(sesion);
          setInstrumento(ev);
          return ev;
        }

        // Rúbrica — llamada IA
        if (tipo.includes("rúbrica") || tipo.includes("rubrica")) {
          setIsGenerating(true);
          const res = await generarRubrica({
            criterios: campos.criterios,
            area: campos.area,
            grado: campos.grado,
            competencia: campos.competencia,
            evidencia: campos.evidencia,
            tema: campos.tema || undefined,
          });

          const rubrica: IRubrica = {
            ...res.data,
            tipo: "rubrica",
          };

          setInstrumento(rubrica);
          return rubrica;
        }

        // Tipo no reconocido — fallback a lista de cotejo
        console.warn(
          `[useInstrumentoEvaluacion] Tipo desconocido: "${campos.instrumento}". Usando lista de cotejo como fallback.`,
        );
        const fallback = buildListaCotejo(sesion);
        setInstrumento(fallback);
        return fallback;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Error generando instrumento";
        setError(msg);
        console.error("[useInstrumentoEvaluacion] Error:", err);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  // ─── Guardar ──────────────────────────────────────────────────────────────

  const guardar = useCallback(
    async (sesionId?: string): Promise<IGuardarInstrumentoResponse | null> => {
      if (!instrumento) {
        setError("No hay instrumento para guardar. Genera uno primero.");
        return null;
      }

      setError(null);
      setIsSaving(true);

      try {
        const res = await guardarInstrumento({
          instrumento,
          sesionId,
        });
        setSavedUrl(res.url);
        return res;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Error guardando instrumento";
        setError(msg);
        console.error("[useInstrumentoEvaluacion] Error guardando:", err);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [instrumento],
  );

  // ─── Generar + Guardar ────────────────────────────────────────────────────

  const generarYGuardar = useCallback(
    async (
      sesion: ISesionPremiumSesion,
      sesionId?: string,
    ): Promise<IGuardarInstrumentoResponse | null> => {
      const result = await generarInstrumento(sesion);
      if (!result) return null;

      // Guardar directamente (no depender del estado asíncrono)
      setIsSaving(true);
      setError(null);
      try {
        const res = await guardarInstrumento({
          instrumento: result,
          sesionId,
        });
        setSavedUrl(res.url);
        return res;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Error guardando instrumento";
        setError(msg);
        console.error("[useInstrumentoEvaluacion] Error guardando:", err);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [generarInstrumento],
  );

  return {
    instrumento,
    savedUrl,
    isGenerating,
    isSaving,
    error,
    filasVacias: FILAS_VACIAS,
    generarInstrumento,
    guardar,
    generarYGuardar,
  };
}
