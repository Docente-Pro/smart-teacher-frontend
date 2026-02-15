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
export interface ICapacidadSugerida {
  nombre: string;
  justificacion: string;
}

export interface ICompetenciaSugerida {
  competenciaId: number;
  competenciaNombre: string;
  capacidadesSugeridas: ICapacidadSugerida[];
  justificacionGeneral: string;
  recomendacionesDidacticas: string[];
  situacionId?: string; // 🆕 ID de la situación significativa
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
 * @param temaId - ID del tema curricular (0 o null si es tema personalizado)
 * @param temaTexto - Texto del tema (para temas personalizados)
 * @returns Competencia sugerida con razonamiento
 */
async function sugerirCompetencia(
  areaId: number,
  temaId: number | null,
  temaTexto?: string
): Promise<AxiosResponse<SugerenciaCompetenciaResponse>> {
  return await instance.post("/ia/sugerir-competencia", {
    areaId,
    temaId,
    temaTexto,
  });
}

export { getAllCompetencies, getCompetencyById, sugerirCompetencia };
