import { IUsuario } from "./IUsuario";
import type { IUnidadContenido } from "./IUnidadIA";

// ─── Tipos ───

export type TipoUnidad = "PERSONAL" | "COMPARTIDA";

export type EstadoPagoUnidad = "PENDIENTE" | "CONFIRMADO" | "RECHAZADO";

// ─── Entidad principal ───

export interface IUnidad {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoUnidad;
  estadoPago?: EstadoPagoUnidad;
  codigoCompartido?: string;
  usuarioId: string;
  usuario?: IUsuario;
  contenido?: IUnidadContenido;
  pdfUrl?: string;
  pdfGeneradoAt?: string;
  wordUrl?: string;
  wordGeneradoAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── CRUD ───

export interface IUnidadCreateRequest {
  usuarioId: string;
  titulo: string;
  tipo?: TipoUnidad;
  nivelId: number;
  gradoId: number | null;
  gradosSecundaria?: number[];
  numeroUnidad: number;
  duracion: number;
  fechaInicio: string;
  fechaFin: string;
  problematicaId: number;
  maxMiembros?: number;          // solo si tipo=COMPARTIDA
  sesionesSemanales?: number;
}

export interface IUnidadUpdateRequest extends Partial<IUnidadCreateRequest> {}

// ─── PDF (S3) ───

export interface IUnidadUploadUrlRequest {
  unidadId: string;
  usuarioId: string;
}

export interface IUnidadUploadUrlResponse {
  success: boolean;
  data: {
    uploadUrl: string;
    key: string;
    expiresIn: number;
    method: string;
    contentType: string;
  };
}

export interface IUnidadConfirmarUploadRequest {
  unidadId: string;
  usuarioId: string;
  key: string;
}

export interface IUnidadConfirmarUploadResponse {
  success: boolean;
  data: {
    id: string;
    pdfUrl: string;
    pdfGeneradoAt: string;
  };
}

export interface IUnidadDownloadUrlResponse {
  success: boolean;
  data: {
    downloadUrl: string;
    expiresIn: number;
  };
}

// ─── Miembros (unidades compartidas) ───

export interface IMiembroUnidad {
  id: string;
  usuarioId: string;
  unidadId: string;
  rol: "PROPIETARIO" | "MIEMBRO";
  usuario?: IUsuario;
  createdAt: string;
}

export interface IUnirseUnidadRequest {
  codigo: string;
}

// ─── Áreas por miembro ───

export interface IAreaDisponible {
  id: number;
  nombre: string;
  tomadaPor?: {
    miembroId: string;
    nombreUsuario: string;
  } | null;
}

export interface ISeleccionarAreasRequest {
  areaIds: number[];
}

// ─── Pagos de unidad (WhatsApp) ───

export interface IPagoUnidad {
  id: string;
  unidadId: string;
  usuarioId: string;
  monto: number;
  estado: EstadoPagoUnidad;
  motivoRechazo?: string;
  createdAt: string;
}

// ─── Precios dinámicos (/api/unidades/precios) ───

export interface IUnidadPrecios {
  propietario: number;   // S/.20
  suscriptor: number;    // S/.10
}

export interface IUnidadPreciosResponse {
  success: boolean;
  data: IUnidadPrecios;
}

// ─── Pre-pago propietario (usuario free, sin unidad aún) ───

export interface IPreSolicitarPagoRequest {
  tipo: TipoUnidad;
  usuarioId: string;
}

export interface IPreSolicitarPagoResponse {
  success: boolean;
  data: {
    pagoId: string;
    whatsappLink: string;
  };
}

// ─── Pago propietario (con unidad existente) ───

export interface ISolicitarPagoUnidadRequest {
  unidadId: string;
}

export interface ISolicitarPagoUnidadResponse {
  success: boolean;
  data: {
    pagoId: string;
    whatsappUrl: string;
    monto: number;
    estado: EstadoPagoUnidad;
  };
}

// ─── Pago suscriptor (nuevo) ───

export interface ISolicitarPagoSuscriptorRequest {
  unidadId: string;
}

export interface ISolicitarPagoSuscriptorResponse {
  success: boolean;
  data: {
    pagoId: string;
    whatsappLink: string;
    monto: number;
    estado: EstadoPagoUnidad;
  };
}

// ─── Unirse a unidad (respuesta real del backend) ───

export interface IUnirseUnidadResponse {
  success: boolean;
  message?: string;
  data: {
    miembroId: string;
    unidadId: string;
    estadoPago: EstadoPagoUnidad;
    montoPendiente: number;
    unidadTitulo?: string;
  };
}

export interface IEstadoPagoUnidadResponse {
  success: boolean;
  data: {
    pagoId: string;
    estado: EstadoPagoUnidad;
    motivoRechazo?: string;
  };
}

export interface IPagosPendientesResponse {
  success: boolean;
  data: IPagoUnidad[];
}

export interface IHistorialPagosUnidadResponse {
  success: boolean;
  data: IPagoUnidad[];
}

// ─── Distribución de áreas (COMPARTIDA) ───

export interface ICalcularDistribucionRequest {
  secuencia: unknown; // ISecuencia del contenido generado
  cantidadSuscriptores: number;
}

/** Área asignada dentro de una distribución sugerida */
export interface IDistribucionArea {
  areaId: number;
  nombre: string;
  maxSesionesSemana: number;
}

/** Distribución sugerida para un miembro */
export interface IDistribucionMiembro {
  rol: "PROPIETARIO" | "SUSCRIPTOR";
  orden: number; // 1 = propietario, 2+ = suscriptores
  areas: IDistribucionArea[];
  totalSesionesSemana: number;
}

export interface ICalcularDistribucionResponse {
  success: boolean;
  data: {
    distribucion: IDistribucionMiembro[];
  };
}

/** PUT /api/unidad/:id/distribucion-sesiones */
export interface IDistribucionSesionesRequest {
  distribucion: Array<{
    areaId: number;
    maxSesionesSemana: number;
  }>;
}
