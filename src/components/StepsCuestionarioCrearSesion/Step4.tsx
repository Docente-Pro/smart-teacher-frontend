import { IUsuario } from "@/interfaces/IUsuario";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Sparkles, Target, Wand2, Trash2, Edit, Check, X } from "lucide-react";
import { useSesionStore } from "@/store/sesion.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { instance } from "@/services/instance";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuarioFromState: IUsuario;
}

interface ICriterioIA {
  id: string;
  habilidad: string;
  conocimiento: string;
  condicion: string;
  finalidad: string;
  criterioCompleto: string;
}

function Step4({ pagina, setPagina }: Props) {
  const { sesion, updateSesion } = useSesionStore();
  const [criterios, setCriterios] = useState<ICriterioIA[]>([]);
  const [evidencia, setEvidencia] = useState("");
  const [instrumento, setInstrumento] = useState("");
  const [loadingIA, setLoadingIA] = useState(false);
  const [criterioEnEdicion, setCriterioEnEdicion] = useState<string | null>(null);
  const [criterioEditado, setCriterioEditado] = useState<ICriterioIA | null>(null);

  // Inicializar desde el store si ya hay datos
  useEffect(() => {
    if (sesion?.propositoAprendizaje) {
      // Si ya hay criterios guardados en el store (formato nuevo)
      if (sesion.propositoAprendizaje.criteriosEvaluacion && Array.isArray(sesion.propositoAprendizaje.criteriosEvaluacion)) {
        const criteriosGuardados = sesion.propositoAprendizaje.criteriosEvaluacion;

        // Verificar si son objetos con la estructura de 4 pilares
        if (criteriosGuardados.length > 0 && typeof criteriosGuardados[0] === "object") {
          setCriterios(criteriosGuardados as any);
        }
      }

      setEvidencia(sesion.propositoAprendizaje.evidenciaAprendizaje || "");
      setInstrumento(sesion.propositoAprendizaje.instrumentoEvaluacion || "");
    }
  }, [sesion]);

  async function generarCriteriosConIA() {
    if (!sesion) return;

    // Validar que haya capacidades seleccionadas
    if (!sesion.propositoAprendizaje.capacidades || sesion.propositoAprendizaje.capacidades.length === 0) {
      handleToaster("Primero selecciona al menos una capacidad", "warning");
      return;
    }

    const cantidadCapacidades = sesion.propositoAprendizaje.capacidades.length;

    setLoadingIA(true);
    try {
      const response = await instance.post("/ia/generar-criterios-evaluacion", {
        competencia: sesion.propositoAprendizaje.competencia,
        capacidades: sesion.propositoAprendizaje.capacidades,
        cantidadCriterios: cantidadCapacidades, // Solicitar tantos criterios como capacidades
        grado: sesion.datosGenerales.grado || "5to",
        area: sesion.datosGenerales.area,
        temaId: sesion.temaId,
        situacionTexto: sesion.situacionTexto,
      });

      const data = response.data;

      if (data.success && data.data) {
        setCriterios(data.data.criterios || []);
        setEvidencia(data.data.evidenciaSugerida || "");
        setInstrumento(data.data.instrumentoSugerido || "");

        handleToaster(
          `${cantidadCapacidades} criterio${cantidadCapacidades > 1 ? "s" : ""} generado${cantidadCapacidades > 1 ? "s" : ""} exitosamente`,
          "success",
        );
      }
    } catch (error) {
      console.error("Error al generar criterios con IA:", error);
      handleToaster("Error al generar criterios con IA", "error");
    } finally {
      setLoadingIA(false);
    }
  }

  function iniciarEdicion(criterio: ICriterioIA) {
    setCriterioEnEdicion(criterio.id);
    setCriterioEditado({ ...criterio });
  }

  function cancelarEdicion() {
    setCriterioEnEdicion(null);
    setCriterioEditado(null);
  }

  function guardarEdicion() {
    if (criterioEditado) {
      // Reconstruir criterio completo
      const completo =
        `${criterioEditado.habilidad} ${criterioEditado.conocimiento} ${criterioEditado.condicion} ${criterioEditado.finalidad}`.trim();

      setCriterios(criterios.map((c) => (c.id === criterioEditado.id ? { ...criterioEditado, criterioCompleto: completo } : c)));

      setCriterioEnEdicion(null);
      setCriterioEditado(null);
    }
  }

  function actualizarPilar(campo: keyof ICriterioIA, valor: string) {
    if (criterioEditado) {
      setCriterioEditado({ ...criterioEditado, [campo]: valor });
    }
  }

  function eliminarCriterio(id: string) {
    setCriterios(criterios.filter((c) => c.id !== id));
  }

  function handleNextStep() {
    if (criterios.length === 0) {
      handleToaster("Por favor genera o agrega al menos un criterio de evaluación", "error");
      return;
    }
    if (!evidencia.trim()) {
      handleToaster("Por favor ingresa la evidencia de aprendizaje", "error");
      return;
    }
    if (!instrumento.trim()) {
      handleToaster("Por favor ingresa el instrumento de evaluación", "error");
      return;
    }

    // Actualizar el store
    if (sesion) {
      updateSesion({
        propositoAprendizaje: {
          ...sesion.propositoAprendizaje,
          criteriosEvaluacion: criterios as any,
          evidenciaAprendizaje: evidencia,
          instrumentoEvaluacion: instrumento,
        },
      });
    }

    setPagina(pagina + 1);
  }

  if (!sesion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-blue-600 text-xs font-bold">3</div>
            <span className="text-sm font-semibold tracking-wide">PASO 3 DE 7</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Evaluación y Evidencias
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-4">Define cómo evaluarás el aprendizaje de tus estudiantes</p>

          {/* Botón Generar con IA */}
          <Button
            onClick={generarCriteriosConIA}
            disabled={loadingIA}
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg"
          >
            <Wand2 className="h-5 w-5 mr-2" />
            {loadingIA ? "Generando con IA..." : "Generar Criterios con IA"}
          </Button>
        </div>

        {/* Criterios de Evaluación */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              Criterios de Evaluación (4 Pilares Pedagógicos)
            </CardTitle>
            <CardDescription className="text-base">Habilidad + Conocimiento + Condición + Finalidad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lista de criterios */}
            <div className="space-y-4">
              {criterios.map((criterio) => (
                <div key={criterio.id} className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  {criterioEnEdicion === criterio.id && criterioEditado ? (
                    // Modo Edición - 4 Pilares
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-blue-700 dark:text-blue-300 block mb-1">Habilidad</label>
                          <Input
                            value={criterioEditado.habilidad}
                            onChange={(e) => actualizarPilar("habilidad", e.target.value)}
                            placeholder="Ej: Identifica, Analiza, Resuelve..."
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-blue-700 dark:text-blue-300 block mb-1">Conocimiento</label>
                          <Input
                            value={criterioEditado.conocimiento}
                            onChange={(e) => actualizarPilar("conocimiento", e.target.value)}
                            placeholder="Ej: las propiedades de la multiplicación"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-blue-700 dark:text-blue-300 block mb-1">Condición</label>
                          <Input
                            value={criterioEditado.condicion}
                            onChange={(e) => actualizarPilar("condicion", e.target.value)}
                            placeholder="Ej: a través de ejercicios prácticos"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-blue-700 dark:text-blue-300 block mb-1">Finalidad</label>
                          <Input
                            value={criterioEditado.finalidad}
                            onChange={(e) => actualizarPilar("finalidad", e.target.value)}
                            placeholder="Ej: para resolver problemas del contexto"
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={cancelarEdicion} className="text-slate-600 hover:text-slate-700">
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={guardarEdicion} className="bg-green-600 hover:bg-green-700 text-white">
                          <Check className="h-4 w-4 mr-1" />
                          Guardar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Modo Vista
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">{criterio.criterioCompleto}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Habilidad:</span>
                            <p className="text-slate-700 dark:text-slate-300">{criterio.habilidad}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Conocimiento:</span>
                            <p className="text-slate-700 dark:text-slate-300">{criterio.conocimiento}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Condición:</span>
                            <p className="text-slate-700 dark:text-slate-300">{criterio.condicion}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">Finalidad:</span>
                            <p className="text-slate-700 dark:text-slate-300">{criterio.finalidad}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => iniciarEdicion(criterio)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-950"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarCriterio(criterio.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {criterios.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No hay criterios generados aún</p>
                <p className="text-xs">Usa el botón "Generar Criterios con IA" para comenzar</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evidencia de Aprendizaje */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Evidencia o Producto</CardTitle>
            <CardDescription>¿Qué producirán o demostrarán los estudiantes?</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Ejemplo: Resolución de problemas de multiplicación en su cuaderno"
              value={evidencia}
              onChange={(e) => setEvidencia(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Instrumento de Evaluación */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Instrumento de Evaluación</CardTitle>
            <CardDescription>¿Qué instrumento usarás para evaluar?</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Ejemplo: Lista de cotejo, Rúbrica, Ficha de observación"
              value={instrumento}
              onChange={(e) => setInstrumento(e.target.value)}
            />
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
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Step4;
