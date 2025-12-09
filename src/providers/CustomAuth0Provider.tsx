import React, { useEffect, useState } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { getAuth0Client } from '@/services/auth0Client.service';

interface CustomAuth0ProviderProps {
  children: React.ReactNode;
}

/**
 * Auth0Provider personalizado que permite inyección manual de tokens
 * 
 * Este provider mantiene todos los beneficios de Auth0 SDK (hooks, isAuthenticated, user, etc.)
 * pero NO usa loginWithRedirect ni Universal Login.
 * 
 * El flujo es:
 * 1. UI personalizada llama al backend
 * 2. Backend devuelve tokens de Auth0
 * 3. Tokens se inyectan manualmente en el SDK usando auth0Client.service.ts
 * 4. Los hooks de Auth0 funcionan normalmente
 */
export function CustomAuth0Provider({ children }: CustomAuth0ProviderProps) {
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    // Inicializar el cliente de Auth0
    getAuth0Client().then(() => {
      setClientReady(true);
    });
  }, []);

  if (!clientReady) {
    return <div>Cargando...</div>;
  }

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: 'openid profile email',
      }}
      cacheLocation="localstorage" // Usar localStorage para que persistan los tokens inyectados
      useRefreshTokens={false} // El backend maneja los refresh tokens
      skipRedirectCallback={false} // Permitir que Auth0 maneje callbacks si es necesario
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
    } catch (error) {
      console.error('Error al refrescar sesión:', error);
      throw error;
    }
  };

  return {
    ...auth0,
    logout: customLogout,
    refreshSession,
  };
}
