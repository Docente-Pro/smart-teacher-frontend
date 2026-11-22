import { createJSONStorage, type StateStorage } from "zustand/middleware";

/**
 * Claves de localStorage que son solo caché y se pueden borrar sin perder datos
 * (se regeneran desde el backend o S3).
 */
const CACHE_KEYS_TO_FREE = ["smart_teacher_graficos", "insignia_base64"];

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      error.code === 22 ||
      error.code === 1014)
  );
}

/**
 * localStorage que nunca lanza excepciones.
 * Si se llena la cuota, libera las claves de caché y reintenta una vez.
 * Si aun así no entra, se omite la persistencia (el estado en memoria sigue funcionando).
 */
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      if (!isQuotaError(error)) {
        console.warn(`[safeStorage] No se pudo guardar "${name}":`, error);
        return;
      }
      try {
        CACHE_KEYS_TO_FREE.forEach((key) => localStorage.removeItem(key));
        localStorage.setItem(name, value);
      } catch (retryError) {
        console.warn(
          `[safeStorage] localStorage lleno, "${name}" no se persistió (${value.length} chars)`,
          retryError,
        );
      }
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const safeJSONStorage = createJSONStorage(() => safeLocalStorage);
