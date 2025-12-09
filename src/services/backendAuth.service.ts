import { instance } from './instance';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  LogoutResponse,
  ErrorResponse,
} from '@/interfaces/IAuth';

// ============================================
// SERVICIOS DE AUTENTICACIÓN
// ============================================

/**
 * POST /api/auth/login
 * Autentica al usuario con Auth0 a través del backend
 * 
 * Status codes posibles:
 * - 200: Login exitoso
 * - 400: Email/password faltantes o formato inválido
 * - 401: Credenciales inválidas
 * - 429: Demasiados intentos (5/minuto)
 * - 500: Error del servidor
 */
export const loginWithBackend = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await instance.post<LoginResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });

    console.log('🔐 Respuesta del backend:', response.data);

    // Validar que la respuesta tenga los campos necesarios
    if (!response.data.access_token || !response.data.id_token) {
      console.error('❌ Respuesta del backend incompleta:', response.data);
      throw new Error('El backend no devolvió los tokens necesarios (access_token, id_token)');
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ Error en login:', error);
    
    const errorData: ErrorResponse = error.response?.data;
    throw new Error(
      errorData?.message || 
      errorData?.error || 
      'Error al iniciar sesión'
    );
  }
};

/**
 * POST /api/auth/logout
 * Cierra la sesión del usuario
 * 
 * Status codes posibles:
 * - 200: Logout exitoso
 */
export const logoutWithBackend = async (): Promise<LogoutResponse> => {
  try {
    const response = await instance.post<LogoutResponse>('/auth/logout');
    return response.data;
  } catch (error: any) {
    console.error('Error en logout:', error);
    // Devolver respuesta por defecto si falla
    return {
      message: 'Sesión cerrada localmente',
      note: 'El servidor no pudo ser contactado'
    };
  }
};

/**
 * POST /api/auth/refresh
 * Renueva el access token usando el refresh token
 * 
 * Status codes posibles:
 * - 200: Refresh exitoso
 * - 400: refresh_token faltante
 * - 401: Refresh token inválido o expirado
 */
export const refreshAccessToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  try {
    const response = await instance.post<RefreshTokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error al refrescar token:', error);
    
    const errorData: ErrorResponse = error.response?.data;
    throw new Error(
      errorData?.message || 
      'Error al refrescar la sesión'
    );
  }
};
