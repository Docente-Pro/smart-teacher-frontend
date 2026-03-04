import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BookOpen, ArrowRight, RotateCcw } from "lucide-react";
import { useUnidadStore } from "@/store/unidad.store";

interface Props {
  open: boolean;
  onContinue: () => void;
  onStartNew: () => void;
}

/**
 * Diálogo que aparece cuando el usuario tiene una unidad sin completar.
 * Ofrece opciones para continuar donde se quedó o empezar de nuevo.
 */
export function UnidadRecoveryDialog({ open, onContinue, onStartNew }: Props) {
  const { datosBase, currentStep } = useUnidadStore();

  const stepNames: Record<number, string> = {
    1: "Datos Generales",
    2: "Situación y Propósitos",
    3: "Enfoques Transversales",
    4: "Secuencia de Actividades",
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-sm sm:max-w-md mx-4 sm:mx-auto rounded-2xl p-0 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-5 py-6 sm:px-6 sm:py-8">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <AlertDialogHeader className="space-y-1 text-center">
            <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-white">
              ¡Tienes trabajo pendiente!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-100 text-sm sm:text-base">
              Encontramos una unidad sin completar
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        {/* Contenido */}
        <div className="px-5 py-5 sm:px-6 sm:py-6 space-y-4">
          {datosBase && (
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug mb-2">
                {datosBase.titulo || "Sin título"}
              </p>
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium">
                  {datosBase.nivel}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-medium">
                  {datosBase.grado}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  En paso: <span className="font-medium text-slate-900 dark:text-slate-200">{stepNames[currentStep] || `Paso ${currentStep}`}</span>
                </span>
              </div>
            </div>
          )}

          <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
            ¿Deseas retomar donde te quedaste?
          </p>
        </div>

        {/* Footer con botones */}
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
          <AlertDialogCancel
            onClick={onStartNew}
            className="flex-1 h-11 sm:h-12 gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm sm:text-base transition-all"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            Empezar de cero
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onContinue}
            className="flex-1 h-11 sm:h-12 gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all"
          >
            Continuar
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
