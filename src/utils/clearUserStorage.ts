/**
 * Limpia selectivamente las claves de localStorage relacionadas con el usuario,
 * preservando las claves de administración (admin_token, admin-auth-storage)
 * y otras claves no relacionadas con la sesión del usuario.
 *
 * Usar esta función en lugar de `localStorage.clear()` para evitar
 * que al cerrar sesión de usuario se destruya la sesión de admin.
 */
export function clearUserStorage() {
  // Claves de Zustand stores del usuario
  const userKeys = [
    "auth-storage",
    "user-storage",
    "unidad-wizard-storage",
    "sesion-storage",
    // Cache y datos por docente (deben limpiarse al cerrar sesión)
    "dp_alumnos_subidos",
    "dp_alumnos_data",
    "insignia_base64",
  ];

  // Claves de tokens / auth manuales del usuario
  const tokenKeys = [
    "refresh_token",
    "auth0_id_token",
    "auth0_access_token",
    "auth0_expires_at",
  ];

  [...userKeys, ...tokenKeys].forEach((key) => {
    localStorage.removeItem(key);
  });

  // Limpiar también las entradas del cache de Auth0 SDK
  // (Auth0 guarda entradas con el prefijo '@@auth0spajs@@')
  const auth0Prefix = "@@auth0spajs@@";
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(auth0Prefix)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}
