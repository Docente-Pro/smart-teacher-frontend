import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { refreshAccessToken } from "@/services/backendAuth.service";

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
        console.log('🔄 Token expirado, intentando refrescar...');
        
        try {
          // Intentar refrescar el token
          const newTokens = await refreshAccessToken(refreshToken);
          setTokens(newTokens);
          console.log('✅ Sesión restaurada correctamente');
        } catch (error) {
          console.error('❌ Error al refrescar token, cerrando sesión:', error);
          clearAuth();
        }
      } else if (isAuthenticated) {
        console.log('✅ Sesión activa restaurada desde localStorage');
      }
    };

    checkAndRestoreSession();
  }, []); // Solo ejecutar una vez al montar

  return { isAuthenticated };
};
