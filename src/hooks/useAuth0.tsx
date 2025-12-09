import { useAuthStore } from '@/store/auth.store';
import { logoutWithBackend } from '@/services/backendAuth.service';
import { clearAuth0Session } from '@/services/auth0Client.service';

/**
 * Hook personalizado que simula la API de useAuth0()
 * Compatible con la misma interfaz para facilitar la migración
 */
export function useAuth0() {
  const {
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    idToken,
    clearAuth,
  } = useAuthStore();

  /**
   * Obtiene el access token de forma silenciosa
   * Compatible con Auth0 SDK
   */
  const getAccessTokenSilently = async (): Promise<string> => {
    if (!accessToken) {
      throw new Error('No access token available');
    }
    return accessToken;
  };

  /**
   * Obtiene el access token con popup (no implementado en este flujo)
   */
  const getAccessTokenWithPopup = async (): Promise<string> => {
    throw new Error('getAccessTokenWithPopup no está disponible en este flujo');
  };

  /**
   * Obtiene el id token
   */
  const getIdTokenClaims = async () => {
    if (!idToken) {
      throw new Error('No id token available');
    }
    return user;
  };

  /**
   * Login con redirect (no implementado en este flujo)
   */
  const loginWithRedirect = async () => {
    throw new Error('loginWithRedirect no está disponible. Usa el formulario de login.');
  };

  /**
   * Login con popup (no implementado en este flujo)
   */
  const loginWithPopup = async () => {
    throw new Error('loginWithPopup no está disponible. Usa el formulario de login.');
  };

  /**
   * Logout personalizado
   */
  const logout = async (options?: { logoutParams?: { returnTo?: string } }) => {
    try {
      // 1. Llamar al backend para invalidar refresh token
      await logoutWithBackend();

      // 2. Limpiar sesión de Auth0 (si existe)
      await clearAuth0Session();

      // 3. Limpiar el store
      clearAuth();

      // 4. Limpiar refresh token
      localStorage.removeItem('refresh_token');

      // 5. Redirigir si se especifica
      const returnTo = options?.logoutParams?.returnTo || window.location.origin + '/login';
      window.location.href = returnTo;
    } catch (error) {
      console.error('Error en logout:', error);
      // Forzar logout local aunque falle el backend
      clearAuth();
      localStorage.removeItem('refresh_token');
      window.location.href = window.location.origin + '/login';
    }
  };

  /**
   * Handle redirect callback (no implementado en este flujo)
   */
  const handleRedirectCallback = async () => {
    console.warn('handleRedirectCallback no está disponible en este flujo');
  };

  return {
    // Estado
    user,
    isAuthenticated,
    isLoading,
    error: undefined,

    // Métodos
    getAccessTokenSilently,
    getAccessTokenWithPopup,
    getIdTokenClaims,
    loginWithRedirect,
    loginWithPopup,
    logout,
    handleRedirectCallback,
  };
}

/**
 * Hook para obtener solo el access token
 * Útil para llamadas a APIs
 */
export function useAccessToken() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return accessToken;
}

/**
 * Hook para obtener el usuario actual
 */
export function useUser() {
  const user = useAuthStore((state) => state.user);
  return user;
}
