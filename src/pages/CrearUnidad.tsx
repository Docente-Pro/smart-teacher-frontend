import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth0 } from "@/hooks/useAuth0";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { useUnidadStore } from "@/store/unidad.store";
import { usePermissions } from "@/hooks/usePermissions";
import { instance } from "@/services/instance";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { StepIndicator } from "@/components/StepsCuestionarioCrearSesion/StepIndicator";
import { UnidadDrawer } from "@/components/StepsCrearUnidad/UnidadDrawer";
import { UnidadRecoveryDialog } from "@/components/StepsCrearUnidad/UnidadRecoveryDialog";
import Step0TipoUnidad from "@/components/StepsCrearUnidad/Step0TipoUnidad";
import Step1DatosUnidad from "@/components/StepsCrearUnidad/Step1DatosUnidad";
import Step2SituacionPropositos from "@/components/StepsCrearUnidad/Step2SituacionPropositos";
import Step3EnfoquesComplementos from "@/components/StepsCrearUnidad/Step3EnfoquesComplementos";
import Step4SecuenciaFinal from "@/components/StepsCrearUnidad/Step4SecuenciaFinal";
import type { IUsuario } from "@/interfaces/IUsuario";
import type { TipoUnidad } from "@/interfaces/IUnidad";

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
    hasUnfinishedUnidad,
    setCurrentStep,
    advanceStep,
    setWizardPhase,
    setTipoUnidad,
    resetUnidad,
  } = useUnidadStore();

  const [usuarioData, setUsuarioData] = useState<IUsuario | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ── Manejador de paso ──
  const handleSetStep = (step: number) => {
    advanceStep(step);
  };

  const handleTipoContinue = (tipo: TipoUnidad, miembros: number) => {
    setTipoUnidad(tipo, miembros);
  };

  // ── Recuperación: continuar donde se quedó ──
  const handleContinueUnfinished = () => {
    setShowRecoveryDialog(false);
    // El estado ya está en el store, solo cerramos el diálogo
  };

  // ── Recuperación: empezar de nuevo ──
  const handleStartNew = () => {
    setShowRecoveryDialog(false);
    resetUnidad();
  };

  // ── Cargar usuario y verificar unidad pendiente ──
  useEffect(() => {
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
  }, [user?.id]);

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

      {/* ── Pre-paso: elegir tipo de unidad ── */}
      {wizardPhase === "select-type" && (
        <Step0TipoUnidad
          onContinue={handleTipoContinue}
          isPremium={isPremium && isSuscripcionActiva}
          onBack={() => navigate("/dashboard")}
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
