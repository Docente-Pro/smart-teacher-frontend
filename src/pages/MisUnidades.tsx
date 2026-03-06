import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { listarUnidadesByUsuario, obtenerDownloadUrlUnidad, sincronizarMiembroUnidad } from "@/services/unidad.service";
import { buildCdnPdfUrl } from "@/utils/cdn";
import type { IUnidadListItem } from "@/interfaces/IUnidadList";
import {
  FolderOpen,
  Search,
  Calendar,
  Download,
  Eye,
  Plus,
  ArrowLeft,
  Loader2,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  X,
  Users,
  Lock,
  Share2,
  GraduationCap,
  BookOpen,
  Clock,
  Copy,
  Check,
  MessageCircle,
  Pencil,
} from "lucide-react";

// ─────────────────── Helpers ───────────────────

function formatFecha(fecha: string) {
  try {
    // Parsear como fecha local (sin timezone conversion)
    // fecha viene en formato "YYYY-MM-DD" o ISO string
    const dateOnly = fecha.split("T")[0]; // Si es ISO, tomar solo la fecha
    const [year, month, day] = dateOnly.split("-").map(Number);
    if (!year || !month || !day) return fecha;
    const d = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
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

function getTipoColor(tipo?: string) {
  if (tipo === "COMPARTIDA") return "from-sky-500 to-cyan-600";
  return "from-violet-500 to-purple-600";
}

function getTipoIcon(tipo?: string) {
  if (tipo === "COMPARTIDA") return <Users className="h-5 w-5" />;
  return <Lock className="h-4 w-4" />;
}

function formatPeriodo(fechaInicio?: string, fechaFin?: string) {
  if (!fechaInicio || !fechaFin) return null;
  return `${formatFecha(fechaInicio)} — ${formatFecha(fechaFin)}`;
}

function getTipoBadgeClasses(tipo?: string) {
  const base = "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border";
  if (tipo === "COMPARTIDA") {
    return `${base} bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-100 dark:border-sky-700/50`;
  }
  return `${base} bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-700/50`;
}

function getEstadoPagoBadgeClasses(estado?: string) {
  const base = "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border";
  if (estado === "CONFIRMADO") {
    return `${base} bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-700/50`;
  }
  if (estado === "PENDIENTE") {
    return `${base} bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-700/50`;
  }
  return `${base} bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-100 dark:border-red-700/50`;
}

// ─────────────────── Componente Principal ───────────────────

function MisUnidades() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [unidades, setUnidades] = useState<IUnidadListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const userId = user?.id;

  /** Copiar código compartido */
  const handleCopiarCodigo = (unidadId: string, codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiedId(unidadId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /** Compartir por WhatsApp */
  const handleCompartirWhatsApp = (titulo: string, codigo: string) => {
    const mensaje = [
      `\u00a1Hola! \ud83d\udc4b Te invito a unirte a mi unidad de aprendizaje *"${titulo}"* en Docente Pro.`,
      ``,
      `\ud83d\udccb Usa este c\u00f3digo para unirte:`,
      `\ud83d\udd11 *${codigo}*`,
      ``,
      `Ingresa a \ud83d\udc49 https://www.docente-pro.com y busca la opci\u00f3n "Unirse a unidad compartida".`,
    ].join("\n");
    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ─── Cargar unidades ───
  const cargarUnidades = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      let items = await listarUnidadesByUsuario(userId);

      // Sincronizar suscriptores que necesitan contenido personalizado actualizado
      const needSync = items.filter(
        (u) => u._rol === "SUSCRIPTOR" && u.necesitaSincronizacion === true,
      );
      if (needSync.length > 0) {
        setSincronizando(true);
        try {
          await Promise.all(
            needSync.map(async (u) => {
              try {
                await sincronizarMiembroUnidad(u.id);
              } catch (syncErr) {
                console.warn(`⚠️ Error sincronizando ${u.titulo}:`, syncErr);
              }
            }),
          );
          // Recargar lista con datos actualizados
          items = await listarUnidadesByUsuario(userId);
        } finally {
          setSincronizando(false);
        }
      }

      // Ordenar por fecha más reciente
      items.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setUnidades(items);
    } catch (err: any) {
      console.error("Error al cargar unidades:", err);
      const msg = err?.response?.data?.message || err?.message || "Error desconocido";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    cargarUnidades();
  }, [cargarUnidades]);

  // ─── Filtrar ───
  const filteredUnidades = unidades.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.titulo?.toLowerCase().includes(term) ||
      u.tipo?.toLowerCase().includes(term) ||
      u.codigoCompartido?.toLowerCase().includes(term) ||
      u.nivel?.nombre?.toLowerCase().includes(term) ||
      u.grado?.nombre?.toLowerCase().includes(term) ||
      u.problematica?.nombre?.toLowerCase().includes(term)
    );
  });

  // ─── Descargar PDF ───
  const handleDescargar = async (unidadId: string) => {
    const unidad = unidades.find((u) => u.id === unidadId);
    const esSuscriptor = unidad?._rol === "SUSCRIPTOR";

    // Suscriptor sin PDF pero con contenido → generar PDF primero
    if (
      unidad &&
      esSuscriptor &&
      !unidad.pdfUrl &&
      unidad.contenido
    ) {
      navigate("/unidad-suscriptor-result", { state: { unidad } });
      return;
    }

    setDownloadingId(unidadId);
    try {
      // Suscriptores: siempre usar URL pre-firmada con usuarioId
      // para obtener SU PDF, no el del propietario
      if (esSuscriptor) {
        const resp = await obtenerDownloadUrlUnidad(unidadId, userId!);
        const url = resp?.data?.downloadUrl ?? (resp as any)?.downloadUrl;
        if (!url) {
          handleToaster("No se encontró la URL de descarga", "error");
          return;
        }
        window.open(url, "_blank");
        handleToaster("PDF descargado", "success");
        return;
      }

      // Propietario: usar URL pre-firmada (siempre apunta al PDF real actual)
      const resp = await obtenerDownloadUrlUnidad(unidadId);
      const url = resp?.data?.downloadUrl ?? (resp as any)?.downloadUrl;
      if (url) {
        window.open(url, "_blank");
        handleToaster("PDF descargado", "success");
        return;
      }

      // Fallback: CDN con cache-bust
      const cdnUrl = buildCdnPdfUrl(unidad?.pdfUrl);
      if (cdnUrl) {
        const bust = unidad?.pdfGeneradoAt
          ? new Date(unidad.pdfGeneradoAt).getTime()
          : Date.now();
        window.open(`${cdnUrl}${cdnUrl.includes("?") ? "&" : "?"}v=${bust}`, "_blank");
        handleToaster("PDF descargado", "success");
        return;
      }

      handleToaster("No se encontró la URL de descarga", "error");
    } catch (err: any) {
      console.error("Error al descargar:", err);
      const msg = err?.response?.status === 404
        ? "Esta unidad aún no tiene PDF generado"
        : "Error al obtener la descarga";
      handleToaster(msg, "error");
    } finally {
      setDownloadingId(null);
    }
  };

  // ─── Stats ───
  const totalUnidades = unidades.length;
  const unidadesEsteMes = unidades.filter((u) => {
    const d = new Date(u.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const unidadesCompartidas = unidades.filter((u) => u.tipo === "COMPARTIDA").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ─── Header ─── */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Mis Unidades
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {totalUnidades === 0
                  ? "Aún no has creado unidades"
                  : `${totalUnidades} unidad${totalUnidades === 1 ? "" : "es"} de aprendizaje`}
              </p>
            </div>
            <Button
              onClick={() => navigate("/crear-unidad")}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Unidad
            </Button>
          </div>
        </div>

        {/* ─── Stats Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/5 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-3 relative">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-500/10 dark:to-violet-500/5 group-hover:scale-105 transition-transform">
                <FolderOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalUnidades}</p>
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-3 relative">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-500/10 dark:to-emerald-500/5 group-hover:scale-105 transition-transform">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Este mes</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{unidadesEsteMes}</p>
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-sky-500/5 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-3 relative">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-500/10 dark:to-sky-500/5 group-hover:scale-105 transition-transform">
                <Share2 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Compartidas</p>
                <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{unidadesCompartidas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Search + Refresh ─── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative group/search">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/search:text-violet-500 transition-colors" />
            <Input
              type="text"
              placeholder="Buscar por nombre, tipo, código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all rounded-xl"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={cargarUnidades}
            disabled={loading}
            className="h-11 px-5 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {/* ─── Sincronizando contenido personalizado ─── */}
        {sincronizando && (
          <div className="mb-4 p-4 rounded-xl border border-violet-200 dark:border-violet-700/50 bg-violet-50 dark:bg-violet-500/10 flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-violet-500 animate-spin flex-shrink-0" />
            <p className="text-sm text-violet-700 dark:text-violet-300">
              Sincronizando contenido personalizado de tus unidades compartidas...
            </p>
          </div>
        )}

        {/* ─── Content ─── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 overflow-hidden animate-pulse"
              >
                <div className="h-1 bg-slate-200 dark:bg-slate-700" />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Skeleton className="h-5 w-3/4 mb-2 rounded-lg" />
                      <Skeleton className="h-3.5 w-1/3 rounded-lg" />
                    </div>
                    <Skeleton className="h-11 w-11 rounded-xl" />
                  </div>
                  <div className="space-y-2.5 mb-4">
                    <Skeleton className="h-3.5 w-2/3 rounded-lg" />
                    <Skeleton className="h-3.5 w-1/2 rounded-lg" />
                  </div>
                  <Skeleton className="h-7 w-24 rounded-lg mb-4" />
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex gap-2">
                    <Skeleton className="h-9 flex-1 rounded-lg" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Card className="border-red-200/60 dark:border-red-800/30 bg-white dark:bg-slate-800/50 overflow-hidden">
            <CardContent className="py-16 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-b from-red-50/50 to-transparent dark:from-red-900/10 dark:to-transparent" />
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/5 flex items-center justify-center shadow-sm">
                  <AlertTriangle className="h-10 w-10 text-red-400 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Error al cargar unidades
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">{error}</p>
                <Button
                  variant="outline"
                  onClick={cargarUnidades}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-all"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredUnidades.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 overflow-hidden">
            <CardContent className="py-20 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-700/10 dark:to-transparent" />
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-slate-700/50 dark:to-slate-800/50 flex items-center justify-center shadow-inner">
                  {searchTerm ? (
                    <Search className="h-11 w-11 text-slate-300 dark:text-slate-600" />
                  ) : (
                    <FolderOpen className="h-11 w-11 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {searchTerm ? "Sin resultados" : "No tienes unidades aún"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">
                  {searchTerm
                    ? `No se encontraron unidades para "${searchTerm}". Intenta con otro término.`
                    : "Crea tu primera unidad de aprendizaje y aparecerá aquí."}
                </p>
                {searchTerm ? (
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm("")}
                    className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar búsqueda
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate("/crear-unidad")}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear mi primera unidad
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUnidades.map((unidad) => (
              <div
                key={unidad.id}
                className="group relative rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Top accent bar */}
                <div
                  className={`h-1 bg-gradient-to-r ${getTipoColor(unidad.tipo)} opacity-50 group-hover:opacity-100 transition-opacity duration-300`}
                />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-snug line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200">
                        {unidad.titulo || "Sin título"}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {formatFechaRelativa(unidad.createdAt)}
                      </p>
                    </div>
                    <div
                      className={`flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${getTipoColor(unidad.tipo)} text-white shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}
                    >
                      {getTipoIcon(unidad.tipo)}
                    </div>
                  </div>

                  {/* Info: Nivel, Grado, Problemática */}
                  <div className="space-y-1.5 mb-3 text-sm text-slate-600 dark:text-slate-300">
                    {unidad.nivel?.nombre && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">
                          {unidad.nivel.nombre}
                          {unidad.grado?.nombre ? ` — ${unidad.grado.nombre}` : ""}
                        </span>
                      </div>
                    )}
                    {unidad.problematica?.nombre && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{unidad.problematica.nombre}</span>
                      </div>
                    )}
                    {(unidad.fechaInicio && unidad.fechaFin) && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">
                          {formatPeriodo(unidad.fechaInicio, unidad.fechaFin)}
                          {unidad.duracion ? ` (${unidad.duracion} sem.)` : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tipo badge */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className={getTipoBadgeClasses(unidad.tipo)}>
                      {unidad.tipo === "COMPARTIDA" ? (
                        <Users className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      {unidad.tipo === "COMPARTIDA" ? "Compartida" : "Personal"}
                    </span>
                    {unidad.tipo === "COMPARTIDA" && unidad.miembros?.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-700/40 text-xs text-slate-600 dark:text-slate-300 font-medium border border-slate-100 dark:border-slate-700/50">
                        <Users className="h-3 w-3" />
                        {unidad.miembros.length} miembro{unidad.miembros.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {unidad.tipo === "COMPARTIDA" && unidad.codigoCompartido && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-300 font-mono font-semibold border border-emerald-100 dark:border-emerald-700/50">
                        <Share2 className="h-3 w-3" />
                        {unidad.codigoCompartido}
                      </span>
                    )}
                    {(() => {
                      const miembroPago = unidad.miembros?.find((m) => m.usuarioId === userId);
                      const estado = miembroPago?.estadoPago ?? unidad.estadoPago;
                      if (!estado) return null;
                      return (
                        <span className={getEstadoPagoBadgeClasses(estado)}>
                          {estado === "CONFIRMADO" ? "Pagado" : estado === "PENDIENTE" ? "Pendiente" : "Rechazado"}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Compartir código (solo COMPARTIDA) */}
                  {unidad.tipo === "COMPARTIDA" && unidad.codigoCompartido && (
                    <div className="flex items-center gap-2 pt-3 border-t border-emerald-100 dark:border-emerald-800/40">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-500/10 transition-all"
                        onClick={() => handleCopiarCodigo(unidad.id, unidad.codigoCompartido!)}
                      >
                        {copiedId === unidad.id ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copiar código
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-[#25D366] hover:bg-[#1DA851] text-white shadow-sm"
                        onClick={() => handleCompartirWhatsApp(unidad.titulo, unidad.codigoCompartido!)}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        WhatsApp
                      </Button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-sm h-9 border-slate-200 dark:border-slate-700 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 dark:hover:bg-violet-500/10 dark:hover:text-violet-400 transition-all"
                      onClick={() => {
                        if (unidad._rol === "SUSCRIPTOR") {
                          navigate(`/unidad/${unidad.id}`, { state: { rol: "SUSCRIPTOR" } });
                        } else {
                          navigate(`/unidad/${unidad.id}`);
                        }
                      }}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition-all"
                      onClick={() => handleDescargar(unidad.id)}
                      disabled={downloadingId === unidad.id}
                    >
                      {downloadingId === unidad.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0 border-slate-200 dark:border-slate-700 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 dark:hover:bg-violet-500/10 dark:hover:text-violet-400 transition-all"
                      onClick={() => navigate(`/editar-unidad/${unidad.id}`)}
                      title="Editar contenido"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MisUnidades;
