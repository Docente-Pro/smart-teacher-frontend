import { IUsuario } from "@/interfaces/IUsuario";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Sparkles, PlayCircle, Circle, CheckCircle, Plus, Trash2, Wand2, Edit } from "lucide-react";
import { useSesionStore } from "@/store/sesion.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { instance } from "@/services/instance";
import { GraficoRenderer } from "@/features/graficos-educativos/presentation/components/GraficoRenderer";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuarioFromState: IUsuario;
}

interface Proceso {
  proceso: string;
  estrategias: string;
  recursosDidacticos: string;
  tiempo: string;
}

function Step8({ pagina, setPagina }: Props) {
  const { sesion, updateSesion } = useSesionStore();

  // Estados para INICIO
  const [inicioTiempo, setInicioTiempo] = useState("15 min");
  const [inicioProcesos, setInicioProcesos] = useState<Proceso[]>([]);

  // Estados para DESARROLLO
  const [desarrolloTiempo, setDesarrolloTiempo] = useState("60 min");
  const [desarrolloProcesos, setDesarrolloProcesos] = useState<Proceso[]>([]);

  // Estados para CIERRE
  const [cierreTiempo, setCierreTiempo] = useState("15 min");
  const [cierreProcesos, setCierreProcesos] = useState<Proceso[]>([]);

  // Estado para el formulario de nuevo proceso
  const [nuevoProceso, setNuevoProceso] = useState<Proceso>({
    proceso: "",
    estrategias: "",
    recursosDidacticos: "",
    tiempo: "",
  });
  const [seccionActual, setSeccionActual] = useState<"inicio" | "desarrollo" | "cierre">("inicio");
  const [loadingIA, setLoadingIA] = useState(false);
  const [procesoEnEdicion, setProcesoEnEdicion] = useState<{ seccion: "inicio" | "desarrollo" | "cierre"; index: number } | null>(null);
  const [procesoEditado, setProcesoEditado] = useState<Proceso | null>(null);

  // Función para calcular el tiempo total de la sesión
  function calcularTiempoTotal(): number {
    let totalMinutos = 0;

    // Función auxiliar para extraer minutos de un string (ej: "15 min", "1h 30min", "45")
    const extraerMinutos = (tiempo: string): number => {
      if (!tiempo) return 0;

      const str = tiempo.toLowerCase().trim();
      let minutos = 0;

      // Detectar horas (1h, 2h, etc.)
      const horasMatch = str.match(/(\d+)\s*h/);
      if (horasMatch) {
        minutos += parseInt(horasMatch[1]) * 60;
      }

      // Detectar minutos (15min, 30 min, etc.)
      const minutosMatch = str.match(/(\d+)\s*m/);
      if (minutosMatch) {
        minutos += parseInt(minutosMatch[1]);
      }

      // Si solo es un número sin unidad, asumimos minutos
      if (minutos === 0 && /^\d+$/.test(str)) {
        minutos = parseInt(str);
      }

      return minutos;
    };

    // Sumar tiempos de todos los procesos
    inicioProcesos.forEach((p) => (totalMinutos += extraerMinutos(p.tiempo)));
    desarrolloProcesos.forEach((p) => (totalMinutos += extraerMinutos(p.tiempo)));
    cierreProcesos.forEach((p) => (totalMinutos += extraerMinutos(p.tiempo)));

    return totalMinutos;
  }

  // Función para formatear minutos a formato legible
  function formatearTiempo(minutos: number): string {
    if (minutos === 0) return "0 min";

    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    if (horas > 0 && mins > 0) {
      return `${horas}h ${mins}min`;
    } else if (horas > 0) {
      return `${horas}h`;
    } else {
      return `${mins}min`;
    }
  }

  // Inicializar desde el store si ya hay datos
  useEffect(() => {
    if (sesion?.secuenciaDidactica) {
      const { inicio, desarrollo, cierre } = sesion.secuenciaDidactica;

      if (inicio) {
        setInicioTiempo(inicio.tiempo || "15 min");
        setInicioProcesos(inicio.procesos || []);
      }

      if (desarrollo) {
        setDesarrolloTiempo(desarrollo.tiempo || "60 min");
        setDesarrolloProcesos(desarrollo.procesos || []);
      }

      if (cierre) {
        setCierreTiempo(cierre.tiempo || "15 min");
        setCierreProcesos(cierre.procesos || []);
      }
    }
  }, [sesion]);

  function agregarProceso() {
    if (!nuevoProceso.proceso.trim() || !nuevoProceso.estrategias.trim()) {
      handleToaster("Completa al menos el proceso y las estrategias", "error");
      return;
    }

    const proceso = { ...nuevoProceso };

    if (seccionActual === "inicio") {
      setInicioProcesos([...inicioProcesos, proceso]);
    } else if (seccionActual === "desarrollo") {
      setDesarrolloProcesos([...desarrolloProcesos, proceso]);
    } else {
      setCierreProcesos([...cierreProcesos, proceso]);
    }

    setNuevoProceso({ proceso: "", estrategias: "", recursosDidacticos: "", tiempo: "" });
  }

  function eliminarProceso(index: number, seccion: "inicio" | "desarrollo" | "cierre") {
    if (seccion === "inicio") {
      setInicioProcesos(inicioProcesos.filter((_, i) => i !== index));
    } else if (seccion === "desarrollo") {
      setDesarrolloProcesos(desarrolloProcesos.filter((_, i) => i !== index));
    } else {
      setCierreProcesos(cierreProcesos.filter((_, i) => i !== index));
    }
  }

  function iniciarEdicionProceso(index: number, seccion: "inicio" | "desarrollo" | "cierre") {
    let proceso: Proceso;
    if (seccion === "inicio") proceso = inicioProcesos[index];
    else if (seccion === "desarrollo") proceso = desarrolloProcesos[index];
    else proceso = cierreProcesos[index];

    setProcesoEnEdicion({ seccion, index });
    setProcesoEditado({ ...proceso });
  }

  function cancelarEdicionProceso() {
    setProcesoEnEdicion(null);
    setProcesoEditado(null);
  }

  function guardarEdicionProceso() {
    if (!procesoEnEdicion || !procesoEditado) return;

    const { seccion, index } = procesoEnEdicion;

    if (seccion === "inicio") {
      const updated = [...inicioProcesos];
      updated[index] = procesoEditado;
      setInicioProcesos(updated);
    } else if (seccion === "desarrollo") {
      const updated = [...desarrolloProcesos];
      updated[index] = procesoEditado;
      setDesarrolloProcesos(updated);
    } else {
      const updated = [...cierreProcesos];
      updated[index] = procesoEditado;
      setCierreProcesos(updated);
    }

    setProcesoEnEdicion(null);
    setProcesoEditado(null);
    handleToaster("Proceso actualizado exitosamente", "success");
  }

  async function generarConIA() {
    if (!sesion) return;

    setLoadingIA(true);
    try {
      const response = await instance.post("/ia/generar-secuencia-didactica", {
        temaId: sesion.temaId,
        datosGenerales: sesion.datosGenerales,
        propositoAprendizaje: sesion.propositoAprendizaje,
        propositoSesion: sesion.propositoSesion,
        k: sesion.propositoAprendizaje.cantidadCriterios || 6,
        tipoGrafico: sesion.preparacion?.tipoGraficoPreferido || "AUTO",
        estructuraCompleta: true,
      });

      const data = response.data;

      if (data.success && data.data) {
        // Cargar datos de INICIO
        if (data.data.inicio) {
          setInicioTiempo(data.data.inicio.tiempo || "15 min");
          setInicioProcesos(data.data.inicio.procesos || []);
        }

        // Cargar datos de DESARROLLO
        if (data.data.desarrollo) {
          setDesarrolloTiempo(data.data.desarrollo.tiempo || "60 min");
          setDesarrolloProcesos(data.data.desarrollo.procesos || []);
        }

        // Cargar datos de CIERRE
        if (data.data.cierre) {
          setCierreTiempo(data.data.cierre.tiempo || "15 min");
          setCierreProcesos(data.data.cierre.procesos || []);
        }

        // ⭐ GUARDAR TODO EN EL STORE (título + secuenciaDidactica)
        updateSesion({
          titulo: data.data.titulo || sesion.titulo,
          secuenciaDidactica: {
            inicio: data.data.inicio || { tiempo: "15 min", procesos: [] },
            desarrollo: data.data.desarrollo || { tiempo: "60 min", procesos: [] },
            cierre: data.data.cierre || { tiempo: "15 min", procesos: [] },
          },
        });

        handleToaster("Secuencia didáctica generada exitosamente con IA", "success");
      }
    } catch (error) {
      console.error("Error al generar secuencia con IA:", error);
      handleToaster("Error al generar secuencia con IA", "error");
    } finally {
      setLoadingIA(false);
    }
  }

  function handleNextStep() {
    if (inicioProcesos.length === 0) {
      handleToaster("Agrega al menos un proceso en la sección INICIO", "error");
      return;
    }
    if (desarrolloProcesos.length === 0) {
      handleToaster("Agrega al menos un proceso en la sección DESARROLLO", "error");
      return;
    }
    if (cierreProcesos.length === 0) {
      handleToaster("Agrega al menos un proceso en la sección CIERRE", "error");
      return;
    }

    // Actualizar el store
    if (sesion) {
      updateSesion({
        secuenciaDidactica: {
          inicio: {
            tiempo: inicioTiempo,
            procesos: inicioProcesos,
          },
          desarrollo: {
            tiempo: desarrolloTiempo,
            procesos: desarrolloProcesos,
          },
          cierre: {
            tiempo: cierreTiempo,
            procesos: cierreProcesos,
          },
        },
      });
    }

    setPagina(pagina + 1);
  }

  if (!sesion) return null;

  const renderProcesos = (procesos: Proceso[], seccion: "inicio" | "desarrollo" | "cierre") => {
    if (procesos.length === 0) {
      return (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
          <p className="text-slate-500 dark:text-slate-400">No hay procesos agregados en esta sección</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Usa el formulario de abajo para agregar procesos</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {procesos.map((proc, index) => {
          const estaEditando = procesoEnEdicion?.seccion === seccion && procesoEnEdicion?.index === index;

          if (estaEditando && procesoEditado) {
            return (
              <div
                key={index}
                className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-xl border-2 border-emerald-400 dark:border-emerald-600 shadow-xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-300">Editando Proceso</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Proceso</label>
                    <Input
                      value={procesoEditado.proceso}
                      onChange={(e) => setProcesoEditado({ ...procesoEditado, proceso: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Estrategias</label>
                    <Textarea
                      value={procesoEditado.estrategias}
                      onChange={(e) => setProcesoEditado({ ...procesoEditado, estrategias: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Recursos</label>
                      <Input
                        value={procesoEditado.recursosDidacticos}
                        onChange={(e) => setProcesoEditado({ ...procesoEditado, recursosDidacticos: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 block">Tiempo</label>
                      <Input
                        value={procesoEditado.tiempo}
                        onChange={(e) => setProcesoEditado({ ...procesoEditado, tiempo: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={guardarEdicionProceso} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      Guardar
                    </Button>
                    <Button onClick={cancelarEdicionProceso} variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={index}
              className="group relative p-6 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 hover:border-emerald-400 dark:hover:border-emerald-600"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2 leading-snug">{proc.proceso}</h4>
                    {proc.tiempo && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-semibold rounded-full">
                        ⏱️ {proc.tiempo}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => iniciarEdicionProceso(index, seccion)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-950"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarProceso(index, seccion)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4 ml-11">
                {/* Mostrar gráficos/imágenes del problema matemático si existen */}
                {(proc as any).problemaMatematico && (
                  <div className="space-y-3">
                    {/* Gráfico del problema (Rough.js) - soporta 'grafico' o 'graficoProblema' */}
                    {((proc as any).grafico || (proc as any).graficoProblema) && (
                      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg overflow-x-auto max-w-full">
                        <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2">📝 Problema Matemático:</p>
                        <div className="flex justify-center">
                          <GraficoRenderer grafico={(proc as any).grafico || (proc as any).graficoProblema} />
                        </div>
                      </div>
                    )}

                    {/* Fallback: Imagen del problema (legacy) */}
                    {!(proc as any).grafico &&
                      !(proc as any).graficoProblema &&
                      (proc as any).imagenProblema &&
                      (proc as any).imagenProblema !== "GENERATE_IMAGE" && (
                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                          <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2">📝 Problema Matemático:</p>
                          <img
                            src={(proc as any).imagenProblema}
                            alt="Problema matemático"
                            className="w-full max-w-md rounded-lg shadow-md mb-2"
                          />
                        </div>
                      )}

                    {/* Texto del problema */}
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border-l-4 border-blue-500">
                      <p className="text-slate-700 dark:text-slate-300">{(proc as any).problemaMatematico}</p>
                    </div>

                    {/* Gráfico de la solución (Rough.js) - soporta 'graficoSolucion' */}
                    {(proc as any).graficoSolucion && (
                      <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                        <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-2">✅ Solución:</p>
                        <div className="flex justify-center">
                          <GraficoRenderer grafico={(proc as any).graficoSolucion} />
                        </div>
                      </div>
                    )}

                    {/* Fallback: Imagen de la solución (legacy) */}
                    {!(proc as any).graficoSolucion &&
                      (proc as any).imagenSolucion &&
                      (proc as any).imagenSolucion !== "GENERATE_IMAGE" && (
                        <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                          <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-2">✅ Solución:</p>
                          <img
                            src={(proc as any).imagenSolucion}
                            alt="Solución del problema"
                            className="w-full max-w-md rounded-lg shadow-md mb-2"
                          />
                        </div>
                      )}

                    {/* Texto de la solución */}
                    {(proc as any).solucionProblema && (
                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border-l-4 border-green-500">
                        <pre className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans text-sm">
                          {(proc as any).solucionProblema}
                        </pre>
                      </div>
                    )}

                    {/* 🆕 Gráfico de la operación matemática (ecuacion_cajas, operacion_vertical, etc.) */}
                    {(proc as any).graficoOperacion && (
                      <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-700 overflow-x-auto max-w-full">
                        <p className="text-sm font-bold text-purple-700 dark:text-purple-400 mb-2">🔢 Operación Matemática:</p>
                        <div className="flex justify-center">
                          <GraficoRenderer grafico={(proc as any).graficoOperacion} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-2">Estrategias:</p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{proc.estrategias}</p>
                </div>
                {proc.recursosDidacticos && (
                  <div className="pt-2">
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-2">Recursos:</p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{proc.recursosDidacticos}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-emerald-600 text-xs font-bold">7</div>
            <span className="text-sm font-semibold tracking-wide">PASO 7 DE 8</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Secuencia Didáctica
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-4">Planifica las actividades de tu sesión</p>

          {/* Botón IA */}
          <Button
            onClick={generarConIA}
            disabled={loadingIA}
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg"
          >
            <Wand2 className="h-5 w-5 mr-2" />
            {loadingIA ? "Generando..." : "Generar con IA"}
          </Button>
        </div>

        {/* Selector de sección con tabs */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setSeccionActual("inicio")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              seccionActual === "inicio"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-600"
            }`}
          >
            <PlayCircle className="h-5 w-5" />
            <span>Inicio</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                seccionActual === "inicio" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {inicioProcesos.length}
            </span>
          </button>
          <button
            onClick={() => setSeccionActual("desarrollo")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              seccionActual === "desarrollo"
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600"
            }`}
          >
            <Circle className="h-5 w-5" />
            <span>Desarrollo</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                seccionActual === "desarrollo"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {desarrolloProcesos.length}
            </span>
          </button>
          <button
            onClick={() => setSeccionActual("cierre")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              seccionActual === "cierre"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-600"
            }`}
          >
            <CheckCircle className="h-5 w-5" />
            <span>Cierre</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                seccionActual === "cierre" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {cierreProcesos.length}
            </span>
          </button>
        </div>

        {/* Indicador de Tiempo Total */}
        <div className="mb-8 flex justify-center">
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 shadow-lg">
            <CardContent className="pt-4 pb-4 px-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Duración Total</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {formatearTiempo(calcularTiempoTotal())}
                    </p>
                  </div>
                </div>
                <div className="h-12 w-px bg-slate-300 dark:bg-slate-600"></div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Inicio</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {formatearTiempo(
                        inicioProcesos.reduce((acc, p) => {
                          const mins = p.tiempo ? parseInt(p.tiempo.match(/\d+/)?.[0] || "0") : 0;
                          return acc + mins;
                        }, 0)
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Desarrollo</p>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatearTiempo(
                        desarrolloProcesos.reduce((acc, p) => {
                          const mins = p.tiempo ? parseInt(p.tiempo.match(/\d+/)?.[0] || "0") : 0;
                          return acc + mins;
                        }, 0)
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Cierre</p>
                    <p className="font-semibold text-orange-600 dark:text-orange-400">
                      {formatearTiempo(
                        cierreProcesos.reduce((acc, p) => {
                          const mins = p.tiempo ? parseInt(p.tiempo.match(/\d+/)?.[0] || "0") : 0;
                          return acc + mins;
                        }, 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido de la sección activa */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader
            className={`${
              seccionActual === "inicio"
                ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950"
                : seccionActual === "desarrollo"
                ? "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950"
                : "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950"
            }`}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                {seccionActual === "inicio" && <PlayCircle className="h-7 w-7 text-green-600 dark:text-green-400" />}
                {seccionActual === "desarrollo" && <Circle className="h-7 w-7 text-blue-600 dark:text-blue-400" />}
                {seccionActual === "cierre" && <CheckCircle className="h-7 w-7 text-orange-600 dark:text-orange-400" />}
                <span className="text-2xl">
                  {seccionActual === "inicio" ? "Inicio" : seccionActual === "desarrollo" ? "Desarrollo" : "Cierre"}
                </span>
              </CardTitle>
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Duración total:</label>
                <Input
                  type="text"
                  value={seccionActual === "inicio" ? inicioTiempo : seccionActual === "desarrollo" ? desarrolloTiempo : cierreTiempo}
                  onChange={(e) => {
                    if (seccionActual === "inicio") setInicioTiempo(e.target.value);
                    else if (seccionActual === "desarrollo") setDesarrolloTiempo(e.target.value);
                    else setCierreTiempo(e.target.value);
                  }}
                  placeholder="Ej: 15 min"
                  className="w-32"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {seccionActual === "inicio" && renderProcesos(inicioProcesos, "inicio")}
            {seccionActual === "desarrollo" && renderProcesos(desarrolloProcesos, "desarrollo")}
            {seccionActual === "cierre" && renderProcesos(cierreProcesos, "cierre")}
          </CardContent>
        </Card>

        {/* Formulario para agregar proceso */}
        <Card className="mb-8 border-2 border-emerald-200 dark:border-emerald-800 shadow-xl bg-gradient-to-br from-white to-emerald-50 dark:from-slate-800 dark:to-slate-900">
          <CardHeader className="border-b-2 border-emerald-100 dark:border-emerald-900">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              Agregar Proceso a {seccionActual === "inicio" ? "Inicio" : seccionActual === "desarrollo" ? "Desarrollo" : "Cierre"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                Proceso / Actividad
                <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Ej: Problematización, Análisis, Reflexión, Sistematización..."
                value={nuevoProceso.proceso}
                onChange={(e) => setNuevoProceso({ ...nuevoProceso, proceso: e.target.value })}
                className="text-base"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                Estrategias / Actividades
                <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Describe detalladamente las estrategias metodológicas y actividades que se realizarán en este proceso..."
                value={nuevoProceso.estrategias}
                onChange={(e) => setNuevoProceso({ ...nuevoProceso, estrategias: e.target.value })}
                rows={4}
                className="text-base resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Recursos Didácticos</label>
                <Input
                  placeholder="Ej: Fichas, material concreto, proyector..."
                  value={nuevoProceso.recursosDidacticos}
                  onChange={(e) => setNuevoProceso({ ...nuevoProceso, recursosDidacticos: e.target.value })}
                  className="text-base"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Tiempo Estimado</label>
                <Input
                  placeholder="Ej: 10 min, 20 min..."
                  value={nuevoProceso.tiempo}
                  onChange={(e) => setNuevoProceso({ ...nuevoProceso, tiempo: e.target.value })}
                  className="text-base"
                />
              </div>
            </div>
            <Button
              onClick={agregarProceso}
              disabled={!nuevoProceso.proceso.trim() || !nuevoProceso.estrategias.trim()}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Agregar Proceso a {seccionActual === "inicio" ? "Inicio" : seccionActual === "desarrollo" ? "Desarrollo" : "Cierre"}
            </Button>
          </CardContent>
        </Card>

        {/* Botones de navegación */}
        <div className="flex justify-between items-center">
          <Button onClick={() => setPagina(pagina - 1)} variant="outline" className="h-14 px-8 text-lg font-semibold border-2">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Anterior
          </Button>
          <Button
            onClick={handleNextStep}
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Step8;
