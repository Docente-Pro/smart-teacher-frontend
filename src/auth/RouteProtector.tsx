import LoadingComponent from "@/components/LoadingComponent";
import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
}

function RouteProtector({ children }: Props) {
  const { isAuthenticated, isLoading, loginWithRedirect, getIdTokenClaims, logout, user } = useAuth0();
  const [hasSubscriberRole, setHasSubscriberRole] = useState<boolean | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const claims = await getIdTokenClaims();

        if (claims) {
          const roles = claims["https://docente-pro.com/roles"] || [];
          setHasSubscriberRole(roles.includes("Subscriber"));
        } else {
          setHasSubscriberRole(false);
        }
      } catch (error) {
        console.error("Error al verificar roles:", error);
        setHasSubscriberRole(false);
      } finally {
        setIsCheckingRole(false);
      }
    };

    if (isAuthenticated) {
      checkUserRole();
    }
  }, [isAuthenticated, getIdTokenClaims]);

  // Mostrar loading mientras Auth0 está cargando
  if (isLoading) {
    return <LoadingComponent />;
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    loginWithRedirect();
    return <LoadingComponent />;
  }

  // Mostrar loading mientras se verifican los roles
  if (isCheckingRole) {
    return <LoadingComponent />;
  }

  console.log(user);

  // Denegar acceso si no tiene el rol de Subscriber
  if (hasSubscriberRole === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
        <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        <button
          onClick={() =>
            logout({
              logoutParams: { returnTo: window.location.origin },
            })
          }
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  // Renderizar contenido protegido solo si tiene el rol
  return <>{children}</>;
}

export default RouteProtector;
