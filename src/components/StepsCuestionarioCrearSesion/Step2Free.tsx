import { ICompetencia } from "@/interfaces/ICompetencia";
import { IUsuario } from "@/interfaces/IUsuario";
import { getCompetencyById } from "@/services/competencias.service";
import { useEffect, useRef, useState } from "react";
import { getCapacidadByCompentenciaId } from "@/services/capacidades.service";
import { ICapacidad } from "@/interfaces/ICapacidad";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Loader2,
  Wand2,
  BookOpen,
  FileText,
  Heart,
  Layers,
  Target,
} from "lucide-react";
import { useSesionStore } from "@/store/sesion.store";
import { getAllAreas } from "@/services/areas.service";
import { SelectorTemas } from "@/components/SelectorTemas";
import { useCompetenciaSugerida } from "@/hooks/useCompetenciaSugerida";
import { useAutoGenerarSesion, type AutoGenPhase } from "@/hooks/useAutoGenerarSesion";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuarioFromState: IUsuario;
}

/* ─── Mapeo visual de fases ─── */
const PHASE_CONFIG: Record<
  AutoGenPhase,
  { icon: any; gradient: string; progress: number }
> = {
  idle: { icon: Sparkles, gradient: "from-slate-400 to-slate-500", progress: 0 },
  criterios: { icon: FileText, gradient: "from-blue-500 to-cyan-500", progress: 20 },
  proposito: { icon: Target, gradient: "from-purple-500 to-pink-500", progress: 40 },
  enfoques: { icon: Heart, gradient: "from-rose-500 to-orange-500", progress: 60 },
  secuencia: { icon: Layers, gradient: "from-amber-500 to-yellow-500", progress: 80 },
  imagenes: { icon: BookOpen, gradient: "from-emerald-500 to-teal-500", progress: 90 },
  done: { icon: CheckCircle2, gradient: "from-green-500 to-emerald-500", progress: 100 },
  error: { icon: Target, gradient: "from-red-500 to-rose-500", progress: 0 },
};

function Step2Free({ pagina, setPagina }: Props) {
  const { sesion, updateSesion } = useSesionStore();
  const [competencias, setCompetencias] = useState<ICompetencia[]>([]);
  const [capacidadesSeleccionadas, setCapacidadesSeleccionadas] = useState<ICapacidad[]>([]);
  const [loadingCompetencias, setLoadingCompetencias] = useState(true);
  const [loadingCapacidades, setLoadingCapacidades] = useState(false);
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState<string>("");
  const [areaId, setAreaId] = useState<number | null>(null);

  const temaEffectInitializedRef = useRef(false);
  const temaPrevioRef = useRef<string | undefined | null>(sesion?.temaCurricular);

  // Auto-generate hook
  const { phase, isRunning, phaseLabel, run: autoGenerar } = useAutoGenerarSesion();

  const handleTemaSeleccionado = (tema: string) => {
    setCompetenciaSeleccionada("");
    setCapacidadesSeleccionadas([]);
    clearSugerencia();

    if (sesion) {
      updateSesion({
        propositoAprendizaje: {
          ...sesion.propositoAprendizaje,
          competencia: "",
          capacidades: [],
        },
      });
    }
  };

  const { sugerencia, loading: loadingSugerencia, clearSugerencia } = useCompetenciaSugerida({
    areaId,
    temaId: sesion?.temaId ?? null,
    temaTexto: sesion?.temaCurricular || null,
    enabled: !!areaId && !!sesion?.temaCurricular && !competenciaSeleccionada,
  });

  useEffect(() => {
    if (sesion?.propositoAprendizaje.competencia) {
      setCompetenciaSeleccionada(sesion.propositoAprendizaje.competencia);
      if (sesion.propositoAprendizaje.capacidades?.length > 0) {
        const capacidadesFromStore: ICapacidad[] = sesion.propositoAprendizaje.capacidades.map(
          (cap, index) => ({
            id: index + 1,
            nombre: cap.nombre,
            descripcion: cap.descripcion || "",
            competencia: 0,
            competenciaId: 0,
          })
        );
        setCapacidadesSeleccionadas(capacidadesFromStore);
      }
    }
  }, []);

  useEffect(() => {
    if (!sesion) return;
    const temaActual = sesion.temaCurricular;
    if (!temaEffectInitializedRef.current) {
      temaEffectInitializedRef.current = true;
      temaPrevioRef.current = temaActual;
      return;
    }
    if (temaActual && temaActual !== temaPrevioRef.current) {
      setCompetenciaSeleccionada("");
      setCapacidadesSeleccionadas([]);
      clearSugerencia();
      updateSesion({
        propositoAprendizaje: {
          ...sesion.propositoAprendizaje,
          competencia: "",
          capacidades: [],
        },
      });
    }
    temaPrevioRef.current = temaActual;
  }, [sesion?.temaCurricular, clearSugerencia, updateSesion]);

  useEffect(() => {
    async function cargarCompetencias() {
      if (!sesion?.datosGenerales.area) return;
      setLoadingCompetencias(true);
      try {
        const areasResponse = await getAllAreas();
        const areas = areasResponse.data.data || areasResponse.data;
        const areaEncontrada = areas.find((a: any) => a.nombre === sesion.datosGenerales.area);
        if (areaEncontrada) {
          setAreaId(areaEncontrada.id);
          const response = await getCompetencyById(areaEncontrada.id);
          setCompetencias(response.data.data || response.data);
        }
      } catch {
        handleToaster("Error al cargar competencias", "error");
      } finally {
        setLoadingCompetencias(false);
      }
    }
    cargarCompetencias();
  }, [sesion?.datosGenerales.area]);

  useEffect(() => {
    async function cargarCapacidades() {
      if (
        capacidadesSeleccionadas.length > 0 &&
        sesion?.propositoAprendizaje.competencia === competenciaSeleccionada
      ) {
        return;
      }
      const competenciaEncontrada = competencias.find((c) => c.nombre === competenciaSeleccionada);
      if (competenciaEncontrada) {
        setLoadingCapacidades(true);
        try {
          const response = await getCapacidadByCompentenciaId(competenciaEncontrada.id);
          const capacidadesData = response.data.data || response.data;
          setCapacidadesSeleccionadas(capacidadesData);
          if (sesion) {
            updateSesion({
              propositoAprendizaje: {
                ...sesion.propositoAprendizaje,
                competencia: competenciaSeleccionada,
                capacidades: capacidadesData.map((cap: ICapacidad) => ({
                  nombre: cap.nombre,
                  descripcion: cap.descripcion || "",
                })),
              },
            });
          }
        } catch {
          handleToaster("Error al cargar capacidades", "error");
        } finally {
          setLoadingCapacidades(false);
        }
      }
    }
    if (competenciaSeleccionada && competencias.length > 0) {
      cargarCapacidades();
    }
  }, [competenciaSeleccionada, competencias]);

  useEffect(() => {
    if (sugerencia) {
      setCompetenciaSeleccionada(sugerencia.competenciaNombre);
      if (sugerencia.situacionTexto) {
        updateSesion({ situacionTexto: sugerencia.situacionTexto });
      }
    }
  }, [sugerencia, sesion?.temaId]);

  /**
   * Al dar clic en "Generar Sesión", se ejecuta toda la pipeline de IA
   * y al finalizar se avanza al paso de resultado.
   */
  async function handleGenerarSesion() {
    if (!isReady) return;

    const success = await autoGenerar();
    if (success) {
      setPagina(pagina + 1);
    }
  }

  // Derivar si el sistema está "listo" (competencia + capacidades resueltas en background)
  const isReady =
    !!sesion?.temaCurricular?.trim() &&
    !!competenciaSeleccionada &&
    capacidadesSeleccionadas.length > 0 &&
    !loadingCapacidades;

  // Derivar si está "preparando" en background
  const isPreparing =
    !!sesion?.temaCurricular?.trim() &&
    (!competenciaSeleccionada || loadingCapacidades || loadingSugerencia || loadingCompetencias);

  if (!sesion) return null;

  // ═══════════════ PANTALLA DE GENERACIÓN ═══════════════
  if (isRunning) {
    const config = PHASE_CONFIG[phase];
    const PhaseIcon = config.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
            {/* Progress bar */}
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700">
              <div
                className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-700 ease-out`}
                style={{ width: `${config.progress}%` }}
              />
            </div>

            <CardContent className="p-8 sm:p-12 text-center">
              {/* Animated icon */}
              <div className="relative mx-auto mb-8 w-24 h-24">
                <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-2xl opacity-20 animate-pulse`} />
                <div className={`relative w-full h-full bg-gradient-to-r ${config.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <PhaseIcon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1">
                  <Loader2 className="h-6 w-6 text-slate-500 animate-spin" />
                </div>
              </div>

              {/* Phase label */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-3">
                Generando tu sesión...
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 mb-6">
                {phaseLabel}
              </p>

              {/* Step dots */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {(["criterios", "proposito", "enfoques", "secuencia"] as AutoGenPhase[]).map((p) => {
                  const phaseIdx = ["criterios", "proposito", "enfoques", "secuencia"].indexOf(p);
                  const currentIdx = ["criterios", "proposito", "enfoques", "secuencia"].indexOf(phase);
                  const isDone = currentIdx > phaseIdx;
                  const isCurrent = p === phase;

                  return (
                    <div key={p} className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          isDone
                            ? "bg-green-500 scale-100"
                            : isCurrent
                            ? "bg-blue-500 scale-125 animate-pulse"
                            : "bg-slate-300 dark:bg-slate-600"
                        }`}
                      />
                      {phaseIdx < 3 && (
                        <div
                          className={`w-8 h-0.5 transition-colors duration-300 ${
                            isDone ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500">
                Esto puede tardar unos segundos. No cierres esta ventana.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ═══════════════ PANTALLA NORMAL (SELECCIÓN DE TEMA) ═══════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-purple-600 text-xs font-bold">
              2
            </div>
            <span className="text-sm font-semibold tracking-wide">PASO 2 DE 3</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Selecciona tu Tema
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Elige el tema curricular y la IA generará toda tu sesión automáticamente
          </p>
        </div>

        {/* Selector de Tema */}
        <div className="mb-8">
          <SelectorTemas onTemaSeleccionado={handleTemaSeleccionado} />
        </div>

        {/* ─── Indicador sutil de estado (preparando / listo) ─── */}
        {sesion.temaCurricular?.trim() && (
          <div className="mb-8 flex justify-center">
            {isPreparing ? (
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 animate-in fade-in">
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Preparando competencia y capacidades...
                </span>
              </div>
            ) : isReady ? (
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Todo listo — haz clic en <strong>Generar Sesión con IA</strong> para continuar
                </span>
              </div>
            ) : null}
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setPagina(pagina - 1)}
            variant="outline"
            className="h-14 px-8 text-lg font-semibold border-2"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Anterior
          </Button>
          <Button
            onClick={handleGenerarSesion}
            disabled={!isReady || isRunning}
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 className="mr-2 h-5 w-5" />
            Generar Sesión con IA
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Step2Free;
