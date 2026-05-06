import { useAuthFlow } from "@/hooks/useAuthFlow";
import { useSessionRestore } from "@/hooks/useSessionRestore";
import { useSubscriptionSocket } from "@/hooks/useSubscriptionSocket";
import { useLoadingStore } from "@/store/loading.store";
import { useUserStore } from "@/store/user.store";
import React, { useEffect, useState } from "react";
import { GlobalLoading } from "./GlobalLoading";
import { Route, Routes } from "react-router";
import { routes } from "@/routes/index.routes";
import { adminRoutes } from "@/routes/admin.routes";
import RenewalModal from "./Shared/Modal/RenewalModal";
import SeccionModal from "./Shared/Modal/SeccionModal";
import WhatsAppPremiumFAB from "./WhatsAppPremiumFAB";

export const App = () => {
  useSessionRestore(); // Restaurar sesión desde localStorage
  useAuthFlow(); // Manejar flujo de autenticación (social y tradicional)
  const { isLoading, loadingMessage } = useLoadingStore();
  const { user: usuario } = useUserStore();

  // Escuchar eventos de suscripción en tiempo real
  const { showRenewalModal, dismissRenewalModal } = useSubscriptionSocket();

  // Modal de sección para usuarios existentes sin sección
  const [showSeccionModal, setShowSeccionModal] = useState(false);
  const [seccionDismissed, setSeccionDismissed] = useState(false);

  useEffect(() => {
    // Mostrar modal si: usuario logueado + tiene id (ya registrado) + no tiene sección + no lo cerró aún
    if (usuario?.id && !usuario.seccion && !seccionDismissed) {
      // Pequeño delay para que el usuario vea la app primero
      const timer = setTimeout(() => setShowSeccionModal(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowSeccionModal(false);
    }
  }, [usuario?.id, usuario?.seccion, seccionDismissed]);

  return (
    <>
      {isLoading && <GlobalLoading message={loadingMessage} />}
      <Routes>
        {routes.map((routes, index) => (
          <Route key={index} path={routes.path} element={routes.element} />
        ))}
        {/* Admin Routes */}
        {adminRoutes.map((route, index) => (
          <Route
            key={`admin-${index}`}
            path={route.path}
            element={route.element}
          >
            {route.children?.map((child, ci) => (
              <Route
                key={`admin-child-${ci}`}
                index={child.index}
                path={child.path}
                element={child.element}
              />
            ))}
          </Route>
        ))}
      </Routes>
      {/* Modal de renovación — se muestra cuando suscripcion:expirada llega */}
      <RenewalModal isOpen={showRenewalModal} onClose={dismissRenewalModal} />
      {/* Modal "Nueva característica" — pide sección a usuarios existentes */}
      <SeccionModal
        isOpen={showSeccionModal}
        onClose={() => {
          setShowSeccionModal(false);
          setSeccionDismissed(true);
        }}
      />
      {/* Botón flotante WhatsApp → Premium (solo usuarios no-premium) */}
      <WhatsAppPremiumFAB />
    </>
  );

  return <div>App</div>;
};
