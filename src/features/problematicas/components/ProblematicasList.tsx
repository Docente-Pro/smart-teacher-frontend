import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProblematicas } from "../hooks/useProblematicas";
import { TipoProblematica } from "../interfaces/problematica.interface";
import { Search, Plus, Users, BookOpen, X } from "lucide-react";

interface ProblematicasListProps {
  tipo?: TipoProblematica;
  usuarioId?: string;
  onSelect?: (id: number) => void;
  showCreateButton?: boolean;
  showSearch?: boolean;
}

/**
 * Componente para mostrar lista de problemáticas con búsqueda y filtros
 * Soporta infinite scroll y paginación
 */
function ProblematicasList({
  tipo = "todas",
  usuarioId,
  onSelect,
  showCreateButton = false,
  showSearch = true,
}: ProblematicasListProps) {
  const {
    problematicas,
    loading,
    pagination,
    loadAll,
    loadByUsuario,
    searchProblematicas,
    loadMore,
  } = useProblematicas();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Cargar inicial
  useEffect(() => {
    if (usuarioId) {
      loadByUsuario(usuarioId, { tipo, page: 1, limit: 20 });
    } else {
      loadAll({ tipo, page: 1, limit: 20 });
    }
  }, [tipo, usuarioId, loadAll, loadByUsuario]);

  // Búsqueda con debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      searchProblematicas(searchTerm, { tipo, page: 1, limit: 20 });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, tipo, searchProblematicas]);

  function handleClearSearch() {
    setSearchTerm("");
    setIsSearching(false);
    if (usuarioId) {
      loadByUsuario(usuarioId, { tipo, page: 1, limit: 20 });
    } else {
      loadAll({ tipo, page: 1, limit: 20 });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda */}
      {showSearch && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar problemáticas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {showCreateButton && (
            <Button className="bg-gradient-to-r from-dp-blue-500 to-dp-orange-500 hover:from-dp-blue-600 hover:to-dp-orange-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Crear Problemática
            </Button>
          )}
        </div>
      )}

      {/* Lista de problemáticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && problematicas.length === 0 ? (
          // Skeleton loading
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </>
        ) : problematicas.length === 0 ? (
          // Estado vacío
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {isSearching ? "No se encontraron resultados" : "No hay problemáticas disponibles"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {isSearching
                ? "Intenta con otros términos de búsqueda"
                : "Comienza creando tu primera problemática"}
            </p>
          </div>
        ) : (
          // Problemáticas
          problematicas.map((problematica) => (
            <Card
              key={problematica.id}
              className={`
                border-2 transition-all duration-200 
                ${
                  onSelect
                    ? "cursor-pointer hover:shadow-lg hover:border-dp-blue-400 dark:hover:border-dp-blue-500"
                    : ""
                }
              `}
              onClick={() => onSelect?.(problematica.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-lg line-clamp-2">
                    {problematica.nombre}
                  </CardTitle>
                  {problematica.esPersonalizada && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full whitespace-nowrap">
                      Personalizada
                    </span>
                  )}
                </div>
                <CardDescription className="line-clamp-3">
                  {problematica.descripcion}
                </CardDescription>
              </CardHeader>

              {problematica._count && (
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    {problematica._count.usuarios !== undefined && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{problematica._count.usuarios} usuarios</span>
                      </div>
                    )}
                    {problematica._count.sesiones !== undefined && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{problematica._count.sesiones} sesiones</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Botón de cargar más */}
      {pagination?.hasMore && (
        <div className="text-center">
          <Button
            onClick={() => loadMore({ tipo })}
            disabled={loading}
            variant="outline"
          >
            {loading ? "Cargando..." : "Cargar más"}
          </Button>
        </div>
      )}

      {/* Info de paginación */}
      {pagination && !loading && (
        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          Mostrando {problematicas.length} de {pagination.total} problemáticas
        </div>
      )}
    </div>
  );
}

export default ProblematicasList;
