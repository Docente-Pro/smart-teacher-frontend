// ============================================
// localStorage — Lista de alumnos y flag de subida
// Soporta almacenamiento por grado (secundaria)
// ============================================

import type { IAlumno } from "@/interfaces/IAula";

const FLAG_KEY = "dp_alumnos_subidos";
const DATA_KEY = "dp_alumnos_data";
const GRADO_PREFIX = "dp_alumnos";

function flagKey(gradoId?: number): string {
  return gradoId ? `${GRADO_PREFIX}_subidos_grado_${gradoId}` : FLAG_KEY;
}

function dataKey(gradoId?: number): string {
  return gradoId ? `${GRADO_PREFIX}_data_grado_${gradoId}` : DATA_KEY;
}

/**
 * Devuelve `true` si el usuario ya subió su lista de alumnos.
 * Si se pasa `gradoId`, revisa la lista de ese grado; si no, revisa la genérica.
 */
export function hasUploadedAlumnos(gradoId?: number): boolean {
  try {
    return localStorage.getItem(flagKey(gradoId)) === "true";
  } catch {
    return false;
  }
}

/**
 * Marca que el usuario ya subió su lista de alumnos.
 */
export function markAlumnosUploaded(gradoId?: number): void {
  try {
    localStorage.setItem(flagKey(gradoId), "true");
  } catch {
    // ignore
  }
}

/**
 * Resetea el flag y los datos de alumnos.
 */
export function resetAlumnosUploaded(gradoId?: number): void {
  try {
    localStorage.removeItem(flagKey(gradoId));
    localStorage.removeItem(dataKey(gradoId));
  } catch {
    // ignore
  }
}

// ─── Persistencia de datos de alumnos ───────────────────────────────────

/**
 * Guarda la lista de alumnos en localStorage.
 * Si se pasa `gradoId`, se guarda bajo una key específica para ese grado.
 */
export function saveAlumnos(alumnos: IAlumno[], gradoId?: number): void {
  try {
    localStorage.setItem(dataKey(gradoId), JSON.stringify(alumnos));
  } catch {
    // ignore (quota exceeded, etc.)
  }
}

/**
 * Recupera la lista de alumnos guardada en localStorage.
 * Si se pasa `gradoId`, busca la lista de ese grado; si no hay,
 * intenta la lista genérica como fallback.
 */
export function getSavedAlumnos(gradoId?: number): IAlumno[] {
  try {
    const key = dataKey(gradoId);
    const raw = localStorage.getItem(key);

    // Si se pidió por grado y no hay datos, fallback a la lista genérica
    if (!raw && gradoId) {
      const fallback = localStorage.getItem(DATA_KEY);
      if (!fallback) return [];
      const parsed = JSON.parse(fallback);
      return Array.isArray(parsed) ? parsed : [];
    }

    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Elimina todas las keys de alumnos del localStorage (genéricas y por grado).
 * Usar al cerrar sesión del usuario.
 */
export function clearAllAlumnosStorage(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(GRADO_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
}
