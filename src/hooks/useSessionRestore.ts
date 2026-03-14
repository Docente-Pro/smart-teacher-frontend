import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { refreshAccessToken } from "@/services/backendAuth.service";
import { handleSessionExpiration } from "@/utils/auth-helpers";

/**
 * Hook que verifica si el usuario tiene una sesión válida
 * y la restaura/refresca automáticamente si es necesario
 */
export const useSessionRestore = () => {
  const { isAuthenticated, expiresAt, refreshToken, setTokens, clearAuth } = useAuthStore();

  useEffect(() => {
    const checkAndRestoreSession = async () => {
      // Si no está autenticado, no hay nada que restaurar
      if (!isAuthenticated) {
        return;
      }

      // Verificar si el token ha expirado
      const now = Date.now();
      const hasExpired = expiresAt && expiresAt < now;

      if (hasExpired && refreshToken) {
        
        try {
          // Intentar refrescar el token
          const newTokens = await refreshAccessToken(refreshToken);
          // Adaptar RefreshTokenResponse a lo que espera setTokens
          setTokens({
            access_token: newTokens.access_token,
            id_token: newTokens.id_token,
            expires_in: newTokens.expires_in,
            token_type: newTokens.token_type,
            refresh_token: refreshToken,
            user: {} as any // Usuario ya existe en el store
          });
        } catch (error: any) {
          console.error('❌ Error al refrescar token:', error);
          
          // Si el error indica que se requiere reautenticación, limpiar todo y redirigir
          if (error.message === 'REQUIRES_REAUTH' || error.requiresReauth) {
            handleSessionExpiration();
          } else {
            // Para otros errores, solo limpiar auth
            clearAuth();
          }
        }
      } else if (isAuthenticated) {
        // Sesión restaurada desde localStorage
      }
    };

    checkAndRestoreSession();
  }, []); // Solo ejecutar una vez al montar

  return { isAuthenticated };
};
