// ============================================
// Interfaces para el panel de administración
// Coinciden 1:1 con las respuestas del backend
// ============================================

// ─── Auth Admin ───

export interface IAdminLoginRequest {
  email: string;
  password: string;
}

export interface IAdminLoginResponse {
  success: boolean;
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  admin: {
    id: string;
    email: string;
    nombre: string;
    roles: string[];
  };
}

// ─── Reset Usuario (1.1) ───

export interface IResetUsuarioRequest {
  resetSesiones?: boolean;
  resetPdfs?: boolean;
  resetSuscripcion?: boolean;
  resetUnidades?: boolean;
  resetPerfil?: boolean;
}

export interface IResetUsuarioResponse {
  success: boolean;
  message: string;
  data: {
    usuarioId: string;
    nombre: string;
    enfoquesEliminados: number;
    sesionesEliminadas: number;
    unidadesPdfLimpiadas: number;
    unidadesEliminadas: number;
    suscripcionRevocada: boolean;
    planAnterior: string;
  };
}

// ─── Estadísticas Usuario (1.2) ───

export interface IEstadisticasUsuario {
  success: boolean;
  data: {
    usuario: {
      id: string;
      nombre: string;
      email: string;
    };
    sesiones: {
      total: number;
      estaSemana: number;
      conPdf: number;
    };
    unidades: {
      total: number;
      conPdf: number;
    };
    suscripcion: {
      plan: string;
      activa: boolean;
      fechaInicio?: string;
      fechaFin?: string;
    };
  };
}

// ─── Upgrade Premium (1.3) ───

export interface IUpgradePremiumRequest {
  plan?: "premium_mensual" | "premium_anual";
}

export interface IUpgradePremiumResponse {
  success: boolean;
  message: string;
  data: {
    usuario: {
      id: string;
      nombre: string;
      email: string;
    };
    suscripcion: {
      plan: string;
      activa: boolean;
      fechaInicio: string;
      fechaFin: string;
    };
  };
}

// ─── Pagos ───

export type EstadoPago = "PENDIENTE" | "CONFIRMADO" | "RECHAZADO";
export type TipoPagoUnidad = "PRE_PAGO" | "PROPIETARIO" | "SUSCRIPTOR";

// Pago de Suscripción (2.x)
export interface IPagoSuscripcionAdmin {
  id: string;
  monto: number;
  moneda: string;
  metodoPago: string;
  descripcion: string;
  estado: EstadoPago;
  createdAt: string;
  updatedAt?: string;
  plan?: string;
  metadata?: {
    confirmadoPor?: string;
    confirmadoAt?: string;
    rechazadoPor?: string;
    rechazadoAt?: string;
    metodoPago?: string;
    motivo?: string;
  };
  usuario: {
    id: string;
    nombre: string;
    email: string;
  };
}

// Pago de Unidad (3.x)
export interface IPagoUnidadAdmin {
  id: string;
  unidadId: string | null;
  usuarioId: string;
  monto: number;
  estado: EstadoPago;
  tipoUnidad: string | null;
  confirmadoPor?: string | null;
  confirmadoAt?: string | null;
  motivoRechazo?: string | null;
  createdAt: string;
  updatedAt?: string;
  unidad: {
    id: string;
    titulo: string;
    tipo: string;
    maxMiembros?: number;
    precio?: number;
    codigoCompartido?: string;
  } | null;
  usuario: {
    id: string;
    nombre: string;
    email: string;
  };
  tipoPago: TipoPagoUnidad;
  endpointConfirmacion: string;
}

// ─── Responses de Pagos de Suscripción (2.x) ───

export interface IPagosSuscripcionPendientesResponse {
  success: boolean;
  message: string;
  data: IPagoSuscripcionAdmin[];
}

export interface IHistorialPagosSuscripcionResponse {
  success: boolean;
  data: IPagoSuscripcionAdmin[];
}

export interface IConfirmarPagoSuscripcionResponse {
  success: boolean;
  message: string;
  data: {
    pago: {
      id: string;
      estado: "CONFIRMADO";
      monto: number;
      moneda: string;
      mercadopagoResponse: {
        confirmadoPor: string;
        confirmadoAt: string;
        metodoPago: string;
      };
    };
    planActivado: string;
    fechaInicio: string;
    fechaFin: string;
  };
}

export interface IRechazarPagoSuscripcionResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    estado: "RECHAZADO";
    monto: number;
    mercadopagoResponse: {
      rechazadoPor: string;
      rechazadoAt: string;
      motivo: string;
    };
  };
}

// ─── Responses de Revocar Suscripción (2.5) ───

export interface IRevocarSuscripcionResponse {
  message: string;
  data: {
    id: string;
    usuarioId: string;
    plan: "free";
    activa: false;
    fechaInicio: string;
    fechaFin: string;
    usuario: {
      nombre: string;
      email: string;
    };
  };
}

// ─── Responses de Pagos de Unidad (3.x) ───

export interface IPagosUnidadPendientesResponse {
  success: boolean;
  message: string;
  data: IPagoUnidadAdmin[];
}

export interface IHistorialPagosUnidadResponse {
  success: boolean;
  data: IPagoUnidadAdmin[];
}

export interface IConfirmarPagoUnidadResponse {
  success: boolean;
  message: string;
  data: Record<string, unknown>;
}

export interface IConfirmarPagoSuscriptorResponse {
  success: boolean;
  message: string;
  data: {
    nuevoPrecioTotal: number;
    miembrosActivos: number;
  };
}

export interface IRechazarPagoUnidadResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    estado: "RECHAZADO";
    motivoRechazo: string;
    confirmadoPor: string;
    confirmadoAt: string;
  };
}

// ─── Gestión de Usuarios (4.x — 7.x) ───

/** Query params para listar usuarios */
export interface IListarUsuariosParams {
  page?: number;
  limit?: number;
  search?: string;
  plan?: "free" | "premium_mensual" | "premium_anual";
  departamento?: string;
  perfilCompleto?: boolean;
  orderBy?: "createdAt" | "nombre" | "email";
  order?: "asc" | "desc";
}

/** Usuario en el listado */
export interface IUsuarioListItem {
  id: string;
  nombre: string;
  email: string;
  nombreInstitucion: string;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  perfilCompleto: boolean;
  createdAt: string;
  nivel: { id: number; nombre: string } | null;
  grado: { id: number; nombre: string } | null;
  suscripcion: {
    plan: string;
    activa: boolean;
    fechaInicio: string | null;
    fechaFin: string | null;
  } | null;
  _count: {
    sesiones: number;
    unidades: number;
  };
}

export interface IListarUsuariosPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IListarUsuariosResponse {
  success: boolean;
  data: {
    usuarios: IUsuarioListItem[];
    pagination: IListarUsuariosPagination;
  };
}

/** Detalle completo de un usuario */
export interface IUsuarioDetalle {
  id: string;
  nombre: string;
  email: string;
  auth0UserId: string;
  nombreInstitucion: string;
  nombreDirectivo?: string | null;
  nombreSubdirectora?: string | null;
  genero?: string | null;
  seccion?: string | null;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  perfilCompleto: boolean;
  problematicaCompleta: boolean;
  tituloUnidadContexto?: string | null;
  situacionSignificativaContexto?: string | null;
  createdAt: string;
  nivel: { id: number; nombre: string } | null;
  grado: { id: number; nombre: string } | null;
  problematica: { id: number; nombre: string; descripcion: string } | null;
  suscripcion: {
    id: string;
    plan: string;
    activa: boolean;
    fechaInicio: string | null;
    fechaFin: string | null;
    createdAt: string;
    pagos: {
      id: string;
      estado: string;
      monto: number;
      moneda: string;
      metodoPago: string;
      createdAt: string;
    }[];
  } | null;
  sesiones: {
    id: string;
    titulo: string;
    createdAt: string;
    pdfUrl: string | null;
    wordUrl: string | null;
    wordGeneradoAt: string | null;
  }[];
  unidades: {
    id: string;
    titulo: string;
    numeroUnidad: number;
    tipo: string;
    createdAt: string;
    pdfUrl: string | null;
    wordUrl: string | null;
    wordGeneradoAt: string | null;
  }[];
  stats: {
    totalSesiones: number;
    totalUnidades: number;
    sesionesEstaSemana: number;
    sesionesConPdf: number;
    unidadesConPdf: number;
  };
}

export interface IUsuarioDetalleResponse {
  success: boolean;
  data: IUsuarioDetalle;
}

/** Downgrade a free */
export interface IDowngradeUsuarioResponse {
  success: boolean;
  message: string;
  data: {
    usuario: {
      id: string;
      nombre: string;
      email: string;
    };
    suscripcion: {
      planAnterior: string;
      planActual: "free";
      activa: false;
      fechaFin: string;
    };
  };
}

/** Eliminar usuario */
export interface IEliminarUsuarioResponse {
  success: boolean;
  message: string;
  data: {
    usuario: {
      id: string;
      nombre: string;
      email: string;
    };
    eliminados: {
      sesiones: number;
      enfoquesSesion: number;
      unidades: number;
      miembrosUnidad: number;
      pagosUnidad: number;
      pagosSuscripcion: number;
      suscripcion: boolean;
    };
  };
}
