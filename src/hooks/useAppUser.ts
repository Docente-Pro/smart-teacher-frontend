import { useEffect } from "react";
import { useUserStore } from "@/store/user.store";
import { useAuth0 } from "@/hooks/useAuth0";

/**
 * Hook personalizado para trabajar con el usuario de la aplicación
 * Combina el usuario de Auth0 con el usuario de la BD
 * 
 * @param autoFetch - Si debe cargar automáticamente el usuario al montar (default: false)
 */
export function useAppUser(autoFetch: boolean = false) {
  const { user: auth0User } = useAuth0();
  const { user, fetchUsuario, updateUsuario, isLoading, error, clearUsuario } = useUserStore();

  // Auto-fetch si está habilitado y hay un usuario Auth0
  useEffect(() => {
    if (autoFetch && auth0User?.id && !user.id) {
      fetchUsuario(auth0User.id);
    }
  }, [autoFetch, auth0User?.id, user.id]);

  /**
   * Recargar datos del usuario desde el backend
   */
  const refetchUser = async () => {
    if (auth0User?.id) {
      await fetchUsuario(auth0User.id);
    }
  };

  /**
   * Verificar si el usuario tiene datos cargados
   */
  const isUserLoaded = !!user.id;

  /**
   * Verificar si el usuario tiene perfil completo
   */
  const isProfileComplete = !!(
    user.nombre &&
    user.email &&
    user.nombreInstitucion &&
    user.nivelId &&
    user.gradoId
  );

  /**
   * Verificar si el usuario tiene problemática seleccionada
   */
  const hasProblematica = !!(user.problematicaId || user.problematica);

  return {
    // Usuarios
    auth0User,      // Usuario de Auth0 (autenticación, tokens, permisos)
    user,           // Usuario de BD (datos de aplicación)
    
    // Estados
    isLoading,
    error,
    isUserLoaded,
    isProfileComplete,
    hasProblematica,
    
    // Acciones
    fetchUsuario: refetchUser,
    updateUsuario,
    clearUsuario,
  };
}
