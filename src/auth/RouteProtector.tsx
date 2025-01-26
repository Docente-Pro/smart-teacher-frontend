import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
}

function RouteProtector({ children }: Props) {
  const { isAuthenticated, isLoading, loginWithRedirect, getIdTokenClaims, logout } = useAuth0();
  const [hasRole, setHasRole] = useState(false);

  console.log(hasRole);

  useEffect(() => {
    const checkUserRole = async () => {
      const claims = await getIdTokenClaims();
      console.log('Claims:', claims); // Agrega este console.log para inspeccionar los claims

      if (claims) {
        const roles = claims["https://smart-teacher.com/roles"] || []; // Usa el mismo namespace aquí
        setHasRole(roles.includes("Subscriber"));
      }
    };

    if (isAuthenticated) {
      checkUserRole();
    }
  }, [isAuthenticated, getIdTokenClaims]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return <div>Redirecting...</div>;
  }

  if (!hasRole) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        Access Denied
        <button onClick={() => logout()} className="bg-red-500 text-white p-4 rounded-2xl">
          Logout
        </button>
      </div>
    );
  }

  return children;
}

export default RouteProtector;
