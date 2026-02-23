import { useEffect, useCallback, useRef, useState } from "react";
import {
  conectarSocket,
  onSocketEvent,
  joinUserRoom,
  desconectarSocket,
} from "@/services/socket.service";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

// ============================================
// HOOK GLOBAL — Escucha eventos de suscripción por WebSocket
//
// Eventos:
//   • pago:confirmado       → Plan activado, redirigir al dashboard
//   • pago:rechazado        → Admin rechazó pago, notificar
//   • suscripcion:revocada  → Admin revocó, forzar logout
//   • suscripcion:expirada  → Venció, mostrar modal de renovación
//   • usuario:reseteado     → Admin reseteó cuenta, force-logout
// ============================================

interface UseSubscriptionSocketReturn {
  /** true cuando el socket está conectado y escuchando */
  isListening: boolean;
  /** true cuando se debe mostrar el modal de renovación */
  showRenewalModal: boolean;
  /** Cierra el modal de renovación */
  dismissRenewalModal: () => void;
}

/**
 * Hook que se monta a nivel global (App) para escuchar eventos
 * del ciclo de vida de la suscripción en tiempo real.
 *
 * Solo se activa si el usuario está autenticado.
 */
export function useSubscriptionSocket(): UseSubscriptionSocketReturn {
  const [isListening, setIsListening] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const cleanupsRef = useRef<(() => void)[]>([]);
  /** Guard: evita procesar múltiples force-logout simultáneos */
  const forceLogoutRef = useRef(false);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateUser = useAuthStore((s) => s.updateUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const dismissRenewalModal = useCallback(() => {
    setShowRenewalModal(false);
  }, []);

  useEffect(() => {
    // Solo conectar si el usuario está autenticado y tiene ID
    if (!isAuthenticated || !user?.id) {
      setIsListening(false);
      return;
    }

    // Conectar socket y unirse a la sala del usuario
    conectarSocket();
    joinUserRoom(user.id);

    const cleanups: (() => void)[] = [];

    // ─── 1. pago:confirmado → Plan activado ───
    cleanups.push(
      onSocketEvent("pago:confirmado", (payload) => {
        console.log("✅ [SubscriptionSocket] Pago confirmado:", payload);

        updateUser({
          plan: (payload.plan as import("@/interfaces/IAuth").PlanType) || "premium_mensual",
          suscripcionActiva: true,
        });

        toast.success("¡Plan Premium activado!", {
          description: "Ya puedes crear Unidades de Aprendizaje con IA.",
          duration: 5000,
        });
      })
    );

    // ─── 2. suscripcion:revocada → Forzar logout ───
    cleanups.push(
      onSocketEvent("suscripcion:revocada", (payload) => {
        // Guard: ignorar si ya hay un force-logout en progreso
        if (forceLogoutRef.current) return;
        forceLogoutRef.current = true;

        console.warn("⚠️ [SubscriptionSocket] Suscripción revocada:", payload);

        toast.error(payload.message || "Tu suscripción ha sido revocada.", {
          duration: 6000,
        });

        // Limpiar estado y hacer hard redirect para evitar conflictos DOM
        setTimeout(() => {
          clearAuth();
          desconectarSocket();
          window.location.href = "/login";
        }, 1500);
      })
    );

    // ─── 3. suscripcion:expirada → Mostrar modal de renovación ───
    cleanups.push(
      onSocketEvent("suscripcion:expirada", (payload) => {
        console.info("ℹ️ [SubscriptionSocket] Suscripción expirada:", payload);

        // Actualizar store: ya no es premium
        updateUser({
          suscripcionActiva: false,
        });

        setShowRenewalModal(true);
      })
    );

    // ─── 4. pago:rechazado → Notificar al usuario ───
    cleanups.push(
      onSocketEvent("pago:rechazado", (payload) => {
        console.warn("❌ [SubscriptionSocket] Pago rechazado:", payload);

        toast.error("Tu pago fue rechazado", {
          description: payload.motivoRechazo || "Contacta al administrador para más detalles.",
          duration: 8000,
        });
      })
    );

    // ─── 5. usuario:reseteado → Force-logout ───
    cleanups.push(
      onSocketEvent("usuario:reseteado", (payload) => {
        // Guard: ignorar si ya hay un force-logout en progreso
        if (forceLogoutRef.current) return;
        forceLogoutRef.current = true;

        console.warn("🔄 [SubscriptionSocket] Usuario reseteado:", payload);

        toast.error(payload.message || "Tu cuenta ha sido reseteada por un administrador.", {
          duration: 6000,
        });

        // Limpiar estado y hacer hard redirect para evitar conflictos DOM
        setTimeout(() => {
          clearAuth();
          desconectarSocket();
          window.location.href = "/login";
        }, 1500);
      })
    );

    cleanupsRef.current = cleanups;
    setIsListening(true);

    // Cleanup al desmontar o si cambian las dependencias
    return () => {
      cleanups.forEach((fn) => fn());
      cleanupsRef.current = [];
      forceLogoutRef.current = false;
      setIsListening(false);
    };
  }, [isAuthenticated, user?.id, updateUser, clearAuth]);

  return {
    isListening,
    showRenewalModal,
    dismissRenewalModal,
  };
}
