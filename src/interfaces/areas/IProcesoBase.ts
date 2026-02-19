/**
 * Imagen SVG asociada a un proceso de la secuencia didáctica
 */
export interface IImagenProceso {
  /** Identificador único de la imagen (ej: "mat__frutas__manzana__01") */
  id: string;
  /** URL completa del SVG en S3 */
  url: string;
  /** Descripción breve de la imagen */
  descripcion: string;
  /** Dónde renderizar respecto al texto de estrategias */
  posicion: 'antes' | 'despues' | 'junto';
}

/**
 * Interfaz base para todos los procesos de secuencia didáctica
 * Propiedades comunes a todas las áreas
 */
export interface IProcesoBase {
  proceso: string;
  estrategias: string;
  recursosDidacticos: string;
  tiempo: string;
  /** Imágenes SVG opcionales asociadas a este proceso */
  imagenes?: IImagenProceso[];
}
