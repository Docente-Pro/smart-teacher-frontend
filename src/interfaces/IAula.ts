// ============================================
// INTERFACES — Aula y Alumnos
// ============================================

/** Dato de un alumno extraído por OCR o ingresado manualmente */
export interface IAlumno {
  orden: number;
  apellidos: string;
  nombres: string;
  sexo: "M" | "F";
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

/** Body para POST|PUT /api/aula/:aulaId/alumnos */
export interface IGuardarAlumnosRequest {
  alumnos: IAlumno[];
}

/** Respuesta genérica al guardar alumnos */
export interface IGuardarAlumnosResponse {
  success: boolean;
  message?: string;
}
