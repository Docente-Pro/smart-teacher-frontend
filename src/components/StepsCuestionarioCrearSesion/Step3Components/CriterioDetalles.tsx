import { ICriterioIA } from "@/interfaces/ICriterio";

interface CriterioDetallesProps {
  criterio: ICriterioIA;
  isSelected: boolean;
}

export default function CriterioDetalles({ criterio, isSelected }: CriterioDetallesProps) {
  const textColorClass = isSelected
    ? "text-amber-700 dark:text-amber-300"
    : "text-slate-600 dark:text-slate-400";

  return (
    <div className="space-y-2 text-xs">
      <div className={`flex gap-2 transition-colors duration-300 ${textColorClass}`}>
        <span className="font-semibold min-w-20">Habilidad:</span>
        <span>{criterio.habilidad}</span>
      </div>
      <div className={`flex gap-2 transition-colors duration-300 ${textColorClass}`}>
        <span className="font-semibold min-w-20">Conocimiento:</span>
        <span>{criterio.conocimiento}</span>
      </div>
      <div className={`flex gap-2 transition-colors duration-300 ${textColorClass}`}>
        <span className="font-semibold min-w-20">Condición:</span>
        <span>{criterio.condicion}</span>
      </div>
      <div className={`flex gap-2 transition-colors duration-300 ${textColorClass}`}>
        <span className="font-semibold min-w-20">Finalidad:</span>
        <span>{criterio.finalidad}</span>
      </div>
    </div>
  );
}
