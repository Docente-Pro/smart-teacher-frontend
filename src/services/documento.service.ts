import { instance } from "./instance";

// ============================================
// Documento — /api/documento  (protegido)
// ============================================

export interface IDocumentoUploadResponse {
  success: boolean;
  data: {
    id: string;
    url: string;
    nombre: string;
    tipo: string;
    tamaño: number;
    createdAt: string;
  };
}

/**
 * POST /api/documento/ — Subir documento (multipart/form-data)
 */
export async function subirDocumento(file: File): Promise<IDocumentoUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await instance.post<IDocumentoUploadResponse>("/documento", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * GET /api/documento/test — Test del servicio
 */
export async function testDocumentoService(): Promise<{ success: boolean; message: string }> {
  const { data } = await instance.get("/documento/test");
  return data;
}
