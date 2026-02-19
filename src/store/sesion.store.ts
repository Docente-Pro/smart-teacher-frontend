import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ISesionAprendizaje } from '@/interfaces/ISesionAprendizaje';

interface SesionState {
  sesion: ISesionAprendizaje | null;
  setSesion: (sesion: ISesionAprendizaje) => void;
  updateSesion: (updates: Partial<ISesionAprendizaje>) => void;
  resetSesion: () => void;
}

/**
 * Store global para la sesión de aprendizaje
 * Persiste los datos en localStorage para mantenerlos entre recargas
 */
export const useSesionStore = create<SesionState>()(
  persist(
    (set) => ({
      sesion: null,

      /**
       * Establece la sesión completa
       */
      setSesion: (sesion) => set({ sesion }),

      /**
       * Actualiza propiedades específicas de la sesión
       */
      updateSesion: (updates) =>
        set((state) => ({
          sesion: state.sesion ? { ...state.sesion, ...updates } : null,
        })),

      /**
       * Resetea la sesión al estado inicial
       */
      resetSesion: () => set({ sesion: null }),
    }),
    {
      name: 'sesion-storage',
    }
  )
);
