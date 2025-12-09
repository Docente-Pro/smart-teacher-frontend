export const LOGIN_VALIDATION = {
  EMAIL: {
    REQUIRED: 'El correo electrónico es obligatorio',
    INVALID: 'Ingresa un correo electrónico válido',
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    REQUIRED: 'La contraseña es obligatoria',
    MIN_LENGTH: 6,
    MIN_LENGTH_MESSAGE: 'La contraseña debe tener al menos 6 caracteres',
  },
} as const;

export const SOCIAL_PROVIDERS = {
  GOOGLE: 'google-oauth2',
  FACEBOOK: 'facebook',
  APPLE: 'apple',
} as const;

export const LOGIN_MESSAGES = {
  SUCCESS: 'Inicio de sesión exitoso',
  ERROR: 'Error al iniciar sesión',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  NETWORK_ERROR: 'Error de conexión. Intenta nuevamente.',
} as const;
