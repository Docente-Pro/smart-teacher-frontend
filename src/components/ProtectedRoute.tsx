import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthStore } from '@/store/auth.store';
import LoadingComponent from '@/components/LoadingComponent';

/**
 * Componente de protección de rutas
 * 
 * Reglas:
 * 1. No autenticado → /login
 * 2. Perfil incompleto → /onboarding  
 * 3. Free sin sesiones en rutas de CREACIÓN → /planes
 *    (dashboard, mis-sesiones, sesion/:id, evaluaciones, crear-unidad → siempre accesibles)
 *    crear-unidad se permite porque el wizard interno gestiona el pago
 * 4. Premium vencido (pero NO free) → /suscripcion-vencida
 * 5. Todo bien → muestra children
 * 
 * IMPORTANTE: No renderiza children hasta que la validación sea exitosa.
 * Esto evita renders innecesarios de Dashboard/Onboarding durante redirects.
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated: auth0Authenticated, isLoading: auth0Loading } = useAuth0();
  const { user, isLoading: storeLoading, isAuthenticated: storeAuthenticated } = useAuthStore();
  const lastRedirectRef = useRef<string | null>(null);

  // Autenticado si Auth0 SDK O el Zustand store dicen que sí
  const isAuthenticated = auth0Authenticated || storeAuthenticated;

  // Auth0 autenticado pero store aún sin usuario → useAuthFlow está sincronizando
  const isSyncing = !auth0Loading && auth0Authenticated && !user && !storeLoading;
  const isLoading = auth0Loading || storeLoading || isSyncing;

  // Calcular estado de validación de forma síncrona (sin useEffect)
  const validationResult = useMemo(() => {
    if (isLoading) return { status: 'loading' as const };

    // 1. No autenticado → login (SIEMPRE se valida, sin excepciones)
    if (!isAuthenticated || !user) {
      return { status: 'redirect' as const, to: '/login', reason: 'no-auth' };
    }

    // A partir de aquí el usuario SÍ está autenticado.
    // Evitar redirect loops: no redirigir a la ruta en la que ya estamos.
    const currentPath = location.pathname;

    // 2. Perfil incompleto → onboarding (salvo que ya estemos en /onboarding)
    if (!user.perfilCompleto && currentPath !== '/onboarding') {
      return { status: 'redirect' as const, to: '/onboarding', reason: 'perfil-incompleto' };
    }

    // 3. Usuario FREE sin sesiones en rutas de CREACIÓN → planes
    //    Rutas de lectura (dashboard, mis-sesiones, sesion/:id, evaluaciones, planes) siguen accesibles.
    //    /crear-unidad también se permite: el wizard interno (Step0TipoUnidad) gestiona el pago.
    const FREE_ALLOWED_PATHS = ['/dashboard', '/mis-sesiones', '/sesion', '/evaluaciones', '/planes', '/result', '/graficos', '/crear-unidad'];
    const isReadOnlyPath = FREE_ALLOWED_PATHS.some((p) => currentPath.startsWith(p));

    if (user.plan === 'free' && user.sesionesRestantes === 0 && !isReadOnlyPath) {
      return { 
        status: 'redirect' as const, 
        to: '/planes', 
        reason: 'free-sin-sesiones',
        state: { message: 'Has usado tus 2 sesiones gratuitas. Actualiza a Premium para continuar creando.' }
      };
    }

    // 4. Usuario PREMIUM vencido → renovar (salvo que ya estemos en /suscripcion-vencida)
    if (user.plan !== 'free' && !user.suscripcionActiva && currentPath !== '/suscripcion-vencida') {
      return { status: 'redirect' as const, to: '/suscripcion-vencida', reason: 'premium-vencido' };
    }

    return { status: 'valid' as const };
  }, [isLoading, isAuthenticated, user, location.pathname]);

  // Ejecutar redirect una sola vez por destino
  useEffect(() => {
    if (validationResult.status !== 'redirect') {
      lastRedirectRef.current = null;
      return;
    }

    const target = validationResult.to;
    // Evitar redirect repetido al mismo destino
    if (lastRedirectRef.current === target) return;
    lastRedirectRef.current = target;

    console.log(`🔒 ProtectedRoute: ${validationResult.reason} → ${target}`);
    navigate(target, { 
      replace: true, 
      ...(validationResult.state ? { state: validationResult.state } : {})
    });
  }, [validationResult, navigate]);

  // Loading: Auth0 cargando, store cargando, o useAuthFlow sincronizando
  if (isLoading) {
    return <LoadingComponent />;
  }

  // Redirect pendiente: NO renderizar children (evita renders innecesarios)
  if (validationResult.status === 'redirect') {
    return <LoadingComponent />;
  }

  // Validación exitosa → renderizar children
  return <>{children}</>;
};
