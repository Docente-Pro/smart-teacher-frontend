export const initialStateCuestionarioSesion = {
  area: null,
  duracion: "",
  competencia: null,
  capacidades: [],
  criteriosEvaluacion: [],
  enfoque: [],
  estandarId: null,
};

export interface ICuestionarioSesion {
  area: number | null;
  duracion: string | null;
  competencia: number | null;
  capacidades: number[];
  criteriosEvaluacion: string[];
  enfoque: string[];
  estandarId: number | null;
}
