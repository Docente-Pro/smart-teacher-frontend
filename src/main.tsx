// ⚠️ Este import DEBE ir PRIMERO — parchea Node.prototype antes de React
import "./utils/patchDomForReact";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./features/graficos-educativos/presentation/styles/GraficosComunes.css";
import { AppWrapper } from "./components/AppWrapper";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
);
