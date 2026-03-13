import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseMarkdown } from "@/utils/parseMarkdown";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Compass,
  Layers,
  Loader2,
  Wand2,
  CheckCircle2,
  Trash2,
  BookOpen,
} from "lucide-react";
import { useUnidadStore } from "@/store/unidad.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { getUnidadById, editarContenidoUnidad } from "@/services/unidad.service";
import {
  generarAreasComplementarias,
  generarEnfoques,
  generarCampoTematico,
  regenerarPasoUnidad,
} from "@/services/ia-unidad.service";
import type { IUsuario } from "@/interfaces/IUsuario";
import type {
  IAreaComplementaria,
  IAreasComplementariasResponse,
  ICampoTematicoItem,
  IEnfoqueUnidad,
  IEnfoquesResponse,
} from "@/interfaces/IUnidadIA";
import {
  horarioIncluyeTutoriaOPlanLectorParaGrado,
  horarioIncluyeTutoriaYPlanLectorParaGrado,
} from "@/interfaces/IHorario";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuario: IUsuario;
}

type GenerationStatus = "idle" | "generating" | "done" | "error";

/** Filtra áreas complementarias según lo que el docente marcó en el horario (solo Tutoría, solo Plan Lector, o ambos). */
function filterAreasByHorarioSelection(
  areas: IAreaComplementaria[],
  incluyeTutoria: boolean,
  incluyePlanLector: boolean
): IAreaComplementaria[] {
  if (!areas?.length) return [];
  return areas.filter((ac) => {
    const name = (ac.area ?? "").toLowerCase().normalize("NFD").replace(/\u0300/g, "");
    const isTutoria = name.includes("tutoria");
    const isPlanLector = name.includes("plan lector");
    if (incluyeTutoria && incluyePlanLector) return isTutoria || isPlanLector;
    if (incluyeTutoria) return isTutoria;
    if (incluyePlanLector) return isPlanLector;
    return false;
  });
}

const AREA_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-red-500",
  "from-indigo-500 to-violet-500",
];

const ENFOQUE_COLORS = [
  "border-l-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30",
  "border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/30",
  "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/30",
  "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30",
  "border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/30",
  "border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30",
];

/** Normaliza la respuesta del endpoint de enfoques a un array (data.enfoques o data.data.enfoques o objeto único) */
function normalizarEnfoquesRespuesta(res: any): IEnfoqueUnidad[] {
  const raw = res?.data?.enfoques ?? res?.enfoques;
  return normalizarEnfoquesContenido(raw);
}

/** Normaliza contenido.enfoques desde BD: puede ser array, o { enfoques: [] }, o un solo objeto */
function normalizarEnfoquesContenido(raw: unknown): IEnfoqueUnidad[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && Array.isArray((raw as { enfoques?: unknown[] }).enfoques))
    return (raw as { enfoques: IEnfoqueUnidad[] }).enfoques;
  const obj = raw as IEnfoqueUnidad | undefined;
  if (obj && typeof obj.enfoque === "string") return [obj];
  return [];
}

function Step3EnfoquesComplementos({ pagina, setPagina }: Props) {
  const {
    unidadId,
    datosBase,
    contenido,
    updateContenido,
    setContenido,
    setDatosBase,
    generandoPaso,
    setGenerandoPaso,
    unidadBatch,
    selectUnidad,
    batchStep3DoneIds,
    addBatchStep3DoneId,
    setBatchStep3DoneIds,
    incluyeTutoria,
    incluyePlanLector,
    horario,
  } = useUnidadStore();

  const isSecundariaBatch = datosBase?.nivel?.toLowerCase().includes("secundaria") && unidadBatch.length > 1 && !!datosBase?.grado;
  const { incluyeTutoria: tutoriaParaGrado, incluyePlanLector: planLectorParaGrado } = isSecundariaBatch
    ? horarioIncluyeTutoriaYPlanLectorParaGrado(horario, datosBase.grado)
    : { incluyeTutoria: incluyeTutoria, incluyePlanLector: incluyePlanLector };
  const incluyeAreasComplementarias = tutoriaParaGrado || planLectorParaGrado;

  // Primaria: siempre requiere áreas + enfoques. Secundaria/Inicial: solo enfoques (áreas opcionales).
  const isPrimaria = datosBase?.nivel?.toLowerCase().includes("primaria");
  const isSecundaria = datosBase?.nivel?.toLowerCase().includes("secundaria");

  const [statusCampoTematico, setStatusCampoTematico] = useState<GenerationStatus>(
    contenido.campoTematicoAplica && contenido.camposTematicos?.length ? "done" : "idle"
  );
  const [camposTematicos, setCamposTematicos] = useState<ICampoTematicoItem[]>(
    contenido.camposTematicos || []
  );
  const [statusAreas, setStatusAreas] = useState<GenerationStatus>(
    contenido.areasComplementarias?.length ? "done" : "idle"
  );
  const [statusEnfoques, setStatusEnfoques] = useState<GenerationStatus>(
    contenido.enfoques?.length ? "done" : "idle"
  );

  const [areasComp, setAreasComp] = useState<IAreaComplementaria[]>(
    contenido.areasComplementarias || []
  );
  const [enfoques, setEnfoques] = useState<IEnfoqueUnidad[]>(contenido.enfoques || []);

  // ─── Sincronizar estado local con store (al cambiar de pestaña o rehidratar) ───
  useEffect(() => {
    setCamposTematicos(contenido.camposTematicos || []);
    setStatusCampoTematico(
      contenido.campoTematicoAplica && contenido.camposTematicos?.length ? "done" : "idle"
    );
    const areasRaw = contenido.areasComplementarias || [];
    const areasFiltradas = filterAreasByHorarioSelection(areasRaw, tutoriaParaGrado, planLectorParaGrado);
    setAreasComp(areasFiltradas);
    setStatusAreas(areasFiltradas.length ? "done" : (incluyeAreasComplementarias ? "idle" : "done"));
    const enfList = normalizarEnfoquesContenido(contenido.enfoques);
    setEnfoques(enfList);
    setStatusEnfoques(enfList.length ? "done" : "idle");
  }, [contenido.areasComplementarias, contenido.enfoques, contenido.camposTematicos, unidadId, tutoriaParaGrado, planLectorParaGrado, incluyeAreasComplementarias]);

  const isGenerating = generandoPaso !== null;

  /* ═══════════════════════════════════════════
     Generar TODO (campo temático si Secundaria + pasos 4 + 5)
     ═══════════════════════════════════════════ */
  const generarTodo = useCallback(async (skipSuccessToaster = false) => {
    const id = useUnidadStore.getState().unidadId;
    if (!id) return handleToaster("Error: unidad no creada", "error");

    const store = useUnidadStore.getState();
    const base = store.datosBase;
    const contenidoActual = store.contenido;
    const isSecundaria = base?.nivel?.toLowerCase().includes("secundaria");

    try {
      // Campo temático (solo Secundaria, después de propósitos)
      if (isSecundaria) {
        setStatusCampoTematico("generating");
        setGenerandoPaso("Campo temático");
        const resCampo = await generarCampoTematico(id, contenidoActual as Record<string, unknown>);
        const items = resCampo.camposTematicos ?? [];
        setCamposTematicos(items);
        updateContenido({
          campoTematicoAplica: resCampo.aplica,
          camposTematicos: items,
        });
        setStatusCampoTematico(resCampo.aplica && items.length > 0 ? "done" : "idle");
      }

      // 4. Áreas Complementarias (solo si para este grado hay Tutoría o Plan Lector en el horario)
      const store = useUnidadStore.getState();
      const base = store.datosBase;
      const horarioActual = store.horario;
      const esBatchGrado = base?.nivel?.toLowerCase().includes("secundaria") && store.unidadBatch.length > 1 && !!base?.grado;
      const { incluyeTutoria: tGrado, incluyePlanLector: pGrado } = esBatchGrado
        ? horarioIncluyeTutoriaYPlanLectorParaGrado(horarioActual, base.grado)
        : { incluyeTutoria: store.incluyeTutoria, incluyePlanLector: store.incluyePlanLector };
      const incluyeAreas = tGrado || pGrado;
      if (incluyeAreas) {
        setStatusAreas("generating");
        setGenerandoPaso("Áreas Complementarias");
        const contenidoDespuesCampo = useUnidadStore.getState().contenido;
        const resAreas = await generarAreasComplementarias(id, contenidoDespuesCampo as Record<string, unknown>);
        const areasData = (resAreas.data as IAreasComplementariasResponse).areasComplementarias ?? [];
        const areasFiltradas = filterAreasByHorarioSelection(areasData, tGrado, pGrado);
        setAreasComp(areasFiltradas);
        updateContenido({ areasComplementarias: areasFiltradas });
        setStatusAreas("done");
      } else {
        setAreasComp([]);
        updateContenido({ areasComplementarias: [] });
        setStatusAreas("done");
      }

      // 5. Enfoques Transversales
      setStatusEnfoques("generating");
      setGenerandoPaso("Enfoques Transversales");
      const contenidoParaEnf = useUnidadStore.getState().contenido;
      const resEnf = await generarEnfoques(id, contenidoParaEnf as Record<string, unknown>);
      const enfData = normalizarEnfoquesRespuesta(resEnf);
      setEnfoques(enfData);
      updateContenido({ enfoques: enfData });
      setStatusEnfoques("done");

      setGenerandoPaso(null);
      if (!skipSuccessToaster) handleToaster("¡Enfoques y áreas complementarias generados!", "success");
    } catch (error: any) {
      console.error("Error al generar:", error);
      setGenerandoPaso(null);
      if (statusCampoTematico === "generating") setStatusCampoTematico("error");
      if (statusAreas === "generating") setStatusAreas("error");
      if (statusEnfoques === "generating") setStatusEnfoques("error");
      handleToaster(
        error?.response?.data?.message || "Error al generar con IA",
        "error"
      );
    }
  }, []);

  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    gradoNombre: string;
  } | null>(null);

  useEffect(() => {
    if (unidadBatch.length <= 1) return;
    const check = async () => {
      const done: string[] = [];
      for (const u of unidadBatch) {
        try {
          const res = await getUnidadById(u.id);
          const unit = (res as any).data?.data ?? (res as any).data;
          let cont = unit?.contenido ?? {};
          if (typeof cont === "string") {
            try { cont = JSON.parse(cont); } catch { cont = {}; }
          }
          const c = cont as { enfoques?: unknown; areasComplementarias?: unknown[] };
          const hasEnfoques = normalizarEnfoquesContenido(c.enfoques).length > 0;
          const hasAreas = (c.areasComplementarias?.length ?? 0) > 0;
          const areasOk = !incluyeAreasComplementarias || hasAreas;
          if (isPrimaria ? hasEnfoques && areasOk : hasEnfoques) done.push(u.id);
        } catch {
          // ignore
        }
      }
      if (done.length > 0) setBatchStep3DoneIds(done);
    };
    check();
  }, [unidadBatch.length, unidadBatch.map((u) => u.id).join(","), isPrimaria, incluyeAreasComplementarias]);

  const generarTodoBatch = useCallback(async () => {
    if (unidadBatch.length <= 1) return generarTodo();
    setBatchProgress({ current: 1, total: unidadBatch.length, gradoNombre: unidadBatch[0].gradoNombre });
    const errored: string[] = [];
    for (let i = 0; i < unidadBatch.length; i++) {
      const u = unidadBatch[i];
      setBatchProgress({ current: i + 1, total: unidadBatch.length, gradoNombre: u.gradoNombre });
      setGenerandoPaso(`${u.gradoNombre} (${i + 1}/${unidadBatch.length})`);
      try {
        selectUnidad(u.id);
        const res = await getUnidadById(u.id);
        const unit = (res as any).data?.data ?? (res as any).data;
        let cont = unit?.contenido ?? {};
        if (typeof cont === "string") {
          try { cont = JSON.parse(cont); } catch { cont = {}; }
        }
        const contNorm = {
          ...(cont as object),
          enfoques: normalizarEnfoquesContenido((cont as { enfoques?: unknown }).enfoques),
        };
        setContenido(contNorm);
        const base = useUnidadStore.getState().datosBase;
        if (base) setDatosBase({ ...base, grado: u.gradoNombre });
        setAreasComp((cont as { areasComplementarias?: IAreaComplementaria[] }).areasComplementarias || []);
        setStatusAreas((cont as { areasComplementarias?: unknown[] }).areasComplementarias?.length ? "done" : "idle");
        setEnfoques(contNorm.enfoques);
        setStatusEnfoques(contNorm.enfoques.length ? "done" : "idle");
        await generarTodo(true);
        // Persistir contenido de esta unidad antes de cambiar al siguiente (el auto-save tiene debounce y no daría tiempo)
        const contenidoActual = useUnidadStore.getState().contenido;
        await editarContenidoUnidad(u.id, { contenido: contenidoActual as Record<string, unknown> });
        addBatchStep3DoneId(u.id);
      } catch (e) {
        console.error("Error generando paso 3 para", u.gradoNombre, e);
        errored.push(u.gradoNombre);
      }
    }
    setBatchProgress(null);
    setGenerandoPaso(null);
    if (errored.length > 0) handleToaster(`Error en: ${errored.join(", ")}`, "error");
    else handleToaster("Todos los grados generados correctamente.", "success");
  }, [unidadBatch, generarTodo, selectUnidad, setContenido, setDatosBase, addBatchStep3DoneId, setGenerandoPaso]);

  /* ─── Regenerar campo temático ─── */
  async function regenerarCampoTematicoHandler() {
    const store = useUnidadStore.getState();
    const id = store.unidadId;
    const contenidoActual = store.contenido;
    if (!id) return;

    setStatusCampoTematico("generating");
    setGenerandoPaso("Campo temático");
    try {
      const resCampo = await generarCampoTematico(id, contenidoActual as Record<string, unknown>);
      const items = resCampo.camposTematicos ?? [];
      setCamposTematicos(items);
      updateContenido({
        campoTematicoAplica: resCampo.aplica,
        camposTematicos: items,
      });
      setStatusCampoTematico(resCampo.aplica && items.length > 0 ? "done" : "idle");
      setGenerandoPaso(null);
      handleToaster("Campo temático regenerado", "success");
    } catch (error: any) {
      setStatusCampoTematico("error");
      setGenerandoPaso(null);
      handleToaster(error?.response?.data?.message || "Error al regenerar campo temático", "error");
    }
  }

  /* ─── Regenerar individual ─── */
  async function regenerar(paso: "areas-complementarias" | "enfoques") {
    const id = useUnidadStore.getState().unidadId;
    if (!id) return;
    const label = paso === "areas-complementarias" ? "Áreas Complementarias" : "Enfoques Transversales";
    const setStatus = paso === "areas-complementarias" ? setStatusAreas : setStatusEnfoques;

    setStatus("generating");
    setGenerandoPaso(label);

    try {
      const res = await regenerarPasoUnidad(id, paso);

      if (paso === "areas-complementarias") {
        const d = (res.data as unknown as IAreasComplementariasResponse).areasComplementarias ?? [];
        const store = useUnidadStore.getState();
        const base = store.datosBase;
        const horarioActual = store.horario;
        const esBatchGrado = base?.nivel?.toLowerCase().includes("secundaria") && store.unidadBatch.length > 1 && !!base?.grado;
        const { incluyeTutoria: tGrado, incluyePlanLector: pGrado } = esBatchGrado
          ? horarioIncluyeTutoriaYPlanLectorParaGrado(horarioActual, base.grado)
          : { incluyeTutoria: store.incluyeTutoria, incluyePlanLector: store.incluyePlanLector };
        const filtered = filterAreasByHorarioSelection(d, tGrado, pGrado);
        setAreasComp(filtered);
        updateContenido({ areasComplementarias: filtered });
      } else {
        const d = normalizarEnfoquesRespuesta(res);
        setEnfoques(d);
        updateContenido({ enfoques: d });
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

  /* ─── Eliminar un área complementaria ─── */
  function removeAreaComp(index: number) {
    const updated = areasComp.filter((_, i) => i !== index);
    setAreasComp(updated);
    updateContenido({ areasComplementarias: updated });
  }

  /* ─── Eliminar un enfoque ─── */
  function removeEnfoque(index: number) {
    const updated = enfoques.filter((_, i) => i !== index);
    setEnfoques(updated);
    updateContenido({ enfoques: updated });
  }

  /* ─── No usar áreas complementarias (solo Secundaria / no Primaria) ─── */
  function removeAllAreasComp() {
    setAreasComp([]);
    updateContenido({ areasComplementarias: [] });
    setStatusAreas("idle");
  }

  function handleContinuar() {
    if (unidadBatch.length > 1) {
      if (!unidadBatch.every((u) => batchStep3DoneIds.includes(u.id))) {
        return handleToaster("Genera el paso 3 para todos los grados antes de continuar", "error");
      }
    } else {
      if (!contenido.enfoques?.length) {
        return handleToaster("Primero genera los enfoques transversales", "error");
      }
      if (isPrimaria && incluyeAreasComplementarias && !contenido.areasComplementarias?.length) {
        return handleToaster("Genera las áreas complementarias antes de continuar", "error");
      }
    }
    setPagina(pagina + 1);
  }

  const enfoquesDone = statusEnfoques === "done" && (contenido.enfoques?.length ?? 0) > 0;
  const areasDone = !incluyeAreasComplementarias || statusAreas === "done" || areasComp.length > 0;
  const campoTematicoDone = !isSecundaria || statusCampoTematico === "done";
  const allDoneSingle = isPrimaria
    ? areasDone && enfoquesDone
    : enfoquesDone && campoTematicoDone;
  const allBatchStep3Complete = unidadBatch.length <= 1 || unidadBatch.every((u) => batchStep3DoneIds.includes(u.id));
  const canContinue = unidadBatch.length > 1 ? allBatchStep3Complete : allDoneSingle;
  const isBatchGenerating = batchProgress !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* ── Header ── */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-cyan-600 text-xs font-bold">
              3
            </div>
            <span className="text-sm font-semibold tracking-wide">PASO 3 DE 4</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Enfoques y Complementos
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Áreas complementarias y enfoques transversales para enriquecer la unidad
          </p>
        </div>

        {/* ── Progreso batch ── */}
        {batchProgress && (
          <div className="mb-6 p-4 rounded-xl bg-violet-100 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 text-center">
            <p className="text-violet-800 dark:text-violet-200 font-medium">
              Generando {batchProgress.gradoNombre} ({batchProgress.current}/{batchProgress.total})...
            </p>
          </div>
        )}

        {/* ── Botón generar (un grado o todos) ── */}
        {(!allDoneSingle || (unidadBatch.length > 1 && !allBatchStep3Complete)) && (
          <div className="text-center mb-10">
            <Button
              onClick={generarTodoBatch}
              disabled={isGenerating || isBatchGenerating}
              className="h-16 px-10 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {(isGenerating || isBatchGenerating) ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  {batchProgress ? `Generando ${batchProgress.gradoNombre} (${batchProgress.current}/${batchProgress.total})...` : `Generando ${generandoPaso}...`}
                </>
              ) : (
                <>
                  <Wand2 className="mr-3 h-6 w-6" />
                  Generar con Inteligencia Artificial
                  {unidadBatch.length > 1 ? ` (${unidadBatch.length} grados)` : ""}
                </>
              )}
            </Button>
          </div>
        )}

        {/* ═══════════════════════════════
            Campo Temático (solo Secundaria)
            ═══════════════════════════════ */}
        {isSecundaria && (
          <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="h-10 w-10 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                Campo Temático
                {statusCampoTematico === "done" && <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />}
              </CardTitle>
              {statusCampoTematico === "done" && (
                <Button
                  onClick={regenerarCampoTematicoHandler}
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
              {statusCampoTematico === "idle" && (
                <Placeholder label="Se generará automáticamente (solo Secundaria)" />
              )}
              {statusCampoTematico === "generating" && (
                <GeneratingSpinner label="Campo Temático" />
              )}
              {statusCampoTematico === "error" && (
                <ErrorState onRetry={regenerarCampoTematicoHandler} />
              )}
              {statusCampoTematico === "done" && camposTematicos.length > 0 && (
                <div className="space-y-3">
                  {camposTematicos.map((ct, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-sm font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full font-medium">
                              {ct.area}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-slate-800 dark:text-white">
                            {ct.nombre}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {parseMarkdown(ct.descripcion)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ═══════════════════════════════
            Áreas Complementarias (Tutoría / Plan Lector — solo si se marcaron en el horario)
            ═══════════════════════════════ */}
        {incluyeAreasComplementarias && (
          <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="h-10 w-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Layers className="h-6 w-6 text-white" />
                </div>
                Áreas Complementarias
                {statusAreas === "done" && <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />}
              </CardTitle>
              {statusAreas === "done" && (
                <Button
                  onClick={() => regenerar("areas-complementarias")}
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
              {statusAreas === "idle" && (
                <Placeholder label="Pendiente de generación" />
              )}
              {statusAreas === "generating" && (
                <GeneratingSpinner label="Áreas Complementarias" />
              )}
              {statusAreas === "error" && (
                <ErrorState onRetry={() => regenerar("areas-complementarias")} />
              )}
              {statusAreas === "done" && areasComp.length > 0 && (
                <div className="space-y-4">
                  {!isPrimaria && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-slate-500 hover:text-red-600 gap-1.5"
                        onClick={removeAllAreasComp}
                      >
                        <Trash2 className="h-4 w-4" />
                        No usar áreas complementarias
                      </Button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {areasComp.map((ac, i) => (
                    <div
                      key={i}
                      className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-all hover:shadow-lg"
                    >
                      <div className={`h-2 bg-gradient-to-r ${AREA_COLORS[i % AREA_COLORS.length]}`} />
                      <div className="p-4">
                        <h4 className="font-bold text-base mb-1">{ac.area}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {ac.competenciaRelacionada}
                        </p>
                        <span className="inline-block text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-2">
                          {ac.dimension}
                        </span>
                        {ac.actividades?.length > 0 && (
                          <ul className="list-disc list-inside text-xs text-slate-500 space-y-0.5">
                            {ac.actividades.map((act, j) => (
                              <li key={j}>{parseMarkdown(act)}</li>
                            ))}
                          </ul>
                        )}
                        <button
                          onClick={() => removeAreaComp(i)}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ═══════════════════════════════
            Enfoques Transversales
            ═══════════════════════════════ */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
                <Compass className="h-6 w-6 text-white" />
              </div>
              Enfoques Transversales
              {statusEnfoques === "done" && <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />}
            </CardTitle>
            {statusEnfoques === "done" && (
              <Button
                onClick={() => regenerar("enfoques")}
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
            {statusEnfoques === "idle" && <Placeholder label="Pendiente de generación" />}
            {statusEnfoques === "generating" && <GeneratingSpinner label="Enfoques Transversales" />}
            {statusEnfoques === "error" && <ErrorState onRetry={() => regenerar("enfoques")} />}
            {statusEnfoques === "done" && enfoques.length > 0 && (
              <div className="space-y-3">
                {enfoques.map((enf, i) => (
                  <div
                    key={i}
                    className={`relative group rounded-lg border-l-4 p-4 ${ENFOQUE_COLORS[i % ENFOQUE_COLORS.length]} transition-all hover:shadow-md`}
                  >
                    <h4 className="font-bold text-base">{enf.enfoque}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      <span className="font-medium">Valor:</span> {parseMarkdown(enf.valor)}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-medium">Actitudes:</span> {parseMarkdown(enf.actitudes)}
                    </p>
                    <button
                      onClick={() => removeEnfoque(i)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Navegación ── */}
        <div className="flex justify-between pb-10">
          <Button onClick={() => setPagina(pagina - 1)} variant="outline" className="h-14 px-8 text-lg">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Anterior
          </Button>
          <Button
            onClick={handleContinuar}
            disabled={!canContinue}
            className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function Placeholder({ label }: { label: string }) {
  return (
    <div className="text-center py-8 text-slate-400">
      <Wand2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function GeneratingSpinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-10 gap-3">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-cyan-500 animate-spin" />
        <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-cyan-500 animate-pulse" />
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
        Generando {label}...
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-red-500 mb-2">Error al generar. Intenta de nuevo.</p>
      <Button onClick={onRetry} variant="destructive" size="sm">
        <RefreshCw className="h-4 w-4 mr-1.5" />
        Reintentar
      </Button>
    </div>
  );
}

export default Step3EnfoquesComplementos;
