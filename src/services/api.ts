import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================
// INTERCEPTOR — Inyecta Bearer token
// ============================================
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ [api] Token expirado o inválido");
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);

export interface CreateUsuarioDto {
  nombre: string;
  email: string;
  auth0UserId?: string;
  nombreInstitucion: string;
  nivelId: number;
  gradoId: number;
  problematicaId: number;
  suscripcion?: {
    fechaInicio: string;
    plan: string;
  };
}

export interface CreatePreferenciaDto {
  usuarioId: string;
  planId: string;
}

// Obtener usuario por email
export const getUserByEmail = async (email: string) => {
  const response = await api.get(`/usuario/email/${encodeURIComponent(email)}`);
  return response.data;
};

// Crear nuevo usuario
export const createUser = async (userData: CreateUsuarioDto) => {
  const response = await api.post("/usuario", userData);
  return response.data;
};

// Crear preferencia de pago
export const createPaymentPreference = async (data: CreatePreferenciaDto) => {
  const response = await api.post("/pago/crear-preferencia", data);
  return response.data;
};

export default api;
