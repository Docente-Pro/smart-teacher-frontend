import type { ISignupFormData } from "../interfaces/ISignup";

const PENDING_USER_DATA_KEY = "pendingUserData";

interface PendingUserData extends ISignupFormData {
  timestamp: number;
}

/**
 * Guarda los datos del usuario en localStorage
 * @param formData - Datos del formulario de registro
 */
export function savePendingUserData(formData: ISignupFormData): void {
  const dataToSave: PendingUserData = {
    ...formData,
    timestamp: Date.now(),
  };

  localStorage.setItem(PENDING_USER_DATA_KEY, JSON.stringify(dataToSave));
}

/**
 * Obtiene los datos del usuario guardados en localStorage
 * @returns Datos del usuario o null si no existen
 */
export function getPendingUserData(): PendingUserData | null {
  const dataString = localStorage.getItem(PENDING_USER_DATA_KEY);
  
  if (!dataString) {
    return null;
  }

  try {
    return JSON.parse(dataString);
  } catch {
    return null;
  }
}

/**
 * Limpia los datos del usuario de localStorage
 */
export function clearPendingUserData(): void {
  localStorage.removeItem(PENDING_USER_DATA_KEY);
}

/**
 * Valida si los datos guardados están dentro del tiempo límite
 * @param timestamp - Timestamp de cuando se guardaron los datos
 * @param maxMinutes - Minutos máximos de validez (default: 30)
 * @returns true si los datos son válidos, false si expiraron
 */
export function isPendingDataValid(timestamp: number, maxMinutes: number = 30): boolean {
  const maxMilliseconds = maxMinutes * 60 * 1000;
  return Date.now() - timestamp <= maxMilliseconds;
}
