import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { obtenerSesionesPorUsuario, obtenerUrlDescarga, eliminarSesionPDF } from "@/services/sesiones.service";
import { listarUnidadesByUsuario } from "@/services/unidad.service";
import { buildCdnPdfUrl } from "@/utils/cdn";
import { getAreaColor } from "@/constants/areaColors";
import { ISesion } from "@/interfaces/ISesion";
import type { IUnidadListItem } from "@/interfaces/IUnidadList";
import {
  FileText,
  Search,
  Calendar,
  Clock,
  Download,
  Eye,
  Trash2,
  Plus,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  X,
  Pencil,
  FolderOpen,
  Folder,
} from "lucide-react";

// ─────────────────── Helpers ───────────────────

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

/** Área curricular de la sesión (para agrupar y mostrar color) */
function getSessionArea(s: ISesion): string {
  const raw = s as any;
  const fromArea = raw.area?.nombre ?? (typeof raw.area === "string" ? raw.area : null);
  if (fromArea) return fromArea;
  try {
    const c = raw.contenido;
    const contenido = typeof c === "string" ? JSON.parse(c) : c;
    const area = contenido?.area?.nombre ?? contenido?.area ?? contenido?.datosGenerales?.area?.nombre ?? contenido?.datosGenerales?.area;
    if (area) return typeof area === "string" ? area : area?.nombre ?? "Otra";
  } catch {
    /* ignore */
  }
  return raw.problematica?.nombre ?? "Otra";
}

/** Si la sesión pertenece a una unidad, devuelve { id, titulo, numeroUnidad }; si no, null */
function getSessionUnidad(
  s: ISesion,
  unidades: IUnidadListItem[],
): { id: string; titulo: string; numeroUnidad: number } | null {
  const raw = s as any;
  const unidadId = raw.unidadId ?? raw.unidad?.id;
  if (!unidadId) return null;
  const u = unidades.find((un) => un.id === unidadId);
  const titulo = raw.unidad?.titulo ?? u?.titulo ?? "Unidad";
  const numeroUnidad = u?.numeroUnidad ?? 0;
  return { id: unidadId, titulo, numeroUnidad };
}

/** Agrupa sesiones en: por unidad (unidadId → por área) e individuales (por área) */
function groupSessionsByFolder(
  sessions: ISesion[],
  unidades: IUnidadListItem[],
): {
  porUnidad: Array<{ unidadId: string; titulo: string; numeroUnidad: number; byArea: Array<{ areaName: string; sessions: ISesion[] }> }>;
  individuales: Array<{ areaName: string; sessions: ISesion[] }>;
} {
  const byUnidad = new Map<string, { titulo: string; numeroUnidad: number; byArea: Map<string, ISesion[]> }>();
  const individualesByArea = new Map<string, ISesion[]>();

  for (const s of sessions) {
    const areaName = getSessionArea(s);
    const un = getSessionUnidad(s, unidades);

    if (un) {
      let folder = byUnidad.get(un.id);
      if (!folder) {
        folder = { titulo: un.titulo, numeroUnidad: un.numeroUnidad, byArea: new Map() };
        byUnidad.set(un.id, folder);
      }
      const arr = folder.byArea.get(areaName) ?? [];
      arr.push(s);
      folder.byArea.set(areaName, arr);
    } else {
      const arr = individualesByArea.get(areaName) ?? [];
      arr.push(s);
      individualesByArea.set(areaName, arr);
    }
  }

  const porUnidad: Array<{ unidadId: string; titulo: string; numeroUnidad: number; byArea: Array<{ areaName: string; sessions: ISesion[] }> }> = [];
  byUnidad.forEach((folder, unidadId) => {
    const byArea: Array<{ areaName: string; sessions: ISesion[] }> = [];
    folder.byArea.forEach((sessions, areaName) => {
      sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      byArea.push({ areaName, sessions });
    });
    byArea.sort((a, b) => a.areaName.localeCompare(b.areaName));
    porUnidad.push({
      unidadId,
      titulo: folder.titulo,
      numeroUnidad: folder.numeroUnidad,
      byArea,
    });
  });
  porUnidad.sort((a, b) => a.numeroUnidad - b.numeroUnidad);

  const individuales: Array<{ areaName: string; sessions: ISesion[] }> = [];
  individualesByArea.forEach((sessions, areaName) => {
    sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    individuales.push({ areaName, sessions });
  });
  individuales.sort((a, b) => a.areaName.localeCompare(b.areaName));

  return { porUnidad, individuales };
}

// ─── Tarjeta de sesión (área con color del sistema, fecha, acciones) ───
function SessionCard({
  sesion,
  areaName,
  downloadingId,
  generatingWordId,
  confirmDeleteId,
  deletingId,
  onVer,
  onDescargar,
  onWord,
  onEditar,
  onConfirmDelete,
  onCancelDelete,
  onEliminar,
  formatFechaRelativa,
}: {
  sesion: ISesion;
  areaName: string;
  downloadingId: string | null;
  generatingWordId: string | null;
  confirmDeleteId: string | null;
  deletingId: string | null;
  onVer: () => void;
  onDescargar: () => void;
  onWord: () => void;
  onEditar: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onEliminar: () => void;
  formatFechaRelativa: (f: string) => string;
}) {
  const areaTheme = getAreaColor(areaName);
  const isConfirming = confirmDeleteId === sesion.id;

  return (
    <div
      className="group relative rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={onVer}
    >
      <div
        className={`h-1 bg-gradient-to-r ${areaTheme.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2 flex-1 min-w-0">
            {sesion.titulo || "Sin título"}
          </h3>
          <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-xs font-medium ${areaTheme.pill}`}>
            {areaName}
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          {formatFechaRelativa(sesion.createdAt)}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
          {sesion.nivel && <span>{sesion.nivel.nombre}</span>}
          {sesion.grado && <span> · {sesion.grado.nombre}</span>}
          <span> · {sesion.duracion} min</span>
        </div>
        <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs border-slate-200 dark:border-slate-700"
            onClick={(e) => { e.stopPropagation(); onVer(); }}
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); onDescargar(); }} disabled={downloadingId === sesion.id} title="PDF">
            {downloadingId === sesion.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`h-8 w-8 p-0 ${(sesion as any).wordUrl ? "border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400" : ""}`}
            onClick={(e) => { e.stopPropagation(); onWord(); }}
            disabled={generatingWordId === sesion.id}
            title={(sesion as any).wordUrl ? "Ver Word" : "Generar Word"}
          >
            {generatingWordId === sesion.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); onEditar(); }} title="Editar">
            <Pencil className="h-3 w-3" />
          </Button>
          {isConfirming ? (
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" className="h-8 px-2 text-xs bg-red-100 text-red-700 hover:bg-red-200" onClick={onEliminar} disabled={deletingId === sesion.id}>
                {deletingId === sesion.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Sí"}
              </Button>
              <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={onCancelDelete}>No</Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={(e) => { e.stopPropagation(); onConfirmDelete(); }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────── Componente Principal ───────────────────

function MisSesiones() {
  const { user: authUser } = useAuthStore();
  const { user: usuario } = useUserStore();
  const navigate = useNavigate();

  const [sesiones, setSesiones] = useState<ISesion[]>([]);
  const [unidades, setUnidades] = useState<IUnidadListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [generatingWordId, setGeneratingWordId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const userId = authUser?.id || usuario?.id;

  // ─── Cargar sesiones y unidades ───
  const cargarSesiones = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [sesionesData, unidadesData] = await Promise.all([
        obtenerSesionesPorUsuario(userId),
        listarUnidadesByUsuario(userId).catch(() => []),
      ]);
      const sesionesArray = Array.isArray(sesionesData) ? sesionesData : [];
      sesionesArray.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setSesiones(sesionesArray);
      setUnidades(Array.isArray(unidadesData) ? unidadesData : []);
    } catch (err: any) {
      console.error("Error al cargar sesiones:", err);
      const msg = err?.response?.data?.message || err?.message || "Error desconocido";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    cargarSesiones();
  }, [cargarSesiones]);

  // ─── Filtrar ───
  const filteredSesiones = sesiones.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.titulo?.toLowerCase().includes(term) ||
      s.nivel?.nombre?.toLowerCase().includes(term) ||
      s.grado?.nombre?.toLowerCase().includes(term) ||
      s.problematica?.nombre?.toLowerCase().includes(term) ||
      getSessionArea(s).toLowerCase().includes(term)
    );
  });

  // ─── Agrupar por carpetas (por unidad + individuales, luego por área) ───
  const { porUnidad, individuales } = groupSessionsByFolder(filteredSesiones, unidades);

  // ─── Descargar PDF ───
  const handleDescargar = async (sesionId: string) => {
    setDownloadingId(sesionId);
    try {
      // 1) Intentar CloudFront directo con pdfUrl del entity
      const sesion = sesiones.find((s) => s.id === sesionId);
      const cdnUrl = buildCdnPdfUrl(sesion?.pdfUrl);
      if (cdnUrl) {
        window.open(cdnUrl, "_blank");
        handleToaster("PDF descargado", "success");
        return;
      }

      // 2) Fallback: URL pre-firmada del backend
      const resp = await obtenerUrlDescarga(sesionId);
      const url = resp?.data?.downloadUrl ?? (resp as any)?.downloadUrl;
      if (!url) {
        handleToaster("No se encontró la URL de descarga", "error");
        return;
      }
      window.open(url, "_blank");
      handleToaster("PDF descargado", "success");
    } catch (err: any) {
      console.error("Error al descargar:", err);
      const msg = err?.response?.status === 404
        ? "Esta sesión aún no tiene PDF generado"
        : "Error al obtener la descarga";
      handleToaster(msg, "error");
    } finally {
      setDownloadingId(null);
    }
  };

  // ─── Eliminar sesión ───
  const handleEliminar = async (sesionId: string) => {
    setDeletingId(sesionId);
    try {
      await eliminarSesionPDF(sesionId);
      setSesiones((prev) => prev.filter((s) => s.id !== sesionId));
      handleToaster("Sesión eliminada correctamente", "success");
    } catch (err: any) {
      console.error("Error al eliminar:", err);
      handleToaster("Error al eliminar la sesión", "error");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // ─── Word: generar o ver, sin salir de la página ───
  const handleWord = async (sesion: ISesion) => {
    if ((sesion as any).wordUrl) {
      try {
        const { obtenerDownloadUrlWord } = await import("@/services/pdfToWord.service");
        const url = await obtenerDownloadUrlWord(sesion.id);
        window.open(url, "_blank");
      } catch {
        handleToaster("Error al obtener el Word", "error");
      }
      return;
    }

    if (!sesion.pdfUrl) {
      handleToaster("Esta sesión aún no tiene PDF. Ábrela primero para generarlo.", "warning");
      return;
    }

    setGeneratingWordId(sesion.id);
    try {
      const { generarWordDesdePDFExistente } = await import("@/services/pdfToWord.service");
      const wordUrl = await generarWordDesdePDFExistente(sesion.id);
      setSesiones((prev) =>
        prev.map((s) => (s.id === sesion.id ? { ...s, wordUrl } as ISesion : s)),
      );
      handleToaster("Word generado y guardado", "success");
    } catch (err: any) {
      handleToaster(err?.message || "Error al generar Word", "error");
    } finally {
      setGeneratingWordId(null);
    }
  };

  // ─── Stats ───
  const totalSesiones = sesiones.length;
  const sesionesEsteMes = sesiones.filter((s) => {
    const d = new Date(s.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const sesionesRestantes = authUser?.sesionesRestantes ?? 0;

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
                Mis Sesiones
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {totalSesiones === 0
                  ? "Aún no has creado sesiones"
                  : `${totalSesiones} sesion${totalSesiones === 1 ? "" : "es"} de aprendizaje`}
              </p>
            </div>
            <Button
              onClick={() => navigate("/crear-sesion")}
              className="bg-gradient-to-r from-dp-blue-500 to-dp-orange-500 hover:from-dp-blue-600 hover:to-dp-orange-600 text-white shadow-lg shadow-dp-blue-500/20 hover:shadow-dp-blue-500/40 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Sesión
            </Button>
          </div>
        </div>

        {/* ─── Stats Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-3 relative">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/5 group-hover:scale-105 transition-transform">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalSesiones}</p>
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
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{sesionesEsteMes}</p>
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-transparent rounded-bl-full" />
            <div className="flex items-center gap-3 relative">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-500/10 dark:to-amber-500/5 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Restantes</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{sesionesRestantes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Search + Refresh ─── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative group/search">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/search:text-dp-blue-500 transition-colors" />
            <Input
              type="text"
              placeholder="Buscar por título, nivel, grado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-dp-blue-400 focus:ring-2 focus:ring-dp-blue-500/20 transition-all rounded-xl"
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
            onClick={cargarSesiones}
            disabled={loading}
            className="h-11 px-5 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

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
                    <Skeleton className="h-3.5 w-2/5 rounded-lg" />
                  </div>
                  <Skeleton className="h-7 w-24 rounded-lg mb-4" />
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex gap-2">
                    <Skeleton className="h-9 flex-1 rounded-lg" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
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
                  Error al cargar sesiones
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">{error}</p>
                <Button
                  variant="outline"
                  onClick={cargarSesiones}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-all"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredSesiones.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 overflow-hidden">
            <CardContent className="py-20 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-700/10 dark:to-transparent" />
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-slate-700/50 dark:to-slate-800/50 flex items-center justify-center shadow-inner">
                  {searchTerm ? (
                    <Search className="h-11 w-11 text-slate-300 dark:text-slate-600" />
                  ) : (
                    <FileText className="h-11 w-11 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {searchTerm ? "Sin resultados" : "No tienes sesiones aún"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">
                  {searchTerm
                    ? `No se encontraron sesiones para "${searchTerm}". Intenta con otro término.`
                    : "Crea tu primera sesión de aprendizaje y aparecerá aquí."}
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
                    onClick={() => navigate("/crear-sesion")}
                    className="bg-gradient-to-r from-dp-blue-500 to-dp-blue-600 hover:from-dp-blue-600 hover:to-dp-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear mi primera sesión
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* ─── Sesiones por unidad ─── */}
            {porUnidad.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FolderOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Sesiones por unidad
                  </h2>
                </div>
                <div className="space-y-6">
                  {porUnidad.map((folder) => (
                    <div
                      key={folder.unidadId}
                      className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden"
                    >
                      <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/50">
                        <Folder className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          Unidad {folder.numeroUnidad > 0 ? folder.numeroUnidad : ""}{folder.numeroUnidad > 0 ? ": " : ""}{folder.titulo}
                        </span>
                      </div>
                      <div className="p-4 space-y-5">
                        {folder.byArea.map(({ areaName, sessions }) => {
                          const areaTheme = getAreaColor(areaName);
                          return (
                            <div key={areaName}>
                              <div
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg mb-3 ${areaTheme.bg} ${areaTheme.border} border`}
                              >
                                <span className={`w-2 h-2 rounded-full ${areaTheme.dot}`} />
                                <span className={`text-sm font-medium ${areaTheme.text}`}>
                                  {areaName}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sessions.map((sesion) => (
                                  <SessionCard
                                    key={sesion.id}
                                    sesion={sesion}
                                    areaName={areaName}
                                    downloadingId={downloadingId}
                                    generatingWordId={generatingWordId}
                                    confirmDeleteId={confirmDeleteId}
                                    deletingId={deletingId}
                                    onVer={() => navigate(`/sesion/${sesion.id}`)}
                                    onDescargar={() => handleDescargar(sesion.id)}
                                    onWord={() => handleWord(sesion)}
                                    onEditar={() => navigate(`/editar-sesion/${sesion.id}`)}
                                    onConfirmDelete={() => setConfirmDeleteId(sesion.id)}
                                    onCancelDelete={() => setConfirmDeleteId(null)}
                                    onEliminar={() => handleEliminar(sesion.id)}
                                    formatFechaRelativa={formatFechaRelativa}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ─── Sesiones individuales (free) ─── */}
            {individuales.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Folder className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Sesiones individuales
                  </h2>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden">
                  <div className="p-4 space-y-5">
                    {individuales.map(({ areaName, sessions }) => {
                      const areaTheme = getAreaColor(areaName);
                      return (
                        <div key={areaName}>
                          <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg mb-3 ${areaTheme.bg} ${areaTheme.border} border`}
                          >
                            <span className={`w-2 h-2 rounded-full ${areaTheme.dot}`} />
                            <span className={`text-sm font-medium ${areaTheme.text}`}>
                              {areaName}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sessions.map((sesion) => (
                              <SessionCard
                                key={sesion.id}
                                sesion={sesion}
                                areaName={areaName}
                                downloadingId={downloadingId}
                                generatingWordId={generatingWordId}
                                confirmDeleteId={confirmDeleteId}
                                deletingId={deletingId}
                                onVer={() => navigate(`/sesion/${sesion.id}`)}
                                onDescargar={() => handleDescargar(sesion.id)}
                                onWord={() => handleWord(sesion)}
                                onEditar={() => navigate(`/editar-sesion/${sesion.id}`)}
                                onConfirmDelete={() => setConfirmDeleteId(sesion.id)}
                                onCancelDelete={() => setConfirmDeleteId(null)}
                                onEliminar={() => handleEliminar(sesion.id)}
                                formatFechaRelativa={formatFechaRelativa}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {porUnidad.length === 0 && individuales.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                No hay sesiones que coincidan con la búsqueda.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MisSesiones;
