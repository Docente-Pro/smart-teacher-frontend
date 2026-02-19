import { useState, useEffect } from "react";
import ReusableModal from "@/components/Shared/Modal/ReusableModal";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { problematicaApiService } from "@/features/problematicas/services/problematica-api.service";
import { useProblematicas } from "@/features/problematicas/hooks/useProblematicas";
import CreateEditProblematicaModal from "@/features/problematicas/components/CreateEditProblematicaModal";
import { Problematica } from "@/features/problematicas/interfaces/problematica.interface";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertCircle, Edit2, Plus } from "lucide-react";

interface ProblematicaModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
}

/**
 * Modal para seleccionar la problemática del usuario
 * Se muestra cuando problematicaCompleta === false
 */
function ProblematicaModal({ isOpen, onComplete, onClose }: ProblematicaModalProps) {
  const { user, updateUser } = useAuthStore();
  const { showLoading, hideLoading } = useGlobalLoading();
  const { problematicas, loading, loadRecomendadas } = useProblematicas();

  const [selectedProblematica, setSelectedProblematica] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [problematicaToEdit, setProblematicaToEdit] = useState<Problematica | null>(null);

  // Cargar problemáticas recomendadas del backend
  useEffect(() => {
    if (isOpen) {
      loadRecomendadas();
      setSelectedProblematica(null);
    }
  }, [isOpen, loadRecomendadas]);

  async function handleGuardar() {
    if (!selectedProblematica || !user?.id) {
      handleToaster("Por favor, selecciona una problemática", "warning");
      return;
    }

    setSaving(true);
    showLoading("Guardando problemática...");

    try {
      // POST a /problematica/seleccionar con problematicaId
      // El backend automáticamente actualiza problematicaCompleta = true
      await problematicaApiService.seleccionar({
        problematicaId: selectedProblematica,
      });

      // Actualizar el store local con problematicaCompleta = true
      updateUser({
        problematicaCompleta: true,
      });

      handleToaster("¡Problemática guardada exitosamente!", "success");
      
      // Llamar callback para continuar con el flujo
      onComplete();
    } catch (error: any) {
      console.error("Error al guardar problemática:", error);
      handleToaster(
        error.response?.data?.message || "Error al guardar la problemática",
        "error"
      );
    } finally {
      setSaving(false);
      hideLoading();
    }
  }

  return (
    <>
      <ReusableModal
        isOpen={isOpen}
        onClose={() => onClose?.()}
        title="Completa tu perfil"
        size="xl"
        gradient="blue-orange"
        showCloseButton={!!onClose}
        closeOnOverlayClick={!!onClose}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(true)}
              className="mr-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Nueva
            </Button>
            <Button
              onClick={handleGuardar}
              disabled={!selectedProblematica || saving}
              className="bg-gradient-to-r from-dp-blue-500 to-dp-orange-500 hover:from-dp-blue-600 hover:to-dp-orange-600 text-white font-semibold px-6"
            >
              {saving ? "Guardando..." : "Continuar"}
            </Button>
          </>
        }
      >
      <div className="space-y-6">
        {/* Introducción */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-dp-blue-500 rounded-lg">
          <AlertCircle className="h-5 w-5 text-dp-blue-600 dark:text-dp-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              Antes de crear tu sesión
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Necesitamos conocer la problemática principal que quieres abordar en tus sesiones de aprendizaje.
              Esto nos ayudará a generar contenido más relevante y personalizado.
            </p>
          </div>
        </div>

        {/* Lista de problemáticas */}
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
            Selecciona la problemática principal:
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {loading ? (
              // Skeleton loading
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </>
            ) : problematicas.length === 0 ? (
              // Estado vacío
              <div className="col-span-full text-center py-8 text-slate-500 dark:text-slate-400">
                <p>No se encontraron problemáticas disponibles.</p>
              </div>
            ) : (
              // Lista de problemáticas
              problematicas.map((problematica) => {
                const isSelected = selectedProblematica === problematica.id;

                return (
                  <div key={problematica.id} className="relative group">
                    <button
                      onClick={() => setSelectedProblematica(problematica.id)}
                      className={`
                        w-full text-left p-3 rounded-lg border-2 transition-all duration-200 h-full
                        ${
                          isSelected
                            ? "border-dp-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                            : "border-slate-200 dark:border-slate-700 hover:border-dp-blue-300 dark:hover:border-dp-blue-600 hover:shadow-md"
                        }
                      `}
                    >
                      <div className="flex flex-col h-full">
                        {/* Header con indicador */}
                        <div className="flex items-start gap-2 mb-2">
                          {/* Indicador de selección */}
                          <div
                            className={`
                              flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                              ${
                                isSelected
                                  ? "border-dp-blue-500 bg-dp-blue-500"
                                  : "border-slate-300 dark:border-slate-600"
                              }
                            `}
                          >
                            {isSelected && (
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            )}
                          </div>

                          {/* Título */}
                          <h5
                            className={`
                              font-semibold text-sm flex-1 leading-tight
                              ${
                                isSelected
                                  ? "text-dp-blue-700 dark:text-dp-blue-400"
                                  : "text-slate-900 dark:text-white"
                              }
                            `}
                          >
                            {problematica.nombre}
                          </h5>
                        </div>

                        {/* Descripción */}
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                          {problematica.descripcion}
                        </p>
                      </div>
                    </button>

                    {/* Botón de editar (aparece en hover) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProblematicaToEdit(problematica);
                        setShowCreateModal(true);
                      }}
                      className="
                        absolute top-2 right-2 p-2 rounded-lg
                        bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-200
                        hover:border-dp-orange-400 hover:bg-dp-orange-50 dark:hover:bg-dp-orange-900/20
                        shadow-sm hover:shadow-md
                      "
                      title="Personalizar esta problemática"
                    >
                      <Edit2 className="h-4 w-4 text-dp-orange-600 dark:text-dp-orange-400" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Nota informativa */}
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center pt-4 border-t border-slate-200 dark:border-slate-700">
          <p>Podrás cambiar esta configuración más adelante desde tu perfil.</p>
        </div>
      </div>
    </ReusableModal>

      {/* Modal para crear/editar */}
      <CreateEditProblematicaModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setProblematicaToEdit(null);
        }}
        basadaEn={problematicaToEdit}
        onSuccess={(problematica) => {
          // Una vez creada, seleccionarla automáticamente
          setSelectedProblematica(problematica.id);
          setShowCreateModal(false);
          setProblematicaToEdit(null);
          
          // Auto-guardar y continuar
          problematicaApiService
            .seleccionar({ problematicaId: problematica.id })
            .then(() => {
              updateUser({ problematicaCompleta: true });
              handleToaster("¡Problemática guardada exitosamente!", "success");
              onComplete();
            })
            .catch((err) => {
              handleToaster(err.response?.data?.message || "Error al seleccionar", "error");
            });
        }}
      />
    </>
  );
}

export default ProblematicaModal;
