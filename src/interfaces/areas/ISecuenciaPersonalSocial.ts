import { IProcesoPersonalSocial } from './IProcesoPersonalSocial';
import { IPreguntaMetacognicion } from '../ISesionAprendizaje';

/**
 * Interfaces para las fases de la secuencia didáctica del área de Personal Social
 */

export interface IFaseInicioPersonalSocial {
  tiempo: string;
  procesos: IProcesoPersonalSocial[];
  
  // Campos opcionales
  motivacion?: string[];
  criteriosEvaluacion?: string[];
  comunicacionPropósito?: string;
  enfoqueTransversal?: string;
  acuerdosConvivencia?: string;
}

export interface IFaseDesarrolloPersonalSocial {
  tiempo: string;
  procesos: IProcesoPersonalSocial[];
  
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

export interface IFaseCierrePersonalSocial {
  tiempo: string;
  procesos: IProcesoPersonalSocial[];
  
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

export interface ISecuenciaDidacticaPersonalSocial {
  inicio: IFaseInicioPersonalSocial;
  desarrollo: IFaseDesarrolloPersonalSocial;
  cierre: IFaseCierrePersonalSocial;
}
