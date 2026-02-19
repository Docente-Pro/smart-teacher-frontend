import { useMemo } from "react";
import { useAuthStore } from "@/store/auth.store";
import type { PlanType, EnrichedUser } from "@/interfaces/IAuth";

// ============================================
// TIPOS DE PERMISOS / ROLES
// ============================================

/**
 * Roles dentro de una unidad
 * - PROPIETARIO: Puede crear unidades + crear sesiones
 * - SUSCRIPTOR:  Solo puede crear sesiones (con límite)
 */
export type RolUnidad = "PROPIETARIO" | "SUSCRIPTOR";

/**
 * Permisos derivados del plan y rol del usuario
 */
export interface UserPermissions {
  /** El usuario tiene un plan premium (mensual o anual) activo */
  isPremium: boolean;
  /** El usuario tiene suscripción activa (no expirada) */
  isSuscripcionActiva: boolean;
  /** Plan actual del usuario */
  plan: PlanType;
  /** Nombre del plan legible */
  planLabel: string;

  // ─── Permisos de acción ───
  /** Puede crear unidades de aprendizaje (requiere premium) */
  canCreateUnidad: boolean;
  /** Puede crear sesiones de aprendizaje */
  canCreateSesion: boolean;
  /** Tiene sesiones restantes disponibles */
  hasSesionesDisponibles: boolean;
  /** Número de sesiones restantes */
  sesionesRestantes: number;
  /** Número de sesiones usadas */
  sesionesUsadas: number;

  // ─── Rol dentro de unidad ───
  /** Roles del JWT (del namespace de Auth0) */
  roles: string[];
  /** Si el usuario tiene algún rol asignado */
  hasRole: boolean;
}

// ============================================
// FUNCIONES PURAS DE VALIDACIÓN
// ============================================

/**
 * Verifica si un plan es premium
 */
export function checkIsPremium(plan?: PlanType): boolean {
  return plan === "premium_mensual" || plan === "premium_anual";
}

/**
 * Obtiene el label del plan
 */
export function getPlanLabel(plan?: PlanType): string {
  switch (plan) {
    case "free":
      return "Free";
    case "premium_mensual":
      return "Premium Mensual";
    case "premium_anual":
      return "Premium Anual";
    default:
      return "Free";
  }
}

/**
 * Calcula permisos a partir del usuario enriquecido.
 * Es una función PURA — no accede al store ni localStorage.
 */
export function computePermissions(user: EnrichedUser | null): UserPermissions {
  const plan: PlanType = user?.plan ?? "free";
  const isPremium = checkIsPremium(plan);
  const isSuscripcionActiva = user?.suscripcionActiva === true;
  const sesionesRestantes = user?.sesionesRestantes ?? 0;
  const sesionesUsadas = user?.sesionesUsadas ?? 0;
  const roles = user?.["https://docente-pro.com/roles"] ?? [];

  return {
    isPremium,
    isSuscripcionActiva,
    plan,
    planLabel: getPlanLabel(plan),

    // Para crear unidad: necesita premium + suscripción activa
    canCreateUnidad: isPremium && isSuscripcionActiva,
    // Para crear sesión: necesita sesiones restantes (free o premium)
    canCreateSesion: sesionesRestantes > 0,
    hasSesionesDisponibles: sesionesRestantes > 0,
    sesionesRestantes,
    sesionesUsadas,

    roles,
    hasRole: roles.length > 0,
  };
}

// ============================================
// HOOK
// ============================================

/**
 * Hook que devuelve los permisos del usuario actual.
 *
 * Usa los datos del store (auth.store) que vienen del backend,
 * NO del localStorage directamente. Así, aunque alguien edite
 * el localStorage, las acciones protegidas siguen validándose
 * contra el backend (el interceptor de 401 en instance.ts
 * cierra sesión si el token es inválido).
 *
 * @example
 * ```tsx
 * const { canCreateUnidad, isPremium, planLabel } = usePermissions();
 *
 * if (!canCreateUnidad) {
 *   setShowUpgradeModal(true);
 * }
 * ```
 */
export function usePermissions(): UserPermissions {
  const user = useAuthStore((s) => s.user);
  return useMemo(() => computePermissions(user), [user]);
}
