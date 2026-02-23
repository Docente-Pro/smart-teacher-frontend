import { useMemo } from 'react';
import { Navigate } from 'react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthStore } from '@/store/auth.store';
import LoadingComponent from '@/components/LoadingComponent';

/**
 * Inverso de ProtectedRoute: protege rutas que solo deben ver usuarios NO autenticados.
 *
 * Si el usuario ya está logueado → redirige a /dashboard.
 * Si no está logueado → renderiza children (login, signup, landing, etc.).
 */
interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute = ({ children }: GuestRouteProps) => {
  const { isAuthenticated: auth0Authenticated, isLoading: auth0Loading } = useAuth0();
  const { user, isLoading: storeLoading, isAuthenticated: storeAuthenticated } = useAuthStore();

  const isAuthenticated = auth0Authenticated || storeAuthenticated;
  const isSyncing = !auth0Loading && auth0Authenticated && !user && !storeLoading;
  const isLoading = auth0Loading || storeLoading || isSyncing;

  const result = useMemo(() => {
    if (isLoading) return 'loading' as const;
    if (isAuthenticated && user) return 'redirect' as const;
    return 'guest' as const;
  }, [isLoading, isAuthenticated, user]);

  if (result === 'loading') return <LoadingComponent />;
  if (result === 'redirect') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};
