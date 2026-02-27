import { instance } from "./instance";
import type {
  IGenerarRubricaRequest,
  IGenerarRubricaResponse,
  IGuardarInstrumentoRequest,
  IGuardarInstrumentoResponse,
} from "@/interfaces/IInstrumentoEvaluacion";

// ============================================
// SERVICIO — Instrumentos de Evaluación
// ============================================

/**
 * Genera una rúbrica de evaluación con IA.
 * POST /api/ia/generar-rubrica
 *
 * Solo se usa cuando instrumento === "Rúbrica".
 * Lista de cotejo y Escala valorativa se arman en cliente.
 */
export async function generarRubrica(
  data: IGenerarRubricaRequest,
): Promise<IGenerarRubricaResponse> {
  const response = await instance.post("/ia/generar-rubrica", data, {
    timeout: 120_000, // 2 min — la IA puede tardar
  });
  return response.data;
}

/**
 * Persiste cualquier instrumento de evaluación (lista de cotejo, escala, rúbrica).
 * POST /api/ia/guardar-instrumento
 *
 * Si se envía sesionId, se usa como nombre del archivo en S3.
 */
export async function guardarInstrumento(
  data: IGuardarInstrumentoRequest,
): Promise<IGuardarInstrumentoResponse> {
  const response = await instance.post("/ia/guardar-instrumento", data);
  return response.data;
}
