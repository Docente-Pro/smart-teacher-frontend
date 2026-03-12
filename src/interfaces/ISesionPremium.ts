/**
 * Interfaces para la sesión de aprendizaje PREMIUM (generada dentro de una unidad).
 *
 * Diferencias clave respecto al flujo FREE (ISesionAprendizaje):
 *  - `estrategias` y `recursosDidacticos` pueden ser string o string[]
 *  - `propositoAprendizaje` es un array de múltiples competencias
 *  - `enfoquesTransversales` usa enfoque/valor/actitud
 *  - `reflexiones` usa sobreAprendizajes / sobreEnsenanza
 *  - Cada proceso puede incluir `imagenes` SVG opcionales
 *  - Incluye `resumen`, `fuentesMinedu` y `imagenesDisponibles`
 *  - La sesión ya existe en BD antes de generar el PDF (no necesita crearSesion)
 */

// ─── Propósito de Aprendizaje ────────────────────────────────────────────────

export interface ICapacidadPremium {
  nombre: string;
  descripcion?: string;
}

export interface IPropositoAprendizajePremium {
  competencia: string;
  capacidades: string[];
  estandar?: string;
  criteriosEvaluacion: string[];
  instrumento?: string;
  /** Campo que viene del backend como "evidencia" */
  evidencia?: string;
}

// ─── Enfoques Transversales ──────────────────────────────────────────────────

export interface IEnfoqueTransversalPremium {
  enfoque: string;
  valor: string;
  /** Backend envía "actitud" (singular) */
  actitud?: string;
  /** Compat: algunas respuestas pueden usar "actitudes" (plural) */
  actitudes?: string;
}

// ─── Preparación ─────────────────────────────────────────────────────────────

export interface IPreparacionPremium {
  quehacerAntes: string[];
  recursosMateriales: string[];
}

// ─── Imágenes en procesos ────────────────────────────────────────────────────

export interface IImagenProceso {
  id?: string;
  url: string;
  /** "ilustrativa" = imagen decorativa, "contenido" = imagen con texto overlay */
  tipo?: "ilustrativa" | "contenido";
  descripcion?: string;
  /** "antes" = antes del texto, "junto" = junto al texto, "debajo"/"despues" = después */
  posicion?: "antes" | "junto" | "despues" | "debajo";
  /** Texto superpuesto en la imagen (solo presente cuando tipo === "contenido") */
  texto_overlay?: string;
}

/** Imagen de contenido didáctico (tabla, gráfico, mapa, diagrama, etc.) */
export interface IImagenContenido {
  url: string;
  tipo: "tabla_doble_entrada" | "grafico_barras" | "mapa_geografico" | "diagrama_flujo" | string;
  descripcion?: string;
  posicion?: "junto" | "debajo";
}

// ─── Secuencia Didáctica ─────────────────────────────────────────────────────

export interface IProcesoPremium {
  proceso: string;
  /** Backend puede enviar string o string[] */
  estrategias: string | string[];
  /** Backend v2 usa "recursos", v1 usaba "recursosDidacticos" */
  recursos?: string | string[];
  recursosDidacticos?: string | string[];
  tiempo: string;
  /** Imagen singular (v2) — una imagen opcional por proceso */
  imagen?: IImagenProceso | null;
  /** @deprecated Imágenes en array (v1) — mantener por retrocompatibilidad */
  imagenes?: IImagenProceso[] | null;
  /** Imagen de contenido didáctico (tabla, gráfico, mapa, etc.) — máx. 2 por sesión */
  imagenContenido?: IImagenContenido | null;
  /** Gráfico educativo generado por IA (Matemática o área curricular) */
  grafico?: Record<string, unknown> | null;

  // ─── Campos de Matemática ─────────────────
  problemaMatematico?: string;
  graficoProblema?: Record<string, unknown> | null;
  solucionProblema?: string;
  graficoSolucion?: Record<string, unknown> | null;
  graficoOperacion?: Record<string, unknown> | null;
  imagenProblema?: string;
  imagenSolucion?: string;

  // ─── Respuestas del docente (transversal) ──
  respuestasDocente?: { pregunta: string; respuestaEsperada: string }[];
}

export interface IFasePremium {
  tiempo: string;
  procesos: IProcesoPremium[];
}

// ─── Reflexiones ─────────────────────────────────────────────────────────────

export interface IReflexionesPremium {
  sobreAprendizajes: string;
  sobreEnsenanza: string;
}

// ─── Fuentes MINEDU (RAG chunks consultados) ────────────────────────────────

export interface IFuenteMinedu {
  filename: string;
  nivel?: string;
  area?: string;
  pagina?: number;
  preview?: string;
}

// ─── Imágenes disponibles (catálogo ofrecido a GPT) ─────────────────────────

export interface IImagenDisponible {
  id: string;
  archivo?: string;
  url: string;
  descripcion?: string;
  categoria?: string;
  tags?: string[];
}

// ─── Sesión completa ─────────────────────────────────────────────────────────

export interface ISesionPremiumData {
  propositoSesion: string;
  propositoAprendizaje: IPropositoAprendizajePremium[];
  enfoquesTransversales: IEnfoqueTransversalPremium[];
  preparacion: IPreparacionPremium;
  inicio: IFasePremium;
  desarrollo: IFasePremium;
  cierre: IFasePremium;
  reflexiones: IReflexionesPremium;
  /** Resumen generado por IA sobre lo trabajado en la sesión */
  resumen?: string;
  /** Fuentes del Currículo Nacional consultadas vía RAG */
  fuentesMinedu?: IFuenteMinedu[];
  /** Catálogo de imágenes SVG ofrecidas a GPT (no se muestra en PDF) */
  imagenesDisponibles?: IImagenDisponible[];
}

// ─── Respuesta del backend ───────────────────────────────────────────────────

export interface ISesionPremiumSesion extends ISesionPremiumData {
  id: string;
  titulo: string;
  duracion?: number;
  /** Puede ser string o { id, nombre, descripcion, color, imagen } */
  area?: unknown;
  /** Puede ser string o { id, nombre, descripcion, imagen } */
  nivel?: unknown;
  /** Puede ser string o { id, nombre, nivelId, cicloId } */
  grado?: unknown;
  /** Puede ser string o { id, nombre, nombreInstitucion } */
  usuario?: unknown;
  [key: string]: unknown;
}

export interface ISesionPremiumResponse {
  success: boolean;
  message?: string;
  docente: string;
  institucion: string;
  seccion?: string;
  /** Nombre del director(a) de la IE (desde perfil del usuario). */
  nombreDirectivo?: string;
  sesion: ISesionPremiumSesion;
}
