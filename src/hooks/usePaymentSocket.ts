import { useState, useEffect, useCallback, useRef } from "react";
import {
  conectarSocket,
  onSocketEvent,
  joinUserRoom,
  type PagoConfirmadoPayload,
} from "@/services/socket.service";
import { solicitarPagoSuscripcion } from "@/services/pago.service";
import { useAuthStore } from "@/store/auth.store";

// ============================================
// HOOK — Flujo de pago manual por WhatsApp
//
// 1. POST /api/suscripcion/pago/solicitar { plan } → { pago, whatsappLink }
// 2. Abre whatsappLink en nueva pestaña
// 3. Escucha socket "pago:confirmado"
// 4. Actualiza store → plan Premium activo
// ============================================

export type PaymentStatus = "idle" | "loading" | "waiting" | "activated" | "error";

interface UsePaymentSocketReturn {
  /** Estado actual del flujo de pago */
  status: PaymentStatus;
  /** Datos recibidos cuando el pago se confirma */
  confirmationData: PagoConfirmadoPayload | null;
  /** Mensaje de error (si status === "error") */
  errorMessage: string | null;
  /** Solicita el pago al backend → abre WhatsApp → escucha socket */
  startPaymentFlow: () => Promise<void>;
  /** Cancela la espera y vuelve a idle */
  cancelWaiting: () => void;
  /** Resetea a idle (tras navegar, etc.) */
  reset: () => void;
}

/**
 * Hook que gestiona el flujo completo de pago manual:
 *
 * 1. Usuario hace clic en "Contactar por WhatsApp"
 * 2. Se llama a `POST /api/unidad/pago/solicitar` (estado: loading)
 * 3. Con la respuesta se abre el `whatsappLink` (estado: waiting)
 * 4. El socket escucha `pago:confirmado` emitido por el admin
 * 5. Se actualiza el auth store → plan Premium (estado: activated)
 */
export function usePaymentSocket(): UsePaymentSocketReturn {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [confirmationData, setConfirmationData] = useState<PagoConfirmadoPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  /**
   * Conecta el socket y escucha `pago:confirmado`.
   */
  const subscribeToPaymentConfirmation = useCallback(() => {
    conectarSocket();

    if (user?.id) {
      joinUserRoom(user.id);
    }

    const cleanup = onSocketEvent("pago:confirmado", (payload) => {
      console.log("✅ Pago confirmado via WebSocket:", payload);

      // Activar plan Premium en el store con datos del payload
      updateUser({
        plan: (payload.plan as import("@/interfaces/IAuth").PlanType) || "premium_mensual",
        suscripcionActiva: true,
      });

      setConfirmationData(payload);
      setStatus("activated");
    });

    cleanupRef.current = cleanup;
  }, [user?.id, updateUser]);

  /**
   * Llama al backend para solicitar el pago, abre WhatsApp
   * y queda escuchando la confirmación por socket.
   */
  const startPaymentFlow = useCallback(async () => {
    try {
      setStatus("loading");
      setErrorMessage(null);

      // 1. Solicitar pago de suscripción al backend
      const response = await solicitarPagoSuscripcion("premium_mensual");
      const { whatsappLink } = response.data;

      // 2. Abrir WhatsApp con el link pre-armado
      window.open(whatsappLink, "_blank", "noopener,noreferrer");

      // 3. Conectar socket y escuchar confirmación
      subscribeToPaymentConfirmation();

      setStatus("waiting");
    } catch (error: any) {
      console.error("Error al solicitar pago:", error);
      setErrorMessage(error.message || "Error al solicitar el pago");
      setStatus("error");
    }
  }, [subscribeToPaymentConfirmation]);

  /**
   * Cancela la espera del socket.
   */
  const cancelWaiting = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setStatus("idle");
    setConfirmationData(null);
    setErrorMessage(null);
  }, []);

  /**
   * Resetea todo a idle.
   */
  const reset = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setStatus("idle");
    setConfirmationData(null);
    setErrorMessage(null);
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  return {
    status,
    confirmationData,
    errorMessage,
    startPaymentFlow,
    cancelWaiting,
    reset,
  };
}
