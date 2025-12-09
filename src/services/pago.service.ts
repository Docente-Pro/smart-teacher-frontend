import { instance } from "./instance";
import { IPreferenciaPagoRequest, IPreferenciaPagoResponse } from "@/interfaces/ISuscripcion";
import { IPagoHistorialResponse } from "@/interfaces/IPago";

/**
 * Servicio para gestión de pagos con Mercado Pago
 */

/**
 * Crear preferencia de pago en Mercado Pago
 * @param data - Datos del usuario y plan seleccionado
 * @returns URL de checkout de Mercado Pago
 */
export const crearPreferenciaPago = async (
  data: IPreferenciaPagoRequest
): Promise<IPreferenciaPagoResponse> => {
  try {
    const response = await instance.post<IPreferenciaPagoResponse>(
      "/pago/crear-preferencia",
      data
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al crear preferencia de pago:", error);
    throw new Error(
      error.response?.data?.message || "Error al procesar el pago"
    );
  }
};

/**
 * Obtener historial de pagos del usuario
 * @param usuarioId - ID del usuario
 * @returns Historial de pagos
 */
export const obtenerHistorialPagos = async (
  usuarioId: string
): Promise<IPagoHistorialResponse> => {
  try {
    const response = await instance.get<IPagoHistorialResponse>(
      `/pago/usuario/${usuarioId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener historial de pagos:", error);
    throw new Error(
      error.response?.data?.message || "Error al obtener historial de pagos"
    );
  }
};
