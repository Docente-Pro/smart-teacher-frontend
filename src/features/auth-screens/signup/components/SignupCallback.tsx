import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import LoadingComponent from "@/components/LoadingComponent";
import { getPendingUserData, clearPendingUserData, isPendingDataValid } from "../functions/pendingUserStorage";
import { createUserInDatabase, isDuplicateEmailError } from "../functions/createUser";

/**
 * Componente que maneja el callback después del registro en Auth0
 * Crea el usuario en la base de datos con el ID de Auth0
 */
function SignupCallback() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const processUserRegistration = async () => {
      if (!isAuthenticated || !user) return;

      // Obtener datos guardados en localStorage
      const pendingData = getPendingUserData();

      if (!pendingData) {
        // Si no hay datos pendientes, redirigir al dashboard
        navigate("/dashboard");
        return;
      }

      // Validar que los datos no hayan expirado (30 minutos)
      if (!isPendingDataValid(pendingData.timestamp)) {
        clearPendingUserData();
        handleToaster("Los datos del registro expiraron. Intenta nuevamente.", "error");
        navigate("/signup");
        return;
      }

      try {
        // Crear usuario en la base de datos con el ID de Auth0
        await createUserInDatabase(pendingData);

        // Limpiar localStorage
        clearPendingUserData();

        handleToaster("¡Cuenta creada exitosamente!", "success");

        // Redirigir al dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } catch (error: any) {
        console.error("Error al crear usuario en BD:", error);

        // Si el usuario ya existe en la BD, simplemente redirigir
        if (isDuplicateEmailError(error)) {
          clearPendingUserData();
          handleToaster("Bienvenido de vuelta", "info");
          navigate("/dashboard");
        } else {
          handleToaster("Error al completar el registro. Contacta soporte.", "error");
          // Limpiar datos y redirigir al home
          clearPendingUserData();
          navigate("/");
        }
      }
    };

    if (!isLoading) {
      processUserRegistration();
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  return <LoadingComponent />;
}

export default SignupCallback;
