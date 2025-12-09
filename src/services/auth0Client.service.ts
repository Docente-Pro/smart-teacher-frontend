import { Auth0Client } from '@auth0/auth0-spa-js';

interface TokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
}

let auth0ClientInstance: Auth0Client | null = null;

/**
 * Obtiene la instancia del Auth0Client
 */
export const getAuth0Client = async (): Promise<Auth0Client> => {
  if (!auth0ClientInstance) {
    auth0ClientInstance = new Auth0Client({
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
      cacheLocation: 'memory', // No guardar en localStorage
      useRefreshTokens: false, // Manejado por el backend
    });
  }
  return auth0ClientInstance;
};

/**
 * Inyecta los tokens obtenidos del backend en el Auth0 SDK
 * Esto permite que isAuthenticated, user, etc. funcionen correctamente
 */
export const injectTokensIntoAuth0 = async (tokens: TokenResponse): Promise<void> => {
  // Validar que tenemos los tokens necesarios
  if (!tokens.access_token || !tokens.id_token) {
    throw new Error('Tokens inválidos: access_token e id_token son requeridos');
  }

  console.log('💉 Inyectando tokens en Auth0 SDK...');
  
  try {
    // Guardar tokens en localStorage con el formato que Auth0 espera
    const auth0Key = `@@auth0spajs@@::${import.meta.env.VITE_AUTH0_CLIENT_ID}::${import.meta.env.VITE_AUTH0_AUDIENCE || '@@user@@'}::openid profile email`;
    
    const cacheEntry = {
      body: {
        client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
        access_token: tokens.access_token,
        id_token: tokens.id_token,
        scope: 'openid profile email',
        expires_in: tokens.expires_in,
        token_type: tokens.token_type,
        decodedToken: {
          claims: parseJwt(tokens.id_token),
          user: parseJwt(tokens.id_token),
        },
      },
      expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
    };

    // Guardar en localStorage (Auth0 lo leerá de ahí)
    localStorage.setItem(auth0Key, JSON.stringify(cacheEntry));
    
    console.log('✅ Tokens guardados en cache de Auth0');
    
    // Forzar recarga del cliente para que lea el nuevo cache
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Error al inyectar tokens:', error);
    throw new Error('No se pudieron inyectar los tokens en Auth0 SDK');
  }
};

/**
 * Limpia la sesión del Auth0 SDK
 */
export const clearAuth0Session = async (): Promise<void> => {
  const client = await getAuth0Client();
  
  // Limpiar el cache interno
  if (typeof (client as any).cache?.clear === 'function') {
    (client as any).cache.clear();
  }
};

/**
 * Decodifica un JWT sin verificar (solo para extraer información)
 */
function parseJwt(token: string): any {
  try {
    // Validar que el token existe y tiene el formato correcto
    if (!token || typeof token !== 'string') {
      console.error('Token inválido:', token);
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Token JWT no tiene 3 partes:', token);
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}
