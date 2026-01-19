import { instance } from "./instance";
import { AxiosResponse } from "axios";

function getAllCompetencies() {
  return instance.get("/competencia");
}

function getCompetencyById(id: number) {
  return instance.get(`/competencia/area/${id}`);
}

/**
 * Interfaz para la respuesta de sugerencia de competencia
 */
export interface ICompetenciaSugerida {
  competenciaId: number;
  competencia: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  razonamiento: string;
  tema: {
    id: number;
    nombre: string;
  };
}

/**
 * Interfaz para la respuesta del endpoint
 */
export interface SugerenciaCompetenciaResponse {
  success: boolean;
  data: ICompetenciaSugerida;
  message: string;
}

/**
 * Solicita a la IA que sugiera la competencia más apropiada para un tema
 * @param areaId - ID del área curricular
 * @param temaId - ID del tema curricular
 * @returns Competencia sugerida con razonamiento
 */
async function sugerirCompetencia(
  areaId: number,
  temaId: number
): Promise<AxiosResponse<SugerenciaCompetenciaResponse>> {
  return await instance.post("/ia/sugerir-competencia", {
    areaId,
    temaId,
  });
}

export { getAllCompetencies, getCompetencyById, sugerirCompetencia };
