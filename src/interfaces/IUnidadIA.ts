// ============================================
// INTERFACES — IA Unidad de Aprendizaje (8 pasos)
// ============================================

// ─── Contexto Base (compartido en todos los endpoints) ───

export interface IUnidadProblematica {
  nombre: string;
  descripcion: string;
}

export interface IUnidadArea {
  nombre: string;
}

export interface IUnidadContextoBase {
  nivel: string;
  grado: string;
  numeroUnidad: number;
  titulo: string;
  duracion: number;
  fechaInicio: string;
  fechaFin: string;
  problematica: IUnidadProblematica;
  areas: IUnidadArea[];
}

// ─── Paso 1: Situación Significativa ───

export interface ISituacionBase {
  id: string;
  contexto: string;
  descripcion: string;
  region: string;
  score: number;
}

export interface ISituacionSignificativaResponse {
  situacionSignificativa: string;
  situacionBase: ISituacionBase;
}

export type ISituacionSignificativaRequest = IUnidadContextoBase;

// ─── Paso 2: Evidencias de Aprendizaje ───

export interface IEvidencias {
  reto: string;
  proposito: string;
  productoIntegrador: string;
  instrumentoEvaluacion: string;
}

export interface IEvidenciasRequest extends IUnidadContextoBase {
  situacionSignificativa: string;
}

export type IEvidenciasResponse = IEvidencias;

// ─── Paso 3: Propósitos de Aprendizaje ───

export interface ICompetenciaProposito {
  nombre: string;
  capacidades: string[];
  estandar: string;
  criterios: string[];
  actividades: string[];
  instrumento: string;
}

export interface IAreaProposito {
  area: string;
  competencias: ICompetenciaProposito[];
}

export interface ICompetenciaTransversal {
  nombre: string;
  capacidades: string[];
  criterios: string[];
}

export interface IPropositos {
  areasPropositos: IAreaProposito[];
  competenciasTransversales: ICompetenciaTransversal[];
}

export interface IPropositosRequest extends IUnidadContextoBase {
  situacionSignificativa: string;
  evidencias: IEvidencias;
}

export type IPropositosResponse = IPropositos;

// ─── Paso 4: Áreas Complementarias ───

export interface IAreaComplementaria {
  area: string;
  competenciaRelacionada: string;
  dimension: string;
  actividades: string[];
}

export interface IAreasComplementariasRequest extends IUnidadContextoBase {
  situacionSignificativa: string;
  propositos: IPropositos;
}

export interface IAreasComplementariasResponse {
  areasComplementarias: IAreaComplementaria[];
}

// ─── Paso 5: Enfoques Transversales ───

export interface IEnfoqueUnidad {
  enfoque: string;
  valor: string;
  actitudes: string;
}

export interface IEnfoquesRequest extends IUnidadContextoBase {
  situacionSignificativa: string;
}

export interface IEnfoquesResponse {
  enfoques: IEnfoqueUnidad[];
}

// ─── Paso 6: Secuencia de Actividades ───

export interface ITurnoActividad {
  area: string;
  actividad: string;
}

export interface IDiaSecuencia {
  dia: string;
  fecha: string;
  turnoManana: ITurnoActividad;
  turnoTarde: ITurnoActividad;
}

export interface ISemanaSecuencia {
  semana: number;
  dias: IDiaSecuencia[];
}

export interface ISecuencia {
  hiloConductor: string;
  semanas: ISemanaSecuencia[];
}

export interface ISecuenciaRequest extends IUnidadContextoBase {
  situacionSignificativa: string;
  evidencias: IEvidencias;
  propositos: IPropositos;
  enfoques: IEnfoqueUnidad[];
}

export type ISecuenciaResponse = ISecuencia;

// ─── Paso 7: Materiales y Recursos ───

export interface IMaterialesRequest extends IUnidadContextoBase {
  situacionSignificativa: string;
  secuencia: ISecuencia;
}

export interface IMaterialesResponse {
  materiales: string[];
}

// ─── Paso 8: Reflexiones ───

export interface IReflexionPregunta {
  pregunta: string;
}

export type IReflexionesRequest = IUnidadContextoBase;

export interface IReflexionesResponse {
  reflexiones: IReflexionPregunta[];
}

// ─── Progreso del Wizard ───

export type PasoUnidad =
  | "situacion-significativa"
  | "evidencias"
  | "propositos"
  | "areas-complementarias"
  | "enfoques"
  | "secuencia"
  | "materiales"
  | "reflexiones";

export interface IUnidadContenido {
  situacionSignificativa?: string;
  situacionBase?: ISituacionBase;
  evidencias?: IEvidencias;
  propositos?: IPropositos;
  areasComplementarias?: IAreaComplementaria[];
  enfoques?: IEnfoqueUnidad[];
  secuencia?: ISecuencia;
  materiales?: string[];
  reflexiones?: IReflexionPregunta[];
}

export interface IProgresoUnidadResponse {
  success: boolean;
  data: {
    pasosCompletados: PasoUnidad[];
    siguientePaso: PasoUnidad | null;
    totalPasos: number;
    completado: number;
    contenido: IUnidadContenido;
  };
}

export interface IPasoUnidadResponse<T = unknown> {
  success: boolean;
  paso: number;
  data: T;
  unidad: Record<string, unknown>;
  message: string;
}

// ─── Unidad Completa (contenido acumulado) ───

export interface IUnidadCompleta {
  contexto: IUnidadContextoBase;
  situacionSignificativa: string;
  situacionBase: ISituacionBase;
  evidencias: IEvidencias;
  propositos: IPropositos;
  areasComplementarias: IAreaComplementaria[];
  enfoques: IEnfoqueUnidad[];
  secuencia: ISecuencia;
  materiales: string[];
  reflexiones: IReflexionPregunta[];
}
