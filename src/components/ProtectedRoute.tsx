import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthStore } from '@/store/auth.store';
import LoadingComponent from '@/components/LoadingComponent';

/**
 * Componente de protección de rutas - Versión simplificada
 * 
 * Reglas:
 * 1. No autenticado → /login
 * 2. Perfil incompleto → /onboarding  
 * 3. Free sin sesiones → /planes
 * 4. Premium vencido (pero NO free) → /suscripcion-vencida
 * 5. Todo bien → muestra children
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: auth0Loading } = useAuth0();
  const { user, isLoading: storeLoading } = useAuthStore();

  const isLoading = auth0Loading || storeLoading;

  useEffect(() => {
    // Esperar a que termine de cargar
    if (isLoading) return;

    // Rutas que no requieren validación adicional
    const noValidationRoutes = ['/login', '/signup', '/onboarding', '/planes', '/suscripcion-vencida'];
    if (noValidationRoutes.includes(location.pathname)) {
      return;
    }

    // 1. No autenticado → login
    if (!isAuthenticated || !user) {
      console.log('🔒 ProtectedRoute: No autenticado, redirigiendo a /login');
      navigate('/login', { replace: true });
      return;
    }

    // 2. Perfil incompleto → onboarding
    if (!user.perfilCompleto) {
      console.log('⚠️ ProtectedRoute: Perfil incompleto, redirigiendo a /onboarding');
      navigate('/onboarding', { replace: true });
      return;
    }

    // 3. Usuario FREE sin sesiones → planes
    if (user.plan === 'free' && user.sesionesRestantes === 0) {
      console.log('📦 ProtectedRoute: Free sin sesiones, redirigiendo a /planes');
      navigate('/planes', { 
        replace: true,
        state: { message: 'Has usado tus 2 sesiones gratuitas. Actualiza a Premium para continuar.' }
      });
      return;
    }

    // 4. Usuario PREMIUM vencido → renovar (solo si NO es free)
    if (user.plan !== 'free' && !user.suscripcionActiva) {
      console.log('⏰ ProtectedRoute: Premium vencido, redirigiendo a /suscripcion-vencida');
      navigate('/suscripcion-vencida', { replace: true });
      return;
    }

    console.log('✅ ProtectedRoute: Validación OK, mostrando contenido');
  }, [isLoading, isAuthenticated, user?.id, user?.perfilCompleto, user?.plan, user?.sesionesRestantes, user?.suscripcionActiva, location.pathname, navigate]);

  // Mostrar loading mientras valida
  if (isLoading) {
    return <LoadingComponent />;
  }

  // Mostrar children si pasó todas las validaciones
  return <>{children}</>;
};
