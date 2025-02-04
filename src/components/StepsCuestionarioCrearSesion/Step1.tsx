import { ICuestionarioSesion } from "@/constants/initialStateCuestionarioSesion";
import { IArea } from "@/interfaces/IArea";
import { IUsuario } from "@/interfaces/IUsuario";
import { getAllAreas } from "@/services/areas.service";
import CustomButtonCrearSesion from "@/utils/CuestionarioCrearSesion/CustomButtonCrearSesion";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuarioFromState: IUsuario;
  cuestionarioState: ICuestionarioSesion;
  setCuestionarioState: Dispatch<SetStateAction<ICuestionarioSesion>>;
}

const tiemposEstudio = [
  {
    id: 1,
    nombre: "Corta",
    descripcion: "30 minutos",
  },
  {
    id: 2,
    nombre: "Media",
    descripcion: "1 hora",
  },
  {
    id: 3,
    nombre: "Larga",
    descripcion: "2 horas",
  },
];

function Step1({ pagina, setPagina, usuarioFromState, cuestionarioState, setCuestionarioState }: Props) {
  const [areas, setAreas] = useState<IArea[]>();

  useEffect(() => {
    getAllAreas()
      .then((response) => {
        setAreas(response.data.data);
      })
      .catch((_error) => {
        handleToaster("Error al cargar las áreas", "error");
      });
  }, []);

  function handleClick(prop: string | number, value: string | number) {
    setCuestionarioState((prevState: ICuestionarioSesion) => ({
      ...prevState,
      [prop]: value,
    }));
  }

  function handleNextStep() {
    if (cuestionarioState.area && cuestionarioState.duracion) {
      setPagina(pagina + 1);
    } else {
      handleToaster("Por favor selecciona un área y un tiempo de estudio", "error");
    }
  }

  return (
    <div>
      <section className="flex flex-col items-center justify-center my-4 gap-4">
        <h1 className="text-2xl font-bold">Crear Sesión</h1>
        <p>Hola, {usuarioFromState.nombre}, a continuación vamos a crear una sesión de estudio a medida para ti.</p>
      </section>

      {/* Areas */}
      <section className="my-4 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Selecciona el área </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas?.map((area) => (
            <div
              key={area.id}
              className={`flex flex-col items-center justify-center p-4 text-white shadow-md rounded-md cursor-pointer ${
                cuestionarioState.area === area.id ? "opacity-100" : "opacity-50"
              }`}
              style={{ backgroundColor: area.color }}
              onClick={() => handleClick("area", area.id)}
            >
              <h3 className="text-lg text-center font-bold">{area.nombre}</h3>
              {/* <p>{area.descripcion}</p> */}
            </div>
          ))}
        </div>
      </section>

      {/* Tiempo */}

      <section className="my-4 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Selecciona el tiempo de estudio</h2>
        <div className="grid grid-cols-3 gap-4">
          {tiemposEstudio.map((tiempo) => (
            <div
              key={tiempo.id}
              className={`flex flex-col items-center justify-center p-4 text-slate-800  dark:text-slate-200 shadow-md rounded-md cursor-pointer border border-blue-500 dark:border-slate-200 hover:bg-blue-500 dark:hover:bg-blue-500 hover:text-white transition-all ease-in-out duration-200 ${
                cuestionarioState.duracion === tiempo.descripcion ? "border-8 bg-blue-500 text-white" : "dark:bg-black"
              }`}
              onClick={() => handleClick("duracion", tiempo.descripcion)}
            >
              <h3 className="text-lg font-bold">{tiempo.nombre}</h3>
              <p>{tiempo.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      <div>
        <CustomButtonCrearSesion pagina={pagina + 1} isPaginaBefore={false} handleNext={handleNextStep} />
      </div>
    </div>
  );
}

export default Step1;
