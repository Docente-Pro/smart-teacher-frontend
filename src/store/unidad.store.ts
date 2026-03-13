import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IUnidadContenido } from "@/interfaces/IUnidadIA";
import type { HorarioEscolar } from "@/interfaces/IHorario";

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

/** Unidad batch: id + nombre del grado para tabs */
export interface UnidadBatchItem {
  id: string;
  gradoId: number;
  gradoNombre: string;
}

interface UnidadWizardState {
  unidadId: string | null;
  datosBase: UnidadDatosBase | null;
  contenido: IUnidadContenido;
  generandoPaso: string | null; // nombre del paso que se está generando

  // ─── Batch (Secundaria): múltiples unidades ───
  unidadBatch: UnidadBatchItem[];
  /** IDs de unidades que ya tienen paso 2 completo (situación + evidencias + propósitos). No persistido. */
  batchStep2DoneIds: string[];
  batchStep3DoneIds: string[];
  batchStep4DoneIds: string[];

  // ─── Estado del wizard (para recuperación) ───
  currentStep: number;
  maxStepReached: number;
  wizardPhase: WizardPhase;
  tipoUnidad: "PERSONAL" | "COMPARTIDA";
  maxMiembros: number;

  // ─── Horario escolar (opcional, paso 4) ───
  horario: HorarioEscolar | null;

  // Actions
  setUnidadId: (id: string) => void;
  setUnidadBatch: (items: UnidadBatchItem[]) => void;
  addBatchStep2DoneId: (id: string) => void;
  setBatchStep2DoneIds: (ids: string[]) => void;
  addBatchStep3DoneId: (id: string) => void;
  setBatchStep3DoneIds: (ids: string[]) => void;
  addBatchStep4DoneId: (id: string) => void;
  setBatchStep4DoneIds: (ids: string[]) => void;
  selectUnidad: (id: string) => void;
  setDatosBase: (datos: UnidadDatosBase) => void;
  updateContenido: (partial: Partial<IUnidadContenido>) => void;
  setContenido: (contenido: IUnidadContenido) => void;
  setGenerandoPaso: (paso: string | null) => void;
  setHorario: (horario: HorarioEscolar | null) => void;
  
  // Actions del wizard
  setCurrentStep: (step: number) => void;
  advanceStep: (step: number) => void;
  setWizardPhase: (phase: WizardPhase) => void;
  setTipoUnidad: (tipo: "PERSONAL" | "COMPARTIDA", maxMiembros?: number) => void;
  markCompleted: () => void;
  
  // Utilidades
  hasUnfinishedUnidad: () => boolean;
  resetUnidad: () => void;
  /** Reset suave: conserva unidadId y tipoUnidad, limpia contenido y vuelve al paso 1 */
  softResetUnidad: () => void;
}

const contenidoInicial: IUnidadContenido = {};

export const useUnidadStore = create<UnidadWizardState>()(
  persist(
    (set, get) => ({
      unidadId: null,
      datosBase: null,
      contenido: contenidoInicial,
      generandoPaso: null,
      unidadBatch: [],
      batchStep2DoneIds: [],
      batchStep3DoneIds: [],
      batchStep4DoneIds: [],

      // Estado inicial del wizard
      currentStep: 1,
      maxStepReached: 1,
      wizardPhase: "select-type",
      tipoUnidad: "PERSONAL",
      maxMiembros: 2,

      // Horario escolar
      horario: null,

      setUnidadId: (id) => set({ unidadId: id }),

      setUnidadBatch: (items) =>
        set({
          unidadBatch: items,
          unidadId: items.length > 0 ? items[0].id : null,
        }),

      addBatchStep2DoneId: (id) =>
        set((s) =>
          s.batchStep2DoneIds.includes(id)
            ? s
            : { batchStep2DoneIds: [...s.batchStep2DoneIds, id] }
        ),
      setBatchStep2DoneIds: (ids) => set({ batchStep2DoneIds: ids }),

      addBatchStep3DoneId: (id) =>
        set((s) =>
          s.batchStep3DoneIds.includes(id)
            ? s
            : { batchStep3DoneIds: [...s.batchStep3DoneIds, id] }
        ),
      setBatchStep3DoneIds: (ids) => set({ batchStep3DoneIds: ids }),

      addBatchStep4DoneId: (id) =>
        set((s) =>
          s.batchStep4DoneIds.includes(id)
            ? s
            : { batchStep4DoneIds: [...s.batchStep4DoneIds, id] }
        ),
      setBatchStep4DoneIds: (ids) => set({ batchStep4DoneIds: ids }),

      selectUnidad: (id) => set({ unidadId: id }),

      setDatosBase: (datos) => set({ datosBase: datos }),

      updateContenido: (partial) =>
        set((state) => ({
          contenido: { ...state.contenido, ...partial },
        })),

      setContenido: (contenido) => set({ contenido: contenido ?? contenidoInicial }),

      setGenerandoPaso: (paso) => set({ generandoPaso: paso }),

      setHorario: (horario) => set({ horario }),

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
          unidadBatch: [],
          batchStep2DoneIds: [],
          batchStep3DoneIds: [],
          batchStep4DoneIds: [],
          currentStep: 1,
          maxStepReached: 1,
          wizardPhase: "select-type",
          tipoUnidad: "PERSONAL",
          maxMiembros: 2,
          horario: null,
        }),

      softResetUnidad: () =>
        set((state) => ({
          // Conserva unidadId, tipoUnidad, maxMiembros
          datosBase: null,
          contenido: contenidoInicial,
          generandoPaso: null,
          unidadBatch: [],
          batchStep2DoneIds: [],
          batchStep3DoneIds: [],
          batchStep4DoneIds: [],
          currentStep: 1,
          maxStepReached: 1,
          wizardPhase: "wizard", // ya tiene unidad, va directo al wizard
          horario: null,
        })),
    }),
    {
      name: "unidad-wizard-storage",
      version: 3, // v3: se agregó unidadBatch + setContenido + selectUnidad
      // Excluir generandoPaso de la persistencia (es estado transitorio)
      partialize: (state) => ({
        unidadId: state.unidadId,
        datosBase: state.datosBase,
        contenido: state.contenido,
        unidadBatch: state.unidadBatch,
        currentStep: state.currentStep,
        maxStepReached: state.maxStepReached,
        wizardPhase: state.wizardPhase,
        tipoUnidad: state.tipoUnidad,
        maxMiembros: state.maxMiembros,
        horario: state.horario,
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
