import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { obtenerSesionesPorUsuario } from "@/services/sesiones.service";
import { obtenerFichasPorSesion } from "@/services/fichaAplicacion.service";
import { buildCdnPdfUrl } from "@/utils/cdn";
import type { ISesion } from "@/interfaces/ISesion";
import type { IFichaAlmacenada } from "@/interfaces/IFichaAplicacion";
import {
  ArrowLeft,
  ClipboardList,
  Download,
  Eye,
  Calendar,
  GraduationCap,
  BookOpen,
  RefreshCw,
  Loader2,
  FileText,
  ExternalLink,
} from "lucide-react";

// ─── Helpers ───

function formatFecha(fecha: string) {
  try {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(fecha));
  } catch {
    return fecha;
  }
}

function formatFechaRelativa(fecha: string) {
  try {
    const diff = Date.now() - new Date(fecha).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Ahora mismo";
    if (mins < 60) return `Hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `Hace ${days}d`;
    return formatFecha(fecha);
  } catch {
    return fecha;
  }
}

function getAreaColor(area?: string) {
  if (!area) return "from-slate-500 to-slate-600";
  const a = area.toLowerCase();
  if (a.includes("matemát")) return "from-blue-500 to-indigo-600";
  if (a.includes("comunica")) return "from-emerald-500 to-teal-600";
  if (a.includes("ciencia")) return "from-purple-500 to-violet-600";
  if (a.includes("personal")) return "from-amber-500 to-orange-600";
  return "from-dp-blue-500 to-dp-orange-500";
}

/** Ficha + datos de la sesión origen */
interface FichaConSesion {
  ficha: IFichaAlmacenada;
  sesion: ISesion;
}

// ─── Componente Principal ───

function MisFichas() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [fichas, setFichas] = useState<FichaConSesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  const cargarFichas = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Obtener todas las sesiones del usuario
      const sesiones: ISesion[] = await obtenerSesionesPorUsuario(userId);

      // 2. Para cada sesión, obtener fichas en paralelo
      const fichasPorSesion = await Promise.allSettled(
        sesiones.map(async (s) => {
          const fichaList = await obtenerFichasPorSesion(s.id);
          return fichaList.map((f) => ({ ficha: f, sesion: s }));
        }),
      );

      // 3. Consolidar resultados
      const todas: FichaConSesion[] = [];
      for (const result of fichasPorSesion) {
        if (result.status === "fulfilled") {
          todas.push(...result.value);
        }
      }

      // 4. Ordenar por fecha más reciente
      todas.sort(
        (a, b) =>
          new Date(b.ficha.createdAt).getTime() - new Date(a.ficha.createdAt).getTime(),
      );

      setFichas(todas);
    } catch (err: unknown) {
      console.error("Error al cargar fichas:", err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        "Error desconocido";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    cargarFichas();
  }, [cargarFichas]);

  // ─── Handlers ───

  const handleVerFicha = (item: FichaConSesion) => {
    const cdnUrl = buildCdnPdfUrl(item.ficha.pdfUrl);
    if (cdnUrl) {
      window.open(cdnUrl, "_blank");
      return;
    }
    // Si no hay PDF, navegar al result con fichaJSON
    navigate("/ficha-aplicacion-result", {
      state: {
        ficha: item.ficha.fichaJSON,
        fichaId: item.ficha.id,
        sesionId: item.ficha.sesionId,
        docente: user?.name || "",
        institucion: user?.nombreInstitucion || "",
      },
    });
  };

  const handleVerSesion = (sesionId: string) => {
    navigate(`/sesion/${sesionId}`);
  };

  // ─── Render ───

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ─── Header ─── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Inicio
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
                Mis Fichas de Aplicación
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-14">
                Todas las fichas de aplicación que has generado
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={cargarFichas}
              disabled={loading}
              className="hidden sm:flex"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* ─── Stats ─── */}
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                <ClipboardList className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
                  Total fichas
                </p>
                <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {fichas.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
                  Con PDF
                </p>
                <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {fichas.filter((f) => f.ficha.pdfUrl).length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Loading ─── */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Error ─── */}
        {error && (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              Error al cargar fichas
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{error}</p>
            <Button onClick={cargarFichas} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        )}

        {/* ─── Empty State ─── */}
        {!loading && !error && fichas.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
              <ClipboardList className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              Aún no tienes fichas
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Las fichas de aplicación se generan desde la vista de cada sesión.
              Ve a una sesión y presiona "Ficha de Aplicación".
            </p>
            <Button onClick={() => navigate("/mis-sesiones")} size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Ir a Mis Sesiones
            </Button>
          </div>
        )}

        {/* ─── Lista de fichas ─── */}
        {!loading && !error && fichas.length > 0 && (
          <div className="space-y-3">
            {fichas.map((item) => {
              const { ficha, sesion } = item;
              const hasPdf = !!ficha.pdfUrl;
              const areaColor = getAreaColor(ficha.area);

              return (
                <div
                  key={ficha.id}
                  className="group relative p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                >
                  {/* Top accent */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r ${areaColor} opacity-0 group-hover:opacity-100 transition-opacity`}
                  />

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${areaColor} flex items-center justify-center shadow-sm`}
                    >
                      <ClipboardList className="h-5 w-5 text-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                        {sesion.titulo || "Sesión sin título"}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <GraduationCap className="h-3 w-3" />
                          {ficha.grado}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <BookOpen className="h-3 w-3" />
                          {ficha.area}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {formatFechaRelativa(ficha.createdAt)}
                        </span>
                      </div>

                      {/* Estado del PDF */}
                      <div className="mt-2">
                        {hasPdf ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            PDF disponible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Sin PDF
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerSesion(sesion.id)}
                        className="text-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        <span className="hidden sm:inline">Ver Sesión</span>
                        <span className="sm:hidden">Sesión</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleVerFicha(item)}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm shadow-amber-500/20 text-xs"
                      >
                        {hasPdf ? (
                          <>
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            <span className="hidden sm:inline">Ver / Descargar</span>
                            <span className="sm:hidden">Ver</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            <span className="hidden sm:inline">Ver Ficha</span>
                            <span className="sm:hidden">Ver</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MisFichas;
