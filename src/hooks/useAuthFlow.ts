import { useEffect } from 'react';
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
 */
export function useAuthFlow() {
  const {
    isAuthenticated,
    user: auth0User,
    isLoading,
    getAccessTokenSilently,
    getIdTokenClaims,
  } = useAuth0();
  const { user: storeUser, setTokens, setLoading } = useAuthStore();

  useEffect(() => {
    // No hacer nada si:
    // 1. Auth0 está cargando
    // 2. No está autenticado en Auth0
    // 3. Ya tiene usuario en el store (ya procesado)
    if (isLoading || !isAuthenticated || !auth0User || storeUser) {
      return;
    }

    // Marcar loading mientras sincronizamos con backend
    setLoading(true);

    const syncSocialLogin = async () => {
      try {
        // Obtener tokens del SDK de Auth0
        const [accessToken, idTokenClaims] = await Promise.all([
          getAccessTokenSilently(),
          getIdTokenClaims(),
        ]);

        const idToken = idTokenClaims?.__raw;

        if (!accessToken || !idToken) {
          throw new Error('No se pudieron obtener los tokens de Auth0');
        }

        // Enviar tokens al backend para validación y obtener LoginResponse
        const loginResponse = await socialLoginWithBackend({
          access_token: accessToken,
          id_token: idToken,
        });

        // Guardar en store (misma estructura que login tradicional)
        setTokens(loginResponse);

        console.log('✅ useAuthFlow: Social login completado:', {
          email: loginResponse.user.email,
          nombre: loginResponse.user.nombre,
          plan: loginResponse.user.plan,
          perfilCompleto: loginResponse.user.perfilCompleto,
        });
      } catch (error) {
        console.error('❌ Error en social login flow:', error);
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
  ]);
}
