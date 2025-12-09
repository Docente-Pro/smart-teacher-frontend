import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

interface UserStatus {
  isPremium: boolean;
  isLoading: boolean;
  user: any;
}

export function useUserStatus(): UserStatus {
  const { user, isLoading: auth0Loading } = useAuth0();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth0Loading && user) {
      // Verificar si el usuario tiene el rol 'Subscriber' en Auth0
      const roles = user?.["https://docente-pro.com/roles"] || [];
      const hasPremium = roles.includes("Subscriber");
      setIsPremium(hasPremium);
      setIsLoading(false);
    } else if (!auth0Loading) {
      setIsLoading(false);
    }
  }, [user, auth0Loading]);

  return {
    isPremium,
    isLoading,
    user,
  };
}
