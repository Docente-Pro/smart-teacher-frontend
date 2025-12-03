import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { routes } from "./routes/index.routes";
import { Auth0Provider } from "@auth0/auth0-react";
import { Toaster } from "sonner";

const redirectUri = window.location.origin;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: "openid profile email",
      }}
      cacheLocation="localstorage"
    >
      <BrowserRouter>
        <Routes>
          {routes.map((routes, index) => (
            <Route key={index} path={routes.path} element={routes.element} />
          ))}
        </Routes>
        <Toaster />
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>
);
