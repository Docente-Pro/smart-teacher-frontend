/**
 * Imagen asociada a un proceso de la secuencia didáctica
 */
export interface IImagenProceso {
  /** Identificador único de la imagen (opcional en v2) */
  id?: string;
  /** URL completa de la imagen (S3) */
  url: string;
  /** Descripción breve de la imagen */
  descripcion: string;
  /** Dónde renderizar respecto al texto de estrategias */
  posicion: 'antes' | 'junto' | 'despues';
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
}
