import {
  IDatosGenerales,
  IPropositoAprendizaje,
  IPropositoSesion,
  IEnfoqueTransversal,
  IPreparacionSesion,
  IReflexionAprendizaje,
  IFirmas
} from '../ISesionAprendizaje';
import { ISecuenciaDidacticaMatematica } from './ISecuenciaMatematica';
import { ISecuenciaDidacticaComunicacion } from './ISecuenciaComunicacion';
import { ISecuenciaDidacticaCiencia } from './ISecuenciaCiencia';
import { ISecuenciaDidacticaPersonalSocial } from './ISecuenciaPersonalSocial';

/**
 * Sesión de Aprendizaje específica para el área de Matemática
 * Incluye secuencia didáctica con soporte para problemas matemáticos e imágenes generadas por IA
 */
export interface ISesionAprendizajeMatematica {
  datosGenerales: IDatosGenerales;
  titulo: string;
  propositoAprendizaje: IPropositoAprendizaje;
  propositoSesion: IPropositoSesion;
  enfoquesTransversales: IEnfoqueTransversal[];
  preparacion: IPreparacionSesion;
  secuenciaDidactica: ISecuenciaDidacticaMatematica;
  reflexiones: IReflexionAprendizaje;
  firmas: IFirmas;
}

/**
 * Sesión de Aprendizaje específica para el área de Comunicación
 */
export interface ISesionAprendizajeComunicacion {
  datosGenerales: IDatosGenerales;
  titulo: string;
  propositoAprendizaje: IPropositoAprendizaje;
  propositoSesion: IPropositoSesion;
  enfoquesTransversales: IEnfoqueTransversal[];
  preparacion: IPreparacionSesion;
  secuenciaDidactica: ISecuenciaDidacticaComunicacion;
  reflexiones: IReflexionAprendizaje;
  firmas: IFirmas;
}

/**
 * Sesión de Aprendizaje específica para el área de Ciencia y Tecnología
 */
export interface ISesionAprendizajeCiencia {
  datosGenerales: IDatosGenerales;
  titulo: string;
  propositoAprendizaje: IPropositoAprendizaje;
  propositoSesion: IPropositoSesion;
  enfoquesTransversales: IEnfoqueTransversal[];
  preparacion: IPreparacionSesion;
  secuenciaDidactica: ISecuenciaDidacticaCiencia;
  reflexiones: IReflexionAprendizaje;
  firmas: IFirmas;
}

/**
 * Sesión de Aprendizaje específica para el área de Personal Social
 */
export interface ISesionAprendizajePersonalSocial {
  datosGenerales: IDatosGenerales;
  titulo: string;
  propositoAprendizaje: IPropositoAprendizaje;
  propositoSesion: IPropositoSesion;
  enfoquesTransversales: IEnfoqueTransversal[];
  preparacion: IPreparacionSesion;
  secuenciaDidactica: ISecuenciaDidacticaPersonalSocial;
  reflexiones: IReflexionAprendizaje;
  firmas: IFirmas;
}

/**
 * Type union para todas las sesiones de aprendizaje por área
 */
export type ISesionAprendizajePorArea =
  | ISesionAprendizajeMatematica
  | ISesionAprendizajeComunicacion
  | ISesionAprendizajeCiencia
  | ISesionAprendizajePersonalSocial;
