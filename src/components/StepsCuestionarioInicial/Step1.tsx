import { IUsuarioToSave } from "@/interfaces/IUsuario";
import { User } from "@auth0/auth0-react";
import { Avatar } from "../ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { getAllEducaciones } from "@/services/educacion.service";
import { IEducacion } from "@/interfaces/IEducacion";
import { toast } from "sonner";
import { IGrado } from "@/interfaces/IGrado";
import { getAllGrados } from "@/services/grado.service";
import CustomSelectCI from "@/utils/CuestionarioInicial/CustomSelectCI";
import CustomInputCI from "@/utils/CuestionarioInicial/CustomInputCI";

interface Props {
  state: IUsuarioToSave;
  usuario: User;
  setValuesOfUser: Dispatch<SetStateAction<IUsuarioToSave>>;
  setCurrentStep: Dispatch<SetStateAction<number>>;
}

function Step1({ state, usuario, setValuesOfUser, setCurrentStep }: Props) {
  const [educaciones, setEducaciones] = useState<IEducacion[]>();
  const [grados, setGrados] = useState<IGrado[]>();

  useEffect(() => {
    getAllEducaciones().then((response) => {
      setEducaciones(response.data.data);
    });
    getAllGrados().then((response) => {
      setGrados(response.data.data);
    });
  }, []);

  function handleNextStep() {
    if (state.nombreInstitucion && state.educacionId && state.gradoId) {
      setCurrentStep(2);
    } else {
      toast.error("Por favor, llena todos los campos", {
        style: {
          background: "red",
          color: "#fff",
        },
        className: "class",
      });
    }
  }

  console.log(state);

  return (
    <div>
      <section className="flex flex-col items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={usuario.picture} alt={usuario.name} className="w-full h-full" />
        </Avatar>
        <h2 className="text-center flex gap-2 items-center ">
          ¡Hola <span className="font-bold">{usuario.name}</span>! 🎉
        </h2>
        <p className="text-center text-slate-600 dark:text-white">Bienvenid@ a Smart Teacher</p>
        <p className="text-center text-slate-600 dark:text-white">
          A continuación, te haremos algunas preguntas para personalizar tus sesiones de la mejor manera posible.
        </p>
      </section>

      <section className="my-8 flex flex-col gap-2">
        <Label htmlFor="email">Institución Educativa</Label>
        <Input
          onChange={(e) => {
            setValuesOfUser((prevState) => ({
              ...prevState,
              nombreInstitucion: e.target.value,
            }));
          }}
          type="text"
          placeholder="Institución Educativa"
          className="dark:bg-white dark:text-black"
          value={state.nombreInstitucion}
        />
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Por favor, asegúrate de colocar de manera correcta el nombre de la institución, este nombre irá en los documentos.
        </span>
      </section>

      <section className="w-full flex flex-col gap-2">
        <CustomSelectCI
          array={educaciones || []}
          setValuesOfUser={setValuesOfUser}
          placeholder="Selecciona una educación"
          valueToSet="educacionId"
          label="Educación"
          state={state}
        />
      </section>

      <section className="w-full flex flex-col gap-2 mt-4">
        <CustomSelectCI
          array={grados || []}
          setValuesOfUser={setValuesOfUser}
          placeholder="Selecciona un grado"
          valueToSet="gradoId"
          label="Grado"
          state={state}
        />
      </section>

      <CustomInputCI handleNextStep={handleNextStep} />
    </div>
  );
}

export default Step1;
