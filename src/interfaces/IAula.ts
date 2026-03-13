// ============================================
// INTERFACES — Aula y Alumnos
// ============================================

/** Dato de un alumno extraído por OCR o ingresado manualmente */
export interface IAlumno {
  orden: number;
  apellidos: string;
  nombres: string;
  /** Opcional; si no viene, el backend puede derivar de apellidos + nombres */
  nombreCompleto?: string;
  sexo?: "M" | "F";
  dni?: string;
}

// ─── Extraer desde imagen (OCR) ─────────────────────────────────────────

/** Respuesta exitosa de POST /api/aula/extraer-desde-imagen */
export interface IExtraerAlumnosResponse {
  success: true;
  alumnos: IAlumno[];
}

/** Respuesta de error */
export interface IExtraerAlumnosError {
  success: false;
  message: string;
  error?: string;
}

// ─── Guardar alumnos en aula ────────────────────────────────────────────
// Detalle: docs/api/API_AULA_ALUMNOS.md
// POST = agrega al aula (no borra existentes). PUT = reemplaza toda la lista.

/**
 * Item del body para POST|PUT /api/aula/:aulaId/alumnos.
 * Requeridos: apellidos, nombres.
 * Opcionales: orden (si no va, backend usa índice + 1), nombreCompleto (si no va, "apellidos, nombres"),
 * sexo ("M"|"F" o masculino/femenino/hombre/mujer/male/female → se guarda "M"|"F"), dni (si no va → null).
 */
export interface IAlumnoBody {
  apellidos: string;
  nombres: string;
  orden?: number;
  nombreCompleto?: string;
  sexo?: string;
  dni?: string;
}

/** Body para POST|PUT /api/aula/:aulaId/alumnos */
export interface IGuardarAlumnosRequest {
  alumnos: IAlumnoBody[];
}

/** Respuesta genérica al guardar alumnos */
export interface IGuardarAlumnosResponse {
  success: boolean;
  message?: string;
}

// ─── Aula (listar / crear) ───────────────────────────────────────────────

export interface IAula {
  id: string;
  usuarioId?: string;
  nombre?: string;
  createdAt?: string;
}

/** GET /api/aula/usuario/:usuarioId */
export interface IListAulasResponse {
  data?: IAula[];
}

/** Body para POST /api/aula — todos los campos requeridos por el backend */
export interface ICreateAulaRequest {
  nombre: string;
  usuarioId: string;
  gradoId: number;
  nivelId: number;
}

/** POST /api/aula — crear aula */
export interface ICreateAulaResponse {
  data?: { id: string };
  id?: string;
}

/** GET /api/aula/:aulaId/alumnos */
export interface IGetAlumnosAulaResponse {
  data?: IAlumno[];
  alumnos?: IAlumno[];
}
