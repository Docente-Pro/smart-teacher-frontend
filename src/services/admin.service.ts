import { instance } from "./instance";
import type {
  IAdminLoginRequest,
  IAdminLoginResponse,
  IEstadisticasUsuario,
  IResetUsuarioRequest,
  IResetUsuarioResponse,
  IUpgradePremiumRequest,
  IUpgradePremiumResponse,
  IPagosSuscripcionPendientesResponse,
  IHistorialPagosSuscripcionResponse,
  IConfirmarPagoSuscripcionResponse,
  IRechazarPagoSuscripcionResponse,
  IRevocarSuscripcionResponse,
  IPagosUnidadPendientesResponse,
  IHistorialPagosUnidadResponse,
  IConfirmarPagoUnidadResponse,
  IConfirmarPagoSuscriptorResponse,
  IRechazarPagoUnidadResponse,
  IListarUsuariosParams,
  IListarUsuariosResponse,
  IUsuarioDetalleResponse,
  IDowngradeUsuarioResponse,
  IEliminarUsuarioResponse,
} from "@/interfaces/IAdmin";

// ============================================
// Admin Service
// Todos los endpoints requieren rol "Admin"
// ============================================

/**
 * Inyecta el token admin almacenado en localStorage.
 * Se usa como override de headers para cada petición admin.
 */
function getAdminHeaders() {
  const token = localStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Auth Admin ───

/** POST /api/auth/admin/login */
export async function adminLogin(
  body: IAdminLoginRequest
): Promise<IAdminLoginResponse> {
  const { data } = await instance.post<IAdminLoginResponse>(
    "/auth/admin/login",
    body
  );
  return data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. /api/admin
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 1.1 POST /api/admin/reset-usuario/:usuarioId
 * Resetear datos de un usuario (sesiones, PDFs, suscripción, unidades).
 */
export async function resetUsuario(
  usuarioId: string,
  body: IResetUsuarioRequest,
): Promise<IResetUsuarioResponse> {
  // Enviar SIEMPRE los 5 flags explícitos; los ausentes → false
  const safeBody: Required<IResetUsuarioRequest> = {
    resetSesiones: body.resetSesiones ?? false,
    resetPdfs: body.resetPdfs ?? false,
    resetSuscripcion: body.resetSuscripcion ?? false,
    resetUnidades: body.resetUnidades ?? false,
    resetPerfil: body.resetPerfil ?? false,
  };
  const { data } = await instance.post<IResetUsuarioResponse>(
    `/admin/reset-usuario/${usuarioId}`,
    safeBody,
    { headers: getAdminHeaders() }
  );
  return data;
}

/**
 * 1.2 GET /api/admin/estadisticas-usuario/:usuarioId
 * Estadísticas completas de un usuario.
 */
export async function getEstadisticasUsuario(
  usuarioId: string
): Promise<IEstadisticasUsuario> {
  const { data } = await instance.get<IEstadisticasUsuario>(
    `/admin/estadisticas-usuario/${usuarioId}`,
    { headers: getAdminHeaders() }
  );
  return data;
}

/**
 * 1.3 PATCH /api/admin/upgrade-premium/:usuarioId
 * Subir a un usuario a premium sin pago.
 */
export async function upgradePremium(
  usuarioId: string,
  body: IUpgradePremiumRequest = {}
): Promise<IUpgradePremiumResponse> {
  const { data } = await instance.patch<IUpgradePremiumResponse>(
    `/admin/upgrade-premium/${usuarioId}`,
    body,
    { headers: getAdminHeaders() }
  );
  return data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. /api/suscripcion (Admin)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 2.1 GET /api/suscripcion/pago/pendientes
 * Pagos de suscripción con estado PENDIENTE.
 */
export async function getPagosSuscripcionPendientes(): Promise<IPagosSuscripcionPendientesResponse> {
  const { data } = await instance.get<IPagosSuscripcionPendientesResponse>(
    "/suscripcion/pago/pendientes",
    { headers: getAdminHeaders() }
  );
  return data;
}

/**
 * 2.2 GET /api/suscripcion/pago/historial
 * Historial completo de pagos de suscripción. Filtrable por estado.
 */
export async function getHistorialPagosSuscripcion(
  estado?: string
): Promise<IHistorialPagosSuscripcionResponse> {
  const params = estado ? { estado } : {};
  const { data } = await instance.get<IHistorialPagosSuscripcionResponse>(
    "/suscripcion/pago/historial",
    { headers: getAdminHeaders(), params }
  );
  return data;
}

/**
 * 2.3 PATCH /api/suscripcion/pago/:pagoId/confirmar
 * Confirmar pago de suscripción → activa plan premium.
 */
export async function confirmarPagoSuscripcion(
  pagoId: string
): Promise<IConfirmarPagoSuscripcionResponse> {
  const { data } = await instance.patch<IConfirmarPagoSuscripcionResponse>(
    `/suscripcion/pago/${pagoId}/confirmar`,
    {},
    { headers: getAdminHeaders() }
  );
  return data;
}

/**
 * 2.4 PATCH /api/suscripcion/pago/:pagoId/rechazar
 * Rechazar pago de suscripción. Acepta motivo opcional.
 */
export async function rechazarPagoSuscripcion(
  pagoId: string,
  motivo?: string
): Promise<IRechazarPagoSuscripcionResponse> {
  const { data } = await instance.patch<IRechazarPagoSuscripcionResponse>(
    `/suscripcion/pago/${pagoId}/rechazar`,
    motivo ? { motivo } : {},
    { headers: getAdminHeaders() }
  );
  return data;
}

/**
 * 2.5 PATCH /api/suscripcion/usuario/:usuarioId/revocar
 * Revocar suscripción → plan free, activa false.
 */
export async function revocarSuscripcion(
  usuarioId: string,
  motivo?: string
): Promise<IRevocarSuscripcionResponse> {
  const { data } = await instance.patch<IRevocarSuscripcionResponse>(
    `/suscripcion/usuario/${usuarioId}/revocar`,
    motivo ? { motivo } : {},
    { headers: getAdminHeaders() }
  );
  return data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. /api/unidad (Admin)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 3.1 GET /api/unidad/pago/pendientes
 * Pagos de unidad pendientes (PRE_PAGO, PROPIETARIO, SUSCRIPTOR).
 */
export async function getPagosUnidadPendientes(): Promise<IPagosUnidadPendientesResponse> {
  const { data } = await instance.get<IPagosUnidadPendientesResponse>(
    "/unidad/pago/pendientes",
    { headers: getAdminHeaders() }
  );
  return data;
}

/**
 * 3.2 GET /api/unidad/pago/historial
 * Historial de pagos de unidad. Filtrable por estado.
 */
export async function getHistorialPagosUnidad(
  estado?: string
): Promise<IHistorialPagosUnidadResponse> {
  const params = estado ? { estado } : {};
  const { data } = await instance.get<IHistorialPagosUnidadResponse>(
    "/unidad/pago/historial",
    { headers: getAdminHeaders(), params }
  );
  return data;
}

/**
 * 3.3 PATCH /api/unidad/pago/:pagoId/confirmar
 * Confirmar pago de unidad (PRE_PAGO o PROPIETARIO).
 */
export async function confirmarPagoUnidad(
  pagoId: string
): Promise<IConfirmarPagoUnidadResponse> {
  const { data } = await instance.patch<IConfirmarPagoUnidadResponse>(
    `/unidad/pago/${pagoId}/confirmar`,
    {},
    { headers: getAdminHeaders() }
  );
  return data;
}

/**
 * 3.4 PATCH /api/unidad/pago/suscriptor/:pagoId/confirmar
 * Confirmar pago de suscriptor que se une a unidad compartida.
 */
export async function confirmarPagoSuscriptor(
  pagoId: string
): Promise<IConfirmarPagoSuscriptorResponse> {
  const { data } = await instance.patch<IConfirmarPagoSuscriptorResponse>(
    `/unidad/pago/suscriptor/${pagoId}/confirmar`,
    {},
    { headers: getAdminHeaders() }
  );
  return data;
}

/**
 * 3.5 PATCH /api/unidad/pago/:pagoId/rechazar
 * Rechazar pago de unidad. Acepta motivo opcional.
 */
export async function rechazarPagoUnidad(
  pagoId: string,
  motivo?: string
): Promise<IRechazarPagoUnidadResponse> {
  const { data } = await instance.patch<IRechazarPagoUnidadResponse>(
    `/unidad/pago/${pagoId}/rechazar`,
    motivo ? { motivo } : {},
    { headers: getAdminHeaders() }
  );
  return data;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. Gestión de Usuarios
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 4.1 GET /api/admin/usuarios
 * Listar usuarios con paginación, búsqueda y filtros.
 */
export async function getUsuarios(
  params: IListarUsuariosParams = {}
): Promise<IListarUsuariosResponse> {
  const { data } = await instance.get<IListarUsuariosResponse>(
    "/admin/usuarios",
    { headers: getAdminHeaders(), params }
  );
  return data;
}

/**
 * 4.2 GET /api/admin/usuarios/:usuarioId
 * Detalle completo de un usuario.
 */
export async function getUsuarioDetalle(
  usuarioId: string
): Promise<IUsuarioDetalleResponse> {
  const { data } = await instance.get<IUsuarioDetalleResponse>(
    `/admin/usuarios/${usuarioId}`,
    { headers: getAdminHeaders() }
  );
  return data;
}

/**
 * 4.3 PATCH /api/admin/usuarios/:usuarioId/downgrade
 * Bajar a un usuario a plan free.
 */
export async function downgradeUsuario(
  usuarioId: string
): Promise<IDowngradeUsuarioResponse> {
  const { data } = await instance.patch<IDowngradeUsuarioResponse>(
    `/admin/usuarios/${usuarioId}/downgrade`,
    {},
    { headers: getAdminHeaders() }
  );
  return data;
}

/**
 * POST /api/admin/rehacer-sesion/:sesionId
 * Regenera el contenido de una sesión conservando sus metadatos.
 * No requiere body — todo se extrae de la sesión en BD.
 */
/** Respuesta extendida de rehacerSesion: incluye contenido corregido + URLs presignadas */
export interface IRehacerSesionResponse {
  success: boolean;
  message: string;
  sesion: {
    id: string;
    titulo: string;
    area: string;
    grado: string;
    nivel: string;
    resumen: string;
    updatedAt: string;
    clonesActualizados: number;
  };
  /** Contenido pedagógico corregido (JSON objeto o string) */
  contenido: Record<string, any> | string;
  /** URL presignada para subir el PDF de la sesión original */
  upload: {
    presignedUrl: string;
    s3Key: string;
    expiresIn: number;
    method: string;
    contentType: string;
  };
  /** URLs presignadas para subir el PDF a cada clon */
  clonesUpload: Array<{
    sesionId: string;
    usuarioId: string;
    presignedUrl: string;
    s3Key: string;
  }>;
}

export async function rehacerSesion(
  sesionId: string
): Promise<IRehacerSesionResponse> {
  const { data } = await instance.post<IRehacerSesionResponse>(
    `/admin/rehacer-sesion/${sesionId}`,
    {},
    { headers: getAdminHeaders() }
  );
  return data;
}

/**
 * POST /api/admin/sesion/:sesionId/rellenar-lista-alumnos
 * Rellena contenido.listaAlumnos desde Aulas del docente u otra sesión del mismo usuario.
 * Si la sesión tenía PDF, se invalida para que el docente lo regenere.
 */
export interface IRellenarListaAlumnosSesionResponse {
  success: boolean;
  message: string;
  data: {
    sesionId: string;
    titulo: string;
    yaTeníaLista: boolean;
    cantidadAlumnos: number;
    pdfInvalidado?: boolean;
  };
}

export async function rellenarListaAlumnosSesion(
  sesionId: string
): Promise<IRellenarListaAlumnosSesionResponse> {
  const { data } = await instance.post<IRellenarListaAlumnosSesionResponse>(
    `/admin/sesion/${sesionId}/rellenar-lista-alumnos`,
    {},
    { headers: getAdminHeaders() }
  );
  return data;
}

/**
 * Confirma la subida de un PDF regenerado por el admin.
 * Llama al mismo endpoint que el docente pero con token admin.
 */
export async function adminConfirmarUploadPDF(body: {
  sesionId: string;
  usuarioId: string;
  key: string;
  contenido: Record<string, any>;
}): Promise<{ success: boolean }> {
  const { data } = await instance.post(
    "/sesion/confirmar-upload",
    body,
    { headers: getAdminHeaders() }
  );
  return data;
}

/**
 * 4.4 DELETE /api/admin/usuarios/:usuarioId
 * Eliminar usuario y todos sus datos. Acción irreversible.
 */
export async function eliminarUsuario(
  usuarioId: string
): Promise<IEliminarUsuarioResponse> {
  const { data } = await instance.delete<IEliminarUsuarioResponse>(
    `/admin/usuarios/${usuarioId}`,
    { headers: getAdminHeaders() }
  );
  return data;
}
