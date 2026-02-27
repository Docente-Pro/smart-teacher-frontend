// ============================================
// localStorage — Lista de alumnos y flag de subida
// ============================================

import type { IAlumno } from "@/interfaces/IAula";

const FLAG_KEY = "dp_alumnos_subidos";
const DATA_KEY = "dp_alumnos_data";

/**
 * Devuelve `true` si el usuario ya subió (o marcó como completado)
 * su lista de alumnos al menos una vez.
 */
export function hasUploadedAlumnos(): boolean {
  try {
    return localStorage.getItem(FLAG_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Marca que el usuario ya subió su lista de alumnos.
 */
export function markAlumnosUploaded(): void {
  try {
    localStorage.setItem(FLAG_KEY, "true");
  } catch {
    // ignore
  }
}

/**
 * Resetea el flag (por si el admin resetea al usuario o para testing).
 */
export function resetAlumnosUploaded(): void {
  try {
    localStorage.removeItem(FLAG_KEY);
    localStorage.removeItem(DATA_KEY);
  } catch {
    // ignore
  }
}

// ─── Persistencia de datos de alumnos ───────────────────────────────────

/**
 * Guarda la lista de alumnos en localStorage.
 */
export function saveAlumnos(alumnos: IAlumno[]): void {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(alumnos));
  } catch {
    // ignore (quota exceeded, etc.)
  }
}

/**
 * Recupera la lista de alumnos guardada en localStorage.
 * Devuelve un array vacío si no hay datos o si falla el parsing.
 */
export function getSavedAlumnos(): IAlumno[] {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
