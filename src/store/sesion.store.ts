import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ISesionAprendizaje } from '@/interfaces/ISesionAprendizaje';

/**
 * Acumulador de IDs de situaciones significativas ya usadas.
 * Clave: `${grado}_${area}` — Valor: lista de IDs usados
 */
type SituacionesUsadasMap = Record<string, string[]>;

interface SesionState {
  sesion: ISesionAprendizaje | null;
  situacionesUsadas: SituacionesUsadasMap;
  setSesion: (sesion: ISesionAprendizaje) => void;
  updateSesion: (updates: Partial<ISesionAprendizaje>) => void;
  resetSesion: () => void;
  getExcluirSituacionesIds: (grado: string, area: string) => string[];
  registrarSituacionUsada: (grado: string, area: string, id: string, totalDisponibles: number) => void;
}

/**
 * Store global para la sesión de aprendizaje
 * Persiste los datos en localStorage para mantenerlos entre recargas
 */
export const useSesionStore = create<SesionState>()(
  persist(
    (set, get) => ({
      sesion: null,
      situacionesUsadas: {},

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

      /**
       * Devuelve los IDs de situaciones ya usadas para un grado+área
       */
      getExcluirSituacionesIds: (grado: string, area: string): string[] => {
        const key = `${grado}_${area}`;
        return get().situacionesUsadas[key] || [];
      },

      /**
       * Registra una situación usada y reinicia el ciclo si se agotaron todas
       */
      registrarSituacionUsada: (grado: string, area: string, id: string, totalDisponibles: number) =>
        set((state) => {
          const key = `${grado}_${area}`;
          const usadas = [...(state.situacionesUsadas[key] || []), id];

          // Si se usaron todas, reiniciar ciclo
          const nuevasUsadas = usadas.length >= totalDisponibles ? [] : usadas;

          return {
            situacionesUsadas: {
              ...state.situacionesUsadas,
              [key]: nuevasUsadas,
            },
          };
        }),
    }),
    {
      name: 'sesion-storage',
    }
  )
);
