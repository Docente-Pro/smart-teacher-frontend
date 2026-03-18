import type { TipoUnidad, EstadoPagoUnidad } from "./IUnidad";

// ─── Respuesta de GET /api/unidad/usuario/:usuarioId ───

export interface IUnidadListResponse {
  message: string;
  data: IUnidadListItem[];
}

/** Cada unidad en el listado — estructura completa del backend */
export interface IUnidadListItem {
  id: string;
  numeroUnidad: number;
  titulo: string;
  usuarioId: string;
  /** Rol del usuario actual en esta unidad (solo presente en respuesta) */
  _rol?: "PROPIETARIO" | "SUSCRIPTOR";
  /** true si el suscriptor necesita sincronizar contenido personalizado */
  necesitaSincronizacion?: boolean;
  nivelId: number;
  gradoId: number;
  problematicaId: number;
  tipo: TipoUnidad;
  codigoCompartido: string | null;
  maxMiembros: number;
  sesionesSemanales: number;
  precio: number;
  precioSuscriptor: number;
  estadoPago: EstadoPagoUnidad;
  duracion: number;
  fechaInicio: string;
  fechaFin: string;
  contenido?: any; // contenido completo de la unidad (no se usa en el listado)
  pdfUrl: string | null;
  pdfGeneradoAt: string | null;
  wordUrl?: string | null;
  wordGeneradoAt?: string | null;
  createdAt: string;
  updatedAt: string;
  nivel: IUnidadListNivel;
  grado: IUnidadListGrado;
  problematica: IUnidadListProblematica;
  sesiones: any[];
  miembros: IUnidadListMiembro[];
}

export interface IUnidadListNivel {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
}

export interface IUnidadListGrado {
  id: number;
  nombre: string;
  nivelId: number;
  cicloId: number;
}

export interface IUnidadListProblematica {
  id: number;
  nombre: string;
  descripcion: string;
  creadaPorId: string;
  createdAt: string;
  esPersonalizada: boolean;
  basadaEnId: number | null;
}

export interface IUnidadListMiembro {
  id: string;
  unidadId: string;
  usuarioId: string;
  rol: "PROPIETARIO" | "SUSCRIPTOR";
  estadoPago: EstadoPagoUnidad;
  maxSesionesSemanales: number;
  fechaIncorporacion: string;
  createdAt: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
  };
  areas: IUnidadListMiembroArea[];
}

export interface IUnidadListMiembroArea {
  id: number;
  unidadMiembroId: string;
  areaId: number;
  maxSesionesSemana: number;
  createdAt: string;
  area: {
    id: number;
    nombre: string;
    descripcion: string;
    color: string;
    imagen: string;
  };
}
