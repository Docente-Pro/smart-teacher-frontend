import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, CheckCircle2, Brain } from "lucide-react";
import { ICriterioIA } from "@/interfaces/ICriterio";
import CriterioCard from "./CriterioCard";


interface CriteriosListProps {
  criterios: ICriterioIA[];
  criteriosSeleccionados: ICriterioIA[];
  loadingCriterios: boolean;
  criterioEnEdicion: string | null;
  criterioEditado: ICriterioIA | null;
  onSeleccionar: (criterio: ICriterioIA) => void;
  onEditar: (criterio: ICriterioIA, e: React.MouseEvent) => void;
  onGuardar: (e: React.MouseEvent) => void;
  onCancelar: (e: React.MouseEvent) => void;
  onCambioCampo: (campo: keyof ICriterioIA, valor: string) => void;
}

export default function CriteriosList({
  criterios,
  criteriosSeleccionados,
  loadingCriterios,
  criterioEnEdicion,
  criterioEditado,
  onSeleccionar,
  onEditar,
  onGuardar,
  onCancelar,
  onCambioCampo,
}: CriteriosListProps) {
  return (
    <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <div className="h-10 w-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Target className="h-6 w-6 text-white" />
          </div>
          Selecciona los criterios de evaluación
        </CardTitle>
        <CardDescription className="text-base">
          {loadingCriterios ? (
            <Skeleton className="h-4 w-96" />
          ) : (
            `${criterios.length} criterios generados por IA. Selecciona al menos uno.`
          )}
        </CardDescription>
        {criteriosSeleccionados.length > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            {criteriosSeleccionados.length} criterio{criteriosSeleccionados.length !== 1 ? "s" : ""} seleccionado
            {criteriosSeleccionados.length !== 1 ? "s" : ""}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loadingCriterios ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-4/6" />
                </div>
              </div>
            ))}
          </div>
        ) : criterios.length === 0 ? (
          <div className="text-center py-16">
            <Brain className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-xl text-slate-500 dark:text-slate-400 mb-2">No se generaron criterios</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">Por favor, regresa y verifica tu selección</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criterios.map((criterio) => {
              const isSelected = !!criteriosSeleccionados.find((crit) => crit.id === criterio.id);
              const isEditing = criterioEnEdicion === criterio.id;
              const displayCriterio = isEditing && criterioEditado ? criterioEditado : criterio;

              return (
                <CriterioCard
                  key={criterio.id}
                  criterio={displayCriterio}
                  isSelected={isSelected}
                  isEditing={isEditing}
                  onSelect={() => !isEditing && onSeleccionar(criterio)}
                  onEditar={(e: React.MouseEvent) => onEditar(criterio, e)}
                  onGuardar={onGuardar}
                  onCancelar={onCancelar}
                  onCambioCampo={onCambioCampo}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
