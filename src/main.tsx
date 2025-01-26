import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { routes } from "./routes/index.routes";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StrictMode>
      <Routes>
        {routes.map((routes, index) => (
          <Route key={index} path={routes.path} element={routes.element} />
        ))}
      </Routes>
    </StrictMode>
  </BrowserRouter>
);
