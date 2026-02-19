import ReusableModal from "@/components/Shared/Modal/ReusableModal";
import { Button } from "@/components/ui/button";
import { Clock, MessageCircle, Sparkles } from "lucide-react";
import { usePaymentSocket } from "@/hooks/usePaymentSocket";
import { useEffect } from "react";
import { useNavigate } from "react-router";

interface RenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal que se muestra cuando la suscripción del usuario expira.
 * Evento: `suscripcion:expirada` (action: "show-renewal")
 *
 * Ofrece renovar contactando por WhatsApp (mismo flujo de pago).
 */
function RenewalModal({ isOpen, onClose }: RenewalModalProps) {
  const navigate = useNavigate();
  const { status, startPaymentFlow, reset } = usePaymentSocket();

  // Si el pago se confirma, redirigir al dashboard
  useEffect(() => {
    if (status === "activated") {
      const timer = setTimeout(() => {
        reset();
        onClose();
        navigate("/dashboard");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [status, navigate, onClose, reset]);

  function handleRenew() {
    startPaymentFlow();
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      gradient="amber-orange"
      showCloseButton={status !== "loading"}
      closeOnOverlayClick={status !== "loading" && status !== "waiting"}
    >
      {(status === "idle" || status === "error") && (
        <div className="flex flex-col items-center text-center px-2 py-6">
          {/* Icono */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-5">
            <Clock className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Tu suscripción ha vencido
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
            Tu plan Premium ha expirado. Renueva ahora para seguir creando
            Unidades de Aprendizaje con IA.
          </p>

          {/* Beneficios rápidos */}
          <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No pierdas acceso a:
              </span>
            </div>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400 ml-6 list-disc">
              <li>Unidades de Aprendizaje con IA</li>
              <li>Planificador de sesiones</li>
              <li>Exportación PDF profesional</li>
            </ul>
          </div>

          {status === "error" && (
            <p className="text-xs text-red-500 mb-3">
              No se pudo procesar. Intenta nuevamente.
            </p>
          )}

          {/* Botones */}
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={handleRenew}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/25"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Renovar por WhatsApp
            </Button>
            <Button
              onClick={handleClose}
              variant="ghost"
              className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              Más tarde
            </Button>
          </div>
        </div>
      )}

      {status === "loading" && (
        <div className="flex flex-col items-center text-center px-2 py-12">
          <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Preparando tu renovación...
          </p>
        </div>
      )}

      {status === "waiting" && (
        <div className="flex flex-col items-center text-center px-2 py-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-amber-400/20 animate-ping" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Esperando confirmación
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            Completa el pago en WhatsApp y tu plan se renovará al instante.
          </p>
        </div>
      )}

      {status === "activated" && (
        <div className="flex flex-col items-center text-center px-2 py-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            ¡Plan renovado!
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Redirigiendo al dashboard...
          </p>
        </div>
      )}
    </ReusableModal>
  );
}

export default RenewalModal;
