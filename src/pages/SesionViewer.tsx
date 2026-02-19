import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Download, ExternalLink, FileText,
  GraduationCap, BookOpen, Clock, Calendar,
  AlertTriangle, RefreshCw, Loader2, Maximize2,
  CheckCircle2, Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { obtenerSesionPorId, obtenerUrlDescarga } from "@/services/sesiones.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import type { ISesion } from "@/interfaces/ISesion";

// ─── Helpers ───

function formatFecha(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuracion(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function getAreaGradient(nivel?: string): string {
  if (!nivel) return "from-slate-500 to-slate-600";
  const n = nivel.toLowerCase();
  if (n.includes("inicial")) return "from-pink-500 to-rose-600";
  if (n.includes("primaria")) return "from-blue-500 to-indigo-600";
  if (n.includes("secundaria")) return "from-emerald-500 to-teal-600";
  return "from-dp-blue-500 to-dp-orange-500";
}

// ─── Component ───

function SesionViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sesion, setSesion] = useState<ISesion | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // ─── Cargar sesión y PDF ───
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setPdfError(null);
      const sesionId = id!;

      try {
        const data = await obtenerSesionPorId(sesionId);
        if (cancelled) return;
        setSesion(data);

        setLoadingPdf(true);
        try {
          const resp = await obtenerUrlDescarga(sesionId);
          const url = (resp as any)?.data?.downloadUrl ?? (resp as any)?.downloadUrl;
          if (!cancelled && url) {
            setPdfUrl(url);
          } else if (!cancelled) {
            setPdfError("Esta sesión aún no tiene un PDF generado.");
          }
        } catch (pdfErr: any) {
          if (!cancelled) {
            setPdfError(
              pdfErr?.response?.status === 404
                ? "Esta sesión aún no tiene un PDF generado."
                : "No se pudo cargar el PDF."
            );
          }
        } finally {
          if (!cancelled) setLoadingPdf(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Error al cargar sesión:", err);
          setError(err?.response?.data?.message || err?.message || "Error al cargar la sesión");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  const handleOpenNewTab = () => {
    if (pdfUrl) window.open(pdfUrl, "_blank");
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `${sesion?.titulo || "sesion"}.pdf`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    handleToaster("Descarga iniciada", "success");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      handleToaster("Enlace copiado al portapapeles", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      handleToaster("No se pudo copiar el enlace", "error");
    }
  };

  const toggleFullscreen = () => setIsFullscreen((v) => !v);

  // ─── Fullscreen PDF overlay ───
  if (isFullscreen && pdfUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-dp-blue-500 to-dp-orange-500 flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-medium text-sm truncate max-w-[300px]">
              {sesion?.titulo || "PDF"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={handleOpenNewTab} className="text-slate-300 hover:text-white hover:bg-white/10">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDownload} className="text-slate-300 hover:text-white hover:bg-white/10">
              <Download className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={toggleFullscreen} className="text-slate-300 hover:text-white hover:bg-white/10">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <iframe src={pdfUrl} className="flex-1 w-full" title={sesion?.titulo || "PDF"} />
      </div>
    );
  }

  // ─── Error state ───
  if (!loading && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/5 flex items-center justify-center border border-red-200 dark:border-red-800/30">
                <AlertTriangle className="h-9 w-9 text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No se pudo cargar</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-center max-w-sm">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-dp-blue-500 to-dp-blue-600 hover:from-dp-blue-600 hover:to-dp-blue-700 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const areaGradient = getAreaGradient(sesion?.nivel?.nombre);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ─── Top bar ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/mis-sesiones")}
            className="group text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
            Mis Sesiones
          </Button>

          {!loading && pdfUrl && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="border-slate-200 dark:border-slate-700 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 dark:hover:bg-violet-500/10 dark:hover:text-violet-400 transition-all"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" /> : <Share2 className="h-4 w-4 mr-2" />}
                {copied ? "Copiado" : "Compartir"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenNewTab}
                className="border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-all"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Nueva pestaña
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm shadow-emerald-500/20 transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* ─── Sidebar ─── */}
          <div className="space-y-4">
            {/* Card principal con accent top */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 shadow-sm overflow-hidden">
              {/* Gradient accent bar */}
              <div className={`h-1.5 bg-gradient-to-r ${loading ? "from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 animate-pulse" : areaGradient}`} />

              <div className="p-5">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-7 w-4/5" />
                    <Skeleton className="h-3 w-1/3" />
                    <div className="pt-3 space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-lg" />
                          <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : sesion ? (
                  <>
                    {/* Título */}
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-4">
                      {sesion.titulo || "Sin título"}
                    </h1>

                    {/* Detalles en formato limpio */}
                    <div className="space-y-3.5">
                      {sesion.nivel && (
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                            <GraduationCap className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Nivel</p>
                            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate">{sesion.nivel.nombre}</p>
                          </div>
                        </div>
                      )}

                      {sesion.grado && (
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                            <BookOpen className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Grado</p>
                            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate">{sesion.grado.nombre}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                          <Clock className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Duración</p>
                          <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{formatDuracion(sesion.duracion)}</p>
                        </div>
                      </div>

                      {sesion.problematica && (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mt-0.5">
                            <FileText className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Problemática</p>
                            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-snug">{sesion.problematica.nombre}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fecha con separador */}
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="text-xs text-slate-400 dark:text-slate-500">{formatFecha(sesion.createdAt)}</span>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {/* Acciones móvil */}
            {!loading && pdfUrl && (
              <div className="flex flex-col gap-2 lg:hidden">
                <Button
                  onClick={handleOpenNewTab}
                  className="w-full bg-gradient-to-r from-dp-blue-500 to-dp-blue-600 hover:from-dp-blue-600 hover:to-dp-blue-700 text-white shadow-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir en nueva pestaña
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={handleDownload} className="border-slate-200 dark:border-slate-700">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  <Button variant="outline" onClick={handleShare} className="border-slate-200 dark:border-slate-700">
                    {copied ? <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" /> : <Share2 className="h-4 w-4 mr-2" />}
                    {copied ? "Copiado" : "Compartir"}
                  </Button>
                </div>
              </div>
            )}

            {/* Status del PDF */}
            {!loading && (
              <div className={`rounded-xl border p-4 ${pdfUrl
                ? "border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-500/5"
                : "border-amber-200 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-500/5"}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${pdfUrl ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                  <span className={`text-xs font-medium ${pdfUrl ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                    {pdfUrl ? "PDF disponible" : "PDF pendiente de generación"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ─── Main: PDF Viewer ─── */}
          <div className="relative rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 shadow-sm overflow-hidden min-h-[600px] lg:min-h-[calc(100vh-160px)]">
            {/* Viewer toolbar */}
            {!loading && !loadingPdf && pdfUrl && (
              <div className="absolute top-3 right-3 z-10">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={toggleFullscreen}
                  className="h-8 px-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
                >
                  <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs">Pantalla completa</span>
                </Button>
              </div>
            )}

            {loading || loadingPdf ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[600px] gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-dp-blue-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                    <Loader2 className="h-7 w-7 text-dp-blue-500 animate-spin" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {loading ? "Cargando sesión..." : "Cargando PDF..."}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Esto puede tomar unos segundos</p>
                </div>
              </div>
            ) : pdfError ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[600px] gap-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-slate-300/30 dark:bg-slate-600/20 rounded-full blur-2xl" />
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                  </div>
                </div>
                <div className="text-center max-w-xs">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1.5">
                    PDF no disponible
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {pdfError}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/crear-sesion")}
                  className="mt-2 border-slate-200 dark:border-slate-700"
                >
                  Crear nueva sesión
                </Button>
              </div>
            ) : pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full min-h-[600px] lg:min-h-[calc(100vh-160px)] border-0"
                title={sesion?.titulo || "PDF de sesión"}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SesionViewer;
