import { IProcesoMatematica } from './IProcesoMatematica';
import { IPreguntaMetacognicion } from '../ISesionAprendizaje';

/**
 * Interfaces para las fases de la secuencia didáctica del área de Matemática
 */

export interface IFaseInicioMatematica {
  tiempo: string;
  procesos: IProcesoMatematica[];
  
  // Campos opcionales de la estructura anterior
  motivacion?: string[];
  criteriosEvaluacion?: string[];
  comunicacionPropósito?: string;
  enfoqueTransversal?: string;
  acuerdosConvivencia?: string;
}

export interface IFaseDesarrolloMatematica {
  tiempo: string;
  procesos: IProcesoMatematica[];
  
  // Campos opcionales de la estructura anterior
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

export interface IFaseCierreMatematica {
  tiempo: string;
  procesos: IProcesoMatematica[];
  
  // Campos opcionales de la estructura anterior
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

export interface ISecuenciaDidacticaMatematica {
  inicio: IFaseInicioMatematica;
  desarrollo: IFaseDesarrolloMatematica;
  cierre: IFaseCierreMatematica;
}
