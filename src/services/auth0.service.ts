import { instance } from "./instance";
import axios from "axios";

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

interface RegisterUserResponse {
  success: boolean;
  data: {
    id: string;
    nombre: string;
    email: string;
    auth0UserId: string;
  };
}

/**
 * Registra un nuevo usuario (el backend crea en Auth0 y en BD)
 * @param userData - Datos del usuario (name, email, password)
 * @returns Respuesta con el usuario creado
 */
export async function registerUser(userData: RegisterUserData) {
  return instance.post<RegisterUserResponse>("/auth/register", userData);
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface Auth0TokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Inicia sesión usando Auth0 Resource Owner Password Flow
 * @param credentials - Email y password del usuario
 * @returns Tokens de Auth0
 */
export async function loginWithPassword(credentials: LoginCredentials) {
  const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  
  return axios.post<Auth0TokenResponse>(
    `https://${auth0Domain}/oauth/token`,
    {
      grant_type: "http://auth0.com/oauth/grant-type/password-realm",
      username: credentials.email,
      password: credentials.password,
      client_id: clientId,
      realm: "Username-Password-Authentication",
      scope: "openid profile email",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
