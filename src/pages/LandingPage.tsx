import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import SessionPreview from "@/components/landing/SessionPreview";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import LandingHeader from "@/components/landing/LandingHeader";
import { useUserStatus } from "@/hooks/useUserStatus";
import {
  getUsuarioByEmail,
  createNewUsuario,
} from "@/services/usuarios.service";
import { crearPreferenciaPago } from "@/services/pago.service";
import type { IPreferenciaPagoRequest } from "@/interfaces/ISuscripcion";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import LoadingComponent from "@/components/LoadingComponent";

function LandingPage() {
  const { user, isAuthenticated } = useAuth0();
  const { isPremium, isLoading: statusLoading } = useUserStatus();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && isPremium && !statusLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isPremium, statusLoading, navigate]);

  const handleUpgradeClick = async (planId: string) => {
    if (!isAuthenticated || !user) {
      handleToaster("Por favor, inicia sesión primero", "error");
      navigate("/login");
      return;
    }

    const checkoutPlanId: IPreferenciaPagoRequest["planId"] =
      planId === "premium_anual" ? "premium_anual" : "premium_mensual";

    setIsProcessing(true);

    try {
      let usuarioId: string;

      try {
        const res = await getUsuarioByEmail({ email: user.email! });
        usuarioId = res.data.data?.id ?? res.data.id;
      } catch (error: any) {
        if (error.response?.status === 404) {
          const today = new Date().toISOString().split("T")[0];

          const newUserData = {
            nombre: user.name || "Usuario",
            email: user.email!,
            nombreInstitucion: "Por definir",
            nivelId: 1,
            gradoId: 1,
            problematicaId: 1,
            suscripcion: {
              fechaInicio: today,
              plan: "free",
            },
          };

          const createdRes = await createNewUsuario(newUserData);
          usuarioId = createdRes.data.data?.id ?? createdRes.data.id;
        } else {
          throw error;
        }
      }

      const preference = await crearPreferenciaPago({
        usuarioId,
        planId: checkoutPlanId,
      });

      if (preference.data?.checkoutUrl) {
        window.location.href = preference.data.checkoutUrl;
      } else {
        handleToaster("Error al obtener URL de pago", "error");
      }
    } catch (error: any) {
      console.error("Error en proceso de upgrade:", error);
      handleToaster(
        error.response?.data?.message ||
          "Error al procesar el upgrade. Intenta nuevamente.",
        "error",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (statusLoading) {
    return <LoadingComponent />;
  }

  return (
    <div
      className="dp-canvas-dots min-h-[100dvh] text-[#1F2937]"
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
    >
      <LandingHeader />
      <main>
        <Hero />
        <Features />
        <SessionPreview />
        <Pricing onUpgradeClick={handleUpgradeClick} isLoading={isProcessing} />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;

