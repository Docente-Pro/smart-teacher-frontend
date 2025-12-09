import { create } from "zustand";
import type { ISignupState, ISignupFormData } from "../interfaces/ISignup";

const initialFormData: ISignupFormData = {
  nombre: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const useSignupStore = create<ISignupState>((set) => ({
  formData: initialFormData,
  isLoading: false,
  error: null,

  setFormData: (data: Partial<ISignupFormData>) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setLoading: (loading: boolean) =>
    set(() => ({
      isLoading: loading,
    })),

  setError: (error: string | null) =>
    set(() => ({
      error,
    })),

  resetForm: () =>
    set(() => ({
      formData: initialFormData,
      isLoading: false,
      error: null,
    })),
}));
