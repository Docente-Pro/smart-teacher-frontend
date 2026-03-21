import { instance } from "./instance";
import { ISesionAprendizaje } from "@/interfaces/ISesionAprendizaje";
import { ISesionToCreate } from "@/interfaces/IUsuario";
import { ISesion } from "@/interfaces/ISesion";
import type { ICalendarioSesionesResponse } from "@/interfaces/ICalendarioSesiones";
import type { RecursosSesionResponse } from "@/interfaces/IRecursoSesion";

// ============================================
// INTERFACES
// ============================================

interface CrearSesionResponse {
  id: string;
  titulo: string;
  usuarioId: string;
  nivelId: number;
  gradoId: number;
  problematicaId: number;
  duracion: number;
  createdAt: string;
  updatedAt: string;
}

interface SolicitarUploadRequest {
  sesionId: string;
  usuarioId: string;
}

interface SolicitarUploadResponse {
  success: boolean;
  data: {
    uploadUrl: string;
    key: string;
    expiresIn: number;
    method: string;
    contentType: string;
  };
}

interface ConfirmarUploadRequest {
  sesionId: string;
  usuarioId: string;
  key: string;
  contenido: Partial<ISesionAprendizaje>;
  unidadId?: string;
  areaId?: number;
}

interface ConfirmarUploadResponse {
  success: boolean;
  data: {
    id: string;
    titulo: string;
    pdfUrl: string;
    pdfGeneradoAt: string;
    contenido: Partial<ISesionAprendizaje>;
    nivel?: Record<string, any>;
    grado?: Record<string, any>;
    problematica?: Record<string, any>;
  };
}

interface UrlDescargaResponse {
  success: boolean;
  data: {
    downloadUrl: string;
    expiresIn: number;
  };
}

interface SesionPDF {
  id: string;
  titulo: string;
  pdfUrl: string;
  pdfGeneradoAt: string;
  contenido: Partial<ISesionAprendizaje>;
  nivel?: Record<string, any>;
  grado?: Record<string, any>;
  problematica?: Record<string, any>;
}

interface ListarSesionesResponse {
  success: boolean;
  data: {
    sesiones: SesionPDF[];
    total: number;
    page: number;
    totalPages: number;
  };
}

// ============================================
// PASO 0 — Crear sesión en la BD
// ============================================

/**
 * Crea la sesión en la base de datos. Debe hacerse ANTES de pedir la URL de subida.
 * POST /api/sesion
 * Retorna el id de la sesión creada.
 */
export async function crearSesion(data: ISesionToCreate): Promise<CrearSesionResponse> {
  const response = await instance.post<CrearSesionResponse>("/sesion", data);
  return response.data;
}

// ============================================
// PASO 1 — Pedir URL de subida
// ============================================

/**
 * Solicita una URL pre-firmada (presigned PUT) para subir un PDF a S3.
 * La sesión DEBE existir en la BD primero (ver crearSesion).
 * POST /api/sesion/upload-url
 */
export async function solicitarUploadPDF(data: SolicitarUploadRequest): Promise<SolicitarUploadResponse> {
  const response = await instance.post<SolicitarUploadResponse>("/sesion/upload-url", data);
  return response.data;
}

// ============================================
// PASO 2 — Subir PDF directo a S3
// ============================================

/**
 * Sube un archivo PDF directamente a S3 usando la URL pre-firmada.
 * PUT directo a S3 (no pasa por backend).
 * La URL presignada ya contiene todas las credenciales y firma necesarias.
 */
export async function subirPDFaS3(uploadUrl: string, pdfFile: Blob): Promise<void> {

  // Validar que la URL presignada tenga credenciales válidas
  const credMatch = uploadUrl.match(/X-Amz-Credential=([^&/]+)/);
  if (!credMatch || !credMatch[1] || credMatch[1].startsWith('%2F') || credMatch[1].startsWith('/')) {
    console.error("⚠️ La URL presignada no tiene AWS Access Key válido. Credential:", credMatch?.[1]);
    console.error("⚠️ Verificar que el backend tenga AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY configurados.");
  }

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/pdf",
    },
    body: pdfFile,
    mode: "cors",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("❌ Error S3:", response.status, errorText);
    throw new Error(`Error al subir archivo a S3: ${response.status} ${response.statusText}`);
  }

}

// ============================================
// PASO 3 — Confirmar subida y guardar JSON
// ============================================

/**
 * Confirma que el PDF fue subido y guarda el JSON completo de la sesión en BD.
 * POST /api/sesion/confirmar-upload
 */
export async function confirmarUploadPDF(data: ConfirmarUploadRequest): Promise<ConfirmarUploadResponse> {
  const response = await instance.post<ConfirmarUploadResponse>("/sesion/confirmar-upload", data);
  return response.data;
}

// ============================================
// EXTRA — Descargar PDF después
// ============================================

/**
 * Obtiene una URL temporal pre-firmada para descargar un PDF.
 * GET /api/sesion/:id/download-url
 */
export async function obtenerUrlDescarga(sesionId: string): Promise<UrlDescargaResponse> {
  const response = await instance.get<UrlDescargaResponse>(`/sesion/${sesionId}/download-url`);
  return response.data;
}

// ============================================
// EXTRA — Eliminar PDF
// ============================================

/**
 * Elimina una sesión y su PDF de S3.
 * DELETE /api/sesion/:id/pdf
 */
export async function eliminarSesionPDF(sesionId: string): Promise<{ success: boolean; message: string }> {
  const response = await instance.delete(`/sesion/${sesionId}/pdf`);
  return response.data;
}

// ============================================
// Listado y consulta de sesiones
// ============================================

/**
 * Obtiene todas las sesiones del usuario autenticado.
 * GET /api/sesion/usuario/:usuarioId
 */
export async function obtenerSesionesPorUsuario(usuarioId: string): Promise<ISesion[]> {
  const response = await instance.get(`/sesion/usuario/${usuarioId}`);
  // El backend puede devolver { data: [...] } o [...] directamente
  return response.data?.data ?? response.data;
}

/**
 * Obtiene una sesión por su ID.
 * GET /api/sesion/:id
 */
export async function obtenerSesionPorId(sesionId: string): Promise<ISesion> {
  const response = await instance.get(`/sesion/${sesionId}`);
  return response.data?.data ?? response.data;
}

/**
 * Lista las sesiones PDF del usuario autenticado (paginado, con filtro por área)
 * GET /api/sesiones/mis-pdfs
 */
export async function listarMisSesiones(
  page: number = 1,
  limit: number = 10,
  area?: string
): Promise<ListarSesionesResponse> {
  const params: Record<string, any> = { page, limit };
  if (area) params.area = area;

  const response = await instance.get<ListarSesionesResponse>("/sesiones/mis-pdfs", { params });
  return response.data;
}

// ============================================
// Calendario de sesiones (PREMIUM / Unidad)
// GET /api/unidades/:unidadId/sesiones/calendario?areaId=X
// ============================================

/**
 * Obtiene el calendario de sesiones de un área dentro de una unidad.
 * Cada semana contiene N slots con estado: realizada | atrasada | pendiente | bloqueada.
 *
 * @param unidadId - ID de la unidad
 * @param areaId   - (opcional) ID del área; si se omite, el backend usa la primera área del miembro
 */
export async function obtenerCalendarioSesiones(
  unidadId: string,
  areaId?: number,
): Promise<ICalendarioSesionesResponse> {
  const params: Record<string, any> = {};
  if (areaId != null) params.areaId = areaId;

  const { data } = await instance.get<ICalendarioSesionesResponse>(
    `/unidades/${unidadId}/sesiones/calendario`,
    { params },
  );
  return data;
}

// ============================================
// Generar sesión dentro de una unidad (PREMIUM)
// POST /api/unidades/:unidadId/sesion/generar
// ============================================

export interface IGenerarSesionUnidadRequest {
  areaId?: number;
  semana?: number;
  dia?: string;
  turno?: string;
  tituloActividad?: string;
  [key: string]: unknown;
}

export interface IGenerarSesionUnidadResponse {
  success: boolean;
  message?: string;
  sesion?: {
    id: string;
    titulo: string;
    resumen?: string | null;
    pdfUrl?: string | null;
    [key: string]: unknown;
  };
  data?: Record<string, unknown>;
}

/**
 * Genera una sesión de aprendizaje dentro de una unidad.
 * El backend construye el contexto completo (5 bloques) y llama a la IA.
 *
 * POST /api/unidades/:unidadId/sesion/generar
 */
export async function generarSesionUnidad(
  unidadId: string,
  body: IGenerarSesionUnidadRequest,
): Promise<IGenerarSesionUnidadResponse> {
  const { data } = await instance.post<IGenerarSesionUnidadResponse>(
    `/unidades/${unidadId}/sesion/generar`,
    body,
  );
  return data;
}

// ============================================
// Editar contenido de sesión
// PATCH /api/sesion/:id/contenido
// ============================================

export interface IEditarContenidoSesionRequest {
  titulo?: string;
  contenido?: Record<string, any>;
  unidadId?: string;
  areaId?: number;
}

export interface IEditarContenidoSesionResponse {
  success: boolean;
  message: string;
  data: Record<string, any>;
}

/**
 * Edita parcialmente el contenido de una sesión (merge por clave raíz).
 * PATCH /api/sesion/:id/contenido
 */
export async function editarContenidoSesion(
  sesionId: string,
  body: IEditarContenidoSesionRequest,
): Promise<IEditarContenidoSesionResponse> {
  const { data } = await instance.patch<IEditarContenidoSesionResponse>(
    `/sesion/${sesionId}/contenido`,
    body,
  );
  return data;
}

// ============================================
// Recursos sugeridos para una sesión
// POST /api/sesion/recursos
// ============================================

/**
 * Obtiene recursos sugeridos (videos YouTube, cuadernos MINEDU, páginas web)
 * para una sesión. El backend enriquece el contexto (nivel, grado, área, etc.)
 * a partir del ID y llama al servicio de IA.
 */
export async function obtenerRecursosSesion(
  sesionId: string,
): Promise<RecursosSesionResponse> {
  const { data } = await instance.post<RecursosSesionResponse>(
    "/sesion/recursos",
    { sesionId },
  );
  return data;
}
