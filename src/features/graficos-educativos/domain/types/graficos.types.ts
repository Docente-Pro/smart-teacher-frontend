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
  PATRON_GEOMETRICO = "patron_geometrico",
  DIAGRAMA_VENN = "diagrama_venn",
  TABLA_DOBLE_ENTRADA = "tabla_doble_entrada",
  OPERACION_VERTICAL = "operacion_vertical",
  BALANZA_EQUILIBRIO = "balanza_equilibrio",
  NUMEROS_ORDINALES = "numeros_ordinales",
  COORDENADAS_EJERCICIOS = "coordenadas_ejercicios",
  // ===== NUEVOS TIPOS =====
  VALOR_POSICIONAL = "valor_posicional",
  DESCOMPOSICION_NUMERO = "descomposicion_numero",
  ABACO = "abaco",
  BASE_DIEZ_BLOQUES = "base_diez_bloques",
  PICTOGRAMA = "pictograma",
  GRAFICO_CIRCULAR = "grafico_circular",
  GRAFICO_LINEAL = "grafico_lineal",
  TABLA_FRECUENCIAS = "tabla_frecuencias",
  RELOJ_TIEMPO = "reloj_tiempo",
  CALENDARIO = "calendario",
  TERMOMETRO = "termometro",
  CONVERSION_MEDIDAS = "conversion_medidas",
  REGLA_MEDICION = "regla_medicion",
  CAJA_FUNCION = "caja_funcion",
  ARBOL_FACTORES = "arbol_factores",
  MULTIPLOS_TABLA = "multiplos_tabla",
  POTENCIAS_RAICES = "potencias_raices",
  CUERPOS_GEOMETRICOS = "cuerpos_geometricos",
  ANGULOS = "angulos",
  SIMETRIA = "simetria",
  REDES_CUERPOS = "redes_cuerpos",
  CAMBIO_MONEDAS = "cambio_monedas",
  RECTA_FRACCION = "recta_fraccion"
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
  elementos?: any[];
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
  posicion: number;
  etiqueta?: string;
  destacado?: boolean;
  color?: ColorGrafico | string;
}

export interface SaltoRecta {
  desde: number;
  hasta: number;
  color?: ColorGrafico | string;
  etiqueta?: string;
}

export interface GraficoRectaNumerica extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.RECTA_NUMERICA;
  inicio: number;
  fin: number;
  intervalo?: number; // Espaciado de las marcas numéricas
  marcas?: MarcaRecta[];
  saltos?: SaltoRecta[]; // Arcos/flechas entre puntos
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

export interface ElementoPatronGeometrico {
  forma: 'circulo' | 'cuadrado' | 'triangulo' | 'rectangulo' | 'rombo' | 'hexagono' | 'estrella' | 'interrogacion';
  color: string;
  etiqueta?: string;
  destacado?: boolean;
}

export interface GraficoPatronGeometrico extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.PATRON_GEOMETRICO;
  secuencia: ElementoPatronGeometrico[];
  orientacion?: 'horizontal' | 'vertical';
  mostrarIndices?: boolean;
  nucleoPatron?: number;
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
  operacion: 'suma' | 'resta' | 'multiplicacion' | 'division';
  operandos: number[];
  mostrarResultado?: boolean;
  resultado?: number;
  destacarLlevadas?: boolean;
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

// ============= COORDENADAS EJERCICIOS =============

export interface PlanoCartesiano {
  id: number;
  tamano: { ancho: number; alto: number };
  origen: { x: number; y: number };
  figuras: FiguraCartesiana[];
  instruccion: string;
}

export interface VerticeCartesiano {
  x: number;
  y: number;
  etiqueta?: string;           // "A", "B", "C"... Se muestra junto al punto
  mostrarCoordenada?: boolean;  // Default true. true → "A(2,3)", false → solo "A"
}

export interface FiguraCartesiana {
  tipo: 'poligono' | 'circulo' | 'cuadrado' | 'triangulo' | 'rectangulo' | 'punto';
  vertices?: VerticeCartesiano[];
  centro?: { x: number; y: number };
  radio?: number;
  color: string;
  etiqueta?: string;
}

export interface EjercicioCoordenadas {
  numero: number;
  pregunta: string;
  tipo: 'traslacion' | 'ubicacion' | 'identificacion';
  planoId: number;
}

export interface TablaCoordenadasFila {
  elemento: string;
  valores: string[];
}

export interface TablaCoordenadas {
  titulo: string;
  encabezados: string[];
  filas: TablaCoordenadasFila[];
  pregunta: string;
}

export interface GraficoCoordenadasEjercicios extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.COORDENADAS_EJERCICIOS;
  planos: PlanoCartesiano[];
  ejercicios: EjercicioCoordenadas[];
  tablas: TablaCoordenadas[];
}

// ============= VALOR POSICIONAL =============

export interface PosicionValor {
  posicion: string; // "unidades" | "decenas" | "centenas" | "millares"
  digito: number;
  valor: number;
  color?: string;
}

export interface GraficoValorPosicional extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.VALOR_POSICIONAL;
  numero: number;
  posiciones: PosicionValor[];
  mostrarDescomposicion?: boolean;
  estilo?: "tabla" | "bloques" | "expandido";
}

// ============= DESCOMPOSICIÓN DE NÚMERO =============

export interface ParteDescomposicion {
  valor: number;
  etiqueta: string;
  color?: string;
}

export interface GraficoDescomposicionNumero extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.DESCOMPOSICION_NUMERO;
  numero: number;
  partes: ParteDescomposicion[];
  tipo: "aditiva" | "multiplicativa" | "mixta";
  mostrarArbol?: boolean;
}

// ============= ÁBACO =============

export interface ColumnaAbaco {
  posicion: string; // "unidades" | "decenas" | "centenas" | "millares"
  cuentas: number;
  color?: string;
}

export interface GraficoAbaco extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.ABACO;
  columnas: ColumnaAbaco[];
  numero: number;
  mostrarValor?: boolean;
  maxCuentas?: number;
}

// ============= BASE DIEZ BLOQUES =============

export interface BloqueDiez {
  tipo: "unidad" | "barra" | "placa" | "cubo";
  cantidad: number;
  color?: string;
}

export interface GraficoBaseDiezBloques extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.BASE_DIEZ_BLOQUES;
  numero: number;
  bloques: BloqueDiez[];
  mostrarTotal?: boolean;
  agrupacion?: boolean;
}

// ============= PICTOGRAMA =============

export interface FilaPictograma {
  categoria: string;
  cantidad: number;
  icono?: string;
  color?: string;
}

export interface GraficoPictograma extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.PICTOGRAMA;
  elementos: FilaPictograma[];
  iconoBase?: string;
  valorIcono?: number;
  mostrarLeyenda?: boolean;
  orientacion?: "horizontal" | "vertical";
}

// ============= GRÁFICO CIRCULAR =============

export interface SectorCircular {
  etiqueta: string;
  valor: number;
  porcentaje?: number;
  color?: string;
}

export interface GraficoCircular extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.GRAFICO_CIRCULAR;
  sectores: SectorCircular[];
  mostrarPorcentajes?: boolean;
  mostrarLeyenda?: boolean;
  total?: number;
}

// ============= GRÁFICO LINEAL =============

export interface PuntoLineal {
  x: number | string;
  y: number;
  etiqueta?: string;
}

export interface SerieLineal {
  nombre: string;
  puntos: PuntoLineal[];
  color?: string;
}

export interface GraficoLineal extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.GRAFICO_LINEAL;
  series: SerieLineal[];
  ejeX?: { titulo: string; etiquetas?: string[] };
  ejeY?: { titulo: string; maximo?: number; intervalo?: number };
  mostrarPuntos?: boolean;
  mostrarArea?: boolean;
}

// ============= TABLA DE FRECUENCIAS =============

export interface FilaFrecuencia {
  dato: string | number;
  conteo?: string;
  frecuencia: number;
  frecuenciaRelativa?: number;
  frecuenciaAcumulada?: number;
}

export interface GraficoTablaFrecuencias extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.TABLA_FRECUENCIAS;
  datos: FilaFrecuencia[];
  mostrarConteo?: boolean;
  mostrarRelativa?: boolean;
  mostrarAcumulada?: boolean;
  totalDatos?: number;
}

// ============= RELOJ / TIEMPO =============

export interface ConfigReloj {
  hora: number;
  minuto: number;
  etiqueta?: string;
}

export interface GraficoRelojTiempo extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.RELOJ_TIEMPO;
  relojes: ConfigReloj[];
  formato?: "12h" | "24h";
  mostrarDigital?: boolean;
  tipo?: "lectura" | "comparacion" | "duracion";
}

// ============= CALENDARIO =============

export interface EventoCalendario {
  dia: number;
  texto?: string;
  color?: string;
  destacado?: boolean;
}

export interface GraficoCalendario extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.CALENDARIO;
  mes: number;
  anio: number;
  eventos?: EventoCalendario[];
  destacarDias?: number[];
  pregunta?: string;
}

// ============= TERMÓMETRO =============

export interface GraficoTermometro extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.TERMOMETRO;
  temperatura: number;
  minimo?: number;
  maximo?: number;
  unidad?: "C" | "F";
  marcas?: number[];
  etiqueta?: string;
  colorLiquido?: string;
}

// ============= CONVERSIÓN DE MEDIDAS =============

export interface PasoConversion {
  desde: { valor: number; unidad: string };
  hasta: { valor: number; unidad: string };
  factor?: string;
}

export interface GraficoConversionMedidas extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.CONVERSION_MEDIDAS;
  conversiones: PasoConversion[];
  tipo?: "longitud" | "masa" | "capacidad" | "tiempo";
  mostrarEscalera?: boolean;
}

// ============= REGLA DE MEDICIÓN =============

export interface MarcaRegla {
  posicion: number;
  etiqueta?: string;
  color?: string;
  destacado?: boolean;
}

export interface GraficoReglaMedicion extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.REGLA_MEDICION;
  inicio: number;
  fin: number;
  unidad: string;
  intervalo?: number;
  marcas?: MarcaRegla[];
  objetoMedir?: string;
}

// ============= CAJA DE FUNCIÓN (MÁQUINA) =============

export interface EntradaSalidaFuncion {
  entrada: number | string;
  salida: number | string;
}

export interface GraficoCajaFuncion extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.CAJA_FUNCION;
  regla: string;
  pares: EntradaSalidaFuncion[];
  incognitas?: number[];
  mostrarRegla?: boolean;
}

// ============= ÁRBOL DE FACTORES =============

export interface NodoFactor {
  valor: number;
  esPrimo?: boolean;
  hijos?: NodoFactor[];
}

export interface GraficoArbolFactores extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.ARBOL_FACTORES;
  numero: number;
  arbol: NodoFactor;
  mostrarPrimos?: boolean;
  resultado?: string;
}

// ============= MÚLTIPLOS Y TABLA =============

export interface CeldaMultiplo {
  valor: number;
  esMultiplo?: boolean;
  destacado?: boolean;
  color?: string;
}

export interface GraficoMultiplosTabla extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.MULTIPLOS_TABLA;
  numero: number;
  rango: { inicio: number; fin: number };
  multiplosDestacados?: number[];
  mostrarTabla100?: boolean;
  colorMultiplo?: string;
}

// ============= POTENCIAS Y RAÍCES =============

export interface ExpresionPotencia {
  base: number;
  exponente: number;
  resultado: number;
  tipo: "potencia" | "raiz";
}

export interface GraficoPotenciasRaices extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.POTENCIAS_RAICES;
  expresiones: ExpresionPotencia[];
  mostrarVisualizacion?: boolean;
  tipo?: "potencia" | "raiz" | "ambos";
}

// ============= CUERPOS GEOMÉTRICOS =============

export interface CuerpoGeometrico {
  tipo: "cubo" | "esfera" | "cilindro" | "cono" | "prisma" | "piramide";
  etiqueta?: string;
  medidas?: Record<string, number>;
  color?: string;
}

export interface GraficoCuerposGeometricos extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.CUERPOS_GEOMETRICOS;
  cuerpos: CuerpoGeometrico[];
  mostrarNombres?: boolean;
  mostrarMedidas?: boolean;
  vista?: "frontal" | "isometrica";
}

// ============= ÁNGULOS =============

export interface AnguloConfig {
  grados: number;
  tipo?: "agudo" | "recto" | "obtuso" | "llano" | "completo";
  etiqueta?: string;
  color?: string;
  mostrarMedida?: boolean;
}

export interface GraficoAngulos extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.ANGULOS;
  angulos: AnguloConfig[];
  mostrarTransportador?: boolean;
  mostrarClasificacion?: boolean;
}

// ============= SIMETRÍA =============

export interface FiguraSimetria {
  tipo: string;
  puntos?: Array<{ x: number; y: number }>;
  color?: string;
}

export interface GraficoSimetria extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.SIMETRIA;
  figuraOriginal: FiguraSimetria;
  ejeSimetria: "vertical" | "horizontal" | "diagonal";
  mostrarEje?: boolean;
  mostrarReflejo?: boolean;
  cuadricula?: boolean;
}

// ============= REDES DE CUERPOS =============

export interface RedCuerpo {
  cuerpo: "cubo" | "prisma" | "piramide" | "cilindro" | "cono";
  caras: Array<{
    forma: string;
    posicion: { x: number; y: number };
    dimensiones: Record<string, number>;
    color?: string;
  }>;
}

export interface GraficoRedesCuerpos extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.REDES_CUERPOS;
  redes: RedCuerpo[];
  mostrarCuerpo3D?: boolean;
  mostrarDobleces?: boolean;
}

// ============= CAMBIO DE MONEDAS =============

export interface MonedaCambio {
  tipo: "moneda" | "billete";
  valor: number;
  cantidad: number;
}

export interface GraficoCambioMonedas extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.CAMBIO_MONEDAS;
  monedasInicio: MonedaCambio[];
  monedasResultado: MonedaCambio[];
  moneda?: "S/" | "$" | "€";
  mostrarEquivalencia?: boolean;
  totalOriginal?: number;
}

// ============= RECTA DE FRACCIONES =============

export interface MarcaFraccion {
  posicion: number; // valor decimal de la fracción
  numerador: number;
  denominador: number;
  etiqueta?: string;
  color?: string;
  destacado?: boolean;
}

export interface GraficoRectaFraccion extends ConfiguracionGrafico {
  tipoGrafico: TipoGraficoMatematica.RECTA_FRACCION;
  inicio: number;
  fin: number;
  denominadorBase?: number;
  marcas: MarcaFraccion[];
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
  | GraficoPatronGeometrico
  | GraficoDiagramaVenn
  | GraficoTablaDobleEntrada
  | GraficoOperacionVertical
  | GraficoBalanzaEquilibrio
  | GraficoNumerosOrdinales
  | GraficoCoordenadasEjercicios
  | GraficoValorPosicional
  | GraficoDescomposicionNumero
  | GraficoAbaco
  | GraficoBaseDiezBloques
  | GraficoPictograma
  | GraficoCircular
  | GraficoLineal
  | GraficoTablaFrecuencias
  | GraficoRelojTiempo
  | GraficoCalendario
  | GraficoTermometro
  | GraficoConversionMedidas
  | GraficoReglaMedicion
  | GraficoCajaFuncion
  | GraficoArbolFactores
  | GraficoMultiplosTabla
  | GraficoPotenciasRaices
  | GraficoCuerposGeometricos
  | GraficoAngulos
  | GraficoSimetria
  | GraficoRedesCuerpos
  | GraficoCambioMonedas
  | GraficoRectaFraccion
  | ConfiguracionGrafico;

