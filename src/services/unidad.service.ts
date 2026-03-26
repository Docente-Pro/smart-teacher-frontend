import { instance } from "./instance";
import type {
  IUnidad,
  IUnidadCreateRequest,
  IUnidadUpdateRequest,
  IUnidadUploadUrlRequest,
  IUnidadUploadUrlResponse,
  IUnidadConfirmarUploadRequest,
  IUnidadConfirmarUploadResponse,
  IUnidadDownloadUrlResponse,
  IMiembroUnidad,
  IUnirseUnidadRequest,
  IUnirseUnidadResponse,
  IAreaDisponible,
  ISeleccionarAreasRequest,
  ISolicitarPagoUnidadRequest,
  ISolicitarPagoUnidadResponse,
  ISolicitarPagoSuscriptorRequest,
  ISolicitarPagoSuscriptorResponse,
  IEstadoPagoUnidadResponse,
  IUnidadPreciosResponse,
  IPreSolicitarPagoRequest,
  IPreSolicitarPagoResponse,
  ICalcularDistribucionRequest,
  ICalcularDistribucionResponse,
  IDistribucionSesionesRequest,
} from "@/interfaces/IUnidad";
import type { IUnidadListResponse, IUnidadListItem } from "@/interfaces/IUnidadList";
import type {
  ISesionComplementariaRequest,
  ISesionComplementariaResponse,
} from "@/interfaces/ISesionComplementaria";
import type { IUnidad } from "@/interfaces/IUnidad";

// ============================================
// Precios dinámicos (público)
// ============================================

/** GET /api/unidades/precios — Precios de propietario y suscriptor */
export async function getUnidadPrecios(): Promise<IUnidadPreciosResponse> {
  const { data } = await instance.get<IUnidadPreciosResponse>("/unidades/precios");
  return data;
}

// ============================================
// CRUD — Unidad de Aprendizaje
// /api/unidad  (protegido)
// ============================================

/** GET /api/unidad/ */
export function getAllUnidades() {
  return instance.get<IUnidad[]>("/unidad");
}

/** GET /api/unidad/usuario/:usuarioId */
export function getUnidadesByUsuario(usuarioId: string) {
  return instance.get<IUnidad[]>(`/unidad/usuario/${usuarioId}`);
}

/** GET /api/unidad/usuario/:usuarioId — tipado completo para listado */
export async function listarUnidadesByUsuario(usuarioId: string): Promise<IUnidadListItem[]> {
  const { data } = await instance.get<IUnidadListResponse>(`/unidad/usuario/${usuarioId}`);
  return Array.isArray(data?.data) ? data.data : [];
}

/** GET /api/unidad/:id */
export function getUnidadById(id: string) {
  return instance.get<IUnidad>(`/unidad/${id}`);
}

/**
 * GET /api/unidades/:id?usuarioId=X
 * Detalle de unidad con contenido personalizado para suscriptor.
 * Retorna la unidad con `contenido` ya reemplazado (nombre/institución del suscriptor)
 * y sus sesiones filtradas.
 */
export async function getUnidadDetalleSuscriptor(
  unidadId: string,
  usuarioId: string
): Promise<IUnidadListItem> {
  const { data } = await instance.get<{ data: IUnidadListItem } | IUnidadListItem>(
    `/unidades/${unidadId}`,
    { params: { usuarioId } }
  );
  // El backend puede envolver en { data } o devolver directamente
  return (data as any)?.data ?? data;
}

/** POST /api/unidad/ — genera codigoCompartido si tipo=COMPARTIDA */
export function createUnidad(data: IUnidadCreateRequest) {
  return instance.post<{ message: string; data: IUnidad }>("/unidad", data);
}

/** PUT /api/unidad/:id */
export function updateUnidad(id: string, data: IUnidadUpdateRequest) {
  return instance.put<IUnidad>(`/unidad/${id}`, data);
}

/** DELETE /api/unidad/:id */
export function deleteUnidad(id: string) {
  return instance.delete(`/unidad/${id}`);
}

/** POST /api/unidad/:id/reset — Reinicia contenido IA sin eliminar la unidad ni pagos */
export function resetUnidadContenido(id: string) {
  return instance.post(`/unidad/${id}/reset`);
}

// ============================================
// Almacenamiento PDF (S3)
// ============================================

/** POST /api/unidad/upload-url — URL presignada para subir PDF */
export async function solicitarUploadUrlUnidad(
  data: IUnidadUploadUrlRequest
): Promise<IUnidadUploadUrlResponse> {
  const { data: res } = await instance.post<IUnidadUploadUrlResponse>("/unidad/upload-url", data);
  return res;
}

/** POST /api/unidad/confirmar-upload — Confirmar upload del PDF */
export async function confirmarUploadUnidad(
  data: IUnidadConfirmarUploadRequest
): Promise<IUnidadConfirmarUploadResponse> {
  const { data: res } = await instance.post<IUnidadConfirmarUploadResponse>(
    "/unidad/confirmar-upload",
    data
  );
  return res;
}

/** GET /api/unidad/:id/download-url — URL presignada para descargar PDF */
export async function obtenerDownloadUrlUnidad(
  unidadId: string,
  usuarioId?: string
): Promise<IUnidadDownloadUrlResponse> {
  const { data } = await instance.get<IUnidadDownloadUrlResponse>(
    `/unidad/${unidadId}/download-url`,
    usuarioId ? { params: { usuarioId } } : undefined
  );
  return data;
}

/** DELETE /api/unidad/:id/pdf — Eliminar PDF */
export async function eliminarPdfUnidad(unidadId: string) {
  const { data } = await instance.delete(`/unidad/${unidadId}/pdf`);
  return data;
}

// ============================================
// Miembros (unidades compartidas)
// ============================================

/** POST /api/unidad/unirse — Unirse a unidad con código compartido */
export async function unirseAUnidad(
  body: IUnirseUnidadRequest
): Promise<IUnirseUnidadResponse> {
  const { data } = await instance.post<IUnirseUnidadResponse>("/unidad/unirse", body);
  return data;
}

/** GET /api/unidad/:unidadId/miembros — Listar miembros */
export async function getMiembrosUnidad(unidadId: string): Promise<IMiembroUnidad[]> {
  const { data } = await instance.get<IMiembroUnidad[]>(`/unidad/${unidadId}/miembros`);
  return data;
}

/** DELETE /api/unidad/:unidadId/miembros/:miembroId — Eliminar miembro (solo propietario) */
export async function eliminarMiembroUnidad(unidadId: string, miembroId: string) {
  const { data } = await instance.delete(`/unidad/${unidadId}/miembros/${miembroId}`);
  return data;
}

// ============================================
// Áreas por Miembro (exclusividad)
// ============================================

/** GET /api/unidad/:unidadId/areas-disponibles */
export async function getAreasDisponibles(unidadId: string): Promise<IAreaDisponible[]> {
  const { data } = await instance.get<IAreaDisponible[]>(`/unidad/${unidadId}/areas-disponibles`);
  return data;
}

/** GET /api/unidad/:unidadId/miembros/:miembroId/areas — Áreas asignadas a un miembro */
export async function getAreasMiembro(unidadId: string, miembroId: string) {
  const { data } = await instance.get(`/unidad/${unidadId}/miembros/${miembroId}/areas`);
  return data;
}

/** PUT /api/unidad/:unidadId/areas — Seleccionar/cambiar áreas del miembro autenticado */
export async function seleccionarAreas(unidadId: string, body: ISeleccionarAreasRequest) {
  const { data } = await instance.put(`/unidad/${unidadId}/areas`, body);
  return data;
}

// ============================================
// Pagos de unidad (WhatsApp + WebSocket)
// ============================================

/**
 * POST /api/unidades/pago/propietario/pre-solicitar
 * Usuario free elige tipo de unidad → crea PagoUnidad con unidadId = null.
 * Retorna pagoId + whatsappLink para completar el pago.
 */
export async function preSolicitarPagoUnidad(
  body: IPreSolicitarPagoRequest
): Promise<IPreSolicitarPagoResponse> {
  const { data } = await instance.post<IPreSolicitarPagoResponse>(
    "/unidades/pago/propietario/pre-solicitar",
    body
  );
  return data;
}

/** POST /api/unidad/pago/solicitar — Solicitar pago con unidad existente → retorna link WhatsApp (Docente) */
export async function solicitarPagoUnidad(
  body: ISolicitarPagoUnidadRequest
): Promise<ISolicitarPagoUnidadResponse> {
  const { data } = await instance.post<ISolicitarPagoUnidadResponse>(
    "/unidad/pago/solicitar",
    body
  );
  return data;
}

/** GET /api/unidad/:id/estado-pago — Consultar estado del pago (polling fallback) */
export async function getEstadoPagoUnidad(
  unidadId: string
): Promise<IEstadoPagoUnidadResponse> {
  const { data } = await instance.get<IEstadoPagoUnidadResponse>(
    `/unidad/${unidadId}/estado-pago`
  );
  return data;
}

// ============================================
// Pago Suscriptor (WhatsApp + WebSocket)
// ============================================

/**
 * POST /api/unidades/pago/suscriptor/solicitar
 * Suscriptor solicita pago para activar su membresía.
 * Devuelve whatsappUrl pre-armado y pagoId.
 */
export async function solicitarPagoSuscriptor(
  body: ISolicitarPagoSuscriptorRequest
): Promise<ISolicitarPagoSuscriptorResponse> {
  const { data } = await instance.post<ISolicitarPagoSuscriptorResponse>(
    "/unidades/pago/suscriptor/solicitar",
    body
  );
  return data;
}

// ============================================
// Distribución de áreas (COMPARTIDA)
// ============================================

/**
 * POST /api/unidad/:unidadId/calcular-distribucion
 * Envía la secuencia generada + cantidad de suscriptores al backend.
 * El backend (vía Python) calcula la distribución óptima de áreas.
 */
export async function calcularDistribucion(
  unidadId: string,
  body: ICalcularDistribucionRequest
): Promise<ICalcularDistribucionResponse> {
  const { data } = await instance.post<ICalcularDistribucionResponse>(
    `/unidad/${unidadId}/calcular-distribucion`,
    body
  );
  return data;
}

/**
 * PUT /api/unidad/:unidadId/distribucion-sesiones
 * Ajusta la cantidad de sesiones por área para el miembro autenticado.
 */
export async function actualizarDistribucionSesiones(
  unidadId: string,
  body: IDistribucionSesionesRequest
) {
  const { data } = await instance.put(
    `/unidad/${unidadId}/distribucion-sesiones`,
    body
  );
  return data;
}

// ============================================
// Sincronización de miembro (unidades compartidas)
// ============================================

export interface ISincronizarMiembroResponse {
  sesionesClonadas: number;
  tieneContenidoPersonalizado: boolean;
}

/**
 * POST /api/unidades/:unidadId/sincronizar-miembro
 * Re-ejecuta clonación de contenido personalizado (nombre/institución).
 * Clona todas las sesiones existentes que coincidan con las áreas del suscriptor.
 * Llamar cuando el suscriptor abre la unidad compartida por primera vez
 * o si no tiene sesiones clonadas.
 */
export async function sincronizarMiembroUnidad(
  unidadId: string
): Promise<ISincronizarMiembroResponse> {
  const { data } = await instance.post<ISincronizarMiembroResponse>(
    `/unidades/${unidadId}/sincronizar-miembro`
  );
  return data;
}

// ============================================
// Sesión Complementaria (Tutoría / Plan Lector)
// POST /api/unidad/generar-sesion-complementaria
// ============================================

/**
 * Genera una sesión complementaria (Tutoría o Plan Lector).
 * Diferencias con la sesión curricular:
 *  - No requiere areaId (es transversal)
 *  - Duración fija de 45 minutos
 *  - Solo acepta tipo: "Tutoría" o "Plan Lector"
 *  - Busca el resumen previo más reciente del mismo tipo para contexto
 *  - Clona contenido a miembros en unidades compartidas
 *
 * POST /api/unidad/generar-sesion-complementaria
 */
export async function generarSesionComplementaria(
  body: ISesionComplementariaRequest
): Promise<ISesionComplementariaResponse> {
  const { data } = await instance.post<ISesionComplementariaResponse>(
    "/unidad/generar-sesion-complementaria",
    body
  );
  return data;
}

// ============================================
// Corregir estándares (determinista, sin IA)
// POST /api/unidades/corregir-estandares
// POST /api/unidades/corregir-estandares/masivo (admin)
// ============================================

export interface ICorregirEstandaresUpload {
  presignedUrl: string;
  s3Key: string;
  expiresIn: number;
  method: string;
  contentType: string;
}

export interface ICorregirEstandaresMiembroUpload {
  miembroId: string;
  usuarioId: string;
  presignedUrl: string;
  s3Key: string;
}

export interface ICorregirEstandaresResponse {
  success: boolean;
  totalCorregidos: number;
  guardadoEnBD: boolean;
  correcciones: {
    area: string;
    competencia: string;
    estandarAnterior: string;
    estandarCorregido: string;
  }[];
  unidad: Record<string, any>;
  upload: ICorregirEstandaresUpload | null;
  miembrosUpload: ICorregirEstandaresMiembroUpload[];
}

export interface ICorregirEstandaresMasivoResponse {
  success: boolean;
  total: number;
  corregidas: number;
  sinCambios: number;
  errores: number;
  detalles: {
    unidadId: string;
    totalCorregidos: number;
    error?: string;
  }[];
}

/**
 * Corrige estándares truncados de UNA unidad.
 * POST /api/unidades/corregir-estandares
 */
export async function corregirEstandares(
  unidadId: string,
): Promise<ICorregirEstandaresResponse> {
  const { data } = await instance.post<ICorregirEstandaresResponse>(
    "/unidades/corregir-estandares",
    { unidadId },
  );
  return data;
}

/**
 * Corrige estándares de TODAS las unidades (solo Admin).
 * POST /api/unidades/corregir-estandares/masivo
 */
export async function corregirEstandaresMasivo(): Promise<ICorregirEstandaresMasivoResponse> {
  const { data } = await instance.post<ICorregirEstandaresMasivoResponse>(
    "/unidades/corregir-estandares/masivo",
  );
  return data;
}

// ============================================
// Arreglar horario de unidad (determinista)
// POST /api/unidad/arreglar-horario
// ============================================

export interface IArreglarHorarioRequest {
  secuencia: Record<string, any>;
  grado: string;
  turno?: string; // default "mañana"
}

export interface IArreglarHorarioCambio {
  semana: number;
  dia: string;
  hora: number;
  antes: string;
  despues: string;
}

export interface IArreglarHorarioResponse {
  success: boolean;
  secuencia: Record<string, any>;
  cambios: IArreglarHorarioCambio[];
  error?: string;
}

/**
 * Arregla el horario de la secuencia de una unidad.
 * POST /api/unidad/arreglar-horario
 */
export async function arreglarHorario(
  body: IArreglarHorarioRequest,
): Promise<IArreglarHorarioResponse> {
  const { data } = await instance.post<IArreglarHorarioResponse>(
    "/unidad/arreglar-horario",
    body,
  );
  return data;
}

// ============================================
// Editar contenido de unidad
// PATCH /api/unidades/:id/contenido
// ============================================

export interface IEditarContenidoUnidadRequest {
  titulo?: string;
  contenido?: Record<string, any>;
}

export interface IEditarContenidoUnidadResponse {
  success: boolean;
  message: string;
  data: Record<string, any>;
}

/**
 * Edita parcialmente el contenido de una unidad (merge por clave raíz).
 * PATCH /api/unidades/:id/contenido
 */
export async function editarContenidoUnidad(
  unidadId: string,
  body: IEditarContenidoUnidadRequest,
): Promise<IEditarContenidoUnidadResponse> {
  const { data } = await instance.patch<IEditarContenidoUnidadResponse>(
    `/unidades/${unidadId}/contenido`,
    body,
  );
  return data;
}

// ============================================
// PATCH /api/unidades/:id/propositos/actividades
// ============================================

export interface IPatchPropositosActividadesRequest {
  area: string;
  competencia: string;
  actividades: string[];
  /** Actividades nuevas (manual) para las que el backend genera criterios por IA en esta petición */
  nuevasActividades?: string[];
}

export interface IPatchPropositosActividadesResponse {
  success: boolean;
  message?: string;
  data?: IUnidad;
  criteriosGeneradosParaActividades?: number;
}

/** Normaliza nombre de área (quita prefijo "Área de") para coincidir con el backend */
export function normalizarNombreArea(nombre: string): string {
  return nombre.replace(/^área de\s+/i, "").trim();
}

/**
 * Actualiza solo el array de actividades de una competencia dentro de propósitos.
 * El backend busca area y competencia (con normalización) y reemplaza solo actividades.
 * PATCH /api/unidades/:id/propositos/actividades
 */
const PATCH_PROPOSITOS_IA_TIMEOUT_MS = 180_000;

export async function patchPropositosActividades(
  unidadId: string,
  body: IPatchPropositosActividadesRequest,
  options?: { timeout?: number }
): Promise<IPatchPropositosActividadesResponse> {
  const hasNuevas = (body.nuevasActividades?.length ?? 0) > 0;
  const timeout =
    options?.timeout ?? (hasNuevas ? PATCH_PROPOSITOS_IA_TIMEOUT_MS : undefined);

  const { data } = await instance.patch<IPatchPropositosActividadesResponse>(
    `/unidades/${unidadId}/propositos/actividades`,
    {
      ...body,
      area: normalizarNombreArea(body.area),
    },
    timeout != null ? { timeout } : undefined
  );
  return data;
}
