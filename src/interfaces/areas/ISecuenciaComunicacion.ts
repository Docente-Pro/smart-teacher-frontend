import { IProcesoComunicacion } from './IProcesoComunicacion';
import { IPreguntaMetacognicion } from '../ISesionAprendizaje';

/**
 * Interfaces para las fases de la secuencia didáctica del área de Comunicación
 */

export interface IFaseInicioComunicacion {
  tiempo: string;
  procesos: IProcesoComunicacion[];
  
  // Campos opcionales
  motivacion?: string[];
  criteriosEvaluacion?: string[];
  comunicacionPropósito?: string;
  enfoqueTransversal?: string;
  acuerdosConvivencia?: string;
}

export interface IFaseDesarrolloComunicacion {
  tiempo: string;
  procesos: IProcesoComunicacion[];
  
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

export interface IFaseCierreComunicacion {
  tiempo: string;
  procesos: IProcesoComunicacion[];
  
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

export interface ISecuenciaDidacticaComunicacion {
  inicio: IFaseInicioComunicacion;
  desarrollo: IFaseDesarrolloComunicacion;
  cierre: IFaseCierreComunicacion;
}
