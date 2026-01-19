import { IProcesoBase } from './IProcesoBase';

/**
 * Interfaz para procesos del área de Matemática
 * Incluye propiedades específicas para problemas matemáticos con imágenes generadas por IA
 */
export interface IProcesoMatematica extends IProcesoBase {
  // Propiedades opcionales - Solo aparecen en procesos específicos:
  // - "Familiarización con el problema" (Desarrollo)
  // - "Planteamiento de otros problemas" (Cierre)
  
  /** Texto completo del problema matemático */
  problemaMatematico?: string;
  
  /** Descripción en inglés para generar la imagen del problema con DALL-E */
  descripcionImagenProblema?: string;
  
  /** URL de la imagen generada por DALL-E que ilustra el problema */
  imagenProblema?: string;
  
  /** Solución paso a paso del problema (vivencial, gráfica, simbólica) */
  solucionProblema?: string;
  
  /** Descripción en inglés para generar la imagen de la solución con DALL-E */
  descripcionImagenSolucion?: string;
  
  /** URL de la imagen generada por DALL-E que ilustra la solución */
  imagenSolucion?: string;
}

/**
 * Type guard para verificar si un proceso tiene problema matemático
 */
export const tieneProblemaMatematico = (proceso: IProcesoMatematica): boolean => {
  return !!(proceso.problemaMatematico && proceso.imagenProblema);
};

/**
 * Type guard para verificar si un proceso tiene solución con imagen
 */
export const tieneSolucionMatematica = (proceso: IProcesoMatematica): boolean => {
  return !!(proceso.solucionProblema && proceso.imagenSolucion);
};

/**
 * Valida si una URL de imagen es válida (no es placeholder de generación)
 */
export const esImagenValida = (url: string | undefined): boolean => {
  if (!url) return false;
  return url !== "GENERATE_IMAGE" && url.startsWith("http");
};
