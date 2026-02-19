import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { useUnidadStore } from "@/store/unidad.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import {
  generarAreasComplementarias,
  generarEnfoques,
  regenerarPasoUnidad,
} from "@/services/ia-unidad.service";
import type { IUsuario } from "@/interfaces/IUsuario";
import type {
  IAreaComplementaria,
  IAreasComplementariasResponse,
  IEnfoqueUnidad,
  IEnfoquesResponse,
} from "@/interfaces/IUnidadIA";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuario: IUsuario;
}

type GenerationStatus = "idle" | "generating" | "done" | "error";

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

function Step3EnfoquesComplementos({ pagina, setPagina }: Props) {
  const { unidadId, contenido, updateContenido, generandoPaso, setGenerandoPaso } =
    useUnidadStore();

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

  const isGenerating = generandoPaso !== null;

  /* ═══════════════════════════════════════════
     Generar TODO (pasos 4 + 5)
     ═══════════════════════════════════════════ */
  const generarTodo = useCallback(async () => {
    if (!unidadId) return handleToaster("Error: unidad no creada", "error");

    try {
      // 4. Áreas Complementarias
      setStatusAreas("generating");
      setGenerandoPaso("Áreas Complementarias");
      const resAreas = await generarAreasComplementarias(unidadId);
      const areasData = (resAreas.data as IAreasComplementariasResponse).areasComplementarias;
      setAreasComp(areasData);
      updateContenido({ areasComplementarias: areasData });
      setStatusAreas("done");

      // 5. Enfoques Transversales
      setStatusEnfoques("generating");
      setGenerandoPaso("Enfoques Transversales");
      const resEnf = await generarEnfoques(unidadId);
      const enfData = (resEnf.data as IEnfoquesResponse).enfoques;
      setEnfoques(enfData);
      updateContenido({ enfoques: enfData });
      setStatusEnfoques("done");

      setGenerandoPaso(null);
      handleToaster("¡Enfoques y áreas complementarias generados!", "success");
    } catch (error: any) {
      console.error("Error al generar:", error);
      setGenerandoPaso(null);
      if (statusAreas === "generating") setStatusAreas("error");
      if (statusEnfoques === "generating") setStatusEnfoques("error");
      handleToaster(
        error?.response?.data?.message || "Error al generar con IA",
        "error"
      );
    }
  }, [unidadId]);

  /* ─── Regenerar individual ─── */
  async function regenerar(paso: "areas-complementarias" | "enfoques") {
    if (!unidadId) return;
    const label = paso === "areas-complementarias" ? "Áreas Complementarias" : "Enfoques Transversales";
    const setStatus = paso === "areas-complementarias" ? setStatusAreas : setStatusEnfoques;

    setStatus("generating");
    setGenerandoPaso(label);

    try {
      const res = await regenerarPasoUnidad(unidadId, paso);

      if (paso === "areas-complementarias") {
        const d = (res.data as unknown as IAreasComplementariasResponse).areasComplementarias;
        setAreasComp(d);
        updateContenido({ areasComplementarias: d });
      } else {
        const d = (res.data as unknown as IEnfoquesResponse).enfoques;
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

  function handleContinuar() {
    if (!contenido.areasComplementarias?.length) {
      return handleToaster("Primero genera las áreas complementarias", "error");
    }
    if (!contenido.enfoques?.length) {
      return handleToaster("Primero genera los enfoques transversales", "error");
    }
    setPagina(pagina + 1);
  }

  const allDone = statusAreas === "done" && statusEnfoques === "done";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-5xl mx-auto">
        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-cyan-600 text-xs font-bold">
              3
            </div>
            <span className="text-sm font-semibold tracking-wide">PASO 3 DE 4</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Enfoques y Complementos
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Áreas complementarias y enfoques transversales para enriquecer la unidad
          </p>
        </div>

        {/* ── Botón generar ── */}
        {!allDone && (
          <div className="text-center mb-10">
            <Button
              onClick={generarTodo}
              disabled={isGenerating}
              className="h-16 px-10 text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
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
          </div>
        )}

        {/* ═══════════════════════════════
            Áreas Complementarias
            ═══════════════════════════════ */}
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
                            <li key={j}>{act}</li>
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
            )}
          </CardContent>
        </Card>

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
                      <span className="font-medium">Valor:</span> {enf.valor}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-medium">Actitudes:</span> {enf.actitudes}
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
            disabled={!allDone}
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
