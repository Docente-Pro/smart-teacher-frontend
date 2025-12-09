import { IArea } from "@/interfaces/IArea";
import { IUsuario } from "@/interfaces/IUsuario";
import { getAllAreas } from "@/services/areas.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Activity,
  Palette,
  MessageCircle,
  Globe,
  Calculator,
  Microscope,
  Church,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useSesionStore } from "@/store/sesion.store";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuarioFromState: IUsuario;
}

const tiemposEstudio = [
  {
    id: 1,
    nombre: "Corta",
    descripcion: "30 minutos",
    duracion: "30 minutos",
    icon: Clock,
    gradient: "from-emerald-500 to-teal-500",
    ideal: "Ideal para repaso rápido",
  },
  {
    id: 2,
    nombre: "Media",
    descripcion: "1 hora",
    duracion: "60 minutos",
    icon: Clock,
    gradient: "from-blue-500 to-cyan-500",
    ideal: "Perfecta para aprender nuevos temas",
  },
  {
    id: 3,
    nombre: "Larga",
    descripcion: "2 horas",
    duracion: "120 minutos",
    icon: Clock,
    gradient: "from-purple-500 to-pink-500",
    ideal: "Sesión profunda de estudio",
  },
];

const areaIcons: { [key: string]: any } = {
  "Personal Social": Users,
  "Educación Física": Activity,
  "Arte y Cultura": Palette,
  Comunicación: MessageCircle,
  Inglés: Globe,
  Matemática: Calculator,
  "Ciencia y Tecnología": Microscope,
  "Educación Religiosa": Church,
};

const areaGradients: { [key: string]: string } = {
  "Personal Social": "from-blue-500 to-cyan-500",
  "Educación Física": "from-green-500 to-emerald-500",
  "Arte y Cultura": "from-purple-500 to-pink-500",
  Comunicación: "from-orange-500 to-red-500",
  Inglés: "from-indigo-500 to-blue-500",
  Matemática: "from-yellow-500 to-orange-500",
  "Ciencia y Tecnología": "from-teal-500 to-green-500",
  "Educación Religiosa": "from-amber-500 to-yellow-500",
};

function Step1({ pagina, setPagina, usuarioFromState }: Props) {
  const { sesion, updateSesion } = useSesionStore();
  const [areas, setAreas] = useState<IArea[]>([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState<string>("");
  const [duracionSeleccionada, setDuracionSeleccionada] = useState<string>("");
  const { showLoading, hideLoading } = useGlobalLoading();

  useEffect(() => {
    async function cargarAreas() {
      showLoading("Cargando áreas...");
      try {
        const response = await getAllAreas();
        setAreas(response.data.data || response.data);
      } catch (error) {
        handleToaster("Error al cargar las áreas", "error");
      } finally {
        hideLoading();
      }
    }

    cargarAreas();
  }, []);

  // Inicializar desde el store si ya hay datos
  useEffect(() => {
    if (sesion) {
      setAreaSeleccionada(sesion.datosGenerales.area || "");
      setDuracionSeleccionada(sesion.datosGenerales.duracion || "");
    }
  }, [sesion]);

  function handleAreaClick(areaNombre: string) {
    setAreaSeleccionada(areaNombre);
    if (sesion) {
      updateSesion({
        datosGenerales: {
          ...sesion.datosGenerales,
          area: areaNombre,
        },
      });
    }
  }

  function handleDuracionClick(duracion: string) {
    setDuracionSeleccionada(duracion);
    if (sesion) {
      updateSesion({
        datosGenerales: {
          ...sesion.datosGenerales,
          duracion: duracion,
        },
      });
    }
  }

  function handleNextStep() {
    if (areaSeleccionada && duracionSeleccionada) {
      setPagina(pagina + 1);
    } else {
      handleToaster("Por favor selecciona un área y un tiempo de estudio", "error");
    }
  }

  function getAreaIcon(areaNombre: string) {
    const key = Object.keys(areaIcons).find((k) => areaNombre.includes(k));
    return key ? areaIcons[key] : Users;
  }

  function getAreaGradient(areaNombre: string) {
    const key = Object.keys(areaGradients).find((k) => areaNombre.includes(k));
    return key ? areaGradients[key] : "from-dp-blue-500 to-dp-orange-500";
  }

  if (!sesion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header con animación */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg mb-6 shadow-lg">
            <Sparkles className="h-4 w-4" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-indigo-600 text-xs font-bold">1</div>
            <span className="text-sm font-semibold tracking-wide">PASO 1 DE 9</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Crear Sesión de Aprendizaje
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Hola <span className="font-bold text-slate-900 dark:text-white">{usuarioFromState.nombre}</span>, vamos a crear una sesión
            personalizada para ti
          </p>
        </div>

        {/* Selección de Área */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              Selecciona el área curricular
            </CardTitle>
            <CardDescription className="text-base">Elige el área en la que deseas crear tu sesión de aprendizaje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {areas.map((area) => {
                const IconComponent = getAreaIcon(area.nombre);
                const gradient = getAreaGradient(area.nombre);
                const isSelected = areaSeleccionada === area.nombre;

                return (
                  <div
                    key={area.id}
                    onClick={() => handleAreaClick(area.nombre)}
                    className={`
                      group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300
                      ${
                        isSelected
                          ? "ring-4 ring-dp-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-2xl"
                          : "hover:scale-105 hover:shadow-xl border-2 border-slate-200 dark:border-slate-700"
                      }
                    `}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-opacity duration-300 ${
                        isSelected ? "opacity-100" : "opacity-80 group-hover:opacity-90"
                      }`}
                    />

                    <div className="relative p-6 flex flex-col items-center gap-3 text-white">
                      <div
                        className={`p-3 bg-white/20 backdrop-blur-sm rounded-lg transition-transform duration-300 ${
                          isSelected ? "scale-110" : "group-hover:scale-110"
                        }`}
                      >
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-bold text-center leading-tight">{area.nombre.replace("Área de ", "")}</p>

                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg">
                          <CheckCircle2 className="h-5 w-5 text-dp-blue-600" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selección de Duración */}
        <Card className="mb-8 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              Selecciona la duración de la sesión
            </CardTitle>
            <CardDescription className="text-base">Elige cuánto tiempo quieres dedicar al aprendizaje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiemposEstudio.map((tiempo) => {
                const isSelected = duracionSeleccionada === tiempo.duracion;

                return (
                  <div
                    key={tiempo.id}
                    onClick={() => handleDuracionClick(tiempo.duracion)}
                    className={`
                      group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300
                      ${
                        isSelected
                          ? "ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-2xl"
                          : "hover:scale-105 hover:shadow-xl border-2 border-slate-200 dark:border-slate-700"
                      }
                    `}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${tiempo.gradient} transition-opacity duration-300 ${
                        isSelected ? "opacity-100" : "opacity-10 group-hover:opacity-20"
                      }`}
                    />

                    <div className="relative p-8">
                      <div className="flex flex-col items-center gap-4">
                        <div
                          className={`p-4 rounded-full transition-all duration-300 ${
                            isSelected ? "bg-white/90 shadow-lg" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-white/20"
                          }`}
                        >
                          <Clock
                            className={`h-8 w-8 transition-colors duration-300 ${
                              isSelected ? "text-blue-600" : "text-slate-600 dark:text-slate-400 group-hover:text-white"
                            }`}
                          />
                        </div>
                        <div className="text-center">
                          <h3
                            className={`text-2xl font-bold mb-1 transition-colors duration-300 ${
                              isSelected ? "text-white" : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {tiempo.nombre}
                          </h3>
                          <p
                            className={`text-3xl font-extrabold mb-2 transition-colors duration-300 ${
                              isSelected ? "text-white" : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {tiempo.descripcion}
                          </p>
                          <p
                            className={`text-sm transition-colors duration-300 ${
                              isSelected ? "text-white/90 font-medium" : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {tiempo.ideal}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-lg">
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Botón de continuar */}
        <div className="flex justify-end">
          <Button
            onClick={handleNextStep}
            disabled={!areaSeleccionada || !duracionSeleccionada}
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Step1;
