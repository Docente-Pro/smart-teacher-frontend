import { instance } from "./instance";
import type {
  EscanearHorarioResponse,
  EscanearHorarioBase64Request,
  EscanearHorarioUrlRequest,
} from "@/interfaces/IHorario";

// ============================================
// Horario Escolar — Escaneo con IA
// ============================================

/**
 * POST /api/horario/escanear
 * Escanea horario desde imagen codificada en base64.
 */
export async function escanearHorarioBase64(
  body: EscanearHorarioBase64Request
): Promise<EscanearHorarioResponse> {
  const { data } = await instance.post<{ success: boolean; data: EscanearHorarioResponse }>(
    "/horario/escanear",
    body
  );
  return data.data ?? data;
}

/**
 * POST /api/horario/escanear-archivo
 * Escanea horario desde file upload (multipart/form-data).
 */
export async function escanearHorarioArchivo(
  archivo: File
): Promise<EscanearHorarioResponse> {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const { data } = await instance.post<{ success: boolean; data: EscanearHorarioResponse }>(
    "/horario/escanear-archivo",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60_000, // 60s — el escaneo con IA puede tardar
    }
  );
  return data.data ?? data;
}

/**
 * POST /api/horario/escanear-url
 * Escanea horario desde una URL pública de imagen.
 */
export async function escanearHorarioUrl(
  body: EscanearHorarioUrlRequest
): Promise<EscanearHorarioResponse> {
  const { data } = await instance.post<{ success: boolean; data: EscanearHorarioResponse }>(
    "/horario/escanear-url",
    body
  );
  return data.data ?? data;
}
