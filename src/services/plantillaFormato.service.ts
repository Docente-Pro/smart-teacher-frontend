/**
 * Plantilla de formato personal — API client
 * Flujo: upload-url → PUT S3 → confirmar → analizar (algoritmo, IA solo si falta) → preview → aprobar
 */
import { instance } from "./instance";

export const WORD_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const PDF_CONTENT_TYPE = "application/pdf";

export function contentTypeForPlantillaFile(file: File): string {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return PDF_CONTENT_TYPE;
  }
  return WORD_CONTENT_TYPE;
}

/** Una celda del formato descrita en lenguaje humano, para el paso de asignación. */
export interface IOpcionSlot {
  addr: string;
  descripcion: string;
  rotulo?: string;
  vacia: boolean;
  anchoCm: number | null;
}

export interface IPendienteMapeo {
  campo: string;
  motivo: string;
}

/**
 * Mapeo v2: campo de la sesión → dirección de celda del documento.
 * Vive en la base de datos; el Word de la docente nunca lleva marcadores.
 */
export interface IMapeoFormato {
  version: 2;
  campos: Record<string, string>;
  secuencia: {
    modo: "porProceso" | "porMomento";
    filas: { momento: string; etiquetaProceso: string; addr: string }[];
    columnasAuxiliares?: Record<string, string>;
  };
  noMapeados: string[];
  confianza: number;
  notas?: string;
  opciones?: IOpcionSlot[];
  validacion?: { ok: boolean; pendientes: IPendienteMapeo[] };
  asignadoPorDocente?: Record<string, string>;
}

export interface IPlantillaFormato {
  id: string;
  usuarioId: string;
  nombre: string;
  estado: string;
  activa: boolean;
  version: number;
  originalKey?: string | null;
  originalUrl?: string | null;
  docxKey?: string | null;
  docxUrl?: string | null;
  mapeo?: IMapeoFormato | Record<string, unknown> | null;
  confianza?: number | null;
  mensajeError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function esMapeoV2(
  mapeo: IPlantillaFormato["mapeo"],
): mapeo is IMapeoFormato {
  return !!mapeo && typeof mapeo === "object" && (mapeo as any).version === 2;
}

export async function getMiPlantillaActiva() {
  const { data } = await instance.get<{ success: boolean; data: IPlantillaFormato | null }>(
    "/plantilla-formato/mia",
  );
  return data;
}

export async function listMisPlantillas() {
  const { data } = await instance.get<{ success: boolean; data: IPlantillaFormato[] }>(
    "/plantilla-formato",
  );
  return data;
}

export async function solicitarPlantillaUploadUrl(
  contentType: string = WORD_CONTENT_TYPE,
  nombre?: string,
) {
  const { data } = await instance.post<{
    success: boolean;
    data: {
      plantillaId: string;
      uploadUrl: string;
      key: string;
      contentType: string;
    };
  }>("/plantilla-formato/upload-url", { contentType, nombre });
  return data;
}

export async function subirPlantillaAS3(
  uploadUrl: string,
  file: File,
  contentType: string,
) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
    mode: "cors",
  });
  if (!response.ok) {
    throw new Error(`Error al subir plantilla: ${response.status}`);
  }
}

export async function confirmarPlantilla(plantillaId: string, key: string, activar = true) {
  const { data } = await instance.post<{ success: boolean; data: IPlantillaFormato }>(
    "/plantilla-formato/confirmar",
    { plantillaId, key, activar },
  );
  return data;
}

export async function desactivarPlantilla(id: string) {
  const { data } = await instance.post(`/plantilla-formato/${id}/desactivar`);
  return data;
}

export async function activarPlantilla(id: string) {
  const { data } = await instance.post(`/plantilla-formato/${id}/activar`);
  return data;
}

export async function downloadUrlPlantilla(id: string) {
  const { data } = await instance.get<{
    success: boolean;
    data: { downloadUrl: string; key: string };
  }>(`/plantilla-formato/${id}/download-url`);
  return data;
}

/** Lee la estructura del formato y deja que la IA decida dónde va cada parte. */
export async function analizarPlantilla(id: string) {
  const { data } = await instance.post<{
    success: boolean;
    data: IPlantillaFormato;
    requiereAsignacion: boolean;
    pendientes: IPendienteMapeo[];
    message: string;
  }>(`/plantilla-formato/${id}/analizar`);
  return data;
}

/** La docente resuelve a mano lo que la IA dejó pendiente. */
export async function asignarSlotsPlantilla(
  id: string,
  asignaciones: Record<string, string>,
) {
  const { data } = await instance.patch<{
    success: boolean;
    data: IPlantillaFormato;
    requiereAsignacion: boolean;
    pendientes: IPendienteMapeo[];
    message: string;
  }>(`/plantilla-formato/${id}/mapeo`, { asignaciones });
  return data;
}

export async function saveDocxPlantilla(id: string, blob: Blob) {
  const { data: urlRes } = await instance.post<{
    success: boolean;
    data: { uploadUrl: string; key: string; contentType: string };
  }>(`/plantilla-formato/${id}/save-docx-url`);

  const put = await fetch(urlRes.data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": urlRes.data.contentType },
    body: blob,
    mode: "cors",
  });
  if (!put.ok) throw new Error(`Error al subir DOCX editado: ${put.status}`);

  const { data } = await instance.post<{ success: boolean; data: IPlantillaFormato }>(
    `/plantilla-formato/${id}/confirmar-docx`,
    { key: urlRes.data.key },
  );
  return data;
}

export async function previewPlantilla(id: string) {
  const { data } = await instance.post<{
    success: boolean;
    data: {
      previewUrl: string;
      previewKey: string;
      usoEjemplo: boolean;
      celdasEscritas: number;
      celdasOmitidas: unknown[];
      /** Qué se agrega al final porque el formato no lo tiene. */
      anexos?: string[];
      pendientes: IPendienteMapeo[];
    };
    message: string;
  }>(`/plantilla-formato/${id}/preview`);
  return data;
}

/**
 * Rellena el formato propio con la sesión. Los nombres del aula viven en este
 * navegador, así que van en el pedido: sin ellos la lista de cotejo anexada
 * sale con las filas en blanco.
 */
export async function aplicarPlantillaASesion(
  sesionId: string,
  alumnos?: { apellidos?: string; nombres?: string }[],
) {
  const { data } = await instance.post<{
    success: boolean;
    data?: {
      pdfUrl: string;
      wordUrl: string;
      pdfDownloadUrl: string;
      wordDownloadUrl?: string | null;
      plantillaId: string;
      /** Qué se agregó al final porque el formato no lo tiene. */
      anexos?: string[];
    };
    code?: string;
    message?: string;
    error?: string;
  }>("/plantilla-formato/aplicar-a-sesion", { sesionId, alumnos });
  return data;
}
