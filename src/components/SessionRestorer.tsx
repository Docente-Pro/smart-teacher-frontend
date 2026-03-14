import { useEffect, useState } from 'react';
import { useCustomAuth } from '@/providers/CustomAuth0Provider';
import { useNavigate, useLocation } from 'react-router';

/**
 * SessionRestorer
 * 
 * Componente que intenta restaurar la sesión al cargar la aplicación
 * si existe un refresh_token guardado en localStorage.
 * 
 * Uso:
 * - Agregar como hijo directo del Auth0Provider
 * - Se ejecuta automáticamente al cargar la app
 */
export function SessionRestorer({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, refreshSession } = useCustomAuth();
  const [isRestoring, setIsRestoring] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const restoreSession = async () => {
      // No hacer nada si ya está autenticado
      if (isAuthenticated) {
        setIsRestoring(false);
        return;
      }

      // No hacer nada si Auth0 está cargando
      if (isLoading) {
        return;
      }

      // Intentar restaurar sesión con refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          await refreshSession(refreshToken);
        } catch (error: any) {
          console.error('❌ Error al restaurar sesión:', error);
          
          // Si el error indica requiresReauth, no hacer nada más
          // porque handleSessionExpiration ya se encargó de todo
          if (error.message === 'REQUIRES_REAUTH' || error.requiresReauth) {
            // Ya se limpió y redirigió en handleSessionExpiration
            return;
          }
          
          // Para otros errores, limpiar refresh token inválido
          localStorage.removeItem('refresh_token');
          
          // Redirigir a login solo si estamos en una ruta protegida
          const publicRoutes = ['/login', '/signup', '/', '/landing'];
          if (!publicRoutes.includes(location.pathname)) {
            navigate('/login');
          }
        }
      }

      setIsRestoring(false);
    };

    restoreSession();
  }, [isAuthenticated, isLoading, refreshSession, navigate, location.pathname]);

  // Mostrar loading mientras se restaura la sesión
  if (isRestoring || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Restaurando sesión...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
