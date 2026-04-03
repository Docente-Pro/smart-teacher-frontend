import { instance } from "./instance";
import type {
  PasoUnidad,
  IProgresoUnidadResponse,
  IPasoUnidadResponse,
  ISituacionSignificativaResponse,
  IEvidenciasResponse,
  IPropositosResponse,
  IPropositosPorGradoItem,
  IAreasComplementariasResponse,
  IEnfoquesResponse,
  ISecuenciaResponse,
  IFormatoSecundariaResponse,
  IMaterialesResponse,
  IMaterialesPorGradoItem,
  IReflexionesResponse,
} from "@/interfaces/IUnidadIA";
import type { HorarioEscolar } from "@/interfaces/IHorario";

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

/** Opcional: si viene, el backend guarda primero en BD y luego genera (evita race con auto-save). */
export type ContenidoEditadoBody = Record<string, unknown>;

/** Paso 2 — Evidencias de Aprendizaje (requiere paso 1) */
export async function generarEvidencias(
  unidadId: string,
  contenidoEditado?: ContenidoEditadoBody
): Promise<IPasoUnidadResponse<IEvidenciasResponse>> {
  const body = contenidoEditado && Object.keys(contenidoEditado).length > 0 ? { contenidoEditado } : undefined;
  const { data } = await instance.post(`${BASE}/${unidadId}/evidencias`, body);
  return data;
}

/** Paso 3 — Propósitos de Aprendizaje (requiere pasos 1, 2) */
export async function generarPropositos(
  unidadId: string,
  contenidoEditado?: ContenidoEditadoBody
): Promise<IPasoUnidadResponse<IPropositosResponse>> {
  const body = contenidoEditado && Object.keys(contenidoEditado).length > 0 ? { contenidoEditado } : undefined;
  const { data } = await instance.post(`${BASE}/${unidadId}/propositos`, body);
  return data;
}

export interface IGenerarPropositosMultigradoBody {
  gradoIds: number[];
  competenciasDocenteSecundaria?: Array<{
    area: string;
    nombre: string;
    campoTematico?: string;
  }>;
  maxCompetenciasPorAreaSecundaria?: number;
  /** Total de sesiones de la unidad. El backend calcula actividadesPorCompetencia si no se envía explícitamente. */
  totalSesionesUnidad?: number;
  contenidoEditado?: ContenidoEditadoBody;
}

export interface IPropositosMultigradoResponse {
  success: boolean;
  paso: number;
  message: string;
  grados?: Array<{
    gradoId: number;
    grado: string;
    totalAreas?: number;
    totalCompetencias?: number;
  }>;
  data?: IPropositosPorGradoItem[];
  unidad?: Record<string, unknown>;
}

/** Paso 3 (Secundaria) — Propósitos por grado */
export async function generarPropositosMultigrado(
  unidadId: string,
  body: IGenerarPropositosMultigradoBody
): Promise<IPropositosMultigradoResponse> {
  const { data } = await instance.post<IPropositosMultigradoResponse>(
    `${BASE}/${unidadId}/propositos-multigrado`,
    body
  );
  return data;
}

/** Paso 4 — Áreas Complementarias (requiere pasos 1, 3) */
export async function generarAreasComplementarias(
  unidadId: string,
  contenidoEditado?: ContenidoEditadoBody
): Promise<IPasoUnidadResponse<IAreasComplementariasResponse>> {
  const body = contenidoEditado && Object.keys(contenidoEditado).length > 0 ? { contenidoEditado } : undefined;
  const { data } = await instance.post(`${BASE}/${unidadId}/areas-complementarias`, body);
  return data;
}

/** Paso 5 — Enfoques Transversales (requiere paso 1) */
export async function generarEnfoques(
  unidadId: string,
  contenidoEditado?: ContenidoEditadoBody
): Promise<IPasoUnidadResponse<IEnfoquesResponse>> {
  const body = contenidoEditado && Object.keys(contenidoEditado).length > 0 ? { contenidoEditado } : undefined;
  const { data } = await instance.post(`${BASE}/${unidadId}/enfoques`, body);
  return data;
}

/** Mapea HorarioEscolar (dias[].horas[]) al formato completo para el backend */
function horarioToSecuenciaBody(horario: HorarioEscolar): { horario: HorarioEscolar } {
  return { horario };
}

/** Paso 6 — Secuencia de Actividades (requiere pasos 1, 2, 3, 5)
 *  Si se proporciona `horario`, se envía en el body para que
 *  el backend respete esa distribución de áreas por día/turno.
 */
export async function generarSecuencia(
  unidadId: string,
  horario?: HorarioEscolar | null,
  contenidoEditado?: ContenidoEditadoBody
): Promise<IPasoUnidadResponse<ISecuenciaResponse>> {
  const body: Record<string, unknown> = {};
  if (horario?.dias?.length) Object.assign(body, horarioToSecuenciaBody(horario));
  if (contenidoEditado && Object.keys(contenidoEditado).length > 0) body.contenidoEditado = contenidoEditado;
  const { data } = await instance.post(`${BASE}/${unidadId}/secuencia`, Object.keys(body).length ? body : undefined);
  return data;
}

/**
 * Paso 5 (Secundaria Multigrado) — Formato Secundaria
 * POST /api/ia-unidad/:unidadId/formato-secundaria
 * Body vacío — el backend construye el payload desde contenido (propositosPorGrado, enfoques, etc.)
 */
export async function generarFormatoSecundaria(
  unidadId: string
): Promise<IFormatoSecundariaResponse> {
  const { data } = await instance.post<IFormatoSecundariaResponse>(
    `${BASE}/${unidadId}/formato-secundaria`,
    {}
  );
  return data;
}

/** Paso 7 (Secundaria Multigrado) — Materiales por grado */
export interface IMaterialesMultigradoResponse {
  success: boolean;
  paso: number;
  message: string;
  data: IMaterialesPorGradoItem[];
  unidad: Record<string, unknown>;
}

export async function generarMaterialesMultigrado(
  unidadId: string
): Promise<IMaterialesMultigradoResponse> {
  const { data } = await instance.post<IMaterialesMultigradoResponse>(
    `${BASE}/${unidadId}/materiales-multigrado`
  );
  return data;
}

/** Paso 7 — Materiales y Recursos (requiere pasos 1, 6) */
export async function generarMateriales(
  unidadId: string,
  contenidoEditado?: ContenidoEditadoBody
): Promise<IPasoUnidadResponse<IMaterialesResponse>> {
  const body = contenidoEditado && Object.keys(contenidoEditado).length > 0 ? { contenidoEditado } : undefined;
  const { data } = await instance.post(`${BASE}/${unidadId}/materiales`, body);
  return data;
}

/** Paso 8 — Reflexiones sobre el Aprendizaje (sin dependencias) */
export async function generarReflexiones(
  unidadId: string,
  contenidoEditado?: ContenidoEditadoBody
): Promise<IPasoUnidadResponse<IReflexionesResponse>> {
  const body = contenidoEditado && Object.keys(contenidoEditado).length > 0 ? { contenidoEditado } : undefined;
  const { data } = await instance.post(`${BASE}/${unidadId}/reflexiones`, body);
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

// ─── Imagen de Situación Significativa ───

export interface ImagenSituacionPayload {
  situacionSignificativa: string;
  problematica: string;
  grado: string;
  nivel: string;
  distrito?: string;
  /** Si viene, el backend guarda imagenUrl en contenido.situacionSignificativa y sincroniza suscriptores */
  unidadId?: string;
}

export interface ImagenSituacionResponse {
  success: boolean;
  url: string;
  descripcion: string;
  metadata?: {
    modelo: string;
    tiempo_generacion_s: number;
    costo_estimado_usd: number;
  };
}

/**
 * POST /api/unidad/imagen-situacion
 * Genera una imagen ilustrativa para la situación significativa.
 */
export async function generarImagenSituacion(
  payload: ImagenSituacionPayload
): Promise<ImagenSituacionResponse> {
  const { data } = await instance.post("/unidad/imagen-situacion", payload, {
    timeout: 120_000, // 2 min — generación de imagen puede tardar
  });
  return data;
}

/**
 * POST /api/ia-unidad/:unidadId/generar-completa
 * Ejecuta los 8 pasos de forma secuencial en el backend.
 * Acepta horario y contenidoEditado opcionales (contrato §7).
 */
export async function generarUnidadCompleta(
  unidadId: string,
  horario?: HorarioEscolar | null,
  contenidoEditado?: ContenidoEditadoBody
): Promise<IPasoUnidadResponse> {
  const body: Record<string, unknown> = {};
  if (horario?.dias?.length) Object.assign(body, horarioToSecuenciaBody(horario));
  if (contenidoEditado && Object.keys(contenidoEditado).length > 0) body.contenidoEditado = contenidoEditado;
  const { data } = await instance.post(`${BASE}/${unidadId}/generar-completa`, Object.keys(body).length ? body : undefined);
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

/** Regenerar secuencia enviando horario + contenidoEditado (contrato §8.2: mismo body que generar). */
export async function regenerarSecuencia(
  unidadId: string,
  horario?: HorarioEscolar | null,
  contenidoEditado?: ContenidoEditadoBody
): Promise<IPasoUnidadResponse<ISecuenciaResponse>> {
  const body: Record<string, unknown> = {};
  if (horario?.dias?.length) Object.assign(body, horarioToSecuenciaBody(horario));
  if (contenidoEditado && Object.keys(contenidoEditado).length > 0) body.contenidoEditado = contenidoEditado;
  const { data } = await instance.post(`${BASE}/${unidadId}/regenerar/secuencia`, Object.keys(body).length ? body : undefined);
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
