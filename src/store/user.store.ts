import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IUsuario } from "@/interfaces/IUsuario";
import { getUsuarioById } from "@/services/usuarios.service";

/**
 * Estado inicial del usuario (vacío hasta que se cargue del backend)
 */
const initialUserState: IUsuario = {
  id: "",
  nombre: "",
  email: "",
  nombreInstitucion: "",
  createdAt: "",
};

/**
 * Estado del store de usuario de la aplicación
 * Separado del auth.store para mantener concerns distintos:
 * - auth.store: Datos de Auth0 (autenticación, tokens)
 * - user.store: Datos del usuario en nuestra BD (perfil, configuración, problemática, etc.)
 */
interface UserState {
  // State
  user: IUsuario;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null; // Timestamp de última carga

  // Actions
  setUsuario: (user: IUsuario) => void;
  updateUsuario: (userData: Partial<IUsuario>) => void;
  fetchUsuario: (userId: string) => Promise<void>;
  clearUsuario: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: initialUserState,
      isLoading: false,
      error: null,
      lastFetched: null,

      // Establecer usuario completo
      setUsuario: (user: IUsuario) => {
        set({ 
          user, 
          error: null,
          lastFetched: Date.now()
        });
      },

      // Actualizar parcialmente
      updateUsuario: (userData: Partial<IUsuario>) => {
        set((state) => ({
          user: { ...state.user, ...userData },
          lastFetched: Date.now()
        }));
      },

      // Cargar usuario desde backend
      fetchUsuario: async (userId: string) => {
        // Si ya se cargó recientemente (< 5 minutos), no recargar
        const { lastFetched } = get();
        const FIVE_MINUTES = 5 * 60 * 1000;
        if (lastFetched && Date.now() - lastFetched < FIVE_MINUTES) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await getUsuarioById(userId);
          const userData = response.data.data || response.data;
          
          set({ 
            user: userData, 
            isLoading: false, 
            error: null,
            lastFetched: Date.now()
          });
        } catch (error: any) {
          console.error("Error al cargar usuario:", error);
          set({ 
            isLoading: false, 
            error: error.response?.data?.message || "Error al cargar usuario" 
          });
        }
      },

      // Limpiar estado (logout)
      clearUsuario: () => {
        set({ 
          user: initialUserState, 
          isLoading: false, 
          error: null,
          lastFetched: null
        });
      },

      // Setters para loading y error
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: "user-storage", // Nombre en localStorage
      partialize: (state) => ({ 
        user: state.user,
        lastFetched: state.lastFetched
      }), // Solo persistir user y lastFetched
    }
  )
);

// Export legacy para compatibilidad (deprecado)
export const userStore = useUserStore;
