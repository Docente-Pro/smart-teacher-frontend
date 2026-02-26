/**
 * Interfaces para los datos de la Sesión de Aprendizaje
 * Siguiendo el Currículo Nacional de Educación Básica - MINEDU
 */

export interface IDatosGenerales {
  institucion: string;
  docente: string;
  nivel: string;
  grado: string;
  area: string;
  fecha: string;
  duracion: string;
  numeroEstudiantes: string;
}

export interface ICapacidad {
  nombre: string;
  descripcion: string;
}

export interface ICriterioIA {
  id: string;
  habilidad: string;
  conocimiento: string;
  condicion: string;
  finalidad: string;
  criterioCompleto: string;
}

export interface IPropositoAprendizaje {
  competencia: string;  // Simplificado a string
  capacidades: ICapacidad[];
  criteriosEvaluacion: (string | ICriterioIA)[];  // Puede ser string o objeto ICriterioIA
  evidenciaAprendizaje: string;
  instrumentoEvaluacion: string;
  competenciasTransversales: string[];  // Simplificado a string[]
  cantidadCriterios?: number;  // Cantidad de criterios a generar por la IA
}

export type IPropositoSesion = string;

export interface IEnfoqueTransversal {
  nombre: string;
  actitudesObservables: string;
}

export interface IPreparacionSesion {
  quehacerAntes: string[];
  recursosMateriales: string[];
  tipoGraficoPreferido?: string;  // Tipo de gráfico preferido para problemas matemáticos
}

export interface IActividadDidactica {
  titulo: string;
  contenido: string | string[];
}

export interface IPreguntaMetacognicion {
  pregunta: string;
  respuestaEsperada: string;
}

export interface IImagenProcesoGeneral {
  id?: string;
  url: string;
  descripcion: string;
  posicion: 'antes' | 'junto' | 'despues';
}

export interface IProcesoSecuencia {
  proceso: string;
  estrategias: string;
  /** Backend v2 usa "recursos", v1 usaba "recursosDidacticos" */
  recursos?: string;
  recursosDidacticos?: string;
  tiempo: string;
  /** Imagen singular (v2) — una imagen opcional por proceso */
  imagen?: IImagenProcesoGeneral;
  /** @deprecated Imágenes en array (v1) — mantener por retrocompatibilidad */
  imagenes?: IImagenProcesoGeneral[];
}

export interface IFaseInicio {
  tiempo: string;
  procesos: IProcesoSecuencia[];
  // Campos opcionales de la estructura anterior
  motivacion?: string[];
  criteriosEvaluacion?: string[];
  comunicacionPropósito?: string;
  enfoqueTransversal?: string;
  acuerdosConvivencia?: string;
}

export interface IProcesoDidactico {
  numero: number;
  titulo: string;
  contenido: string;
  actividades: string[];
  vinculacionCapacidad?: string;
  formalizacion?: string;
  ejemplos?: string[];
}

export interface IFaseDesarrollo {
  tiempo: string;
  procesos: IProcesoSecuencia[];
  // Campos opcionales de la estructura anterior
  procesosDidacticos?: IProcesoDidactico[];
  atencionDiferenciada?: {
    estudiantesApoyo: string;
    estudiantesAvanzados: string;
  };
}

export interface IFaseCierre {
  tiempo: string;
  procesos: IProcesoSecuencia[];
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

export interface ISecuenciaDidactica {
  inicio: IFaseInicio;
  desarrollo: IFaseDesarrollo;
  cierre: IFaseCierre;
}

export interface IReflexionAprendizaje {
  avancesEstudiantes: string;
  dificultadesExperimentadas: string;
  aprendizajesReforzar: string;
  actividadesEstrategiasMateriales: string;
}

export interface IFirma {
  nombre: string;
  cargo: string;
}

export interface IFirmas {
  docente: IFirma;
  director: IFirma;
}

export interface IImagenDisponible {
  id: string;
  url: string;
  descripcion: string;
  categoria?: string;
}

export interface ISesionAprendizaje {
  datosGenerales: IDatosGenerales;
  titulo: string;
  temaCurricular?: string; // 🆕 Tema seleccionado o personalizado del currículo
  temaId?: number; // 🆕 ID del tema del currículo (null si es personalizado)
  situacionTexto?: string; // 🆕 Texto de la situación significativa devuelto por sugerir-competencia
  propositoAprendizaje: IPropositoAprendizaje;
  propositoSesion: IPropositoSesion;
  enfoquesTransversales: IEnfoqueTransversal[];
  preparacion: IPreparacionSesion;
  secuenciaDidactica: ISecuenciaDidactica;
  reflexiones: IReflexionAprendizaje;
  firmas: IFirmas;
  /** Lista completa de imágenes disponibles que se ofreció a GPT (referencia/debug) */
  imagenes_disponibles?: IImagenDisponible[];
}
