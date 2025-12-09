import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth0 } from "@/hooks/useAuth0";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { 
  FileText, 
  Search, 
  Calendar, 
  Clock, 
  BookOpen, 
  Download, 
  Eye, 
  Trash2,
  Filter,
  Plus,
  ArrowLeft
} from "lucide-react";

interface ISesion {
  id: string;
  titulo: string;
  area: string;
  competencia: string;
  grado: string;
  duracion: string;
  fechaCreacion: string;
  criterios: string[];
}

function MisSesiones() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [sesiones, setSesiones] = useState<ISesion[]>([]);
  const [filteredSesiones, setFilteredSesiones] = useState<ISesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArea, setFilterArea] = useState("todas");

  useEffect(() => {
    async function cargarSesiones() {
      setLoading(true);
      try {
        // TODO: Implementar llamada al backend
        // const response = await instance.get(`/sesiones/usuario/${user?.id}`);
        // setSesiones(response.data.data);
        
        // Datos de ejemplo mientras se implementa el backend
        const sesionesMock: ISesion[] = [
          {
            id: "1",
            titulo: "Resolviendo problemas de cantidad",
            area: "Matemática",
            competencia: "Resuelve problemas de cantidad",
            grado: "2do Grado",
            duracion: "1 hora",
            fechaCreacion: "2024-12-01",
            criterios: ["Traduce cantidades", "Comunica comprensión"]
          },
          {
            id: "2",
            titulo: "Explorando el mundo físico",
            area: "Ciencia y Tecnología",
            competencia: "Explica el mundo físico",
            grado: "2do Grado",
            duracion: "2 horas",
            fechaCreacion: "2024-11-28",
            criterios: ["Indaga", "Explica fenómenos"]
          },
        ];
        
        setSesiones(sesionesMock);
        setFilteredSesiones(sesionesMock);
      } catch (error) {
        console.error("Error al cargar sesiones:", error);
        handleToaster("Error al cargar las sesiones", "error");
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      cargarSesiones();
    }
  }, [user?.id]);

  useEffect(() => {
    let filtered = sesiones;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (sesion) =>
          sesion.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sesion.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sesion.competencia.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por área
    if (filterArea !== "todas") {
      filtered = filtered.filter((sesion) => sesion.area === filterArea);
    }

    setFilteredSesiones(filtered);
  }, [searchTerm, filterArea, sesiones]);

  const areas = ["todas", ...new Set(sesiones.map((s) => s.area))];

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
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Mis Sesiones
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Gestiona todas tus sesiones de aprendizaje creadas
              </p>
            </div>
            <Button
              onClick={() => navigate("/crear-sesion")}
              className="bg-gradient-to-r from-dp-blue-500 to-dp-orange-500 hover:from-dp-blue-600 hover:to-dp-orange-600 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Sesión
            </Button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por título, área o competencia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro por área */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-dp-blue-500"
                >
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area === "todas" ? "Todas las áreas" : area}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de sesiones */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-2 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-10 w-full mt-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSesiones.length === 0 ? (
          <Card className="border-2 border-slate-200 dark:border-slate-700">
            <CardContent className="py-16 text-center">
              <FileText className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No se encontraron sesiones
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchTerm || filterArea !== "todas"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primera sesión de aprendizaje"}
              </p>
              {!searchTerm && filterArea === "todas" && (
                <Button
                  onClick={() => navigate("/crear-sesion")}
                  className="bg-gradient-to-r from-dp-blue-500 to-dp-orange-500 hover:from-dp-blue-600 hover:to-dp-orange-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Sesión
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSesiones.map((sesion) => (
              <Card
                key={sesion.id}
                className="group hover:shadow-xl transition-all duration-300 border-2 border-slate-200 dark:border-slate-700 hover:border-dp-blue-400 dark:hover:border-dp-blue-500"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-dp-blue-600 dark:group-hover:text-dp-blue-400 transition-colors">
                        {sesion.titulo}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {sesion.area}
                      </CardDescription>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-dp-blue-500 to-dp-orange-500 rounded-lg">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Información de la sesión */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <BookOpen className="h-4 w-4" />
                      <span className="line-clamp-1">{sesion.competencia}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span>{sesion.grado}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>{sesion.duracion}</span>
                    </div>
                  </div>

                  {/* Criterios */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Criterios de evaluación:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {sesion.criterios.slice(0, 2).map((criterio, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded-full text-slate-700 dark:text-slate-300"
                        >
                          {criterio}
                        </span>
                      ))}
                      {sesion.criterios.length > 2 && (
                        <span className="px-2 py-1 bg-dp-blue-100 dark:bg-dp-blue-900 text-xs rounded-full text-dp-blue-700 dark:text-dp-blue-300 font-semibold">
                          +{sesion.criterios.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleToaster("Función en desarrollo", "info")}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToaster("Función en desarrollo", "info")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => handleToaster("Función en desarrollo", "info")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Estadísticas */}
        {!loading && sesiones.length > 0 && (
          <Card className="mt-8 border-2 border-slate-200 dark:border-slate-700 shadow-lg">
            <CardContent className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Total de sesiones
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {sesiones.length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Sesiones este mes
                  </p>
                  <p className="text-3xl font-bold text-dp-blue-600 dark:text-dp-blue-400">
                    {sesiones.filter(s => new Date(s.fechaCreacion).getMonth() === new Date().getMonth()).length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Sesiones restantes
                  </p>
                  <p className="text-3xl font-bold text-dp-orange-600 dark:text-dp-orange-400">
                    {user?.sesionesRestantes || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default MisSesiones;
