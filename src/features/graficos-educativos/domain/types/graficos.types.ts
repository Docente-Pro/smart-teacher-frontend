/**
 * Tipos de dominio para el sistema de gráficos educativos
 */

// ============= ENUMS =============

export enum TipoGraficoMatematica {
  ECUACION_CAJAS = "ecuacion_cajas",
  BARRAS_COMPARACION = "barras_comparacion",
  TABLA_VALORES = "tabla_valores",
  BLOQUES_AGRUPADOS = "bloques_agrupados",
  RECTA_NUMERICA = "recta_numerica",
  CIRCULOS_FRACCION = "circulos_fraccion",
  BARRAS_FRACCION = "barras_fraccion",
  TABLA_PRECIOS = "tabla_precios",
  DIAGRAMA_DINERO = "diagrama_dinero",
  FIGURAS_GEOMETRICAS = "figuras_geometricas",
  MEDIDAS_COMPARACION = "medidas_comparacion",
  PATRON_VISUAL = "patron_visual",
  DIAGRAMA_VENN = "diagrama_venn",
  TABLA_DOBLE_ENTRADA = "tabla_doble_entrada",
  OPERACION_VERTICAL = "operacion_vertical",
  BALANZA_EQUILIBRIO = "balanza_equilibrio",
  NUMEROS_ORDINALES = "numeros_ordinales"
}

export enum ColorGrafico {
  AZUL = "azul",
  ROJO = "rojo",
  AMARILLO = "amarillo",
  VERDE = "verde",
  NARANJA = "naranja",
  MORADO = "morado",
  NEUTRO = "neutro"
}

// ============= INTERFACES BASE =============

export interface ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica | string;
  titulo?: string;
  descripcion?: string;
  elementos: any[];
  opciones?: Record<string, any>;
}

// ============= ECUACIÓN CON CAJAS =============

export interface CajaEcuacion {
  tipo: "caja" | "operador";
  contenido: string;
  color?: ColorGrafico;
  destacado?: boolean;
}

export interface LlaveAgrupacion {
  desde: number;
  hasta: number;
  colorLlave: ColorGrafico;
  textoAbajo?: string;
  filaDestino?: number; // Índice de la fila donde aparecerá el resultado
}

// Interfaz para las filas de resolución paso a paso
export interface FilaEcuacion {
  elementos: CajaEcuacion[];
  agrupaciones?: LlaveAgrupacion[];
}

export interface GraficoEcuacionCajas extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.ECUACION_CAJAS;
  elementos: CajaEcuacion[];
  agrupaciones?: LlaveAgrupacion[];
  filas?: FilaEcuacion[]; // Filas adicionales para mostrar la resolución paso a paso
}

// ============= TABLA DE PRECIOS =============

export interface FilaPrecio {
  tipo: "fila";
  producto: string;
  precioUnitario: number;
  cantidad: number;
  total?: number;
  icono?: string;
}

export interface GraficoTablaPrecios extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.TABLA_PRECIOS;
  elementos: FilaPrecio[];
  moneda: "S/" | "$" | "€";
  mostrarTotal?: boolean;
}

// ============= BARRAS DE COMPARACIÓN =============

export interface BarraComparacion {
  tipo: "barra";
  etiqueta: string;
  valor: number;
  color: ColorGrafico;
  icono?: string;
}

export interface EjeY {
  titulo: string;
  maximo: number;
  intervalo: number;
}

export interface GraficoBarrasComparacion extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.BARRAS_COMPARACION;
  elementos: BarraComparacion[];
  ejeY?: EjeY;
}

// ============= TABLA DE VALORES =============

export interface FilaTabla {
  celdas: (string | number)[];
}

export interface GraficoTablaValores extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.TABLA_VALORES;
  encabezados: string[];
  elementos: FilaTabla[];
  mostrarBordes?: boolean;
}

// ============= BLOQUES AGRUPADOS =============

export interface BloqueAgrupado {
  tipo: "bloque";
  cantidad: number;
  color: ColorGrafico;
  etiqueta?: string;
  icono?: string;
}

export interface GraficoBloqueAgrupados extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.BLOQUES_AGRUPADOS;
  elementos: BloqueAgrupado[];
  disposicion?: "horizontal" | "vertical";
  tamanoBloque?: number;
}

// ============= RECTA NUMÉRICA =============

export interface MarcaRecta {
  valor: number;
  destacado?: boolean;
  etiqueta?: string;
  color?: ColorGrafico;
}

export interface GraficoRectaNumerica extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.RECTA_NUMERICA;
  elementos: MarcaRecta[];
  rangoInicio: number;
  rangoFin: number;
  intervalo?: number;
  mostrarFlechas?: boolean;
}

// ============= FRACCIONES =============

export interface SeccionCirculo {
  numerador: number;
  denominador: number;
  color: ColorGrafico;
  etiqueta?: string;
}

export interface GraficoCirculosFraccion extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.CIRCULOS_FRACCION;
  elementos: SeccionCirculo[];
  mostrarEtiquetas?: boolean;
}

export interface BarraFraccion {
  numerador: number;
  denominador: number;
  color: ColorGrafico;
  etiqueta?: string;
}

export interface GraficoBarrasFraccion extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.BARRAS_FRACCION;
  elementos: BarraFraccion[];
  orientacion?: "horizontal" | "vertical";
}

// ============= DINERO =============

export interface Billete {
  tipo: 'billete';
  valor: number;
  cantidad: number;
}

export interface Moneda {
  tipo: 'moneda';
  valor: number;
  cantidad: number;
}

export interface GraficoDiagramaDinero extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.DIAGRAMA_DINERO;
  elementos: (Billete | Moneda)[];
  moneda: 'S/' | '$' | '€';
  mostrarTotal?: boolean;
}

// ============= FIGURAS GEOMÉTRICAS =============

export interface Figura {
  tipo: 'cuadrado' | 'rectangulo' | 'circulo' | 'triangulo' | 'trapecio' | 'rombo';
  ancho?: number;
  alto?: number;
  radio?: number;
  color: ColorGrafico;
  etiqueta?: string;
}

export interface GraficoFigurasGeometricas extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.FIGURAS_GEOMETRICAS;
  elementos: Figura[];
}

// ============= MEDIDAS =============

export interface Medida {
  tipo: 'longitud' | 'peso' | 'capacidad' | 'tiempo';
  valor: number;
  unidad: string;
  etiqueta?: string;
  color: ColorGrafico;
}

export interface GraficoMedidasComparacion extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.MEDIDAS_COMPARACION;
  elementos: Medida[];
}

// ============= PATRONES =============

export interface ElementoPatron {
  tipo: 'forma' | 'numero' | 'color';
  valor: string | number;
  color?: string;
}

export interface GraficoPatronVisual extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.PATRON_VISUAL;
  elementos: ElementoPatron[];
  repeticiones?: number;
}

// ============= DIAGRAMAS DE VENN =============

export interface ConjuntoVenn {
  nombre: string;
  elementos: string[];
  color: string;
}

export interface GraficoDiagramaVenn extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.DIAGRAMA_VENN;
  elementos: ConjuntoVenn[];
  interseccion?: string[];
}

// ============= TABLA DOBLE ENTRADA =============

export interface GraficoTablaDobleEntrada extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.TABLA_DOBLE_ENTRADA;
  encabezadosColumnas: string[];
  encabezadosFilas: string[];
  datos: (string | number)[][];
  colorEncabezado?: string;
}

// ============= OPERACIONES VERTICALES =============

export interface GraficoOperacionVertical extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.OPERACION_VERTICAL;
  operacion: '+' | '-' | '×' | '÷';
  numeros: number[];
  mostrarResultado?: boolean;
  resultado?: number;
  llevadasPrestas?: { posicion: number; valor: number }[];
}

// ============= BALANZA DE EQUILIBRIO =============

export interface LadoBalanza {
  tipo: "lado";
  cantidad: number;
  color: ColorGrafico;
  etiqueta?: string;
  representacion?: string;
}

export type EstadoBalanza = "equilibrio" | "inclinada_izquierda" | "inclinada_derecha";

export interface GraficoBalanzaEquilibrio extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.BALANZA_EQUILIBRIO;
  ladoIzquierdo: LadoBalanza;
  ladoDerecho: LadoBalanza;
  estado: EstadoBalanza;
  mostrarEcuacion?: boolean;
  pregunta?: string;
}

// ============= NÚMEROS ORDINALES =============

export interface NumeroOrdinal {
  numero: number;
  color?: ColorGrafico;
  destacado?: boolean;
  tamano?: 'pequeno' | 'mediano' | 'grande';
  etiqueta?: string; // Etiqueta personalizada (ej: nombre de persona, objeto)
}

export interface GraficoNumerosOrdinales extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.NUMEROS_ORDINALES;
  elementos: NumeroOrdinal[];
  orientacion?: 'horizontal' | 'vertical';
  mostrarTexto?: boolean; // Mostrar "primero", "segundo", etc.
}

// ============= TIPOS DE EXPORTACIÓN =============

export type TipoGraficoConfiguracion = 
  | GraficoEcuacionCajas
  | GraficoTablaPrecios
  | GraficoBarrasComparacion
  | GraficoTablaValores
  | GraficoBloqueAgrupados
  | GraficoRectaNumerica
  | GraficoCirculosFraccion
  | GraficoBarrasFraccion
  | GraficoDiagramaDinero
  | GraficoFigurasGeometricas
  | GraficoMedidasComparacion
  | GraficoPatronVisual
  | GraficoDiagramaVenn
  | GraficoTablaDobleEntrada
  | GraficoOperacionVertical
  | GraficoBalanzaEquilibrio
  | GraficoNumerosOrdinales
  | ConfiguracionGrafico;

