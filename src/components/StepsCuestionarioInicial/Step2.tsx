import { IProblematica } from "@/interfaces/IProblematica";
import { IUnidad } from "@/interfaces/IUnidad";
import { IUsuarioToSave } from "@/interfaces/IUsuario";
import { getAllProblematicas } from "@/services/problematica.service";
import { getAllUnidades } from "@/services/unidad.service";
import CustomInputCI from "@/utils/CuestionarioInicial/CustomInputCI";
import CustomSelectCI from "@/utils/CuestionarioInicial/CustomSelectCI";
import { User } from "@auth0/auth0-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import LoadingComponent from "../LoadingComponent";
import { createNewUsuario } from "@/services/usuarios.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useNavigate } from "react-router";

interface Props {
  state: IUsuarioToSave;
  setValuesOfUser: Dispatch<SetStateAction<IUsuarioToSave>>;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  userFromAuth0: User;
}

function Step2({ state, userFromAuth0, setValuesOfUser, setCurrentStep }: Props) {
  const [unidades, setUnidades] = useState<IUnidad[]>();
  const [problematicas, setProblematicas] = useState<IProblematica[]>();
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    getAllUnidades().then((response) => {
      setUnidades(response.data.data);
    });
    getAllProblematicas().then((response) => {
      setProblematicas(response.data.data);
    });
  }, []);

  function handleChange() {
    if (state.unidadId && state.problematicaId) {
      createNewUsuario({
        nombre: userFromAuth0.name || "",
        unidadId: state.unidadId,
        problematicaId: state.problematicaId,
        gradoId: state.gradoId,
        educacionId: state.educacionId,
        respondioCuestionario: true,
        nombreInstitucion: state.nombre,
        email: userFromAuth0.email || "",
      }).then((response) => {
        if (response.data.data) {
          handleToaster("¡Tu cuestionario ha sido completado con éxito!", "success");
          setLoading(false);
          navigate("/");
        }
      });
    } else {
      handleToaster("Por favor, llena todos los campos", "error");
    }
  }

  function handleBeforeStep() {
    setCurrentStep(1);
  }

  return (
    <div>
      <section className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">Selecciona tu unidad y problemática</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Por favor, selecciona la unidad y la problemática que mejor describan los temas que llevarás durante toda la unidad. Esto nos
          ayudará a personalizar tus sesiones de manera más efectiva.
        </p>
      </section>
      <section className="w-full flex flex-col gap-2">
        <CustomSelectCI
          array={unidades || []}
          setValuesOfUser={setValuesOfUser}
          placeholder="Selecciona una unidad"
          valueToSet="unidadId"
          label="Unidad"
          state={state}
        />
      </section>

      <section className="w-full flex flex-col gap-2">
        <CustomSelectCI
          array={problematicas || []}
          setValuesOfUser={setValuesOfUser}
          placeholder="Selecciona una problemática"
          valueToSet="problematicaId"
          label="Problemática"
          state={state}
        />
      </section>

      <CustomInputCI handleNextStep={handleChange} beforeButton handleBeforeStep={handleBeforeStep} />

      {loading && <LoadingComponent />}
    </div>
  );
}

export default Step2;
