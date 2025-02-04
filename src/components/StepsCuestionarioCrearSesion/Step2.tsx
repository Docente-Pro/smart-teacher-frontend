import { ICuestionarioSesion } from "@/constants/initialStateCuestionarioSesion";
import { ICompetencia } from "@/interfaces/ICompetencia";
import { IUsuario } from "@/interfaces/IUsuario";
import { getCompetencyById } from "@/services/competencias.service";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { getCapacidadByCompentenciaId } from "@/services/capacidades.service";
import { ICapacidad } from "@/interfaces/ICapacidad";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import CustomButtonCrearSesion from "@/utils/CuestionarioCrearSesion/CustomButtonCrearSesion";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuarioFromState: IUsuario;
  cuestionarioState: ICuestionarioSesion;
  setCuestionarioState: Dispatch<SetStateAction<ICuestionarioSesion>>;
}

function Step2({ pagina, setPagina, cuestionarioState, setCuestionarioState }: Props) {
  const [competencias, setCompetencias] = useState<ICompetencia[]>();
  const [capacidades, setCapacidades] = useState<ICapacidad[]>();
  const [capacidadesSeleccionadas, setCapacidadesSeleccionadas] = useState<ICapacidad[]>([]);

  useEffect(() => {
    if (cuestionarioState.area) {
      getCompetencyById(cuestionarioState.area).then((response) => {
        setCompetencias(response.data.data);
      });
    }
  }, []);

  useEffect(() => {
    if (cuestionarioState.competencia) {
      getCapacidadByCompentenciaId(cuestionarioState.competencia).then((response) => {
        setCapacidades(response.data.data);
      });
    }
  }, [cuestionarioState.competencia]);

  
  function handleClick(prop: string | number, value: string | number) {
    setCuestionarioState((prevState: ICuestionarioSesion) => ({
      ...prevState,
      [prop]: value,
    }));
  }

  function handleCapacidadesSeleccionadas(capacidad: ICapacidad) {
    const capacidadExist = capacidadesSeleccionadas.find((cap) => cap.id === capacidad.id);
    if (capacidadExist) {
      setCapacidadesSeleccionadas(capacidadesSeleccionadas.filter((cap) => cap.id !== capacidad.id));
    } else {
      setCapacidadesSeleccionadas([...capacidadesSeleccionadas, capacidad]);
    }
  }

  useEffect(() => {
    setCuestionarioState((prevState: ICuestionarioSesion) => ({
      ...prevState,
      capacidades: capacidadesSeleccionadas.map((cap) => cap.id),
    }));
  }, [capacidadesSeleccionadas]);

  function handleNextStep() {
    if (cuestionarioState.competencia && cuestionarioState.capacidades.length > 0) {
      setPagina(pagina + 1);
    } else {
      handleToaster("Por favor selecciona una competencia y al menos una capacidad", "error");
    }
  }

  return (
    <div>
      <section className="my-4">
        <h1 className="text-2xl font-bold">Competencias</h1>
        <h2>Ahora vamos a seleccionar las competencias respectivas según el área designada.</h2>
      </section>

      {/* Competencias */}
      <section className="my-8 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Selecciona la competencia</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {competencias?.map((competencia) => (
            <div
              key={competencia.id} 
              className={`flex flex-col items-center justify-center p-4 text-black shadow-md rounded-md dark:text-white cursor-pointer border ${
                cuestionarioState.competencia === competencia.id ? "opacity-100 border border-black dark:border dark:border-white" : "opacity-50"
              } hover:bg-slate-100 dark:hover:bg-slate-800`}
              onClick={() => handleClick("competencia", competencia.id)}
            >
              <h3 className="text-left font-bold text-sm">{competencia.nombre}</h3>
              {/* <p>{area.descripcion}</p> */}
            </div>
          ))}
        </div>
      </section>

      {/* Capacidades */}
      <section className="my-8 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Selecciona las capacidades</h2>
        <p>Debes elegir como mínimo una capacidad.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {capacidades?.map((capacidad) => (
            <div
              key={capacidad.id}
              className={`flex flex-col items-center justify-center p-4 text-black shadow-md rounded-md dark:text-white cursor-pointer border ${
                capacidadesSeleccionadas.find((cap) => capacidad.id === cap.id) ? "opacity-100 border border-black dark:border dark:border-white" : "opacity-50"
              } hover:bg-slate-100 dark:hover:bg-slate-800`}
              onClick={() => handleCapacidadesSeleccionadas(capacidad)}
            >
              <h3 className="text-left font-bold text-sm">{capacidad.nombre}</h3>
              {/* <p>{area.descripcion}</p> */}
            </div>
          ))}
        </div>
      </section>

      <CustomButtonCrearSesion
        pagina={pagina + 1}
        isPaginaBefore
        setPaginaBefore={() => setPagina(pagina - 1)}
        handleNext={handleNextStep}
      />
    </div>
  );
}

export default Step2;
