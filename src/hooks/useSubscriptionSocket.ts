import { useEffect, useCallback, useRef, useState } from "react";
import {
  conectarSocket,
  onSocketEvent,
  joinUserRoom,
  desconectarSocket,
} from "@/services/socket.service";
import { useAuthStore } from "@/store/auth.store";
import { useNavigate } from "react-router";
import { toast } from "sonner";

// ============================================
// HOOK GLOBAL — Escucha eventos de suscripción por WebSocket
//
// Eventos:
//   • pago:confirmado       → Plan activado, redirigir al dashboard
//   • suscripcion:revocada  → Admin revocó, forzar logout
//   • suscripcion:expirada  → Venció, mostrar modal de renovación
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
  const navigate = useNavigate();

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
        console.warn("⚠️ [SubscriptionSocket] Suscripción revocada:", payload);

        // Mostrar alerta con el motivo
        toast.error(payload.message || "Tu suscripción ha sido revocada.", {
          duration: 6000,
        });

        // Limpiar auth store y redirigir al login
        setTimeout(() => {
          clearAuth();
          desconectarSocket();
          navigate("/login", { replace: true });
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

    cleanupsRef.current = cleanups;
    setIsListening(true);

    // Cleanup al desmontar o si cambian las dependencias
    return () => {
      cleanups.forEach((fn) => fn());
      cleanupsRef.current = [];
      setIsListening(false);
    };
  }, [isAuthenticated, user?.id, updateUser, clearAuth, navigate]);

  return {
    isListening,
    showRenewalModal,
    dismissRenewalModal,
  };
}
