import { ISesionAprendizaje } from "@/interfaces/ISesionAprendizaje";

/**
 * Estado inicial para una sesión de aprendizaje vacía
 * Se usa como base para el cuestionario de creación de sesiones
 */
export const initialStateSesion: ISesionAprendizaje = {
  datosGenerales: {
    institucion: "",
    docente: "",
    nivel: "",
    grado: "",
    area: "",
    fecha: new Date().toLocaleDateString('es-PE', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }),
    duracion: "",
    numeroEstudiantes: ""
  },

  titulo: "",

  propositoAprendizaje: {
    competencia: "",
    capacidades: [],
    criteriosEvaluacion: [],
    evidenciaAprendizaje: "",
    instrumentoEvaluacion: "",
    competenciasTransversales: []
  },

  propositoSesion: "",

  enfoquesTransversales: [],

  preparacion: {
    quehacerAntes: [],
    recursosMateriales: []
  },

  secuenciaDidactica: {
    inicio: {
      tiempo: "",
      procesos: []
    },
    desarrollo: {
      tiempo: "",
      procesos: []
    },
    cierre: {
      tiempo: "",
      procesos: []
    }
  },

  reflexiones: {
    avancesEstudiantes: "",
    dificultadesExperimentadas: "",
    aprendizajesReforzar: "",
    actividadesEstrategiasMateriales: ""
  },

  firmas: {
    docente: {
      nombre: "",
      cargo: "Docente"
    },
    director: {
      nombre: "",
      cargo: "Director(a)"
    }
  }
};
