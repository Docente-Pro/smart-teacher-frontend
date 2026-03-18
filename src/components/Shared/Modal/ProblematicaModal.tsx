import { useState, useEffect, useRef } from "react";
import ReusableModal from "@/components/Shared/Modal/ReusableModal";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { usePermissions } from "@/hooks/usePermissions";
import { problematicaApiService } from "@/features/problematicas/services/problematica-api.service";
import { useProblematicas } from "@/features/problematicas/hooks/useProblematicas";
import CreateEditProblematicaModal from "@/features/problematicas/components/CreateEditProblematicaModal";
import { Problematica } from "@/features/problematicas/interfaces/problematica.interface";
import { updateUsuario } from "@/services/usuarios.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  AlertCircle,
  Edit2,
  Plus,
  Crown,
  RotateCcw,
  BookOpen,
  FileText,
} from "lucide-react";

interface ProblematicaModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
}

function ProblematicaModal({ isOpen, onComplete, onClose }: ProblematicaModalProps) {
  const { user: authUser, updateUser } = useAuthStore();
  const { user: usuario } = useUserStore();
  const { isPremium } = usePermissions();
  const { showLoading, hideLoading } = useGlobalLoading();
  const { problematicas, loading, loadRecomendadas } = useProblematicas();

  const [selectedProblematica, setSelectedProblematica] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [problematicaToEdit, setProblematicaToEdit] = useState<Problematica | null>(null);

  // Premium-only context fields
  const [tituloUnidad, setTituloUnidad] = useState("");
  const [situacionSignificativa, setSituacionSignificativa] = useState("");
  const situacionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea: minimum height = content height
  useEffect(() => {
    const el = situacionTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const minH = 3 * 24; // ~3 lines
    el.style.height = `${Math.max(el.scrollHeight, minH)}px`;
  }, [situacionSignificativa, isOpen]);

  // Previous values from backend (for "used last time")
  const prevProblematica = usuario?.problematica;
  const prevProblematicaId = usuario?.problematicaId;
  const prevTitulo = usuario?.tituloUnidadContexto || "";
  const prevSituacion = usuario?.situacionSignificativaContexto || "";
  const hasPreviousConfig = !!(prevProblematicaId || prevTitulo || prevSituacion);

  useEffect(() => {
    if (isOpen) {
      loadRecomendadas();
      setSelectedProblematica(null);
      setTituloUnidad("");
      setSituacionSignificativa("");
    }
  }, [isOpen, loadRecomendadas]);

  function handleRestorePrevious() {
    if (prevProblematicaId) setSelectedProblematica(prevProblematicaId);
    if (prevTitulo) setTituloUnidad(prevTitulo);
    if (prevSituacion) setSituacionSignificativa(prevSituacion);
    handleToaster("Configuración anterior restaurada", "success");
  }

  async function handleGuardar() {
    if (!selectedProblematica || !authUser?.id) {
      handleToaster("Por favor, selecciona una problemática", "warning");
      return;
    }

    setSaving(true);
    showLoading("Guardando...");

    try {
      await problematicaApiService.seleccionar({
        problematicaId: selectedProblematica,
      });

      // For premium users, also save context fields via PATCH /api/usuario/:id
      if (isPremium) {
        const patchBody: Record<string, string> = {};
        if (tituloUnidad.trim()) patchBody.tituloUnidadContexto = tituloUnidad.trim();
        if (situacionSignificativa.trim()) patchBody.situacionSignificativaContexto = situacionSignificativa.trim();

        if (Object.keys(patchBody).length > 0) {
          await updateUsuario(authUser.id, patchBody);
          useUserStore.getState().updateUsuario(patchBody);
        }
      }

      // Update local store with new problematicaId so it shows next time
      useUserStore.getState().updateUsuario({ problematicaId: selectedProblematica });
      // Find the selected problematica object to store nombre/descripcion
      const selectedObj = problematicas.find((p) => p.id === selectedProblematica);
      if (selectedObj) {
        useUserStore.getState().updateUsuario({
          problematica: { id: selectedObj.id, nombre: selectedObj.nombre, descripcion: selectedObj.descripcion },
        });
      }

      updateUser({ problematicaCompleta: true });
      handleToaster("¡Configuración guardada exitosamente!", "success");
      onComplete();
    } catch (error: any) {
      console.error("Error al guardar:", error);
      handleToaster(
        error.response?.data?.message || "Error al guardar la configuración",
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
        title={isPremium ? "Configurar sesión individual" : "Completa tu perfil"}
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
        <div className="space-y-5">
          {/* Previous config quick-fill (all users see problemática, premium also sees context) */}
          {hasPreviousConfig && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-700/40 bg-gradient-to-r from-amber-50 to-orange-50/60 dark:from-amber-950/30 dark:to-orange-950/20 p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Última configuración usada
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRestorePrevious}
                  className="h-7 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 gap-1.5"
                >
                  <RotateCcw className="h-3 w-3" />
                  Usar de nuevo
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                {prevProblematica && (
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white/60 dark:bg-slate-800/40 border border-amber-100 dark:border-amber-800/30">
                    <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-tight">
                        {prevProblematica.nombre}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {prevProblematica.descripcion}
                      </p>
                    </div>
                  </div>
                )}
                {isPremium && prevTitulo && (
                  <p className="text-slate-700 dark:text-slate-300 truncate px-1">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Título:</span>{" "}
                    {prevTitulo}
                  </p>
                )}
                {isPremium && prevSituacion && (
                  <p className="text-slate-700 dark:text-slate-300 line-clamp-2 px-1">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Situación:</span>{" "}
                    {prevSituacion}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Premium context fields */}
          {isPremium && (
            <div className="rounded-xl border border-indigo-200 dark:border-indigo-700/40 bg-indigo-50/60 dark:bg-indigo-950/20 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Contexto de la sesión
                </span>
                <span className="text-[10px] text-indigo-400 dark:text-indigo-500 ml-auto">Opcional</span>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                  Título de la unidad
                </label>
                <input
                  type="text"
                  value={tituloUnidad}
                  onChange={(e) => setTituloUnidad(e.target.value)}
                  placeholder='Ej: "Unidad 3: Números decimales"'
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-500" />
                  Situación significativa / Reto
                </label>
                <textarea
                  ref={situacionTextareaRef}
                  value={situacionSignificativa}
                  onChange={(e) => setSituacionSignificativa(e.target.value)}
                  placeholder='Ej: "Los estudiantes identificarán el uso de decimales en situaciones cotidianas de compra y venta..."'
                  rows={3}
                  className="w-full min-h-[4.5rem] px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 outline-none transition-all resize-none overflow-hidden"
                />
              </div>
            </div>
          )}

          {/* Info banner */}
          <div className="flex items-start gap-3 p-3.5 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-dp-blue-500 rounded-lg">
            <AlertCircle className="h-5 w-5 text-dp-blue-600 dark:text-dp-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-0.5 text-sm">
                {isPremium ? "Selecciona la problemática" : "Antes de crear tu sesión"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isPremium
                  ? "Elige la problemática que abordarás en esta sesión individual. El contexto de arriba es opcional pero mejora la personalización."
                  : "Necesitamos conocer la problemática principal que quieres abordar en tus sesiones de aprendizaje."}
              </p>
            </div>
          </div>

          {/* Problemática list */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
              Selecciona la problemática principal:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-lg" />
                  ))}
                </>
              ) : problematicas.length === 0 ? (
                <div className="col-span-full text-center py-8 text-slate-500 dark:text-slate-400">
                  <p>No se encontraron problemáticas disponibles.</p>
                </div>
              ) : (
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
                          <div className="flex items-start gap-2 mb-2">
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
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                            {problematica.descripcion}
                          </p>
                        </div>
                      </button>

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

          <div className="text-xs text-slate-500 dark:text-slate-400 text-center pt-3 border-t border-slate-200 dark:border-slate-700">
            <p>Podrás cambiar esta configuración más adelante desde tu perfil.</p>
          </div>
        </div>
      </ReusableModal>

      <CreateEditProblematicaModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setProblematicaToEdit(null);
        }}
        basadaEn={problematicaToEdit}
        onSuccess={(problematica) => {
          setSelectedProblematica(problematica.id);
          setShowCreateModal(false);
          setProblematicaToEdit(null);

          // Auto-save and continue (also send premium context if filled)
          const savePremiumContext = async () => {
            if (isPremium && authUser?.id && (tituloUnidad.trim() || situacionSignificativa.trim())) {
              const patchBody: Record<string, string> = {};
              if (tituloUnidad.trim()) patchBody.tituloUnidadContexto = tituloUnidad.trim();
              if (situacionSignificativa.trim()) patchBody.situacionSignificativaContexto = situacionSignificativa.trim();
              await updateUsuario(authUser.id, patchBody);
              useUserStore.getState().updateUsuario(patchBody);
            }
          };

          problematicaApiService
            .seleccionar({ problematicaId: problematica.id })
            .then(() => savePremiumContext())
            .then(() => {
              // Save to user store for next time
              useUserStore.getState().updateUsuario({
                problematicaId: problematica.id,
                problematica: { id: problematica.id, nombre: problematica.nombre, descripcion: problematica.descripcion },
              });
              updateUser({ problematicaCompleta: true });
              handleToaster("¡Configuración guardada exitosamente!", "success");
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
