import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import {
  obtenerDownloadUrlUnidad,
  sincronizarMiembroUnidad,
  finalizarUnidad,
} from "@/services/unidad.service";
import { buildCdnPdfUrl } from "@/utils/cdn";
import type { IUnidadListItem } from "@/interfaces/IUnidadList";
import {
  FolderOpen,
  Search,
  Calendar,
  Download,
  Eye,
  Plus,
  Loader2,
  RefreshCw,
  AlertTriangle,
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
  FlagOff,
  CheckCircle2,
} from "lucide-react";
import { useUserUnidades } from "@/hooks/useUserUnidades";
import { isUnidadActiva, isUnidadFechaActiva } from "@/utils/unidadUtils";
import TeacherAppShell from "@/components/layout/TeacherAppShell";
import TeacherHubPage from "@/components/layout/TeacherHubPage";
import TeacherHubPageHeader from "@/components/layout/TeacherHubPageHeader";
import TeacherHubSearchRow from "@/components/layout/TeacherHubSearchRow";
import {
  dpCardShadow,
  dpCtaPrimary,
  dpFocusRing,
  dpLiftable,
} from "@/styles/dpTokens";
import {
  DpEnter,
  DpStaggerItem,
  DpStaggerList,
} from "@/components/motion";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";

const focusRing = dpFocusRing;
const liftable = dpLiftable;
const cardShadow = dpCardShadow;

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

function getTipoWellClass(tipo?: string) {
  if (tipo === "COMPARTIDA") return "bg-[#EAF2FC] text-[#3B6CB5]";
  return "bg-[#E3F8EC] text-[#15803D]";
}

function getTipoIcon(tipo?: string) {
  if (tipo === "COMPARTIDA") return <Users className="h-5 w-5" />;
  return <Lock className="h-4 w-4" />;
}

function formatPeriodo(fechaInicio?: string, fechaFin?: string) {
  if (!fechaInicio || !fechaFin) return null;
  return `${formatFecha(fechaInicio)} — ${formatFecha(fechaFin)}`;
}

/** Unidad finalizada = fechaFin existe y ya pasó */
function isUnidadFinalizada(fechaFin?: string | null): boolean {
  return fechaFin ? !isUnidadFechaActiva(fechaFin) : false;
}

/** Solo propietarios con pago CONFIRMADO y unidad activa pueden finalizar */
function puedeFinalizarUnidad(
  unidad: IUnidadListItem,
  userId?: string,
): boolean {
  const esPropietario =
    unidad._rol === "PROPIETARIO" ||
    (unidad.tipo === "PERSONAL" && !!userId && unidad.usuarioId === userId);
  const miembroPago = userId
    ? unidad.miembros?.find((m) => m.usuarioId === userId)
    : undefined;
  const estadoPago = miembroPago?.estadoPago ?? unidad.estadoPago;
  return (
    esPropietario &&
    estadoPago === "CONFIRMADO" &&
    !isUnidadFinalizada(unidad.fechaFin)
  );
}

function getTipoBadgeClasses(tipo?: string) {
  const base =
    "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold";
  if (tipo === "COMPARTIDA") {
    return `${base} border-[#BFDBFE] bg-[#EAF2FC] text-[#3B6CB5]`;
  }
  return `${base} border-[#BBF7D0] bg-[#E3F8EC] text-[#15803D]`;
}

function getEstadoPagoBadgeClasses(estado?: string) {
  const base =
    "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold";
  if (estado === "CONFIRMADO") {
    return `${base} border-[#BBF7D0] bg-[#E3F8EC] text-[#15803D]`;
  }
  if (estado === "PENDIENTE") {
    return `${base} border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]`;
  }
  return `${base} border-[#FECACA] bg-[#FEE2E2] text-[#DC2626]`;
}

// ─────────────────── Componente Principal ───────────────────

function MisUnidades() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [sincronizando, setSincronizando] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [finalizandoId, setFinalizandoId] = useState<string | null>(null);
  const [confirmFinalizarId, setConfirmFinalizarId] = useState<string | null>(
    null,
  );

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

  const { data, isFetching, isError, error, refetch } = useUserUnidades();

  // Derivar unidades ordenadas desde la query
  const unidades = useMemo(() => {
    if (!data) return [];
    return [...data].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [data]);

  // Sincronizar suscriptores que necesitan contenido personalizado
  useEffect(() => {
    if (!data) return;
    const needSync = data.filter(
      (u) => u._rol === "SUSCRIPTOR" && u.necesitaSincronizacion === true,
    );
    if (needSync.length === 0) return;
    let cancelled = false;
    setSincronizando(true);
    Promise.all(
      needSync.map((u) => sincronizarMiembroUnidad(u.id).catch(() => {})),
    ).finally(() => {
      if (!cancelled) {
        setSincronizando(false);
        refetch();
      }
    });
    return () => { cancelled = true; };
  }, [data]);

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
    if (unidad && esSuscriptor && !unidad.pdfUrl && unidad.contenido) {
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
        window.open(
          `${cdnUrl}${cdnUrl.includes("?") ? "&" : "?"}v=${bust}`,
          "_blank",
        );
        handleToaster("PDF descargado", "success");
        return;
      }

      handleToaster("No se encontró la URL de descarga", "error");
    } catch (err: any) {
      console.error("Error al descargar:", err);
      const msg =
        err?.response?.status === 404
          ? "Esta unidad aún no tiene PDF generado"
          : "Error al obtener la descarga";
      handleToaster(msg, "error");
    } finally {
      setDownloadingId(null);
    }
  };

  // ─── Finalizar unidad ───
  const handleFinalizar = async (unidadId: string) => {
    setConfirmFinalizarId(null);
    setFinalizandoId(unidadId);
    try {
      const res = await finalizarUnidad(unidadId);
      handleToaster(
        res.message || "Unidad finalizada correctamente",
        "success",
      );
      await refetch();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al finalizar la unidad";
      handleToaster(msg, "error");
    } finally {
      setFinalizandoId(null);
    }
  };

  const totalUnidades = unidades.length;
  const unidadesCompartidas = unidades.filter(
    (u) => u.tipo === "COMPARTIDA",
  ).length;

  return (
    <>
      <TeacherAppShell activeNav="unidades">
        <TeacherHubPage>
          <TeacherHubPageHeader
            title="Mis unidades"
            description={
              <>
                <span>
                  {totalUnidades === 0
                    ? "Aún no has creado unidades"
                    : `${totalUnidades} unidad${totalUnidades === 1 ? "" : "es"} de aprendizaje`}
                </span>
                {unidadesCompartidas > 0 && (
                  <span className="rounded-full bg-[#EAF2FC] px-2.5 py-0.5 text-xs font-bold text-[#3B6CB5]">
                    {unidadesCompartidas} compartida
                    {unidadesCompartidas === 1 ? "" : "s"}
                  </span>
                )}
              </>
            }
            primaryAction={{
              label: "Crear unidad",
              icon: <Plus className="mr-2 h-4 w-4" aria-hidden="true" />,
              onClick: () =>
                navigate("/crear-unidad", {
                  state: { iniciarNuevaUnidad: true },
                }),
              className: dpCtaPrimary,
            }}
          />

          <TeacherHubSearchRow
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm("")}
            placeholder="Buscar por nombre, tipo, código…"
            onRefresh={() => refetch()}
            refreshing={isFetching}
          />

          {sincronizando && (
            <DpEnter delayMs={60} className="mb-4 flex items-center gap-3 rounded-[16px] border border-[#E6EBF2] bg-[#EAF2FC] p-4">
              <Loader2
                className="h-5 w-5 shrink-0 animate-spin text-[#3B6CB5]"
                aria-hidden="true"
              />
              <p className="text-sm font-semibold text-[#3B6CB5]">
                Sincronizando contenido personalizado de tus unidades
                compartidas…
              </p>
            </DpEnter>
          )}

          {isFetching ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`animate-pulse overflow-hidden rounded-[24px] border border-[#E6EBF2] bg-white ${cardShadow}`}
                >
                  <div className="p-5">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <Skeleton className="mb-2 h-5 w-3/4 rounded-lg" />
                        <Skeleton className="h-3.5 w-1/3 rounded-lg" />
                      </div>
                      <Skeleton className="h-11 w-11 rounded-[14px]" />
                    </div>
                    <div className="mb-4 space-y-2.5">
                      <Skeleton className="h-3.5 w-2/3 rounded-lg" />
                      <Skeleton className="h-3.5 w-1/2 rounded-lg" />
                    </div>
                    <Skeleton className="mb-4 h-7 w-24 rounded-lg" />
                    <div className="flex gap-2 border-t border-[#E6EBF2] pt-3">
                      <Skeleton className="h-9 flex-1 rounded-lg" />
                      <Skeleton className="h-9 w-9 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
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
                Error al cargar unidades
              </h3>
              <p className="mx-auto mb-6 max-w-sm text-sm font-semibold text-[#6B7280]">
                {(error as Error)?.message || "Error desconocido"}
              </p>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className={`${focusRing} border-[#FECACA] text-sm font-bold text-[#DC2626] hover:bg-[#FEF2F2]`}
              >
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                Reintentar
              </Button>
            </DpEnter>
          ) : filteredUnidades.length === 0 ? (
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
                  <FolderOpen
                    className="h-11 w-11 text-[#D1D5DB]"
                    aria-hidden="true"
                  />
                )}
              </div>
              <h3 className="mb-2 text-xl font-extrabold text-[#1F2937]">
                {searchTerm ? "Sin resultados" : "No tienes unidades aún"}
              </h3>
              <p className="mx-auto mb-8 max-w-sm text-sm font-semibold leading-relaxed text-[#6B7280]">
                {searchTerm
                  ? `No se encontraron unidades para "${searchTerm}". Intenta con otro término.`
                  : "Crea tu primera unidad de aprendizaje y aparecerá aquí."}
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
                  onClick={() =>
                    navigate("/crear-unidad", {
                      state: { iniciarNuevaUnidad: true },
                    })
                  }
                  className={`${focusRing} ${liftable} dp-cta-soft-pattern inline-flex min-h-12 items-center justify-center rounded-[18px] bg-[#FF8B5C] px-5 text-base font-extrabold text-white shadow-[0_12px_28px_rgba(255,139,92,0.24)] hover:bg-[#F97316]`}
                >
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Crear mi primera unidad
                </Button>
              )}
            </DpEnter>
          ) : (
            <DpStaggerList className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredUnidades.map((unidad) => (
                <DpStaggerItem key={unidad.id}>
                  <div
                    className={`${liftable} group overflow-hidden rounded-[24px] border border-[#E6EBF2] bg-white ${cardShadow}`}
                  >
                  <div className="p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-[#1F2937] group-hover:text-[#3B6CB5]">
                          {unidad.titulo || "Sin título"}
                        </h3>
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#6B7280]">
                          <Calendar className="h-3 w-3" aria-hidden="true" />
                          {formatFechaRelativa(unidad.createdAt)}
                        </p>
                      </div>
                      <div
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] ${getTipoWellClass(unidad.tipo)}`}
                      >
                        {getTipoIcon(unidad.tipo)}
                      </div>
                    </div>

                    <div className="mb-3 space-y-1.5 text-sm font-semibold text-[#6B7280]">
                      {unidad.nivel?.nombre && (
                        <div className="flex items-center gap-2">
                          <GraduationCap
                            className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]"
                            aria-hidden="true"
                          />
                          <span className="truncate">
                            {unidad.nivel.nombre}
                            {unidad.grado?.nombre
                              ? ` — ${unidad.grado.nombre}`
                              : ""}
                          </span>
                        </div>
                      )}
                      {unidad.problematica?.nombre && (
                        <div className="flex items-center gap-2">
                          <BookOpen
                            className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]"
                            aria-hidden="true"
                          />
                          <span className="truncate">
                            {unidad.problematica.nombre}
                          </span>
                        </div>
                      )}
                      {unidad.fechaInicio && unidad.fechaFin && (
                        <div className="flex items-center gap-2">
                          <Clock
                            className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]"
                            aria-hidden="true"
                          />
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
                    {unidad.tipo === "COMPARTIDA" &&
                      unidad.miembros?.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F7FA] px-2.5 py-1 text-xs font-bold text-[#6B7280]">
                          <Users className="h-3 w-3" aria-hidden="true" />
                          {unidad.miembros.length} miembro
                          {unidad.miembros.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    {unidad.tipo === "COMPARTIDA" &&
                      unidad.codigoCompartido && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#BBF7D0] bg-[#E3F8EC] px-2.5 py-1 font-mono text-xs font-bold text-[#15803D]">
                          <Share2 className="h-3 w-3" aria-hidden="true" />
                          {unidad.codigoCompartido}
                        </span>
                      )}
                    {(() => {
                      const miembroPago = unidad.miembros?.find(
                        (m) => m.usuarioId === userId,
                      );
                      const estado =
                        miembroPago?.estadoPago ?? unidad.estadoPago;
                      if (!estado) return null;
                      return (
                        <span className={getEstadoPagoBadgeClasses(estado)}>
                          {estado === "CONFIRMADO"
                            ? "Pagado"
                            : estado === "PENDIENTE"
                              ? "Pendiente"
                              : "Rechazado"}
                        </span>
                      );
                    })()}
                    {isUnidadFinalizada(unidad.fechaFin) && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#E6EBF2] bg-[#F5F7FA] px-2.5 py-1 text-xs font-bold text-[#6B7280]">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        Finalizada
                      </span>
                    )}
                  </div>

                  {/* Compartir código (solo COMPARTIDA) */}
                  {unidad.tipo === "COMPARTIDA" && unidad.codigoCompartido && (
                    <div className="flex items-center gap-2 border-t border-[#E6EBF2] pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${focusRing} h-10 min-h-10 flex-1 border-[#BBF7D0] text-xs font-bold text-[#15803D] hover:bg-[#E3F8EC]`}
                        onClick={() =>
                          handleCopiarCodigo(
                            unidad.id,
                            unidad.codigoCompartido!,
                          )
                        }
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
                        onClick={() =>
                          handleCompartirWhatsApp(
                            unidad.titulo,
                            unidad.codigoCompartido!,
                          )
                        }
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        WhatsApp
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-2 border-t border-[#E6EBF2] pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${focusRing} h-10 min-h-10 flex-1 border-[#E6EBF2] text-sm font-bold`}
                      onClick={() => {
                        if (unidad._rol === "SUSCRIPTOR") {
                          navigate(`/unidad/${unidad.id}`, {
                            state: { rol: "SUSCRIPTOR" },
                          });
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
                      className={`${focusRing} h-10 w-10 min-h-10 border-[#E6EBF2] p-0`}
                      onClick={() => handleDescargar(unidad.id)}
                      disabled={downloadingId === unidad.id}
                      title="Descargar PDF"
                      aria-label="Descargar PDF"
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
                      className={`${focusRing} h-10 w-10 min-h-10 border-[#E6EBF2] p-0`}
                      onClick={() => navigate(`/editar-unidad/${unidad.id}`)}
                      title="Editar contenido"
                      aria-label="Editar unidad"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {puedeFinalizarUnidad(unidad, userId) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${focusRing} h-10 w-10 min-h-10 border-[#E6EBF2] p-0 text-[#DC2626] hover:bg-[#FEF2F2]`}
                        onClick={() => setConfirmFinalizarId(unidad.id)}
                        disabled={finalizandoId === unidad.id}
                        title="Finalizar unidad"
                        aria-label="Finalizar unidad"
                      >
                        {finalizandoId === unidad.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <FlagOff className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                  </div>
                  </div>
                </DpStaggerItem>
              ))}
            </DpStaggerList>
          )}
        </TeacherHubPage>
      </TeacherAppShell>

      {/* ─── Modal confirmar finalizar ─── */}
      {confirmFinalizarId &&
        (() => {
          const unidadTarget = unidades.find(
            (u) => u.id === confirmFinalizarId,
          );
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => setConfirmFinalizarId(null)}
            >
              <div
                className={`w-full max-w-md rounded-[24px] border border-[#E6EBF2] bg-white p-6 ${cardShadow}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#FEE2E2]">
                    <FlagOff
                      className="h-5 w-5 text-[#DC2626]"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-lg font-extrabold text-[#1F2937]">
                    Finalizar unidad
                  </h3>
                </div>

                <p className="mb-2 text-sm font-semibold text-[#6B7280]">
                  ¿Estás seguro que deseas finalizar{" "}
                  <span className="font-extrabold text-[#1F2937]">
                    "{unidadTarget?.titulo}"
                  </span>
                  ?
                </p>
                <p className="mb-6 text-sm font-semibold text-[#9CA3AF]">
                  La unidad quedará cerrada. Seguirá existiendo con todas sus
                  sesiones y PDFs, pero dejará de contar como activa, lo que te
                  permitirá crear una nueva unidad.
                </p>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmFinalizarId(null)}
                    disabled={finalizandoId === confirmFinalizarId}
                    className={`${focusRing} text-sm font-bold`}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleFinalizar(confirmFinalizarId)}
                    disabled={finalizandoId === confirmFinalizarId}
                    className="bg-[#DC2626] text-sm font-bold text-white hover:bg-[#B91C1C]"
                  >
                    {finalizandoId === confirmFinalizarId ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        Finalizando...
                      </>
                    ) : (
                      <>
                        <FlagOff className="h-4 w-4 mr-1.5" />
                        Sí, finalizar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
}

export default MisUnidades;
