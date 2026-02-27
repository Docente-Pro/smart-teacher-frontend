/**
 * Tipos de dominio para gráficos de áreas curriculares (no-Matemática)
 *
 * Diferencia clave vs. Matemática:
 * — Matemática usa dos campos por proceso: `grafico` + `graficoOperacion`.
 * — Las demás áreas usan un solo campo `grafico` por proceso.
 */

// ============= ENUM DE TIPOS =============

export enum TipoGraficoAreas {
  // Comunicación
  ESTRUCTURA_NARRATIVA = "estructura_narrativa",
  ORGANIZADOR_KVL = "organizador_kvl",
  PLANIFICADOR_ESCRITURA = "planificador_escritura",
  // Ciencia y Tecnología
  TABLA_OBSERVACION = "tabla_observacion",
  CICLO_PROCESO = "ciclo_proceso",
  CLASIFICACION_DICOTOMICA = "clasificacion_dicotomica",
  // Personal Social
  LINEA_TIEMPO = "linea_tiempo",
  CUADRO_COMPARATIVO = "cuadro_comparativo",
  RUEDA_EMOCIONES = "rueda_emociones",
  FICHA_AUTOCONOCIMIENTO = "ficha_autoconocimiento",
  // Educación Religiosa
  TARJETA_REFLEXION = "tarjeta_reflexion",
  TARJETA_COMPROMISO = "tarjeta_compromiso",
  // Arte y Cultura
  FICHA_ANALISIS_OBRA = "ficha_analisis_obra",
  FICHA_PROCESO_CREATIVO = "ficha_proceso_creativo",
  // Educación Física
  SECUENCIA_MOVIMIENTO = "secuencia_movimiento",
  TABLA_HABITOS = "tabla_habitos",
}

// ============= INTERFAZ BASE =============

export interface ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas | string;
  titulo: string;
  [key: string]: unknown;
}

// ============= 1. ESTRUCTURA NARRATIVA — Comunicación =============

export interface SeccionNarrativa {
  nombre: "Inicio" | "Nudo" | "Desenlace";
  icono: string;
  color: string;
  contenido: string;
}

export interface GraficoEstructuraNarrativa extends ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas.ESTRUCTURA_NARRATIVA;
  secciones: [SeccionNarrativa, SeccionNarrativa, SeccionNarrativa];
  personajes: string[];
  lugar: string;
  mensaje: string;
}

// ============= 2. ORGANIZADOR KVL — Comunicación =============

export interface ColumnaKVL {
  encabezado: string;
  color: string;
  icono: string;
  items: string[];
}

export interface GraficoOrganizadorKVL extends ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas.ORGANIZADOR_KVL;
  tema: string;
  columnas: [ColumnaKVL, ColumnaKVL, ColumnaKVL];
}

// ============= 3. PLANIFICADOR ESCRITURA — Comunicación =============

export interface CampoPlanificador {
  pregunta: string;
  respuesta: string;
}

export type TipoTexto = "cuento" | "carta" | "noticia" | "instrucciones" | "poema" | "afiche";

export interface GraficoPlanificadorEscritura extends ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas.PLANIFICADOR_ESCRITURA;
  tipoTexto: TipoTexto;
  campos: CampoPlanificador[];
  ideasPrincipales: string[];
}

// ============= 4. TABLA OBSERVACIÓN — Ciencia y Tecnología =============

export interface ColumnaObservacion {
  nombre: string;
  tipo: "texto" | "numero";
}

export interface GraficoTablaObservacion extends ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas.TABLA_OBSERVACION;
  subtitulo: string;
  columnas: ColumnaObservacion[];
  filas: string[][];
  unidades: string[];
}

// ============= 5. CICLO PROCESO — Ciencia y Tecnología =============

export interface FaseCiclo {
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
}

export type TipoCiclo = "circular" | "lineal";

export interface GraficoCicloProceso extends ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas.CICLO_PROCESO;
  tipo: TipoCiclo;
  fases: FaseCiclo[];
  colorFondo?: string;
}

// ============= 6. CLASIFICACIÓN DICOTÓMICA — Ciencia y Tecnología =============

export interface NodoDicotomico {
  id: string;
  pregunta?: string;
  si?: string;
  no?: string;
  etiqueta?: string;
  esHoja?: boolean;
  ejemplos?: string[];
}

export interface GraficoClasificacionDicotomica extends ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas.CLASIFICACION_DICOTOMICA;
  nodos: NodoDicotomico[];
}

// ============= 7. LÍNEA DE TIEMPO — Personal Social =============

export interface EventoTiempo {
  fecha: string;
  etiqueta: string;
  descripcion: string;
  color: string;
  icono: string;
}

export type OrientacionLinea = "horizontal" | "vertical";

export interface GraficoLineaTiempo extends ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas.LINEA_TIEMPO;
  subtitulo?: string;
  orientacion: OrientacionLinea;
  eventos: EventoTiempo[];
  colorLinea?: string;
  mostrarDecadas?: boolean;
}

// ============= 8. CUADRO COMPARATIVO — Personal Social =============

export interface ColumnaComparativa {
  nombre: string;
  color: string;
  valores: string[];
}

export interface GraficoCuadroComparativo extends ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas.CUADRO_COMPARATIVO;
  criterios: string[];
  columnas: ColumnaComparativa[];
  colorEncabezado?: string;
}

// ============= 9. RUEDA DE EMOCIONES — Personal Social =============

export interface Emocion {
  nombre: string;
  color: string;
  icono: string;
  descripcion: string;
}

export interface GraficoRuedaEmociones extends ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas.RUEDA_EMOCIONES;
  instruccion: string;
  emociones: Emocion[];
  emocionSeleccionada: string | null;
  preguntaReflexion: string;
}

// ============= 10. FICHA AUTOCONOCIMIENTO — Personal Social =============

export interface SeccionAutoconocimiento {
  nombre: string;
  icono: string;
  preguntas: string[];
}

export interface GraficoFichaAutoconocimiento extends ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas.FICHA_AUTOCONOCIMIENTO;
  subtitulo?: string;
  colorFondo?: string;
  secciones: SeccionAutoconocimiento[];
}

// ============= 11. TARJETA REFLEXIÓN — Educación Religiosa =============

export interface GraficoTarjetaReflexion extends ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas.TARJETA_REFLEXION;
  referencia: string;
  texto: string;
  esParabola: boolean;
  color: string;
  preguntas: string[];
}

// ============= 12. TARJETA COMPROMISO — Educación Religiosa =============

export interface CampoCompromiso {
  pregunta: string;
  respuesta: string;
}

export interface GraficoTarjetaCompromiso extends ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas.TARJETA_COMPROMISO;
  valor: string;
  campos: CampoCompromiso[];
  colorFondo?: string;
}

// ============= 13. FICHA ANÁLISIS OBRA — Arte y Cultura =============

export interface DatosObra {
  nombre: string;
  autor: string;
  origen: string;
  tipo: "cerámica" | "pintura" | "tejido" | "danza" | "música" | "escultura" | "artesanía" | "arquitectura";
}

export interface DimensionObra {
  aspecto: string;
  icono: string;
  observacion: string;
}

export interface GraficoFichaAnalisisObra extends ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas.FICHA_ANALISIS_OBRA;
  obra: DatosObra;
  dimensiones: DimensionObra[];
  miOpinion: string;
}

// ============= 14. FICHA PROCESO CREATIVO — Arte y Cultura =============

export type LenguajeArtistico = "plástico" | "musical" | "corporal" | "dramático";

export interface EtapaCreativa {
  nombre: string;
  icono: string;
  color: string;
  descripcion: string;
  lista?: string[];
  pasos?: string[];
}

export interface GraficoFichaProcesoCreativo extends ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas.FICHA_PROCESO_CREATIVO;
  lenguajeArtistico: LenguajeArtistico;
  etapas: EtapaCreativa[];
}

// ============= 15. SECUENCIA MOVIMIENTO — Educación Física =============

export type TipoMovimiento = "calentamiento" | "juego" | "danza" | "ejercicio" | "estiramiento" | "circuito";

export interface PasoMovimiento {
  numero: number;
  nombre: string;
  descripcion: string;
  duracion: string;
}

export interface GraficoSecuenciaMovimiento extends ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas.SECUENCIA_MOVIMIENTO;
  tipo: TipoMovimiento;
  pasos: PasoMovimiento[];
  repeticiones: number;
  materiales: string[];
  colorFondo?: string;
}

// ============= 16. TABLA HÁBITOS — Educación Física =============

export interface Habito {
  nombre: string;
  icono: string;
  color: string;
}

export interface GraficoTablaHabitos extends ConfiguracionGraficoArea {
  tipoGrafico: TipoGraficoAreas.TABLA_HABITOS;
  semana: string;
  habitos: Habito[];
  dias: string[];
  meta: string;
}

// ============= TIPO UNIÓN =============

export type GraficoAreaConfig =
  | GraficoEstructuraNarrativa
  | GraficoOrganizadorKVL
  | GraficoPlanificadorEscritura
  | GraficoTablaObservacion
  | GraficoCicloProceso
  | GraficoClasificacionDicotomica
  | GraficoLineaTiempo
  | GraficoCuadroComparativo
  | GraficoRuedaEmociones
  | GraficoFichaAutoconocimiento
  | GraficoTarjetaReflexion
  | GraficoTarjetaCompromiso
  | GraficoFichaAnalisisObra
  | GraficoFichaProcesoCreativo
  | GraficoSecuenciaMovimiento
  | GraficoTablaHabitos;
