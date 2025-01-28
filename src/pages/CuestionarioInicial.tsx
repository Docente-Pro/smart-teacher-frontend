import Stepper from "@/components/Stepper";
import Step1 from "@/components/StepsCuestionarioInicial/Step1";
import Step2 from "@/components/StepsCuestionarioInicial/Step2";
import { initialStateCuestionarioInicial } from "@/constants/initialStateCuestionarioInicial";
import { IUsuarioToSave } from "@/interfaces/IUsuario";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

function CuestionarioInicial() {
  const { user } = useAuth0();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [valuesOfUser, setValuesOfUser] = useState<IUsuarioToSave>(initialStateCuestionarioInicial);

  useEffect(() => {
    if (user && user.email) {
    }
  }, [user]);

  console.log(valuesOfUser);

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="h-full m-auto" style={{ width: "min(500px, 100%)" }}>
        <Stepper currentStep={currentStep} totalSteps={2} />
        <div className="container">
          {user && currentStep === 1 && (
            <Step1 setValuesOfUser={setValuesOfUser} state={valuesOfUser} usuario={user} setCurrentStep={setCurrentStep} />
          )}

          {user && currentStep === 2 && (
            <Step2 setValuesOfUser={setValuesOfUser} state={valuesOfUser} userFromAuth0={user} setCurrentStep={setCurrentStep} />
          )}
        </div>
      </div>
    </div>
  );
}

export default CuestionarioInicial;
