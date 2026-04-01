import Step1 from "@/components/StepsCuestionarioCrearSesion/Step1";
import Step2Free from "@/components/StepsCuestionarioCrearSesion/Step2Free";
import Step3FreeResult from "@/components/StepsCuestionarioCrearSesion/Step3FreeResult";
import { StepIndicator } from "@/components/StepsCuestionarioCrearSesion/StepIndicator";
import { SessionDrawer } from "@/components/StepsCuestionarioCrearSesion/SessionDrawer";
import { IUsuario } from "@/interfaces/IUsuario";
import { useAuth0 } from "@/hooks/useAuth0";
import { useState, useEffect } from "react";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { instance } from "@/services/instance";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useSesionStore } from "@/store/sesion.store";
import { initialStateSesion } from "@/constants/initialStateSesion";
import { useNavigate } from "react-router";
import { useScrollTopOnStep } from "@/hooks/useScrollTopOnStep";

const STEPS = [
  { number: 1, title: "Datos Generales", description: "Área y duración" },
  { number: 2, title: "Tema Curricular", description: "Tema y competencia" },
  { number: 3, title: "Tu Sesión", description: "Resultado editable" },
];

function CuestionarioSesion() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useGlobalLoading();

  const { sesion, setSesion, resetSesion } = useSesionStore();
  const [usuarioFromState, setUsuarioFromState] = useState<IUsuario | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxStepReached, setMaxStepReached] = useState<number>(1);

  // Scroll al tope cada vez que cambia el paso
  useScrollTopOnStep(currentStep);

  // Actualizar maxStepReached cuando se avanza
  const handleSetStep = (step: number) => {
    setCurrentStep(step);
    setMaxStepReached((prev) => Math.max(prev, step));
  };

  useEffect(() => {
    async function cargarUsuario() {
      if (!user?.id) {
        handleToaster("Error: Usuario no encontrado", "error");
        return;
      }

      showLoading("Cargando información del usuario...");

      try {
        const response = await instance.get(`/usuario/${user.id}`);
        const usuarioData = response.data.data || response.data;
        setUsuarioFromState(usuarioData);

        // SIEMPRE resetear e inicializar sesión limpia al entrar
        resetSesion();
        const sesionInicial = {
          ...initialStateSesion,
          gradoId: usuarioData.grado?.id ?? usuarioData.gradoId,
          datosGenerales: {
            ...initialStateSesion.datosGenerales,
            institucion: usuarioData.nombreInstitucion || "I.E. No especificada",
            docente: usuarioData.nombre || "Docente no especificado",
            nivel: usuarioData.nivel?.nombre || "",
            grado: usuarioData.grado?.nombre || "",
          },
          firmas: {
            docente: {
              nombre: usuarioData.nombre || "Docente",
              cargo: "Docente",
            },
            director: {
              nombre: "",
              cargo: "Director(a)",
            },
          },
        };
        setSesion(sesionInicial);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        handleToaster("Error al cargar información del usuario", "error");
      } finally {
        hideLoading();
      }
    }

    cargarUsuario();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Step Indicator */}
      <StepIndicator 
        steps={STEPS} 
        currentStep={currentStep} 
        maxStepReached={maxStepReached}
        onStepClick={handleSetStep}
        onBack={() => navigate("/dashboard")}
      />

      {/* Session Summary Drawer */}
      <SessionDrawer />

      {/* Main Content */}
      <div className="mx-auto">
        {currentStep === 1 && usuarioFromState && sesion && (
          <Step1 pagina={currentStep} setPagina={handleSetStep} usuarioFromState={usuarioFromState} />
        )}

        {currentStep === 2 && usuarioFromState && sesion && (
          <Step2Free pagina={currentStep} setPagina={handleSetStep} usuarioFromState={usuarioFromState} />
        )}

        {currentStep === 3 && usuarioFromState && sesion && (
          <Step3FreeResult pagina={currentStep} setPagina={handleSetStep} usuarioFromState={usuarioFromState} />
        )}
      </div>
    </div>
  );
}

export default CuestionarioSesion;
