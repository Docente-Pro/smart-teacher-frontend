export const SIGNUP_VALIDATION = {
  NOMBRE: {
    REQUIRED: "El nombre completo es obligatorio",
    MIN_LENGTH: 2,
    MIN_LENGTH_MESSAGE: "El nombre debe tener al menos 2 caracteres",
  },
  EMAIL: {
    REQUIRED: "El correo electrónico es obligatorio",
    INVALID: "Ingresa un correo electrónico válido",
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    REQUIRED: "La contraseña es obligatoria",
    MIN_LENGTH: 8,
    MIN_LENGTH_MESSAGE: "La contraseña debe tener al menos 8 caracteres",
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    PATTERN_MESSAGE: "Debe incluir mayúscula, minúscula y número",
  },
  CONFIRM_PASSWORD: {
    REQUIRED: "Debes confirmar tu contraseña",
    MISMATCH: "Las contraseñas no coinciden",
  },
} as const;

export const SOCIAL_PROVIDERS = {
  GOOGLE: "google-oauth2",
  FACEBOOK: "facebook",
  APPLE: "apple",
} as const;

export const SIGNUP_MESSAGES = {
  SUCCESS: "Cuenta creada exitosamente",
  ERROR: "Error al crear la cuenta",
  EMAIL_EXISTS: "Este email ya está registrado",
  NETWORK_ERROR: "Error de conexión. Intenta nuevamente.",
} as const;
