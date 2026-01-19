import { instance } from "./instance";

interface SolicitarUploadRequest {
  area: string;
  titulo: string;
  grado: string;
  nivel: string;
}

interface SolicitarUploadResponse {
  success: boolean;
  data: {
    uploadUrl: string;
    fileKey: string;
    sesionId: string;
    expiresIn: number;
  };
}

interface ConfirmarUploadResponse {
  success: boolean;
  data: {
    id: string;
    url: string;
    nombreArchivo: string;
    area: string;
    titulo: string;
    fechaCreacion: string;
  };
  message: string;
}

interface SesionPDF {
  id: string;
  area: string;
  titulo: string;
  grado: string;
  nivel: string;
  nombreArchivo: string;
  s3Url: string;
  fechaCreacion: string;
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

interface UrlDescargaResponse {
  success: boolean;
  data: {
    downloadUrl: string;
    expiresIn: number;
  };
}

/**
 * Solicita una URL pre-firmada para subir un PDF a S3
 */
export async function solicitarUploadPDF(data: SolicitarUploadRequest): Promise<SolicitarUploadResponse> {
  const response = await instance.post<SolicitarUploadResponse>("/sesiones/solicitar-upload", data);
  return response.data;
}

/**
 * Sube un archivo PDF directamente a S3 usando la URL pre-firmada
 */
export async function subirPDFaS3(uploadUrl: string, pdfFile: Blob): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: pdfFile,
    headers: {
      "Content-Type": "application/pdf",
    },
  });

  if (!response.ok) {
    throw new Error(`Error al subir archivo a S3: ${response.statusText}`);
  }
}

/**
 * Confirma que el archivo fue subido exitosamente
 */
export async function confirmarUploadPDF(sesionId: string): Promise<ConfirmarUploadResponse> {
  const response = await instance.post<ConfirmarUploadResponse>(
    `/sesiones/${sesionId}/confirmar-upload`,
    { success: true }
  );
  return response.data;
}

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

/**
 * Obtiene una URL temporal para descargar un PDF
 */
export async function obtenerUrlDescarga(sesionId: string): Promise<UrlDescargaResponse> {
  const response = await instance.get<UrlDescargaResponse>(`/sesiones/${sesionId}/descargar`);
  return response.data;
}

/**
 * Elimina una sesión PDF
 */
export async function eliminarSesion(sesionId: string): Promise<{ success: boolean; message: string }> {
  const response = await instance.delete(`/sesiones/${sesionId}`);
  return response.data;
}
