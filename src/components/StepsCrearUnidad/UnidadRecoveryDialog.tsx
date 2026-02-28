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
import { FileWarning, RotateCcw, Trash2 } from "lucide-react";
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
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <FileWarning className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <AlertDialogTitle className="text-lg">
              Unidad sin completar
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-3">
            <p>
              Tienes una unidad de aprendizaje que no terminaste de crear.
              ¿Deseas continuar donde te quedaste?
            </p>
            
            {datosBase && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                  {datosBase.titulo || "Sin título"}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {datosBase.nivel} - {datosBase.grado}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Paso actual: <span className="font-medium">{stepNames[currentStep] || `Paso ${currentStep}`}</span>
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={onStartNew}
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
            Empezar de nuevo
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onContinue}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RotateCcw className="w-4 h-4" />
            Continuar donde me quedé
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
