/**
 * Interfaces — Instrumentos de Evaluación
 *
 * 1. Lista de cotejo      → se arma en cliente (sin llamada IA)
 * 2. Escala de valoración  → se arma en cliente (sin llamada IA)
 * 3. Rúbrica               → se genera vía POST /api/ia/generar-rubrica
 *
 * Todos se persisten con POST /api/ia/guardar-instrumento
 */

// ─── Base común ──────────────────────────────────────────────────────────────

export interface IInstrumentoBase {
  area: string;
  grado: string;
  competencia: string;
  evidencia: string;
}

// ─── 1. Lista de Cotejo ─────────────────────────────────────────────────────

export interface IListaCotejo extends IInstrumentoBase {
  tipo: "lista_cotejo";
  criterios: string[];
  columnas: ["Sí", "No"];
}

// ─── 2. Escala de Valoración ────────────────────────────────────────────────

export interface IEscalaValoracion extends IInstrumentoBase {
  tipo: "escala_valoracion";
  criterios: string[];
  columnas: ["Siempre", "A veces", "Nunca"];
}

// ─── 3. Rúbrica ─────────────────────────────────────────────────────────────

export interface INivelDescriptor {
  inicio: string;
  proceso: string;
  logrado: string;
  destacado: string;
}

export interface ICriterioRubrica {
  criterio: string;
  niveles: INivelDescriptor;
}

export interface IRubrica extends IInstrumentoBase {
  tipo: "rubrica";
  tema: string;
  criteriosRubrica: ICriterioRubrica[];
  niveles: ["Inicio", "Proceso", "Logrado", "Destacado"];
  escalaValores: { inicio: 1; proceso: 2; logrado: 3; destacado: 4 };
}

// ─── Tipo unión de los 3 instrumentos ───────────────────────────────────────

export type IInstrumentoEvaluacion = IListaCotejo | IEscalaValoracion | IRubrica;

// ─── Request / Response — POST /api/ia/generar-rubrica ──────────────────────

export interface IGenerarRubricaRequest {
  criterios: string[];
  area: string;
  grado: string;
  competencia: string;
  evidencia: string;
  tema?: string;
}

export interface IGenerarRubricaResponse {
  success: boolean;
  message?: string;
  data: IRubrica;
}

// ─── Request / Response — POST /api/ia/guardar-instrumento ──────────────────

export interface IGuardarInstrumentoRequest {
  instrumento: IInstrumentoEvaluacion;
  sesionId?: string;
}

export interface IGuardarInstrumentoResponse {
  url: string;
  tipo: string;
  grado: string;
}
