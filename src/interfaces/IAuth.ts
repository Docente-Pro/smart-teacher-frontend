// ============================================
// INTERFACES PARA AUTH - COINCIDEN CON BACKEND
// ============================================

/**
 * Tipos de planes disponibles
 */
export type PlanType = 'free' | 'premium_mensual' | 'premium_anual';

/**
 * Datos del usuario desde el backend
 */
export interface UserData {
  id: string;
  email: string;
  nombre: string;
  perfilCompleto: boolean;
  problematicaCompleta: boolean;
  plan: PlanType;
  suscripcionActiva: boolean;
  sesionesUsadas: number;
  sesionesRestantes: number;
}

/**
 * Datos decodificados del JWT (id_token)
 */
export interface JWTPayload {
  sub: string; // Auth0 user ID
  email: string;
  name: string;
  picture?: string;
  'https://docente-pro.com/roles'?: string[];
  exp: number;
  iat: number;
}

/**
 * Usuario enriquecido (JWT + Backend data)
 * Esta es la interfaz que se usa en el store
 */
export interface EnrichedUser extends JWTPayload {
  // Datos adicionales del backend
  id?: string;
  perfilCompleto?: boolean;
  plan?: PlanType;
  suscripcionActiva?: boolean;
  sesionesUsadas?: number;
  sesionesRestantes?: number;
  problematicaCompleta?: boolean;
}

/**
 * Request body para login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Response del backend cuando el login es exitoso
 */
export interface LoginResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  user: UserData;
}

/**
 * Request body para refresh token
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * Response del backend cuando el refresh es exitoso
 */
export interface RefreshTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Response del backend cuando el logout es exitoso
 */
export interface LogoutResponse {
  message: string;
  note: string;
}

/**
 * Response genérica de error del backend
 */
export interface ErrorResponse {
  message: string;
  error?: string;
  required?: string[];
}

// ============================================
// ENDPOINTS DEL BACKEND (DOCUMENTACIÓN)
// ============================================

/**
 * POST /api/auth/login
 * Body: LoginRequest
 * Response: LoginResponse | ErrorResponse
 * 
 * Status codes:
 * - 200: Login exitoso
 * - 400: Email/password faltantes o formato inválido
 * - 401: Credenciales inválidas
 * - 429: Demasiados intentos (5/minuto)
 * - 500: Error del servidor
 */

/**
 * POST /api/auth/refresh
 * Body: RefreshTokenRequest
 * Response: RefreshTokenResponse | ErrorResponse
 * 
 * Status codes:
 * - 200: Refresh exitoso
 * - 400: refresh_token faltante
 * - 401: Refresh token inválido o expirado
 */

/**
 * POST /api/auth/logout
 * Body: {} (vacío)
 * Response: LogoutResponse
 * 
 * Status codes:
 * - 200: Logout exitoso
 */

// ============================================
// TYPE GUARDS Y UTILIDADES
// ============================================

/**
 * Verifica si un usuario tiene un plan premium activo
 */
export function isPremiumUser(user: EnrichedUser | null): boolean {
  if (!user) return false;
  return user.plan !== 'free' && user.suscripcionActiva === true;
}

/**
 * Verifica si un usuario tiene perfil completo
 */
export function hasCompleteProfile(user: EnrichedUser | null): boolean {
  if (!user) return false;
  return user.perfilCompleto === true;
}

/**
 * Verifica si un usuario tiene problemática completa
 */
export function hasCompleteProblematica(user: EnrichedUser | null): boolean {
  if (!user) return false;
  return user.problematicaCompleta === true;
}

/**
 * Obtiene el número de sesiones restantes del usuario
 */
export function getRemainingSessions(user: EnrichedUser | null): number {
  if (!user) return 0;
  return user.sesionesRestantes ?? 0;
}

/**
 * Verifica si el usuario puede crear más sesiones
 */
export function canCreateSession(user: EnrichedUser | null): boolean {
  return getRemainingSessions(user) > 0;
}

/**
 * Obtiene el nombre del plan en formato legible
 */
export function getPlanDisplayName(plan: PlanType | undefined): string {
  switch (plan) {
    case 'free':
      return 'Gratuito';
    case 'premium_mensual':
      return 'Premium Mensual';
    case 'premium_anual':
      return 'Premium Anual';
    default:
      return 'Sin plan';
  }
}
