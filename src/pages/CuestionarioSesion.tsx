import Step1 from "@/components/StepsCuestionarioCrearSesion/Step1";
import Step2 from "@/components/StepsCuestionarioCrearSesion/Step2";
import Step3 from "@/components/StepsCuestionarioCrearSesion/Step3";
import { ICuestionarioSesion, initialStateCuestionarioSesion } from "@/constants/initialStateCuestionarioSesion";
import { IUsuario } from "@/interfaces/IUsuario";
import { getUsuarioByEmail } from "@/services/usuarios.service";
import { userStore } from "@/store/user.store";
import { encrypt } from "@/utils/cryptoUtil";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

function CuestionarioSesion() {
  const { user } = useAuth0();
  const { setUsuario } = userStore();

  const [usuarioFromState, setUsuarioFromState] = useState<IUsuario>();
  const [cuestionarioState, setCuestionarioState] = useState<ICuestionarioSesion>(initialStateCuestionarioSesion);
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    if (user && user.email) {
      const emailHashed = encrypt(user.email);
      getUsuarioByEmail({
        email: emailHashed,
      }).then((response) => {
        setUsuario(response.data.data);
        setUsuarioFromState(response.data.data);
        localStorage.setItem("usuario", JSON.stringify(response.data.data));
      });
    }
  }, []);

  console.log(cuestionarioState);
  return (
    <div className="w-[70%] mx-auto">
      {currentStep === 1 && usuarioFromState && (
        <Step1
          pagina={currentStep}
          setPagina={setCurrentStep}
          usuarioFromState={usuarioFromState}
          cuestionarioState={cuestionarioState}
          setCuestionarioState={setCuestionarioState}
        />
      )}

      {currentStep === 2 && usuarioFromState && (
        <Step2
          pagina={currentStep}
          setPagina={setCurrentStep}
          usuarioFromState={usuarioFromState}
          cuestionarioState={cuestionarioState}
          setCuestionarioState={setCuestionarioState}
        />
      )}

      {currentStep === 3 && usuarioFromState && (
        <Step3
          pagina={currentStep}
          setPagina={setCurrentStep}
          usuarioFromState={usuarioFromState}
          cuestionarioState={cuestionarioState}
          setCuestionarioState={setCuestionarioState}
        />
      )}
    </div>
  );
}

export default CuestionarioSesion;
