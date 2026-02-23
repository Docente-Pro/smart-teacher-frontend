// ═══════════════════════════════════════════════════════════════════════════════
// Interfaces para GET /api/unidades/:unidadId/sesiones/calendario?areaId=X
//
// Mapean 1:1 la respuesta del backend (obtenerCalendarioSesiones).
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Estado de cada slot ──────────────────────────────────────────────────────
//  realizada  → sesión generada y guardada en BD (solo lectura)
//  atrasada   → semana pasada sin sesión (recuperable, el docente puede crearla)
//  pendiente  → semana actual sin sesión (accionable, puede crear)
//  bloqueada  → semana futura, no se puede acceder todavía (disabled)
export type EstadoSlot = "realizada" | "atrasada" | "pendiente" | "bloqueada";

// ─── Estado de la semana ──────────────────────────────────────────────────────
export type EstadoSemana = "vencida" | "actual" | "futura";

// ─── Sesión dentro de un slot (cuando estadoSlot === "realizada") ─────────────
export interface ISlotSesion {
  id: string;
  titulo: string;
  resumen: string | null;
  createdAt: string; // ISO date string
  pdfUrl: string | null;
}

// ─── Slot individual dentro de una semana ─────────────────────────────────────
export interface ICalendarioSlot {
  /** Posición dentro de la semana (1-based) */
  slot: number;
  estadoSlot: EstadoSlot;
  /** null si no hay sesión generada, con datos si estadoSlot === "realizada" */
  sesion: ISlotSesion | null;
}

// ─── Semana del calendario ────────────────────────────────────────────────────
export interface ICalendarioSemana {
  /** Número de semana (1-based) */
  semana: number;
  estado: EstadoSemana;
  fechaInicio: string | null; // "YYYY-MM-DD"
  fechaFin: string | null;    // "YYYY-MM-DD"
  slots: ICalendarioSlot[];
}

// ─── Área asociada ────────────────────────────────────────────────────────────
export interface ICalendarioArea {
  id: number;
  nombre: string;
}

// ─── Resumen numérico ─────────────────────────────────────────────────────────
export interface ICalendarioResumen {
  /** Total de slots (totalSemanas × sesionesPorSemana) */
  total: number;
  /** Slots con sesión generada */
  realizadas: number;
  /** Slots de semana actual sin sesión */
  pendientes: number;
  /** Slots de semanas pasadas sin sesión (recuperables) */
  atrasadas: number;
  /** Slots de semanas futuras (no accesibles) */
  bloqueadas: number;
  /** pendientes + atrasadas — lo que el docente puede hacer HOY */
  accionables: number;
}

// ─── Respuesta completa del endpoint ──────────────────────────────────────────
export interface ICalendarioSesionesResponse {
  success: boolean;
  unidadId: string;
  semanaActual: number;
  totalSemanas: number;
  fechaInicio: string | null; // "YYYY-MM-DD"
  fechaFin: string | null;    // "YYYY-MM-DD"
  area: ICalendarioArea;
  sesionesPorSemana: number;
  resumen: ICalendarioResumen;
  semanas: ICalendarioSemana[];
}
