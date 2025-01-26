import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { routes } from "./routes/index.routes";
import { Auth0Provider } from "@auth0/auth0-react";
const redirectUri = window.location.origin;
createRoot(document.getElementById("root")).render(_jsx(StrictMode, { children: _jsx(Auth0Provider, { domain: import.meta.env.VITE_AUTH0_DOMAIN, clientId: import.meta.env.VITE_AUTH0_CLIENT_ID, authorizationParams: {
            redirect_uri: redirectUri,
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            scope: "openid profile email",
        }, children: _jsx(BrowserRouter, { children: _jsx(Routes, { children: routes.map((routes, index) => (_jsx(Route, { path: routes.path, element: routes.element }, index))) }) }) }) }));
