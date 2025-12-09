export interface IPagoHistorialResponse {
  message: string;
  data: Array<{
    id: string;
    mercadopagoId: string;
    estado: 'approved' | 'pending' | 'rejected' | 'cancelled';
    monto: number;
    moneda: string;
    descripcion: string;
    metodoPago: string;
    createdAt: string;
  }>;
}
