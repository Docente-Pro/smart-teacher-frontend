import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { problematicaApiService } from "../services/problematica-api.service";
import { SugerenciaPersonalizacion } from "../interfaces/problematica.interface";
import { Users, TrendingUp, Lightbulb, ChevronRight } from "lucide-react";

interface SugerenciasPersonalizacionProps {
  basadaEnId: number;
  usuarioId?: string;
  onSeleccionarSugerencia?: (sugerencia: SugerenciaPersonalizacion) => void;
  limite?: number;
}

/**
 * Componente para mostrar sugerencias de personalización
 * Muestra cómo otros usuarios personalizaron una problemática recomendada
 */
export default function SugerenciasPersonalizacion({
  basadaEnId,
  usuarioId,
  onSeleccionarSugerencia,
  limite = 3,
}: SugerenciasPersonalizacionProps) {
  const [sugerencias, setSugerencias] = useState<SugerenciaPersonalizacion[]>([]);
  const [loading, setLoading] = useState(false); // Cambiado a false por defecto
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Solo cargar si basadaEnId existe
    if (basadaEnId) {
      cargarSugerencias();
    }
  }, [basadaEnId, usuarioId]);

  async function cargarSugerencias() {
    try {
      setLoading(true);
      setError(null);

      const response = await problematicaApiService.getSugerencias({
        basadaEnId,
        limite,
        usuarioId,
      });

      // Verificar que la respuesta tenga datos válidos
      if (response?.data && Array.isArray(response.data)) {
        setSugerencias(response.data);
      } else {
        setSugerencias([]);
      }
    } catch (err: any) {
      console.error("Error al cargar sugerencias:", err);
      setError(err.response?.data?.message || "Error al cargar sugerencias");
      setSugerencias([]); // Asegurar que sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  }

  // Si está cargando, mostrar skeletons
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Cargando sugerencias...
          </h3>
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  // Si hay error o no hay sugerencias, no mostrar nada
  if (error || sugerencias.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-l-4 border-amber-500 rounded-lg">
        <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
            💡 Usuarios similares personalizaron así
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Estas son las personalizaciones más populares de docentes con perfil similar al tuyo.
            Puedes usarlas como inspiración o aplicarlas directamente.
          </p>
        </div>
      </div>

      {/* Lista de sugerencias */}
      <div className="grid gap-3">
        {sugerencias.map((sugerencia) => (
          <Card
            key={sugerencia.id}
            className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-slate-200 dark:border-slate-700 hover:border-dp-orange-300 dark:hover:border-dp-orange-600"
            onClick={() => onSeleccionarSugerencia?.(sugerencia)}
          >
            <div className="flex items-start gap-3">
              {/* Contenido */}
              <div className="flex-1 min-w-0">
                {/* Título y badges */}
                <div className="flex items-start gap-2 mb-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white leading-tight flex-1">
                    {sugerencia.nombre}
                  </h4>

                  {/* Badge de popularidad */}
                  {sugerencia.popularidad > 1 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs font-medium text-blue-700 dark:text-blue-400">
                      <Users className="h-3 w-3" />
                      <span>{sugerencia.popularidad}</span>
                    </div>
                  )}

                  {/* Badge de perfil similar */}
                  {sugerencia.creadoPorUsuariosSimilares && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      <span>Similar</span>
                    </div>
                  )}
                </div>

                {/* Descripción */}
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                  {sugerencia.descripcion}
                </p>

                {/* Info del creador */}
                {sugerencia.creador && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                    <span>Creado por: {sugerencia.creador.nombre}</span>
                    {sugerencia.creador.nivelEducativo && sugerencia.creador.grado && (
                      <>
                        <span>•</span>
                        <span>
                          {sugerencia.creador.nivelEducativo} - {sugerencia.creador.grado}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Botón de aplicar */}
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 text-dp-orange-600 hover:text-dp-orange-700 hover:bg-dp-orange-50 dark:hover:bg-dp-orange-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onSeleccionarSugerencia?.(sugerencia);
                }}
              >
                <span className="text-xs font-medium">Usar</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer info */}
      <p className="text-xs text-slate-500 dark:text-slate-500 italic text-center mt-2">
        Puedes editar cualquier sugerencia antes de guardarla
      </p>
    </div>
  );
}
