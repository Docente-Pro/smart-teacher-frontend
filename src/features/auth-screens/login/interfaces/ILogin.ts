export interface ILoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ILoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  token?: string;
}

export interface ILoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}
