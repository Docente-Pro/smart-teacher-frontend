import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const API_BASE_URL =
  import.meta.env.VITE_PRODUCTION_API_URL ||
  import.meta.env.VITE_LOCAL_API_URL ||
  "http://localhost:3000/api";

export const instance = axios.create({
  baseURL: API_BASE_URL,    
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================
// INTERCEPTOR — Inyecta Bearer token en rutas protegidas
// ============================================

/** Rutas públicas que NO necesitan token */
const PUBLIC_PREFIXES = [
  "/auth/",
  "/area",
  "/capacidad",
  "/competencia",
  "/nivel",
  "/grado",
  "/enfoque-transversal",
  "/problemas-por-ciclo",
  "/criterio",
  "/auth/admin",
];

function isPublicRoute(url: string | undefined): boolean {
  if (!url) return false;
  return PUBLIC_PREFIXES.some((prefix) => url.startsWith(prefix));
}

instance.interceptors.request.use(
  (config) => {
    // No añadir token a rutas públicas
    if (isPublicRoute(config.url)) {
      return config;
    }

    // Si ya se proveyó un Authorization explícito (ej. admin headers), respetarlo
    if (config.headers.Authorization) {
      return config;
    }

    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// INTERCEPTOR — Manejo global de 401
// ============================================

/** Debounce para evitar múltiples clearAuth() en ráfaga (ej: varias peticiones fallan a la vez) */
let lastClearAuthTime = 0;
const CLEAR_AUTH_DEBOUNCE_MS = 3000;

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";

      // Las rutas admin manejan sus propios errores de auth — no tocar sesión docente
      if (url.startsWith("/admin/") || url.startsWith("admin/")) {
        // 401 en ruta admin — no se afecta la sesión docente
        return Promise.reject(error);
      }

      // Token expirado o inválido — cerrando sesión
      // Evitar bucle infinito si ya estamos en /auth/refresh
      if (!error.config?.url?.includes("/auth/refresh")) {
        const now = Date.now();
        if (now - lastClearAuthTime > CLEAR_AUTH_DEBOUNCE_MS) {
          lastClearAuthTime = now;
          useAuthStore.getState().clearAuth();
        }
      }
    }
    return Promise.reject(error);
  }
);
