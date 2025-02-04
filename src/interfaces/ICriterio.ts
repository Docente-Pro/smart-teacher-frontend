export interface ICriterio {
  id: number;
  descripcion: string;
  gradoId: number;
}

export interface ICriterioToGenerate {
  area: number;
  duracion: string;
  competencia: number;
  capacidades: number[];
  grado: number;
  problematica: number;
  unidad: number;
}

export interface ICriterioReceived {
  criterio: string;
  evidencia: string;
  id: number;
}
