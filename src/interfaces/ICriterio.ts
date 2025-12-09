export interface ICriterio {
  id: number;
  descripcion: string;
  gradoId: number;
}

export interface ICriterioToGenerate {
  competenciaId: number;
  gradoId: number;
  areaId: number;
  problematicaId: number; // ⭐ NUEVO - Ahora requerido para contextualizar criterios
}

export interface ICriterioReceived {
  criterio: string;
  evidencia: string;
  id: number;
}

// Criterio generado por IA con estructura mejorada
export interface ICriterioIA {
  id: string;
  habilidad: string;
  conocimiento: string;
  condicion: string;
  finalidad: string;
  criterioCompleto: string;
}

// Contexto devuelto por la IA
export interface ICriterioContexto {
  nivel: string;
  grado: string;
  area: string;
  competencia: string;
  capacidades: string[];
  problematica: {
    id: number;
    nombre: string;
    descripcion: string;
    esPersonalizada: boolean;
    basadaEn?: {
      nombre: string;
      descripcion: string;
    };
  };
}

// Response completa de generación de criterios
export interface ICriterioGeneradoResponse {
  criterios: ICriterioIA[];
  contexto: ICriterioContexto;
}
