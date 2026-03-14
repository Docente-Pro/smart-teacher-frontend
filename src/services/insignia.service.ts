import { instance } from "./instance";

// ============================================
// Insignia del colegio — Subida con URL prefirmada S3
// ============================================

export interface IInsigniaUploadUrlResponse {
  success: boolean;
  data: {
    uploadUrl: string;
    key: string;
    expiresIn: number;
    method: string;
    contentType: string;
  };
  message: string;
}

export interface IInsigniaConfirmarResponse {
  success: boolean;
  data: {
    insigniaUrl: string;
  };
  message: string;
}

/**
 * Paso 1: Solicita URL prefirmada para subir la insignia a S3.
 */
export async function solicitarInsigniaUploadUrl(
  contentType: string = "image/jpeg",
): Promise<IInsigniaUploadUrlResponse> {
  const { data } = await instance.post<IInsigniaUploadUrlResponse>(
    "/usuario/insignia/upload-url",
    { contentType },
  );
  return data;
}

/**
 * Paso 2: Sube la imagen directamente a S3 usando la URL prefirmada.
 */
export async function subirInsigniaAS3(
  uploadUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
    mode: "cors",
  });

  if (!response.ok) {
    throw new Error(`Error al subir insignia a S3: ${response.status} ${response.statusText}`);
  }
}

/**
 * Paso 3: Confirma la subida y guarda la URL en el usuario.
 */
export async function confirmarInsignia(
  key: string,
): Promise<IInsigniaConfirmarResponse> {
  const { data } = await instance.post<IInsigniaConfirmarResponse>(
    "/usuario/insignia/confirmar",
    { key },
  );
  return data;
}
