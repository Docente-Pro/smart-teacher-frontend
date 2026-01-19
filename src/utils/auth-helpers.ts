import { handleToaster } from "./Toasters/handleToasters";

/**
 * Maneja la expiración de sesión cuando el backend retorna requiresReauth: true
 * 
 * Esta función:
 * 1. Limpia completamente el localStorage (tokens, usuario, etc.)
 * 2. Muestra un mensaje al usuario indicando que su sesión expiró
 * 3. Redirige automáticamente al login
 * 
 * Se debe llamar cuando:
 * - Se recibe un error 401 con requiresReauth: true al intentar refresh token
 * - El refresh token ha sido revocado o es inválido
 * - Se detecta que el usuario necesita volver a autenticarse
 */
export function handleSessionExpiration() {
  console.log('🔐 Sesión expirada - Limpiando y redirigiendo al login');
  
  // 1. Limpiar completamente el localStorage
  localStorage.clear();
  
  // 2. Mostrar mensaje al usuario
  handleToaster(
    'Tu sesión ha expirado, por favor inicia sesión nuevamente',
    'warning'
  );
  
  // 3. Redirigir al login después de un breve delay para que el toast sea visible
  setTimeout(() => {
    window.location.href = '/login';
  }, 100);
}
