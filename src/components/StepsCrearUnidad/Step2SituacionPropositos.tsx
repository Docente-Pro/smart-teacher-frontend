import { useState, useCallback, useEffect, useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownTextarea } from "@/components/ui/markdown-textarea";
import { parseMarkdown } from "@/utils/parseMarkdown";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Target,
  FileCheck,
  BookOpen,
  Loader2,
  Wand2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
} from "lucide-react";
import { useUnidadStore } from "@/store/unidad.store";
import { useUserStore } from "@/store/user.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import {
  generarSituacionSignificativa,
  generarEvidencias,
  generarPropositos,
  generarPropositosMultigrado,
  regenerarPasoUnidad,
  generarImagenSituacion,
} from "@/services/ia-unidad.service";
import { patchPropositosActividades } from "@/services/unidad.service";
import { updateUsuario } from "@/services/usuarios.service";
import type { IUsuario } from "@/interfaces/IUsuario";
import type { IUnidad } from "@/interfaces/IUnidad";
import type { ContenidoSaveStatus } from "@/hooks/useAutoSaveContenido";
import type {
  ISituacionSignificativaResponse,
  IEvidencias,
  IPropositos,
  IPropositosPorGradoItem,
  IActividadCriterioProposito,
} from "@/interfaces/IUnidadIA";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuario: IUsuario;
  contenidoSaveStatus: ContenidoSaveStatus;
}

type GenerationStatus = "idle" | "generating" | "done" | "error";

type PendingCriterioSlot = { gradoId?: number; areaIdx: number; compIdx: number; actIdx: number };

function nombreCompetenciaProposito(
  comp: IPropositos["areasPropositos"][number]["competencias"][number]
): string {
  const ext = comp as { competencia?: string };
  return (comp.nombre || ext.competencia || "").trim();
}

function normActividadTxt(t: string): string {
  return t.replace(/\s+/g, " ").trim();
}

function sameActividadText(a: string, b: string): boolean {
  return normActividadTxt(a) === normActividadTxt(b);
}

/**
 * Una fila de `actividadCriterios` con la fila i de `actividades` solo si el texto coincide.
 * Evita mostrar criterios viejos en una fila nueva tras borrar (índices desfasados o payload del servidor).
 */
function reconcileActividadCriteriosParaActividades(
  actividades: string[],
  actividadCriterios: IActividadCriterioProposito[] | undefined
): IActividadCriterioProposito[] {
  const prev = [...(actividadCriterios ?? [])];
  const usedPrev = new Set<number>();

  return actividades.map((texto) => {
    const n = normActividadTxt(texto);
    if (!n) {
      return { actividad: texto, criterios: [] };
    }
    const j = prev.findIndex(
      (ac, idx) => !usedPrev.has(idx) && normActividadTxt(ac.actividad) === n
    );
    if (j >= 0) {
      usedPrev.add(j);
      return { ...prev[j], actividad: texto };
    }
    return { actividad: texto, criterios: [] };
  });
}

function alinearPropositosActividadCriterios(prop: IPropositos): IPropositos {
  return {
    ...prop,
    areasPropositos: prop.areasPropositos.map((area) => ({
      ...area,
      competencias: area.competencias.map((comp) => {
        const actividades = comp.actividades ?? [];
        return {
          ...comp,
          actividades,
          actividadCriterios: reconcileActividadCriteriosParaActividades(
            actividades,
            comp.actividadCriterios
          ),
        };
      }),
    })),
  };
}

function alinearPropositosPorGradoActividadCriterios(
  items: IPropositosPorGradoItem[]
): IPropositosPorGradoItem[] {
  return items.map((item) => ({
    ...item,
    propositos: alinearPropositosActividadCriterios(item.propositos),
  }));
}

function competenciaKey(areaIdx: number, compIdx: number, gradoId?: number): string {
  return gradoId != null ? `g:${gradoId}:${areaIdx}-${compIdx}` : `p:${areaIdx}-${compIdx}`;
}


function Step2SituacionPropositos({ pagina, setPagina, usuario, contenidoSaveStatus }: Props) {
  const { unidadId, datosBase, contenido, updateContenido, setGenerandoPaso, generandoPaso } =
    useUnidadStore();
  const { user: userProfile } = useUserStore();
  const prevSituacion = userProfile?.situacionSignificativaContexto || "";

  // Estado de generación por sección
  const [statusSituacion, setStatusSituacion] = useState<GenerationStatus>(
    contenido.situacionSignificativa ? "done" : "idle"
  );
  const [statusEvidencias, setStatusEvidencias] = useState<GenerationStatus>(
    contenido.evidencias ? "done" : "idle"
  );
  const [statusPropositos, setStatusPropositos] = useState<GenerationStatus>(
    contenido.propositos ? "done" : "idle"
  );

  // Edición local
  const [situacionTexto, setSituacionTexto] = useState(contenido.situacionSignificativa || "");
  const [evidencias, setEvidencias] = useState<IEvidencias | null>(contenido.evidencias || null);
  const [propositos, setPropositos] = useState<IPropositos | null>(contenido.propositos || null);
  const [propositosPorGrado, setPropositosPorGrado] = useState<IPropositosPorGradoItem[]>(
    (contenido.propositosPorGrado as IPropositosPorGradoItem[]) || []
  );

  const getGradosSecundariaIds = useCallback((): number[] => {
    const fromContenido = Array.isArray((contenido as any)?.gradosSecundaria)
      ? ((contenido as any).gradosSecundaria as number[])
      : [];
    const fromDatosBase = Array.isArray((datosBase as any)?.gradosSecundariaIds)
      ? ((datosBase as any).gradosSecundariaIds as number[])
      : [];
    return Array.from(new Set([...fromContenido, ...fromDatosBase]))
      .filter((id) => Number.isFinite(id))
      .sort((a, b) => a - b);
  }, [contenido, datosBase]);

  const getModoSecundaria = useCallback((): string | undefined => {
    const fromContenido = (contenido as any)?.modoSecundaria;
    const fromDatosBase = (datosBase as any)?.modoSecundaria;
    const modo = fromContenido ?? fromDatosBase;
    return typeof modo === "string" ? modo : undefined;
  }, [contenido, datosBase]);

  // ─── Sincronizar estado local con store (cuando se rehidrata de localStorage) ───
  useEffect(() => {
    if (contenido.situacionSignificativa && !situacionTexto) {
      setSituacionTexto(contenido.situacionSignificativa);
      setStatusSituacion("done");
    }
    if (contenido.evidencias && !evidencias) {
      setEvidencias(contenido.evidencias);
      setStatusEvidencias("done");
    }
    if (contenido.propositos && !propositos) {
      setPropositos(alinearPropositosActividadCriterios(contenido.propositos));
      setStatusPropositos("done");
    }
    if (Array.isArray(contenido.propositosPorGrado) && contenido.propositosPorGrado.length > 0 && propositosPorGrado.length === 0) {
      setPropositosPorGrado(contenido.propositosPorGrado as IPropositosPorGradoItem[]);
      setStatusPropositos("done");
    }
  }, [contenido.situacionSignificativa, contenido.evidencias, contenido.propositos]);

  // Secciones colapsadas
  const [expandedPropositos, setExpandedPropositos] = useState(true);
  /** `${areaIdx}-${compIdx}` mientras un PATCH con IA genera criterios para actividades nuevas */
  const [criteriosActividadSyncKey, setCriteriosActividadSyncKey] = useState<string | null>(null);
  /** `${areaIdx}-${compIdx}` mientras un PATCH de actividades está en curso (guardar manual) */
  const [savingActividadesKey, setSavingActividadesKey] = useState<string | null>(null);
  /** Competencias con cambios locales de actividades aún no guardados */
  const [dirtyCompetenciaKeys, setDirtyCompetenciaKeys] = useState<string[]>([]);
  /** Índices de filas añadidas con "Agregar actividad" que aún deben disparar IA al tener texto */
  const pendingCriteriosActividadRef = useRef<PendingCriterioSlot[]>([]);

  const upsertPendingSlot = useCallback((slot: PendingCriterioSlot) => {
    const exists = pendingCriteriosActividadRef.current.some(
      (s) =>
        s.gradoId === slot.gradoId &&
        s.areaIdx === slot.areaIdx &&
        s.compIdx === slot.compIdx &&
        s.actIdx === slot.actIdx
    );
    if (!exists) pendingCriteriosActividadRef.current.push(slot);
  }, []);

  const removePendingSlot = useCallback((slot: PendingCriterioSlot) => {
    pendingCriteriosActividadRef.current = pendingCriteriosActividadRef.current.filter(
      (s) =>
        !(
          s.gradoId === slot.gradoId &&
          s.areaIdx === slot.areaIdx &&
          s.compIdx === slot.compIdx &&
          s.actIdx === slot.actIdx
        )
    );
  }, []);

  const markCompetenciaDirty = useCallback((areaIdx: number, compIdx: number, gradoId?: number) => {
    const k = competenciaKey(areaIdx, compIdx, gradoId);
    setDirtyCompetenciaKeys((prev) => (prev.includes(k) ? prev : [...prev, k]));
  }, []);

  const clearCompetenciaDirty = useCallback((areaIdx: number, compIdx: number, gradoId?: number) => {
    const k = competenciaKey(areaIdx, compIdx, gradoId);
    setDirtyCompetenciaKeys((prev) => prev.filter((it) => it !== k));
  }, []);

  const isCompetenciaDirty = useCallback(
    (areaIdx: number, compIdx: number, gradoId?: number) =>
      dirtyCompetenciaKeys.includes(competenciaKey(areaIdx, compIdx, gradoId)),
    [dirtyCompetenciaKeys]
  );

  const adjustPendingAfterRemove = useCallback(
    (areaIdx: number, compIdx: number, removedActIdx: number, gradoId?: number) => {
      const next: PendingCriterioSlot[] = [];
      for (const s of pendingCriteriosActividadRef.current) {
        if (s.areaIdx !== areaIdx || s.compIdx !== compIdx || s.gradoId !== gradoId) {
          next.push(s);
          continue;
        }
        if (s.actIdx === removedActIdx) continue;
        if (s.actIdx > removedActIdx) next.push({ ...s, actIdx: s.actIdx - 1 });
        else next.push(s);
      }
      pendingCriteriosActividadRef.current = next;
    },
    []
  );

  // Sincroniza actividades (PATCH) al pulsar Guardar.
  // Con texto en filas marcadas como nuevas, envía nuevasActividades → IA genera criterios.
  const syncActividadesToBackend = useCallback(
    async (areaIdx: number, compIdx: number, propositosSnapshot?: IPropositos | null): Promise<boolean> => {
      if (!unidadId) return false;
      const props = propositosSnapshot ?? useUnidadStore.getState().contenido?.propositos;
      if (!props?.areasPropositos?.[areaIdx]?.competencias?.[compIdx]) return false;
      const area = props.areasPropositos[areaIdx];
      const comp = area.competencias[compIdx];
      const actividades = comp.actividades ?? [];
      const competenciaNombre = nombreCompetenciaProposito(comp);

      const pendingForComp = pendingCriteriosActividadRef.current.filter(
        (s) => s.areaIdx === areaIdx && s.compIdx === compIdx && s.gradoId == null
      );
      const nuevasActividades: string[] = [];
      const sentSlots: PendingCriterioSlot[] = [];
      for (const slot of pendingForComp) {
        const t = (actividades[slot.actIdx] ?? "").trim();
        if (t) {
          nuevasActividades.push(t);
          sentSlots.push(slot);
        }
      }

      const body = {
        area: area.area,
        competencia: competenciaNombre,
        actividades,
        ...(nuevasActividades.length > 0 ? { nuevasActividades } : {}),
      };

      const syncKey = competenciaKey(areaIdx, compIdx);
      setSavingActividadesKey(syncKey);
      if (nuevasActividades.length > 0) setCriteriosActividadSyncKey(syncKey);

      try {
        const res = await patchPropositosActividades(unidadId, body);
        if (res.success === false) return false;

        pendingCriteriosActividadRef.current = pendingCriteriosActividadRef.current.filter(
          (s) =>
            !sentSlots.some(
              (ss) =>
                ss.areaIdx === s.areaIdx &&
                ss.compIdx === s.compIdx &&
                ss.actIdx === s.actIdx &&
                ss.gradoId === s.gradoId
            )
        );
        const n = res.criteriosGeneradosParaActividades;
        if (n != null && n > 0) {
          handleToaster(
            n === 1
              ? "Se generaron criterios para la nueva actividad."
              : `Se generaron criterios para ${n} actividades nuevas.`,
            "success"
          );
        }

        const unidad = res.data as IUnidad | undefined;
        const propFromServer = unidad?.contenido?.propositos;
        if (propFromServer) {
          const propAlineado = alinearPropositosActividadCriterios(propFromServer);
          setPropositos(propAlineado);
          updateContenido({ propositos: propAlineado });
        } else if (propositosSnapshot) {
          // Mantener store/UI consistentes aunque el backend no devuelva contenido completo.
          const propAlineado = alinearPropositosActividadCriterios(propositosSnapshot);
          setPropositos(propAlineado);
          updateContenido({ propositos: propAlineado });
        }

        clearCompetenciaDirty(areaIdx, compIdx);
        return true;
      } catch (err: any) {
        console.error("Error al sincronizar actividades:", err);
        handleToaster(
          err?.response?.data?.message ??
            "No se pudo guardar las actividades. Revisa la conexión o reintenta.",
          "error"
        );
        return false;
      } finally {
        setSavingActividadesKey((k) => (k === syncKey ? null : k));
        setCriteriosActividadSyncKey((k) => (k === syncKey ? null : k));
      }
    },
    [unidadId, updateContenido, setPropositos, clearCompetenciaDirty]
  );

  // Sincroniza actividades para una competencia específica de un grado (multigrado secundaria).
  const syncActividadesMultigradoToBackend = useCallback(
    async (
      gradoId: number,
      areaIdx: number,
      compIdx: number,
      propositosPorGradoSnapshot?: IPropositosPorGradoItem[]
    ): Promise<boolean> => {
      if (!unidadId) return false;
      const snapshot =
        propositosPorGradoSnapshot ??
        ((useUnidadStore.getState().contenido?.propositosPorGrado as IPropositosPorGradoItem[]) || []);
      const item = snapshot.find((it) => it.gradoId === gradoId);
      if (!item) return false;

      const area = item.propositos.areasPropositos?.[areaIdx];
      const comp = area?.competencias?.[compIdx];
      if (!area || !comp) return false;

      const actividades = comp.actividades ?? [];
      const competenciaNombre = nombreCompetenciaProposito(comp);

      const pendingForComp = pendingCriteriosActividadRef.current.filter(
        (s) => s.gradoId === gradoId && s.areaIdx === areaIdx && s.compIdx === compIdx
      );
      const nuevasActividades: string[] = [];
      const sentSlots: PendingCriterioSlot[] = [];
      for (const slot of pendingForComp) {
        const t = (actividades[slot.actIdx] ?? "").trim();
        if (t) {
          nuevasActividades.push(t);
          sentSlots.push(slot);
        }
      }

      const body = {
        gradoId,
        area: area.area,
        competencia: competenciaNombre,
        actividades,
        ...(nuevasActividades.length > 0 ? { nuevasActividades } : {}),
      };

      const syncKey = competenciaKey(areaIdx, compIdx, gradoId);
      setSavingActividadesKey(syncKey);
      if (nuevasActividades.length > 0) setCriteriosActividadSyncKey(syncKey);

      try {
        const res = await patchPropositosActividades(unidadId, body);
        if (res.success === false) return false;

        pendingCriteriosActividadRef.current = pendingCriteriosActividadRef.current.filter(
          (s) =>
            !sentSlots.some(
              (ss) =>
                ss.gradoId === s.gradoId &&
                ss.areaIdx === s.areaIdx &&
                ss.compIdx === s.compIdx &&
                ss.actIdx === s.actIdx
            )
        );

        const n = res.criteriosGeneradosParaActividades;
        if (n != null && n > 0) {
          handleToaster(
            n === 1
              ? "Se generaron criterios para la nueva actividad."
              : `Se generaron criterios para ${n} actividades nuevas.`,
            "success"
          );
        }

        const unidad = res.data as IUnidad | undefined;
        const serverItems = unidad?.contenido?.propositosPorGrado as IPropositosPorGradoItem[] | undefined;
        if (Array.isArray(serverItems) && serverItems.length > 0) {
          const aligned = alinearPropositosPorGradoActividadCriterios(serverItems);
          setPropositosPorGrado(aligned);
          updateContenido({ propositosPorGrado: aligned });
          if (aligned[0]?.propositos) {
            setPropositos(aligned[0].propositos);
            updateContenido({ propositos: aligned[0].propositos });
          }
        } else if (propositosPorGradoSnapshot) {
          const aligned = alinearPropositosPorGradoActividadCriterios(propositosPorGradoSnapshot);
          setPropositosPorGrado(aligned);
          updateContenido({ propositosPorGrado: aligned });
        }

        clearCompetenciaDirty(areaIdx, compIdx, gradoId);
        return true;
      } catch (err: any) {
        console.error("Error al sincronizar actividades (multigrado):", err);
        handleToaster(
          err?.response?.data?.message ??
            "No se pudo guardar las actividades del grado. Revisa la conexión o reintenta.",
          "error"
        );
        return false;
      } finally {
        setSavingActividadesKey((k) => (k === syncKey ? null : k));
        setCriteriosActividadSyncKey((k) => (k === syncKey ? null : k));
      }
    },
    [unidadId, updateContenido, clearCompetenciaDirty]
  );

  // Handler para editar una actividad in-place
  const handleActividadChange = (
    areaIdx: number,
    compIdx: number,
    actIdx: number,
    newValue: string
  ) => {
    if (!propositos) return;
    const prevComp = propositos.areasPropositos?.[areaIdx]?.competencias?.[compIdx];
    const prevActividad = prevComp?.actividades?.[actIdx] ?? "";
    const textoCambio = !sameActividadText(prevActividad, newValue);
    const nuevoConTexto = Boolean(newValue.trim());
    const updated: IPropositos = {
      ...propositos,
      areasPropositos: propositos.areasPropositos.map((area, aI) =>
        aI !== areaIdx
          ? area
          : {
              ...area,
              competencias: area.competencias.map((comp, cI) =>
                cI !== compIdx
                  ? comp
                  : {
                      ...comp,
                      actividades: comp.actividades.map((act, actI) =>
                        actI !== actIdx ? act : newValue
                      ),
                      actividadCriterios: (comp.actividadCriterios ?? []).map((ac, acI) => {
                        if (acI !== actIdx) return ac;
                        if (textoCambio) return { actividad: newValue, criterios: [] };
                        return { ...ac, actividad: newValue };
                      }),
                    }
              ),
            }
      ),
    };
    setPropositos(updated);
    if (textoCambio && nuevoConTexto) {
      upsertPendingSlot({ areaIdx, compIdx, actIdx });
    } else if (!nuevoConTexto) {
      removePendingSlot({ areaIdx, compIdx, actIdx });
    }
    markCompetenciaDirty(areaIdx, compIdx);
  };

  // Agregar una nueva actividad a una competencia (se guarda en el store)
  const handleAddActividad = (areaIdx: number, compIdx: number) => {
    if (!propositos) return;
    const area = propositos.areasPropositos[areaIdx];
    if (!area) return;
    const comp = area.competencias[compIdx];
    if (!comp) return;
    const currentActividades = comp.actividades ?? [];
    const newActIdx = currentActividades.length;
    upsertPendingSlot({ areaIdx, compIdx, actIdx: newActIdx });
    const updated: IPropositos = {
      ...propositos,
      areasPropositos: propositos.areasPropositos.map((a, aI) =>
        aI !== areaIdx
          ? a
          : {
              ...a,
              competencias: a.competencias.map((c, cI) =>
                cI !== compIdx
                  ? c
                  : {
                      ...c,
                      actividades: [...currentActividades, ""],
                      actividadCriterios: reconcileActividadCriteriosParaActividades(
                        [...currentActividades, ""],
                        c.actividadCriterios
                      ),
                    },
              ),
            }
      ),
    };
    setPropositos(updated);
    markCompetenciaDirty(areaIdx, compIdx);
  };

  // Eliminar una actividad
  const handleRemoveActividad = (areaIdx: number, compIdx: number, actIdx: number) => {
    if (!propositos) return;
    adjustPendingAfterRemove(areaIdx, compIdx, actIdx);
    const updated: IPropositos = {
      ...propositos,
      areasPropositos: propositos.areasPropositos.map((area, aI) =>
        aI !== areaIdx
          ? area
          : {
              ...area,
              competencias: area.competencias.map((comp, cI) => {
                if (cI !== compIdx) return comp;
                const actividadesNueva = comp.actividades.filter((_, i) => i !== actIdx);
                return {
                  ...comp,
                  actividades: actividadesNueva,
                  actividadCriterios: reconcileActividadCriteriosParaActividades(
                    actividadesNueva,
                    comp.actividadCriterios
                  ),
                };
              }),
            }
      ),
    };
    setPropositos(updated);
    markCompetenciaDirty(areaIdx, compIdx);
  };

  const handleActividadChangeMultigrado = (
    gradoId: number,
    areaIdx: number,
    compIdx: number,
    actIdx: number,
    newValue: string
  ) => {
    const item = propositosPorGrado.find((it) => it.gradoId === gradoId);
    const prevActividad =
      item?.propositos.areasPropositos?.[areaIdx]?.competencias?.[compIdx]?.actividades?.[actIdx] ?? "";
    const textoCambio = !sameActividadText(prevActividad, newValue);
    const nuevoConTexto = Boolean(newValue.trim());
    const updatedItems = propositosPorGrado.map((item) => {
      if (item.gradoId !== gradoId) return item;
      return {
        ...item,
        propositos: {
          ...item.propositos,
          areasPropositos: item.propositos.areasPropositos.map((area, aI) =>
            aI !== areaIdx
              ? area
              : {
                  ...area,
                  competencias: area.competencias.map((comp, cI) =>
                    cI !== compIdx
                      ? comp
                      : {
                          ...comp,
                          actividades: comp.actividades.map((act, actI) =>
                            actI !== actIdx ? act : newValue
                          ),
                          actividadCriterios: (comp.actividadCriterios ?? []).map((ac, acI) => {
                            if (acI !== actIdx) return ac;
                            if (textoCambio) return { actividad: newValue, criterios: [] };
                            return { ...ac, actividad: newValue };
                          }),
                        }
                  ),
                }
          ),
        },
      };
    });
    setPropositosPorGrado(updatedItems);
    if (textoCambio && nuevoConTexto) {
      upsertPendingSlot({ gradoId, areaIdx, compIdx, actIdx });
    } else if (!nuevoConTexto) {
      removePendingSlot({ gradoId, areaIdx, compIdx, actIdx });
    }
    markCompetenciaDirty(areaIdx, compIdx, gradoId);
  };

  const handleAddActividadMultigrado = (gradoId: number, areaIdx: number, compIdx: number) => {
    const item = propositosPorGrado.find((it) => it.gradoId === gradoId);
    const comp = item?.propositos.areasPropositos?.[areaIdx]?.competencias?.[compIdx];
    if (!comp) return;
    const currentActividades = comp.actividades ?? [];
    const newActIdx = currentActividades.length;
    upsertPendingSlot({ gradoId, areaIdx, compIdx, actIdx: newActIdx });

    const updatedItems = propositosPorGrado.map((it) => {
      if (it.gradoId !== gradoId) return it;
      return {
        ...it,
        propositos: {
          ...it.propositos,
          areasPropositos: it.propositos.areasPropositos.map((area, aI) =>
            aI !== areaIdx
              ? area
              : {
                  ...area,
                  competencias: area.competencias.map((c, cI) =>
                    cI !== compIdx
                      ? c
                      : {
                          ...c,
                          actividades: [...currentActividades, ""],
                          actividadCriterios: reconcileActividadCriteriosParaActividades(
                            [...currentActividades, ""],
                            c.actividadCriterios
                          ),
                        }
                  ),
                }
          ),
        },
      };
    });
    setPropositosPorGrado(updatedItems);
    markCompetenciaDirty(areaIdx, compIdx, gradoId);
  };

  const handleRemoveActividadMultigrado = (
    gradoId: number,
    areaIdx: number,
    compIdx: number,
    actIdx: number
  ) => {
    adjustPendingAfterRemove(areaIdx, compIdx, actIdx, gradoId);
    const updatedItems = propositosPorGrado.map((item) => {
      if (item.gradoId !== gradoId) return item;
      return {
        ...item,
        propositos: {
          ...item.propositos,
          areasPropositos: item.propositos.areasPropositos.map((area, aI) =>
            aI !== areaIdx
              ? area
              : {
                  ...area,
                  competencias: area.competencias.map((comp, cI) => {
                    if (cI !== compIdx) return comp;
                    const actividadesNueva = comp.actividades.filter((_, i) => i !== actIdx);
                    return {
                      ...comp,
                      actividades: actividadesNueva,
                      actividadCriterios: reconcileActividadCriteriosParaActividades(
                        actividadesNueva,
                        comp.actividadCriterios
                      ),
                    };
                  }),
                }
          ),
        },
      };
    });
    setPropositosPorGrado(updatedItems);
    markCompetenciaDirty(areaIdx, compIdx, gradoId);
  };

  const handleGuardarActividades = async (areaIdx: number, compIdx: number) => {
    if (!propositos || !isCompetenciaDirty(areaIdx, compIdx)) return;
    await syncActividadesToBackend(areaIdx, compIdx, propositos);
  };

  const handleGuardarActividadesMultigrado = async (
    gradoId: number,
    areaIdx: number,
    compIdx: number
  ) => {
    if (!isCompetenciaDirty(areaIdx, compIdx, gradoId)) return;
    await syncActividadesMultigradoToBackend(gradoId, areaIdx, compIdx, propositosPorGrado);
  };

  const isGenerating = generandoPaso !== null;

  /* ═══════════════════════════════════════════
     Generar TODO con IA (secuencial: 1→2→3)
     ═══════════════════════════════════════════ */
  const generarTodo = useCallback(async () => {
    if (!unidadId) return handleToaster("Error: unidad no creada", "error");

    let pasoEnCurso: "situacion" | "evidencias" | "propositos" | null = null;
    try {
      // 1. Situación Significativa
      pasoEnCurso = "situacion";
      setStatusSituacion("generating");
      setGenerandoPaso("Situación Significativa");
      const resSit = await generarSituacionSignificativa(unidadId);
      const sitData = resSit.data as ISituacionSignificativaResponse;
      const sitTexto = sitData.situacionSignificativa;
      setSituacionTexto(sitTexto);
      updateContenido({
        situacionSignificativa: sitTexto,
        situacionBase: sitData.situacionBase,
      });
      setStatusSituacion("done");

      // 2. Evidencias + Imagen de la situación (en paralelo)
      pasoEnCurso = "evidencias";
      setStatusEvidencias("generating");
      setGenerandoPaso("Evidencias");

      // Lanzar imagen en background (no bloquea el flujo)
      const imagenPromise = generarImagenSituacion({
        situacionSignificativa: sitTexto,
        problematica: datosBase?.problematicaNombre || "",
        grado: datosBase?.grado || "",
        nivel: datosBase?.nivel || "",
        unidadId: unidadId ?? undefined,
      })
        .then((imgRes) => {
          updateContenido({ imagenSituacionUrl: imgRes.url });
        })
        .catch((err) => {
          // No se pudo generar la imagen de situación
          // No es crítico, se continua sin imagen
        });

      const contenidoActual = useUnidadStore.getState().contenido;
      const resEv = await generarEvidencias(unidadId, contenidoActual as Record<string, unknown>);
      const evData = resEv.data as IEvidencias;
      setEvidencias(evData);
      updateContenido({ evidencias: evData });
      setStatusEvidencias("done");

      // 3. Propósitos
      pasoEnCurso = "propositos";
      setStatusPropositos("generating");
      setGenerandoPaso("Propósitos de Aprendizaje");
      const isSecundaria = Boolean((datosBase as any)?.esSecundariaWizard);
      const gradoIdsSec = getGradosSecundariaIds();
      const modoSecundaria = getModoSecundaria();
      const isSecundariaMonoOTutoria =
        modoSecundaria === "tutoria" || modoSecundaria === "mono_grado";
      let propData: IPropositos;
      let propositosPorGrado: IPropositosPorGradoItem[] | undefined;
      const contenidoParaProp = {
        ...useUnidadStore.getState().contenido,
        situacionSignificativa: sitTexto,
        evidencias: evData,
      };
      if (isSecundaria && !isSecundariaMonoOTutoria && gradoIdsSec.length > 1) {
        const planAreas = (datosBase as any)?.planificacionAreas ?? [];
        const totalSesiones: number =
          planAreas.reduce((acc: number, p: any) => acc + (Number(p.totalSesionesUnidad) || 0), 0) ||
          (datosBase?.duracion ?? 4);
        const resPropMulti = await generarPropositosMultigrado(unidadId, {
          gradoIds: gradoIdsSec,
          maxCompetenciasPorAreaSecundaria: 2,
          totalSesionesUnidad: totalSesiones,
          contenidoEditado: contenidoParaProp as Record<string, unknown>,
        });
        const lista = Array.isArray(resPropMulti.data) ? resPropMulti.data : [];
        propositosPorGrado = lista;
        propData =
          alinearPropositosActividadCriterios(
            (lista[0]?.propositos as IPropositos) || (contenido.propositos as IPropositos) || { areasPropositos: [], competenciasTransversales: [] }
          );
      } else {
        const resProp = await generarPropositos(unidadId, contenidoParaProp as Record<string, unknown>);
        propData = alinearPropositosActividadCriterios(resProp.data as IPropositos);
      }
      setPropositos(propData);
      setPropositosPorGrado(propositosPorGrado ?? []);
      updateContenido({
        propositos: propData,
        ...(propositosPorGrado ? { propositosPorGrado } : {}),
      });
      pendingCriteriosActividadRef.current = [];
      setDirtyCompetenciaKeys([]);
      setStatusPropositos("done");

      // Esperar la imagen si aún no terminó (no bloquea UX, ya terminaron los 3 pasos)
      await imagenPromise;

      setGenerandoPaso(null);
      handleToaster("¡Contenido generado con éxito!", "success");
    } catch (error: any) {
      console.error("Error al generar:", error);
      setGenerandoPaso(null);
      // Marcar únicamente el paso fallido para habilitar "Reintentar" en ese bloque.
      if (pasoEnCurso === "situacion") setStatusSituacion("error");
      if (pasoEnCurso === "evidencias") setStatusEvidencias("error");
      if (pasoEnCurso === "propositos") setStatusPropositos("error");
      handleToaster(
        error?.response?.data?.message || "Error al generar con IA",
        "error"
      );
    }
  }, [unidadId]);

  /* ─── Regenerar paso individual ─── */
  async function regenerar(paso: "situacion-significativa" | "evidencias" | "propositos") {
    if (!unidadId) return;
    const label =
      paso === "situacion-significativa"
        ? "Situación Significativa"
        : paso === "evidencias"
          ? "Evidencias"
          : "Propósitos";

    const setStatus =
      paso === "situacion-significativa"
        ? setStatusSituacion
        : paso === "evidencias"
          ? setStatusEvidencias
          : setStatusPropositos;

    setStatus("generating");
    setGenerandoPaso(label);

    try {
      if (paso === "situacion-significativa") {
        const res = await regenerarPasoUnidad(unidadId, paso);
        const d = res.data as unknown as ISituacionSignificativaResponse;
        setSituacionTexto(d.situacionSignificativa);
        updateContenido({
          situacionSignificativa: d.situacionSignificativa,
          situacionBase: d.situacionBase,
        });
      } else if (paso === "evidencias") {
        const res = await regenerarPasoUnidad(unidadId, paso);
        const d = res.data as unknown as IEvidencias;
        setEvidencias(d);
        updateContenido({ evidencias: d });
      } else {
        const isSecundaria = Boolean((datosBase as any)?.esSecundariaWizard);
        const gradoIdsSec = getGradosSecundariaIds();
        const modoSecundaria = getModoSecundaria();
        const isSecundariaMonoOTutoria =
          modoSecundaria === "tutoria" || modoSecundaria === "mono_grado";
        const contenidoRegenProp = {
          ...useUnidadStore.getState().contenido,
          ...(situacionTexto.trim() ? { situacionSignificativa: situacionTexto.trim() } : {}),
          ...(evidencias ? { evidencias } : {}),
        };
        if (isSecundaria && !isSecundariaMonoOTutoria && gradoIdsSec.length > 1) {
          const planAreasRegen = (datosBase as any)?.planificacionAreas ?? [];
          const totalSesionesRegen: number =
            planAreasRegen.reduce((acc: number, p: any) => acc + (Number(p.totalSesionesUnidad) || 0), 0) ||
            (datosBase?.duracion ?? 4);
          const resMulti = await generarPropositosMultigrado(unidadId, {
            gradoIds: gradoIdsSec,
            maxCompetenciasPorAreaSecundaria: 2,
            totalSesionesUnidad: totalSesionesRegen,
            contenidoEditado: contenidoRegenProp as Record<string, unknown>,
          });
          const lista = Array.isArray(resMulti.data) ? resMulti.data : [];
          const d = alinearPropositosActividadCriterios(
            (lista[0]?.propositos as IPropositos) || { areasPropositos: [], competenciasTransversales: [] }
          );
          setPropositos(d);
          setPropositosPorGrado(lista);
          updateContenido({ propositos: d, propositosPorGrado: lista });
          pendingCriteriosActividadRef.current = [];
          setDirtyCompetenciaKeys([]);
          setStatus("done");
          setGenerandoPaso(null);
          handleToaster(`${label} regenerado`, "success");
          return;
        }
        const contenidoParaProp = {
          ...useUnidadStore.getState().contenido,
          ...(situacionTexto.trim() ? { situacionSignificativa: situacionTexto.trim() } : {}),
          ...(evidencias ? { evidencias } : {}),
        };
        const res = await generarPropositos(unidadId, contenidoParaProp as Record<string, unknown>);
        const d = alinearPropositosActividadCriterios(res.data as unknown as IPropositos);
        setPropositos(d);
        updateContenido({ propositos: d });
        pendingCriteriosActividadRef.current = [];
        setDirtyCompetenciaKeys([]);
      }

      setStatus("done");
      setGenerandoPaso(null);
      handleToaster(`${label} regenerado`, "success");
    } catch (error: any) {
      setStatus("error");
      setGenerandoPaso(null);
      handleToaster(error?.response?.data?.message || `Error al regenerar ${label}`, "error");
    }
  }

  /* ─── Continuar ─── */
  function handleContinuar() {
    if (!contenido.situacionSignificativa) {
      return handleToaster("Primero genera la situación significativa", "error");
    }
    if (!contenido.evidencias) {
      return handleToaster("Primero genera las evidencias", "error");
    }
    if (!contenido.propositos) {
      return handleToaster("Primero genera los propósitos", "error");
    }
    if (dirtyCompetenciaKeys.length > 0) {
      return handleToaster(
        "Tienes actividades sin guardar en Propósitos. Pulsa Guardar antes de continuar.",
        "error"
      );
    }

    // Save situación as context for next time (non-blocking)
    if (contenido.situacionSignificativa.trim() && usuario?.id) {
      updateUsuario(usuario.id, {
        situacionSignificativaContexto: contenido.situacionSignificativa.trim(),
      }).catch(() => {});
      useUserStore.getState().updateUsuario({
        situacionSignificativaContexto: contenido.situacionSignificativa.trim(),
      });
    }

    setPagina(pagina + 1);
  }

  const allDone =
    statusSituacion === "done" &&
    statusEvidencias === "done" &&
    statusPropositos === "done";
  const isSecundariaWizard = Boolean((datosBase as any)?.esSecundariaWizard);
  const hasPropositosPorGrado = isSecundariaWizard && propositosPorGrado.length > 0;

  const getCriteriosByActividadIndex = useCallback(
    (comp: IPropositos["areasPropositos"][number]["competencias"][number], idx: number) => {
      const item = comp.actividadCriterios?.[idx];
      if (item?.criterios?.length) return item.criterios;
      return [];
    },
    []
  );

  const isSavingContenido = contenidoSaveStatus === "saving";
  const isGenerandoCriteriosActividad = criteriosActividadSyncKey !== null;
  const isSavingActividades = savingActividadesKey !== null;
  const uiBlockedPaso2 = isSavingContenido || isGenerandoCriteriosActividad || isSavingActividades;
  const mensajeBloqueoPaso2 =
    isGenerandoCriteriosActividad && isSavingContenido
      ? "Generando criterios de evaluación y guardando contenido…"
      : isGenerandoCriteriosActividad && isSavingActividades
        ? "Guardando actividades y generando criterios…"
        : isSavingActividades
          ? "Guardando actividades de los propósitos…"
      : isGenerandoCriteriosActividad
        ? "Generando criterios de evaluación para la(s) actividad(es) nueva(s)…"
        : "Guardando contenido…";

  return (
    <>
      <DialogPrimitive.Root open={uiBlockedPaso2} modal>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[600] bg-slate-950/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content
            className="fixed left-1/2 top-1/2 z-[601] w-[min(92vw,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl outline-none dark:border-slate-600 dark:bg-slate-900 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            aria-describedby={undefined}
          >
            <DialogPrimitive.Title className="sr-only">Operación en curso</DialogPrimitive.Title>
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-11 w-11 shrink-0 animate-spin text-emerald-600 dark:text-emerald-400" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{mensajeBloqueoPaso2}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  No cierres ni recargues esta página hasta que termine.
                </p>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* ── Header ── */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-emerald-600 text-xs font-bold">
              2
            </div>
            <span className="text-sm font-semibold tracking-wide">PASO 2 DE 4</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Situación Significativa y Propósitos
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            La IA generará la situación significativa, evidencias y propósitos de aprendizaje
          </p>
        </div>

        {/* ── Botón generar todo ── */}
        {!allDone && (
          <div className="text-center mb-10">
            <Button
              onClick={generarTodo}
              disabled={isGenerating || uiBlockedPaso2}
              className="h-16 px-10 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Generando {generandoPaso}...
                </>
              ) : (
                <>
                  <Wand2 className="mr-3 h-6 w-6" />
                  Generar con Inteligencia Artificial
                </>
              )}
            </Button>

            {isGenerating && (
              <div className="mt-4">
                <ProgressIndicator
                  steps={[
                    { label: "Situación Significativa", status: statusSituacion },
                    { label: "Evidencias", status: statusEvidencias },
                    { label: "Propósitos", status: statusPropositos },
                  ]}
                />
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════
            1 — Situación Significativa
            ═══════════════════════════════════════ */}
        <IASection
          icon={<Target className="h-6 w-6 text-white" />}
          title="Situación Significativa"
          gradient="from-emerald-600 to-teal-600"
          status={statusSituacion}
          onRegenerate={() => regenerar("situacion-significativa")}
          isGenerating={isGenerating}
          interactionLocked={uiBlockedPaso2}
        >
          {statusSituacion === "idle" && prevSituacion && (
            <button
              type="button"
              disabled={uiBlockedPaso2}
              onClick={() => {
                setSituacionTexto(prevSituacion);
                updateContenido({ situacionSignificativa: prevSituacion });
                setStatusSituacion("done");
                handleToaster("Situación significativa anterior restaurada", "success");
              }}
              className="flex items-start gap-2.5 w-full text-left p-3 rounded-xl border border-amber-200 dark:border-amber-700/40 bg-amber-50/80 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <RefreshCw className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Último usado — clic para reutilizar
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mt-1">
                  {prevSituacion}
                </p>
              </div>
            </button>
          )}
          {statusSituacion === "done" && (
            <div className={uiBlockedPaso2 ? "pointer-events-none select-none opacity-60" : undefined}>
              <MarkdownTextarea
                value={situacionTexto}
                onChange={(v) => {
                  setSituacionTexto(v);
                  updateContenido({ situacionSignificativa: v });
                }}
                rows={12}
                className="border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500"
                viewClassName="border-emerald-200 dark:border-emerald-800 min-h-[200px]"
              />
            </div>
          )}
        </IASection>

        {/* ═══════════════════════════════════════
            2 — Evidencias de Aprendizaje
            ═══════════════════════════════════════ */}
        <IASection
          icon={<FileCheck className="h-6 w-6 text-white" />}
          title="Evidencias de Aprendizaje"
          gradient="from-orange-500 to-amber-500"
          status={statusEvidencias}
          onRegenerate={() => regenerar("evidencias")}
          isGenerating={isGenerating}
          interactionLocked={uiBlockedPaso2}
        >
          {statusEvidencias === "done" && evidencias && (
            <div className={`space-y-4 ${uiBlockedPaso2 ? "pointer-events-none select-none opacity-60" : ""}`}>
              <EvidenciaField
                label="Propósito"
                value={evidencias.proposito}
                rows={6}
                onChange={(v) => {
                  const updated = { ...evidencias, proposito: v };
                  setEvidencias(updated);
                  updateContenido({ evidencias: updated });
                }}
              />
              <EvidenciaField
                label="Producto Integrador"
                value={evidencias.productoIntegrador}
                rows={3}
                onChange={(v) => {
                  const updated = { ...evidencias, productoIntegrador: v };
                  setEvidencias(updated);
                  updateContenido({ evidencias: updated });
                }}
              />
              <EvidenciaField
                label="Instrumento de Evaluación"
                value={evidencias.instrumentoEvaluacion}
                rows={3}
                onChange={(v) => {
                  const updated = { ...evidencias, instrumentoEvaluacion: v };
                  setEvidencias(updated);
                  updateContenido({ evidencias: updated });
                }}
              />
            </div>
          )}
        </IASection>

        {/* ═══════════════════════════════════════
            3 — Propósitos de Aprendizaje
            ═══════════════════════════════════════ */}
        <IASection
          icon={<BookOpen className="h-6 w-6 text-white" />}
          title="Propósitos de Aprendizaje"
          gradient="from-purple-600 to-pink-600"
          status={statusPropositos}
          onRegenerate={() => regenerar("propositos")}
          isGenerating={isGenerating}
          interactionLocked={uiBlockedPaso2}
        >
          {statusPropositos === "done" && hasPropositosPorGrado && (
            <div className={`space-y-4 ${uiBlockedPaso2 ? "pointer-events-none select-none opacity-60" : ""}`}>
              <button
                type="button"
                onClick={() => setExpandedPropositos(!expandedPropositos)}
                disabled={uiBlockedPaso2}
                className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400 hover:underline disabled:opacity-50 disabled:pointer-events-none"
              >
                {expandedPropositos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {propositosPorGrado.length} grado(s) con propósitos
              </button>

              {expandedPropositos && (
                <div className="space-y-6">
                  {propositosPorGrado.map((item, idxGrado) => (
                    <div
                      key={`${item.gradoId}-${idxGrado}`}
                      className="bg-purple-50/50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-100 dark:border-purple-900"
                    >
                      <h4 className="font-bold text-purple-700 dark:text-purple-400 mb-3">
                        {item.grado}
                      </h4>
                      {item.propositos.areasPropositos?.map((area, aIdx) => (
                        <div
                          key={`${item.gradoId}-${aIdx}`}
                          className="mb-4 rounded-md border border-purple-200/70 dark:border-purple-800/60 p-3 bg-white/80 dark:bg-slate-900/30"
                        >
                          <p className="font-semibold text-sm text-purple-800 dark:text-purple-300">{area.area}</p>
                          {area.competencias?.map((comp, cIdx) => (
                            <div
                              key={`${item.gradoId}-${aIdx}-${cIdx}`}
                              className="mt-3 ml-2 pl-3 border-l-2 border-purple-200 dark:border-purple-800"
                            >
                              <p className="font-semibold text-sm">{nombreCompetenciaProposito(comp)}</p>
                              {comp.capacidades?.length > 0 && (
                                <ul className="list-disc list-inside text-xs space-y-0.5 ml-2 mt-1">
                                  {comp.capacidades.map((cap, i) => (
                                    <li key={i}>{parseMarkdown(cap)}</li>
                                  ))}
                                </ul>
                              )}
                              <div className="mt-2">
                                <p className="text-xs text-slate-500 font-medium">
                                  Actividades y criterios agrupados:
                                </p>
                                {isCompetenciaDirty(aIdx, cIdx, item.gradoId) && (
                                  <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                    Hay cambios sin guardar en esta competencia.
                                  </p>
                                )}
                                <div className="space-y-1 ml-2 mt-1">
                                  {(comp.actividades ?? []).map((act, i) => (
                                    <div
                                      key={i}
                                      className="rounded-md border border-slate-200 dark:border-slate-700 p-2"
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-slate-400 shrink-0 w-5">{i + 1}.</span>
                                        <Input
                                          value={act}
                                          disabled={uiBlockedPaso2}
                                          onChange={(e) =>
                                            handleActividadChangeMultigrado(
                                              item.gradoId,
                                              aIdx,
                                              cIdx,
                                              i,
                                              e.target.value
                                            )
                                          }
                                          className="h-7 text-xs border-slate-200 dark:border-slate-700 focus:border-purple-400 dark:focus:border-purple-500 flex-1"
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 shrink-0 text-slate-400 hover:text-red-500"
                                          disabled={uiBlockedPaso2}
                                          onClick={() =>
                                            handleRemoveActividadMultigrado(item.gradoId, aIdx, cIdx, i)
                                          }
                                          title="Quitar actividad"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>

                                      {getCriteriosByActividadIndex(comp, i).length > 0 && (
                                        <ul className="list-disc list-inside text-xs space-y-0.5 mt-1 ml-6 text-slate-600 dark:text-slate-300">
                                          {getCriteriosByActividadIndex(comp, i).map((cr, cIdxLocal) => (
                                            <li key={cIdxLocal}>{parseMarkdown(cr)}</li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 h-8 text-xs gap-1.5 border-dashed border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                                    disabled={uiBlockedPaso2}
                                    onClick={() => handleAddActividadMultigrado(item.gradoId, aIdx, cIdx)}
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                    Agregar actividad
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="mt-2 ml-2 h-8 text-xs gap-1.5"
                                    disabled={uiBlockedPaso2 || !isCompetenciaDirty(aIdx, cIdx, item.gradoId)}
                                    onClick={() =>
                                      handleGuardarActividadesMultigrado(item.gradoId, aIdx, cIdx)
                                    }
                                  >
                                    {savingActividadesKey === competenciaKey(aIdx, cIdx, item.gradoId) ? (
                                      <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Guardando...
                                      </>
                                    ) : (
                                      "Guardar"
                                    )}
                                  </Button>
                                </div>
                              </div>
                              {comp.instrumento && (
                                <p className="text-xs mt-1">
                                  <span className="text-slate-500 font-medium">Instrumento:</span>{" "}
                                  {parseMarkdown(comp.instrumento)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {statusPropositos === "done" && !hasPropositosPorGrado && propositos && (
            <div className={`space-y-4 ${uiBlockedPaso2 ? "pointer-events-none select-none opacity-60" : ""}`}>
              {/* Toggle */}
              <button
                type="button"
                onClick={() => setExpandedPropositos(!expandedPropositos)}
                disabled={uiBlockedPaso2}
                className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400 hover:underline disabled:opacity-50 disabled:pointer-events-none"
              >
                {expandedPropositos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {propositos.areasPropositos?.length || 0} áreas con propósitos
              </button>

              {expandedPropositos && (
                <div className="space-y-6">
                  {propositos.areasPropositos?.map((area, aIdx) => (
                    <div
                      key={aIdx}
                      className="bg-purple-50/50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-100 dark:border-purple-900"
                    >
                      <h4 className="font-bold text-purple-700 dark:text-purple-400 mb-3">
                        {area.area}
                      </h4>
                      {area.competencias?.map((comp, cIdx) => (
                        <div
                          key={cIdx}
                          className="ml-2 mb-4 pl-3 border-l-2 border-purple-200 dark:border-purple-800"
                        >
                          <p className="font-semibold text-sm">{nombreCompetenciaProposito(comp)}</p>
                          {comp.capacidades?.length > 0 && (
                            <div className="mt-1">
                              <p className="text-xs text-slate-500 font-medium">Capacidades:</p>
                              <ul className="list-disc list-inside text-xs space-y-0.5 ml-2">
                                {comp.capacidades.map((cap, i) => (
                                  <li key={i}>{parseMarkdown(cap)}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="mt-1">
                            <p className="text-xs text-slate-500 font-medium">
                              Actividades y criterios agrupados:
                            </p>
                            {isCompetenciaDirty(aIdx, cIdx) && (
                              <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                Hay cambios sin guardar en esta competencia.
                              </p>
                            )}
                            <div className="space-y-1 ml-2 mt-1">
                              {(comp.actividades ?? []).map((act, i) => (
                                <div
                                  key={i}
                                  className="rounded-md border border-slate-200 dark:border-slate-700 p-2"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-slate-400 shrink-0 w-5">{i + 1}.</span>
                                    <Input
                                      value={act}
                                      disabled={uiBlockedPaso2}
                                      onChange={(e) =>
                                        handleActividadChange(aIdx, cIdx, i, e.target.value)
                                      }
                                      className="h-7 text-xs border-slate-200 dark:border-slate-700 focus:border-purple-400 dark:focus:border-purple-500 flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 shrink-0 text-slate-400 hover:text-red-500"
                                      disabled={uiBlockedPaso2}
                                      onClick={() => handleRemoveActividad(aIdx, cIdx, i)}
                                      title="Quitar actividad"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>

                                  {getCriteriosByActividadIndex(comp, i).length > 0 && (
                                    <ul className="list-disc list-inside text-xs space-y-0.5 mt-1 ml-6 text-slate-600 dark:text-slate-300">
                                      {getCriteriosByActividadIndex(comp, i).map((cr, cIdxLocal) => (
                                        <li key={cIdxLocal}>{parseMarkdown(cr)}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2 h-8 text-xs gap-1.5 border-dashed border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                                disabled={uiBlockedPaso2}
                                onClick={() => handleAddActividad(aIdx, cIdx)}
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Agregar actividad
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                className="mt-2 ml-2 h-8 text-xs gap-1.5"
                                disabled={uiBlockedPaso2 || !isCompetenciaDirty(aIdx, cIdx)}
                                onClick={() => handleGuardarActividades(aIdx, cIdx)}
                              >
                                {savingActividadesKey === competenciaKey(aIdx, cIdx) ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Guardando...
                                  </>
                                ) : (
                                  "Guardar"
                                )}
                              </Button>
                            </div>
                          </div>
                          {comp.instrumento && (
                            <p className="text-xs mt-1">
                              <span className="text-slate-500 font-medium">Instrumento:</span>{" "}
                              {parseMarkdown(comp.instrumento)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Competencias Transversales */}
                  {propositos.competenciasTransversales?.length > 0 && (
                    <div className="bg-pink-50/50 dark:bg-pink-950/30 rounded-lg p-4 border border-pink-100 dark:border-pink-900">
                      <h4 className="font-bold text-pink-700 dark:text-pink-400 mb-3">
                        Competencias Transversales
                      </h4>
                      {propositos.competenciasTransversales.map((ct, i) => (
                        <div key={i} className="mb-3 ml-2 pl-3 border-l-2 border-pink-200 dark:border-pink-800">
                          <p className="font-semibold text-sm">{ct.nombre}</p>
                          {ct.capacidades?.length > 0 && (
                            <ul className="list-disc list-inside text-xs space-y-0.5 ml-2 mt-1">
                              {ct.capacidades.map((c, j) => (
                                <li key={j}>{parseMarkdown(c)}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </IASection>

        {/* ── Navegación ── */}
        <div className="flex justify-between pb-10">
          <Button
            onClick={() => setPagina(pagina - 1)}
            variant="outline"
            className="h-14 px-8 text-lg"
            disabled={uiBlockedPaso2}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Anterior
          </Button>
          <Button
            onClick={handleContinuar}
            disabled={!allDone || uiBlockedPaso2 || dirtyCompetenciaKeys.length > 0}
            className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   Componentes auxiliares
   ═══════════════════════════════════════════ */

/** Sección con estado de IA */
function IASection({
  icon,
  title,
  gradient,
  status,
  onRegenerate,
  isGenerating,
  interactionLocked = false,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  gradient: string;
  status: GenerationStatus;
  onRegenerate: () => void;
  isGenerating: boolean;
  /** Bloqueo por guardado automático o generación de criterios (modal a pantalla) */
  interactionLocked?: boolean;
  children: React.ReactNode;
}) {
  const regenDisabled = isGenerating || interactionLocked;
  return (
    <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center gap-2">
          <div className={`h-10 w-10 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          {title}
          {status === "done" && <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />}
        </CardTitle>

        {status === "done" && (
          <Button
            onClick={onRegenerate}
            disabled={regenDisabled}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            Regenerar
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {status === "idle" && (
          <div className="text-center py-8 text-slate-400">
            <Wand2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm mb-3">Pendiente de generación</p>
            <Button onClick={onRegenerate} variant="outline" size="sm" disabled={regenDisabled}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Generar ahora
            </Button>
          </div>
        )}

        {status === "generating" && (
          <div className="flex flex-col items-center py-10 gap-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500 animate-spin" />
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-emerald-500 animate-pulse" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
              Generando {title}...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center py-8">
            <p className="text-sm text-red-500 mb-2">Error al generar. Intenta de nuevo.</p>
            <Button onClick={onRegenerate} variant="destructive" size="sm" disabled={regenDisabled}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Reintentar
            </Button>
          </div>
        )}

        {status === "done" && children}
      </CardContent>
    </Card>
  );
}

/** Campo editable de evidencias */
function EvidenciaField({
  label,
  value,
  rows = 3,
  onChange,
}: {
  label: string;
  value: string;
  rows?: number;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-1 block">
        {label}
      </label>
      <MarkdownTextarea
        value={value}
        onChange={onChange}
        rows={rows}
        className="border-orange-200 dark:border-orange-800 focus:ring-orange-500"
        viewClassName="border-orange-200 dark:border-orange-800"
      />
    </div>
  );
}

/** Indicador de progreso de generación */
function ProgressIndicator({
  steps,
}: {
  steps: { label: string; status: GenerationStatus }[];
}) {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          {step.status === "done" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          {step.status === "generating" && <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />}
          {step.status === "idle" && (
            <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
          )}
          {step.status === "error" && <div className="w-5 h-5 rounded-full bg-red-500" />}
          <span
            className={`text-sm ${
              step.status === "generating"
                ? "font-semibold text-emerald-600 dark:text-emerald-400"
                : step.status === "done"
                  ? "text-green-600 dark:text-green-400"
                  : "text-slate-400"
            }`}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && <span className="text-slate-300 dark:text-slate-600 mx-1">→</span>}
        </div>
      ))}
    </div>
  );
}

export default Step2SituacionPropositos;
