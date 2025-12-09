import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IArea } from "@/interfaces/IArea";
import { getAllAreas } from "@/services/areas.service";
import { normalizeWord } from "@/utils/normalizeWord";
import { useAuth0 } from "@/hooks/useAuth0";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Search, X, BookOpen, Users, Activity, Palette, MessageCircle, Globe, Calculator, Microscope, Church, ChevronDown, ChevronUp } from "lucide-react";

const areaIcons: { [key: string]: any } = {
  "Personal Social": Users,
  "Educación Física": Activity,
  "Arte y Cultura": Palette,
  "Comunicación": MessageCircle,
  "Inglés": Globe,
  "Matemática": Calculator,
  "Ciencia y Tecnología": Microscope,
  "Educación Religiosa": Church,
};

const areaGradients: { [key: string]: string } = {
  "Personal Social": "from-blue-500 to-cyan-500",
  "Educación Física": "from-green-500 to-emerald-500",
  "Arte y Cultura": "from-purple-500 to-pink-500",
  "Comunicación": "from-orange-500 to-red-500",
  "Inglés": "from-indigo-500 to-blue-500",
  "Matemática": "from-yellow-500 to-orange-500",
  "Ciencia y Tecnología": "from-teal-500 to-green-500",
  "Educación Religiosa": "from-amber-500 to-yellow-500",
};

function Areas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [areas, setAreas] = useState<IArea[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<IArea[]>([]);
  const [expandedArea, setExpandedArea] = useState<number | null>(null);
  const { user } = useAuth0();
  const { showLoading, hideLoading } = useGlobalLoading();
  const navigate = useNavigate();

  useEffect(() => {
    async function cargarAreas() {
      showLoading("Cargando áreas curriculares...");
      
      try {
        const response = await getAllAreas();
        const areasData = response.data.data || response.data;
        setAreas(areasData);
        setFilteredAreas(areasData);
      } catch (error) {
        console.error("Error al cargar áreas:", error);
        handleToaster("Error al cargar las áreas", "error");
      } finally {
        hideLoading();
      }
    }

    cargarAreas();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAreas(areas);
    } else {
      const filtered = areas.filter((area) =>
        normalizeWord(area.nombre).toLowerCase().includes(normalizeWord(searchTerm).toLowerCase())
      );
      setFilteredAreas(filtered);
    }
  }, [searchTerm, areas]);

  function getAreaIcon(areaNombre: string) {
    const key = Object.keys(areaIcons).find((k) => areaNombre.includes(k));
    return key ? areaIcons[key] : BookOpen;
  }

  function getAreaGradient(areaNombre: string) {
    const key = Object.keys(areaGradients).find((k) => areaNombre.includes(k));
    return key ? areaGradients[key] : "from-dp-blue-500 to-dp-orange-500";
  }

  function toggleExpandArea(areaId: number) {
    setExpandedArea(expandedArea === areaId ? null : areaId);
  }

  function handleSelectArea(area: IArea) {
    navigate(`/competencias?area=${area.id}&nombre=${encodeURIComponent(area.nombre)}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Áreas Curriculares
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Selecciona un área para crear una sesión de aprendizaje
          </p>
        </div>

        {/* Buscador */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar área curricular..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 h-12 text-lg border-2 border-slate-200 dark:border-slate-700 focus:border-dp-blue-500 dark:focus:border-dp-blue-400"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Grid de Áreas */}
        {filteredAreas.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-xl text-slate-500 dark:text-slate-400">
              No se encontraron áreas
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAreas.map((area) => {
              const IconComponent = getAreaIcon(area.nombre);
              const gradient = getAreaGradient(area.nombre);
              const isExpanded = expandedArea === area.id;

              return (
                <Card
                  key={area.id}
                  className="group relative overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-dp-blue-400 dark:hover:border-dp-blue-500 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
                >
                  {/* Gradiente de fondo */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  <CardHeader className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-dp-blue-600 dark:group-hover:text-dp-blue-400 transition-colors">
                            {area.nombre.replace("Área de ", "")}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {area.competencias?.length || 0} competencia{area.competencias?.length !== 1 ? "s" : ""}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative space-y-3">
                    {/* Botón para expandir competencias */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpandArea(area.id)}
                      className="w-full justify-between"
                    >
                      <span className="text-sm font-medium">
                        {isExpanded ? "Ocultar" : "Ver"} competencias
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Lista de competencias expandible */}
                    {isExpanded && area.competencias && (
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2">
                        {area.competencias.map((competencia) => (
                          <div
                            key={competencia.id}
                            className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-dp-blue-400 dark:hover:border-dp-blue-500 transition-colors"
                          >
                            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                              {competencia.nombre}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                              {competencia.descripcion}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Botón de selección */}
                    <Button
                      onClick={() => handleSelectArea(area)}
                      className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      Seleccionar área
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total de áreas</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{filteredAreas.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Usuario</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Plan</p>
              <p className="text-lg font-semibold text-dp-blue-600 dark:text-dp-blue-400 uppercase">
                {user?.plan || "free"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Areas;
