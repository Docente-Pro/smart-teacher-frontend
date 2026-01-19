import Step1 from "@/components/StepsCuestionarioCrearSesion/Step1";
import Step2 from "@/components/StepsCuestionarioCrearSesion/Step2";
import Step6 from "@/components/StepsCuestionarioCrearSesion/Step6";
import Step5 from "@/components/StepsCuestionarioCrearSesion/Step5";
import Step7 from "@/components/StepsCuestionarioCrearSesion/Step7";
import Step8 from "@/components/StepsCuestionarioCrearSesion/Step8";
import Step9 from "@/components/StepsCuestionarioCrearSesion/Step9";
import Step4 from "@/components/StepsCuestionarioCrearSesion/Step4";
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

const STEPS = [
  { number: 1, title: "Datos Generales", description: "Información básica" },
  { number: 2, title: "Propósito", description: "Aprendizaje esperado" },
  { number: 3, title: "Sesión", description: "Qué, cómo, para qué" },
  { number: 4, title: "Criterios", description: "Evaluación" },
  { number: 5, title: "Problemas", description: "Análisis" },
  { number: 6, title: "Preparación", description: "Recursos" },
  { number: 7, title: "Generar IA", description: "Secuencia" },
  { number: 8, title: "Finalizar", description: "Revisión" },
];

function CuestionarioSesion() {
  const { user } = useAuth0();
  const { showLoading, hideLoading } = useGlobalLoading();

  const { sesion, setSesion, resetSesion } = useSesionStore();
  const [usuarioFromState, setUsuarioFromState] = useState<IUsuario | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

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
        onStepClick={setCurrentStep} 
      />

      {/* Session Summary Drawer */}
      <SessionDrawer />

      {/* Main Content */}
      <div className="mx-auto">
        {currentStep === 1 && usuarioFromState && sesion && (
          <Step1 pagina={currentStep} setPagina={setCurrentStep} usuarioFromState={usuarioFromState} />
        )}

        {currentStep === 2 && usuarioFromState && sesion && (
          <Step2 pagina={currentStep} setPagina={setCurrentStep} usuarioFromState={usuarioFromState} />
        )}

        {currentStep === 3 && usuarioFromState && sesion && (
          <Step4 pagina={currentStep} setPagina={setCurrentStep} usuarioFromState={usuarioFromState} />
        )}

        {currentStep === 4 && usuarioFromState && sesion && (
          <Step6 pagina={currentStep} setPagina={setCurrentStep} usuarioFromState={usuarioFromState} />
        )}

        {currentStep === 5 && usuarioFromState && sesion && (
          <Step5 pagina={currentStep} setPagina={setCurrentStep} usuarioFromState={usuarioFromState} />
        )}

        {currentStep === 6 && usuarioFromState && sesion && (
          <Step7 pagina={currentStep} setPagina={setCurrentStep} usuarioFromState={usuarioFromState} />
        )}

        {currentStep === 7 && usuarioFromState && sesion && (
          <Step8 pagina={currentStep} setPagina={setCurrentStep} usuarioFromState={usuarioFromState} />
        )}

        {currentStep === 8 && usuarioFromState && sesion && (
          <Step9 pagina={currentStep} setPagina={setCurrentStep} usuarioFromState={usuarioFromState} />
        )}
      </div>
    </div>
  );
}

export default CuestionarioSesion;
