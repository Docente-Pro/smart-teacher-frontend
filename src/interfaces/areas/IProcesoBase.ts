/**
 * Imagen asociada a un proceso de la secuencia didáctica
 */
export interface IImagenProceso {
  /** Identificador único de la imagen (opcional en v2) */
  id?: string;
  /** URL completa de la imagen (S3) */
  url: string;
  /** "ilustrativa" = imagen decorativa, "contenido" = imagen con texto overlay */
  tipo?: "ilustrativa" | "contenido";
  /** Descripción breve de la imagen */
  descripcion: string;
  /** Dónde renderizar respecto al texto de estrategias */
  posicion: 'antes' | 'junto' | 'despues';
  /** Texto superpuesto en la imagen (solo presente cuando tipo === "contenido") */
  texto_overlay?: string;
}

/**
 * Interfaz base para todos los procesos de secuencia didáctica
 * Propiedades comunes a todas las áreas
 */
export interface IProcesoBase {
  proceso: string;
  estrategias: string;
  /** Backend v2 usa "recursos", v1 usaba "recursosDidacticos" */
  recursos?: string;
  recursosDidacticos?: string;
  tiempo: string;
  /** Imagen singular (v2) — una imagen opcional por proceso */
  imagen?: IImagenProceso;
  /** @deprecated Imágenes en array (v1) — mantener por retrocompatibilidad */
  imagenes?: IImagenProceso[];
  /** Gráfico educativo generado por IA (Matemática o área curricular) */
  grafico?: Record<string, unknown> | null;

  // ─── Campos de Matemática (disponibles en cualquier proceso) ──────────────
  /** Texto completo del problema matemático */
  problemaMatematico?: string;
  /** Gráfico del problema (alias de grafico para legacy) */
  graficoProblema?: Record<string, unknown> | null;
  /** Solución paso a paso del problema */
  solucionProblema?: string;
  /** Gráfico de la solución (ecuacion_cajas resuelta, etc.) */
  graficoSolucion?: Record<string, unknown> | null;
  /** Gráfico de la operación matemática (operacion_vertical, ecuacion_cajas, etc.) */
  graficoOperacion?: Record<string, unknown> | null;
  /** URL imagen del problema (legacy DALL-E) */
  imagenProblema?: string;
  /** URL imagen de la solución (legacy DALL-E) */
  imagenSolucion?: string;

  // ─── Campo transversal para respuestas del docente ────────────────────────
  /** Respuestas esperadas por el docente. Usado en todas las áreas para que el docente
   *  tenga la clave de respuestas de las preguntas/ejercicios del proceso. */
  respuestasDocente?: IRespuestaDocente[];
}

/**
 * Respuesta esperada para una pregunta o ejercicio del proceso.
 * El docente puede ver la respuesta correcta sin calcular ni deducir.
 */
export interface IRespuestaDocente {
  /** La pregunta o enunciado del ejercicio */
  pregunta: string;
  /** La respuesta esperada completa */
  respuestaEsperada: string;
}
