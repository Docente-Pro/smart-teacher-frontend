import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { ICriterioContexto } from "@/interfaces/ICriterio";

interface ContextoProblematicaProps {
  contexto: ICriterioContexto | null;
}

export default function ContextoProblematica({ contexto }: ContextoProblematicaProps) {
  if (!contexto?.problematica) return null;

  return (
    <Card className="mb-6 border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          Contexto de la sesión
        </CardTitle>
        <CardDescription className="text-slate-700 dark:text-slate-300">
          <div className="space-y-2 mt-2">
            <p>
              <span className="font-semibold">Problemática:</span>{" "}
              {contexto.problematica.nombre}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {contexto.problematica.descripcion}
            </p>
            {contexto.problematica.esPersonalizada && contexto.problematica.basadaEn && (
              <div className="text-xs text-slate-500 dark:text-slate-500 italic mt-1">
                Basada en: {contexto.problematica.basadaEn.nombre}
              </div>
            )}
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
