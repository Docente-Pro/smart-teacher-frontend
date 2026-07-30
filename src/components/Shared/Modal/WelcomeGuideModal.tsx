import ReusableModal from "@/components/Shared/Modal/ReusableModal";
import { BookOpen } from "lucide-react";

const WELCOME_FLAG = "docentepro_welcome_guide_shown";

interface WelcomeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Inicio rápido: tema automático y directo al cuestionario */
  onQuickStart: () => void;
  /** Abre el selector de tema personalizado */
  onChooseTheme: () => void;
}

/**
 * Modal de guía de bienvenida que se muestra UNA SOLA VEZ
 * a los usuarios free después de completar el onboarding.
 */
function WelcomeGuideModal({
  isOpen,
  onClose,
  onQuickStart,
  onChooseTheme,
}: WelcomeGuideModalProps) {
  function markSeen() {
    localStorage.setItem(WELCOME_FLAG, "true");
  }

  function handleDismiss() {
    markSeen();
    onClose();
  }

  function handleQuickStart() {
    markSeen();
    onClose();
    onQuickStart();
  }

  function handleChooseTheme() {
    markSeen();
    onClose();
    onChooseTheme();
  }

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={handleDismiss}
      size="md"
      gradient="blue-orange"
      showCloseButton
      closeOnOverlayClick={false}
    >
      <div
        className="flex flex-col items-center text-center"
        style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
      >
        <div className="mb-5 grid h-16 w-16 place-items-center rounded-[20px] bg-[#6B9FE8] text-white shadow-[0_12px_28px_rgba(107,159,232,0.28)] sm:h-20 sm:w-20">
          <BookOpen className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden="true" />
        </div>

        <h3 className="text-balance text-2xl font-extrabold tracking-[-0.02em] text-[#1F2937] sm:text-3xl">
          Tienes 2 sesiones gratis
        </h3>
        <p className="mt-3 max-w-[36ch] text-lg font-semibold leading-7 text-[#6B7280]">
          Prueba Docente Pro sin complicarte. Puedes ver tu sesión en minutos.
        </p>

        <button
          type="button"
          onClick={handleQuickStart}
          className="dp-press dp-lift dp-cta-soft-pattern mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-[20px] bg-[#FF8B5C] px-8 text-lg font-extrabold text-white shadow-[0_16px_40px_rgba(255,139,92,0.28)] hover:bg-[#F97316] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] sm:w-auto"
        >
          Probar ahora
        </button>

        <button
          type="button"
          onClick={handleChooseTheme}
          className="dp-press mt-3 inline-flex min-h-11 items-center px-4 text-base font-bold text-[#3B6CB5] hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
        >
          Prefiero elegir el tema de mi aula
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="dp-press mt-2 inline-flex min-h-11 items-center px-4 text-sm font-semibold text-[#9CA3AF] hover:text-[#6B7280] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
        >
          Ahora no
        </button>
      </div>
    </ReusableModal>
  );
}

/** Verifica si el usuario ya descartó el modal (lo vio y cerró) */
export function hasSeenWelcomeGuide(): boolean {
  return localStorage.getItem(WELCOME_FLAG) === "true";
}

export default WelcomeGuideModal;
