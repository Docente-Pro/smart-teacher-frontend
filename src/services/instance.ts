import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const API_BASE_URL =
  import.meta.env.VITE_PRODUCTION_API_URL ||
  import.meta.env.VITE_LOCAL_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
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

    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      // 🔍 DEBUG: Ver los primeros caracteres del token y detectar si es JWE
      const tokenPreview = accessToken.substring(0, 50);
      try {
        const header = JSON.parse(atob(accessToken.split('.')[0]));
        console.log('🔍 [Interceptor] Token header:', header);
        if (header.alg === 'dir') {
          console.error('❌ [Interceptor] TOKEN ES JWE/OPACO — audience NO está funcionando');
        } else {
          console.log('✅ [Interceptor] Token es JWT válido, alg:', header.alg);
        }
      } catch {
        console.log('🔍 [Interceptor] Token preview:', tokenPreview);
      }
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
      console.warn("⚠️ Token expirado o inválido — cerrando sesión");
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
