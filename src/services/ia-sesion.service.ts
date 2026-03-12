import { instance } from "./instance";
import type { ISesionAprendizaje } from "@/interfaces/ISesionAprendizaje";

// ============================================
// INTERFACES — Respuestas de IA
// ============================================

/**
 * Devuelve el objeto temaCurricular para enviar en los bodies de los endpoints IA.
 * Usar en todos los pasos del flujo free (criterios, propósito, enfoques, secuencia, recursos).
 */
export function getTemaCurricularPayload(sesion: ISesionAprendizaje | null): Record<string, unknown> | undefined {
  if (!sesion) return undefined;
  const obj = (sesion as { temaCurricularObjeto?: Record<string, unknown> }).temaCurricularObjeto;
  if (obj && typeof obj === "object" && Object.keys(obj).length > 0) return obj;
  return {
    temaId: sesion.temaId,
    tema: sesion.temaCurricular,
  };
}

export interface IAResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

// ============================================
// SERVICIO IA — Sesión de Aprendizaje
// POST /api/ia/*  (protegido)
// ============================================

/**
 * Generar secuencia didáctica
 */
export async function generarSecuenciaDidactica(data: Record<string, any>): Promise<IAResponse> {
  const response = await instance.post("/ia/generar-secuencia-didactica", data);
  return response.data;
}

/**
 * Generar criterios de evaluación
 */
export async function generarCriteriosEvaluacion(data: Record<string, any>): Promise<IAResponse> {
  const response = await instance.post("/ia/generar-criterios-evaluacion", data);
  return response.data;
}

/**
 * Generar propósito de sesión
 */
export async function generarPropositoSesion(data: Record<string, any>): Promise<IAResponse> {
  const response = await instance.post("/ia/generar-proposito-sesion", data);
  return response.data;
}

/**
 * Generar recursos y materiales
 */
export async function generarRecursosMateriales(data: Record<string, any>): Promise<IAResponse> {
  const response = await instance.post("/ia/generar-recursos-materiales", data);
  return response.data;
}

/**
 * Sugerir enfoques transversales
 */
export async function sugerirEnfoquesTransversales(data: Record<string, any>): Promise<IAResponse> {
  const response = await instance.post("/ia/sugerir-enfoques-transversales", data);
  return response.data;
}

/**
 * Generar título de sesión
 */
export async function generarTituloSesion(data: Record<string, any>): Promise<IAResponse> {
  const response = await instance.post("/ia/generar-titulo-sesion", data);
  return response.data;
}

/**
 * Generar sesión completa (todos los campos)
 */
export async function generarSesionCompleta(data: Record<string, any>): Promise<IAResponse> {
  const response = await instance.post("/ia/generar-sesion-completa", data);
  return response.data;
}

/**
 * Generar sesión con RAG (Retrieval Augmented Generation)
 */
export async function generarSesionRAG(data: Record<string, any>): Promise<IAResponse> {
  const response = await instance.post("/ia/generar-sesion-rag", data);
  return response.data;
}

/**
 * Mejorar texto con IA
 */
export async function mejorarTexto(data: { texto: string; contexto?: string }): Promise<IAResponse<string>> {
  const response = await instance.post("/ia/mejorar-texto", data);
  return response.data;
}

/**
 * Sugerir competencia para un tema
 */
export async function sugerirCompetencia(data: {
  areaId: number;
  temaId?: number | null;
  temaTexto?: string;
}): Promise<IAResponse> {
  const response = await instance.post("/ia/sugerir-competencia", data);
  return response.data;
}

// ============================================
// SERVICIO IA — Generación de imágenes para sesión (fase 2)
// POST /api/ia/generar-imagenes-sesion
// ============================================

export interface IGenerarImagenesSesionRequest {
  sesion: Record<string, any>;
  area?: string;
  grado?: string;
  tema?: string;
  [key: string]: unknown;
}

export interface IImagenGenerada {
  url: string;
  descripcion: string;
  posicion: "antes" | "junto" | "despues";
}

export interface IImagenesSesionResponse {
  success: boolean;
  data: {
    /** El backend puede devolver la sesión completa con imágenes embebidas en los procesos,
     *  o bien un formato indexado { index, imagen }. Se acepta any para soportar ambos. */
    inicio?: { procesos: Array<any> };
    desarrollo?: { procesos: Array<any> };
    cierre?: { procesos: Array<any> };
    [key: string]: unknown;
  };
  metadata?: {
    total_generadas?: number;
    ilustrativas_generadas?: number;
    contenido_generadas?: number;
    total_solicitadas?: number;
    modelo?: string;
    tiempo_generacion_s?: number;
    costo_estimado_usd?: number;
    [key: string]: unknown;
  };
  message?: string;
}

/**
 * Genera imágenes AI para una sesión ya creada (fase 2).
 * Se llama DESPUÉS de generar el texto de la sesión.
 * Timeout extendido a 5 minutos para generación de imágenes.
 *
 * POST /api/ia/generar-imagenes-sesion
 */
export async function generarImagenesSesion(
  data: IGenerarImagenesSesionRequest,
): Promise<IImagenesSesionResponse> {
  const response = await instance.post("/ia/generar-imagenes-sesion", data, {
    timeout: 300_000, // 5 min
  });
  return response.data;
}
