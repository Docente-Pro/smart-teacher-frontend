import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import {
  obtenerSesionesPorUsuario,
  obtenerUrlDescarga,
  eliminarSesionPDF,
} from "@/services/sesiones.service";
import { buildCdnPdfUrl } from "@/utils/cdn";
import { getAreaColor } from "@/constants/areaColors";
import { ISesion } from "@/interfaces/ISesion";
import type { IUnidadListItem } from "@/interfaces/IUnidadList";
import {
  FileText,
  Search,
  Calendar,
  Download,
  Eye,
  Trash2,
  Plus,
  Loader2,
  RefreshCw,
  AlertTriangle,
  X,
  Pencil,
  FolderOpen,
  Folder,
  ChevronRight,
  ScanSearch,
} from "lucide-react";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import { AdobePdfEmbed } from "@/components/AdobePdfEmbed";
import ReusableModal from "@/components/Shared/Modal/ReusableModal";
import { useQuery } from "@tanstack/react-query";
import { useUserUnidades } from "@/hooks/useUserUnidades";
import { usePermissions } from "@/hooks/usePermissions";
import TeacherAppShell from "@/components/layout/TeacherAppShell";
import TeacherHubPage from "@/components/layout/TeacherHubPage";
import TeacherHubPageHeader from "@/components/layout/TeacherHubPageHeader";
import TeacherHubSearchRow from "@/components/layout/TeacherHubSearchRow";
import {
  DpEnter,
  DpStaggerItem,
  DpStaggerList,
  DpViewTransition,
} from "@/components/motion";
import {
  dpCardShadow,
  dpCtaPrimary,
  dpFocusRing,
  dpLiftable,
  dpPressable,
} from "@/styles/dpTokens";

const focusRing = dpFocusRing;
const pressable = dpPressable;
const liftable = dpLiftable;
const cardShadow = dpCardShadow;

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

type FolderPath =
  | { level: "root" }
  | { level: "unidad"; unidadId: string; unidadLabel: string }
  | {
      level: "unidad-area";
      unidadId: string;
      unidadLabel: string;
      area: string;
    }
  | { level: "individual-area"; area: string };

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

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

function getSessionArea(s: ISesion): string {
  const raw = s as any;
  const fromArea =
    raw.area?.nombre ?? (typeof raw.area === "string" ? raw.area : null);
  if (fromArea) return fromArea;
  try {
    const c = raw.contenido;
    const contenido = typeof c === "string" ? JSON.parse(c) : c;
    const area =
      contenido?.area?.nombre ??
      contenido?.area ??
      contenido?.datosGenerales?.area?.nombre ??
      contenido?.datosGenerales?.area;
    if (area) return typeof area === "string" ? area : (area?.nombre ?? "Otra");
  } catch {
    /* ignore */
  }
  return raw.problematica?.nombre ?? "Otra";
}

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

function groupSessionsByFolder(
  sessions: ISesion[],
  unidades: IUnidadListItem[],
): {
  porUnidad: Array<{
    unidadId: string;
    titulo: string;
    numeroUnidad: number;
    byArea: Array<{ areaName: string; sessions: ISesion[] }>;
  }>;
  individuales: Array<{ areaName: string; sessions: ISesion[] }>;
} {
  const byUnidad = new Map<
    string,
    { titulo: string; numeroUnidad: number; byArea: Map<string, ISesion[]> }
  >();
  const individualesByArea = new Map<string, ISesion[]>();

  for (const s of sessions) {
    const areaName = getSessionArea(s);
    const un = getSessionUnidad(s, unidades);

    if (un) {
      let folder = byUnidad.get(un.id);
      if (!folder) {
        folder = {
          titulo: un.titulo,
          numeroUnidad: un.numeroUnidad,
          byArea: new Map(),
        };
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

  const porUnidad: Array<{
    unidadId: string;
    titulo: string;
    numeroUnidad: number;
    byArea: Array<{ areaName: string; sessions: ISesion[] }>;
  }> = [];
  byUnidad.forEach((folder, unidadId) => {
    const byArea: Array<{ areaName: string; sessions: ISesion[] }> = [];
    folder.byArea.forEach((sessions, areaName) => {
      sessions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
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
    sessions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    individuales.push({ areaName, sessions });
  });
  individuales.sort((a, b) => a.areaName.localeCompare(b.areaName));

  return { porUnidad, individuales };
}

// ═══════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════

// ─── Breadcrumb ───

function Breadcrumb({
  path,
  onNavigate,
}: {
  path: FolderPath;
  onNavigate: (p: FolderPath) => void;
}) {
  const segments: Array<{ label: string; onClick?: () => void }> = [];

  segments.push({
    label: "Mis Sesiones",
    onClick:
      path.level !== "root" ? () => onNavigate({ level: "root" }) : undefined,
  });

  if (path.level === "unidad") {
    segments.push({ label: path.unidadLabel });
  } else if (path.level === "unidad-area") {
    segments.push({
      label: path.unidadLabel,
      onClick: () =>
        onNavigate({
          level: "unidad",
          unidadId: path.unidadId,
          unidadLabel: path.unidadLabel,
        }),
    });
    segments.push({ label: path.area });
  } else if (path.level === "individual-area") {
    segments.push({
      label: "Individuales",
      onClick: () => onNavigate({ level: "root" }),
    });
    segments.push({ label: path.area });
  }

  return (
    <DpEnter as="nav" className="mb-5 flex flex-wrap items-center gap-1 text-sm font-semibold" aria-label="Ubicación en mis sesiones">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]"
                aria-hidden="true"
              />
            )}
            {seg.onClick && !isLast ? (
              <button
                type="button"
                onClick={seg.onClick}
                className={`${focusRing} ${pressable} truncate max-w-[200px] font-bold text-[#3B6CB5] hover:underline`}
              >
                {seg.label}
              </button>
            ) : (
              <span className="truncate max-w-[200px] font-extrabold text-[#1F2937]">
                {seg.label}
              </span>
            )}
          </span>
        );
      })}
    </DpEnter>
  );
}

// ─── FolderCard (unit or area) ───

function FolderCard({
  title,
  subtitle,
  count,
  icon,
  wellClass = "bg-[#EAF2FC] text-[#3B6CB5]",
  onClick,
}: {
  title: string;
  subtitle?: string;
  count: number;
  icon: React.ReactNode;
  wellClass?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${focusRing} ${liftable} group w-full rounded-[20px] border border-[#E6EBF2] bg-white p-4 text-left sm:p-5 ${cardShadow}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] ${wellClass}`}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-extrabold text-[#1F2937] group-hover:text-[#3B6CB5]">
            {title}
          </span>
          {subtitle && (
            <span className="mt-0.5 block truncate text-sm font-semibold text-[#6B7280]">
              {subtitle}
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="rounded-full bg-[#F5F7FA] px-2.5 py-0.5 text-xs font-bold tabular-nums text-[#6B7280]">
            {count}
          </span>
          <ChevronRight
            className="h-4 w-4 text-[#9CA3AF] transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </button>
  );
}

// ─── SessionCard ───

function SessionCard({
  sesion,
  areaName,
  downloadingId,
  generatingWordId,
  confirmDeleteId,
  deletingId,
  onVer,
  onPreview,
  onDescargar,
  onWord,
  onEditar,
  onConfirmDelete,
  onCancelDelete,
  onEliminar,
}: {
  sesion: ISesion;
  areaName: string;
  downloadingId: string | null;
  generatingWordId: string | null;
  confirmDeleteId: string | null;
  deletingId: string | null;
  onVer: () => void;
  onPreview: () => void;
  onDescargar: () => void;
  onWord: () => void;
  onEditar: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onEliminar: () => void;
}) {
  const areaTheme = getAreaColor(areaName);
  const isConfirming = confirmDeleteId === sesion.id;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${liftable} group cursor-pointer rounded-[24px] border border-[#E6EBF2] bg-white ${cardShadow}`}
      onClick={onVer}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onVer();
        }
      }}
    >
      <div className="p-4 sm:p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 flex-1 text-base font-extrabold leading-snug text-[#1F2937]">
            {sesion.titulo || "Sin título"}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${areaTheme.pill}`}
          >
            {areaName}
          </span>
        </div>
        <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[#6B7280]">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          {formatFechaRelativa(sesion.createdAt)}
        </p>
        <p className="mb-4 text-sm font-semibold text-[#9CA3AF]">
          {sesion.nivel && <span>{sesion.nivel.nombre}</span>}
          {sesion.grado && <span> · {sesion.grado.nombre}</span>}
          <span> · {sesion.duracion} min</span>
        </p>
        <div
          className="flex flex-wrap gap-2 border-t border-[#E6EBF2] pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="outline"
            size="sm"
            className={`${focusRing} h-10 min-h-10 flex-1 border-[#E6EBF2] text-sm font-bold`}
            onClick={onVer}
          >
            <Eye className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Ver
          </Button>
          {sesion.pdfUrl && (
            <Button
              variant="outline"
              size="sm"
              className={`${focusRing} h-10 w-10 min-h-10 border-[#E6EBF2] p-0`}
              onClick={onPreview}
              title="Vista previa PDF"
              aria-label="Vista previa PDF"
            >
              <ScanSearch className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className={`${focusRing} h-10 w-10 min-h-10 border-[#E6EBF2] p-0`}
            onClick={onDescargar}
            disabled={downloadingId === sesion.id}
            title="Descargar PDF"
            aria-label="Descargar PDF"
          >
            {downloadingId === sesion.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${focusRing} h-10 w-10 min-h-10 border-[#E6EBF2] p-0 ${(sesion as any).wordUrl ? "border-[#BBF7D0] text-[#15803D]" : ""}`}
            onClick={onWord}
            disabled={generatingWordId === sesion.id}
            title={(sesion as any).wordUrl ? "Ver Word" : "Generar Word"}
            aria-label={(sesion as any).wordUrl ? "Ver Word" : "Generar Word"}
          >
            {generatingWordId === sesion.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${focusRing} h-10 w-10 min-h-10 border-[#E6EBF2] p-0`}
            onClick={onEditar}
            title="Editar"
            aria-label="Editar sesión"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {isConfirming ? (
            <div className="flex gap-1">
              <Button
                size="sm"
                className="h-10 min-h-10 bg-[#FEE2E2] px-3 text-sm font-bold text-[#B91C1C] hover:bg-[#FECACA]"
                onClick={onEliminar}
                disabled={deletingId === sesion.id}
              >
                {deletingId === sesion.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Sí, borrar"
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={`${focusRing} h-10 min-h-10 border-[#E6EBF2] px-3 text-sm font-bold`}
                onClick={onCancelDelete}
              >
                No
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className={`${focusRing} h-10 w-10 min-h-10 border-[#E6EBF2] p-0 text-[#DC2626] hover:bg-[#FEF2F2]`}
              onClick={onConfirmDelete}
              title="Eliminar"
              aria-label="Eliminar sesión"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════════════════════════

function MisSesiones() {
  const { user: authUser } = useAuthStore();
  const { user: usuario } = useUserStore();
  const navigate = useNavigate();

  const [sesiones, setSesiones] = useState<ISesion[]>([]);
  const [unidades, setUnidades] = useState<IUnidadListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [generatingWordId, setGeneratingWordId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [previewSesion, setPreviewSesion] = useState<ISesion | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [loadingPreviewPdf, setLoadingPreviewPdf] = useState(false);

  // ─── Folder navigation ───
  const [currentPath, setCurrentPath] = useState<FolderPath>({ level: "root" });

  const userId = authUser?.id || usuario?.id;

  const {
    data: sessions,
    isFetching: loadingSessions,
    isError: sessionsError,
    error: sessionsErrorObj,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["userSessions", userId],
    queryFn: () => obtenerSesionesPorUsuario(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const {
    data: unidadesData,
    isFetching: loadingUnidades,
    refetch: refetchUnidades,
  } = useUserUnidades();

  // Sync React Query data into local state (optimistic updates mutate this)
  useEffect(() => {
    if (!userId) return;
    setError(null);
    const sesionesArray = Array.isArray(sessions) ? [...sessions] : [];
    sesionesArray.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setSesiones(sesionesArray);
    setUnidades(Array.isArray(unidadesData) ? unidadesData : []);
  }, [userId, sessions, unidadesData]);

  useEffect(() => {
    if (!sessionsError) return;
    const err = sessionsErrorObj as any;
    const msg =
      err?.response?.data?.message || err?.message || "Error desconocido";
    setError(msg);
  }, [sessionsError, sessionsErrorObj]);

  // ─── Resolve PDF URL for preview modal ───
  useEffect(() => {
    if (!previewSesion?.pdfUrl) {
      if (previewSesion && !previewSesion.pdfUrl) {
        setPreviewPdfUrl(null);
        setLoadingPreviewPdf(false);
      }
      return;
    }
    let cancelled = false;
    setLoadingPreviewPdf(true);
    setPreviewPdfUrl(null);
    const run = async () => {
      const cdnUrl = buildCdnPdfUrl(previewSesion.pdfUrl ?? undefined);
      if (cdnUrl) {
        if (!cancelled) setPreviewPdfUrl(cdnUrl);
        if (!cancelled) setLoadingPreviewPdf(false);
        return;
      }
      try {
        const resp = await obtenerUrlDescarga(previewSesion.id);
        const url = resp?.data?.downloadUrl ?? (resp as any)?.downloadUrl;
        if (!cancelled && url) setPreviewPdfUrl(url);
      } catch {
        if (!cancelled)
          handleToaster(
            "No se pudo cargar el PDF para la vista previa",
            "error",
          );
      } finally {
        if (!cancelled) setLoadingPreviewPdf(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [previewSesion?.id, previewSesion?.pdfUrl]);

  // ─── Filter & group ───
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

  const { porUnidad, individuales } = groupSessionsByFolder(
    filteredSesiones,
    unidades,
  );

  // ─── Handlers ───
  const handleDescargar = async (sesionId: string) => {
    setDownloadingId(sesionId);
    try {
      const sesion = sesiones.find((s) => s.id === sesionId);
      const cdnUrl = buildCdnPdfUrl(sesion?.pdfUrl);
      if (cdnUrl) {
        window.open(cdnUrl, "_blank");
        handleToaster("PDF descargado", "success");
        return;
      }
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
      const msg =
        err?.response?.status === 404
          ? "Esta sesión aún no tiene PDF generado"
          : "Error al obtener la descarga";
      handleToaster(msg, "error");
    } finally {
      setDownloadingId(null);
    }
  };

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

  const handleWord = async (sesion: ISesion) => {
    if ((sesion as any).wordUrl) {
      try {
        const { obtenerDownloadUrlWord } =
          await import("@/services/pdfToWord.service");
        const url = await obtenerDownloadUrlWord(sesion.id);
        window.open(url, "_blank");
      } catch {
        handleToaster("Error al obtener el Word", "error");
      }
      return;
    }
    if (!sesion.pdfUrl) {
      handleToaster(
        "Esta sesión aún no tiene PDF. Ábrela primero para generarlo.",
        "warning",
      );
      return;
    }
    setGeneratingWordId(sesion.id);
    try {
      const { generarWordDesdePDFExistente } =
        await import("@/services/pdfToWord.service");
      const wordUrl = await generarWordDesdePDFExistente(sesion.id);
      setSesiones((prev) =>
        prev.map((s) =>
          s.id === sesion.id ? ({ ...s, wordUrl } as ISesion) : s,
        ),
      );
      handleToaster("Word generado y guardado", "success");
    } catch (err: any) {
      handleToaster(err?.message || "Error al generar Word", "error");
    } finally {
      setGeneratingWordId(null);
    }
  };

  const { isPremium, sesionesRestantes } = usePermissions();

  // ─── Meta ───
  const totalSesiones = sesiones.length;

  // ─── Render helpers for session card grid ───
  const renderSessionCards = (sessions: ISesion[], areaName: string) => (
    <DpStaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((sesion) => (
        <DpStaggerItem key={sesion.id}>
          <SessionCard
            sesion={sesion}
          areaName={areaName}
          downloadingId={downloadingId}
          generatingWordId={generatingWordId}
          confirmDeleteId={confirmDeleteId}
          deletingId={deletingId}
          onVer={() => navigate(`/sesion/${sesion.id}`)}
          onPreview={() => setPreviewSesion(sesion)}
          onDescargar={() => handleDescargar(sesion.id)}
          onWord={() => handleWord(sesion)}
          onEditar={() => navigate(`/editar-sesion/${sesion.id}`)}
          onConfirmDelete={() => setConfirmDeleteId(sesion.id)}
          onCancelDelete={() => setConfirmDeleteId(null)}
          onEliminar={() => handleEliminar(sesion.id)}
        />
        </DpStaggerItem>
      ))}
    </DpStaggerList>
  );

  // ─── Resolve current view data ───
  const renderFolderContent = () => {
    if (currentPath.level === "root") {
      const hasUnits = porUnidad.length > 0;
      const hasIndividuales = individuales.length > 0;

      if (!hasUnits && !hasIndividuales) {
        return (
          <DpEnter className="py-8 text-center text-sm font-semibold text-[#6B7280]">
            No hay sesiones que coincidan con la búsqueda.
          </DpEnter>
        );
      }

      return (
        <div className="space-y-8">
          {hasUnits && (
            <DpEnter as="section" delayMs={60}>
              <div className="mb-4 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-[#E3F8EC] text-[#15803D]">
                  <FolderOpen className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-extrabold text-[#1F2937]">
                  Unidades
                </h2>
              </div>
              <DpStaggerList className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {porUnidad.map((folder) => {
                  const totalInUnit = folder.byArea.reduce(
                    (sum, a) => sum + a.sessions.length,
                    0,
                  );
                  const label = `Unidad ${folder.numeroUnidad > 0 ? folder.numeroUnidad : ""}${folder.numeroUnidad > 0 ? ": " : ""}${folder.titulo}`;
                  return (
                    <DpStaggerItem key={folder.unidadId}>
                      <FolderCard
                        title={label}
                        subtitle={`${folder.byArea.length} área${folder.byArea.length === 1 ? "" : "s"}`}
                        count={totalInUnit}
                        icon={
                          <Folder className="h-5 w-5" aria-hidden="true" />
                        }
                        wellClass="bg-[#E3F8EC] text-[#15803D]"
                        onClick={() =>
                          setCurrentPath({
                            level: "unidad",
                            unidadId: folder.unidadId,
                            unidadLabel: label,
                          })
                        }
                      />
                    </DpStaggerItem>
                  );
                })}
              </DpStaggerList>
            </DpEnter>
          )}

          {hasIndividuales && (
            <DpEnter as="section" delayMs={100}>
              <div className="mb-4 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-[#EAF2FC] text-[#3B6CB5]">
                  <Folder className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-extrabold text-[#1F2937]">
                  Sesiones individuales
                </h2>
              </div>
              <DpStaggerList className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {individuales.map(({ areaName, sessions }) => {
                  const areaTheme = getAreaColor(areaName);
                  return (
                    <DpStaggerItem key={areaName}>
                      <FolderCard
                        title={areaName}
                        count={sessions.length}
                        icon={
                          <span
                            className={`h-3 w-3 rounded-full ${areaTheme.dot}`}
                          />
                        }
                        wellClass="bg-[#EAF2FC] text-[#3B6CB5]"
                        onClick={() =>
                          setCurrentPath({
                            level: "individual-area",
                            area: areaName,
                          })
                        }
                      />
                    </DpStaggerItem>
                  );
                })}
              </DpStaggerList>
            </DpEnter>
          )}
        </div>
      );
    }

    if (currentPath.level === "unidad") {
      const unit = porUnidad.find((u) => u.unidadId === currentPath.unidadId);
      if (!unit || unit.byArea.length === 0) {
        return (
          <DpEnter className="py-12 text-center">
            <Folder
              className="mx-auto mb-3 h-12 w-12 text-[#D1D5DB]"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-[#6B7280]">
              {searchTerm
                ? "No hay sesiones que coincidan en esta unidad."
                : "Esta unidad no tiene sesiones aún."}
            </p>
          </DpEnter>
        );
      }

      return (
        <DpStaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {unit.byArea.map(({ areaName, sessions }) => {
            const areaTheme = getAreaColor(areaName);
            return (
              <DpStaggerItem key={areaName}>
                <FolderCard
                  title={areaName}
                  count={sessions.length}
                  icon={
                    <span className={`h-3 w-3 rounded-full ${areaTheme.dot}`} />
                  }
                  wellClass="bg-[#EAF2FC] text-[#3B6CB5]"
                  onClick={() =>
                    setCurrentPath({
                      level: "unidad-area",
                      unidadId: currentPath.unidadId,
                      unidadLabel: currentPath.unidadLabel,
                      area: areaName,
                    })
                  }
                />
              </DpStaggerItem>
            );
          })}
        </DpStaggerList>
      );
    }

    if (currentPath.level === "unidad-area") {
      const unit = porUnidad.find((u) => u.unidadId === currentPath.unidadId);
      const areaData = unit?.byArea.find(
        (a) => a.areaName === currentPath.area,
      );
      if (!areaData || areaData.sessions.length === 0) {
        return (
          <DpEnter className="py-12 text-center">
            <FileText
              className="mx-auto mb-3 h-12 w-12 text-[#D1D5DB]"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-[#6B7280]">
              {searchTerm
                ? "No hay sesiones que coincidan aquí."
                : "No hay sesiones en esta área."}
            </p>
          </DpEnter>
        );
      }
      return renderSessionCards(areaData.sessions, currentPath.area);
    }

    if (currentPath.level === "individual-area") {
      const areaData = individuales.find(
        (a) => a.areaName === currentPath.area,
      );
      if (!areaData || areaData.sessions.length === 0) {
        return (
          <DpEnter className="py-12 text-center">
            <FileText
              className="mx-auto mb-3 h-12 w-12 text-[#D1D5DB]"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-[#6B7280]">
              {searchTerm
                ? "No hay sesiones que coincidan aquí."
                : "No hay sesiones en esta área."}
            </p>
          </DpEnter>
        );
      }
      return renderSessionCards(areaData.sessions, currentPath.area);
    }

    return null;
  };

  const folderViewKey =
    currentPath.level === "root"
      ? "root"
      : currentPath.level === "unidad"
        ? `unidad-${currentPath.unidadId}`
        : currentPath.level === "unidad-area"
          ? `ua-${currentPath.unidadId}-${currentPath.area}`
          : `ind-${currentPath.area}`;

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <>
      <TeacherAppShell activeNav="sesiones">
        <TeacherHubPage>
          <TeacherHubPageHeader
            title="Mis sesiones"
            description={
              <>
                <span>
                  {totalSesiones === 0
                    ? "Aún no has creado sesiones"
                    : `${totalSesiones} sesion${totalSesiones === 1 ? "" : "es"} de aprendizaje`}
                </span>
                {!isPremium && sesionesRestantes > 0 && (
                  <span className="rounded-full bg-[#FFF0E8] px-2.5 py-0.5 text-xs font-bold text-[#EA580C]">
                    {sesionesRestantes === 1
                      ? "1 sesión gratis"
                      : `${sesionesRestantes} sesiones gratis`}
                  </span>
                )}
              </>
            }
            backAction={
              currentPath.level !== "root"
                ? {
                    onClick: () => {
                      if (currentPath.level === "unidad-area") {
                        setCurrentPath({
                          level: "unidad",
                          unidadId: currentPath.unidadId,
                          unidadLabel: currentPath.unidadLabel,
                        });
                      } else {
                        setCurrentPath({ level: "root" });
                      }
                    },
                  }
                : undefined
            }
            primaryAction={{
              label: "Crear sesión",
              icon: <Plus className="mr-2 h-4 w-4" aria-hidden="true" />,
              onClick: () => navigate("/crear-sesion"),
              className: dpCtaPrimary,
            }}
          />

          <TeacherHubSearchRow
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm("")}
            placeholder="Buscar por título, nivel, grado…"
            onRefresh={() => {
              refetchSessions();
              refetchUnidades();
            }}
            refreshing={loadingSessions || loadingUnidades}
          />

          {/* ─── Breadcrumb (only when not at root) ─── */}
          {currentPath.level !== "root" && (
            <Breadcrumb path={currentPath} onNavigate={setCurrentPath} />
          )}

          {/* ─── Content ─── */}
          {loadingSessions || loadingUnidades ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`animate-pulse overflow-hidden rounded-[20px] border border-[#E6EBF2] bg-white ${cardShadow}`}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-11 w-11 rounded-[14px]" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4 rounded-lg" />
                        <Skeleton className="h-3 w-1/3 rounded-lg" />
                      </div>
                      <Skeleton className="h-5 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <DpEnter
              delayMs={80}
              className={`overflow-hidden rounded-[24px] border border-[#FECACA] bg-white py-16 text-center ${cardShadow}`}
            >
              <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-[20px] bg-[#FEE2E2]">
                <AlertTriangle
                  className="h-10 w-10 text-[#DC2626]"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mb-2 text-xl font-extrabold text-[#1F2937]">
                Error al cargar sesiones
              </h3>
              <p className="mx-auto mb-6 max-w-sm text-sm font-semibold text-[#6B7280]">
                {error}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  refetchSessions();
                  refetchUnidades();
                }}
                className={`${focusRing} border-[#FECACA] text-sm font-bold text-[#DC2626] hover:bg-[#FEF2F2]`}
              >
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                Reintentar
              </Button>
            </DpEnter>
          ) : filteredSesiones.length === 0 ? (
            <DpEnter
              delayMs={80}
              className={`overflow-hidden rounded-[24px] border border-[#E6EBF2] bg-white py-20 text-center ${cardShadow}`}
            >
              <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-[28px] bg-[#F5F7FA]">
                {searchTerm ? (
                  <Search
                    className="h-11 w-11 text-[#D1D5DB]"
                    aria-hidden="true"
                  />
                ) : (
                  <FileText
                    className="h-11 w-11 text-[#D1D5DB]"
                    aria-hidden="true"
                  />
                )}
              </div>
              <h3 className="mb-2 text-xl font-extrabold text-[#1F2937]">
                {searchTerm ? "Sin resultados" : "No tienes sesiones aún"}
              </h3>
              <p className="mx-auto mb-8 max-w-sm text-sm font-semibold leading-relaxed text-[#6B7280]">
                {searchTerm
                  ? `No se encontraron sesiones para "${searchTerm}". Intenta con otro término.`
                  : "Crea tu primera sesión de aprendizaje y aparecerá aquí."}
              </p>
              {searchTerm ? (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className={`${focusRing} border-[#E6EBF2] text-sm font-bold text-[#6B7280] hover:bg-[#F5F7FA]`}
                >
                  <X className="mr-2 h-4 w-4" aria-hidden="true" />
                  Limpiar búsqueda
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/crear-sesion")}
                  className={`${focusRing} ${liftable} dp-cta-soft-pattern inline-flex min-h-12 items-center justify-center rounded-[18px] bg-[#FF8B5C] px-5 text-base font-extrabold text-white shadow-[0_12px_28px_rgba(255,139,92,0.24)] hover:bg-[#F97316]`}
                >
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Crear mi primera sesión
                </Button>
              )}
            </DpEnter>
          ) : (
            <DpViewTransition viewKey={folderViewKey}>
              {renderFolderContent()}
            </DpViewTransition>
          )}
        </TeacherHubPage>
      </TeacherAppShell>

      {/* Modal Vista previa PDF */}
      <ReusableModal
        isOpen={!!previewSesion}
        onClose={() => {
          setPreviewSesion(null);
          setPreviewPdfUrl(null);
        }}
        title={
          previewSesion?.titulo
            ? `Vista previa: ${previewSesion.titulo}`
            : "Vista previa PDF"
        }
        size="full"
        gradient="amber-orange"
        presentation="material"
        closeOnOverlayClick={true}
      >
        <div className="flex flex-col" style={{ height: "78vh" }}>
          {loadingPreviewPdf && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
              <Loader2
                className="h-10 w-10 animate-spin text-[#3B6CB5]"
                aria-hidden="true"
              />
              <p className="text-sm font-semibold text-[#6B7280]">
                Cargando PDF…
              </p>
            </div>
          )}
          {!loadingPreviewPdf && previewPdfUrl && (
            <div className="min-h-0 w-full flex-1 overflow-hidden rounded-[16px] border border-[#E6EBF2]">
              <AdobePdfEmbed
                pdfUrl={previewPdfUrl}
                fileName={
                  previewSesion?.titulo
                    ? `${previewSesion.titulo}.pdf`
                    : "sesion.pdf"
                }
                embedMode="SIZED_CONTAINER"
                className="h-full w-full rounded-[16px]"
                showFullScreen={true}
                showDownloadPDF={true}
                showPrintPDF={true}
              />
            </div>
          )}
          {!loadingPreviewPdf &&
            previewSesion &&
            !previewPdfUrl &&
            previewSesion.pdfUrl && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
                <FileText
                  className="h-12 w-12 text-[#D1D5DB]"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-[#6B7280]">
                  No se pudo cargar el PDF.
                </p>
              </div>
            )}
        </div>
      </ReusableModal>
    </>
  );
}

export default MisSesiones;
