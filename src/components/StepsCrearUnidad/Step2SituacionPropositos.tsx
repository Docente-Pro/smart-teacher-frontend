import { useState, useCallback, useEffect, useRef } from "react";
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
  regenerarPasoUnidad,
  generarImagenSituacion,
} from "@/services/ia-unidad.service";
import { patchPropositosActividades } from "@/services/unidad.service";
import { updateUsuario } from "@/services/usuarios.service";
import type { IUsuario } from "@/interfaces/IUsuario";
import type {
  ISituacionSignificativaResponse,
  IEvidencias,
  IPropositos,
} from "@/interfaces/IUnidadIA";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuario: IUsuario;
}

type GenerationStatus = "idle" | "generating" | "done" | "error";

function Step2SituacionPropositos({ pagina, setPagina, usuario }: Props) {
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
      setPropositos(contenido.propositos);
      setStatusPropositos("done");
    }
  }, [contenido.situacionSignificativa, contenido.evidencias, contenido.propositos]);

  // Secciones colapsadas
  const [expandedPropositos, setExpandedPropositos] = useState(true);
  const syncActividadesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (syncActividadesTimerRef.current) clearTimeout(syncActividadesTimerRef.current);
  }, []);

  // Sincroniza las actividades de una competencia con el backend (PATCH). Si no se pasa propositos, lee del store.
  const syncActividadesToBackend = useCallback(
    (areaIdx: number, compIdx: number, propositosSnapshot?: IPropositos | null) => {
      if (!unidadId) return;
      const props = propositosSnapshot ?? useUnidadStore.getState().contenido?.propositos;
      if (!props?.areasPropositos?.[areaIdx]?.competencias?.[compIdx]) return;
      const area = props.areasPropositos[areaIdx];
      const comp = area.competencias[compIdx];
      const actividades = comp.actividades ?? [];
      patchPropositosActividades(unidadId, {
        area: area.area,
        competencia: comp.nombre,
        actividades,
      }).catch((err) => {
        console.error("Error al sincronizar actividades:", err);
        handleToaster("No se pudo guardar en el servidor. Revisa la conexión.", "error");
      });
    },
    [unidadId]
  );

  // Handler para editar una actividad in-place
  const handleActividadChange = (
    areaIdx: number,
    compIdx: number,
    actIdx: number,
    newValue: string
  ) => {
    if (!propositos) return;
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
                      actividadCriterios: (comp.actividadCriterios ?? []).map((ac, acI) =>
                        acI !== actIdx ? ac : { ...ac, actividad: newValue }
                      ),
                    }
              ),
            }
      ),
    };
    setPropositos(updated);
    updateContenido({ propositos: updated });
    if (syncActividadesTimerRef.current) clearTimeout(syncActividadesTimerRef.current);
    syncActividadesTimerRef.current = setTimeout(() => {
      syncActividadesToBackend(areaIdx, compIdx);
      syncActividadesTimerRef.current = null;
    }, 600);
  };

  // Agregar una nueva actividad a una competencia (se guarda en el store)
  const handleAddActividad = (areaIdx: number, compIdx: number) => {
    if (!propositos) return;
    const area = propositos.areasPropositos[areaIdx];
    if (!area) return;
    const comp = area.competencias[compIdx];
    if (!comp) return;
    const currentActividades = comp.actividades ?? [];
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
                      actividadCriterios: [
                        ...(c.actividadCriterios ?? []),
                        { actividad: "", criterios: [] },
                      ],
                    },
              ),
            }
      ),
    };
    setPropositos(updated);
    updateContenido({ propositos: updated });
    if (syncActividadesTimerRef.current) clearTimeout(syncActividadesTimerRef.current);
    syncActividadesToBackend(areaIdx, compIdx, updated);
  };

  // Eliminar una actividad
  const handleRemoveActividad = (areaIdx: number, compIdx: number, actIdx: number) => {
    if (!propositos) return;
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
                      actividades: comp.actividades.filter((_, i) => i !== actIdx),
                      actividadCriterios: (comp.actividadCriterios ?? []).filter(
                        (_, i) => i !== actIdx
                      ),
                    }
              ),
            }
      ),
    };
    setPropositos(updated);
    updateContenido({ propositos: updated });
    if (syncActividadesTimerRef.current) clearTimeout(syncActividadesTimerRef.current);
    syncActividadesToBackend(areaIdx, compIdx, updated);
  };

  const isGenerating = generandoPaso !== null;

  /* ═══════════════════════════════════════════
     Generar TODO con IA (secuencial: 1→2→3)
     ═══════════════════════════════════════════ */
  const generarTodo = useCallback(async () => {
    if (!unidadId) return handleToaster("Error: unidad no creada", "error");

    try {
      // 1. Situación Significativa
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
      setStatusPropositos("generating");
      setGenerandoPaso("Propósitos de Aprendizaje");
      const contenidoParaProp = useUnidadStore.getState().contenido;
      const resProp = await generarPropositos(unidadId, contenidoParaProp as Record<string, unknown>);
      const propData = resProp.data as IPropositos;
      setPropositos(propData);
      updateContenido({ propositos: propData });
      setStatusPropositos("done");

      // Esperar la imagen si aún no terminó (no bloquea UX, ya terminaron los 3 pasos)
      await imagenPromise;

      setGenerandoPaso(null);
      handleToaster("¡Contenido generado con éxito!", "success");
    } catch (error: any) {
      console.error("Error al generar:", error);
      setGenerandoPaso(null);
      // Marcar secciones fallidas
      if (statusSituacion === "generating") setStatusSituacion("error");
      if (statusEvidencias === "generating") setStatusEvidencias("error");
      if (statusPropositos === "generating") setStatusPropositos("error");
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
      const res = await regenerarPasoUnidad(unidadId, paso);

      if (paso === "situacion-significativa") {
        const d = res.data as unknown as ISituacionSignificativaResponse;
        setSituacionTexto(d.situacionSignificativa);
        updateContenido({
          situacionSignificativa: d.situacionSignificativa,
          situacionBase: d.situacionBase,
        });
      } else if (paso === "evidencias") {
        const d = res.data as unknown as IEvidencias;
        setEvidencias(d);
        updateContenido({ evidencias: d });
      } else {
        const d = res.data as unknown as IPropositos;
        setPropositos(d);
        updateContenido({ propositos: d });
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

  const getCriteriosByActividadIndex = useCallback(
    (comp: IPropositos["areasPropositos"][number]["competencias"][number], idx: number) => {
      const item = comp.actividadCriterios?.[idx];
      if (item?.criterios?.length) return item.criterios;
      return [];
    },
    []
  );

  return (
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
              disabled={isGenerating}
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
        >
          {statusSituacion === "idle" && prevSituacion && (
            <button
              type="button"
              onClick={() => {
                setSituacionTexto(prevSituacion);
                updateContenido({ situacionSignificativa: prevSituacion });
                setStatusSituacion("done");
                handleToaster("Situación significativa anterior restaurada", "success");
              }}
              className="flex items-start gap-2.5 w-full text-left p-3 rounded-xl border border-amber-200 dark:border-amber-700/40 bg-amber-50/80 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
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
        >
          {statusEvidencias === "done" && evidencias && (
            <div className="space-y-4">
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
        >
          {statusPropositos === "done" && propositos && (
            <div className="space-y-4">
              {/* Toggle */}
              <button
                onClick={() => setExpandedPropositos(!expandedPropositos)}
                className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400 hover:underline"
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
                          <p className="font-semibold text-sm">{comp.nombre}</p>
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
                                onClick={() => handleAddActividad(aIdx, cIdx)}
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Agregar actividad
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
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Anterior
          </Button>
          <Button
            onClick={handleContinuar}
            disabled={!allDone}
            className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
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
  children,
}: {
  icon: React.ReactNode;
  title: string;
  gradient: string;
  status: GenerationStatus;
  onRegenerate: () => void;
  isGenerating: boolean;
  children: React.ReactNode;
}) {
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
            disabled={isGenerating}
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
            <p className="text-sm">Pendiente de generación</p>
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
            <Button onClick={onRegenerate} variant="destructive" size="sm">
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
