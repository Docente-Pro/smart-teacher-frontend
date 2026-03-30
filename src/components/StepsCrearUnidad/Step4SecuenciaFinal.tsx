import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownTextarea } from "@/components/ui/markdown-textarea";
import { parseMarkdown } from "@/utils/parseMarkdown";
import {
  Sparkles,
  ArrowLeft,
  RefreshCw,
  CalendarDays,
  Package,
  HelpCircle,
  Loader2,
  Wand2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Download,
  Clock,
  Users,
  BookOpen,
  AlertTriangle,
  Edit3,
  GripVertical,
} from "lucide-react";
import { useUnidadStore } from "@/store/unidad.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { calcularDistribucion } from "@/services/unidad.service";
import { getAreaColor, getAreaIcon } from "@/constants/areaColors";
import {
  generarSecuencia,
  generarMateriales,
  generarReflexiones,
  regenerarPasoUnidad,
  regenerarSecuencia,
} from "@/services/ia-unidad.service";
import { HorarioPanel } from "./HorarioPanel";
import { SortableSlotsList } from "./SortableSlotsList";
import { useHorario } from "@/hooks/useHorario";
import type { IUsuario } from "@/interfaces/IUsuario";
import type { IDistribucionMiembro } from "@/interfaces/IUnidad";
import type {
  ISecuencia,
  ISecuenciaResponse,
  ISecuenciaPorGradoItem,
  IMaterialesResponse,
  IReflexionPregunta,
  IReflexionesResponse,
  IActividadExcluida,
  IDiaSecuencia,
  ITurnoDiaSecuencia,
  IHoraActividad,
} from "@/interfaces/IUnidadIA";
import { dateOnlyToInputValue } from "@/utils/dateOnlyPeru";

/** Bloque de horas consecutivas con la misma área (se muestran en un solo recuadro) */
interface IBloqueHora {
  area: string;
  actividad: string;
  hours: IHoraActividad[];
  startIndex: number;
}


/** Agrupa horas consecutivas con la misma área en un solo bloque (un recuadro por bloque). */
function groupConsecutiveByArea(horas: IHoraActividad[]): IBloqueHora[] {
  if (!horas.length) return [];
  const blocks: IBloqueHora[] = [];
  let start = 0;
  let currentArea = horas[0].area ?? "";
  for (let i = 1; i <= horas.length; i++) {
    const h = horas[i];
    const area = h?.area ?? "";
    if (i === horas.length || area !== currentArea) {
      const slice = horas.slice(start, i);
      blocks.push({
        area: currentArea,
        actividad: slice[0]?.actividad ?? "",
        hours: slice,
        startIndex: start,
      });
      if (i < horas.length) {
        start = i;
        currentArea = area;
      }
    }
  }
  return blocks;
}

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuario: IUsuario;
}

type GenerationStatus = "idle" | "generating" | "done" | "error";

const SEMANA_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-indigo-500 to-violet-500",
  "from-rose-500 to-red-500",
];

/** Textarea que crece en altura con el contenido para mostrar todo el texto sin scroll */
function AutoResizeTextarea({
  value,
  onChange,
  className,
  placeholder,
  onClick,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(60, el.scrollHeight)}px`;
  }, []);
  useEffect(resize, [value]);
  return (
    <Textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        resize();
      }}
      className={className}
      placeholder={placeholder}
      onClick={onClick}
      rows={2}
      style={{ overflow: "hidden", resize: "none" }}
      {...props}
    />
  );
}

function Step4SecuenciaFinal({ pagina, setPagina }: Props) {
  const navigate = useNavigate();
  const { unidadId, datosBase, contenido, updateContenido, generandoPaso, setGenerandoPaso, markCompleted,
    horario: horarioStore, setHorario: setHorarioStore } =
    useUnidadStore();

  // ── Hook de horario (inicializa desde el store si hay uno guardado) ──
  const {
    horario, scanning, confianza, notas, error: horarioError,
    escanearDesdeArchivo, actualizarSlot, limpiarHorario, setHorario,
  } = useHorario(horarioStore);

  // Sincronizar cambios del hook al store (persistencia)
  useEffect(() => {
    setHorarioStore(horario);
  }, [horario]);

  const isSecundariaWizard = Boolean((datosBase as any)?.esSecundariaWizard);
  const isCompartida = datosBase?.tipo === "COMPARTIDA";
  const cantidadSuscriptores = isCompartida ? Math.max((datosBase?.maxMiembros ?? 2) - 1, 1) : 0;
  const planificacionAreas = (datosBase?.planificacionAreas ?? []) as Array<{
    area: string;
    totalSemanas: number;
    totalSesionesUnidad: number;
    sesionesPorSemana: number[];
  }>;

  const [statusSecuencia, setStatusSecuencia] = useState<GenerationStatus>(
    contenido.secuencia ? "done" : "idle"
  );
  const [statusMateriales, setStatusMateriales] = useState<GenerationStatus>(
    contenido.materiales?.length ? "done" : "idle"
  );
  const [statusReflexiones, setStatusReflexiones] = useState<GenerationStatus>(
    contenido.reflexiones?.length ? "done" : "idle"
  );

  const [secuencia, setSecuencia] = useState<ISecuencia | null>(contenido.secuencia || null);
  const [secuenciaPorGrado, setSecuenciaPorGrado] = useState<ISecuenciaPorGradoItem[]>(
    (contenido as any).secuenciaPorGrado || []
  );
  const [materiales, setMateriales] = useState<string[]>(contenido.materiales || []);
  const [reflexiones, setReflexiones] = useState<IReflexionPregunta[]>(
    contenido.reflexiones || []
  );

  // ─── Sincronizar estado local con store (cuando se rehidrata de localStorage) ───
  useEffect(() => {
    if (contenido.secuencia && !secuencia) {
      setSecuencia(contenido.secuencia);
      setStatusSecuencia("done");
    }
    if (Array.isArray((contenido as any).secuenciaPorGrado) && (contenido as any).secuenciaPorGrado.length > 0 && secuenciaPorGrado.length === 0) {
      setSecuenciaPorGrado((contenido as any).secuenciaPorGrado as ISecuenciaPorGradoItem[]);
      setStatusSecuencia("done");
    }
    if (contenido.materiales?.length && materiales.length === 0) {
      setMateriales(contenido.materiales);
      setStatusMateriales("done");
    }
    if (contenido.reflexiones?.length && reflexiones.length === 0) {
      setReflexiones(contenido.reflexiones);
      setStatusReflexiones("done");
    }
  }, [contenido.secuencia, (contenido as any).secuenciaPorGrado, contenido.materiales, contenido.reflexiones, secuencia, secuenciaPorGrado.length, materiales.length, reflexiones.length]);

  // Semanas expandidas
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({});

  // ─── Distribución de áreas (solo COMPARTIDA) ───
  const [distribucion, setDistribucion] = useState<IDistribucionMiembro[] | null>(null);
  const [statusDistribucion, setStatusDistribucion] = useState<GenerationStatus>("idle");

  const isGenerating = generandoPaso !== null;

  const inferGradosSecundariaIds = useCallback((baseContenido: any): number[] => {
    const fromDatosBase = Array.isArray((datosBase as any)?.gradosSecundariaIds)
      ? ((datosBase as any).gradosSecundariaIds as number[])
      : [];
    if (fromDatosBase.length > 0) {
      return Array.from(new Set(fromDatosBase)).filter((id) => Number.isFinite(id));
    }
    const fromPropositos = Array.isArray(baseContenido?.propositosPorGrado)
      ? (baseContenido.propositosPorGrado as Array<any>)
          .map((pg) => Number(pg?.gradoId))
          .filter((id) => Number.isFinite(id))
      : [];
    return Array.from(new Set(fromPropositos));
  }, [datosBase]);

  // En secundaria no usamos horario escolar para la secuencia.
  useEffect(() => {
    if (!isSecundariaWizard) return;
    if (horarioStore) {
      setHorario(null);
      setHorarioStore(null);
    }
  }, [isSecundariaWizard, horarioStore]);

  /* ═══════════════════════════════════════════
     Generar TODO (pasos 6→7→8)
     ═══════════════════════════════════════════ */
  const generarTodo = useCallback(async () => {
    if (!unidadId) return handleToaster("Error: unidad no creada", "error");

    let pasoEnCurso: "secuencia" | "materiales" | "reflexiones" | null = null;
    try {
      // 6. Secuencia (con horario opcional y contenidoEditado por si el docente editó pasos previos)
      pasoEnCurso = "secuencia";
      setStatusSecuencia("generating");
      setGenerandoPaso("Secuencia de Actividades");
      const contenidoParaSecBase = useUnidadStore.getState().contenido;
      const gradosSecIds = inferGradosSecundariaIds(contenidoParaSecBase);
      const mainPlan = ((datosBase as any)?.planificacionAreas ?? [])[0] as
        | {
            totalSesionesUnidad?: number;
            sesionesPorSemana?: number[];
          }
        | undefined;
      const contenidoParaSec = isSecundariaWizard
        ? {
            ...contenidoParaSecBase,
            gradosSecundaria: gradosSecIds,
            modoSecundaria: (datosBase as any)?.modoSecundaria,
            planificacionAreas: (datosBase as any)?.planificacionAreas ?? [],
            duracion: (datosBase as any)?.duracion ?? 0,
            // Prioridad backend #1: enviar total explícito si el front ya lo conoce.
            totalSesionesUnidad: Number(mainPlan?.totalSesionesUnidad ?? 0) || undefined,
            sesionesPorSemana: Array.isArray(mainPlan?.sesionesPorSemana)
              ? mainPlan?.sesionesPorSemana
              : undefined,
          }
        : contenidoParaSecBase;
      const horarioActual = isSecundariaWizard ? undefined : useUnidadStore.getState().horario;
      const resSec = await generarSecuencia(unidadId, horarioActual, contenidoParaSec as Record<string, unknown>);
      const secRaw = resSec.data as unknown;
      let secData: ISecuencia;
      let secByGrade: ISecuenciaPorGradoItem[] = [];
      if (isSecundariaWizard && Array.isArray(secRaw)) {
        secByGrade = secRaw as ISecuenciaPorGradoItem[];
        const first = secByGrade[0]?.secuencia;
        secData = {
          ...(first || { hiloConductor: "", semanas: [] }),
          hiloConductor: first?.hiloConductor ?? "",
          semanas: first?.semanas ?? [],
          semanasPorSesiones: first?.semanasPorSesiones ?? [],
        };
      } else {
        const secResp = secRaw as ISecuenciaResponse;
        secData = {
          ...secResp,
          hiloConductor: secResp.hiloConductor ?? "",
          semanas: secResp.semanas ?? [],
        };
      }
      setSecuencia(secData);
      setSecuenciaPorGrado(isSecundariaWizard ? secByGrade : []);
      updateContenido({
        secuencia: secData,
        ...(isSecundariaWizard ? { secuenciaPorGrado: secByGrade } : {}),
      });
      setStatusSecuencia("done");
      // Expandir primera semana
      setExpandedWeeks({ 0: true });

      // 7. Materiales (contenidoEditado por si el docente editó)
      pasoEnCurso = "materiales";
      setStatusMateriales("generating");
      setGenerandoPaso("Materiales y Recursos");
      const contenidoParaMat = useUnidadStore.getState().contenido;
      const resMat = await generarMateriales(unidadId, contenidoParaMat as Record<string, unknown>);
      const matData = (resMat.data as IMaterialesResponse).materiales;
      setMateriales(matData);
      updateContenido({ materiales: matData });
      setStatusMateriales("done");

      // 8. Reflexiones (contenidoEditado por si el docente editó)
      pasoEnCurso = "reflexiones";
      setStatusReflexiones("generating");
      setGenerandoPaso("Reflexiones");
      const contenidoParaRef = useUnidadStore.getState().contenido;
      const resRef = await generarReflexiones(unidadId, contenidoParaRef as Record<string, unknown>);
      const refData = (resRef.data as IReflexionesResponse).reflexiones;
      setReflexiones(refData);
      updateContenido({ reflexiones: refData });
      setStatusReflexiones("done");

      setGenerandoPaso(null);
      handleToaster("¡Secuencia completa generada con éxito!", "success");

      // Para unidades COMPARTIDA: calcular distribución automáticamente
      if (isCompartida && unidadId) {
        try {
          setStatusDistribucion("generating");
          setGenerandoPaso("Distribución de Áreas");
          const distRes = await calcularDistribucion(unidadId, {
            secuencia: secData,
            cantidadSuscriptores,
          });
          const items = distRes?.data?.distribucion ?? [];
          setDistribucion(items);
          setStatusDistribucion("done");
          handleToaster("Distribución de áreas calculada", "success");
        } catch (distErr: any) {
          console.error("Error al calcular distribución:", distErr);
          setStatusDistribucion("error");
          handleToaster(
            distErr?.response?.data?.message || "Error al calcular distribución de áreas",
            "error"
          );
        } finally {
          setGenerandoPaso(null);
        }
      }
    } catch (error: any) {
      console.error("Error al generar:", error);
      setGenerandoPaso(null);
      if (pasoEnCurso === "secuencia") setStatusSecuencia("error");
      if (pasoEnCurso === "materiales") setStatusMateriales("error");
      if (pasoEnCurso === "reflexiones") setStatusReflexiones("error");
      handleToaster(
        error?.response?.data?.message || "Error al generar con IA",
        "error"
      );
    }
  }, [unidadId, isSecundariaWizard, datosBase, inferGradosSecundariaIds]);

  /* ─── Regenerar individual ─── */
  async function regenerar(paso: "secuencia" | "materiales" | "reflexiones") {
    if (!unidadId) return;

    const labels: Record<string, string> = {
      secuencia: "Secuencia de Actividades",
      materiales: "Materiales y Recursos",
      reflexiones: "Reflexiones",
    };
    const setStatus =
      paso === "secuencia"
        ? setStatusSecuencia
        : paso === "materiales"
          ? setStatusMateriales
          : setStatusReflexiones;

    setStatus("generating");
    setGenerandoPaso(labels[paso]);

    try {
      if (paso === "secuencia") {
        const horarioActual = isSecundariaWizard ? undefined : useUnidadStore.getState().horario;
        const contenidoActualBase = useUnidadStore.getState().contenido;
        const gradosSecIds = inferGradosSecundariaIds(contenidoActualBase);
        const mainPlan = ((datosBase as any)?.planificacionAreas ?? [])[0] as
          | {
              totalSesionesUnidad?: number;
              sesionesPorSemana?: number[];
            }
          | undefined;
        const contenidoActual = isSecundariaWizard
          ? {
              ...contenidoActualBase,
              gradosSecundaria: gradosSecIds,
              modoSecundaria: (datosBase as any)?.modoSecundaria,
              planificacionAreas: (datosBase as any)?.planificacionAreas ?? [],
              duracion: (datosBase as any)?.duracion ?? 0,
              totalSesionesUnidad: Number(mainPlan?.totalSesionesUnidad ?? 0) || undefined,
              sesionesPorSemana: Array.isArray(mainPlan?.sesionesPorSemana)
                ? mainPlan?.sesionesPorSemana
                : undefined,
            }
          : contenidoActualBase;
        const res = await regenerarSecuencia(unidadId, horarioActual, contenidoActual as Record<string, unknown>);
        const raw = res.data as unknown;
        if (isSecundariaWizard && Array.isArray(raw)) {
          const lista = raw as ISecuenciaPorGradoItem[];
          const first = lista[0]?.secuencia;
          const d: ISecuencia = {
            ...(first || { hiloConductor: "", semanas: [] }),
            hiloConductor: first?.hiloConductor ?? "",
            semanas: first?.semanas ?? [],
            semanasPorSesiones: first?.semanasPorSesiones ?? [],
          };
          setSecuencia(d);
          setSecuenciaPorGrado(lista);
          updateContenido({ secuencia: d, secuenciaPorGrado: lista });
        } else {
          const d = raw as ISecuenciaResponse;
          setSecuencia(d);
          setSecuenciaPorGrado([]);
          updateContenido({ secuencia: d });
        }

        // En secundaria, al regenerar secuencia también regeneramos materiales y reflexiones
        // para mantener el flujo equivalente al "generar completo".
        if (isSecundariaWizard) {
          try {
            setStatusMateriales("generating");
            setGenerandoPaso("Materiales y Recursos");
            const contenidoParaMat = useUnidadStore.getState().contenido;
            const resMat = await generarMateriales(
              unidadId,
              contenidoParaMat as Record<string, unknown>
            );
            const matData = (resMat.data as IMaterialesResponse).materiales;
            setMateriales(matData);
            updateContenido({ materiales: matData });
            setStatusMateriales("done");
          } catch (matErr) {
            setStatusMateriales("error");
          }

          try {
            setStatusReflexiones("generating");
            setGenerandoPaso("Reflexiones");
            const contenidoParaRef = useUnidadStore.getState().contenido;
            const resRef = await generarReflexiones(
              unidadId,
              contenidoParaRef as Record<string, unknown>
            );
            const refData = (resRef.data as IReflexionesResponse).reflexiones;
            setReflexiones(refData);
            updateContenido({ reflexiones: refData });
            setStatusReflexiones("done");
          } catch (refErr) {
            setStatusReflexiones("error");
          }
        }
      } else {
        const res = await regenerarPasoUnidad(unidadId, paso);
        if (paso === "materiales") {
          const d = (res.data as unknown as IMaterialesResponse).materiales;
          setMateriales(d);
          updateContenido({ materiales: d });
        } else {
          const d = (res.data as unknown as IReflexionesResponse).reflexiones;
          setReflexiones(d);
          updateContenido({ reflexiones: d });
        }
      }

      setStatus("done");
      setGenerandoPaso(null);
      handleToaster(
        paso === "secuencia" && isSecundariaWizard
          ? "Secuencia, materiales y reflexiones regenerados"
          : `${labels[paso]} regenerado`,
        "success"
      );
    } catch (error: any) {
      setStatus("error");
      setGenerandoPaso(null);
      handleToaster(error?.response?.data?.message || `Error al regenerar`, "error");
    }
  }

  /* ─── Helpers de edición ─── */
  function removeMaterial(index: number) {
    const updated = materiales.filter((_, i) => i !== index);
    setMateriales(updated);
    updateContenido({ materiales: updated });
  }

  function removeReflexion(index: number) {
    const updated = reflexiones.filter((_, i) => i !== index);
    setReflexiones(updated);
    updateContenido({ reflexiones: updated });
  }

  function toggleWeek(idx: number) {
    setExpandedWeeks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  const tieneExcluidas = (secuencia?.actividadesExcluidas?.length ?? 0) > 0;
  const resumenFeriados = secuencia?.reprogramacionFeriados;
  const mostrarBannerFeriados = resumenFeriados?.aplicado === true;

  const semanasGeneradas = secuencia?.semanas?.length ?? 0;
  const duracionPedida = datosBase?.duracion ?? 0;
  const haySemanasExtra = semanasGeneradas > duracionPedida && duracionPedida > 0;
  const expectedTotalSecundaria = planificacionAreas.reduce(
    (acc, p) => acc + (Number(p.totalSesionesUnidad) || 0),
    0
  );

  function recortarSemanasExtra() {
    if (!secuencia || !haySemanasExtra) return;
    const updated: ISecuencia = {
      ...secuencia,
      semanas: secuencia.semanas.slice(0, duracionPedida),
    };
    setSecuencia(updated);
    updateContenido({ secuencia: updated });
  }

  /** Actualiza la secuencia al editar un turno, una hora o la fecha del día; persiste en el store.
   * Usa actualizador funcional para que al arrastrar entre días (dos actualizaciones seguidas)
   * la segunda vea el estado ya actualizado por la primera. */
  function actualizarDiaSecuencia(
    semanaIdx: number,
    diaIdx: number,
    update: Partial<{
      turnoManana: ITurnoDiaSecuencia;
      turnoTarde: ITurnoDiaSecuencia;
      horas: IDiaSecuencia["horas"];
      fecha: string;
    }>
  ) {
    setSecuencia((prev) => {
      if (!prev) return prev;
      const updated: ISecuencia = {
        ...prev,
        semanas: prev.semanas.map((sem, sI) =>
          sI !== semanaIdx
            ? sem
            : {
                ...sem,
                dias: sem.dias.map((d, dI) =>
                  dI !== diaIdx ? d : { ...d, ...update }
                ),
              }
        ),
      };
      updateContenido({ secuencia: updated });
      return updated;
    });
  }

  /* ─── Recalcular distribución de áreas ─── */
  async function recalcularDistribucion() {
    if (!unidadId || !secuencia) return;
    setStatusDistribucion("generating");
    setGenerandoPaso("Distribución de Áreas");
    try {
      const distRes = await calcularDistribucion(unidadId, {
        secuencia,
        cantidadSuscriptores,
      });
      const items = distRes?.data?.distribucion ?? [];
      setDistribucion(items);
      setStatusDistribucion("done");
      setGenerandoPaso(null);
      handleToaster("Distribución recalculada", "success");
    } catch (err: any) {
      setStatusDistribucion("error");
      setGenerandoPaso(null);
      handleToaster(err?.response?.data?.message || "Error al recalcular", "error");
    }
  }

  /* ─── Finalizar → ir a la vista previa del PDF ─── */
  function handleFinalizar() {
    // Marcar la unidad como completada para que no aparezca el diálogo de recuperación
    markCompleted();
    handleToaster("¡Unidad de aprendizaje completada! Generando documento...", "success");
    navigate("/unidad-result");
  }

  const allDone =
    statusSecuencia === "done" &&
    statusMateriales === "done" &&
    statusReflexiones === "done" &&
    (!isCompartida || statusDistribucion === "done");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-6">
      <div className="max-w-[90rem] mx-auto w-full px-1">
        {/* ── Header ── */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-indigo-600 text-xs font-bold">
              4
            </div>
            <span className="text-sm font-semibold tracking-wide">PASO 4 DE 4</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Secuencia de Sesiones
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Calendario semanal de actividades, materiales necesarios y preguntas de reflexión
          </p>
        </div>

        {/* ── Panel Horario Escolar (antes del botón generar) ── */}
        {!isSecundariaWizard && (
          <HorarioPanel
            horario={horario}
            scanning={scanning}
            confianza={confianza}
            notas={notas}
            error={horarioError}
            onScan={escanearDesdeArchivo}
            onSlotChange={actualizarSlot}
            onClear={limpiarHorario}
            disabled={isGenerating}
          />
        )}

        {/* ── Botón generar ── */}
        {!allDone && (
          <div className="text-center mb-10">
            <Button
              onClick={generarTodo}
              disabled={isGenerating}
              className="h-16 px-10 text-lg font-bold bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Generando {generandoPaso}...
                </>
              ) : (
                <>
                  <Wand2 className="mr-3 h-6 w-6" />
                  Generar Secuencia Completa
                </>
              )}
            </Button>

            {isGenerating && (
              <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
                <ProgressDot label="Secuencia" status={statusSecuencia} />
                <span className="text-slate-300">→</span>
                <ProgressDot label="Materiales" status={statusMateriales} />
                <span className="text-slate-300">→</span>
                <ProgressDot label="Reflexiones" status={statusReflexiones} />
                {isCompartida && (
                  <>
                    <span className="text-slate-300">→</span>
                    <ProgressDot label="Distribución" status={statusDistribucion} />
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════
            Secuencia de Actividades
            ═══════════════════════════════ */}
        <SectionCard
          icon={<CalendarDays className="h-6 w-6 text-white" />}
          title="Secuencia de Actividades"
          gradient="from-indigo-600 to-violet-600"
          status={statusSecuencia}
          onRegenerate={() => regenerar("secuencia")}
          isGenerating={isGenerating}
        >
          {statusSecuencia === "done" && secuencia && (
            <div className="space-y-4">
              {isSecundariaWizard ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/40 p-4">
                    <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                      En secundaria la secuencia se organiza por semanas y por grado (`semanasPorSesiones`).
                    </p>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                      No se requiere cargar horario en este paso.
                    </p>
                  </div>

                  {secuenciaPorGrado.length > 0 ? (
                    <div className="space-y-4">
                      {secuenciaPorGrado.map((item, idx) => {
                        const semanas = item.secuencia?.semanasPorSesiones ?? [];
                        const totalGenerado = semanas.reduce(
                          (acc, s) => acc + (s.sesiones?.length ?? 0),
                          0
                        );
                        const mismatch =
                          expectedTotalSecundaria > 0 && totalGenerado !== expectedTotalSecundaria;
                        return (
                          <div
                            key={`${item.gradoId}-${idx}`}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900/30"
                          >
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{item.grado}</p>
                              <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                                Total generado: {totalGenerado} sesiones
                              </span>
                            </div>

                            {mismatch && (
                              <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                                El total generado no coincide con lo planificado en Paso 1
                                ({expectedTotalSecundaria} sesiones esperadas).
                              </div>
                            )}

                            <div className="space-y-3">
                              {semanas.map((s) => (
                                <div
                                  key={`${item.gradoId}-w${s.semana}`}
                                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/30 p-3"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                      Semana {s.semana}
                                    </p>
                                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                      {s.sesiones?.length ?? 0} sesiones
                                    </span>
                                  </div>
                                  <ul className="space-y-2">
                                    {(s.sesiones ?? []).map((sesion) => (
                                      <li
                                        key={`${item.gradoId}-w${s.semana}-i${sesion.indiceSesion}`}
                                        className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2"
                                      >
                                        <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                                          Sesión {sesion.indiceSesion} - {sesion.area}
                                        </p>
                                        <p className="text-xs text-slate-700 dark:text-slate-200 mt-0.5">
                                          {parseMarkdown(sesion.actividad)}
                                        </p>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-md border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-600 dark:text-slate-300">
                        Aún no hay `secuenciaPorGrado` en la respuesta; mostrando distribución planificada.
                      </div>
                      {planificacionAreas.map((plan, idx) => (
                        <div
                          key={`${plan.area}-${idx}`}
                          className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900/30"
                        >
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{plan.area}</p>
                            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                              Total: {plan.totalSesionesUnidad} sesiones
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {(plan.sesionesPorSemana ?? []).map((n, i) => (
                              <span
                                key={`${plan.area}-w${i}`}
                                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              >
                                Semana {i + 1}: {n}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
              {/* Hilo conductor — altura limitada con scroll para ver todo el texto */}
              <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-4 border border-indigo-100 dark:border-indigo-900">
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                  Hilo Conductor
                </p>
                <div className="max-h-[260px] overflow-y-auto pr-1 -mr-1">
                  <MarkdownTextarea
                    value={secuencia.hiloConductor}
                    onChange={(v) => {
                      const updated = { ...secuencia, hiloConductor: v };
                      setSecuencia(updated);
                      updateContenido({ secuencia: updated });
                    }}
                    rows={6}
                    className="border-indigo-200 dark:border-indigo-800"
                    viewClassName="border-indigo-200 dark:border-indigo-800 min-h-[100px]"
                  />
                </div>
              </div>

              {/* Aviso actividades excluidas */}
              {tieneExcluidas && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 p-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                      Se excluyeron {secuencia.actividadesExcluidas!.length} actividades para mantener máximo 3 áreas por día:
                    </p>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                      {(secuencia.actividadesExcluidas as IActividadExcluida[]).map((a, i) => (
                        <li key={i}>
                          <strong>{a.area}</strong>: &quot;{a.actividad}&quot; (Semana {a.semana}, {a.dia})
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      Puedes editar la secuencia abajo para incluir estas actividades en el día que prefieras.
                    </p>
                  </div>
                </div>
              )}

              {/* Aviso reprogramación por feriados nacionales */}
              {mostrarBannerFeriados && (
                <div className="rounded-lg border border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950/40 p-4 flex gap-3">
                  <CalendarDays className="h-5 w-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-cyan-800 dark:text-cyan-200">
                      Se reprogramaron {resumenFeriados.diasLectivosReprogramados} días por feriados nacionales.
                    </p>
                  </div>
                </div>
              )}

              {/* Aviso semanas extra generadas por feriados */}
              {haySemanasExtra && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Se generaron {semanasGeneradas} semanas (pediste {duracionPedida}).
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      La semana extra contiene sesiones de recuperación por feriados. Puedes mantenerla o descartarla.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-amber-400 text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-600 dark:hover:bg-amber-950/60 text-xs"
                    onClick={recortarSemanasExtra}
                  >
                    Recortar a {duracionPedida} semanas
                  </Button>
                </div>
              )}

              {/* Semanas */}
              {secuencia.semanas?.map((semana, sIdx) => (
                <div
                  key={sIdx}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Cabecera de semana */}
                  <button
                    onClick={() => toggleWeek(sIdx)}
                    className={`w-full flex items-center justify-between p-4 bg-gradient-to-r ${
                      SEMANA_COLORS[sIdx % SEMANA_COLORS.length]
                    } text-white`}
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5" />
                      <span className="font-bold text-lg">Semana {semana.semana}</span>
                      <span className="text-white/80 text-sm">
                        ({semana.dias?.length || 0} días)
                      </span>
                    </div>
                    {expandedWeeks[sIdx] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>

                  {/* Días — altura igual para las 5: la columna con más contenido rige el alto de la fila */}
                  {expandedWeeks[sIdx] && (
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-stretch">
                      {semana.dias?.map((dia, dIdx) => (
                        <div
                          key={dIdx}
                          className="h-full min-h-0 rounded-xl border border-slate-200/70 dark:border-slate-700/50 overflow-hidden shadow-sm transition-all duration-200 flex flex-col bg-white dark:bg-slate-900/30"
                        >
                          {/* Cabecera del día (como en premium): día + fecha editable */}
                          <div className="px-3 py-2.5 text-center border-b bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-800/40 border-slate-200/50 dark:border-slate-700/40">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                              {dia.dia}
                            </p>
                            <div className="flex flex-col items-center gap-1.5 mt-1">
                              <Input
                                type="date"
                                value={dateOnlyToInputValue(dia.fecha)}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  actualizarDiaSecuencia(sIdx, dIdx, { fecha: v || "" });
                                }}
                                className="h-7 text-[11px] py-0 px-1.5 border-slate-200 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-200"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="text-[10px] text-violet-600 dark:text-violet-400 flex items-center gap-0.5">
                                <Edit3 className="h-2.5 w-2.5" /> Arrastra para reordenar
                              </span>
                            </div>
                          </div>

                          {/* Bloques del día — flex-1 para ocupar el resto y alinear altura con la columna más alta */}
                          <div className="p-2.5 space-y-2 flex flex-col flex-1 min-h-0">
                            {(dia.turnoManana || dia.turnoTarde) ? (
                              <SortableSlotsList<ITurnoDiaSecuencia>
                                listKey={`s${sIdx}-d${dIdx}-turno`}
                                items={[dia.turnoManana, dia.turnoTarde].filter(Boolean) as ITurnoDiaSecuencia[]}
                                onReorder={(ordered) => {
                                  const [manana, tarde] = ordered;
                                  actualizarDiaSecuencia(sIdx, dIdx, {
                                    turnoManana: manana ?? dia.turnoManana,
                                    turnoTarde: tarde ?? dia.turnoTarde,
                                  });
                                }}
                                className="space-y-2"
                              >
                                {(turno, idx) => {
                                  const label = idx === 0 ? "Mañana" : "Tarde";
                                  const theme = getAreaColor(turno.area);
                                  const AreaIcon = getAreaIcon(turno.area);
                                  return (
                                    <div className={`flex items-start gap-2 rounded-lg border p-2.5 transition-all duration-300 flex-col flex-1 ${theme.bg} ${theme.border} shadow-sm ring-1 ring-violet-300/20 dark:ring-violet-500/10`}>
                                      <div className="flex items-start gap-2 w-full">
                                        <span className="secuencia-drag-handle cursor-grab active:cursor-grabbing touch-none p-0.5 -m-0.5 rounded shrink-0">
                                          <GripVertical className="h-4 w-4 text-slate-400 mt-0.5" />
                                        </span>
                                        <div className="p-1.5 rounded-md bg-white/60 dark:bg-slate-800/50">
                                          <AreaIcon className={`h-4 w-4 ${theme.text}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</p>
                                          <p className={`text-xs font-semibold ${theme.text}`}>{turno.area}</p>
                                        </div>
                                      </div>
                                      <AutoResizeTextarea
                                        value={turno.actividad}
                                        onChange={(e) => {
                                          const updated = { ...turno, actividad: e.target.value };
                                          if (idx === 0) actualizarDiaSecuencia(sIdx, dIdx, { turnoManana: updated });
                                          else actualizarDiaSecuencia(sIdx, dIdx, { turnoTarde: updated });
                                        }}
                                        className="text-sm border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/50 mt-3 min-h-[3.5rem]"
                                        placeholder="Actividad"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  );
                                }}
                              </SortableSlotsList>
                            ) : (() => {
                              const horas = dia.horas ?? [];
                              const blocks = groupConsecutiveByArea(horas);
                              return (
                                <SortableSlotsList<IBloqueHora>
                                  listKey={`s${sIdx}-d${dIdx}-horas`}
                                  items={blocks}
                                  onReorder={(orderedBlocks) => {
                                    const newHoras = orderedBlocks.flatMap((b) => b.hours);
                                    actualizarDiaSecuencia(sIdx, dIdx, { horas: newHoras });
                                  }}
                                  className="space-y-2"
                                >
                                  {(bloque, blockIdx) => {
                                    const theme = getAreaColor(bloque.area);
                                    const AreaIcon = getAreaIcon(bloque.area);
                                    const first = bloque.hours[0];
                                    const last = bloque.hours[bloque.hours.length - 1];
                                    const label =
                                      bloque.hours.length === 1
                                        ? `H${first?.hora ?? bloque.startIndex + 1}`
                                        : `H${first?.hora ?? bloque.startIndex + 1}–H${last?.hora ?? bloque.startIndex + bloque.hours.length}`;
                                    const timeRange =
                                      first?.inicio && last?.fin ? `${first.inicio}–${last.fin}` : null;
                                    return (
                                      <div className={`flex items-start gap-2.5 rounded-lg border p-2.5 transition-all duration-300 flex-col flex-1 ${theme.bg} ${theme.border} shadow-sm ring-1 ring-violet-300/20 dark:ring-violet-500/10`}>
                                        <div className="flex items-start gap-2 w-full">
                                          <span className="secuencia-drag-handle cursor-grab active:cursor-grabbing touch-none p-0.5 -m-0.5 rounded shrink-0">
                                            <GripVertical className="h-4 w-4 text-slate-400 mt-0.5" />
                                          </span>
                                          <div className="flex flex-col items-center shrink-0 w-11">
                                            <Clock className="h-3.5 w-3.5 text-slate-400 mb-0.5" />
                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                              {label}
                                            </span>
                                            {timeRange && (
                                              <span className="text-[9px] text-slate-400">{timeRange}</span>
                                            )}
                                          </div>
                                          <div className="p-1.5 rounded-md bg-white/60 dark:bg-slate-800/50 shrink-0">
                                            <AreaIcon className={`h-4 w-4 ${theme.text}`} />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-semibold ${theme.text}`}>{bloque.area}</p>
                                          </div>
                                        </div>
                                        <AutoResizeTextarea
                                          value={bloque.actividad}
                                          onChange={(e) => {
                                            const newActividad = e.target.value;
                                            const nuevasHoras = [...horas];
                                            for (let i = 0; i < bloque.hours.length; i++) {
                                              const idx = bloque.startIndex + i;
                                              if (idx < nuevasHoras.length) {
                                                nuevasHoras[idx] = { ...nuevasHoras[idx], actividad: newActividad };
                                              }
                                            }
                                            actualizarDiaSecuencia(sIdx, dIdx, { horas: nuevasHoras });
                                          }}
                                          className="text-sm border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/50 w-full mt-3 min-h-[3.5rem]"
                                          placeholder="Actividad"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                    );
                                  }}
                                </SortableSlotsList>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
                </>
              )}
            </div>
          )}
        </SectionCard>

        {/* ═══════════════════════════════
            Materiales y Recursos
            ═══════════════════════════════ */}
        <SectionCard
          icon={<Package className="h-6 w-6 text-white" />}
          title="Materiales y Recursos"
          gradient="from-amber-500 to-orange-500"
          status={statusMateriales}
          onRegenerate={() => regenerar("materiales")}
          isGenerating={isGenerating}
        >
          {statusMateriales === "done" && materiales.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {materiales.map((mat, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-4 py-3 border border-amber-100 dark:border-amber-900 transition-all hover:shadow-md"
                >
                  <Package className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-sm flex-1">{parseMarkdown(mat)}</span>
                  <button
                    onClick={() => removeMaterial(i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ═══════════════════════════════
            Reflexiones
            ═══════════════════════════════ */}
        <SectionCard
          icon={<HelpCircle className="h-6 w-6 text-white" />}
          title="Reflexiones sobre el Aprendizaje"
          gradient="from-rose-500 to-pink-500"
          status={statusReflexiones}
          onRegenerate={() => regenerar("reflexiones")}
          isGenerating={isGenerating}
        >
          {statusReflexiones === "done" && reflexiones.length > 0 && (
            <div className="space-y-3">
              {reflexiones.map((ref, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-3 bg-rose-50 dark:bg-rose-950/20 rounded-lg px-4 py-3 border border-rose-100 dark:border-rose-900 transition-all hover:shadow-md"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm flex-1 text-slate-700 dark:text-slate-300">{parseMarkdown(ref.pregunta)}</p>
                  <button
                    onClick={() => removeReflexion(i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ═══════════════════════════════
            Distribución de Áreas (solo COMPARTIDA)
            ═══════════════════════════════ */}
        {isCompartida && (
          <SectionCard
            icon={<Users className="h-6 w-6 text-white" />}
            title="Distribución de Áreas"
            gradient="from-teal-500 to-cyan-500"
            status={statusDistribucion}
            onRegenerate={recalcularDistribucion}
            isGenerating={isGenerating}
          >
            {statusDistribucion === "done" && distribucion && distribucion.length > 0 && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-700/50">
                  <p className="text-sm text-teal-700 dark:text-teal-300">
                    El sistema calculó la distribución óptima de áreas entre los miembros.
                    Tus áreas ya están confirmadas. Los suscriptores elegirán las suyas al unirse.
                  </p>
                </div>

                {distribucion.map((miembro, idx) => {
                  const isPropietario = miembro.rol === "PROPIETARIO";
                  const cardClasses = isPropietario
                    ? "rounded-xl border-2 p-4 border-violet-200 dark:border-violet-700/50 bg-violet-50/50 dark:bg-violet-500/5"
                    : "rounded-xl border-2 p-4 border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30";
                  const iconWrapClasses = isPropietario
                    ? "p-1.5 rounded-lg bg-violet-100 dark:bg-violet-500/20"
                    : "p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50";
                  return (
                    <div key={idx} className={cardClasses}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={iconWrapClasses}>
                          {isPropietario ? (
                            <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                          ) : (
                            <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-white">
                            {isPropietario ? "Tú (Propietario)" : `Suscriptor ${miembro.orden - 1}`}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {miembro.totalSesionesSemana} sesiones/semana
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {miembro.areas.map((area) => {
                          const theme = getAreaColor(area.nombre);
                          const Icon = getAreaIcon(area.nombre);
                          return (
                            <div
                              key={area.areaId}
                              className={`flex items-center gap-2.5 p-2.5 rounded-lg ${theme.bg} border ${theme.border}`}
                            >
                              <div className={`p-1.5 rounded-md ${theme.bg}`}>
                                <Icon className={`h-4 w-4 ${theme.text}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${theme.text}`}>
                                  {area.nombre}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {area.maxSesionesSemana} sesiones/semana
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        )}

        {/* ── Navegación final ── */}
        <div className="flex justify-between pb-10">
          <Button onClick={() => setPagina(pagina - 1)} variant="outline" className="h-14 px-8 text-lg">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Anterior
          </Button>

          <Button
            onClick={handleFinalizar}
            disabled={!allDone}
            className="h-14 px-10 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="mr-2 h-5 w-5" />
            Generar Documento
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Componentes auxiliares
   ═══════════════════════════════════════════ */

function SectionCard({
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
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 animate-spin" />
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-indigo-500 animate-pulse" />
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

function ProgressDot({ label, status }: { label: string; status: GenerationStatus }) {
  return (
    <div className="flex items-center gap-1.5">
      {status === "done" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
      {status === "generating" && <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />}
      {status === "idle" && (
        <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
      )}
      {status === "error" && <div className="w-4 h-4 rounded-full bg-red-500" />}
      <span
        className={`text-sm ${
          status === "generating"
            ? "font-semibold text-indigo-600"
            : status === "done"
              ? "text-green-600"
              : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default Step4SecuenciaFinal;
