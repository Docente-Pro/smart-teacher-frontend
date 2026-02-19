import { instance } from './instance';
import type {
  LoginRequest,
  LoginResponse,
  SocialLoginRequest,
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

    // Validar que la respuesta tenga los campos necesarios
    if (!response.data.access_token || !response.data.id_token) {
      console.error('❌ Respuesta del backend incompleta');
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
 * POST /api/auth/social-login
 * Autentica al usuario que inicia sesión con un proveedor social (Google)
 * Envía los tokens de Auth0 al backend para validación y enriquecimiento
 *
 * Status codes posibles:
 * - 200: Login social exitoso (usuario existente o creado automáticamente)
 * - 400: Tokens faltantes
 * - 401: Tokens inválidos
 * - 500: Error del servidor
 */
export const socialLoginWithBackend = async (
  tokens: SocialLoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await instance.post<LoginResponse>('/auth/social-login', {
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      ...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
    });

    if (!response.data.access_token || !response.data.id_token) {
      console.error('❌ Respuesta del backend incompleta (social-login)');
      throw new Error(
        'El backend no devolvió los tokens necesarios (access_token, id_token)'
      );
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ Error en social login:', error);

    const errorData: ErrorResponse = error.response?.data;
    throw new Error(
      errorData?.message || errorData?.error || 'Error al iniciar sesión con proveedor social'
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
 * - 401: Refresh token inválido o expirado (puede incluir requiresReauth: true)
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
    
    // Si el backend indica que se requiere reautenticación, lanzar un error especial
    if (error.response?.status === 401 && errorData?.requiresReauth) {
      const reauthError = new Error('REQUIRES_REAUTH');
      (reauthError as any).requiresReauth = true;
      throw reauthError;
    }
    
    throw new Error(
      errorData?.message || 
      'Error al refrescar la sesión'
    );
  }
};

/**
 * POST /api/auth/forgot-password
 * Solicita un enlace para restablecer la contraseña.
 * Siempre devuelve 200 por seguridad.
 */
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await instance.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    // Aun si el backend falla, mostramos mensaje genérico por seguridad
    return {
      message: 'Si el email está registrado, recibirás un enlace para restablecer tu contraseña.',
    };
  }
};
