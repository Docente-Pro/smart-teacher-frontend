import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/auth.store";
import LoadingComponent from "@/components/LoadingComponent";

/**
 * Componente que valida el estado del usuario después del login
 * y redirige a la pantalla correspondiente:
 * 
 * 1. Perfil incompleto → /onboarding (completar datos)
 * 2. Free sin sesiones → /planes (convertir a premium)
 * 3. Premium vencido → /suscripcion-vencida
 * 4. Premium activo → /dashboard
 * 5. Free con sesiones → /dashboard
 */
interface PostLoginValidatorProps {
  children: React.ReactNode;
}

export const PostLoginValidator = ({ children }: PostLoginValidatorProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    // Extraer datos del usuario desde el store
    const userData = user as any;

    // 1. PERFIL INCOMPLETO → Completar onboarding
    if (!userData.perfilCompleto) {
      console.log('Perfil incompleto, redirigiendo a onboarding...');
      navigate('/onboarding');
      return;
    }

    // 2. PLAN FREE SIN SESIONES → Convertir a Premium
    const isFree = userData.plan === 'free';
    const sesionesRestantes = userData.sesionesRestantes || 0;
    
    if (isFree && sesionesRestantes === 0) {
      console.log('Usuario free sin sesiones, redirigiendo a planes...');
      navigate('/planes', { 
        state: { 
          message: 'Has usado tus 2 sesiones gratuitas. Actualiza a Premium para continuar.' 
        } 
      });
      return;
    }

    // 3. PREMIUM VENCIDO → Renovar suscripción
    const isPremium = userData.plan === 'premium_mensual' || userData.plan === 'premium_anual';
    const suscripcionActiva = userData.suscripcionActiva;

    if (isPremium && !suscripcionActiva) {
      console.log('Suscripción vencida, redirigiendo a renovación...');
      navigate('/suscripcion-vencida');
      return;
    }

    // 4. TODO OK → Continuar al dashboard
    // (Premium activo o Free con sesiones disponibles)
    console.log('Usuario validado correctamente');

  }, [isAuthenticated, user, navigate]);

  // Mostrar loading mientras valida
  if (!isAuthenticated || !user) {
    return <LoadingComponent />;
  }

  return <>{children}</>;
};
