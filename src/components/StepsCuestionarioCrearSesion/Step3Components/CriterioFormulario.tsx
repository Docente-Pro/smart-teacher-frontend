import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ICriterioIA } from "@/interfaces/ICriterio";

interface CriterioFormularioProps {
  criterio: ICriterioIA;
  onCambioCampo: (campo: keyof ICriterioIA, valor: string) => void;
}

export default function CriterioFormulario({ criterio, onCambioCampo }: CriterioFormularioProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Habilidad:
        </Label>
        <Input
          value={criterio.habilidad}
          onChange={(e) => onCambioCampo("habilidad", e.target.value)}
          className="mt-1 text-xs"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div>
        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Conocimiento:
        </Label>
        <Input
          value={criterio.conocimiento}
          onChange={(e) => onCambioCampo("conocimiento", e.target.value)}
          className="mt-1 text-xs"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div>
        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Condición:
        </Label>
        <Input
          value={criterio.condicion}
          onChange={(e) => onCambioCampo("condicion", e.target.value)}
          className="mt-1 text-xs"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div>
        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Finalidad:
        </Label>
        <Input
          value={criterio.finalidad}
          onChange={(e) => onCambioCampo("finalidad", e.target.value)}
          className="mt-1 text-xs"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
