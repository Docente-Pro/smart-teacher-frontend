/**
 * Ejemplos de uso de todos los componentes gráficos educativos
 * 
 * Estos ejemplos demuestran cómo usar cada tipo de gráfico
 * en contextos pedagógicos de primaria según MINEDU
 */

import { 
  TipoGraficoMatematica,
  ColorGrafico,
  GraficoRectaNumerica,
  GraficoCirculosFraccion,
  GraficoBarrasFraccion,
  GraficoDiagramaDinero,
  GraficoFigurasGeometricas,
  GraficoPatronVisual,
  GraficoDiagramaVenn,
  GraficoTablaDobleEntrada,
  GraficoOperacionVertical,
  GraficoMedidasComparacion,
  GraficoBalanzaEquilibrio
} from '../../domain/types';

// ============= RECTA NUMÉRICA =============

export const ejemploRectaNumerica: GraficoRectaNumerica = {
  tipoGrafico: TipoGraficoMatematica.RECTA_NUMERICA,
  titulo: "Ubicación de números en la recta",
  elementos: [
    { valor: 3, destacado: true, etiqueta: "María", color: ColorGrafico.AZUL },
    { valor: 7, destacado: true, etiqueta: "Juan", color: ColorGrafico.ROJO }
  ],
  rangoInicio: 0,
  rangoFin: 10,
  intervalo: 1,
  mostrarFlechas: true
};

// ============= CÍRCULOS DE FRACCIÓN =============

export const ejemploCirculosFraccion: GraficoCirculosFraccion = {
  tipoGrafico: TipoGraficoMatematica.CIRCULOS_FRACCION,
  titulo: "Comparando fracciones",
  elementos: [
    { numerador: 1, denominador: 2, color: ColorGrafico.AZUL, etiqueta: "Un medio" },
    { numerador: 1, denominador: 4, color: ColorGrafico.ROJO, etiqueta: "Un cuarto" },
    { numerador: 3, denominador: 4, color: ColorGrafico.VERDE, etiqueta: "Tres cuartos" }
  ],
  mostrarEtiquetas: true
};

// ============= BARRAS DE FRACCIÓN =============

export const ejemploBarrasFraccion: GraficoBarrasFraccion = {
  tipoGrafico: TipoGraficoMatematica.BARRAS_FRACCION,
  titulo: "Representación de fracciones",
  elementos: [
    { numerador: 2, denominador: 3, color: ColorGrafico.AZUL, etiqueta: "Chocolate de María" },
    { numerador: 1, denominador: 3, color: ColorGrafico.VERDE, etiqueta: "Chocolate de Pedro" }
  ],
  orientacion: 'horizontal'
};

// ============= DIAGRAMA DE DINERO =============

export const ejemploDiagramaDinero: GraficoDiagramaDinero = {
  tipoGrafico: TipoGraficoMatematica.DIAGRAMA_DINERO,
  titulo: "Dinero que tiene Ana",
  elementos: [
    { tipo: 'billete', valor: 10, cantidad: 2 },
    { tipo: 'billete', valor: 5, cantidad: 1 },
    { tipo: 'moneda', valor: 1, cantidad: 3 },
    { tipo: 'moneda', valor: 0.50, cantidad: 2 }
  ],
  moneda: 'S/',
  mostrarTotal: true
};

// ============= FIGURAS GEOMÉTRICAS =============

export const ejemploFigurasGeometricas: GraficoFigurasGeometricas = {
  tipoGrafico: TipoGraficoMatematica.FIGURAS_GEOMETRICAS,
  titulo: "Figuras geométricas del salón",
  elementos: [
    { tipo: 'cuadrado', ancho: 80, color: ColorGrafico.AZUL, etiqueta: "Ventana" },
    { tipo: 'rectangulo', ancho: 100, alto: 60, color: ColorGrafico.VERDE, etiqueta: "Pizarra" },
    { tipo: 'circulo', radio: 40, color: ColorGrafico.ROJO, etiqueta: "Reloj" },
    { tipo: 'triangulo', ancho: 80, color: ColorGrafico.AMARILLO, etiqueta: "Banderín" }
  ]
};

// ============= PATRÓN VISUAL =============

export const ejemploPatronVisual: GraficoPatronVisual = {
  tipoGrafico: TipoGraficoMatematica.PATRON_VISUAL,
  titulo: "Descubre el patrón",
  elementos: [
    { tipo: 'forma', valor: 'circulo', color: '#3b82f6' },
    { tipo: 'forma', valor: 'cuadrado', color: '#ef4444' },
    { tipo: 'forma', valor: 'triangulo', color: '#10b981' }
  ],
  repeticiones: 2
};

// ============= DIAGRAMA DE VENN =============

export const ejemploDiagramaVenn: GraficoDiagramaVenn = {
  tipoGrafico: TipoGraficoMatematica.DIAGRAMA_VENN,
  titulo: "Deportes que practican los estudiantes",
  elementos: [
    { 
      nombre: "Fútbol", 
      elementos: ["Ana", "Luis", "María", "Carlos"],
      color: '#3b82f6'
    },
    { 
      nombre: "Básquet", 
      elementos: ["Pedro", "María", "Carlos", "Rosa"],
      color: '#ef4444'
    }
  ],
  interseccion: ["María", "Carlos"]
};

// ============= TABLA DOBLE ENTRADA =============

export const ejemploTablaDobleEntrada: GraficoTablaDobleEntrada = {
  tipoGrafico: TipoGraficoMatematica.TABLA_DOBLE_ENTRADA,
  titulo: "Ventas de frutas por día",
  elementos: [],
  encabezadosColumnas: ["Lunes", "Martes", "Miércoles"],
  encabezadosFilas: ["Manzanas", "Naranjas", "Plátanos"],
  datos: [
    [12, 15, 10],
    [8, 12, 14],
    [20, 18, 22]
  ],
  colorEncabezado: '#10b981'
};

// ============= OPERACIÓN VERTICAL =============

export const ejemploOperacionVertical: GraficoOperacionVertical = {
  tipoGrafico: TipoGraficoMatematica.OPERACION_VERTICAL,
  titulo: "Suma con llevadas",
  elementos: [],
  operacion: '+',
  numeros: [456, 278],
  mostrarResultado: true,
  resultado: 734,
  llevadasPrestas: [
    { posicion: 1, valor: 1 },
    { posicion: 2, valor: 1 }
  ]
};

// ============= MEDIDAS COMPARACIÓN =============

export const ejemploMedidasComparacion: GraficoMedidasComparacion = {
  tipoGrafico: TipoGraficoMatematica.MEDIDAS_COMPARACION,
  titulo: "Altura de los estudiantes",
  elementos: [
    { tipo: 'longitud', valor: 1.35, unidad: 'm', etiqueta: 'Ana', color: ColorGrafico.AZUL },
    { tipo: 'longitud', valor: 1.42, unidad: 'm', etiqueta: 'Luis', color: ColorGrafico.VERDE },
    { tipo: 'longitud', valor: 1.28, unidad: 'm', etiqueta: 'María', color: ColorGrafico.ROJO }
  ]
};

// ============= BALANZA DE EQUILIBRIO =============

export const ejemploBalanzaEquilibrio1: GraficoBalanzaEquilibrio = {
  tipoGrafico: TipoGraficoMatematica.BALANZA_EQUILIBRIO,
  titulo: "Balanza en equilibrio",
  elementos: [], // Requerido por ConfiguracionGrafico pero no usado
  ladoIzquierdo: {
    tipo: "lado",
    cantidad: 7,
    color: ColorGrafico.AZUL,
    etiqueta: "7 cubos azules",
    representacion: "7"
  },
  ladoDerecho: {
    tipo: "lado",
    cantidad: 7,
    color: ColorGrafico.NARANJA,
    etiqueta: "7 cubos naranjas",
    representacion: "7"
  },
  estado: "equilibrio",
  mostrarEcuacion: true,
  pregunta: "¿Cuántos cubos hay en cada lado de la balanza?"
};

export const ejemploBalanzaEquilibrio2: GraficoBalanzaEquilibrio = {
  tipoGrafico: TipoGraficoMatematica.BALANZA_EQUILIBRIO,
  titulo: "Igualdad con suma",
  elementos: [],
  ladoIzquierdo: {
    tipo: "lado",
    cantidad: 12,
    color: ColorGrafico.AZUL,
    etiqueta: "12 cubos",
    representacion: "12"
  },
  ladoDerecho: {
    tipo: "lado",
    cantidad: 12,
    color: ColorGrafico.VERDE,
    etiqueta: "7 + 5 cubos",
    representacion: "7 + 5"
  },
  estado: "equilibrio",
  mostrarEcuacion: true,
  pregunta: "Si la balanza está en equilibrio, ¿cuánto es 7 + 5?"
};

export const ejemploBalanzaEquilibrio3: GraficoBalanzaEquilibrio = {
  tipoGrafico: TipoGraficoMatematica.BALANZA_EQUILIBRIO,
  titulo: "Balanza desequilibrada",
  elementos: [],
  ladoIzquierdo: {
    tipo: "lado",
    cantidad: 10,
    color: ColorGrafico.ROJO,
    etiqueta: "10 cubos rojos",
    representacion: "10"
  },
  ladoDerecho: {
    tipo: "lado",
    cantidad: 6,
    color: ColorGrafico.AMARILLO,
    etiqueta: "6 cubos amarillos",
    representacion: "6"
  },
  estado: "inclinada_izquierda",
  mostrarEcuacion: true,
  pregunta: "¿Por qué la balanza no está en equilibrio?"
};

// ============= EXPORTACIÓN AGRUPADA =============

export const todosLosEjemplos = {
  rectaNumerica: ejemploRectaNumerica,
  circulosFraccion: ejemploCirculosFraccion,
  barrasFraccion: ejemploBarrasFraccion,
  diagramaDinero: ejemploDiagramaDinero,
  figurasGeometricas: ejemploFigurasGeometricas,
  patronVisual: ejemploPatronVisual,
  diagramaVenn: ejemploDiagramaVenn,
  tablaDobleEntrada: ejemploTablaDobleEntrada,
  operacionVertical: ejemploOperacionVertical,
  medidasComparacion: ejemploMedidasComparacion,
  balanzaEquilibrio1: ejemploBalanzaEquilibrio1,
  balanzaEquilibrio2: ejemploBalanzaEquilibrio2,
  balanzaEquilibrio3: ejemploBalanzaEquilibrio3
};
