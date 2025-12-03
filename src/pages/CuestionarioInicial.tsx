import Header from "@/components/Header";
import Stepper from "@/components/Stepper";
import Step1 from "@/components/StepsCuestionarioInicial/Step1";
import Step2 from "@/components/StepsCuestionarioInicial/Step2";
import { initialStateCuestionarioInicial } from "@/constants/initialStateCuestionarioInicial";
import { IUsuarioToCreate } from "@/interfaces/IUsuario";
import { getUsuarioByEmail } from "@/services/usuarios.service";
import { userStore } from "@/store/user.store";
import { encrypt } from "@/utils/cryptoUtil";
import { useAuth0 } from "@auth0/auth0-react";
import { log } from "console";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

function CuestionarioInicial() {
  const { user } = useAuth0();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [valuesOfUser, setValuesOfUser] = useState<IUsuarioToCreate>(initialStateCuestionarioInicial);
  const [loading, setLoading] = useState<boolean>(true);
  const [redirectToHome, setRedirectToHome] = useState<boolean>(false);

  const { setUsuario } = userStore();

  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.email) {
      const encryptedEmail = encrypt(user.email);

      getUsuarioByEmail({
        email: encryptedEmail,
      })
        .then((response) => {
          setUsuario(response.data);
          if (response.data.data.respondioCuestionario) {
            setRedirectToHome(true);
            navigate("/");
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (redirectToHome) {
    return null; // No renderizar children si se redirige al cuestionario
  }

  return (
    <>
      <Header />
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="h-full m-auto" style={{ width: "min(1250px, 100%)" }}>
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
    </>
  );
}

export default CuestionarioInicial;
