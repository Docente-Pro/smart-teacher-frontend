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

// ─── Fases del wizard ───
export type WizardPhase = "select-type" | "wizard" | "completed";

// ─── State ───

interface UnidadWizardState {
  unidadId: string | null;
  datosBase: UnidadDatosBase | null;
  contenido: IUnidadContenido;
  generandoPaso: string | null; // nombre del paso que se está generando

  // ─── Estado del wizard (para recuperación) ───
  currentStep: number;
  maxStepReached: number;
  wizardPhase: WizardPhase;
  tipoUnidad: "PERSONAL" | "COMPARTIDA";
  maxMiembros: number;

  // Actions
  setUnidadId: (id: string) => void;
  setDatosBase: (datos: UnidadDatosBase) => void;
  updateContenido: (partial: Partial<IUnidadContenido>) => void;
  setGenerandoPaso: (paso: string | null) => void;
  
  // Actions del wizard
  setCurrentStep: (step: number) => void;
  advanceStep: (step: number) => void;
  setWizardPhase: (phase: WizardPhase) => void;
  setTipoUnidad: (tipo: "PERSONAL" | "COMPARTIDA", maxMiembros?: number) => void;
  markCompleted: () => void;
  
  // Utilidades
  hasUnfinishedUnidad: () => boolean;
  resetUnidad: () => void;
}

const contenidoInicial: IUnidadContenido = {};

export const useUnidadStore = create<UnidadWizardState>()(
  persist(
    (set, get) => ({
      unidadId: null,
      datosBase: null,
      contenido: contenidoInicial,
      generandoPaso: null,
      
      // Estado inicial del wizard
      currentStep: 1,
      maxStepReached: 1,
      wizardPhase: "select-type",
      tipoUnidad: "PERSONAL",
      maxMiembros: 2,

      setUnidadId: (id) => set({ unidadId: id }),

      setDatosBase: (datos) => set({ datosBase: datos }),

      updateContenido: (partial) =>
        set((state) => ({
          contenido: { ...state.contenido, ...partial },
        })),

      setGenerandoPaso: (paso) => set({ generandoPaso: paso }),

      // ─── Acciones del wizard ───
      setCurrentStep: (step) => set({ currentStep: step }),
      
      advanceStep: (step) => set((state) => ({
        currentStep: step,
        maxStepReached: Math.max(state.maxStepReached, step),
      })),
      
      setWizardPhase: (phase) => set({ wizardPhase: phase }),
      
      setTipoUnidad: (tipo, maxMiembros = 2) => set({ 
        tipoUnidad: tipo, 
        maxMiembros,
        wizardPhase: "wizard",
      }),
      
      markCompleted: () => set({ wizardPhase: "completed" }),
      
      hasUnfinishedUnidad: () => {
        const state = get();
        // Tiene unidad en progreso si:
        // 1. Hay unidadId creado (ya pasó paso 1)
        // 2. El wizard no está completado
        // 3. Está en fase wizard o tiene datosBase
        return (
          state.wizardPhase !== "completed" &&
          (state.unidadId !== null || state.datosBase !== null)
        );
      },

      resetUnidad: () =>
        set({
          unidadId: null,
          datosBase: null,
          contenido: contenidoInicial,
          generandoPaso: null,
          currentStep: 1,
          maxStepReached: 1,
          wizardPhase: "select-type",
          tipoUnidad: "PERSONAL",
          maxMiembros: 2,
        }),
    }),
    {
      name: "unidad-wizard-storage",
      version: 1, // Incrementar al cambiar la estructura
      // Excluir generandoPaso de la persistencia (es estado transitorio)
      partialize: (state) => ({
        unidadId: state.unidadId,
        datosBase: state.datosBase,
        contenido: state.contenido,
        currentStep: state.currentStep,
        maxStepReached: state.maxStepReached,
        wizardPhase: state.wizardPhase,
        tipoUnidad: state.tipoUnidad,
        maxMiembros: state.maxMiembros,
        // generandoPaso NO se persiste
      }),
      // Al rehidratar, asegurar que generandoPaso sea null y mergear correctamente
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<UnidadWizardState> | undefined;
        return {
          ...currentState,
          ...persisted,
          // Asegurar que contenido sea objeto válido
          contenido: persisted?.contenido ?? currentState.contenido,
          generandoPaso: null, // Siempre resetear al cargar
        };
      },
    }
  )
);
