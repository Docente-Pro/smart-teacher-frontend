import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./features/graficos-educativos/presentation/styles/GraficosComunes.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { routes } from "./routes/index.routes";
import { CustomAuth0Provider } from "./providers/CustomAuth0Provider";
import { Toaster } from "sonner";
import { useSessionRestore } from "./hooks/useSessionRestore";
import { GlobalLoading } from "./components/GlobalLoading";
import { useLoadingStore } from "./store/loading.store";
import { useAuthFlow } from "./hooks/useAuthFlow";

// Componente wrapper - Solo hooks esenciales
function App() {
  useSessionRestore();  // Restaurar sesión desde localStorage
  useAuthFlow();        // Manejar flujo de autenticación (social y tradicional)
  const { isLoading, loadingMessage } = useLoadingStore();
  
  return (
    <>
      {isLoading && <GlobalLoading message={loadingMessage} />}
      <Routes>
        {routes.map((routes, index) => (
          <Route key={index} path={routes.path} element={routes.element} />
        ))}
      </Routes>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <CustomAuth0Provider>
        <App />
        <Toaster />
      </CustomAuth0Provider>
    </BrowserRouter>
  </StrictMode>
);
