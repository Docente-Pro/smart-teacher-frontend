import { instance } from "@/services/instance";
import { getSocket } from "@/services/socket.service";
import type { WordListoPayload, WordErrorPayload } from "@/services/socket.service";

/**
 * Non-blocking PDF→Word conversion via backend + SayPDF + S3.
 *
 * Flow (from-session — preferred):
 *  1. POST { sesionId } → backend fetches PDF from S3 internally, returns { jobId }
 *  2. Backend: SayPDF converts → uploads .docx to S3 → saves wordUrl in DB
 *  3. Backend emits "word:listo" via Socket.IO with { jobId, wordUrl }
 *  4. Frontend receives event → resolves with wordUrl
 *
 * Flow (with file — fallback for SesionSuscriptorResult first-time PDF):
 *  1. POST multipart { file, sesionId } → backend returns { jobId }
 *  2–4. Same as above
 */

const ENDPOINT = "/pdf-to-word";
const ENDPOINT_FROM_SESSION = "/pdf-to-word/from-session";
const ENDPOINT_FROM_UNIDAD = "/pdf-to-word/from-unidad";
const TIMEOUT_MS = 150_000;

interface StartConversionResponse {
  success: boolean;
  jobId: string;
}

/**
 * Sends a PDF blob to the backend for Word conversion.
 * Used by SesionSuscriptorResult when generating Word from a freshly-rendered PDF.
 */
export async function convertPdfToWordViaApi(
  pdfBlob: Blob,
  sesionId: string,
): Promise<string> {
  const form = new FormData();
  form.append("file", pdfBlob, "documento.pdf");
  form.append("sesionId", sesionId);

  const { data } = await instance.post<StartConversionResponse>(ENDPOINT, form, {
    timeout: 30_000,
    headers: { "Content-Type": undefined },
  });

  if (!data.success || !data.jobId) {
    throw new Error("El servidor no pudo iniciar la conversión.");
  }

  return waitForWordReady(data.jobId);
}

/**
 * Obtiene URL prefirmada para descargar el Word de una sesión desde S3.
 */
export async function obtenerDownloadUrlWord(sesionId: string): Promise<string> {
  const { data } = await instance.get<{
    success: boolean;
    data: { downloadUrl: string; expiresIn: number };
  }>(`/sesion/${sesionId}/download-url-word`);
  return data.data.downloadUrl;
}

/**
 * Triggers Word generation from the session's existing S3 PDF.
 * The backend fetches the PDF from S3 directly — no file upload needed.
 * Avoids 413 errors and CORS issues.
 */
export async function generarWordDesdePDFExistente(
  sesionId: string,
): Promise<string> {
  const { data } = await instance.post<StartConversionResponse>(
    ENDPOINT_FROM_SESSION,
    { sesionId },
    { timeout: 30_000 },
  );

  if (!data.success || !data.jobId) {
    throw new Error("El servidor no pudo iniciar la conversión.");
  }

  return waitForWordReady(data.jobId);
}

/**
 * Triggers Word generation from the unidad's existing S3 PDF.
 * Same pattern as generarWordDesdePDFExistente but for units.
 */
export async function generarWordDesdeUnidad(
  unidadId: string,
): Promise<string> {
  const { data } = await instance.post<StartConversionResponse>(
    ENDPOINT_FROM_UNIDAD,
    { unidadId },
    { timeout: 30_000 },
  );

  if (!data.success || !data.jobId) {
    throw new Error("El servidor no pudo iniciar la conversión.");
  }

  return waitForWordReady(data.jobId);
}

/**
 * Obtiene URL prefirmada para descargar el Word de una unidad desde S3.
 */
export async function obtenerDownloadUrlWordUnidad(unidadId: string): Promise<string> {
  const { data } = await instance.get<{
    success: boolean;
    data: { downloadUrl: string; expiresIn: number };
  }>(`/unidad/${unidadId}/download-url-word`);
  return data.data.downloadUrl;
}

function waitForWordReady(jobId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = getSocket();
    let settled = false;

    const cleanup = () => {
      settled = true;
      clearTimeout(timer);
      if (socket) {
        socket.off("word:listo", onListo);
        socket.off("word:error", onError);
      }
    };

    const timer = setTimeout(() => {
      if (!settled) {
        cleanup();
        reject(new Error("La conversión a Word tardó demasiado. Intenta de nuevo."));
      }
    }, TIMEOUT_MS);

    const onListo = (payload: WordListoPayload) => {
      if (payload.jobId === jobId && !settled) {
        cleanup();
        resolve(payload.wordUrl);
      }
    };

    const onError = (payload: WordErrorPayload) => {
      if (payload.jobId === jobId && !settled) {
        cleanup();
        reject(new Error(payload.message || "Error al convertir a Word."));
      }
    };

    if (socket?.connected) {
      socket.on("word:listo", onListo);
      socket.on("word:error", onError);
    } else {
      cleanup();
      reject(new Error("Socket no conectado. Recarga la página e intenta de nuevo."));
    }
  });
}
