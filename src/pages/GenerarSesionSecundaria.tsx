import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { usePermissions } from "@/hooks/usePermissions";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { listarUnidadesByUsuario } from "@/services/unidad.service";
import { generarSesionUnidad } from "@/services/sesiones.service";
import type { IUnidadListItem, IUnidadListMiembroArea } from "@/interfaces/IUnidadList";
import type { ISesionPremiumResponse } from "@/interfaces/ISesionPremium";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Eye,
  Loader2,
  Sparkles,
  RefreshCw,
  Calendar,
  GraduationCap,
} from "lucide-react";

interface SesionPlanItem {
  indiceSesion: number;
  area: string;
  actividad: string;
}

interface SemanaPlanItem {
  semana: number;
  sesiones: SesionPlanItem[];
}

interface GradoPlanItem {
  gradoId: number;
  grado: string;
  semanas: SemanaPlanItem[];
}

type SlotKey = string;

function isUnidadSecundaria(unidad: IUnidadListItem | null | undefined): boolean {
  if (!unidad) return false;
  const contenido = (unidad as any).contenido ?? {};
  if (Array.isArray(contenido?.secuenciaPorGrado) && contenido.secuenciaPorGrado.length > 0) {
    return true;
  }
  if (Array.isArray(contenido?.gradosSecundaria) && contenido.gradosSecundaria.length > 0) {
    return true;
  }
  return /secundaria/i.test(unidad?.nivel?.nombre ?? "");
}

function parseSecuenciaPorGrado(unidad: IUnidadListItem | null): GradoPlanItem[] {
  if (!unidad) return [];
  const contenido = (unidad as any).contenido ?? {};
  const secuenciaPorGrado = Array.isArray(contenido?.secuenciaPorGrado)
    ? contenido.secuenciaPorGrado
    : [];

  return secuenciaPorGrado.map((item: any) => ({
    gradoId: Number(item?.gradoId ?? 0),
    grado: item?.grado ?? `Grado ${item?.gradoId ?? ""}`.trim(),
    semanas: Array.isArray(item?.secuencia?.semanasPorSesiones)
      ? item.secuencia.semanasPorSesiones.map((s: any) => ({
          semana: Number(s?.semana ?? 0),
          sesiones: Array.isArray(s?.sesiones)
            ? s.sesiones.map((ses: any) => ({
                indiceSesion: Number(ses?.indiceSesion ?? 0),
                area: ses?.area ?? "",
                actividad: ses?.actividad ?? "",
              }))
            : [],
        }))
      : [],
  }));
}

function makeSlotKey(gradoId: number, semana: number, indiceSesion: number): SlotKey {
  return `${gradoId}-${semana}-${indiceSesion}`;
}

function normalizeTurnoKey(turno: string): string {
  if (turno === "mañana") return "bloque-1";
  if (turno === "tarde") return "bloque-2";
  return turno;
}

function findAreaId(areaName: string, areas: IUnidadListMiembroArea[]): number | undefined {
  if (!areaName || !areas.length) return undefined;
  const stripPrefix = (s: string) => s.toLowerCase().replace(/^área de\s*/i, "").trim();
  const normalized = stripPrefix(areaName);
  const exact = areas.find((a) => stripPrefix(a.area?.nombre || "") === normalized);
  if (exact) return exact.areaId;
  const partial = areas.find((a) => {
    const clean = stripPrefix(a.area?.nombre || "");
    return clean.includes(normalized) || normalized.includes(clean);
  });
  return partial?.areaId;
}

function GenerarSesionSecundaria() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { user: usuario } = useUserStore();
  const permissions = usePermissions();

  const userId = user?.id;
  const [unidades, setUnidades] = useState<IUnidadListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnidadId, setSelectedUnidadId] = useState<string | null>(null);
  const [displayWeek, setDisplayWeek] = useState(1);
  const [generatingSlot, setGeneratingSlot] = useState<SlotKey | null>(null);
  const [generatedSlots, setGeneratedSlots] = useState<Set<SlotKey>>(new Set());
  const [generatedSesiones, setGeneratedSesiones] = useState<
    Map<SlotKey, { id: string; titulo: string }>
  >(new Map());
  const [premiumResponses, setPremiumResponses] = useState<Map<SlotKey, ISesionPremiumResponse>>(
    new Map()
  );

  const unidadesActivas = useMemo(
    () =>
      unidades.filter((u) => {
        const mb = u.miembros.find((m) => m.usuarioId === userId);
        return mb?.estadoPago === "CONFIRMADO";
      }),
    [unidades, userId]
  );

  const unidadesSecundaria = useMemo(
    () => unidadesActivas.filter((u) => isUnidadSecundaria(u)),
    [unidadesActivas]
  );

  const selectedUnidad = useMemo(
    () => unidadesSecundaria.find((u) => u.id === selectedUnidadId) ?? null,
    [unidadesSecundaria, selectedUnidadId]
  );

  const secuenciaPorGrado = useMemo(() => parseSecuenciaPorGrado(selectedUnidad), [selectedUnidad]);

  const totalWeeks = useMemo(() => {
    let max = 0;
    for (const g of secuenciaPorGrado) {
      for (const s of g.semanas) max = Math.max(max, s.semana);
    }
    return max || Number(selectedUnidad?.duracion ?? 0) || 1;
  }, [secuenciaPorGrado, selectedUnidad]);

  const sesionesSemanaActual = useMemo(() => {
    return secuenciaPorGrado.map((g) => ({
      gradoId: g.gradoId,
      grado: g.grado,
      sesiones: g.semanas.find((s) => s.semana === displayWeek)?.sesiones ?? [],
    }));
  }, [secuenciaPorGrado, displayWeek]);

  const miembroAreas = useMemo<IUnidadListMiembroArea[]>(() => {
    if (!selectedUnidad || !userId) return [];
    return selectedUnidad.miembros.find((m) => m.usuarioId === userId)?.areas ?? [];
  }, [selectedUnidad, userId]);

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

  const cargarUnidades = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const items = await listarUnidadesByUsuario(userId);
      setUnidades(items);
      const sec = items.filter((u) => {
        const mb = u.miembros.find((m) => m.usuarioId === userId);
        return mb?.estadoPago === "CONFIRMADO" && isUnidadSecundaria(u);
      });
      if (sec.length === 1) setSelectedUnidadId(sec[0].id);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Error al cargar unidades");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    cargarUnidades();
  }, [cargarUnidades]);

  useEffect(() => {
    if (!selectedUnidad) return;
    const restoredSlots = new Set<SlotKey>();
    const restoredMap = new Map<SlotKey, { id: string; titulo: string }>();

    const sesiones = Array.isArray(selectedUnidad.sesiones) ? (selectedUnidad.sesiones as any[]) : [];
    for (const ses of sesiones) {
      const semana = Number(ses?.semana ?? 0);
      const turnoNorm = normalizeTurnoKey(String(ses?.turno ?? ""));
      const turnoMatch = turnoNorm.match(/^bloque-(\d+)$/);
      const indiceSesion = Number(turnoMatch?.[1] ?? 0);
      const gradoIdSesion = Number(ses?.gradoId ?? ses?.grado?.id ?? 0);
      if (!semana || !indiceSesion || !gradoIdSesion) continue;

      const key = makeSlotKey(gradoIdSesion, semana, indiceSesion);
      restoredSlots.add(key);
      restoredMap.set(key, {
        id: ses.id,
        titulo: ses.titulo || "Sesión generada",
      });
    }

    setGeneratedSlots(restoredSlots);
    setGeneratedSesiones(restoredMap);
    setDisplayWeek(1);
  }, [selectedUnidad]);

  const handleGenerar = async (
    gradoId: number,
    semana: number,
    indiceSesion: number,
    areaName: string,
    actividad: string
  ) => {
    if (!selectedUnidadId) return;
    const key = makeSlotKey(gradoId, semana, indiceSesion);
    setGeneratingSlot(key);
    try {
      const areasPool = miembroAreas.length > 0 ? miembroAreas : allUnidadAreas;
      const areaId = findAreaId(areaName, areasPool);
      if (!areaId) {
        handleToaster(`No se pudo identificar el área "${areaName}"`, "error");
        return;
      }

      // Secundaria no trae día/turno en secuencia; mapeamos sesión N -> bloque-N.
      const diaFallback = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"][(indiceSesion - 1) % 5];
      const turno = `bloque-${indiceSesion}`;

      const resp = await generarSesionUnidad(selectedUnidadId, {
        areaId,
        gradoId,
        semana,
        dia: diaFallback,
        turno,
        tituloActividad: actividad,
      });

      if (!resp?.sesion?.id) {
        throw new Error(resp?.message || "No se recibió la sesión generada");
      }

      setGeneratedSlots((prev) => new Set(prev).add(key));
      setGeneratedSesiones((prev) =>
        new Map(prev).set(key, { id: resp.sesion!.id, titulo: resp.sesion!.titulo })
      );

      const fullResp = resp as unknown as ISesionPremiumResponse;
      if (fullResp?.sesion && fullResp?.docente !== undefined) {
        setPremiumResponses((prev) =>
          new Map(prev).set(key, {
            ...fullResp,
            nombreDirectivo: fullResp.nombreDirectivo ?? usuario?.nombreDirectivo ?? "",
          })
        );
      }

      handleToaster(resp.message || "Sesión generada con éxito", "success");
    } catch (err: any) {
      handleToaster(err?.response?.data?.message || err?.message || "Error al generar sesión", "error");
    } finally {
      setGeneratingSlot(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-3 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Generar Sesión — Secundaria
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                Vista por grado y por semana para unidades multigrado
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-500/20 dark:to-yellow-500/20 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-500/30">
              {permissions.planLabel}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-white p-5 mb-4 text-sm text-red-700">
            {error}
            <Button variant="outline" size="sm" className="ml-3" onClick={cargarUnidades}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Reintentar
            </Button>
          </div>
        )}

        {unidadesSecundaria.length === 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 p-8 text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              No tienes unidades secundarias activas con secuencia por grado.
            </p>
            <Button onClick={() => navigate("/generar-sesion")} variant="outline">
              Ir a vista general
            </Button>
          </div>
        )}

        {unidadesSecundaria.length > 0 && (
          <>
            {unidadesSecundaria.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                {unidadesSecundaria.map((u) => {
                  const selected = u.id === selectedUnidadId;
                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUnidadId(u.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        selected
                          ? "border-violet-500 ring-2 ring-violet-300/60 dark:ring-violet-500/30"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40"
                      }`}
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">{u.titulo}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {u.nivel?.nombre} · {u.duracion} semanas
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedUnidad && (
              <>
                <div className="mb-4 p-4 rounded-xl border border-violet-200/60 dark:border-violet-700/40 bg-violet-50/50 dark:bg-violet-500/5">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    <p className="font-semibold text-slate-900 dark:text-white">{selectedUnidad.titulo}</p>
                  </div>
                </div>

                <div className="mb-5 flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Semana {displayWeek} de {totalWeeks}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDisplayWeek((w) => Math.max(1, w - 1))}
                      disabled={displayWeek <= 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDisplayWeek((w) => Math.min(totalWeeks, w + 1))}
                      disabled={displayWeek >= totalWeeks}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sesionesSemanaActual.map((g) => (
                    <div key={g.gradoId} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <GraduationCap className="h-4 w-4 text-indigo-500" />
                        <p className="font-semibold text-slate-900 dark:text-white">{g.grado}</p>
                      </div>
                      <div className="space-y-2">
                        {g.sesiones.length === 0 && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Sin sesiones planificadas en esta semana.
                          </p>
                        )}
                        {g.sesiones.map((s) => {
                          const key = makeSlotKey(g.gradoId, displayWeek, s.indiceSesion);
                          const generated = generatedSlots.has(key);
                          const sessionInfo = generatedSesiones.get(key);
                          const isGenerating = generatingSlot === key;
                          return (
                            <div
                              key={key}
                              className="rounded-lg border border-slate-200 dark:border-slate-700 p-3"
                            >
                              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                Sesión {s.indiceSesion} · {s.area}
                              </p>
                              <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">
                                {s.actividad}
                              </p>

                              <div className="mt-3">
                                {!generated ? (
                                  <Button
                                    size="sm"
                                    className="h-8 text-xs"
                                    disabled={Boolean(generatingSlot)}
                                    onClick={() =>
                                      handleGenerar(
                                        g.gradoId,
                                        displayWeek,
                                        s.indiceSesion,
                                        s.area,
                                        s.actividad
                                      )
                                    }
                                  >
                                    {isGenerating ? (
                                      <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                        Generando...
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                                        Generar con IA
                                      </>
                                    )}
                                  </Button>
                                ) : sessionInfo ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs"
                                    onClick={() => {
                                      const prem = premiumResponses.get(key);
                                      if (prem) {
                                        navigate("/sesion-premium-result", {
                                          state: { premiumData: prem, instrumento: null },
                                        });
                                      } else {
                                        navigate(`/sesion/${sessionInfo.id}`);
                                      }
                                    }}
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                    Ver sesión
                                  </Button>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                    <Check className="h-3.5 w-3.5" />
                                    Generada
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default GenerarSesionSecundaria;

