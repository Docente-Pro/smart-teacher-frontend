/**
 * Servicio para Fichas de Aplicación.
 *
 * Endpoints (bajo /api/fichas):
 *  1. POST /api/fichas/sesiones/:sesionId/generar  → generar ficha
 *  2. POST /api/fichas/:fichaId/confirm-upload     → confirmar subida S3
 *  3. GET  /api/fichas/sesion/:sesionId             → obtener fichas de una sesión
 *  4. GET  /api/fichas/:fichaId                     → obtener ficha por ID
 */

import { instance } from "./instance";
import type {
  IFichaAplicacionRequest,
  IFichaAplicacionResponse,
  IFichaConfirmRequest,
  IFichaAlmacenada,
} from "@/interfaces/IFichaAplicacion";

// ─── 1. Generar ficha ───────────────────────────────────────────────────────

/**
 * Solicita la generación de una ficha de aplicación para una sesión.
 * Node llama a Python (Gemini), guarda el JSON en BD y devuelve presigned URL.
 */
export async function generarFichaAplicacion(
  sesionId: string,
  options: IFichaAplicacionRequest = {},
): Promise<IFichaAplicacionResponse> {
  const { data } = await instance.post<IFichaAplicacionResponse>(
    `/fichas/sesiones/${sesionId}/generar`,
    options,
  );
  return data;
}

// ─── 2. Subir PDF a S3 (PUT directo con presigned URL) ──────────────────────

/**
 * Sube el blob PDF renderizado a S3 usando la presigned URL.
 */
export async function subirFichaPDFaS3(
  presignedUrl: string,
  pdfBlob: Blob,
): Promise<void> {
  await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/pdf" },
    body: pdfBlob,
  });
}

// ─── 3. Confirmar upload ────────────────────────────────────────────────────

/**
 * Confirma que el PDF fue subido a S3 y Node registra la URL en BD.
 */
export async function confirmarUploadFicha(
  fichaId: string,
  body: IFichaConfirmRequest,
): Promise<{ success: boolean; pdfUrl: string }> {
  const { data } = await instance.post(
    `/fichas/${fichaId}/confirm-upload`,
    body,
  );
  return data;
}

// ─── 4. Obtener fichas por sesión ───────────────────────────────────────────

/**
 * Obtiene todas las fichas asociadas a una sesión.
 */
export async function obtenerFichasPorSesion(
  sesionId: string,
): Promise<IFichaAlmacenada[]> {
  const { data } = await instance.get<IFichaAlmacenada[]>(
    `/fichas/sesion/${sesionId}`,
  );
  return data;
}

// ─── 5. Obtener ficha por ID ────────────────────────────────────────────────

/**
 * Obtiene una ficha existente por su ID (JSON + URL del PDF si ya fue subido).
 */
export async function obtenerFicha(
  fichaId: string,
): Promise<IFichaAlmacenada> {
  const { data } = await instance.get<IFichaAlmacenada>(
    `/fichas/${fichaId}`,
  );
  return data;
}
