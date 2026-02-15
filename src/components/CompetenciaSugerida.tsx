import { ICompetenciaSugerida } from "@/services/competencias.service";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Lightbulb, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompetenciaSugeridaProps {
  /**
   * Datos de la sugerencia de la IA
   */
  sugerencia: ICompetenciaSugerida | null;
  
  /**
   * Estado de carga
   */
  loading?: boolean;
  
  /**
   * Variante del componente
   * - 'auto': Aplica automáticamente sin mostrar botones
   * - 'confirmable': Muestra botones para aceptar/rechazar
   */
  variant?: "auto" | "confirmable";
  
  /**
   * Clases adicionales
   */
  className?: string;
}

/**
 * Componente que muestra la justificación de la competencia sugerida por IA
 * 
 * @example
 * ```tsx
 * <CompetenciaSugerida
 *   sugerencia={sugerencia}
 *   loading={loading}
 *   variant="auto"
 * />
 * ```
 */
export function CompetenciaSugerida({
  sugerencia,
  loading = false,
  variant = "auto",
  className,
}: CompetenciaSugeridaProps) {
  // Mostrar loading
  if (loading) {
    return (
      <Card className={cn("border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950", className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                🤖 Analizando tema curricular...
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                La IA está sugiriendo la competencia más apropiada
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No mostrar nada si no hay sugerencia
  if (!sugerencia) {
    return null;
  }

  // Renderizar solo la justificación general
  return (
    <Card className={cn(
      "border-2 shadow-lg animate-in slide-in-from-top-4",
      "border-green-300 dark:border-green-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icono */}
          <div className="flex-shrink-0 p-2.5 rounded-xl shadow-md bg-gradient-to-br from-green-500 to-emerald-500">
            <Sparkles className="h-6 w-6 text-white" />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold mb-1 flex items-center gap-2 text-green-900 dark:text-green-100">
              ✨ Competencia seleccionada automáticamente
            </h3>

            {/* Nombre de la competencia */}
            <p className="font-semibold text-base mb-2 text-green-800 dark:text-green-200">
              {sugerencia.competenciaNombre}
            </p>

            {/* Justificación General */}
            <div className="flex items-start gap-2 mt-3">
              <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
              <p className="text-sm italic leading-relaxed text-green-700 dark:text-green-300">
                {sugerencia.justificacionGeneral}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
