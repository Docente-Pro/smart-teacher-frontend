import { ICompetenciaSugerida } from "@/services/competencias.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, XCircle, Lightbulb, Loader2, Target, BookOpen } from "lucide-react";
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
   * Callback cuando el usuario acepta la sugerencia
   */
  onAceptar?: (competenciaId: number, competenciaNombre: string) => void;
  
  /**
   * Callback cuando el usuario rechaza la sugerencia
   */
  onRechazar?: () => void;
  
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
 * Componente que muestra la sugerencia de competencia generada por IA
 * 
 * @example
 * ```tsx
 * // Modo confirmable (usuario debe aceptar)
 * <CompetenciaSugerida
 *   sugerencia={sugerencia}
 *   loading={loading}
 *   variant="confirmable"
 *   onAceptar={(id, nombre) => handleClick(nombre)}
 *   onRechazar={() => clearSugerencia()}
 * />
 * 
 * // Modo automático (sin confirmación)
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
  onAceptar,
  onRechazar,
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

  // Renderizar sugerencia
  return (
    <Card className={cn(
      "border-2 shadow-lg animate-in slide-in-from-top-4",
      variant === "auto" 
        ? "border-green-300 dark:border-green-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950"
        : "border-blue-300 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icono */}
          <div className={cn(
            "flex-shrink-0 p-2.5 rounded-xl shadow-md",
            variant === "auto"
              ? "bg-gradient-to-br from-green-500 to-emerald-500"
              : "bg-gradient-to-br from-blue-500 to-indigo-500"
          )}>
            <Sparkles className="h-6 w-6 text-white" />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-sm font-bold mb-1 flex items-center gap-2",
              variant === "auto"
                ? "text-green-900 dark:text-green-100"
                : "text-blue-900 dark:text-blue-100"
            )}>
              {variant === "auto" ? "✨ Competencia seleccionada automáticamente" : "🤖 Competencia sugerida por IA"}
            </h3>

            {/* Nombre de la competencia */}
            <p className={cn(
              "font-semibold text-base mb-2",
              variant === "auto"
                ? "text-green-800 dark:text-green-200"
                : "text-blue-800 dark:text-blue-200"
            )}>
              {sugerencia.competenciaNombre}
            </p>

            {/* Justificación General */}
            <div className="flex items-start gap-2 mt-3">
              <Lightbulb className={cn(
                "h-4 w-4 flex-shrink-0 mt-0.5",
                variant === "auto"
                  ? "text-green-600 dark:text-green-400"
                  : "text-blue-600 dark:text-blue-400"
              )} />
              <p className={cn(
                "text-sm italic leading-relaxed",
                variant === "auto"
                  ? "text-green-700 dark:text-green-300"
                  : "text-blue-700 dark:text-blue-300"
              )}>
                {sugerencia.justificacionGeneral}
              </p>
            </div>

            {/* Capacidades Sugeridas */}
            {sugerencia.capacidadesSugeridas && sugerencia.capacidadesSugeridas.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className={cn(
                  "text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5",
                  variant === "auto"
                    ? "text-green-800 dark:text-green-200"
                    : "text-blue-800 dark:text-blue-200"
                )}>
                  <Target className="h-3.5 w-3.5" />
                  Capacidades sugeridas:
                </h4>
                {sugerencia.capacidadesSugeridas.map((capacidad, index) => (
                  <div key={index} className={cn(
                    "pl-4 py-2 border-l-2 rounded-r",
                    variant === "auto"
                      ? "border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/20"
                      : "border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                  )}>
                    <p className={cn(
                      "text-sm font-medium",
                      variant === "auto"
                        ? "text-green-900 dark:text-green-100"
                        : "text-blue-900 dark:text-blue-100"
                    )}>
                      {capacidad.nombre}
                    </p>
                    <p className={cn(
                      "text-xs mt-1",
                      variant === "auto"
                        ? "text-green-700 dark:text-green-300"
                        : "text-blue-700 dark:text-blue-300"
                    )}>
                      {capacidad.justificacion}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Recomendaciones Didácticas */}
            {sugerencia.recomendacionesDidacticas && sugerencia.recomendacionesDidacticas.length > 0 && (
              <div className="mt-4">
                <h4 className={cn(
                  "text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 mb-2",
                  variant === "auto"
                    ? "text-green-800 dark:text-green-200"
                    : "text-blue-800 dark:text-blue-200"
                )}>
                  <BookOpen className="h-3.5 w-3.5" />
                  Recomendaciones didácticas:
                </h4>
                <ul className="space-y-1.5">
                  {sugerencia.recomendacionesDidacticas.map((recomendacion, index) => (
                    <li key={index} className={cn(
                      "text-xs flex items-start gap-2",
                      variant === "auto"
                        ? "text-green-700 dark:text-green-300"
                        : "text-blue-700 dark:text-blue-300"
                    )}>
                      <span className="text-lg leading-none">•</span>
                      <span className="flex-1">{recomendacion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botones de confirmación (solo en modo confirmable) */}
            {variant === "confirmable" && (
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => onAceptar?.(sugerencia.competenciaId, sugerencia.competenciaNombre)}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Aplicar sugerencia
                </Button>
                <Button
                  onClick={() => onRechazar?.()}
                  variant="outline"
                  size="sm"
                  className="border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Elegir manualmente
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
