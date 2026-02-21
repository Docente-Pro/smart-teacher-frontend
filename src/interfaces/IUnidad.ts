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
  codigoCompartido?: string;
  usuarioId: string;
  usuario?: IUsuario;
  contenido?: IUnidadContenido;
  pdfUrl?: string;
  pdfGeneradoAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── CRUD ───

export interface IUnidadCreateRequest {
  usuarioId: string;
  titulo: string;
  tipo?: TipoUnidad;
  nivelId: number;
  gradoId: number;
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
  codigoCompartido: string;
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
