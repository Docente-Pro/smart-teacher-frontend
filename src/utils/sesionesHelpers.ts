/**
 * Utilidades y helpers para trabajar con sesiones por área
 */

import {
  IProcesoMatematica,
  ISesionAprendizajeMatematica,
  ISesionAprendizajeComunicacion,
  ISesionAprendizajeCiencia,
  ISesionAprendizajePersonalSocial,
  ISesionAprendizajePorArea,
  tieneProblemaMatematico,
  tieneSolucionMatematica,
  esImagenValida
} from '@/interfaces';

// ============================================
// DETECCIÓN DE ÁREA
// ============================================

/**
 * Normaliza el nombre del área
 */
export const normalizarArea = (area: string): string => {
  return area
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .trim();
};

/**
 * Detecta si el área es Matemática
 */
export const esAreaMatematica = (area: string): boolean => {
  const areaNormalizada = normalizarArea(area);
  return areaNormalizada.includes('matemat');
};

/**
 * Detecta si el área es Comunicación
 */
export const esAreaComunicacion = (area: string): boolean => {
  const areaNormalizada = normalizarArea(area);
  return areaNormalizada.includes('comunicaci');
};

/**
 * Detecta si el área es Ciencia y Tecnología
 */
export const esAreaCiencia = (area: string): boolean => {
  const areaNormalizada = normalizarArea(area);
  return areaNormalizada.includes('ciencia');
};

/**
 * Detecta si el área es Personal Social
 */
export const esAreaPersonalSocial = (area: string): boolean => {
  const areaNormalizada = normalizarArea(area);
  return areaNormalizada.includes('personal') || areaNormalizada.includes('social');
};

/**
 * Obtiene el tipo de área
 */
export type TipoArea = 'matematica' | 'comunicacion' | 'ciencia' | 'personal-social' | 'otra';

export const obtenerTipoArea = (area: string): TipoArea => {
  if (esAreaMatematica(area)) return 'matematica';
  if (esAreaComunicacion(area)) return 'comunicacion';
  if (esAreaCiencia(area)) return 'ciencia';
  if (esAreaPersonalSocial(area)) return 'personal-social';
  return 'otra';
};

// ============================================
// ESTADÍSTICAS DE SESIÓN
// ============================================

/**
 * Cuenta los problemas matemáticos en una sesión de Matemática
 */
export const contarProblemasMatematicos = (
  sesion: ISesionAprendizajeMatematica
): number => {
  const { inicio, desarrollo, cierre } = sesion.secuenciaDidactica;

  let count = 0;
  const todosProcesos = [
    ...inicio.procesos,
    ...desarrollo.procesos,
    ...cierre.procesos
  ];

  todosProcesos.forEach((proceso) => {
    if (tieneProblemaMatematico(proceso)) count++;
  });

  return count;
};

/**
 * Obtiene todos los procesos con problemas matemáticos
 */
export const obtenerProcesosConProblemas = (
  sesion: ISesionAprendizajeMatematica
): IProcesoMatematica[] => {
  const { inicio, desarrollo, cierre } = sesion.secuenciaDidactica;

  const todosProcesos = [
    ...inicio.procesos,
    ...desarrollo.procesos,
    ...cierre.procesos
  ];

  return todosProcesos.filter(tieneProblemaMatematico);
};

/**
 * Obtiene estadísticas de imágenes en una sesión
 */
export interface EstadisticasImagenes {
  totalProblemas: number;
  imagenesProblemaValidas: number;
  imagenesSolucionValidas: number;
  imagenesEnGeneracion: number;
  porcentajeCompletado: number;
}

export const obtenerEstadisticasImagenes = (
  sesion: ISesionAprendizajeMatematica
): EstadisticasImagenes => {
  const procesosConProblemas = obtenerProcesosConProblemas(sesion);
  const totalProblemas = procesosConProblemas.length;

  let imagenesProblemaValidas = 0;
  let imagenesSolucionValidas = 0;
  let imagenesEnGeneracion = 0;

  procesosConProblemas.forEach((proceso) => {
    if (esImagenValida(proceso.imagenProblema)) {
      imagenesProblemaValidas++;
    } else if (proceso.imagenProblema === 'GENERATE_IMAGE') {
      imagenesEnGeneracion++;
    }

    if (esImagenValida(proceso.imagenSolucion)) {
      imagenesSolucionValidas++;
    } else if (proceso.imagenSolucion === 'GENERATE_IMAGE') {
      imagenesEnGeneracion++;
    }
  });

  const totalImagenesEsperadas = totalProblemas * 2;
  const totalImagenesValidas = imagenesProblemaValidas + imagenesSolucionValidas;
  const porcentajeCompletado =
    totalImagenesEsperadas > 0
      ? Math.round((totalImagenesValidas / totalImagenesEsperadas) * 100)
      : 0;

  return {
    totalProblemas,
    imagenesProblemaValidas,
    imagenesSolucionValidas,
    imagenesEnGeneracion,
    porcentajeCompletado
  };
};

// ============================================
// VALIDACIONES
// ============================================

/**
 * Valida que un proceso de Matemática esté completo
 */
export const procesoMatematicaCompleto = (proceso: IProcesoMatematica): boolean => {
  if (!tieneProblemaMatematico(proceso)) return true; // No requiere problema
  if (!tieneSolucionMatematica(proceso)) return false;
  if (!esImagenValida(proceso.imagenProblema)) return false;
  if (!esImagenValida(proceso.imagenSolucion)) return false;
  return true;
};

/**
 * Valida que una sesión de Matemática esté completa
 */
export const sesionMatematicaCompleta = (sesion: ISesionAprendizajeMatematica): boolean => {
  const procesosConProblemas = obtenerProcesosConProblemas(sesion);
  return procesosConProblemas.every(procesoMatematicaCompleto);
};

// ============================================
// DESCARGA DE IMÁGENES
// ============================================

/**
 * Descarga una imagen desde una URL
 */
export const descargarImagen = async (url: string, nombreArchivo: string): Promise<void> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al descargar imagen');

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${nombreArchivo}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error descargando imagen:', error);
    throw error;
  }
};

/**
 * Descarga todas las imágenes de un proceso
 */
export const descargarImagenesDelProceso = async (
  proceso: IProcesoMatematica,
  nombreBase?: string
): Promise<void> => {
  const base = nombreBase || proceso.proceso.replace(/[^a-zA-Z0-9]/g, '_');

  const descargas: Promise<void>[] = [];

  if (proceso.imagenProblema && esImagenValida(proceso.imagenProblema)) {
    descargas.push(descargarImagen(proceso.imagenProblema, `${base}_problema`));
  }

  if (proceso.imagenSolucion && esImagenValida(proceso.imagenSolucion)) {
    descargas.push(descargarImagen(proceso.imagenSolucion, `${base}_solucion`));
  }

  await Promise.all(descargas);
};

/**
 * Descarga todas las imágenes de una sesión
 */
export const descargarImagenesDeLaSesion = async (
  sesion: ISesionAprendizajeMatematica
): Promise<void> => {
  const procesosConProblemas = obtenerProcesosConProblemas(sesion);

  for (let i = 0; i < procesosConProblemas.length; i++) {
    const proceso = procesosConProblemas[i];
    await descargarImagenesDelProceso(proceso, `problema_${i + 1}`);
  }
};

// ============================================
// FORMATEO Y DISPLAY
// ============================================

/**
 * Formatea el tiempo de un proceso (ej: "10 min" -> "10 minutos")
 */
export const formatearTiempo = (tiempo: string): string => {
  return tiempo.replace(/min/gi, 'minutos').replace(/hr|h/gi, 'hora(s)');
};

/**
 * Obtiene un resumen de un proceso
 */
export interface ResumenProceso {
  nombre: string;
  tiempo: string;
  tieneProblema: boolean;
  tieneSolucion: boolean;
  estadoImagenes: 'completo' | 'parcial' | 'generando' | 'sin-problema';
}

export const obtenerResumenProceso = (proceso: IProcesoMatematica): ResumenProceso => {
  const tieneProblema = tieneProblemaMatematico(proceso);
  const tieneSolucion = tieneSolucionMatematica(proceso);

  let estadoImagenes: ResumenProceso['estadoImagenes'] = 'sin-problema';

  if (tieneProblema) {
    const imagenProblemaOk = esImagenValida(proceso.imagenProblema);
    const imagenSolucionOk = esImagenValida(proceso.imagenSolucion);

    if (imagenProblemaOk && imagenSolucionOk) {
      estadoImagenes = 'completo';
    } else if (imagenProblemaOk || imagenSolucionOk) {
      estadoImagenes = 'parcial';
    } else {
      estadoImagenes = 'generando';
    }
  }

  return {
    nombre: proceso.proceso,
    tiempo: proceso.tiempo,
    tieneProblema,
    tieneSolucion,
    estadoImagenes
  };
};

// ============================================
// TYPE CASTING SEGURO
// ============================================

/**
 * Type guard para verificar si una sesión es de Matemática
 */
export const esSesionMatematica = (
  sesion: ISesionAprendizajePorArea
): sesion is ISesionAprendizajeMatematica => {
  return esAreaMatematica(sesion.datosGenerales.area);
};

/**
 * Type guard para verificar si una sesión es de Comunicación
 */
export const esSesionComunicacion = (
  sesion: ISesionAprendizajePorArea
): sesion is ISesionAprendizajeComunicacion => {
  return esAreaComunicacion(sesion.datosGenerales.area);
};

/**
 * Type guard para verificar si una sesión es de Ciencia
 */
export const esSesionCiencia = (
  sesion: ISesionAprendizajePorArea
): sesion is ISesionAprendizajeCiencia => {
  return esAreaCiencia(sesion.datosGenerales.area);
};

/**
 * Type guard para verificar si una sesión es de Personal Social
 */
export const esSesionPersonalSocial = (
  sesion: ISesionAprendizajePorArea
): sesion is ISesionAprendizajePersonalSocial => {
  return esAreaPersonalSocial(sesion.datosGenerales.area);
};

// ============================================
// UTILIDADES DE TEXTO
// ============================================

/**
 * Trunca un texto largo
 */
export const truncarTexto = (texto: string, maxLength: number = 100): string => {
  if (texto.length <= maxLength) return texto;
  return texto.substring(0, maxLength) + '...';
};

/**
 * Extrae el primer número de un problema matemático
 */
export const extraerPrimerNumero = (texto: string): number | null => {
  const match = texto.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

/**
 * Detecta operaciones matemáticas en un texto
 */
export const detectarOperaciones = (texto: string): string[] => {
  const operaciones: string[] = [];

  if (texto.includes('+') || /sum|sumar|total/i.test(texto)) {
    operaciones.push('suma');
  }
  if (texto.includes('-') || /rest|restar|diferencia/i.test(texto)) {
    operaciones.push('resta');
  }
  if (texto.includes('×') || texto.includes('*') || /multipl|por/i.test(texto)) {
    operaciones.push('multiplicación');
  }
  if (texto.includes('÷') || texto.includes('/') || /divid|entre/i.test(texto)) {
    operaciones.push('división');
  }

  return operaciones;
};
