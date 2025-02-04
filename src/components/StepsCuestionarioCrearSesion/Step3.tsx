import { ICuestionarioSesion } from "@/constants/initialStateCuestionarioSesion";
import { IUsuario } from "@/interfaces/IUsuario";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import CustomButtonCrearSesion from "@/utils/CuestionarioCrearSesion/CustomButtonCrearSesion";
import { generarCriteriosIA } from "@/services/criterios.service";
import { ICriterioReceived } from "@/interfaces/ICriterio";
import { IEnfoqueReceived } from "@/interfaces/IEnfoque";

interface Props {
  pagina: number;
  setPagina: (pagina: number) => void;
  usuarioFromState: IUsuario;
  cuestionarioState: ICuestionarioSesion;
  setCuestionarioState: Dispatch<SetStateAction<ICuestionarioSesion>>;
}

function Step3({ pagina, setPagina, usuarioFromState, cuestionarioState, setCuestionarioState }: Props) {
  const [criterios, setCriterios] = useState<ICriterioReceived[]>([]);
  const [criteriosSeleccionados, setCriteriosSeleccionados] = useState<ICriterioReceived[]>([]);
  const [enfoques, setEnfoques] = useState<IEnfoqueReceived[]>([]);
  const [enfoquesSeleccionados, setEnfoquesSeleccionados] = useState<IEnfoqueReceived[]>([]);

  useEffect(() => {
    if (cuestionarioState.area && cuestionarioState.duracion && cuestionarioState.competencia) {
      generarCriteriosIA({
        area: cuestionarioState.area,
        duracion: cuestionarioState.duracion,
        competencia: cuestionarioState.competencia,
        capacidades: cuestionarioState.capacidades,
        grado: usuarioFromState.gradoId,
        problematica: usuarioFromState.problematicaId,
        unidad: usuarioFromState.unidadId,
      })
        .then((response) => {
          setCriterios(response.data.data.criterios);
          setEnfoques(response.data.data.enfoques);
        })
        .catch((_error) => {
          handleToaster("Error al generar los criterios y enfoques", "error");
        });
    }
  }, []);

  function handleCriteriosSeleccionados(criterio: ICriterioReceived) {
    const criterioExist = criteriosSeleccionados.find((crit) => crit.id === criterio.id);
    if (criterioExist) {
      setCriteriosSeleccionados(criteriosSeleccionados.filter((crit) => crit.id !== criterio.id));
    } else {
      setCriteriosSeleccionados([...criteriosSeleccionados, criterio]);
    }
  }

  function handleEnfoquesSeleccionados(enfoque: IEnfoqueReceived) {
    const enfoqueExist = enfoquesSeleccionados.find((enf) => enf.id === enfoque.id);
    if (enfoqueExist) {
      setEnfoquesSeleccionados(enfoquesSeleccionados.filter((enf) => enf.id !== enfoque.id));
    } else {
      setEnfoquesSeleccionados([...enfoquesSeleccionados, enfoque]);
    }
  }

  useEffect(() => {
    setCuestionarioState((prevState: ICuestionarioSesion) => ({
      ...prevState,
      criteriosEvaluacion: criteriosSeleccionados.map((crit) => crit.criterio),
      enfoques: enfoquesSeleccionados.map((enf) => enf.id),
    }));
  }, [criteriosSeleccionados, enfoquesSeleccionados]);

  function handleNextStep() {
    if (cuestionarioState.criteriosEvaluacion.length > 0 && cuestionarioState.enfoque.length > 0) {
      setPagina(pagina + 1);
    } else {
      handleToaster("Por favor selecciona al menos un criterio de evaluación y un enfoque", "error");
    }
  }

  console.log(criterios)

  return (
    <div>
      <section className="my-4">
        <h1 className="text-2xl font-bold">Criterios de Evaluación</h1>
        <h2>Selecciona los criterios de evaluación generados por la IA.</h2>
      </section>

      {/* Criterios */}
      <section className="my-8 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Selecciona los criterios de evaluación</h2>
        <p>Debes elegir como mínimo un criterio.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {criterios?.map((criterio) => (
            <div
              key={criterio.id}
              className={`flex flex-col items-center justify-center p-4 text-black shadow-md rounded-md dark:text-white cursor-pointer border ${
                criteriosSeleccionados.find((crit) => criterio.id === crit.id)
                  ? "opacity-100 border border-black dark:border dark:border-white"
                  : "opacity-50"
              } hover:bg-slate-100 dark:hover:bg-slate-800`}
              onClick={() => handleCriteriosSeleccionados(criterio)}
            >
              <h3 className="text-left font-bold text-sm">{criterio.criterio}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Enfoques */}
      <section className="my-8 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Selecciona los enfoques</h2>
        <p>Debes elegir como mínimo un enfoque.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enfoques?.map((enfoque) => (
            <div
              key={enfoque.id}
              className={`flex flex-col items-center justify-center p-4 text-black shadow-md rounded-md dark:text-white cursor-pointer border ${
                enfoquesSeleccionados.find((enf) => enfoque.id === enf.id)
                  ? "opacity-100 border border-black dark:border dark:border-white"
                  : "opacity-50"
              } hover:bg-slate-100 dark:hover:bg-slate-800`}
              onClick={() => handleEnfoquesSeleccionados(enfoque)}
            >
              <h3 className="text-left font-bold text-sm">{enfoque.enfoque}</h3>
              <p className="text-left text-sm">{enfoque.descripcion}</p>
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

export default Step3;
