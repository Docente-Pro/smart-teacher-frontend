import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import { useUserStatus } from "@/hooks/useUserStatus";
import { getUserByEmail, createUser, createPaymentPreference } from "@/services/api";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import LoadingComponent from "@/components/LoadingComponent";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

function LandingPage() {
  const { user, isAuthenticated, logout } = useAuth0();
  const { isPremium, isLoading: statusLoading } = useUserStatus();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  // Si el usuario es premium, redirigir al dashboard
  if (isAuthenticated && isPremium && !statusLoading) {
    navigate("/dashboard");
    return null;
  }

  const handleUpgradeClick = async () => {
    if (!isAuthenticated || !user) {
      handleToaster("Por favor, inicia sesión primero", "error");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Verificar si el usuario existe en el backend
      let usuarioId: string;

      try {
        const existingUser = await getUserByEmail(user.email!);
        usuarioId = existingUser.data.id;
        console.log("Usuario encontrado:", existingUser.data);
      } catch (error: any) {
        // Si no existe (404), crear el usuario
        if (error.response?.status === 404) {
          console.log("Usuario no encontrado, creando nuevo usuario...");

          const today = new Date().toISOString().split("T")[0];

          const newUserData = {
            nombre: user.name || "Usuario",
            email: user.email!,
            auth0UserId: user.sub,
            nombreInstitucion: "Por definir",
            nivelId: 1,
            gradoId: 1,
            problematicaId: 1,
            suscripcion: {
              fechaInicio: today,
              plan: "free",
            },
          };

          const createdUser = await createUser(newUserData);
          usuarioId = createdUser.data.id;
          console.log("Usuario creado:", createdUser.data);
        } else {
          throw error;
        }
      }

      // 2. Crear preferencia de pago
      console.log("Creando preferencia de pago...");
      const preference = await createPaymentPreference({
        usuarioId,
        planId: "premium_mensual",
      });

      console.log("Preferencia creada:", preference);

      // 3. Redirigir a Mercado Pago
      if (preference.data?.checkoutUrl) {
        window.location.href = preference.data.checkoutUrl;
      } else {
        handleToaster("Error al obtener URL de pago", "error");
      }
    } catch (error: any) {
      console.error("Error en proceso de upgrade:", error);
      handleToaster(
        error.response?.data?.message || "Error al procesar el upgrade. Intenta nuevamente.",
        "error"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (statusLoading) {
    return <LoadingComponent />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header con botón de logout si está autenticado */}
      {isAuthenticated && (
        <div className="absolute top-4 right-4 z-50">
          <Button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            variant="outline"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      )}

      <Hero />
      <Features />
      <Pricing onUpgradeClick={handleUpgradeClick} isLoading={isProcessing} />
      <Footer />
    </div>
  );
}

export default LandingPage;
