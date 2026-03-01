import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { usePermissions } from "@/hooks/usePermissions";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { listarUnidadesByUsuario, sincronizarMiembroUnidad } from "@/services/unidad.service";
import { generarSesionUnidad } from "@/services/sesiones.service";
import { generarImagenesSesion } from "@/services/ia-sesion.service";
import { useInstrumentoEvaluacion } from "@/hooks/useInstrumentoEvaluacion";
import type { IInstrumentoEvaluacion } from "@/interfaces/IInstrumentoEvaluacion";
import type { IUnidadListItem, IUnidadListMiembroArea } from "@/interfaces/IUnidadList";
import type { ISesionPremiumResponse } from "@/interfaces/ISesionPremium";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  FolderOpen,
  ImageIcon,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Sparkles,
  Sun,
  AlertTriangle,
} from "lucide-react";
import { AREA_COLORS, DEFAULT_AREA_COLOR, type AreaColorConfig } from "@/constants/areaColors";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ITurnoData {
  area: string;
  actividad: string;
}

interface IDiaData {
  dia: string;
  fecha: string;
  turnoManana: ITurnoData;
  turnoTarde: ITurnoData;
}

interface ISemanaData {
  semana: number;
  dias: IDiaData[];
}

type SlotKey = string;
type SlotState = "generada" | "clonada" | "disponible" | "en_espera" | "bloqueada";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const DIA_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];



// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function makeSlotKey(semana: number, dia: string, turno: "mañana" | "tarde"): SlotKey {
  return `${semana}-${dia}-${turno}`;
}

function getSlotOrderInWeek(dia: string, turno: "mañana" | "tarde"): number {
  return DIA_ORDER.indexOf(dia) * 2 + (turno === "tarde" ? 1 : 0);
}

function calcularSemanaActual(fechaInicio: string, duracion: number): number {
  const start = new Date(fechaInicio);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  if (today < start) return 1;
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
  return Math.min(Math.max(Math.floor(diffDays / 7) + 1, 1), duracion);
}

/** Busca el areaId por nombre dentro de las areas del miembro.
 *  Normaliza ambos lados: elimina "Área de " prefix y compara.
 *  Fallback: coincidencia parcial (includes) si no hay match exacto.
 */
function findAreaId(
  areaName: string,
  areas: IUnidadListMiembroArea[],
): number | undefined {
  if (!areaName || !areas.length) return undefined;

  const stripPrefix = (s: string) =>
    s.toLowerCase().replace(/^área de\s*/i, "").trim();

  const normalized = stripPrefix(areaName);

  // Intento 1: match exacto (sin prefijo "Área de")
  const exact = areas.find((a) => stripPrefix(a.area?.nombre || "") === normalized);
  if (exact) return exact.areaId;

  // Intento 2: coincidencia parcial (includes en ambas direcciones)
  const partial = areas.find((a) => {
    const clean = stripPrefix(a.area?.nombre || "");
    return clean.includes(normalized) || normalized.includes(clean);
  });
  return partial?.areaId;
}

function getAreaTheme(area: string): AreaColorConfig {
  return AREA_COLORS[area] || DEFAULT_AREA_COLOR;
}

function formatFechaDia(fecha: string): string {
  try {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
    }).format(new Date(fecha + "T12:00:00"));
  } catch {
    return fecha;
  }
}

function isHoy(fecha: string): boolean {
  const today = new Date();
  const d = new Date(fecha + "T12:00:00");
  return (
    today.getFullYear() === d.getFullYear() &&
    today.getMonth() === d.getMonth() &&
    today.getDate() === d.getDate()
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function GenerarSesionPremium() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const permissions = usePermissions();
  const { generarInstrumento, guardar: guardarInstrumento } = useInstrumentoEvaluacion();
  const userId = user?.id;

  // ─── State ───
  const [unidades, setUnidades] = useState<IUnidadListItem[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(true);
  const [errorUnidades, setErrorUnidades] = useState<string | null>(null);
  /** Sincronizando contenido personalizado para suscriptor */
  const [sincronizando, setSincronizando] = useState(false);
  const [selectedUnidadId, setSelectedUnidadId] = useState<string | null>(null);
  const [displayWeek, setDisplayWeek] = useState(1);
  const [generatedSlots, setGeneratedSlots] = useState<Set<SlotKey>>(new Set());
  const [generatedSesiones, setGeneratedSesiones] = useState<
    Map<SlotKey, { id: string; titulo: string }>
  >(new Map());
  const [premiumResponses, setPremiumResponses] = useState<
    Map<SlotKey, ISesionPremiumResponse>
  >(new Map());
  const [generatingSlot, setGeneratingSlot] = useState<SlotKey | null>(null);
  /** Slots donde las imágenes se están generando en segundo plano */
  const [generatingImages, setGeneratingImages] = useState<Set<SlotKey>>(new Set());
  /** Instrumentos de evaluación generados por slot */
  const [instrumentosMap, setInstrumentosMap] = useState<Map<SlotKey, IInstrumentoEvaluacion>>(new Map());
  /** Slots que fueron clonados (otro miembro creó la sesión) */
  const [clonedSlots, setClonedSlots] = useState<Set<SlotKey>>(new Set());

  // ─── Derived ───
  const unidadesActivas = useMemo(
    () =>
      unidades.filter((u) => {
        const miembro = u.miembros.find((mb) => mb.usuarioId === userId);
        return miembro?.estadoPago === "CONFIRMADO";
      }),
    [unidades, userId],
  );

  const selectedUnidad = useMemo(
    () => unidadesActivas.find((u) => u.id === selectedUnidadId) ?? null,
    [unidadesActivas, selectedUnidadId],
  );

  /** Áreas del miembro actual (puede estar vacío si ya no hay restricciones por miembro) */
  const miembroAreas = useMemo<IUnidadListMiembroArea[]>(() => {
    if (!selectedUnidad || !userId) return [];
    return (
      selectedUnidad.miembros.find((mb) => mb.usuarioId === userId)?.areas ?? []
    );
  }, [selectedUnidad, userId]);

  /** Pool de TODAS las áreas de la unidad (de cualquier miembro).
   *  Se usa como fallback cuando el miembro actual no tiene áreas asignadas,
   *  ya que ahora todos los docentes acceden a todas las áreas. */
  const allUnidadAreas = useMemo<IUnidadListMiembroArea[]>(() => {
    if (!selectedUnidad) return [];
    const seen = new Set<number>();
    const all: IUnidadListMiembroArea[] = [];
    for (const mb of selectedUnidad.miembros) {
      for (const a of mb.areas ?? []) {
        if (!seen.has(a.areaId)) {
          seen.add(a.areaId);
          all.push(a);
        }
      }
    }
    return all;
  }, [selectedUnidad]);

  const semanas = useMemo<ISemanaData[]>(() => {
    try {
      return (
        (selectedUnidad?.contenido?.secuencia?.semanas as ISemanaData[]) ?? []
      );
    } catch {
      return [];
    }
  }, [selectedUnidad]);

  const totalWeeks = selectedUnidad?.duracion ?? semanas.length ?? 0;

  const semanaActualReal = useMemo(() => {
    if (!selectedUnidad) return 1;
    return calcularSemanaActual(selectedUnidad.fechaInicio, totalWeeks);
  }, [selectedUnidad, totalWeeks]);

  const currentSemana = useMemo<ISemanaData | null>(
    () => semanas.find((s) => s.semana === displayWeek) ?? null,
    [semanas, displayWeek],
  );

  const weekDateRange = useMemo(() => {
    if (!currentSemana?.dias?.length) return null;
    return {
      start: currentSemana.dias[0]?.fecha,
      end: currentSemana.dias[currentSemana.dias.length - 1]?.fecha,
    };
  }, [currentSemana]);

  // ─── Slot states ───
  const isCurrentWeek = displayWeek === semanaActualReal;
  const isPastWeek = displayWeek < semanaActualReal;
  const isFutureWeek = displayWeek > semanaActualReal;

  const slotStates = useMemo<Map<SlotKey, SlotState>>(() => {
    const map = new Map<SlotKey, SlotState>();
    if (!currentSemana) return map;
    const wk = currentSemana.semana;

    // Collect all slots in order
    const allSlots: { key: SlotKey; order: number; area: string }[] = [];
    currentSemana.dias.forEach((d) => {
      allSlots.push({
        key: makeSlotKey(wk, d.dia, "mañana"),
        order: getSlotOrderInWeek(d.dia, "mañana"),
        area: d.turnoManana.area,
      });
      allSlots.push({
        key: makeSlotKey(wk, d.dia, "tarde"),
        order: getSlotOrderInWeek(d.dia, "tarde"),
        area: d.turnoTarde.area,
      });
    });
    allSlots.sort((a, b) => a.order - b.order);

    // Future weeks → all blocked
    if (isFutureWeek) {
      for (const slot of allSlots) {
        map.set(slot.key, "bloqueada");
      }
      return map;
    }

    // Past weeks → show generated/clonada or blocked
    if (isPastWeek) {
      for (const slot of allSlots) {
        if (generatedSlots.has(slot.key)) {
          map.set(slot.key, clonedSlots.has(slot.key) ? "clonada" : "generada");
        } else {
          map.set(slot.key, "bloqueada");
        }
      }
      return map;
    }

    // Current week → slots disponibles, generados o clonados
    for (const slot of allSlots) {
      if (generatedSlots.has(slot.key)) {
        map.set(slot.key, clonedSlots.has(slot.key) ? "clonada" : "generada");
      } else {
        map.set(slot.key, "disponible");
      }
    }
    return map;
  }, [currentSemana, generatedSlots, clonedSlots, isCurrentWeek, isPastWeek, isFutureWeek]);

  // ─── Progress ───
  const weekProgress = useMemo(() => {
    if (!currentSemana) return { generated: 0, total: 0 };
    const wk = currentSemana.semana;
    let total = 0;
    let generated = 0;
    currentSemana.dias.forEach((d) => {
      for (const turno of ["mañana", "tarde"] as const) {
        total++;
        if (generatedSlots.has(makeSlotKey(wk, d.dia, turno))) generated++;
      }
    });
    return { generated, total };
  }, [currentSemana, generatedSlots]);

  // ═══════════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  const cargarUnidades = useCallback(async () => {
    if (!userId) return;
    setLoadingUnidades(true);
    setErrorUnidades(null);
    try {
      let items = await listarUnidadesByUsuario(userId);
      
      // Sincronizar automáticamente suscriptores que necesitan contenido personalizado
      const unidadesNecesitanSync = items.filter(
        (u) => u._rol === "SUSCRIPTOR" && u.necesitaSincronizacion === true
      );
      
      if (unidadesNecesitanSync.length > 0) {
        setSincronizando(true);
        try {
          // Sincronizar cada unidad que lo necesite
          await Promise.all(
            unidadesNecesitanSync.map(async (u) => {
              try {
                const result = await sincronizarMiembroUnidad(u.id);
                console.log(`✅ Sincronizado: ${u.titulo} - ${result.sesionesClonadas} sesiones clonadas`);
              } catch (syncErr) {
                console.warn(`⚠️ Error sincronizando ${u.titulo}:`, syncErr);
              }
            })
          );
          // Recargar unidades después de sincronizar
          items = await listarUnidadesByUsuario(userId);
        } finally {
          setSincronizando(false);
        }
      }
      
      setUnidades(items);
      const activas = items.filter((u) => {
        const mb = u.miembros.find((m) => m.usuarioId === userId);
        return mb?.estadoPago === "CONFIRMADO";
      });
      if (activas.length === 1) setSelectedUnidadId(activas[0].id);
    } catch (err: any) {
      setErrorUnidades(
        err?.response?.data?.message ||
          err?.message ||
          "Error al cargar unidades",
      );
    } finally {
      setLoadingUnidades(false);
    }
  }, [userId]);

  useEffect(() => {
    cargarUnidades();
  }, [cargarUnidades]);

  // Set initial week + detect existing sessions
  useEffect(() => {
    if (!selectedUnidad) return;
    const actual = calcularSemanaActual(
      selectedUnidad.fechaInicio,
      selectedUnidad.duracion,
    );
    setDisplayWeek(actual);

    // Try to restore generated sessions from unidad.sesiones
    const gen = new Set<SlotKey>();
    const cloned = new Set<SlotKey>();
    const sesMap = new Map<SlotKey, { id: string; titulo: string }>();
    if (selectedUnidad.sesiones?.length) {
      for (const ses of selectedUnidad.sesiones as any[]) {
        if (ses.semana && ses.dia && ses.turno) {
          const key = makeSlotKey(ses.semana, ses.dia, ses.turno);
          gen.add(key);
          sesMap.set(key, {
            id: ses.id,
            titulo: ses.titulo || "Sesión generada",
          });
          // sesionOrigenId !== null indica que fue clonada de otro miembro
          if (ses.sesionOrigenId) {
            cloned.add(key);
          }
        }
      }
    }
    setGeneratedSlots(gen);
    setClonedSlots(cloned);
    setGeneratedSesiones(sesMap);
  }, [selectedUnidad]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleGenerar = async (
    dia: string,
    turno: "mañana" | "tarde",
    actividad: string,
    areaName: string,
  ) => {
    if (!selectedUnidadId || !currentSemana) return;

    // Buscar areaId: primero en áreas del miembro, luego en todas las áreas de la unidad
    const areasPool = miembroAreas.length > 0 ? miembroAreas : allUnidadAreas;
    const areaId = findAreaId(areaName, areasPool);

    if (!areaId) {
      handleToaster(
        `No se pudo identificar el área "${areaName}". Intenta recargar la página.`,
        "error",
      );
      return;
    }

    const key = makeSlotKey(currentSemana.semana, dia, turno);
    setGeneratingSlot(key);
    try {
      // ═══════════════════════════════════════════════════════════════
      // FASE 1: Generar texto de la sesión (rápido, ~20-30s)
      // ═══════════════════════════════════════════════════════════════
      const resp = await generarSesionUnidad(selectedUnidadId, {
        areaId,
        semana: currentSemana.semana,
        dia,
        turno,
        tituloActividad: actividad,
      });
      // Si yaExistia === true, la sesión ya fue generada por otro miembro (clonada)
      if ((resp as any).yaExistia) {
        handleToaster(
          "Esta sesión ya fue generada por otro miembro. Se cargó tu copia personalizada.",
          "success",
        );
      } else {
        handleToaster(
          resp.message || "¡Sesión generada con éxito!",
          "success",
        );
      }
      setGeneratedSlots((prev) => new Set(prev).add(key));
      if (resp.sesion) {
        setGeneratedSesiones((prev) =>
          new Map(prev).set(key, {
            id: resp.sesion!.id,
            titulo: resp.sesion!.titulo,
          }),
        );
        // Store the full backend response for PDF generation
        const fullResp = resp as unknown as ISesionPremiumResponse;
        if (fullResp.sesion && fullResp.docente !== undefined) {
          setPremiumResponses((prev) => new Map(prev).set(key, fullResp));

          // ═══════════════════════════════════════════════════════════
          // FASE 2: Generar imágenes en background (sin bloquear UI)
          // ═══════════════════════════════════════════════════════════
          setGeneratingSlot(null); // Liberar slot principal

          setGeneratingImages((prev) => new Set(prev).add(key));
          generarImagenesSesion({
            sesion: fullResp.sesion as unknown as Record<string, any>,
            area: areaName,
            grado: typeof fullResp.sesion.grado === "string"
              ? fullResp.sesion.grado
              : (fullResp.sesion.grado as any)?.nombre || "",
            tema: actividad,
          })
            .then((imgRes) => {
              if (imgRes.success && imgRes.data) {
                // Inyectar imágenes en los procesos de la sesión
                setPremiumResponses((prev) => {
                  const current = prev.get(key);
                  if (!current) return prev;

                  const sesionActualizada = { ...current.sesion };

                  const mergeImgs = (
                    fase: "inicio" | "desarrollo" | "cierre",
                    items?: Array<any>,
                  ) => {
                    if (!items?.length || !sesionActualizada[fase]) return;
                    const procesos = [...sesionActualizada[fase].procesos];
                    items.forEach((item, i) => {
                      const idx = item.index ?? i;
                      const img = item.imagen;
                      if (idx >= 0 && idx < procesos.length && img) {
                        procesos[idx] = { ...procesos[idx], imagen: img };
                      }
                    });
                    sesionActualizada[fase] = {
                      ...sesionActualizada[fase],
                      procesos,
                    };
                  };

                  mergeImgs("inicio", imgRes.data.inicio?.procesos);
                  mergeImgs("desarrollo", imgRes.data.desarrollo?.procesos);
                  mergeImgs("cierre", imgRes.data.cierre?.procesos);

                  return new Map(prev).set(key, {
                    ...current,
                    sesion: sesionActualizada as ISesionPremiumResponse["sesion"],
                  });
                });
                handleToaster("Imágenes generadas para la sesión", "success");
              }
            })
            .catch((imgErr) => {
              console.warn("⚠️ No se pudieron generar imágenes premium:", imgErr);
              handleToaster(
                "La sesión se generó correctamente, pero no se pudieron crear las imágenes",
                "warning",
              );
            })
            .finally(() => {
              setGeneratingImages((prev) => {
                const next = new Set(prev);
                next.delete(key);
                return next;
              });
            });

          // ═══════════════════════════════════════════════════════════
          // FASE 3: Generar instrumento de evaluación en background
          // ═══════════════════════════════════════════════════════════
          generarInstrumento(fullResp.sesion)
            .then((inst) => {
              if (inst) {
                // Almacenar en el Map para pasarlo a la vista de resultado
                setInstrumentosMap((prev) => new Map(prev).set(key, inst));
                handleToaster("Instrumento de evaluación generado", "success");
                // Persistir en S3 en segundo plano (fire-and-forget)
                guardarInstrumento(fullResp.sesion.id).catch((err) =>
                  console.warn("⚠️ No se pudo guardar instrumento en S3:", err),
                );
              }
            })
            .catch((err) => {
              console.warn("⚠️ No se pudo generar el instrumento:", err);
            });

          return; // No llegar al finally que haría setGeneratingSlot(null) otra vez
        }
      }
    } catch (err: any) {
      handleToaster(
        err?.response?.data?.message || "Error al generar sesión",
        "error",
      );
    } finally {
      setGeneratingSlot(null);
    }
  };

  const goToPrevWeek = () => setDisplayWeek((w) => Math.max(1, w - 1));
  const goToNextWeek = () => setDisplayWeek((w) => Math.min(totalWeeks, w + 1));
  const goToCurrentWeek = () => setDisplayWeek(semanaActualReal);
  const handleSelectUnidad = (id: string) => {
    setSelectedUnidadId(id);
    setGeneratedSlots(new Set());
    setGeneratedSesiones(new Map());
    setPremiumResponses(new Map());
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ─── Header ─── */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Generar Sesión
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                Genera tus sesiones de aprendizaje con IA
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-500/20 dark:to-yellow-500/20 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-500/30">
              {permissions.planLabel}
            </span>
          </div>
        </div>

        {/* ─── Loading ─── */}
        {loadingUnidades && !sincronizando && (
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {/* ─── Sincronizando contenido personalizado (Suscriptor) ─── */}
        {sincronizando && (
          <div className="rounded-2xl border border-violet-200 dark:border-violet-700/50 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-violet-500/10 dark:via-purple-500/10 dark:to-indigo-500/10 p-12 text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              {/* Círculos animados */}
              <div className="absolute inset-0 rounded-full border-4 border-violet-200 dark:border-violet-700/50" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 dark:border-t-violet-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-400 dark:border-t-purple-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-violet-600 dark:text-violet-400 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Preparando tu contenido personalizado
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
              Estamos clonando tu unidad con tu nombre e institución educativa...
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-violet-600 dark:text-violet-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sincronizando sesiones...</span>
            </div>
          </div>
        )}

        {/* ─── Error ─── */}
        {errorUnidades && !loadingUnidades && (
          <div className="rounded-xl border border-red-200 dark:border-red-800/30 bg-white dark:bg-slate-800/50 p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              {errorUnidades}
            </p>
            <Button variant="outline" onClick={cargarUnidades}>
              <RefreshCw className="h-4 w-4 mr-2" /> Reintentar
            </Button>
          </div>
        )}

        {/* ─── Sin unidades activas ─── */}
        {!loadingUnidades && !errorUnidades && unidadesActivas.length === 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
              <FolderOpen className="h-10 w-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No tienes unidades activas
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Necesitas una unidad con pago confirmado para generar sesiones.
            </p>
            <Button
              onClick={() => navigate("/crear-unidad")}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Crear Unidad
            </Button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MAIN CONTENT
        ═══════════════════════════════════════════════════════════════════ */}
        {!loadingUnidades && !errorUnidades && unidadesActivas.length > 0 && (
          <>
            {/* ─── Selector de unidad (múltiples) ─── */}
            {unidadesActivas.length > 1 && (
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Selecciona una unidad
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {unidadesActivas.map((u) => {
                    const isSel = u.id === selectedUnidadId;
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleSelectUnidad(u.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSel
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10 shadow-md shadow-violet-500/10"
                            : "border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${isSel ? "bg-violet-100 dark:bg-violet-500/20" : "bg-slate-100 dark:bg-slate-700/50"}`}
                          >
                            <BookOpen
                              className={`h-5 w-5 ${isSel ? "text-violet-600 dark:text-violet-400" : "text-slate-400"}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-semibold truncate ${isSel ? "text-violet-700 dark:text-violet-300" : "text-slate-900 dark:text-white"}`}
                            >
                              {u.titulo}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {u.nivel?.nombre} — {u.grado?.nombre} ·{" "}
                              {u.duracion} semanas
                            </p>
                          </div>
                          {isSel && (
                            <Check className="h-5 w-5 text-violet-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Info de unidad (única) ─── */}
            {unidadesActivas.length === 1 && selectedUnidad && (
              <div className="mb-6 p-4 rounded-xl border border-violet-200/60 dark:border-violet-700/40 bg-violet-50/50 dark:bg-violet-500/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-500/20">
                    <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedUnidad.titulo}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedUnidad.nivel?.nombre} —{" "}
                      {selectedUnidad.grado?.nombre} ·{" "}
                      {selectedUnidad.duracion} semanas
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                CALENDARIO SEMANAL
            ═══════════════════════════════════════════════════════════════ */}
            {selectedUnidad && currentSemana && (
              <>
                {/* ─── Week Navigation ─── */}
                <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50 shadow-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPrevWeek}
                      disabled={displayWeek <= 1}
                      className="p-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <div className="text-center min-w-[110px]">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        Semana {displayWeek}
                      </span>
                      <span className="text-sm text-slate-400 dark:text-slate-500 ml-1">
                        de {totalWeeks}
                      </span>
                    </div>
                    <button
                      onClick={goToNextWeek}
                      disabled={displayWeek >= totalWeeks}
                      className="p-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </button>

                    {displayWeek === semanaActualReal && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300">
                        Actual
                      </span>
                    )}
                    {displayWeek > semanaActualReal && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5" />
                        Bloqueada
                      </span>
                    )}
                    {displayWeek < semanaActualReal && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500">
                        Pasada
                      </span>
                    )}
                    {displayWeek !== semanaActualReal && (
                      <button
                        onClick={goToCurrentWeek}
                        className="text-xs text-violet-600 dark:text-violet-400 hover:underline ml-1"
                      >
                        Ir a semana actual
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    {weekDateRange && (
                      <span>
                        {formatFechaDia(weekDateRange.start)} —{" "}
                        {formatFechaDia(weekDateRange.end)}{" "}
                        {new Date(
                          weekDateRange.start + "T12:00:00",
                        ).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>

                {/* ─── Blocked week overlay message ─── */}
                {isFutureWeek && (
                  <div className="mb-5 flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                      <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Semana no disponible</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Esta semana aún no comienza. Solo puedes generar sesiones de la semana actual.</p>
                    </div>
                  </div>
                )}
                {isPastWeek && (
                  <div className="mb-5 flex items-center gap-3 p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/60 dark:border-amber-500/20">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                      <Calendar className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Semana pasada</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Esta semana ya pasó. Las sesiones no generadas quedan bloqueadas.</p>
                    </div>
                  </div>
                )}

                {/* ─── Progress bar ─── */}
                {weekProgress.total > 0 && isCurrentWeek && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Progreso de la semana
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {weekProgress.generated} de {weekProgress.total}{" "}
                        sesiones
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-700 ease-out"
                        style={{
                          width: `${weekProgress.total > 0 ? (weekProgress.generated / weekProgress.total) * 100 : 0}%`,
                        }}
                      />
                    </div>

                    {weekProgress.generated === weekProgress.total &&
                      weekProgress.total > 0 && (
                        <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20">
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            ¡Semana completada! Todas las sesiones han sido
                            generadas.
                          </span>
                        </div>
                      )}
                  </div>
                )}

                {/* ─── Calendar Grid — 5 columns (Lun-Vie) ─── */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {currentSemana.dias.map((dia) => (
                    <DayColumn
                      key={dia.dia}
                      dia={dia}
                      semana={currentSemana.semana}
                      slotStates={slotStates}
                      generatedSesiones={generatedSesiones}
                      generatingSlot={generatingSlot}
                      generatingImages={generatingImages}
                      onGenerar={handleGenerar}
                      onVerSesion={(id, slotKey) => {
                        const premData = slotKey ? premiumResponses.get(slotKey) : null;
                        const esSuscriptor = selectedUnidad?._rol === "SUSCRIPTOR";

                        if (premData && !esSuscriptor) {
                          // Propietario acaba de generar esta sesión → tiene datos frescos en memoria
                          const inst = slotKey ? instrumentosMap.get(slotKey) : undefined;
                          navigate("/sesion-premium-result", {
                            state: { premiumData: premData, instrumento: inst ?? null },
                          });
                        } else if (esSuscriptor) {
                          // Suscriptor: siempre va a generar su propio PDF personalizado
                          navigate(`/sesion-suscriptor-result/${id}`);
                        } else if (slotKey && clonedSlots.has(slotKey)) {
                          // Sesión clonada (propietario viendo sesión de otro) → generar PDF
                          navigate(`/sesion-suscriptor-result/${id}`);
                        } else {
                          // Propietario viendo sesión ya existente sin datos en memoria
                          navigate(`/sesion/${id}`);
                        }
                      }}
                    />
                  ))}
                </div>

                {/* ─── Hilo Conductor ─── */}
                {selectedUnidad.contenido?.secuencia?.hiloConductor && (
                  <div className="mt-6 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                      Hilo Conductor
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedUnidad.contenido.secuencia.hiloConductor}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ─── Unidad sin secuencia ─── */}
            {selectedUnidad && !currentSemana && semanas.length === 0 && (
              <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/30 bg-white dark:bg-slate-800/50 p-12 text-center">
                <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-300">
                  Esta unidad aún no tiene una secuencia de sesiones
                  configurada.
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DAY COLUMN
// ═══════════════════════════════════════════════════════════════════════════════

function DayColumn({
  dia,
  semana,
  slotStates,
  generatedSesiones,
  generatingSlot,
  generatingImages,
  onGenerar,
  onVerSesion,
}: {
  dia: IDiaData;
  semana: number;
  slotStates: Map<SlotKey, SlotState>;
  generatedSesiones: Map<SlotKey, { id: string; titulo: string }>;
  generatingSlot: SlotKey | null;
  generatingImages: Set<SlotKey>;
  onGenerar: (
    dia: string,
    turno: "mañana" | "tarde",
    actividad: string,
    area: string,
  ) => void;
  onVerSesion: (id: string, slotKey?: SlotKey) => void;
}) {
  const hoy = isHoy(dia.fecha);

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all duration-200 flex flex-col ${
        hoy
          ? "border-violet-300 dark:border-violet-600/50 shadow-lg shadow-violet-500/10 ring-2 ring-violet-200/60 dark:ring-violet-500/20"
          : "border-slate-200/70 dark:border-slate-700/50 shadow-sm"
      }`}
    >
      {/* Day Header */}
      <div
        className={`px-3 py-2.5 text-center border-b ${
          hoy
            ? "bg-gradient-to-b from-violet-50 to-violet-100/50 dark:from-violet-500/15 dark:to-violet-500/5 border-violet-200/70 dark:border-violet-600/30"
            : "bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-800/40 border-slate-200/50 dark:border-slate-700/40"
        }`}
      >
        <p
          className={`text-xs font-bold uppercase tracking-wider ${hoy ? "text-violet-700 dark:text-violet-300" : "text-slate-600 dark:text-slate-300"}`}
        >
          {dia.dia}
        </p>
        <p
          className={`text-[11px] mt-0.5 ${hoy ? "text-violet-500 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"}`}
        >
          {formatFechaDia(dia.fecha)}
          {hoy && (
            <span className="ml-1.5 font-semibold text-violet-600 dark:text-violet-300">
              • Hoy
            </span>
          )}
        </p>
      </div>

      {/* Turno cards */}
      <div className="p-2 space-y-2 bg-white dark:bg-slate-900/30 flex flex-col flex-1">
        <TurnoCard
          turno="mañana"
          data={dia.turnoManana}
          slotKey={makeSlotKey(semana, dia.dia, "mañana")}
          state={
            slotStates.get(makeSlotKey(semana, dia.dia, "mañana")) ??
            "en_espera"
          }
          generatedSesion={generatedSesiones.get(
            makeSlotKey(semana, dia.dia, "mañana"),
          )}
          isGenerating={
            generatingSlot === makeSlotKey(semana, dia.dia, "mañana")
          }
          isGeneratingImages={generatingImages.has(
            makeSlotKey(semana, dia.dia, "mañana"),
          )}
          anyGenerating={generatingSlot !== null}
          onGenerar={() =>
            onGenerar(
              dia.dia,
              "mañana",
              dia.turnoManana.actividad,
              dia.turnoManana.area,
            )
          }
          onVerSesion={onVerSesion}
        />
        <TurnoCard
          turno="tarde"
          data={dia.turnoTarde}
          slotKey={makeSlotKey(semana, dia.dia, "tarde")}
          state={
            slotStates.get(makeSlotKey(semana, dia.dia, "tarde")) ??
            "en_espera"
          }
          generatedSesion={generatedSesiones.get(
            makeSlotKey(semana, dia.dia, "tarde"),
          )}
          isGenerating={
            generatingSlot === makeSlotKey(semana, dia.dia, "tarde")
          }
          isGeneratingImages={generatingImages.has(
            makeSlotKey(semana, dia.dia, "tarde"),
          )}
          anyGenerating={generatingSlot !== null}
          onGenerar={() =>
            onGenerar(
              dia.dia,
              "tarde",
              dia.turnoTarde.actividad,
              dia.turnoTarde.area,
            )
          }
          onVerSesion={onVerSesion}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TURNO CARD
// ═══════════════════════════════════════════════════════════════════════════════

function TurnoCard({
  turno,
  data,
  slotKey,
  state,
  generatedSesion,
  isGenerating,
  isGeneratingImages,
  anyGenerating,
  onGenerar,
  onVerSesion,
}: {
  turno: "mañana" | "tarde";
  data: ITurnoData;
  slotKey: SlotKey;
  state: SlotState;
  generatedSesion?: { id: string; titulo: string };
  isGenerating: boolean;
  isGeneratingImages: boolean;
  anyGenerating: boolean;
  onGenerar: () => void;
  onVerSesion: (id: string, slotKey?: SlotKey) => void;
}) {
  const theme = getAreaTheme(data.area);
  const isMañana = turno === "mañana";

  const isAvailable = state === "disponible";
  const isGenerated = state === "generada";
  const isClonada = state === "clonada";
  const isWaiting = state === "en_espera";
  const isBlocked = state === "bloqueada";

  return (
    <div
      className={`relative rounded-lg border p-2.5 transition-all duration-300 flex flex-col flex-1 ${
        isAvailable && !isGenerating
          ? `${theme.bg} ${theme.border} shadow-sm ring-1 ring-violet-300/40 dark:ring-violet-500/20`
          : ""
      } ${
        isGenerating
          ? "bg-violet-50 dark:bg-violet-500/10 border-violet-300 dark:border-violet-500/40 shadow-md animate-pulse"
          : ""
      } ${
        isGenerated
          ? "bg-emerald-50/60 dark:bg-emerald-500/5 border-emerald-200/60 dark:border-emerald-500/20"
          : ""
      } ${
        isWaiting
          ? "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/40 dark:border-slate-700/30 opacity-55"
          : ""
      } ${
        isBlocked
          ? "bg-slate-50/40 dark:bg-slate-800/20 border-slate-200/30 dark:border-slate-700/20 opacity-45"
          : ""
      } ${
        isClonada
          ? "bg-sky-50/60 dark:bg-sky-500/5 border-sky-200/60 dark:border-sky-500/20"
          : ""
      }`}
    >
      {/* Turno label */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <Sun className={`h-3 w-3 ${isMañana ? "text-amber-500" : "text-orange-400"}`} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {isMañana ? "Primer Bloque" : "Segundo Bloque"}
        </span>
      </div>

      {/* Area badge */}
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md mb-1.5 ${theme.pill}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
        {data.area}
      </span>

      {/* Actividad */}
      <p
        className={`text-[11px] leading-relaxed line-clamp-3 flex-1 ${
          isGenerated
            ? "text-slate-500 dark:text-slate-400"
            : "text-slate-700 dark:text-slate-300"
        }`}
      >
        {data.actividad}
      </p>

      {/* ─── Actions ─── */}
      <div className="mt-auto pt-1.5">

      {/* Disponible + NOT generating */}
      {isAvailable && !isGenerating && (
        <button
          onClick={onGenerar}
          disabled={anyGenerating}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-semibold text-white transition-all
            bg-gradient-to-r ${theme.gradient} hover:shadow-md hover:brightness-110 active:scale-[0.97]
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Sparkles className="h-3 w-3" />
          Generar con IA
        </button>
      )}

      {/* Generando */}
      {isGenerating && (
        <div className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600">
          <Loader2 className="h-3 w-3 animate-spin" />
          Generando…
        </div>
      )}

      {/* Generada con datos */}
      {isGenerated && generatedSesion && (
        <div className="space-y-1">
          {isGeneratingImages ? (
            <>
              <div
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-500/20 cursor-not-allowed opacity-80"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                Preparando sesión…
              </div>
              <div className="flex items-center justify-center gap-1 py-0.5 text-[9px] text-sky-600 dark:text-sky-400 animate-pulse">
                <ImageIcon className="h-2.5 w-2.5" />
                Generando imágenes, espera un momento…
              </div>
            </>
          ) : (
            <button
              onClick={() => onVerSesion(generatedSesion.id, slotKey)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors"
            >
              <Eye className="h-3 w-3" />
              Ver sesión
            </button>
          )}
        </div>
      )}

      {/* Generada sin datos */}
      {isGenerated && !generatedSesion && (
        <div className="w-full flex items-center justify-center gap-1 py-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="h-3 w-3" />
          Generada
        </div>
      )}

      {/* Clonada (solo lectura) */}
      {isClonada && generatedSesion && (
        <button
          onClick={() => onVerSesion(generatedSesion.id, slotKey)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-500/20 hover:bg-sky-200 dark:hover:bg-sky-500/30 transition-colors"
        >
          <Eye className="h-3 w-3" />
          Ver sesión
        </button>
      )}

      {/* Clonada sin datos */}
      {isClonada && !generatedSesion && (
        <div className="w-full flex items-center justify-center gap-1 py-1 text-[10px] font-medium text-sky-600 dark:text-sky-400">
          <Check className="h-3 w-3" />
          Clonada
        </div>
      )}

      {/* En espera */}
      {isWaiting && (
        <div className="w-full flex items-center justify-center gap-1 py-1 text-[10px] text-slate-400 dark:text-slate-500">
          <Lock className="h-2.5 w-2.5" />
          En espera
        </div>
      )}

      {/* Bloqueada */}
      {isBlocked && (
        <div className="w-full flex items-center justify-center gap-1 py-1 text-[10px] text-slate-400 dark:text-slate-500">
          <Lock className="h-2.5 w-2.5" />
          Bloqueada
        </div>
      )}

      </div>
    </div>
  );
}

export default GenerarSesionPremium;
