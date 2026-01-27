import { useEffect } from 'react';
import { useAuth0 as useAuth0Real } from '@auth0/auth0-react';
import { useAuthStore } from '@/store/auth.store';

/**
 * Hook que sincroniza el estado de Auth0 con Zustand store
 * Ejecutar dentro del Auth0Provider
 */
export function useSyncAuth0ToStore() {
  const { isAuthenticated, user, getAccessTokenSilently, isLoading } = useAuth0Real();
  const { setTokens, clearAuth, user: storeUser } = useAuthStore();

  useEffect(() => {
    const syncTokens = async () => {
      // Si Auth0 dice que está autenticado pero el store está vacío, sincronizar
      if (isAuthenticated && user && !storeUser) {
        try {
          // Obtener tokens de Auth0
          const accessToken = await getAccessTokenSilently();
          
          // Calcular expiración (Auth0 tokens suelen durar 24h)
          const expiresIn = 86400; // 24 horas por defecto
          
          // Sincronizar con el store
          setTokens({
            access_token: accessToken,
            id_token: '', // Auth0 no expone id_token directamente en el cliente
            expires_in: expiresIn,
            token_type: 'Bearer',
            refresh_token: '', // Manejado por Auth0 internamente
            user: user as any
          });
          
          console.log('✅ Tokens sincronizados de Auth0 a Zustand store');
        } catch (error) {
          console.error('❌ Error sincronizando tokens:', error);
        }
      }
      
      // Si Auth0 dice que NO está autenticado pero el store tiene datos, limpiar
      if (!isAuthenticated && !isLoading && storeUser) {
        clearAuth();
        console.log('🧹 Store limpiado porque Auth0 no está autenticado');
      }
    };

    if (!isLoading) {
      syncTokens();
    }
  }, [isAuthenticated, user, isLoading, getAccessTokenSilently, setTokens, clearAuth, storeUser]);
}
