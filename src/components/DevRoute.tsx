import { Navigate } from 'react-router';
import { useAuthStore } from '@/store/auth.store';

const ALLOWED_EMAIL = 'angelo.mancilla.developer@gmail.com';

interface DevRouteProps {
  children: React.ReactNode;
}

/**
 * Protege rutas de desarrollo (ej: /graficos, /graficos-areas).
 * Solo permite acceso al email autorizado; cualquier otro usuario
 * es redirigido al dashboard.
 */
export const DevRoute = ({ children }: DevRouteProps) => {
  const user = useAuthStore((state) => state.user);

  if (user?.email !== ALLOWED_EMAIL) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
