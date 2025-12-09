import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

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
