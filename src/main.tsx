// ⚠️ Este import DEBE ir PRIMERO — parchea Node.prototype antes de React
import "./utils/patchDomForReact";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./features/graficos-educativos/presentation/styles/GraficosComunes.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { routes } from "./routes/index.routes";
import { adminRoutes } from "./routes/admin.routes";
import { CustomAuth0Provider } from "./providers/CustomAuth0Provider";
import { Toaster } from "sonner";
import { useSessionRestore } from "./hooks/useSessionRestore";
import { GlobalLoading } from "./components/GlobalLoading";
import { useLoadingStore } from "./store/loading.store";
import { useAuthFlow } from "./hooks/useAuthFlow";
import { useSubscriptionSocket } from "./hooks/useSubscriptionSocket";
import RenewalModal from "./components/Shared/Modal/RenewalModal";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Componente wrapper - Solo hooks esenciales
function App() {
  useSessionRestore();  // Restaurar sesión desde localStorage
  useAuthFlow();        // Manejar flujo de autenticación (social y tradicional)
  const { isLoading, loadingMessage } = useLoadingStore();

  // Escuchar eventos de suscripción en tiempo real
  const { showRenewalModal, dismissRenewalModal } = useSubscriptionSocket();
  
  return (
    <>
      {isLoading && <GlobalLoading message={loadingMessage} />}
      <Routes>
        {routes.map((routes, index) => (
          <Route key={index} path={routes.path} element={routes.element} />
        ))}
        {/* Admin Routes */}
        {adminRoutes.map((route, index) => (
          <Route key={`admin-${index}`} path={route.path} element={route.element}>
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
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <CustomAuth0Provider>
          <App />
          <Toaster />
        </CustomAuth0Provider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
