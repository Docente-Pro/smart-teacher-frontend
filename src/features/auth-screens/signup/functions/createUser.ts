import { createNewUsuario } from "@/services/usuarios.service";
import type { ISignupFormData } from "../interfaces/ISignup";

/**
 * Crea un usuario en la base de datos
 * @param userData - Datos del usuario a crear
 * @returns Promise con la respuesta del servidor
 */
export async function createUserInDatabase(userData: ISignupFormData) {
  return await createNewUsuario({
    nombre: userData.nombre,
    email: userData.email,
    nombreInstitucion: "", // Valor por defecto
    nivelId: 1, // Valor por defecto
    gradoId: 1, // Valor por defecto
    problematicaId: 1, // Valor por defecto
    suscripcion: {
      fechaInicio: new Date().toISOString(),
      plan: "free",
      activa: true,
    },
  });
}

/**
 * Verifica si un error es debido a email duplicado
 * @param error - Error capturado
 * @returns true si el error es por email duplicado
 */
export function isDuplicateEmailError(error: any): boolean {
  return (
    error.response?.data?.message?.includes("Unique constraint failed") ||
    error.response?.data?.message?.includes("email")
  );
}
