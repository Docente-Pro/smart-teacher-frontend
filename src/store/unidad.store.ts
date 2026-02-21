import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IUnidadContenido } from "@/interfaces/IUnidadIA";

// ─── Datos base del Paso 1 ───

export interface UnidadDatosBase {
  nivel: string;
  grado: string;
  titulo: string;
  numeroUnidad: number;
  duracion: number;
  fechaInicio: string;
  fechaFin: string;
  problematicaNombre: string;
  problematicaDescripcion: string;
  areas: { nombre: string }[];
  tipo: "PERSONAL" | "COMPARTIDA";
  maxMiembros?: number;
  sesionesSemanales?: number;
  codigoCompartido?: string;
}

// ─── State ───

interface UnidadWizardState {
  unidadId: string | null;
  datosBase: UnidadDatosBase | null;
  contenido: IUnidadContenido;
  generandoPaso: string | null; // nombre del paso que se está generando

  // Actions
  setUnidadId: (id: string) => void;
  setDatosBase: (datos: UnidadDatosBase) => void;
  updateContenido: (partial: Partial<IUnidadContenido>) => void;
  setGenerandoPaso: (paso: string | null) => void;
  resetUnidad: () => void;
}

const contenidoInicial: IUnidadContenido = {};

export const useUnidadStore = create<UnidadWizardState>()(
  persist(
    (set) => ({
      unidadId: null,
      datosBase: null,
      contenido: contenidoInicial,
      generandoPaso: null,

      setUnidadId: (id) => set({ unidadId: id }),

      setDatosBase: (datos) => set({ datosBase: datos }),

      updateContenido: (partial) =>
        set((state) => ({
          contenido: { ...state.contenido, ...partial },
        })),

      setGenerandoPaso: (paso) => set({ generandoPaso: paso }),

      resetUnidad: () =>
        set({
          unidadId: null,
          datosBase: null,
          contenido: contenidoInicial,
          generandoPaso: null,
        }),
    }),
    {
      name: "unidad-wizard-storage",
    }
  )
);
