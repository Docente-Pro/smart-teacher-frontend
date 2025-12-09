export interface ISignupFormData {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ISignupFormErrors {
  nombre?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface ISignupState {
  formData: ISignupFormData;
  isLoading: boolean;
  error: string | null;
  setFormData: (data: Partial<ISignupFormData>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetForm: () => void;
}
