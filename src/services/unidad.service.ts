import { instance } from "./instance";
import type {
  IUnidad,
  IUnidadCreateRequest,
  IUnidadUpdateRequest,
  IUnidadUploadUrlRequest,
  IUnidadUploadUrlResponse,
  IUnidadConfirmarUploadRequest,
  IUnidadConfirmarUploadResponse,
  IUnidadDownloadUrlResponse,
  IMiembroUnidad,
  IUnirseUnidadRequest,
  IAreaDisponible,
  ISeleccionarAreasRequest,
  ISolicitarPagoUnidadRequest,
  ISolicitarPagoUnidadResponse,
  IEstadoPagoUnidadResponse,
  IPagosPendientesResponse,
  IHistorialPagosUnidadResponse,
  IPagoUnidad,
} from "@/interfaces/IUnidad";

// ============================================
// CRUD — Unidad de Aprendizaje
// /api/unidad  (protegido)
// ============================================

/** GET /api/unidad/ */
export function getAllUnidades() {
  return instance.get<IUnidad[]>("/unidad");
}

/** GET /api/unidad/usuario/:usuarioId */
export function getUnidadesByUsuario(usuarioId: string) {
  return instance.get<IUnidad[]>(`/unidad/usuario/${usuarioId}`);
}

/** GET /api/unidad/:id */
export function getUnidadById(id: string) {
  return instance.get<IUnidad>(`/unidad/${id}`);
}

/** POST /api/unidad/ — genera codigoCompartido si tipo=COMPARTIDA */
export function createUnidad(data: IUnidadCreateRequest) {
  return instance.post<{ message: string; data: IUnidad }>("/unidad", data);
}

/** PUT /api/unidad/:id */
export function updateUnidad(id: string, data: IUnidadUpdateRequest) {
  return instance.put<IUnidad>(`/unidad/${id}`, data);
}

/** DELETE /api/unidad/:id */
export function deleteUnidad(id: string) {
  return instance.delete(`/unidad/${id}`);
}

// ============================================
// Almacenamiento PDF (S3)
// ============================================

/** POST /api/unidad/upload-url — URL presignada para subir PDF */
export async function solicitarUploadUrlUnidad(
  data: IUnidadUploadUrlRequest
): Promise<IUnidadUploadUrlResponse> {
  const { data: res } = await instance.post<IUnidadUploadUrlResponse>("/unidad/upload-url", data);
  return res;
}

/** POST /api/unidad/confirmar-upload — Confirmar upload del PDF */
export async function confirmarUploadUnidad(
  data: IUnidadConfirmarUploadRequest
): Promise<IUnidadConfirmarUploadResponse> {
  const { data: res } = await instance.post<IUnidadConfirmarUploadResponse>(
    "/unidad/confirmar-upload",
    data
  );
  return res;
}

/** GET /api/unidad/:id/download-url — URL presignada para descargar PDF */
export async function obtenerDownloadUrlUnidad(
  unidadId: string
): Promise<IUnidadDownloadUrlResponse> {
  const { data } = await instance.get<IUnidadDownloadUrlResponse>(
    `/unidad/${unidadId}/download-url`
  );
  return data;
}

/** DELETE /api/unidad/:id/pdf — Eliminar PDF */
export async function eliminarPdfUnidad(unidadId: string) {
  const { data } = await instance.delete(`/unidad/${unidadId}/pdf`);
  return data;
}

// ============================================
// Miembros (unidades compartidas)
// ============================================

/** POST /api/unidad/unirse — Unirse a unidad con código compartido */
export async function unirseAUnidad(body: IUnirseUnidadRequest) {
  const { data } = await instance.post("/unidad/unirse", body);
  return data;
}

/** GET /api/unidad/:unidadId/miembros — Listar miembros */
export async function getMiembrosUnidad(unidadId: string): Promise<IMiembroUnidad[]> {
  const { data } = await instance.get<IMiembroUnidad[]>(`/unidad/${unidadId}/miembros`);
  return data;
}

/** DELETE /api/unidad/:unidadId/miembros/:miembroId — Eliminar miembro (solo propietario) */
export async function eliminarMiembroUnidad(unidadId: string, miembroId: string) {
  const { data } = await instance.delete(`/unidad/${unidadId}/miembros/${miembroId}`);
  return data;
}

// ============================================
// Áreas por Miembro (exclusividad)
// ============================================

/** GET /api/unidad/:unidadId/areas-disponibles */
export async function getAreasDisponibles(unidadId: string): Promise<IAreaDisponible[]> {
  const { data } = await instance.get<IAreaDisponible[]>(`/unidad/${unidadId}/areas-disponibles`);
  return data;
}

/** GET /api/unidad/:unidadId/miembros/:miembroId/areas — Áreas asignadas a un miembro */
export async function getAreasMiembro(unidadId: string, miembroId: string) {
  const { data } = await instance.get(`/unidad/${unidadId}/miembros/${miembroId}/areas`);
  return data;
}

/** PUT /api/unidad/:unidadId/areas — Seleccionar/cambiar áreas del miembro autenticado */
export async function seleccionarAreas(unidadId: string, body: ISeleccionarAreasRequest) {
  const { data } = await instance.put(`/unidad/${unidadId}/areas`, body);
  return data;
}

// ============================================
// Pagos de unidad (WhatsApp + WebSocket)
// ============================================

/** POST /api/unidad/pago/solicitar — Solicitar pago → retorna link WhatsApp (Docente) */
export async function solicitarPagoUnidad(
  body: ISolicitarPagoUnidadRequest
): Promise<ISolicitarPagoUnidadResponse> {
  const { data } = await instance.post<ISolicitarPagoUnidadResponse>(
    "/unidad/pago/solicitar",
    body
  );
  return data;
}

/** GET /api/unidad/:id/estado-pago — Consultar estado del pago (polling fallback) */
export async function getEstadoPagoUnidad(
  unidadId: string
): Promise<IEstadoPagoUnidadResponse> {
  const { data } = await instance.get<IEstadoPagoUnidadResponse>(
    `/unidad/${unidadId}/estado-pago`
  );
  return data;
}

/** GET /api/unidad/pago/pendientes — Listar pagos pendientes (Admin) */
export async function getPagosPendientes(): Promise<IPagosPendientesResponse> {
  const { data } = await instance.get<IPagosPendientesResponse>("/unidad/pago/pendientes");
  return data;
}

/** GET /api/unidad/pago/historial — Historial de todos los pagos (Admin) */
export async function getHistorialPagosUnidad(): Promise<IHistorialPagosUnidadResponse> {
  const { data } = await instance.get<IHistorialPagosUnidadResponse>("/unidad/pago/historial");
  return data;
}

/** PATCH /api/unidad/pago/:pagoId/confirmar — Confirmar pago (Admin → WebSocket) */
export async function confirmarPagoUnidad(pagoId: string): Promise<IPagoUnidad> {
  const { data } = await instance.patch<IPagoUnidad>(`/unidad/pago/${pagoId}/confirmar`);
  return data;
}

/** PATCH /api/unidad/pago/:pagoId/rechazar — Rechazar pago (Admin → WebSocket) */
export async function rechazarPagoUnidad(
  pagoId: string,
  motivoRechazo?: string
): Promise<IPagoUnidad> {
  const { data } = await instance.patch<IPagoUnidad>(`/unidad/pago/${pagoId}/rechazar`, {
    motivoRechazo,
  });
  return data;
}
