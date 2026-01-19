import { IUsuario } from "@/interfaces/IUsuario";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Sparkles, Package, Plus, Trash2, Wand2, BarChart3 } from "lucide-react";
import { useSesionStore } from "@/store/sesion.store";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { instance } from "@/services/instance";
import { TipoGraficoMatematica } from "@/features/graficos-educativos/domain/types";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuarioFromState: IUsuario;
}

function Step7({ pagina, setPagina }: Props) {
  const { sesion, updateSesion } = useSesionStore();
  const [quehacerAntes, setQuehacerAntes] = useState<string[]>([]);
  const [nuevoQuehacer, setNuevoQuehacer] = useState("");
  const [recursos, setRecursos] = useState<string[]>([]);
  const [nuevoRecurso, setNuevoRecurso] = useState("");
  const [tipoGraficoPreferido, setTipoGraficoPreferido] = useState<string>("AUTO");
  const [loadingIA, setLoadingIA] = useState(false);

  // Inicializar desde el store si ya hay datos
  useEffect(() => {
    if (sesion?.preparacion) {
      setQuehacerAntes(sesion.preparacion.quehacerAntes || []);
      setRecursos(sesion.preparacion.recursosMateriales || []);
      setTipoGraficoPreferido((sesion.preparacion as any).tipoGraficoPreferido || "AUTO");
    }
  }, [sesion]);

  function agregarQuehacer() {
    if (nuevoQuehacer.trim()) {
      setQuehacerAntes([...quehacerAntes, nuevoQuehacer.trim()]);
      setNuevoQuehacer("");
    }
  }

  function eliminarQuehacer(index: number) {
    setQuehacerAntes(quehacerAntes.filter((_, i) => i !== index));
  }

  function agregarRecurso() {
    if (nuevoRecurso.trim()) {
      setRecursos([...recursos, nuevoRecurso.trim()]);
      setNuevoRecurso("");
    }
  }

  function eliminarRecurso(index: number) {
    setRecursos(recursos.filter((_, i) => i !== index));
  }

  async function generarRecursosConIA() {
    if (!sesion) return;

    setLoadingIA(true);
    try {
      const response = await instance.post("/ia/generar-recursos-materiales", {
        area: sesion.datosGenerales.area,
        grado: sesion.datosGenerales.grado || "5to",
        competencia: sesion.propositoAprendizaje.competencia,
        duracion: sesion.datosGenerales.duracion,
        propositoSesion: sesion.propositoSesion
      });

      const data = response.data;

      if (data.success && data.data) {
        setQuehacerAntes(data.data.quehacerAntes || []);
        setRecursos(data.data.recursosMateriales || []);
        
        handleToaster("Recursos generados exitosamente con IA", "success");
      }
    } catch (error) {
      console.error("Error al generar recursos con IA:", error);
      handleToaster("Error al generar recursos con IA", "error");
    } finally {
      setLoadingIA(false);
    }
  }

  function handleNextStep() {
    if (quehacerAntes.length === 0) {
      handleToaster("Por favor agrega al menos una acción para 'Antes de la sesión'", "error");
      return;
    }
    if (recursos.length === 0) {
      handleToaster("Por favor agrega al menos un recurso o material", "error");
      return;
    }

    // Actualizar el store
    if (sesion) {
      updateSesion({
        preparacion: {
          quehacerAntes: quehacerAntes,
          recursosMateriales: recursos,
          tipoGraficoPreferido: tipoGraficoPreferido
        } as any
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
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-purple-600 text-xs font-bold">
              6
            </div>
            <span className="text-sm font-semibold tracking-wide">PASO 6 DE 8</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Preparación de la Sesión
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-4">
            Planifica qué hacer antes y qué recursos necesitarás
          </p>
          
          {/* Botón Generar con IA */}
          <Button
            onClick={generarRecursosConIA}
            disabled={loadingIA}
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg"
          >
            <Wand2 className="h-5 w-5 mr-2" />
            {loadingIA ? "Generando con IA..." : "Generar Recursos con IA"}
          </Button>
        </div>

        {/* ¿Qué hacer antes de la sesión? */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              ¿Qué hacer antes de la sesión?
            </CardTitle>
            <CardDescription className="text-base">
              Lista las acciones preparatorias que realizarás antes de la sesión
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lista de acciones */}
            <div className="space-y-3">
              {quehacerAntes.map((accion, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{accion}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarQuehacer(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Agregar nueva acción */}
            <div className="flex gap-3">
              <Input
                placeholder="Ejemplo: Preparar fichas de trabajo, organizar el aula en grupos, revisar PPT"
                value={nuevoQuehacer}
                onChange={(e) => setNuevoQuehacer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && agregarQuehacer()}
                className="flex-1"
              />
              <Button
                onClick={agregarQuehacer}
                disabled={!nuevoQuehacer.trim()}
                className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
              >
                <Plus className="h-5 w-5 mr-2" />
                Agregar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recursos y materiales */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              Recursos y Materiales
            </CardTitle>
            <CardDescription className="text-base">
              Lista los recursos y materiales que necesitarás para la sesión
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lista de recursos */}
            <div className="space-y-3">
              {recursos.map((recurso, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{recurso}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarRecurso(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Agregar nuevo recurso */}
            <div className="flex gap-3">
              <Input
                placeholder="Ejemplo: Cuadernos, plumones, papelógrafos, material concreto (Base 10), fichas"
                value={nuevoRecurso}
                onChange={(e) => setNuevoRecurso(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && agregarRecurso()}
                className="flex-1"
              />
              <Button
                onClick={agregarRecurso}
                disabled={!nuevoRecurso.trim()}
                className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
              >
                <Plus className="h-5 w-5 mr-2" />
                Agregar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Selector de Tipo de Gráfico */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              Tipo de Gráfico para Problemas Matemáticos
            </CardTitle>
            <CardDescription className="text-base">
              Si tu sesión de <strong>{sesion?.datosGenerales?.area || 'Matemática'}</strong> incluye problemas con representaciones visuales, 
              selecciona el tipo de gráfico que mejor se adapte a tu contenido. Esto hará que la IA genere visualizaciones más apropiadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Tipo de Gráfico Preferido
                </label>
                <Select value={tipoGraficoPreferido} onValueChange={setTipoGraficoPreferido}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="🎨 Selecciona un tipo de gráfico o deja en automático..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    <SelectItem value="AUTO" className="font-medium">
                      ✨ Automático - La IA elige el más apropiado
                    </SelectItem>
                    
                    <div className="px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t mt-2">
                      NÚMEROS Y OPERACIONES
                    </div>
                    <SelectItem value={TipoGraficoMatematica.ECUACION_CAJAS}>
                      📦 Ecuación con Cajas · Suma, resta, incógnitas
                    </SelectItem>
                    <SelectItem value={TipoGraficoMatematica.OPERACION_VERTICAL}>
                      ➕ Operación Vertical · Algoritmos con llevadas
                    </SelectItem>
                    <SelectItem value={TipoGraficoMatematica.RECTA_NUMERICA}>
                      📏 Recta Numérica · Secuencias, ubicación
                    </SelectItem>
                    <SelectItem value={TipoGraficoMatematica.BLOQUES_AGRUPADOS}>
                      🧱 Bloques Agrupados · Conteo, agrupación
                    </SelectItem>
                    
                    <div className="px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t mt-2">
                      FRACCIONES
                    </div>
                    <SelectItem value={TipoGraficoMatematica.CIRCULOS_FRACCION}>
                      🍰 Círculos de Fracción · Partes de un todo
                    </SelectItem>
                    <SelectItem value={TipoGraficoMatematica.BARRAS_FRACCION}>
                      📏 Barras de Fracción · Comparación visual
                    </SelectItem>
                    
                    <div className="px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t mt-2">
                      DATOS Y ESTADÍSTICA
                    </div>
                    <SelectItem value={TipoGraficoMatematica.BARRAS_COMPARACION}>
                      📊 Barras de Comparación · Gráficos estadísticos
                    </SelectItem>
                    <SelectItem value={TipoGraficoMatematica.TABLA_VALORES}>
                      📋 Tabla de Valores · Organizar información
                    </SelectItem>
                    <SelectItem value={TipoGraficoMatematica.TABLA_DOBLE_ENTRADA}>
                      📊 Tabla Doble Entrada · Cruce de datos
                    </SelectItem>
                    
                    <div className="px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t mt-2">
                      GEOMETRÍA Y MEDIDAS
                    </div>
                    <SelectItem value={TipoGraficoMatematica.FIGURAS_GEOMETRICAS}>
                      🔷 Figuras Geométricas · Formas planas
                    </SelectItem>
                    <SelectItem value={TipoGraficoMatematica.MEDIDAS_COMPARACION}>
                      📐 Medidas Comparación · Longitud, peso, tiempo
                    </SelectItem>
                    
                    <div className="px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t mt-2">
                      PROBLEMAS COTIDIANOS
                    </div>
                    <SelectItem value={TipoGraficoMatematica.DIAGRAMA_DINERO}>
                      💰 Diagrama de Dinero · Compra-venta, billetes
                    </SelectItem>
                    <SelectItem value={TipoGraficoMatematica.TABLA_PRECIOS}>
                      💵 Tabla de Precios · Cálculo de costos
                    </SelectItem>
                    
                    <div className="px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 border-t mt-2">
                      PENSAMIENTO LÓGICO
                    </div>
                    <SelectItem value={TipoGraficoMatematica.PATRON_VISUAL}>
                      🔄 Patrón Visual · Secuencias, regularidades
                    </SelectItem>
                    <SelectItem value={TipoGraficoMatematica.DIAGRAMA_VENN}>
                      ⭕ Diagrama de Venn · Conjuntos, clasificación
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {tipoGraficoPreferido && (
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-lg border-2 border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                        ✨ Gráfico seleccionado
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                        La IA generará problemas matemáticos usando principalmente <strong>este tipo de visualización</strong>, 
                        haciendo tu sesión más coherente, enfocada y apropiada para el contenido de{' '}
                        <strong>{sesion?.datosGenerales?.area || 'Matemática'}</strong> que estás planificando.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {!tipoGraficoPreferido && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 <strong>Modo automático:</strong> La IA analizará tu competencia y capacidades para elegir 
                    el tipo de gráfico más apropiado automáticamente.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
            onClick={handleNextStep}
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Step7;
