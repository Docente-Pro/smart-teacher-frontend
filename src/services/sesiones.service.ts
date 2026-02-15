import { instance } from "./instance";
import { ISesionAprendizaje } from "@/interfaces/ISesionAprendizaje";
import { ISesionToCreate } from "@/interfaces/IUsuario";

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
  console.log("📤 PUT a S3:", uploadUrl.substring(0, 120) + "...");
  console.log("📦 Tamaño del PDF:", pdfFile.size, "bytes");

  // Validar que la URL presignada tenga credenciales válidas
  const credMatch = uploadUrl.match(/X-Amz-Credential=([^&/]+)/);
  if (!credMatch || !credMatch[1] || credMatch[1].startsWith('%2F') || credMatch[1].startsWith('/')) {
    console.error("⚠️ La URL presignada no tiene AWS Access Key válido. Credential:", credMatch?.[1]);
    console.error("⚠️ Verificar que el backend tenga AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY configurados.");
  }

  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: pdfFile,
    mode: "cors",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("❌ Error S3:", response.status, errorText);
    throw new Error(`Error al subir archivo a S3: ${response.status} ${response.statusText}`);
  }

  console.log("✅ PDF subido a S3 exitosamente");
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
// Listado (mantener para /mis-sesiones)
// ============================================

/**
 * Lista las sesiones PDF del usuario autenticado
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
