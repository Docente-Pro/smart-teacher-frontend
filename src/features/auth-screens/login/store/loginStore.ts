import { create } from 'zustand';
import { ILoginCredentials } from '../interfaces/ILogin';

interface LoginState {
  credentials: ILoginCredentials;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
  setCredentials: (credentials: Partial<ILoginCredentials>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setRememberMe: (rememberMe: boolean) => void;
  resetState: () => void;
}

const initialState = {
  credentials: {
    email: '',
    password: '',
    rememberMe: false,
  },
  isLoading: false,
  error: null,
  rememberMe: false,
};

export const useLoginStore = create<LoginState>((set) => ({
  ...initialState,
  setCredentials: (credentials) =>
    set((state) => ({
      credentials: { ...state.credentials, ...credentials },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setRememberMe: (rememberMe) => set({ rememberMe }),
  resetState: () => set(initialState),
}));
