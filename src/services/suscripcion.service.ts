import { instance } from "./instance";
import type { ISuscripcion } from "@/interfaces/ISuscripcion";

// ============================================
// Suscripción — /api/suscripcion  (protegido)
// ============================================

export interface ISuscripcionFull extends ISuscripcion {
  id: string;
  usuarioId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISuscripcionCreateRequest {
  usuarioId: string;
  plan: string;
  fechaInicio: string;
  fechaFin?: string;
}

export interface ISuscripcionUpdateRequest {
  plan?: string;
  activa?: boolean;
  fechaFin?: string;
}

/** GET /api/suscripcion/ */
export async function getAllSuscripciones(): Promise<ISuscripcionFull[]> {
  const { data } = await instance.get<ISuscripcionFull[]>("/suscripcion");
  return data;
}

/** GET /api/suscripcion/:id */
export async function getSuscripcionById(id: string): Promise<ISuscripcionFull> {
  const { data } = await instance.get<ISuscripcionFull>(`/suscripcion/${id}`);
  return data;
}

/** GET /api/suscripcion/usuario/:usuarioId */
export async function getSuscripcionByUsuario(usuarioId: string): Promise<ISuscripcionFull> {
  const { data } = await instance.get<ISuscripcionFull>(`/suscripcion/usuario/${usuarioId}`);
  return data;
}

/** POST /api/suscripcion/ */
export async function createSuscripcion(body: ISuscripcionCreateRequest): Promise<ISuscripcionFull> {
  const { data } = await instance.post<ISuscripcionFull>("/suscripcion", body);
  return data;
}

/** PUT /api/suscripcion/:id */
export async function updateSuscripcion(
  id: string,
  body: ISuscripcionUpdateRequest
): Promise<ISuscripcionFull> {
  const { data } = await instance.put<ISuscripcionFull>(`/suscripcion/${id}`, body);
  return data;
}

/** DELETE /api/suscripcion/:id */
export async function deleteSuscripcion(id: string) {
  const { data } = await instance.delete(`/suscripcion/${id}`);
  return data;
}
