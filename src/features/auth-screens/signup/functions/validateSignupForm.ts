import type { ISignupFormData, ISignupFormErrors } from "../interfaces/ISignup";
import { SIGNUP_VALIDATION } from "../constants/signupConstants";

/**
 * Valida el formulario de registro
 * @param formData - Datos del formulario
 * @returns Object con errores encontrados
 */
export function validateSignupForm(formData: ISignupFormData): ISignupFormErrors {
  const errors: ISignupFormErrors = {};

  if (!formData.nombre || formData.nombre.trim().length < 2) {
    errors.nombre = SIGNUP_VALIDATION.NOMBRE.REQUIRED;
  }

  if (!formData.email) {
    errors.email = SIGNUP_VALIDATION.EMAIL.REQUIRED;
  } else if (!SIGNUP_VALIDATION.EMAIL.PATTERN.test(formData.email)) {
    errors.email = SIGNUP_VALIDATION.EMAIL.INVALID;
  }

  if (!formData.password) {
    errors.password = SIGNUP_VALIDATION.PASSWORD.REQUIRED;
  } else if (formData.password.length < SIGNUP_VALIDATION.PASSWORD.MIN_LENGTH) {
    errors.password = SIGNUP_VALIDATION.PASSWORD.MIN_LENGTH_MESSAGE;
  } else if (!SIGNUP_VALIDATION.PASSWORD.PATTERN.test(formData.password)) {
    errors.password = SIGNUP_VALIDATION.PASSWORD.PATTERN_MESSAGE;
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = SIGNUP_VALIDATION.CONFIRM_PASSWORD.REQUIRED;
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = SIGNUP_VALIDATION.CONFIRM_PASSWORD.MISMATCH;
  }

  return errors;
}
