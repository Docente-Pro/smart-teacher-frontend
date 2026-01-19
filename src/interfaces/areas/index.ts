/**
 * Exportación centralizada de interfaces por área
 */

// Procesos por área
export * from './IProcesoBase';
export * from './IProcesoMatematica';
export * from './IProcesoComunicacion';
export * from './IProcesoCiencia';
export * from './IProcesoPersonalSocial';

// Secuencias didácticas por área
export * from './ISecuenciaMatematica';
export * from './ISecuenciaComunicacion';
export * from './ISecuenciaCiencia';
export * from './ISecuenciaPersonalSocial';

// Sesiones de aprendizaje por área
export * from './ISesionAprendizajePorArea';

// Type unions
export type IProcesoPorArea = 
  | import('./IProcesoMatematica').IProcesoMatematica
  | import('./IProcesoComunicacion').IProcesoComunicacion
  | import('./IProcesoCiencia').IProcesoCiencia
  | import('./IProcesoPersonalSocial').IProcesoPersonalSocial;
