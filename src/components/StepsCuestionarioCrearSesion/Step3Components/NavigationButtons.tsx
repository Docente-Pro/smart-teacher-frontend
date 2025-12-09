import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface NavigationButtonsProps {
  currentPage?: number; // Opcional, no se usa actualmente pero podría ser útil
  criteriosSeleccionados: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function NavigationButtons({
  criteriosSeleccionados,
  onPrevious,
  onNext,
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between items-center pt-8">
      <Button
        onClick={onPrevious}
        variant="outline"
        size="lg"
        className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-5 w-5" />
        Anterior
      </Button>

      <div className="text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {criteriosSeleccionados > 0
            ? `${criteriosSeleccionados} criterio${criteriosSeleccionados !== 1 ? "s" : ""} seleccionado${
                criteriosSeleccionados !== 1 ? "s" : ""
              }`
            : "Selecciona al menos un criterio para continuar"}
        </p>
      </div>

      <Button
        onClick={onNext}
        size="lg"
        disabled={criteriosSeleccionados === 0}
        className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
      >
        Continuar
        <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
