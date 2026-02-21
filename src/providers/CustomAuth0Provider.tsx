import React from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

interface CustomAuth0ProviderProps {
  children: React.ReactNode;
}

/**
 * Auth0Provider personalizado.
 *
 * Flujo tradicional (email/password):
 *   UI personalizada llama al backend → backend devuelve tokens →
 *   se guardan en Zustand auth store → useAuth0 custom hook los usa.
 *
 * Flujo social (Google):
 *   loginWithRedirect → Auth0 callback → Auth0Provider procesa callback →
 *   useAuthFlow sincroniza con backend → tokens en Zustand store.
 */
export function CustomAuth0Provider({ children }: CustomAuth0ProviderProps) {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: 'openid profile email',
        redirect_uri: window.location.origin,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      useRefreshTokensFallback={false} // No usar iframe fallback (falla con cookies de terceros)
      skipRedirectCallback={false}
    >
      {children}
    </Auth0Provider>
  );
}

/**
 * Hook personalizado para manejar autenticación
 * Incluye logout y refresh token management
 */
export function useCustomAuth() {
  const auth0 = useAuth0();
  const { logout: auth0Logout } = auth0;

  /**
   * Logout personalizado que limpia todo
   */
  const customLogout = async () => {
    try {
      // 1. Llamar al backend para invalidar refresh token
      const { logoutWithBackend } = await import('@/services/backendAuth.service');
      await logoutWithBackend();

      // 2. Limpiar refresh token de localStorage
      localStorage.removeItem('refresh_token');

      // 3. Limpiar el SDK de Auth0
      const { clearAuth0Session } = await import('@/services/auth0Client.service');
      await clearAuth0Session();

      // 4. Logout del SDK (limpia memoria)
      auth0Logout({
        logoutParams: {
          returnTo: window.location.origin + '/login',
        },
      });
    } catch (error) {
      console.error('Error en logout:', error);
      // Forzar logout local aunque falle el backend
      localStorage.removeItem('refresh_token');
      auth0Logout({
        logoutParams: {
          returnTo: window.location.origin + '/login',
        },
      });
    }
  };

  /**
   * Refresca el access token si el usuario tiene un refresh token guardado
   * Esto se puede llamar al cargar la app para restaurar la sesión
   */
  const refreshSession = async (refreshToken: string) => {
    try {
      const { refreshAccessToken } = await import('@/services/backendAuth.service');
      const { injectTokensIntoAuth0 } = await import('@/services/auth0Client.service');
      
      // 1. Obtener nuevos tokens del backend
      const tokens = await refreshAccessToken(refreshToken);
      
      // 2. Inyectar en Auth0 SDK
      await injectTokensIntoAuth0(tokens);
      
      return tokens;
    } catch (error: any) {
      console.error('Error al refrescar sesión:', error);
      
      // Si el error indica que se requiere reautenticación, limpiar todo y redirigir
      if (error.message === 'REQUIRES_REAUTH' || error.requiresReauth) {
        const { handleSessionExpiration } = await import('@/utils/auth-helpers');
        handleSessionExpiration();
      }
      
      throw error;
    }
  };

  return {
    ...auth0,
    logout: customLogout,
    refreshSession,
  };
}
