/**
 * Interfaces para la sesión COMPLEMENTARIA (Tutoría / Plan Lector).
 *
 * Diferencias clave respecto a la sesión curricular (ISesionPremium):
 *  - No requiere areaId (es transversal)
 *  - Duración fija de 45 minutos
 *  - Solo acepta tipo: "Tutoría" o "Plan Lector"
 *  - Guarda el tipo dentro del JSON de contenido de la sesión
 *  - Busca el resumen previo más reciente del mismo tipo para contexto
 *  - Clona contenido a miembros en unidades compartidas
 */

// ─── Tipos permitidos ────────────────────────────────────────────────────────

export type TipoSesionComplementaria = "Tutoría" | "Plan Lector";

// ─── Recurso narrativo (obligatorio en la respuesta) ─────────────────────────

/**
 * Texto completo listo para fotocopiar que acompaña la sesión complementaria.
 *  - Plan Lector → cuento / poema / leyenda / texto (200-900 palabras según grado)
 *  - Tutoría    → caso / historia / dinámica con personajes e instrucciones (≥150 palabras)
 */
export interface IRecursoNarrativo {
  titulo: string;
  tipo: string;            // "cuento" | "poema" | "leyenda" | "testimonio" | "caso" | "dinámica" | etc.
  contenido: string;       // Texto completo
  fuente: string;          // Ej: "Texto creado para la sesión"
}

// ─── Request body ────────────────────────────────────────────────────────────

export interface ISesionComplementariaRequest {
  tipo: TipoSesionComplementaria;
  actividadTitulo: string;
  descripcion?: string;
  unidadId?: string;
}

// ─── Respuesta del backend ───────────────────────────────────────────────────

/**
 * La sesión complementaria reutiliza la misma estructura de ISesionPremiumData
 * pero con tipo embebido y duración fija de 45 min.
 */
export interface ISesionComplementariaData {
  tipo: TipoSesionComplementaria;
  propositoSesion: string;
  enfoquesTransversales: Array<{
    enfoque: string;
    valor: string;
    actitud?: string;
  }>;
  preparacion: {
    quehacerAntes: string[];
    recursosMateriales: string[];
  };
  inicio: {
    tiempo: string;
    procesos: Array<{
      proceso: string;
      estrategias: string | string[];
      recursos?: string | string[];
      tiempo: string;
      imagen?: { url: string; descripcion?: string } | null;
      respuestasDocente?: { pregunta: string; respuestaEsperada: string }[];
    }>;
  };
  desarrollo: {
    tiempo: string;
    procesos: Array<{
      proceso: string;
      estrategias: string | string[];
      recursos?: string | string[];
      tiempo: string;
      imagen?: { url: string; descripcion?: string } | null;
      respuestasDocente?: { pregunta: string; respuestaEsperada: string }[];
    }>;
  };
  cierre: {
    tiempo: string;
    procesos: Array<{
      proceso: string;
      estrategias: string | string[];
      recursos?: string | string[];
      tiempo: string;
      imagen?: { url: string; descripcion?: string } | null;
      respuestasDocente?: { pregunta: string; respuestaEsperada: string }[];
    }>;
  };
  reflexiones?: {
    sobreAprendizajes: string;
    sobreEnsenanza: string;
  };
  recursoNarrativo: IRecursoNarrativo;
  resumen?: string;
}

export interface ISesionComplementariaSesion extends ISesionComplementariaData {
  id: string;
  titulo: string;
  duracion: number; // Siempre 45
  usuario?: unknown;
  [key: string]: unknown;
}

export interface ISesionComplementariaResponse {
  success: boolean;
  message?: string;
  docente: string;
  institucion: string;
  sesion: ISesionComplementariaSesion;
}
