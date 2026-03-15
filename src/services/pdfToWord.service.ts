import { instance } from "@/services/instance";
import { getSocket } from "@/services/socket.service";
import type { WordListoPayload, WordErrorPayload } from "@/services/socket.service";

/**
 * Non-blocking PDF→Word conversion via backend + SayPDF + S3.
 *
 * Flow:
 *  1. POST PDF blob + sesionId → backend returns { jobId } immediately
 *  2. Backend: SayPDF converts → uploads .docx to S3 → saves wordUrl in DB
 *  3. Backend emits "word:listo" via Socket.IO with { jobId, wordUrl }
 *  4. Frontend receives event → resolves with wordUrl
 */

const ENDPOINT = "/pdf-to-word";
const TIMEOUT_MS = 150_000;

interface StartConversionResponse {
  success: boolean;
  jobId: string;
}

/**
 * Sends PDF to backend for conversion + S3 upload.
 * Resolves with the wordUrl once the .docx is saved in S3.
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
