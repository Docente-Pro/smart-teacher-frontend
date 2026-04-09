import { useState, useEffect, useLayoutEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth0 } from "@/hooks/useAuth0";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { useUnidadStore } from "@/store/unidad.store";
import { usePermissions } from "@/hooks/usePermissions";
import { instance } from "@/services/instance";
import { deleteUnidad, getUnidadesByUsuario, resetUnidadContenido } from "@/services/unidad.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { StepIndicator } from "@/components/StepsCuestionarioCrearSesion/StepIndicator";
import { UnidadDrawer } from "@/components/StepsCrearUnidad/UnidadDrawer";
import { UnidadRecoveryDialog } from "@/components/StepsCrearUnidad/UnidadRecoveryDialog";
import Step0TipoUnidad from "@/components/StepsCrearUnidad/Step0TipoUnidad";
import Step0AreaSecundaria from "@/components/StepsCrearUnidad/Step0AreaSecundaria";
import { shouldOfferSecundariaAreaStep } from "@/utils/unidadSecundaria";
import Step1DatosUnidad from "@/components/StepsCrearUnidad/Step1DatosUnidad";
import Step2SituacionPropositos from "@/components/StepsCrearUnidad/Step2SituacionPropositos";
import Step3EnfoquesComplementos from "@/components/StepsCrearUnidad/Step3EnfoquesComplementos";
import Step4SecuenciaFinal from "@/components/StepsCrearUnidad/Step4SecuenciaFinal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X, RotateCcw, Loader2, Check, AlertCircle, Save } from "lucide-react";
import type { IUsuario } from "@/interfaces/IUsuario";
import type { TipoUnidad } from "@/interfaces/IUnidad";
import { useScrollTopOnStep } from "@/hooks/useScrollTopOnStep";
import { useManualSaveContenido } from "@/hooks/useAutoSaveContenido";

const STEPS = [
  { number: 1, title: "Datos Generales", description: "Configuración" },
  { number: 2, title: "Situación y Propósitos", description: "IA genera" },
  { number: 3, title: "Enfoques", description: "Complementos" },
  { number: 4, title: "Secuencia", description: "Sesiones" },
];

/**
 * Wizard de 4 pasos para crear Unidades de Aprendizaje con IA.
 * Paso 1: Datos generales (nivel, grado, áreas, duración, fechas, problemática)
 * Paso 2: Situación Significativa + Evidencias + Propósitos (IA pasos 1-3)
 * Paso 3: Áreas Complementarias + Enfoques Transversales (IA pasos 4-5)
 * Paso 4: Secuencia de Actividades + Materiales + Reflexiones (IA pasos 6-8)
 */
function CrearUnidad() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth0();
  const { showLoading, hideLoading } = useGlobalLoading();
  const { isPremium, isSuscripcionActiva } = usePermissions();

  // ── Store con persistencia ──
  const {
    currentStep,
    maxStepReached,
    wizardPhase,
    tipoUnidad,
    maxMiembros,
    unidadId,
    hasUnfinishedUnidad,
    setCurrentStep,
    advanceStep,
    setWizardPhase,
    setTipoUnidad,
    resetUnidad,
    softResetUnidad,
  } = useUnidadStore();

  const { status: contenidoSaveStatus, isDirty: contenidoDirty, save: saveContenido } = useManualSaveContenido(unidadId ?? null);

  /** Nueva unidad desde el dashboard (u otras entradas): limpiar borrador persistido y volver al flujo inicial. */
  useLayoutEffect(() => {
    const iniciar = (location.state as { iniciarNuevaUnidad?: boolean } | null)
      ?.iniciarNuevaUnidad;
    if (!iniciar) return;
    resetUnidad();
    navigate("/crear-unidad", { replace: true });
  }, [location.state, navigate, resetUnidad]);

  // Scroll al tope cada vez que cambia el paso
  useScrollTopOnStep(currentStep);

  const [usuarioData, setUsuarioData] = useState<IUsuario | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ── Manejador de paso ──
  const handleSetStep = (step: number) => {
    advanceStep(step);
  };

  const handleTipoContinue = (tipo: TipoUnidad, miembros: number) => {
    // Secundaria (con áreas en perfil): tras PERSONAL, elegir área antes del wizard (también tras pago free).
    if (
      usuarioData &&
      shouldOfferSecundariaAreaStep(usuarioData) &&
      tipo === "PERSONAL" &&
      useUnidadStore.getState().wizardPhase === "select-type"
    ) {
      setWizardPhase("select-area-secundaria");
      return;
    }
    setTipoUnidad(tipo, miembros);
  };

  // ── Recuperación: continuar donde se quedó ──
  const handleContinueUnfinished = () => {
    setShowRecoveryDialog(false);
    // El estado ya está en el store, solo cerramos el diálogo
  };

  /**
   * Obtiene el ID de la unidad activa:
   * 1. Desde el store local (más rápido).
   * 2. Fallback: consulta unidades del usuario en el backend.
   */
  const obtenerUnidadActivaId = async (): Promise<string | null> => {
    const idLocal = useUnidadStore.getState().unidadId;
    if (idLocal) return idLocal;

    if (user?.id) {
      const res = await getUnidadesByUsuario(user.id);
      const unidades = res.data;
      if (Array.isArray(unidades) && unidades.length > 0) {
        return unidades[0].id;
      }
    }
    return null;
  };

  // ── Recovery dialog: empezar de nuevo (elimina la unidad completa del backend) ──
  const handleStartNew = async () => {
    setShowRecoveryDialog(false);
    try {
      const id = await obtenerUnidadActivaId();
      if (id) await deleteUnidad(id);
      resetUnidad();
    } catch (err: any) {
      console.error("No se pudo eliminar la unidad del backend:", err);
      const msg =
        err?.response?.data?.message || "No se pudo eliminar la unidad del servidor. Intenta de nuevo.";
      handleToaster(msg, "error");
    }
  };

  // ── Wizard: empezar de cero (resetea contenido IA, conserva la unidad) ──
  const handleEmpezarDeCero = async () => {
    setShowResetConfirm(false);
    try {
      const id = await obtenerUnidadActivaId();
      if (id) {
        await resetUnidadContenido(id);
        softResetUnidad();
      } else {
        // No hay unidad en backend, reset local completo
        resetUnidad();
      }
      handleToaster("Se reinició la unidad correctamente", "success");
    } catch (err: any) {
      console.error("No se pudo reiniciar la unidad:", err);
      const msg =
        err?.response?.data?.message || "No se pudo reiniciar la unidad. Intenta de nuevo.";
      handleToaster(msg, "error");
    }
  };

  // ── Cargar usuario y verificar unidad pendiente ──
  useEffect(() => {
    // Si el wizard ya estaba completado, resetear para empezar de nuevo
    if (useUnidadStore.getState().wizardPhase === "completed") {
      resetUnidad();
    }

    async function cargarUsuario() {
      if (!user?.id) {
        handleToaster("Error: Usuario no encontrado", "error");
        navigate("/dashboard");
        return;
      }

      showLoading("Cargando información del usuario...");
      try {
        const response = await instance.get(`/usuario/${user.id}`);
        const data = response.data.data || response.data;
        setUsuarioData(data);

        // Secundaria con áreas en perfil: elegir área antes que personal/compartida (siempre PERSONAL).
        const st = useUnidadStore.getState();
        if (
          shouldOfferSecundariaAreaStep(data) &&
          isPremium &&
          isSuscripcionActiva &&
          st.wizardPhase === "select-type" &&
          !st.unidadId &&
          !st.datosBase
        ) {
          setWizardPhase("select-area-secundaria");
        }

        // Verificar si hay una unidad sin completar
        if (hasUnfinishedUnidad()) {
          setShowRecoveryDialog(true);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        handleToaster("Error al cargar información del usuario", "error");
        navigate("/dashboard");
      } finally {
        hideLoading();
      }
    }

    cargarUsuario();
  }, [user?.id, isPremium, isSuscripcionActiva]);

  // No renderizar hasta que esté inicializado
  if (!isInitialized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* ── Diálogo de recuperación ── */}
      <UnidadRecoveryDialog
        open={showRecoveryDialog}
        onContinue={handleContinueUnfinished}
        onStartNew={handleStartNew}
      />

      {/* ── Pre-paso secundaria: elegir área curricular (siempre unidad personal) ── */}
      {wizardPhase === "select-area-secundaria" && usuarioData && user?.id && (
        <Step0AreaSecundaria
          usuario={usuarioData}
          userId={user.id}
          onBack={() => navigate("/dashboard")}
        />
      )}

      {/* ── Pre-paso: elegir tipo de unidad (primaria u otros) ── */}
      {wizardPhase === "select-type" && (
        <Step0TipoUnidad
          onContinue={handleTipoContinue}
          isPremium={isPremium && isSuscripcionActiva}
          onBack={() => navigate("/dashboard")}
          soloPersonalSecundaria={
            !!usuarioData && shouldOfferSecundariaAreaStep(usuarioData)
          }
        />
      )}

      {/* ── Wizard de 4 pasos ── */}
      {wizardPhase === "wizard" && (
        <>
          {/* Step Indicator */}
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            maxStepReached={maxStepReached}
            onStepClick={handleSetStep}
            onBack={() => navigate("/dashboard")}
          />

          {/* ── Barra de acciones del wizard ── */}
          <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-[88px] sm:top-[108px] z-30">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 transition-all"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Cerrar</span>
                </button>
                {unidadId && (
                  <>
                    <button
                      onClick={saveContenido}
                      disabled={contenidoSaveStatus === "saving" || (!contenidoDirty && contenidoSaveStatus !== "error")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        contenidoSaveStatus === "error"
                          ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 hover:bg-red-100"
                          : contenidoDirty
                            ? "text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                            : "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {contenidoSaveStatus === "saving" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : contenidoSaveStatus === "error" ? (
                        <AlertCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      {contenidoSaveStatus === "saving"
                        ? "Guardando…"
                        : contenidoSaveStatus === "error"
                          ? "Reintentar"
                          : "Guardar"}
                    </button>
                    {contenidoSaveStatus === "saved" && (
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Guardado
                      </span>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm sm:text-base font-semibold text-white bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/30 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                Empezar de cero
              </button>
            </div>
          </div>

          {/* ── Diálogo de confirmación: Empezar de cero ── */}
          <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
            <AlertDialogContent className="max-w-sm sm:max-w-md mx-4 sm:mx-auto rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-lg">
                  <RotateCcw className="w-5 h-5 text-amber-500" />
                  ¿Empezar de cero?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-slate-600 dark:text-slate-400">
                  Se eliminará todo el progreso actual de la unidad (datos, contenido generado por IA, etc.). Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <AlertDialogCancel className="rounded-xl">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEmpezarDeCero}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Sí, empezar de cero
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Resumen lateral */}
          <UnidadDrawer />

          {/* Contenido principal */}
          <div className="mx-auto">
            {currentStep === 1 && usuarioData && (
              <Step1DatosUnidad
                pagina={currentStep}
                setPagina={handleSetStep}
                usuario={usuarioData}
                tipoUnidad={tipoUnidad}
                maxMiembros={maxMiembros}
              />
            )}

            {currentStep === 2 && usuarioData && (
              <Step2SituacionPropositos
                pagina={currentStep}
                setPagina={handleSetStep}
                usuario={usuarioData}
                contenidoSaveStatus={contenidoSaveStatus}
              />
            )}

            {currentStep === 3 && usuarioData && (
              <Step3EnfoquesComplementos
                pagina={currentStep}
                setPagina={handleSetStep}
                usuario={usuarioData}
              />
            )}

            {currentStep === 4 && usuarioData && (
              <Step4SecuenciaFinal
                pagina={currentStep}
                setPagina={handleSetStep}
                usuario={usuarioData}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CrearUnidad;
