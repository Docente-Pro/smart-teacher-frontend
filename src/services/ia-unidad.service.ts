import { instance } from "./instance";
import type {
  PasoUnidad,
  IProgresoUnidadResponse,
  IPasoUnidadResponse,
  ISituacionSignificativaResponse,
  IEvidenciasResponse,
  IPropositosResponse,
  IAreasComplementariasResponse,
  IEnfoquesResponse,
  ISecuenciaResponse,
  IMaterialesResponse,
  IReflexionesResponse,
} from "@/interfaces/IUnidadIA";

// ============================================
// IA — Unidad de Aprendizaje (flujo wizard 8 pasos)
// Todos los endpoints: /api/ia-unidad/:unidadId/...
// El backend construye el contexto desde la BD — no se envía body.
// ============================================

const BASE = "/ia-unidad";

// ─── Progreso ───

/**
 * GET /api/ia-unidad/:unidadId/progreso
 * Obtiene pasos completados, siguiente paso y contenido acumulado.
 */
export async function obtenerProgresoUnidad(unidadId: string): Promise<IProgresoUnidadResponse> {
  const { data } = await instance.get<IProgresoUnidadResponse>(`${BASE}/${unidadId}/progreso`);
  return data;
}

// ─── Pasos individuales (wizard) ───

/** Paso 1 — Situación Significativa */
export async function generarSituacionSignificativa(
  unidadId: string
): Promise<IPasoUnidadResponse<ISituacionSignificativaResponse>> {
  const { data } = await instance.post(`${BASE}/${unidadId}/situacion-significativa`);
  return data;
}

/** Paso 2 — Evidencias de Aprendizaje (requiere paso 1) */
export async function generarEvidencias(
  unidadId: string
): Promise<IPasoUnidadResponse<IEvidenciasResponse>> {
  const { data } = await instance.post(`${BASE}/${unidadId}/evidencias`);
  return data;
}

/** Paso 3 — Propósitos de Aprendizaje (requiere pasos 1, 2) */
export async function generarPropositos(
  unidadId: string
): Promise<IPasoUnidadResponse<IPropositosResponse>> {
  const { data } = await instance.post(`${BASE}/${unidadId}/propositos`);
  return data;
}

/** Paso 4 — Áreas Complementarias (requiere pasos 1, 3) */
export async function generarAreasComplementarias(
  unidadId: string
): Promise<IPasoUnidadResponse<IAreasComplementariasResponse>> {
  const { data } = await instance.post(`${BASE}/${unidadId}/areas-complementarias`);
  return data;
}

/** Paso 5 — Enfoques Transversales (requiere paso 1) */
export async function generarEnfoques(
  unidadId: string
): Promise<IPasoUnidadResponse<IEnfoquesResponse>> {
  const { data } = await instance.post(`${BASE}/${unidadId}/enfoques`);
  return data;
}

/** Paso 6 — Secuencia de Actividades (requiere pasos 1, 2, 3, 5) */
export async function generarSecuencia(
  unidadId: string
): Promise<IPasoUnidadResponse<ISecuenciaResponse>> {
  const { data } = await instance.post(`${BASE}/${unidadId}/secuencia`);
  return data;
}

/** Paso 7 — Materiales y Recursos (requiere pasos 1, 6) */
export async function generarMateriales(
  unidadId: string
): Promise<IPasoUnidadResponse<IMaterialesResponse>> {
  const { data } = await instance.post(`${BASE}/${unidadId}/materiales`);
  return data;
}

/** Paso 8 — Reflexiones sobre el Aprendizaje (sin dependencias) */
export async function generarReflexiones(
  unidadId: string
): Promise<IPasoUnidadResponse<IReflexionesResponse>> {
  const { data } = await instance.post(`${BASE}/${unidadId}/reflexiones`);
  return data;
}

// ─── Ejecutar paso genérico por nombre ───

/**
 * Ejecutar un paso individual del wizard por nombre.
 * POST /api/ia-unidad/:unidadId/:paso
 */
export async function ejecutarPasoUnidad(
  unidadId: string,
  paso: PasoUnidad
): Promise<IPasoUnidadResponse> {
  const { data } = await instance.post(`${BASE}/${unidadId}/${paso}`);
  return data;
}

// ─── Sugerir título de unidad (pre-creación) ───

export interface SugerirTituloPayload {
  nivel: string;
  grado: string;
  problematica: {
    nombre: string;
    descripcion: string;
  };
  areas: string[];
  numeroUnidad: number;
}

/**
 * POST /api/unidad/sugerir-titulo
 * Genera 3 títulos sugeridos a partir del contexto de la unidad.
 * No requiere unidadId porque se llama antes de crear la unidad.
 */
export async function generarTituloUnidad(
  payload: SugerirTituloPayload
): Promise<{ success: boolean; sugerencias: string[] }> {
  const { data } = await instance.post("/unidad/sugerir-titulo", payload);
  return data;
}

// ─── Generación completa (los 8 pasos secuenciales) ───

/**
 * POST /api/ia-unidad/:unidadId/generar-completa
 * Ejecuta los 8 pasos de forma secuencial en el backend.
 */
export async function generarUnidadCompleta(unidadId: string): Promise<IPasoUnidadResponse> {
  const { data } = await instance.post(`${BASE}/${unidadId}/generar-completa`);
  return data;
}

// ─── Regenerar un paso puntual ───

/**
 * POST /api/ia-unidad/:unidadId/regenerar/:paso
 * Regenera un paso específico manteniendo los demás.
 */
export async function regenerarPasoUnidad(
  unidadId: string,
  paso: PasoUnidad
): Promise<IPasoUnidadResponse> {
  const { data } = await instance.post(`${BASE}/${unidadId}/regenerar/${paso}`);
  return data;
}

// ─── Mapa de funciones por paso (útil para el stepper / wizard) ───

export const PASOS_GENERADORES = {
  "situacion-significativa": generarSituacionSignificativa,
  evidencias: generarEvidencias,
  propositos: generarPropositos,
  "areas-complementarias": generarAreasComplementarias,
  enfoques: generarEnfoques,
  secuencia: generarSecuencia,
  materiales: generarMateriales,
  reflexiones: generarReflexiones,
} as const;

export const ORDEN_PASOS: PasoUnidad[] = [
  "situacion-significativa",
  "evidencias",
  "propositos",
  "areas-complementarias",
  "enfoques",
  "secuencia",
  "materiales",
  "reflexiones",
];
