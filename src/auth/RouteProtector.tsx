import { GlobalLoading } from "@/components/GlobalLoading";
import { useAuth0 } from "@/hooks/useAuth0";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";

interface Props {
  children: React.ReactNode;
}

function RouteProtector({ children }: Props) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  // Mostrar loading mientras se verifica
  if (isLoading) {
    return <GlobalLoading message="Verificando autenticación..." />;
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    return <GlobalLoading message="Redirigiendo..." />;
  }

  // Renderizar contenido protegido solo si tiene el rol
  return <>{children}</>;
}

export default RouteProtector;
