import { useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthStore } from '@/store/auth.store';
import { socialLoginWithBackend } from '@/services/backendAuth.service';

/**
 * Hook principal de autenticación - Maneja ambos flujos:
 * 1. Login con email/password (tradicional) → se maneja en el formulario de login
 * 2. Login social (Google, etc.) → se maneja aquí tras el redirect de Auth0
 *
 * Tras el redirect de Auth0, obtiene los tokens del SDK y los envía al backend
 * vía POST /api/auth/social-login para validación y enriquecimiento del usuario.
 * El backend devuelve la misma LoginResponse que /api/auth/login.
 *
 * PROTECCIÓN ANTI-LOOP: Usa un ref para evitar reintentos infinitos si
 * getAccessTokenSilently() falla repetidamente (ej: social login sin refresh token).
 */
export function useAuthFlow() {
  const {
    isAuthenticated,
    user: auth0User,
    isLoading,
    getAccessTokenSilently,
    getIdTokenClaims,
    logout: auth0Logout,
  } = useAuth0();
  const { user: storeUser, setTokens, setLoading, clearAuth } = useAuthStore();

  // Guard: previene loops infinitos de sync
  const syncAttemptedRef = useRef(false);

  // Resetear el flag cuando Auth0 reporta no-autenticado (ej: logout real)
  useEffect(() => {
    if (!isAuthenticated) {
      syncAttemptedRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // No hacer nada si:
    // 1. Auth0 está cargando
    // 2. No está autenticado en Auth0
    // 3. Ya tiene usuario en el store (ya procesado)
    if (isLoading || !isAuthenticated || !auth0User || storeUser) {
      return;
    }

    // PROTECCIÓN ANTI-LOOP: solo intentar sync una vez por sesión de Auth0
    if (syncAttemptedRef.current) {
      return;
    }
    syncAttemptedRef.current = true;

    // Marcar loading mientras sincronizamos con backend
    setLoading(true);

    const syncSocialLogin = async () => {
      try {
        // 1. Obtener id_token (siempre disponible tras el callback, sin network)
        const idTokenClaims = await getIdTokenClaims();
        const idToken = idTokenClaims?.__raw;

        if (!idToken) {
          throw new Error('No se pudo obtener el id_token de Auth0');
        }

        // 2. Obtener access_token con strategy de fallback
        //    El scope real devuelto por Auth0 puede no incluir offline_access,
        //    provocando un cache miss si se busca con el scope completo del Provider.
        let accessToken: string | undefined;

        // Intento 1: scope reducido (sin offline_access) — más probable de coincidir con cache
        try {
          accessToken = await getAccessTokenSilently({
            authorizationParams: {
              scope: 'openid profile email',
            },
          });
        } catch {
          // Intento 2: sin parámetros (usa defaults del Provider)
          try {
            accessToken = await getAccessTokenSilently();
          } catch {
            console.warn('⚠️ getAccessTokenSilently falló en ambos intentos');
          }
        }

        if (!accessToken) {
          throw new Error('No se pudo obtener el access_token de Auth0');
        }

        // 3. Enviar tokens al backend para validación y obtener LoginResponse
        const loginResponse = await socialLoginWithBackend({
          access_token: accessToken,
          id_token: idToken,
        });

        // 4. Guardar en store (misma estructura que login tradicional)
        setTokens(loginResponse);

        console.log('✅ useAuthFlow: Social login completado:', {
          email: loginResponse.user.email,
          nombre: loginResponse.user.nombre,
          plan: loginResponse.user.plan,
          perfilCompleto: loginResponse.user.perfilCompleto,
        });
      } catch (error) {
        console.error('❌ Error en social login flow:', error);
        // Limpiar auth store para evitar estado inconsistente
        clearAuth();
        // Limpiar sesión de Auth0 SDK sin redirigir (evita isSyncing=true permanente)
        try {
          await auth0Logout({ openUrl: false });
        } catch {
          // Ignorar errores de logout silencioso
        }
      } finally {
        setLoading(false);
      }
    };

    syncSocialLogin();
  }, [
    isAuthenticated,
    auth0User,
    isLoading,
    storeUser,
    getAccessTokenSilently,
    getIdTokenClaims,
    setTokens,
    setLoading,
    clearAuth,
    auth0Logout,
  ]);
}
