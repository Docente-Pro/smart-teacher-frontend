import { useState, useEffect, useCallback } from "react";
import ReusableModal from "@/components/Shared/Modal/ReusableModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProblematicas } from "@/features/problematicas/hooks/useProblematicas";
import CreateEditProblematicaModal from "@/features/problematicas/components/CreateEditProblematicaModal";
import type { Problematica } from "@/features/problematicas/interfaces/problematica.interface";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Edit2,
  Plus,
  Search,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (problematica: { id: number; nombre: string; descripcion: string }) => void;
  selectedId?: number | null;
}

/**
 * Modal para seleccionar o crear una problemática dentro del wizard de Unidad.
 * A diferencia de ProblematicaModal (onboarding), este NO llama /seleccionar.
 * Solo devuelve la problemática elegida para que Step1 la use.
 */
function SelectProblematicaModal({ isOpen, onClose, onSelect, selectedId }: Props) {
  const { problematicas, loading, loadRecomendadas, searchProblematicas } = useProblematicas();

  const [selected, setSelected] = useState<number | null>(selectedId ?? null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [problematicaToEdit, setProblematicaToEdit] = useState<Problematica | null>(null);

  // Cargar recomendadas al abrir
  useEffect(() => {
    if (isOpen) {
      loadRecomendadas();
      setSelected(selectedId ?? null);
      setSearchQuery("");
    }
  }, [isOpen, loadRecomendadas, selectedId]);

  // Búsqueda con debounce
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.trim().length >= 2) {
        searchProblematicas(query.trim());
      } else if (query.trim().length === 0) {
        loadRecomendadas();
      }
    },
    [searchProblematicas, loadRecomendadas]
  );

  function handleConfirm() {
    const found = problematicas.find((p) => p.id === selected);
    if (found) {
      onSelect({ id: found.id, nombre: found.nombre, descripcion: found.descripcion });
    }
  }

  return (
    <>
      <ReusableModal
        isOpen={isOpen}
        onClose={onClose}
        title="Seleccionar Problemática"
        size="xl"
        gradient="amber-orange"
        showCloseButton
        closeOnOverlayClick
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(true);
                setProblematicaToEdit(null);
              }}
              className="mr-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Nueva
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selected}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-6"
            >
              Seleccionar
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Info */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-0.5">
                Elige la problemática para esta unidad
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                La IA utilizará esta problemática como contexto para generar toda la unidad de aprendizaje.
                Puedes seleccionar una existente o crear una nueva.
              </p>
            </div>
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar problemáticas..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Grid de problemáticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
            {loading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-lg" />
                ))}
              </>
            ) : problematicas.length === 0 ? (
              <div className="col-span-full text-center py-10 text-slate-500 dark:text-slate-400">
                <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No se encontraron problemáticas.</p>
                <Button
                  variant="link"
                  className="mt-2 text-amber-600"
                  onClick={() => {
                    setShowCreateModal(true);
                    setProblematicaToEdit(null);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Crear una nueva
                </Button>
              </div>
            ) : (
              problematicas.map((problematica) => {
                const isSelected = selected === problematica.id;

                return (
                  <div key={problematica.id} className="relative group">
                    <button
                      onClick={() => setSelected(problematica.id)}
                      className={`
                        w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 h-full
                        ${
                          isSelected
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-lg ring-2 ring-amber-300 dark:ring-amber-700"
                            : "border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-md"
                        }
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start gap-2 mb-2">
                          {/* Radio visual */}
                          <div
                            className={`
                              flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5
                              ${
                                isSelected
                                  ? "border-amber-500 bg-amber-500"
                                  : "border-slate-300 dark:border-slate-600"
                              }
                            `}
                          >
                            {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                          </div>

                          <h5
                            className={`
                              font-semibold text-sm flex-1 leading-tight
                              ${
                                isSelected
                                  ? "text-amber-700 dark:text-amber-400"
                                  : "text-slate-900 dark:text-white"
                              }
                            `}
                          >
                            {problematica.nombre}
                          </h5>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 ml-7">
                          {problematica.descripcion}
                        </p>

                        {/* Badges */}
                        <div className="flex items-center gap-2 mt-auto pt-2 ml-7">
                          {problematica.esPersonalizada && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                              <Sparkles className="h-3 w-3" /> Personalizada
                            </span>
                          )}
                          {problematica._count?.usuarios && problematica._count.usuarios > 0 && (
                            <span className="text-[10px] text-slate-400">
                              {problematica._count.usuarios} docentes
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Editar / personalizar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProblematicaToEdit(problematica);
                        setShowCreateModal(true);
                      }}
                      className="
                        absolute top-2 right-2 p-1.5 rounded-lg
                        bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20
                        shadow-sm
                      "
                      title="Personalizar esta problemática"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </ReusableModal>

      {/* Modal crear/editar */}
      <CreateEditProblematicaModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setProblematicaToEdit(null);
        }}
        basadaEn={problematicaToEdit}
        onSuccess={(created) => {
          // Seleccionar la recién creada y devolver
          setShowCreateModal(false);
          setProblematicaToEdit(null);
          onSelect({ id: created.id, nombre: created.nombre, descripcion: created.descripcion });
        }}
      />
    </>
  );
}

export default SelectProblematicaModal;
