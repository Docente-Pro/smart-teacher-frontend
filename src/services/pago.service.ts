import { instance } from "./instance";
import { IPreferenciaPagoRequest, IPreferenciaPagoResponse } from "@/interfaces/ISuscripcion";
import { IPagoHistorialResponse } from "@/interfaces/IPago";

/**
 * Servicio para gestión de pagos
 */

// ─── Mercado Pago ───

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

// ─── Pago por Suscripción (WhatsApp manual) ───

export interface ISolicitarPagoRequest {
  plan: "premium_mensual" | "premium_anual";
}

export interface ISolicitarPagoResponse {
  success: boolean;
  message: string;
  data: {
    pago: {
      id: string;
      monto: number;
      estado: "PENDIENTE";
    };
    whatsappLink: string;
  };
}

/**
 * Solicitar pago de suscripción (venta manual por WhatsApp).
 *
 * POST /api/suscripcion/pago/solicitar
 * Body: { plan: "premium_mensual" }
 *
 * 1. Crea un Pago (PENDIENTE) vinculado a la Suscripción del usuario.
 * 2. Emite "pago:nuevo-pendiente" al admin por WebSocket.
 * 3. Devuelve un whatsappLink pre-armado para que el docente
 *    contacte al admin y envíe su comprobante.
 */
export const solicitarPagoSuscripcion = async (
  plan: ISolicitarPagoRequest["plan"] = "premium_mensual"
): Promise<ISolicitarPagoResponse> => {
  try {
    const response = await instance.post<ISolicitarPagoResponse>(
      "/suscripcion/pago/solicitar",
      { plan }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al solicitar pago de suscripción:", error);
    throw new Error(
      error.response?.data?.message || "Error al solicitar el pago"
    );
  }
};

/**
 * Consultar estado del pago de suscripción.
 *
 * GET /api/suscripcion/pago/estado
 */
export const consultarEstadoPago = async () => {
  try {
    const response = await instance.get("/suscripcion/pago/estado");
    return response.data;
  } catch (error: any) {
    console.error("Error al consultar estado de pago:", error);
    throw new Error(
      error.response?.data?.message || "Error al consultar estado del pago"
    );
  }
};
