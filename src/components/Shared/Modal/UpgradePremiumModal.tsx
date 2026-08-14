import { useNavigate } from "react-router";
import { useCallback, useEffect, useState } from "react";
import ReusableModal from "@/components/Shared/Modal/ReusableModal";
import {
  Check,
  CircleCheck,
  Loader2,
  Lock,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { usePaymentSocket } from "@/hooks/usePaymentSocket";
import { SubirListaAlumnosView } from "@/components/Shared/SubirListaAlumnosView";
import { dpCtaPrimary, dpOutlineButtonClass, dpPressable } from "@/styles/dpTokens";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

interface UpgradePremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PREMIUM_FEATURES = [
  "Crear Unidades de Aprendizaje con IA",
  "Planificador de sesiones de aprendizaje",
  "Exportar a PDF profesional",
  "Soporte prioritario",
] as const;

/**
 * Modal cuando un usuario free intenta una función Premium.
 * Flujo: beneficios → WhatsApp → espera socket → éxito → subir lista (opcional).
 */
function UpgradePremiumModal({ isOpen, onClose }: UpgradePremiumModalProps) {
  const navigate = useNavigate();
  const { status, errorMessage, startPaymentFlow, cancelWaiting, reset } = usePaymentSocket();
  const [showUploadStep, setShowUploadStep] = useState(false);

  useEffect(() => {
    if (status === "activated" && !showUploadStep) {
      const timer = setTimeout(() => setShowUploadStep(true), 2200);
      return () => clearTimeout(timer);
    }
  }, [status, showUploadStep]);

  const handleUploadContinue = useCallback(() => {
    setShowUploadStep(false);
    reset();
    onClose();
    navigate("/dashboard");
  }, [navigate, onClose, reset]);

  function handleClose() {
    if (showUploadStep) {
      handleUploadContinue();
      return;
    }
    if (status === "waiting") {
      cancelWaiting();
    } else {
      reset();
    }
    onClose();
  }

  const canDismiss =
    status !== "activated" && status !== "loading" && !showUploadStep;

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      presentation="material"
      headerless
      showGradientBar={false}
      showCloseButton={canDismiss}
      closeOnOverlayClick={status === "idle" || status === "error"}
    >
      {showUploadStep ? (
        <SubirListaAlumnosView onContinue={handleUploadContinue} />
      ) : (
        <>
          {status === "idle" && (
            <IdleView
              features={PREMIUM_FEATURES}
              onContact={startPaymentFlow}
              onClose={handleClose}
            />
          )}
          {status === "loading" && <LoadingView />}
          {status === "waiting" && <WaitingView onCancel={handleClose} />}
          {status === "activated" && <ActivatedView />}
          {status === "error" && (
            <ErrorView
              message={errorMessage}
              onRetry={startPaymentFlow}
              onClose={handleClose}
            />
          )}
        </>
      )}
    </ReusableModal>
  );
}

function ModalWell({
  children,
  tone = "blue",
  className,
}: {
  children: React.ReactNode;
  tone?: "blue" | "green" | "warning" | "muted";
  className?: string;
}) {
  const tones = {
    blue: "bg-[#EAF2FC] border-[#D6E6FA]",
    green: "bg-[#E3F8EC] border-[#C6EDD8]",
    warning: "bg-[#FFF7ED] border-[#FDEAD7]",
    muted: "bg-[#F5F7FA] border-[#E6EBF2]",
  };

  return (
    <div
      className={cn(
        "rounded-[20px] border px-4 py-4 text-left",
        tones[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}

function IconWell({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "green" | "warning";
}) {
  const tones = {
    blue: "bg-[#EAF2FC] text-[#3B6CB5]",
    green: "bg-[#E3F8EC] text-[#15803D]",
    warning: "bg-[#FFF7ED] text-[#C2410C]",
  };

  return (
    <div
      className={cn(
        "grid h-14 w-14 place-items-center rounded-[18px]",
        tones[tone],
      )}
    >
      {children}
    </div>
  );
}

function IdleView({
  features,
  onContact,
  onClose,
}: {
  features: readonly string[];
  onContact: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <IconWell tone="blue">
        <Lock className="h-7 w-7" strokeWidth={2} aria-hidden />
      </IconWell>

      <h3 className="mt-5 text-xl font-extrabold tracking-[-0.02em] text-[#1F2937] text-balance">
        Función Premium
      </h3>
      <p className="mt-2 max-w-[28ch] text-base font-semibold leading-relaxed text-[#6B7280]">
        Para crear Unidades de Aprendizaje necesitas el plan Premium.
      </p>

      <ModalWell tone="muted" className="mt-6 w-full">
        <p className="mb-3 text-sm font-bold text-[#1F2937]">
          Con Premium puedes:
        </p>
        <ul className="space-y-2.5">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-left text-base font-semibold text-[#1F2937]"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-[#15803D]"
                strokeWidth={2.5}
                aria-hidden
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </ModalWell>

      <div className="mt-6 flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={onContact}
          className={cn(dpCtaPrimary, "w-full gap-2")}
        >
          <MessageCircle className="h-5 w-5" strokeWidth={2} aria-hidden />
          Continuar por WhatsApp
        </button>
        <button
          type="button"
          onClick={onClose}
          className={cn(dpOutlineButtonClass, dpPressable, "w-full")}
        >
          Quizás después
        </button>
      </div>
    </div>
  );
}

function WaitingView({ onCancel }: { onCancel: () => void }) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        {!reduced && (
          <div
            className="absolute inset-0 -m-3 rounded-[22px] bg-[#6B9FE8]/15 motion-safe:animate-pulse"
            aria-hidden
          />
        )}
        <IconWell tone="blue">
          <Loader2
            className={cn("h-7 w-7", !reduced && "motion-safe:animate-spin")}
            strokeWidth={2}
            aria-hidden
          />
        </IconWell>
      </div>

      <h3 className="mt-5 text-xl font-extrabold tracking-[-0.02em] text-[#1F2937]">
        Esperando activación
      </h3>
      <p className="mt-2 max-w-[32ch] text-base font-semibold leading-relaxed text-[#6B7280]">
        Abrimos WhatsApp en otra pestaña. Cuando completes el pago, tu plan se
        activará aquí.
      </p>

      <ModalWell tone="blue" className="mt-6 w-full">
        <ol className="space-y-3">
          <WaitingStep done text="Habla con nuestro equipo en WhatsApp" />
          <WaitingStep text="Realiza el pago indicado" />
          <WaitingStep text="Tu plan se activa al instante" />
        </ol>
      </ModalWell>

      <p className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-[#3B6CB5]">
        {!reduced && (
          <Loader2
            className="h-4 w-4 motion-safe:animate-spin"
            strokeWidth={2}
            aria-hidden
          />
        )}
        Escuchando confirmación de pago
      </p>

      <button
        type="button"
        onClick={onCancel}
        className={cn(
          dpOutlineButtonClass,
          dpPressable,
          "mt-6 w-full",
        )}
      >
        Cancelar y volver
      </button>
    </div>
  );
}

function WaitingStep({ text, done }: { text: string; done?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-full",
          done
            ? "bg-[#E3F8EC] text-[#15803D]"
            : "border-2 border-[#D6E6FA] bg-white/60",
        )}
        aria-hidden
      >
        {done && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
      </span>
      <span
        className={cn(
          "text-left text-base font-semibold",
          done ? "text-[#15803D]" : "text-[#1F2937]",
        )}
      >
        {text}
      </span>
    </li>
  );
}

function ActivatedView() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="flex flex-col items-center py-2 text-center">
      <IconWell tone="green">
        <CircleCheck className="h-7 w-7" strokeWidth={2} aria-hidden />
      </IconWell>

      <h3 className="mt-5 text-xl font-extrabold tracking-[-0.02em] text-[#1F2937]">
        Plan Premium activado
      </h3>
      <p className="mt-2 max-w-[32ch] text-base font-semibold leading-relaxed text-[#6B7280]">
        Ya puedes crear Unidades de Aprendizaje con Inteligencia Artificial.
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-full bg-[#E3F8EC] px-4 py-2.5">
        {!reduced && (
          <Loader2
            className="h-4 w-4 text-[#15803D] motion-safe:animate-spin"
            strokeWidth={2}
            aria-hidden
          />
        )}
        <span className="text-sm font-bold text-[#15803D]">
          Preparando tu espacio...
        </span>
      </div>
    </div>
  );
}

function LoadingView() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="flex flex-col items-center py-6 text-center">
      <IconWell tone="blue">
        <Loader2
          className={cn("h-7 w-7", !reduced && "motion-safe:animate-spin")}
          strokeWidth={2}
          aria-hidden
        />
      </IconWell>
      <h3 className="mt-5 text-lg font-extrabold tracking-[-0.02em] text-[#1F2937]">
        Preparando tu solicitud
      </h3>
      <p className="mt-2 max-w-[28ch] text-base font-semibold text-[#6B7280]">
        Generando tu enlace de pago. Un momento, por favor.
      </p>
    </div>
  );
}

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
    <div className="flex flex-col items-center text-center">
      <IconWell tone="warning">
        <AlertCircle className="h-7 w-7" strokeWidth={2} aria-hidden />
      </IconWell>

      <h3 className="mt-5 text-lg font-extrabold tracking-[-0.02em] text-[#1F2937]">
        No pudimos continuar
      </h3>
      <p className="mt-2 max-w-[32ch] text-base font-semibold leading-relaxed text-[#6B7280]">
        {message || "Hubo un problema al preparar tu solicitud. Intenta de nuevo."}
      </p>

      <div className="mt-6 flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={onRetry}
          className={cn(dpCtaPrimary, "w-full")}
        >
          Reintentar
        </button>
        <button
          type="button"
          onClick={onClose}
          className={cn(dpOutlineButtonClass, dpPressable, "w-full")}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default UpgradePremiumModal;
