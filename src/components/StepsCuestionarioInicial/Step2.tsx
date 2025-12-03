import { IProblematica } from "@/interfaces/IProblematica";
import { IUsuarioToCreate } from "@/interfaces/IUsuario";
import { getAllProblematicas } from "@/services/problematica.service";
import CustomInputCI from "@/utils/CuestionarioInicial/CustomInputCI";
import { User } from "@auth0/auth0-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import LoadingComponent from "../LoadingComponent";
import { createNewUsuario } from "@/services/usuarios.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Check } from "lucide-react";

interface Props {
  state: IUsuarioToCreate;
  setValuesOfUser: Dispatch<SetStateAction<IUsuarioToCreate>>;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  userFromAuth0: User;
}

function Step2({ state, userFromAuth0, setValuesOfUser, setCurrentStep }: Props) {
  const [problematicas, setProblematicas] = useState<IProblematica[]>();
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    getAllProblematicas().then((response) => {
      setProblematicas(response.data.data);
    });
  }, []);

  function handleChange() {
    if (state.problematicaId) {
      setLoading(true);
      createNewUsuario({
        nombre: userFromAuth0.name || "",
        email: userFromAuth0.email || "",
        nombreInstitucion: state.nombreInstitucion,
        nivelId: state.nivelId,
        gradoId: state.gradoId,
        problematicaId: state.problematicaId,
        suscripcion: {
          fechaInicio: new Date().toISOString(),
          plan: "free",
          activa: true,
        },
      })
        .then((response) => {
          if (response.data.data) {
            handleToaster("¡Tu cuestionario ha sido completado con éxito!", "success");
            setLoading(false);
            navigate("/");
          }
        })
        .catch((error) => {
          setLoading(false);

          // Verificar si el error es por email duplicado
          if (error.response?.data?.message?.includes("Unique constraint failed") || error.response?.data?.message?.includes("email")) {
            handleToaster("Este usuario ya está registrado. Redirigiendo...", "info");
            // Si ya existe, simplemente redirigir
            setTimeout(() => {
              navigate("/");
            }, 1500);
          } else {
            handleToaster("Error al guardar el cuestionario", "error");
          }
        });
    } else {
      handleToaster("Por favor, selecciona una problemática", "error");
    }
  }

  function handleBeforeStep() {
    setCurrentStep(1);
  }

  return (
    <div className="space-y-8 ">
      <section className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Selecciona tu problemática</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Elige la problemática que mejor describa el contexto de tus estudiantes. Esto nos ayudará a personalizar tus sesiones de manera
          más efectiva.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto overflow-x-hidden pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent px-20 py-4">
        {problematicas?.map((problematica) => (
          <Card
            key={problematica.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] overflow-hidden ${
              state.problematicaId === problematica.id
                ? "border-blue-500 border-2 bg-blue-50 dark:bg-blue-950 shadow-lg"
                : "hover:border-gray-400"
            }`}
            onClick={() =>
              setValuesOfUser((prevState) => ({
                ...prevState,
                problematicaId: problematica.id,
              }))
            }
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white leading-tight break-words">
                  {problematica.nombre}
                </CardTitle>
                {state.problematicaId === problematica.id && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-gray-600 dark:text-gray-400 line-clamp-4 leading-relaxed break-words">
                {problematica.descripcion}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <CustomInputCI handleNextStep={handleChange} beforeButton handleBeforeStep={handleBeforeStep} />

      {loading && <LoadingComponent />}
    </div>
  );
}

export default Step2;
