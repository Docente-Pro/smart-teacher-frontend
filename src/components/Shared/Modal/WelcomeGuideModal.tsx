import ReusableModal from "@/components/Shared/Modal/ReusableModal";
import { Button } from "@/components/ui/button";
import { BookOpen, MousePointerClick, ListChecks, ArrowRight, Lightbulb } from "lucide-react";

const WELCOME_FLAG = "docentepro_welcome_guide_shown";

interface WelcomeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal de guía de bienvenida que se muestra UNA SOLA VEZ
 * a los usuarios free después de completar el onboarding.
 *
 * Explica cómo crear su primera sesión y que la problemática
 * seleccionada es solo para las sesiones gratuitas.
 */
function WelcomeGuideModal({ isOpen, onClose }: WelcomeGuideModalProps) {
  function handleDismiss() {
    localStorage.setItem(WELCOME_FLAG, "true");
    onClose();
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
      <div className="flex flex-col items-center text-center -mt-2">
        {/* Ícono principal */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-5">
          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
          ¡Ya puedes crear tu primera sesión!
        </h3>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
          Tienes <span className="font-semibold text-blue-600 dark:text-blue-400">2 sesiones gratuitas</span> para que
          explores cómo DocentePro genera sesiones de aprendizaje alineadas al Currículo Nacional.
        </p>

        {/* Pasos */}
        <div className="w-full space-y-3 text-left mb-6">
          {/* Paso 1 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mt-0.5">
              <MousePointerClick className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                Haz clic en "Crear Sesión"
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Encontrarás esta opción en tu panel principal.
              </p>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center mt-0.5">
              <ListChecks className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                Selecciona una problemática
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Te pediremos elegir una situación significativa del contexto de tu comunidad para
                contextualizar tu sesión, tal como lo establece el enfoque por competencias del
                Currículo Nacional.
              </p>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center mt-0.5">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                Completa el cuestionario y genera tu sesión
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                La IA creará una sesión de aprendizaje completa, lista para usar en tu aula.
              </p>
            </div>
          </div>
        </div>

        {/* Nota importante */}
        <div className="w-full flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-6 text-left">
          <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Ten en cuenta:</span> la problemática que elijas aquí
            es solo para estas sesiones de prueba. Cuando crees una{" "}
            <span className="font-semibold">Unidad de Aprendizaje</span>, podrás seleccionar una
            nueva problemática sin problema.
          </p>
        </div>

        {/* CTA */}
        <Button
          onClick={handleDismiss}
          className="w-full sm:w-auto px-8 py-3 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200"
        >
          ¡Entendido, vamos!
        </Button>
      </div>
    </ReusableModal>
  );
}

/** Verifica si el usuario ya descartó el modal (lo vio y cerró) */
export function hasSeenWelcomeGuide(): boolean {
  return localStorage.getItem(WELCOME_FLAG) === "true";
}

export default WelcomeGuideModal;
