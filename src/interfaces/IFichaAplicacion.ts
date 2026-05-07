/**
 * Interfaces para Fichas de Aplicación.
 *
 * Las fichas son documentos PDF complementarios que se generan DESPUÉS de cada
 * sesión de aprendizaje. Contienen ejercicios, preguntas y actividades para
 * que los estudiantes apliquen lo aprendido.
 *
 * - Python genera el JSON de la ficha (Gemini)
 * - Node guarda JSON en BD + genera presigned URL
 * - Front renderiza el PDF client-side y lo sube a S3
 */

// ─── Tipos de ficha ─────────────────────────────────────────────────────────

export type TipoFicha =
  | "problemas"
  | "comprension_lectora"
  | "indagacion"
  | "reflexion"
  | "apreciacion"
  | "worksheet"
  | "registro_actividad";

// ─── Tipos de sección (10 bloques renderizables) ────────────────────────────

export type TipoSeccion =
  | "texto"
  | "problema"
  | "preguntas"
  | "tabla"
  | "completar"
  | "unir"
  | "ordenar"
  | "verdadero_falso"
  | "seleccion_multiple"
  | "espacio_dibujo";

// ─── Contenido por tipo de sección ──────────────────────────────────────────

export interface ISeccionTexto {
  tipo: "texto";
  titulo: string;
  contenido: {
    texto: string;
    fuente?: string;
  };
}

export interface ISeccionProblema {
  tipo: "problema";
  titulo: string;
  contenido: {
    enunciado: string;
    datos?: string[];
    pregunta?: string;
    espacioResolucion?: boolean;
    grafico?: Record<string, unknown> | null;
    graficoOperacion?: Record<string, unknown> | null;
  };
}

export interface IPreguntaItem {
  pregunta: string;
  nivel?: "literal" | "inferencial" | "crítico";
  lineasRespuesta?: number;
}

export interface ISeccionPreguntas {
  tipo: "preguntas";
  titulo: string;
  contenido: {
    preguntas: IPreguntaItem[];
  };
}

export interface ISeccionTabla {
  tipo: "tabla";
  titulo: string;
  contenido: {
    columnas: string[];
    filas?: string[][];
    esEditable?: boolean;
  };
}

export interface ISeccionCompletar {
  tipo: "completar";
  titulo: string;
  contenido: {
    oraciones: string[];
    bancoRespuestas?: string[];
  };
}

export interface ISeccionUnir {
  tipo: "unir";
  titulo: string;
  contenido: {
    columnaA: string[];
    columnaB: string[];
  };
}

export interface IElementoOrdenar {
  texto: string;
  orden?: number;
}

export interface ISeccionOrdenar {
  tipo: "ordenar";
  titulo: string;
  contenido: {
    elementos: Array<IElementoOrdenar | string>;
    tipoOrden?: "cronologico" | "numerico" | "logico";
  };
}

export interface IAfirmacionVF {
  /** Texto mostrado al estudiante (contrato API) */
  texto?: string;
  /** @deprecated Mismo significado que `texto`; mantener por payloads antiguos */
  afirmacion?: string;
  respuesta?: boolean; // Va al solucionario, no se muestra
}

export interface ISeccionVerdaderoFalso {
  tipo: "verdadero_falso";
  titulo: string;
  contenido: {
    afirmaciones: IAfirmacionVF[];
  };
}

export interface IPreguntaSeleccion {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta?: string; // Va al solucionario
}

export interface ISeccionSeleccionMultiple {
  tipo: "seleccion_multiple";
  titulo: string;
  contenido: {
    preguntas: IPreguntaSeleccion[];
  };
}

export interface ISeccionEspacioDibujo {
  tipo: "espacio_dibujo";
  titulo: string;
  contenido: {
    instruccion: string;
    alto?: "pequeño" | "mediano" | "grande";
  };
}

/** Unión de todos los tipos de sección */
export type ISeccionFicha =
  | ISeccionTexto
  | ISeccionProblema
  | ISeccionPreguntas
  | ISeccionTabla
  | ISeccionCompletar
  | ISeccionUnir
  | ISeccionOrdenar
  | ISeccionVerdaderoFalso
  | ISeccionSeleccionMultiple
  | ISeccionEspacioDibujo;

// ─── Solucionario ───────────────────────────────────────────────────────────

export interface ISolucionarioItem {
  numero: number;
  respuesta: string;
  procedimiento?: string;
}

// ─── Ficha completa (JSON que devuelve Python → Node → Front) ───────────────

export interface IFichaAplicacionData {
  titulo: string;
  area: string;
  grado: string;
  nivel: string;
  competencia?: string;
  capacidad?: string;
  desempeno?: string;
  instruccionGeneral: string;
  tipoFicha: TipoFicha;
  secciones: ISeccionFicha[];
  solucionario?: ISolucionarioItem[];
}

// ─── Request al backend (Front → Node) ──────────────────────────────────────

export interface IFichaAplicacionRequest {
  incluirRespuestas?: boolean;
  dificultad?: "baja" | "media" | "alta";
}

// ─── Response del backend (Node → Front) ─────────────────────────────────────

export interface IFichaAplicacionResponse {
  fichaId: string;
  ficha: IFichaAplicacionData;
  presignedUrl: string;
  s3Key: string;
}

// ─── Confirm upload request ──────────────────────────────────────────────────

export interface IFichaConfirmRequest {
  s3Key: string;
}

// ─── Ficha almacenada (GET /fichas/:id) ──────────────────────────────────────

export interface IFichaAlmacenada {
  id: string;
  sesionId: string;
  fichaJSON: IFichaAplicacionData;
  pdfUrl: string | null;
  area: string;
  grado: string;
  tipoFicha: TipoFicha;
  createdAt: string;
  updatedAt: string;
}
