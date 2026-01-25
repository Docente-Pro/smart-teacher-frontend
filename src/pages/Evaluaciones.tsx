import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@/hooks/useAuth0";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { 
  BarChart3, 
  Plus, 
  ArrowLeft,
  FileCheck,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

function Evaluaciones() {
  const { user: _user } = useAuth0();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<"crear" | "historial">("crear");

  const tiposEvaluacion = [
    {
      id: "diagnostica",
      titulo: "Evaluación Diagnóstica",
      descripcion: "Identifica conocimientos previos al inicio de una unidad",
      icon: AlertCircle,
      gradient: "from-blue-500 to-cyan-500",
      disponible: true
    },
    {
      id: "formativa",
      titulo: "Evaluación Formativa",
      descripcion: "Seguimiento continuo del proceso de aprendizaje",
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      disponible: true
    },
    {
      id: "sumativa",
      titulo: "Evaluación Sumativa",
      descripcion: "Valora el logro de competencias al final del periodo",
      icon: CheckCircle2,
      gradient: "from-purple-500 to-pink-500",
      disponible: true
    },
  ];

  const evaluacionesRecientes = [
    {
      id: "1",
      titulo: "Evaluación de Matemática - Números",
      tipo: "Formativa",
      fecha: "2024-12-01",
      estudiantes: 25,
      promedio: 85,
      estado: "completada"
    },
    {
      id: "2", 
      titulo: "Diagnóstico de Ciencias",
      tipo: "Diagnóstica",
      fecha: "2024-11-28",
      estudiantes: 25,
      promedio: 72,
      estado: "completada"
    },
    {
      id: "3",
      titulo: "Evaluación Final - Comunicación",
      tipo: "Sumativa",
      fecha: "2024-11-25",
      estudiantes: 25,
      promedio: 78,
      estado: "en_proceso"
    },
  ];

  function handleCrearEvaluacion(tipo: string) {
    handleToaster(`Creando evaluación ${tipo}...`, "info");
    // TODO: Implementar navegación a formulario de creación
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Evaluaciones
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Crea y gestiona evaluaciones para tus estudiantes
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b-2 border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSelectedTab("crear")}
              className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 -mb-0.5 ${
                selectedTab === "crear"
                  ? "border-dp-blue-500 text-dp-blue-600 dark:text-dp-blue-400"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Crear Evaluación
            </button>
            <button
              onClick={() => setSelectedTab("historial")}
              className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 -mb-0.5 ${
                selectedTab === "historial"
                  ? "border-dp-blue-500 text-dp-blue-600 dark:text-dp-blue-400"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileCheck className="h-4 w-4 inline mr-2" />
              Historial
            </button>
          </div>
        </div>

        {/* Contenido según tab seleccionado */}
        {selectedTab === "crear" ? (
          <div>
            {/* Tipos de evaluación */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Selecciona el tipo de evaluación
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tiposEvaluacion.map((tipo) => {
                  const IconComponent = tipo.icon;
                  
                  return (
                    <Card
                      key={tipo.id}
                      className={`group cursor-pointer border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                        tipo.disponible
                          ? "border-slate-200 dark:border-slate-700 hover:border-dp-blue-400 dark:hover:border-dp-blue-500"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() => tipo.disponible && handleCrearEvaluacion(tipo.titulo)}
                    >
                      {/* Gradiente de fondo */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${tipo.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg`} />
                      
                      <CardHeader className="relative">
                        <div className={`h-16 w-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${tipo.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-center text-xl font-bold text-slate-900 dark:text-white group-hover:text-dp-blue-600 dark:group-hover:text-dp-blue-400 transition-colors">
                          {tipo.titulo}
                        </CardTitle>
                        <CardDescription className="text-center">
                          {tipo.descripcion}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative text-center">
                        <Button
                          className={`w-full bg-gradient-to-r ${tipo.gradient} hover:opacity-90 text-white font-semibold shadow-lg`}
                          disabled={!tipo.disponible}
                        >
                          {tipo.disponible ? "Crear ahora" : "Próximamente"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Guía rápida */}
            <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileCheck className="h-6 w-6 text-dp-blue-600 dark:text-dp-blue-400" />
                  ¿Cómo crear una evaluación?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="h-12 w-12 mx-auto mb-3 bg-gradient-to-br from-dp-blue-500 to-dp-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      1
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Selecciona el tipo
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Elige entre diagnóstica, formativa o sumativa
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 mx-auto mb-3 bg-gradient-to-br from-dp-blue-500 to-dp-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      2
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Configura la evaluación
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Define criterios, competencias y preguntas
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 mx-auto mb-3 bg-gradient-to-br from-dp-blue-500 to-dp-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      3
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Genera y aplica
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Descarga o imprime para usar con tus estudiantes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-2 border-slate-200 dark:border-slate-700">
                <CardContent className="pt-6 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto text-dp-blue-600 dark:text-dp-blue-400 mb-2" />
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {evaluacionesRecientes.length}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Total evaluaciones
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-slate-200 dark:border-slate-700">
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {evaluacionesRecientes.filter(e => e.estado === "completada").length}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Completadas
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-slate-200 dark:border-slate-700">
                <CardContent className="pt-6 text-center">
                  <Clock className="h-8 w-8 mx-auto text-amber-600 dark:text-amber-400 mb-2" />
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {evaluacionesRecientes.filter(e => e.estado === "en_proceso").length}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    En proceso
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-slate-200 dark:border-slate-700">
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {Math.round(evaluacionesRecientes.reduce((acc, e) => acc + e.promedio, 0) / evaluacionesRecientes.length)}%
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Promedio general
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de evaluaciones */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Evaluaciones recientes
              </h2>
              {evaluacionesRecientes.map((evaluacion) => (
                <Card
                  key={evaluacion.id}
                  className="border-2 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300"
                >
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-gradient-to-br from-dp-blue-500 to-dp-orange-500 rounded-lg">
                          <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                            {evaluacion.titulo}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <FileCheck className="h-4 w-4" />
                              {evaluacion.tipo}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(evaluacion.fecha).toLocaleDateString('es-ES')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {evaluacion.estudiantes} estudiantes
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-dp-blue-600 dark:text-dp-blue-400">
                            {evaluacion.promedio}%
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Promedio
                          </p>
                        </div>
                        <div>
                          {evaluacion.estado === "completada" ? (
                            <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                              Completada
                            </span>
                          ) : (
                            <span className="px-4 py-2 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium">
                              En proceso
                            </span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleToaster("Función en desarrollo", "info")}
                        >
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {evaluacionesRecientes.length === 0 && (
                <Card className="border-2 border-slate-200 dark:border-slate-700">
                  <CardContent className="py-16 text-center">
                    <BarChart3 className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      No hay evaluaciones aún
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Crea tu primera evaluación para comenzar
                    </p>
                    <Button
                      onClick={() => setSelectedTab("crear")}
                      className="bg-gradient-to-r from-dp-blue-500 to-dp-orange-500 hover:from-dp-blue-600 hover:to-dp-orange-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Evaluación
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Evaluaciones;
