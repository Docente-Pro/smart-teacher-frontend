import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  Sun,
  Moon,
} from "lucide-react";
import { useUnidadStore } from "@/store/unidad.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import {
  generarSecuencia,
  generarMateriales,
  generarReflexiones,
  regenerarPasoUnidad,
} from "@/services/ia-unidad.service";
import type { IUsuario } from "@/interfaces/IUsuario";
import type {
  ISecuencia,
  ISecuenciaResponse,
  IMaterialesResponse,
  IReflexionPregunta,
  IReflexionesResponse,
} from "@/interfaces/IUnidadIA";

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

function Step4SecuenciaFinal({ pagina, setPagina }: Props) {
  const navigate = useNavigate();
  const { unidadId, contenido, updateContenido, generandoPaso, setGenerandoPaso } =
    useUnidadStore();

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
  const [materiales, setMateriales] = useState<string[]>(contenido.materiales || []);
  const [reflexiones, setReflexiones] = useState<IReflexionPregunta[]>(
    contenido.reflexiones || []
  );

  // Semanas expandidas
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({});

  const isGenerating = generandoPaso !== null;

  /* ═══════════════════════════════════════════
     Generar TODO (pasos 6→7→8)
     ═══════════════════════════════════════════ */
  const generarTodo = useCallback(async () => {
    if (!unidadId) return handleToaster("Error: unidad no creada", "error");

    try {
      // 6. Secuencia
      setStatusSecuencia("generating");
      setGenerandoPaso("Secuencia de Actividades");
      const resSec = await generarSecuencia(unidadId);
      const secData = resSec.data as ISecuenciaResponse;
      setSecuencia(secData);
      updateContenido({ secuencia: secData });
      setStatusSecuencia("done");
      // Expandir primera semana
      setExpandedWeeks({ 0: true });

      // 7. Materiales
      setStatusMateriales("generating");
      setGenerandoPaso("Materiales y Recursos");
      const resMat = await generarMateriales(unidadId);
      const matData = (resMat.data as IMaterialesResponse).materiales;
      setMateriales(matData);
      updateContenido({ materiales: matData });
      setStatusMateriales("done");

      // 8. Reflexiones
      setStatusReflexiones("generating");
      setGenerandoPaso("Reflexiones");
      const resRef = await generarReflexiones(unidadId);
      const refData = (resRef.data as IReflexionesResponse).reflexiones;
      setReflexiones(refData);
      updateContenido({ reflexiones: refData });
      setStatusReflexiones("done");

      setGenerandoPaso(null);
      handleToaster("¡Secuencia completa generada con éxito!", "success");
    } catch (error: any) {
      console.error("Error al generar:", error);
      setGenerandoPaso(null);
      if (statusSecuencia === "generating") setStatusSecuencia("error");
      if (statusMateriales === "generating") setStatusMateriales("error");
      if (statusReflexiones === "generating") setStatusReflexiones("error");
      handleToaster(
        error?.response?.data?.message || "Error al generar con IA",
        "error"
      );
    }
  }, [unidadId]);

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
      const res = await regenerarPasoUnidad(unidadId, paso);

      if (paso === "secuencia") {
        const d = res.data as unknown as ISecuenciaResponse;
        setSecuencia(d);
        updateContenido({ secuencia: d });
      } else if (paso === "materiales") {
        const d = (res.data as unknown as IMaterialesResponse).materiales;
        setMateriales(d);
        updateContenido({ materiales: d });
      } else {
        const d = (res.data as unknown as IReflexionesResponse).reflexiones;
        setReflexiones(d);
        updateContenido({ reflexiones: d });
      }

      setStatus("done");
      setGenerandoPaso(null);
      handleToaster(`${labels[paso]} regenerado`, "success");
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

  /* ─── Finalizar → ir a la vista previa del PDF ─── */
  function handleFinalizar() {
    handleToaster("¡Unidad de aprendizaje completada! Generando documento...", "success");
    navigate("/unidad-result");
  }

  const allDone =
    statusSecuencia === "done" &&
    statusMateriales === "done" &&
    statusReflexiones === "done";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-indigo-600 text-xs font-bold">
              4
            </div>
            <span className="text-sm font-semibold tracking-wide">PASO 4 DE 4</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Secuencia de Sesiones
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Calendario semanal de actividades, materiales necesarios y preguntas de reflexión
          </p>
        </div>

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
              {/* Hilo conductor */}
              <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-4 border border-indigo-100 dark:border-indigo-900">
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">
                  Hilo Conductor
                </p>
                <Textarea
                  value={secuencia.hiloConductor}
                  onChange={(e) => {
                    const updated = { ...secuencia, hiloConductor: e.target.value };
                    setSecuencia(updated);
                    updateContenido({ secuencia: updated });
                  }}
                  rows={2}
                  className="resize-none text-sm border-indigo-200 dark:border-indigo-800"
                />
              </div>

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

                  {/* Días */}
                  {expandedWeeks[sIdx] && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {semana.dias?.map((dia, dIdx) => (
                        <div
                          key={dIdx}
                          className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-bold text-base text-slate-900 dark:text-white">
                              {dia.dia}
                            </span>
                            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              {dia.fecha}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Turno Mañana */}
                            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-100 dark:border-amber-900">
                              <Sun className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">
                                  Mañana — {dia.turnoManana?.area}
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  {dia.turnoManana?.actividad}
                                </p>
                              </div>
                            </div>

                            {/* Turno Tarde */}
                            <div className="flex items-start gap-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-3 border border-indigo-100 dark:border-indigo-900">
                              <Moon className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-0.5">
                                  Tarde — {dia.turnoTarde?.area}
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  {dia.turnoTarde?.actividad}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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
                  <span className="text-sm flex-1">{mat}</span>
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
                  <p className="text-sm flex-1 text-slate-700 dark:text-slate-300">{ref.pregunta}</p>
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
