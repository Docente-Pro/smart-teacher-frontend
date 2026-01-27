import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  EnrichedUser, 
  LoginResponse,
} from "@/interfaces/IAuth";

/**
 * Estado del store de autenticación
 */
interface AuthState {
  // State
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: EnrichedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setTokens: (tokens: LoginResponse) => void;
  updateUser: (userData: Partial<EnrichedUser>) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Decodifica un JWT sin verificar (solo para extraer información)
 */
function parseJwt(token: string): EnrichedUser | null {
  try {
    if (!token || typeof token !== "string") {
      return null;
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error parsing JWT:", error);
    return null;
  }
}

/**
 * Store de autenticación con Zustand
 * Maneja el estado de autenticación de forma simple y confiable
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      idToken: null,
      refreshToken: null,
      expiresAt: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setTokens: (tokens) => {
        const expiresAt = Date.now() + tokens.expires_in * 1000;

        // Si ya viene el usuario del backend, convertirlo a EnrichedUser
        if (tokens.user && tokens.user.id) {
          console.log('💾 Seteando usuario del backend:', tokens.user);
          
          // Crear EnrichedUser desde UserData
          const enrichedUser: EnrichedUser = {
            // Campos requeridos de JWT (usamos valores dummy ya que Auth0 los maneja)
            sub: tokens.user.id,
            email: tokens.user.email,
            name: tokens.user.nombre, // Convertir 'nombre' a 'name'
            exp: Math.floor(Date.now() / 1000) + 86400,
            iat: Math.floor(Date.now() / 1000),
            // Campos adicionales del backend
            id: tokens.user.id,
            perfilCompleto: tokens.user.perfilCompleto,
            plan: tokens.user.plan,
            suscripcionActiva: tokens.user.suscripcionActiva,
            sesionesUsadas: tokens.user.sesionesUsadas,
            sesionesRestantes: tokens.user.sesionesRestantes,
            problematicaCompleta: tokens.user.problematicaCompleta,
          };
          
          set({
            accessToken: tokens.access_token,
            idToken: tokens.id_token,
            refreshToken: tokens.refresh_token,
            expiresAt,
            user: enrichedUser,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }

        // Si no, decodificar del JWT (login tradicional)
        const decodedUser = parseJwt(tokens.id_token);

        // Combinar datos del JWT con datos adicionales del backend
        // Los datos del backend tienen PRIORIDAD sobre el JWT
        const enrichedUser: EnrichedUser | null = decodedUser
          ? {
              // Primero datos del JWT
              sub: decodedUser.sub,
              email: decodedUser.email,
              name: tokens.user?.nombre || decodedUser.name, // Prioridad al backend
              picture: decodedUser.picture,
              "https://docente-pro.com/roles": decodedUser["https://docente-pro.com/roles"],
              exp: decodedUser.exp,
              iat: decodedUser.iat,
              // Luego datos del backend
              id: tokens.user?.id,
              perfilCompleto: tokens.user?.perfilCompleto,
              plan: tokens.user?.plan,
              suscripcionActiva: tokens.user?.suscripcionActiva,
              sesionesUsadas: tokens.user?.sesionesUsadas,
              sesionesRestantes: tokens.user?.sesionesRestantes,
              problematicaCompleta: tokens.user?.problematicaCompleta,
            }
          : null;

        set({
          accessToken: tokens.access_token,
          idToken: tokens.id_token,
          refreshToken: tokens.refresh_token || null,
          expiresAt,
          user: enrichedUser,
          isAuthenticated: true,
        });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
        console.log("🔄 Usuario actualizado:", userData);
      },

      clearAuth: () => {
        set({
          accessToken: null,
          idToken: null,
          refreshToken: null,
          expiresAt: null,
          user: null,
          isAuthenticated: false,
        });
        localStorage.removeItem("refresh_token");
        console.log("🧹 Auth state limpiado");
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        // Persistir todos los datos necesarios para restaurar la sesión
        refreshToken: state.refreshToken,
        accessToken: state.accessToken,
        idToken: state.idToken,
        expiresAt: state.expiresAt,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ============================================
// SELECTORES - Para usar con las utilidades
// ============================================

/**
 * Selector: Verifica si el token ha expirado
 */
export const selectIsTokenExpired = (state: AuthState): boolean => {
  if (!state.expiresAt) return true;
  return Date.now() >= state.expiresAt;
};
