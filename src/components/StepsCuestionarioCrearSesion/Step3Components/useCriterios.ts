import { useState, useEffect } from "react";
import { ICriterioIA, ICriterioContexto } from "@/interfaces/ICriterio";
import { generarCriteriosIA } from "@/services/criterios.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";

interface UseCriteriosParams {
  areaId: number | null;
  gradoId: number;
  competenciaId: number | null;
  problematicaId: number | undefined;
  perfilCompleto: boolean | undefined;
}

export function useCriterios({
  areaId,
  gradoId,
  competenciaId,
  problematicaId,
  perfilCompleto,
}: UseCriteriosParams) {
  const [criterios, setCriterios] = useState<ICriterioIA[]>([]);
  const [criteriosSeleccionados, setCriteriosSeleccionados] = useState<ICriterioIA[]>([]);
  const [contexto, setContexto] = useState<ICriterioContexto | null>(null);
  const [loadingCriterios, setLoadingCriterios] = useState(true);
  const [criterioEnEdicion, setCriterioEnEdicion] = useState<string | null>(null);
  const [criterioEditado, setCriterioEditado] = useState<ICriterioIA | null>(null);

  useEffect(() => {
    async function cargarCriterios() {
      if (areaId && perfilCompleto && competenciaId) {
        // Validar que tenga problemática
        if (!problematicaId) {
          handleToaster("Debes seleccionar una problemática antes de generar criterios", "warning");
          setLoadingCriterios(false);
          return;
        }

        setLoadingCriterios(true);
        try {
          const response = await generarCriteriosIA({
            areaId,
            gradoId,
            competenciaId,
            problematicaId,
          });

          const criteriosData = response.data.criterios || response.data.data?.criterios || [];
          const contextoData = response.data.contexto || response.data.data?.contexto || null;

          setCriterios(criteriosData);
          setContexto(contextoData);
          
          // Solo mostrar error si no se obtuvieron criterios
          if (!criteriosData || criteriosData.length === 0) {
            console.warn("No se generaron criterios");
          }
        } catch (error) {
          console.error("Error al cargar criterios:", error);
          // Solo mostrar toast si realmente hubo un error de red/servidor
          setCriterios([]);
          setContexto(null);
          handleToaster("Error al generar los criterios de evaluación", "error");
        } finally {
          setLoadingCriterios(false);
        }
      }
    }

    cargarCriterios();
  }, [areaId, competenciaId, gradoId, perfilCompleto, problematicaId]);

  function handleCriteriosSeleccionados(criterio: ICriterioIA) {
    const criterioExist = criteriosSeleccionados.find((crit) => crit.id === criterio.id);
    if (criterioExist) {
      setCriteriosSeleccionados(criteriosSeleccionados.filter((crit) => crit.id !== criterio.id));
    } else {
      setCriteriosSeleccionados([...criteriosSeleccionados, criterio]);
    }
  }

  function handleEditarCriterio(criterio: ICriterioIA, e: React.MouseEvent) {
    e.stopPropagation();
    setCriterioEnEdicion(criterio.id);
    setCriterioEditado({ ...criterio });
  }

  function handleGuardarEdicion(e: React.MouseEvent) {
    e.stopPropagation();
    if (!criterioEditado) return;

    // Actualizar en la lista de criterios
    setCriterios((prev) =>
      prev.map((crit) => (crit.id === criterioEditado.id ? criterioEditado : crit))
    );

    // Si estaba seleccionado, actualizar también en seleccionados
    setCriteriosSeleccionados((prev) =>
      prev.map((crit) => (crit.id === criterioEditado.id ? criterioEditado : crit))
    );

    setCriterioEnEdicion(null);
    setCriterioEditado(null);
    handleToaster("Criterio actualizado", "success");
  }

  function handleCancelarEdicion(e: React.MouseEvent) {
    e.stopPropagation();
    setCriterioEnEdicion(null);
    setCriterioEditado(null);
  }

  function handleCambioCampo(campo: keyof ICriterioIA, valor: string) {
    if (!criterioEditado) return;

    setCriterioEditado((prev) => {
      if (!prev) return null;

      const actualizado = { ...prev, [campo]: valor };

      // Reconstruir criterioCompleto
      actualizado.criterioCompleto = `${actualizado.habilidad} ${actualizado.conocimiento} ${actualizado.condicion} ${actualizado.finalidad}`;

      return actualizado;
    });
  }

  return {
    criterios,
    criteriosSeleccionados,
    contexto,
    loadingCriterios,
    criterioEnEdicion,
    criterioEditado,
    handleCriteriosSeleccionados,
    handleEditarCriterio,
    handleGuardarEdicion,
    handleCancelarEdicion,
    handleCambioCampo,
  };
}
