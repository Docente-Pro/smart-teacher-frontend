import { instance } from "./instance";
import type {
  IExtraerAlumnosResponse,
  IGuardarAlumnosRequest,
  IGuardarAlumnosResponse,
  IListAulasResponse,
  ICreateAulaRequest,
  ICreateAulaResponse,
  IGetAlumnosAulaResponse,
  IAula,
  IAlumno,
  IAlumnoBody,
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
 * Agrega alumnos al aula (no borra los existentes).
 * POST /api/aula/:aulaId/alumnos — body: { alumnos: [ { apellidos, nombres, orden?, nombreCompleto?, sexo?, dni? }, ... ] }
 */
export async function agregarAlumnos(
  aulaId: string,
  body: IGuardarAlumnosRequest,
): Promise<IGuardarAlumnosResponse> {
  const response = await instance.post(`/aula/${aulaId}/alumnos`, body);
  return response.data;
}

/**
 * Reemplaza toda la lista de alumnos del aula (borra los actuales e inserta los del body).
 * PUT /api/aula/:aulaId/alumnos — body: { alumnos: [ { apellidos, nombres, orden?, nombreCompleto?, sexo?, dni? }, ... ] }
 */
export async function reemplazarAlumnos(
  aulaId: string,
  body: IGuardarAlumnosRequest,
): Promise<IGuardarAlumnosResponse> {
  const response = await instance.put(`/aula/${aulaId}/alumnos`, body);
  return response.data;
}

/**
 * Lista aulas del docente.
 * GET /api/aula/usuario/:usuarioId
 */
export async function listAulasByUsuario(usuarioId: string): Promise<IAula[]> {
  const { data } = await instance.get<IListAulasResponse | IAula[]>(`/aula/usuario/${usuarioId}`);
  const arr = Array.isArray(data) ? data : (data as IListAulasResponse)?.data;
  return Array.isArray(arr) ? arr : [];
}

/**
 * Crea un aula.
 * POST /api/aula — body: { nombre, usuarioId, gradoId, nivelId } (todos requeridos).
 */
export async function createAula(body: ICreateAulaRequest): Promise<{ id: string }> {
  const { data } = await instance.post<ICreateAulaResponse>("/aula", body);
  const id = data?.data?.id ?? (data as { id?: string })?.id;
  if (!id) throw new Error("Backend no devolvió id de aula");
  return { id };
}

/**
 * Lee la lista de alumnos del aula.
 * GET /api/aula/:aulaId/alumnos
 */
export async function getAlumnosAula(aulaId: string): Promise<IAlumno[]> {
  const { data } = await instance.get<IGetAlumnosAulaResponse>(`/aula/${aulaId}/alumnos`);
  const arr = data?.data ?? data?.alumnos;
  return Array.isArray(arr) ? arr : [];
}

/**
 * Convierte IAlumno[] al body de la API (ver docs/api/API_AULA_ALUMNOS.md).
 * Requeridos: apellidos, nombres. Opcionales: orden, nombreCompleto, sexo, dni.
 */
function toAlumnosBody(alumnos: IAlumno[]): IAlumnoBody[] {
  return alumnos.map((a, index) => {
    const apellidos = (a.apellidos ?? "").trim();
    const nombres = (a.nombres ?? "").trim();
    const body: IAlumnoBody = {
      apellidos,
      nombres,
      orden: a.orden ?? index + 1,
    };
    const fullName = a.nombreCompleto ?? (apellidos || nombres ? `${apellidos}, ${nombres}` : undefined);
    if (fullName) body.nombreCompleto = fullName;
    if (a.sexo) body.sexo = a.sexo;
    if (a.dni != null && String(a.dni).trim() !== "") body.dni = String(a.dni).trim();
    return body;
  });
}

/** Parámetros para crear un aula si no existe (requeridos por POST /api/aula) */
export interface CreateAulaParams {
  nombre: string;
  gradoId: number;
  nivelId: number;
}

/**
 * Obtiene o crea un aula para el usuario y reemplaza la lista de alumnos.
 * Si no hay aula, crea una con createAulaParams (nombre, gradoId, nivelId).
 */
export async function saveAlumnosToAula(
  usuarioId: string,
  alumnos: IAlumno[],
  createAulaParams: CreateAulaParams,
): Promise<IGuardarAlumnosResponse> {
  let aulas = await listAulasByUsuario(usuarioId);
  let aulaId: string;
  if (aulas.length > 0) {
    aulaId = aulas[0].id;
  } else {
    const created = await createAula({
      usuarioId,
      nombre: createAulaParams.nombre,
      gradoId: createAulaParams.gradoId,
      nivelId: createAulaParams.nivelId,
    });
    aulaId = created.id;
  }
  return reemplazarAlumnos(aulaId, { alumnos: toAlumnosBody(alumnos) });
}
