import { instance } from "./instance";
import type {
  IExtraerAlumnosResponse,
  IGuardarAlumnosRequest,
  IGuardarAlumnosResponse,
} from "@/interfaces/IAula";

// ============================================
// SERVICIO — Aula / Alumnos
// ============================================

/**
 * Extrae la lista de alumnos desde una imagen (OCR con Gemini).
 * POST /api/aula/extraer-desde-imagen
 *
 * @param imagen - Archivo de imagen (JPG, PNG, WEBP, PDF — máx 10 MB)
 */
export async function extraerAlumnosDesdeImagen(
  imagen: File,
): Promise<IExtraerAlumnosResponse> {
  const formData = new FormData();
  formData.append("imagen", imagen);

  const response = await instance.post("/aula/extraer-desde-imagen", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60_000, // 60 s — OCR puede tardar
  });
  return response.data;
}

/**
 * Agrega alumnos a un aula (sin borrar los existentes).
 * POST /api/aula/:aulaId/alumnos
 */
export async function agregarAlumnos(
  aulaId: string,
  body: IGuardarAlumnosRequest,
): Promise<IGuardarAlumnosResponse> {
  const response = await instance.post(`/aula/${aulaId}/alumnos`, body);
  return response.data;
}

/**
 * Reemplaza toda la lista de alumnos de un aula.
 * PUT /api/aula/:aulaId/alumnos
 */
export async function reemplazarAlumnos(
  aulaId: string,
  body: IGuardarAlumnosRequest,
): Promise<IGuardarAlumnosResponse> {
  const response = await instance.put(`/aula/${aulaId}/alumnos`, body);
  return response.data;
}
