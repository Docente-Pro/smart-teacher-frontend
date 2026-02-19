import { useNavigate } from "react-router";
import { useEffect } from "react";
import ReusableModal from "@/components/Shared/Modal/ReusableModal";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Check, Lock, MessageCircle, Loader2, PartyPopper, Rocket, AlertCircle } from "lucide-react";
import { usePaymentSocket, type PaymentStatus } from "@/hooks/usePaymentSocket";

interface UpgradePremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal que se muestra cuando un usuario free intenta acceder
 * a funcionalidad premium (crear unidad, etc.)
 *
 * Flujo:
 * 1. Muestra beneficios + botón "Contactar por WhatsApp"
 * 2. Al hacer clic → POST /api/unidad/pago/solicitar → abre whatsappLink
 * 3. UI queda "esperando" escuchando `pago:confirmado` por WebSocket
 * 4. Cuando el admin confirma → pantalla de éxito → redirige al dashboard
 */
function UpgradePremiumModal({ isOpen, onClose }: UpgradePremiumModalProps) {
  const navigate = useNavigate();
  const { status, errorMessage, startPaymentFlow, cancelWaiting, reset } = usePaymentSocket();

  const premiumFeatures = [
    "Crear Unidades de Aprendizaje con IA",
    "Planificador de sesiones de aprendizaje",
    "Exportar a PDF profesional",
    "Soporte prioritario",
  ];

  // Cuando el pago se confirma, esperar 2.5s y redirigir al dashboard
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

  // Al cerrar el modal, limpiar todo
  function handleClose() {
    if (status === "waiting") {
      cancelWaiting();
    } else {
      reset();
    }
    onClose();
  }

  function handleContactWhatsApp() {
    startPaymentFlow();
  }

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      gradient="amber-orange"
      showCloseButton={status !== "activated" && status !== "loading"}
      closeOnOverlayClick={status === "idle" || status === "error"}
    >
      {status === "idle" && <IdleView features={premiumFeatures} onContact={handleContactWhatsApp} onClose={handleClose} />}
      {status === "loading" && <LoadingView />}
      {status === "waiting" && <WaitingView onCancel={handleClose} />}
      {status === "activated" && <ActivatedView />}
      {status === "error" && <ErrorView message={errorMessage} onRetry={handleContactWhatsApp} onClose={handleClose} />}
    </ReusableModal>
  );
}

// ─── Vista inicial: beneficios + CTA WhatsApp ───

function IdleView({
  features,
  onContact,
  onClose,
}: {
  features: string[];
  onContact: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center px-2 py-4">
      {/* Icono */}
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-yellow-400 flex items-center justify-center shadow">
          <Lock className="w-3 h-3 text-amber-800" />
        </div>
      </div>

      {/* Título */}
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        Función Premium
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
        Para crear Unidades de Aprendizaje necesitas un plan Premium.
        ¡Desbloquea todo el poder de la IA para tu planificación docente!
      </p>

      {/* Features list */}
      <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Con Premium obtienes:
          </span>
        </div>
        <ul className="space-y-2.5">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Botones */}
      <div className="flex flex-col gap-2 w-full">
        <Button
          onClick={onContact}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/25 transition-all"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Contactar por WhatsApp
        </Button>
        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        >
          Quizás después
        </Button>
      </div>
    </div>
  );
}

// ─── Vista de espera: animación + escuchando socket ───

function WaitingView({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex flex-col items-center text-center px-2 py-8">
      {/* Animación de espera */}
      <div className="relative mb-6">
        {/* Pulse rings */}
        <div className="absolute inset-0 w-24 h-24 -m-2 rounded-full bg-amber-400/20 animate-ping" />
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-amber-400/10 animate-pulse" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
          <Crown className="w-10 h-10 text-white animate-bounce" style={{ animationDuration: "2s" }} />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        Esperando activación
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
        Te hemos abierto WhatsApp en otra pestaña. Completa el proceso de pago
        y tu plan se activará automáticamente aquí.
      </p>

      {/* Indicador de conexión */}
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-full px-4 py-2 mb-6">
        <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
        <span className="text-xs text-slate-600 dark:text-slate-400">
          Escuchando confirmación de pago...
        </span>
      </div>

      {/* Pasos */}
      <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
        <ol className="space-y-3">
          <WaitingStep number={1} text="Conversa con nuestro equipo en WhatsApp" done />
          <WaitingStep number={2} text="Realiza el pago indicado" />
          <WaitingStep number={3} text="Tu plan se activa al instante" />
        </ol>
      </div>

      <Button
        onClick={onCancel}
        variant="ghost"
        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
      >
        Cancelar y volver
      </Button>
    </div>
  );
}

function WaitingStep({ number, text, done }: { number: number; text: string; done?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          done
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
            : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
        }`}
      >
        {done ? <Check className="w-3.5 h-3.5" /> : number}
      </div>
      <span className={`text-sm ${done ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"}`}>
        {text}
      </span>
    </li>
  );
}

// ─── Vista de éxito: plan activado ───

function ActivatedView() {
  return (
    <div className="flex flex-col items-center text-center px-2 py-8">
      {/* Icono de éxito */}
      <div className="relative mb-6">
        <div className="absolute inset-0 w-24 h-24 -m-2 rounded-full bg-emerald-400/20 animate-ping" style={{ animationDuration: "1.5s" }} />
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
          <PartyPopper className="w-10 h-10 text-white" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        ¡Plan Premium activado!
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
        Tu suscripción Premium está activa. Ya puedes crear Unidades de
        Aprendizaje con Inteligencia Artificial.
      </p>

      <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-full px-4 py-2">
        <Rocket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          Redirigiendo al dashboard...
        </span>
      </div>
    </div>
  );
}

// ─── Vista de carga: solicitando pago al backend ───

function LoadingView() {
  return (
    <div className="flex flex-col items-center text-center px-2 py-12">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-6">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        Preparando tu solicitud...
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
        Estamos generando tu enlace de pago. Un momento por favor.
      </p>
    </div>
  );
}

// ─── Vista de error ───

function ErrorView({
  message,
  onRetry,
  onClose,
}: {
  message: string | null;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center px-2 py-8">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30 mb-6">
        <AlertCircle className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        Ocurrió un error
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
        {message || "No pudimos procesar tu solicitud. Intenta nuevamente."}
      </p>
      <div className="flex flex-col gap-2 w-full">
        <Button
          onClick={onRetry}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
        >
          Reintentar
        </Button>
        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        >
          Cerrar
        </Button>
      </div>
    </div>
  );
}

export default UpgradePremiumModal;
