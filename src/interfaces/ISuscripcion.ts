export type PlanType = 'free' | 'premium_mensual' | 'premium_anual';

export type EstadoPago = 'approved' | 'pending' | 'rejected' | 'cancelled';

export interface ISuscripcion {
  plan: PlanType;
  activa: boolean;
  fechaInicio: string;
  fechaFin: string;
}

export interface IPago {
  id: string;
  mercadopagoId: string;
  estado: EstadoPago;
  monto: number;
  moneda: string;
  descripcion: string;
  metodoPago: string;
  createdAt: string;
}

export interface IPreferenciaPagoRequest {
  usuarioId: string;
  planId: 'premium_mensual' | 'premium_anual';
}

export interface IPreferenciaPagoResponse {
  message: string;
  data: {
    preferenceId: string;
    checkoutUrl: string;
    sandboxCheckoutUrl?: string;
  };
}

export interface IPlanFeature {
  text: string;
  included: boolean;
}

export interface IPlan {
  id: PlanType;
  name: string;
  price: number;
  period: string;
  badge?: string;
  badgeColor?: 'primary' | 'success' | 'warning';
  features: IPlanFeature[];
  savings?: string;
  isPopular?: boolean;
  isFree?: boolean;
}
