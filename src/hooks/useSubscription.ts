import { useState, useEffect } from 'react';
import { getUsuarioById } from '@/services/usuarios.service';
import { PlanType } from '@/interfaces/ISuscripcion';

interface UseSubscriptionReturn {
  isPremium: boolean;
  plan: PlanType;
  isActive: boolean;
  expiresAt: string | null;
  sessionsUsed: number;
  sessionsLimit: number;
  canCreateSession: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook personalizado para gestionar el estado de suscripción del usuario
 * @param userId - ID del usuario autenticado
 * @returns Estado de suscripción y funciones útiles
 */
export const useSubscription = (userId: string | null): UseSubscriptionReturn => {
  const [subscriptionData, setSubscriptionData] = useState<UseSubscriptionReturn>({
    isPremium: false,
    plan: 'free',
    isActive: false,
    expiresAt: null,
    sessionsUsed: 0,
    sessionsLimit: 2,
    canCreateSession: false,
    isLoading: true,
    error: null,
    refetch: async () => {},
  });

  const fetchSubscription = async () => {
    if (!userId) {
      setSubscriptionData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Usuario no autenticado',
      }));
      return;
    }

    try {
      setSubscriptionData(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await getUsuarioById(userId);
      const userData = response.data.data;

      // Contar sesiones del usuario
      const sessionsUsed = userData.sesiones?.length || 0;
      const sessionsLimit = 2;

      // Verificar estado de suscripción
      const suscripcion = userData.suscripcion;
      const isPremium = suscripcion?.activa && 
                       (suscripcion.plan === 'premium_mensual' || suscripcion.plan === 'premium_anual');
      
      const plan: PlanType = suscripcion?.plan || 'free';
      const isActive = suscripcion?.activa || false;
      const expiresAt = suscripcion?.fechaFin || null;

      // Usuario puede crear sesión si:
      // 1. Tiene plan premium activo, O
      // 2. Es plan free y no ha usado sus 2 sesiones gratuitas
      const canCreateSession = isPremium || sessionsUsed < sessionsLimit;

      setSubscriptionData({
        isPremium,
        plan,
        isActive,
        expiresAt,
        sessionsUsed,
        sessionsLimit,
        canCreateSession,
        isLoading: false,
        error: null,
        refetch: fetchSubscription,
      });

    } catch (error: any) {
      console.error('Error al obtener suscripción:', error);
      setSubscriptionData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error al cargar suscripción',
      }));
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [userId]);

  return subscriptionData;
};
