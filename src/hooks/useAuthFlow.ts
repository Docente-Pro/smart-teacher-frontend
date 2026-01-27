import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthStore } from '@/store/auth.store';
import { getUsuarioByEmail, createNewUsuario } from '@/services/usuarios.service';

/**
 * Hook principal de autenticación - Maneja ambos flujos:
 * 1. Login con email/password (tradicional)
 * 2. Login social (Google, etc.)
 * 
 * Responsabilidades:
 * - Detectar login social y sincronizar con backend
 * - Mantener un solo estado de usuario en el store
 */
export function useAuthFlow() {
  const { isAuthenticated, user: auth0User, isLoading, getAccessTokenSilently } = useAuth0();
  const { user: storeUser, setTokens } = useAuthStore();

  useEffect(() => {
    // No hacer nada si:
    // 1. Auth0 está cargando
    // 2. No está autenticado
    // 3. Ya tiene usuario en el store (ya procesado)
    if (isLoading || !isAuthenticated || !auth0User || storeUser) {
      return;
    }

    const initializeUser = async () => {
      try {
        const email = auth0User.email;
        if (!email) throw new Error('Email no disponible');

        // Buscar o crear usuario en backend
        let backendUser;
        try {
          const response = await getUsuarioByEmail({ email });
          backendUser = response.data.data || response.data;
        } catch (error: any) {
          if (error.response?.status === 404) {
            // Crear nuevo usuario
            const newUser = {
              nombre: auth0User.name || email.split('@')[0],
              email,
              nombreInstitucion: "",
              nivelId: 1,
              gradoId: 1,
              problematicaId: 1,
              suscripcion: {
                fechaInicio: new Date().toISOString(),
                plan: "free",
                activa: true,
              },
            };
            const createResponse = await createNewUsuario(newUser);
            backendUser = createResponse.data.data || createResponse.data;
          } else {
            throw error;
          }
        }

        // Obtener token de Auth0
        const accessToken = await getAccessTokenSilently();

        // Guardar en store con estructura correcta de LoginResponse
        setTokens({
          access_token: accessToken,
          id_token: '',
          expires_in: 86400,
          token_type: 'Bearer',
          refresh_token: '',
          user: {
            id: backendUser.id || backendUser._id,
            email: backendUser.email,
            nombre: backendUser.nombre || auth0User.name || '',
            perfilCompleto: backendUser.perfilCompleto || false,
            problematicaCompleta: backendUser.problematicaCompleta || false,
            plan: backendUser.plan || 'free',
            suscripcionActiva: backendUser.suscripcionActiva ?? true,
            sesionesUsadas: backendUser.sesionesUsadas || 0,
            sesionesRestantes: backendUser.sesionesRestantes ?? 2,
          },
        });

        console.log('✅ useAuthFlow: Usuario guardado en store:', {
          email: backendUser.email,
          nombre: backendUser.nombre,
          perfilCompleto: backendUser.perfilCompleto,
        });
      } catch (error) {
        console.error('Error inicializando usuario:', error);
      }
    };

    initializeUser();
  }, [isAuthenticated, auth0User, isLoading, storeUser, getAccessTokenSilently, setTokens]);
}
