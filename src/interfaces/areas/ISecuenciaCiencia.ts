import { IProcesoCiencia } from './IProcesoCiencia';
import { IPreguntaMetacognicion } from '../ISesionAprendizaje';

/**
 * Interfaces para las fases de la secuencia didáctica del área de Ciencia y Tecnología
 */

export interface IFaseInicioCiencia {
  tiempo: string;
  procesos: IProcesoCiencia[];
  
  // Campos opcionales
  motivacion?: string[];
  criteriosEvaluacion?: string[];
  comunicacionPropósito?: string;
  enfoqueTransversal?: string;
  acuerdosConvivencia?: string;
}

export interface IFaseDesarrolloCiencia {
  tiempo: string;
  procesos: IProcesoCiencia[];
  
  // Campos opcionales
  procesosDidacticos?: {
    numero: number;
    titulo: string;
    contenido: string;
    actividades: string[];
    vinculacionCapacidad?: string;
    formalizacion?: string;
    ejemplos?: string[];
  }[];
  atencionDiferenciada?: {
    estudiantesApoyo: string;
    estudiantesAvanzados: string;
  };
}

export interface IFaseCierreCiencia {
  tiempo: string;
  procesos: IProcesoCiencia[];
  
  // Campos opcionales
  metacognicion?: IPreguntaMetacognicion[];
  recuentoAcciones?: string[];
  utilidadAprendido?: {
    preguntaReflexiva: string;
    ejemplosEstudiantes: string;
  };
  aplicacionPractica?: {
    pregunta: string;
    respuesta: string;
  };
  compromisoPersonal?: string;
  tareaParaCasa?: string;
}

export interface ISecuenciaDidacticaCiencia {
  inicio: IFaseInicioCiencia;
  desarrollo: IFaseDesarrolloCiencia;
  cierre: IFaseCierreCiencia;
}
