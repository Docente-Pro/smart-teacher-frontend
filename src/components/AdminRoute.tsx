import { Navigate } from "react-router";
import { useAdminStore } from "@/store/admin.store";

/**
 * Protege rutas de admin.
 * Si no hay token admin → redirige a /admin/login.
 */
interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated } = useAdminStore();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
