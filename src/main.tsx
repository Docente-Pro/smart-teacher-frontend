// ⚠️ Este import DEBE ir PRIMERO — parchea Node.prototype antes de React
import "./utils/patchDomForReact";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerLicense } from "@syncfusion/ej2-base";
import "./index.css";
import "./features/graficos-educativos/presentation/styles/GraficosComunes.css";
import { AppWrapper } from "./components/AppWrapper";

const syncfusionLicenseKey = (
  import.meta.env.VITE_SYNCFUSION_LICENSE_KEY as string | undefined
)?.trim();

if (syncfusionLicenseKey) {
  registerLicense(syncfusionLicenseKey);
} else if (import.meta.env.DEV) {
  console.warn(
    "Falta VITE_SYNCFUSION_LICENSE_KEY; los componentes Syncfusion mostrarán el aviso de licencia.",
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
);
