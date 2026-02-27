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
}
