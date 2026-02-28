import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { GraficoRenderer } from "@/features/graficos-educativos/presentation/components/GraficoRenderer";
import { ConfiguracionGrafico } from "@/features/graficos-educativos/domain/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ejemplosPredefinidos = {
  ecuacion_cajas: {
    tipoGrafico: "ecuacion_cajas",
    titulo: "Suma con cajas",
    descripcion: "Resuelve la ecuación paso a paso",
    elementos: [
      { tipo: "caja", contenido: "5", color: "azul" },
      { tipo: "operador", contenido: "+" },
      { tipo: "caja", contenido: "3", color: "rojo" },
      { tipo: "operador", contenido: "=" },
      { tipo: "caja", contenido: "?", color: "verde", destacado: true }
    ]
  },
  barras_comparacion: {
    tipoGrafico: "barras_comparacion",
    titulo: "Comparación de frutas",
    elementos: [
      { tipo: "barra", etiqueta: "Manzanas", valor: 8, color: "rojo" },
      { tipo: "barra", etiqueta: "Plátanos", valor: 5, color: "amarillo" },
      { tipo: "barra", etiqueta: "Naranjas", valor: 12, color: "naranja" }
    ],
    ejeY: { titulo: "Cantidad", maximo: 15, intervalo: 3 }
  },
  circulos_fraccion: {
    tipoGrafico: "circulos_fraccion",
    titulo: "Fracciones en círculos",
    elementos: [
      { numerador: 1, denominador: 2, color: "azul", etiqueta: "1/2" },
      { numerador: 1, denominador: 4, color: "rojo", etiqueta: "1/4" },
      { numerador: 3, denominador: 4, color: "verde", etiqueta: "3/4" }
    ],
    mostrarEtiquetas: true
  },
  recta_numerica: {
    tipoGrafico: "recta_numerica",
    titulo: "Los saltos del canguro",
    inicio: 0,
    fin: 12,
    intervalo: 1,
    marcas: [
      { tipo: "marca", posicion: 2, etiqueta: "Inicio", destacado: true, color: "verde" },
      { tipo: "marca", posicion: 8, etiqueta: "Final", destacado: true, color: "rojo" }
    ],
    saltos: [
      { desde: 2, hasta: 4, color: "azul", etiqueta: "+2" },
      { desde: 4, hasta: 6, color: "azul", etiqueta: "+2" },
      { desde: 6, hasta: 8, color: "azul", etiqueta: "+2" }
    ],
    mostrarFlechas: true
  },
  bloques_agrupados: {
    tipoGrafico: "bloques_agrupados",
    titulo: "Bloques de colores",
    elementos: [
      { tipo: "bloque", cantidad: 5, color: "azul", etiqueta: "Grupo A" },
      { tipo: "bloque", cantidad: 3, color: "rojo", etiqueta: "Grupo B" },
      { tipo: "bloque", cantidad: 7, color: "verde", etiqueta: "Grupo C" }
    ],
    disposicion: "horizontal"
  },
  diagrama_dinero: {
    tipoGrafico: "diagrama_dinero",
    titulo: "Contando dinero",
    elementos: [
      { tipo: "billete", valor: 10, cantidad: 2 },
      { tipo: "billete", valor: 5, cantidad: 1 },
      { tipo: "moneda", valor: 1, cantidad: 3 },
      { tipo: "moneda", valor: 0.5, cantidad: 2 }
    ],
    moneda: "S/",
    mostrarTotal: true
  },
  operacion_vertical: {
    tipoGrafico: "operacion_vertical",
    titulo: "¿Cuántos juguetes hay?",
    operacion: "suma",
    operandos: [8, 5],
    resultado: 13,
    mostrarResultado: true,
    destacarLlevadas: false
  },
  tabla_precios: {
    tipoGrafico: "tabla_precios",
    titulo: "Lista de compras",
    elementos: [
      { tipo: "fila", producto: "Manzanas", precioUnitario: 2.5, cantidad: 4, total: 10 },
      { tipo: "fila", producto: "Pan", precioUnitario: 1.5, cantidad: 2, total: 3 },
      { tipo: "fila", producto: "Leche", precioUnitario: 3.8, cantidad: 1, total: 3.8 }
    ],
    moneda: "S/",
    mostrarTotal: true
  },
  figuras_geometricas: {
    tipoGrafico: "figuras_geometricas",
    titulo: "Formas geométricas",
    elementos: [
      { tipo: "cuadrado", ancho: 100, alto: 100, color: "azul", etiqueta: "Cuadrado" },
      { tipo: "circulo", radio: 50, color: "rojo", etiqueta: "Círculo" },
      { tipo: "triangulo", ancho: 100, alto: 100, color: "verde", etiqueta: "Triángulo" }
    ]
  },
  balanza_equilibrio: {
    tipoGrafico: "balanza_equilibrio",
    titulo: "Balanza matemática",
    elementos: [{}], // Elemento dummy para pasar validación
    ladoIzquierdo: { tipo: "lado", cantidad: 5, color: "azul", etiqueta: "x" },
    ladoDerecho: { tipo: "lado", cantidad: 5, color: "rojo", etiqueta: "5" },
    estado: "equilibrio",
    mostrarEcuacion: true,
    pregunta: "¿Cuál es el valor de x?"
  },
  numeros_ordinales: {
    tipoGrafico: "numeros_ordinales",
    titulo: "Números ordinales",
    elementos: [
      { numero: 1 },
      { numero: 2 },
      { numero: 3, destacado: true },
      { numero: 4 },
      { numero: 5 },
      { numero: 6 },
      { numero: 7 },
      { numero: 8 },
      { numero: 9 },
      { numero: 10 }
    ],
    orientacion: "horizontal",
    mostrarTexto: false
  },
  patron_geometrico: {
    tipoGrafico: "patron_geometrico",
    titulo: "¿Qué figura sigue en el patrón?",
    secuencia: [
      { forma: "circulo", color: "coral", etiqueta: "", destacado: false },
      { forma: "cuadrado", color: "turquesa", etiqueta: "", destacado: false },
      { forma: "circulo", color: "coral", etiqueta: "", destacado: false },
      { forma: "cuadrado", color: "turquesa", etiqueta: "", destacado: false },
      { forma: "circulo", color: "coral", etiqueta: "", destacado: false },
      { forma: "cuadrado", color: "turquesa", etiqueta: "", destacado: false },
      { forma: "circulo", color: "coral", etiqueta: "", destacado: false },
      { forma: "interrogacion", color: "gris", etiqueta: "?", destacado: true }
    ],
    orientacion: "horizontal",
    mostrarIndices: false,
    nucleoPatron: 2,
    repeticiones: 4
  },
  coordenadas_ejercicios: {
    tipoGrafico: "coordenadas_ejercicios",
    titulo: "Traslación de figuras en el plano cartesiano",
    planos: [
      {
        id: 1,
        tamano: { ancho: 12, alto: 10 },
        origen: { x: 0, y: 0 },
        figuras: [
          {
            tipo: "poligono",
            vertices: [
              { x: 2, y: 1, etiqueta: "A", mostrarCoordenada: true },
              { x: 4, y: 1, etiqueta: "B", mostrarCoordenada: true },
              { x: 5, y: 3, etiqueta: "C", mostrarCoordenada: true },
              { x: 3, y: 5, etiqueta: "D", mostrarCoordenada: true },
              { x: 1, y: 3, etiqueta: "E", mostrarCoordenada: true }
            ],
            color: "naranja",
            etiqueta: "Pentágono A"
          },
          {
            tipo: "poligono",
            vertices: [
              { x: 7, y: 4, etiqueta: "A'", mostrarCoordenada: false },
              { x: 9, y: 4, etiqueta: "B'", mostrarCoordenada: false },
              { x: 10, y: 6, etiqueta: "C'", mostrarCoordenada: false },
              { x: 8, y: 8, etiqueta: "D'", mostrarCoordenada: false },
              { x: 6, y: 6, etiqueta: "E'", mostrarCoordenada: false }
            ],
            color: "esmeralda",
            etiqueta: "Pentágono B"
          }
        ],
        instruccion: "Observa la traslación del pentágono A al pentágono B. ¡Descubre las coordenadas de B!"
      },
      {
        id: 2,
        tamano: { ancho: 10, alto: 8 },
        origen: { x: 0, y: 0 },
        figuras: [
          {
            tipo: "rectangulo",
            vertices: [
              { x: 1, y: 1, etiqueta: "A", mostrarCoordenada: true },
              { x: 4, y: 1, etiqueta: "B", mostrarCoordenada: true },
              { x: 4, y: 3, etiqueta: "C", mostrarCoordenada: true },
              { x: 1, y: 3, etiqueta: "D", mostrarCoordenada: true }
            ],
            color: "azul",
            etiqueta: "Casa 1"
          },
          {
            tipo: "rectangulo",
            vertices: [
              { x: 5, y: 4, etiqueta: "A'", mostrarCoordenada: false },
              { x: 8, y: 4, etiqueta: "B'", mostrarCoordenada: false },
              { x: 8, y: 6, etiqueta: "C'", mostrarCoordenada: false },
              { x: 5, y: 6, etiqueta: "D'", mostrarCoordenada: false }
            ],
            color: "rosa",
            etiqueta: "Casa 2"
          }
        ],
        instruccion: "Trasladar Casa 1 → 4 unidades a la derecha y 3 arriba"
      }
    ],
    ejercicios: [
      {
        numero: 1,
        pregunta: "¿Cuántas unidades se trasladó el pentágono hacia la derecha?",
        tipo: "traslacion",
        planoId: 1
      },
      {
        numero: 2,
        pregunta: "¿Cuántas unidades se trasladó el pentágono hacia arriba?",
        tipo: "traslacion",
        planoId: 1
      },
      {
        numero: 3,
        pregunta: "¿Cuáles son las coordenadas del vértice superior de Casa 2?",
        tipo: "identificacion",
        planoId: 2
      }
    ],
    tablas: [
      {
        titulo: "Coordenadas de las casas",
        encabezados: ["Vértice", "Casa 1", "Casa 2"],
        filas: [
          { elemento: "A", valores: ["(1, 1)", "(5, 4)"] },
          { elemento: "B", valores: ["(4, 1)", "(8, 4)"] },
          { elemento: "C", valores: ["(4, 3)", ""] },
          { elemento: "D", valores: ["(1, 3)", ""] }
        ],
        pregunta: "Completa las coordenadas faltantes de Casa 2"
      }
    ]
  },
  tabla_valores: {
    tipoGrafico: "tabla_valores",
    titulo: "Tabla de multiplicar del 3",
    encabezados: ["x", "×3", "Resultado"],
    elementos: [
      { celdas: [1, "1 × 3", 3] },
      { celdas: [2, "2 × 3", 6] },
      { celdas: [3, "3 × 3", 9] },
      { celdas: [4, "4 × 3", 12] },
      { celdas: [5, "5 × 3", 15] }
    ],
    mostrarBordes: true
  },
  barras_fraccion: {
    tipoGrafico: "barras_fraccion",
    titulo: "Comparación de fracciones con barras",
    elementos: [
      { numerador: 2, denominador: 3, color: "azul", etiqueta: "Chocolate de María" },
      { numerador: 1, denominador: 3, color: "verde", etiqueta: "Chocolate de Pedro" },
      { numerador: 3, denominador: 4, color: "rojo", etiqueta: "Chocolate de Ana" }
    ],
    orientacion: "horizontal"
  },
  patron_visual: {
    tipoGrafico: "patron_visual",
    titulo: "Descubre el patrón",
    elementos: [
      { tipo: "forma", valor: "circulo", color: "azul" },
      { tipo: "forma", valor: "cuadrado", color: "rojo" },
      { tipo: "forma", valor: "triangulo", color: "esmeralda" }
    ],
    repeticiones: 3
  },
  diagrama_venn: {
    tipoGrafico: "diagrama_venn",
    titulo: "Deportes que practican los estudiantes",
    elementos: [
      {
        nombre: "Fútbol",
        elementos: ["Ana", "Luis", "María", "Carlos"],
        color: "azul"
      },
      {
        nombre: "Básquet",
        elementos: ["Pedro", "María", "Carlos", "Rosa"],
        color: "rojo"
      }
    ],
    interseccion: ["María", "Carlos"]
  },
  tabla_doble_entrada: {
    tipoGrafico: "tabla_doble_entrada",
    titulo: "Ventas de frutas por día",
    elementos: [],
    encabezadosColumnas: ["Lunes", "Martes", "Miércoles", "Jueves"],
    encabezadosFilas: ["Manzanas", "Naranjas", "Plátanos"],
    datos: [
      [12, 15, 10, 8],
      [8, 12, 14, 9],
      [20, 18, 22, 16]
    ],
    colorEncabezado: "esmeralda"
  },
  medidas_comparacion: {
    tipoGrafico: "medidas_comparacion",
    titulo: "Altura de los estudiantes",
    elementos: [
      { tipo: "longitud", valor: 1.35, unidad: "m", etiqueta: "Ana", color: "azul" },
      { tipo: "longitud", valor: 1.42, unidad: "m", etiqueta: "Luis", color: "verde" },
      { tipo: "longitud", valor: 1.28, unidad: "m", etiqueta: "María", color: "rojo" }
    ]
  },
  valor_posicional: {
    tipoGrafico: "valor_posicional",
    titulo: "Valor posicional de 3 527",
    numero: 3527,
    posiciones: [
      { posicion: "unidades de millar", digito: 3, valor: 3000, color: "rojo" },
      { posicion: "centenas", digito: 5, valor: 500, color: "azul" },
      { posicion: "decenas", digito: 2, valor: 20, color: "esmeralda" },
      { posicion: "unidades", digito: 7, valor: 7, color: "dorado" }
    ],
    mostrarDescomposicion: true,
    elementos: []
  },
  descomposicion_numero: {
    tipoGrafico: "descomposicion_numero",
    titulo: "Descomposición de 456",
    numero: 456,
    tipo: "aditiva",
    partes: [
      { valor: 400, etiqueta: "4 centenas", color: "rojo" },
      { valor: 50, etiqueta: "5 decenas", color: "azul" },
      { valor: 6, etiqueta: "6 unidades", color: "esmeralda" }
    ],
    mostrarOperacion: true,
    elementos: []
  },
  abaco: {
    tipoGrafico: "abaco",
    titulo: "Representación en ábaco: 243",
    numero: 243,
    columnas: [
      { posicion: "Centenas", cuentas: 2, color: "rojo" },
      { posicion: "Decenas", cuentas: 4, color: "azul" },
      { posicion: "Unidades", cuentas: 3, color: "esmeralda" }
    ],
    mostrarValor: true,
    elementos: []
  },
  base_diez_bloques: {
    tipoGrafico: "base_diez_bloques",
    titulo: "Representación de 135 con bloques base 10",
    numero: 135,
    bloques: [
      { tipo: "placa", cantidad: 1, color: "rojo", valor: 100 },
      { tipo: "barra", cantidad: 3, color: "azul", valor: 10 },
      { tipo: "unidad", cantidad: 5, color: "esmeralda", valor: 1 }
    ],
    mostrarTotal: true,
    elementos: []
  },
  pictograma: {
    tipoGrafico: "pictograma",
    titulo: "Mascotas de los estudiantes",
    categorias: ["Perro", "Gato", "Pez", "Hamster"],
    elementos: [
      { categoria: "Perro", cantidad: 8, icono: "🐕" },
      { categoria: "Gato", cantidad: 5, icono: "🐈" },
      { categoria: "Pez", cantidad: 3, icono: "🐟" },
      { categoria: "Hamster", cantidad: 4, icono: "🐹" }
    ],
    valorIcono: 1,
    leyenda: "Cada ícono = 1 mascota"
  },
  grafico_circular: {
    tipoGrafico: "grafico_circular",
    titulo: "Frutas favoritas del salón",
    sectores: [
      { etiqueta: "Manzana", valor: 8, color: "rojo", porcentaje: 32 },
      { etiqueta: "Plátano", valor: 6, color: "amarillo", porcentaje: 24 },
      { etiqueta: "Naranja", valor: 5, color: "naranja", porcentaje: 20 },
      { etiqueta: "Uva", valor: 6, color: "violeta", porcentaje: 24 }
    ],
    mostrarPorcentaje: true,
    mostrarLeyenda: true,
    elementos: []
  },
  grafico_lineal: {
    tipoGrafico: "grafico_lineal",
    titulo: "Temperatura semanal",
    ejeX: { titulo: "Día", etiquetas: ["Lun", "Mar", "Mié", "Jue", "Vie"] },
    ejeY: { titulo: "°C", maximo: 35, intervalo: 5 },
    series: [
      { nombre: "Mañana", puntos: [{ x: "Lun", y: 18 }, { x: "Mar", y: 20 }, { x: "Mié", y: 22 }, { x: "Jue", y: 19 }, { x: "Vie", y: 21 }], color: "azul" },
      { nombre: "Tarde", puntos: [{ x: "Lun", y: 25 }, { x: "Mar", y: 28 }, { x: "Mié", y: 30 }, { x: "Jue", y: 26 }, { x: "Vie", y: 27 }], color: "rojo" }
    ],
    mostrarPuntos: true,
    mostrarValores: true,
    elementos: []
  },
  tabla_frecuencias: {
    tipoGrafico: "tabla_frecuencias",
    titulo: "Notas del examen de matemáticas",
    datos: [
      { dato: "AD", frecuencia: 5, color: "esmeralda" },
      { dato: "A", frecuencia: 12, color: "azul" },
      { dato: "B", frecuencia: 8, color: "dorado" },
      { dato: "C", frecuencia: 3, color: "rojo" }
    ],
    totalDatos: 28,
    mostrarRelativa: true,
    mostrarAcumulada: true,
    mostrarConteo: true,
    elementos: []
  },
  reloj_tiempo: {
    tipoGrafico: "reloj_tiempo",
    titulo: "¿Qué hora marca el reloj?",
    relojes: [
      { hora: 3, minuto: 15, etiqueta: "Hora de recreo" },
      { hora: 8, minuto: 0, etiqueta: "Entrada al colegio" }
    ],
    formato: "12h",
    elementos: []
  },
  calendario: {
    tipoGrafico: "calendario",
    titulo: "Calendario de Junio 2025",
    mes: 6,
    anio: 2025,
    destacarDias: [7, 24],
    eventos: [
      { dia: 7, texto: "Día de la Bandera", color: "rojo" },
      { dia: 15, texto: "Examen de matemáticas", color: "azul" },
      { dia: 24, texto: "Día del campesino", color: "dorado" }
    ],
    elementos: []
  },
  termometro: {
    tipoGrafico: "termometro",
    titulo: "Temperatura del día",
    temperatura: 28,
    unidad: "C",
    escala: { min: 0, max: 50, intervalo: 5 },
    zonas: [
      { desde: 0, hasta: 15, color: "azul", etiqueta: "Frío" },
      { desde: 15, hasta: 25, color: "esmeralda", etiqueta: "Agradable" },
      { desde: 25, hasta: 35, color: "dorado", etiqueta: "Cálido" },
      { desde: 35, hasta: 50, color: "rojo", etiqueta: "Caliente" }
    ],
    elementos: []
  },
  conversion_medidas: {
    tipoGrafico: "conversion_medidas",
    titulo: "Conversión de longitudes",
    conversiones: [
      { desde: { valor: 2, unidad: "m" }, hasta: { valor: 200, unidad: "cm" }, factor: "× 100" },
      { desde: { valor: 1500, unidad: "g" }, hasta: { valor: 1.5, unidad: "kg" }, factor: "÷ 1000" }
    ],
    elementos: []
  },
  regla_medicion: {
    tipoGrafico: "regla_medicion",
    titulo: "Mide el lápiz",
    unidad: "cm",
    inicio: 0,
    fin: 15,
    intervalo: 1,
    marcas: [
      { posicion: 3, etiqueta: "Inicio", color: "esmeralda" },
      { posicion: 12, etiqueta: "Fin", color: "rojo" }
    ],
    elementos: []
  },
  caja_funcion: {
    tipoGrafico: "caja_funcion",
    titulo: "Máquina de funciones: × 3 + 1",
    regla: "× 3 + 1",
    pares: [
      { entrada: 2, salida: 7 },
      { entrada: 4, salida: 13 },
      { entrada: 5, salida: 16 },
      { entrada: 3, salida: 10 }
    ],
    elementos: []
  },
  arbol_factores: {
    tipoGrafico: "arbol_factores",
    titulo: "Árbol de factores de 60",
    numero: 60,
    arbol: {
      valor: 60,
      esPrimo: false,
      hijos: [
        { valor: 6, esPrimo: false, hijos: [
          { valor: 2, esPrimo: true },
          { valor: 3, esPrimo: true }
        ]},
        { valor: 10, esPrimo: false, hijos: [
          { valor: 2, esPrimo: true },
          { valor: 5, esPrimo: true }
        ]}
      ]
    },
    mostrarPrimos: true,
    elementos: []
  },
  multiplos_tabla: {
    tipoGrafico: "multiplos_tabla",
    titulo: "Múltiplos de 3",
    numero: 3,
    rango: { inicio: 1, fin: 30 },
    multiplosDestacados: [6, 12, 18],
    mostrarTabla100: false,
    colorMultiplo: "azul",
    elementos: []
  },
  potencias_raices: {
    tipoGrafico: "potencias_raices",
    titulo: "Potencias y raíces",
    expresiones: [
      { base: 3, exponente: 2, resultado: 9, tipo: "potencia" },
      { base: 5, exponente: 2, resultado: 25, tipo: "potencia" },
      { base: 16, exponente: 2, resultado: 4, tipo: "raiz" }
    ],
    mostrarVisualizacion: true,
    elementos: []
  },
  cuerpos_geometricos: {
    tipoGrafico: "cuerpos_geometricos",
    titulo: "Cuerpos geométricos 3D",
    cuerpos: [
      { tipo: "cubo", etiqueta: "Cubo", color: "azul" },
      { tipo: "esfera", etiqueta: "Esfera", color: "rojo" },
      { tipo: "cilindro", etiqueta: "Cilindro", color: "esmeralda" },
      { tipo: "cono", etiqueta: "Cono", color: "dorado" }
    ],
    mostrarNombres: true,
    mostrarMedidas: false,
    elementos: []
  },
  angulos: {
    tipoGrafico: "angulos",
    titulo: "Clasificación de ángulos",
    angulos: [
      { grados: 45, tipo: "agudo", color: "azul", etiqueta: "Ángulo A" },
      { grados: 90, tipo: "recto", color: "esmeralda", etiqueta: "Ángulo B" },
      { grados: 135, tipo: "obtuso", color: "rojo", etiqueta: "Ángulo C" }
    ],
    mostrarTransportador: false,
    mostrarClasificacion: true,
    elementos: []
  },
  simetria: {
    tipoGrafico: "simetria",
    titulo: "Simetría axial",
    figuraOriginal: {
      puntos: [
        { x: -4, y: -3 },
        { x: -2, y: -3 },
        { x: -2, y: 0 },
        { x: -3, y: 2 },
        { x: -4, y: 0 }
      ],
      color: "azul"
    },
    ejeSimetria: "vertical",
    mostrarEje: true,
    mostrarReflejo: true,
    cuadricula: true,
    elementos: []
  },
  redes_cuerpos: {
    tipoGrafico: "redes_cuerpos",
    titulo: "Redes de cuerpos geométricos",
    redes: [
      {
        cuerpo: "cubo",
        caras: [
          { forma: "cuadrado", color: "azul" },
          { forma: "cuadrado", color: "rojo" },
          { forma: "cuadrado", color: "esmeralda" },
          { forma: "cuadrado", color: "dorado" },
          { forma: "cuadrado", color: "violeta" },
          { forma: "cuadrado", color: "turquesa" }
        ]
      }
    ],
    elementos: []
  },
  cambio_monedas: {
    tipoGrafico: "cambio_monedas",
    titulo: "Cambio de monedas",
    monedasInicio: [
      { tipo: "billete", valor: 10, cantidad: 1 }
    ],
    monedasResultado: [
      { tipo: "moneda", valor: 5, cantidad: 1 },
      { tipo: "moneda", valor: 2, cantidad: 2 },
      { tipo: "moneda", valor: 1, cantidad: 1 }
    ],
    moneda: "S/",
    mostrarEquivalencia: true,
    totalOriginal: 10,
    elementos: []
  },
  recta_fraccion: {
    tipoGrafico: "recta_fraccion",
    titulo: "Fracciones en la recta numérica",
    inicio: 0,
    fin: 2,
    denominadorBase: 4,
    marcas: [
      { posicion: 0.25, numerador: 1, denominador: 4, color: "azul" },
      { posicion: 0.5, numerador: 1, denominador: 2, color: "rojo", etiqueta: "1/2" },
      { posicion: 1, numerador: 4, denominador: 4, color: "esmeralda", etiqueta: "1" },
      { posicion: 1.5, numerador: 3, denominador: 2, color: "dorado", etiqueta: "3/2" }
    ],
    elementos: []
  }
};

const GraficosPlayground = () => {
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState(JSON.stringify(ejemplosPredefinidos.ecuacion_cajas, null, 2));
  const [graficoActual, setGraficoActual] = useState<ConfiguracionGrafico | null>(ejemplosPredefinidos.ecuacion_cajas);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    try {
      const parsed = JSON.parse(value);
      setGraficoActual(parsed);
      setError(null);
    } catch (e) {
      setError("JSON inválido");
      setGraficoActual(null);
    }
  };

  const cargarEjemplo = (ejemplo: keyof typeof ejemplosPredefinidos) => {
    const graficoEjemplo = ejemplosPredefinidos[ejemplo];
    setJsonInput(JSON.stringify(graficoEjemplo, null, 2));
    setGraficoActual(graficoEjemplo);
    setError(null);
  };

  const formatearJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setError("No se puede formatear JSON inválido");
    }
  };

  const copiarJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setError("Error al copiar al portapapeles");
    }
  };

  const limpiarEditor = () => {
    setJsonInput("{\n  \"tipoGrafico\": \"\",\n  \"titulo\": \"\",\n  \"elementos\": []\n}");
    setGraficoActual(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con botón de regreso */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="sm"
            >
              ← Volver
            </Button>
            <Link to="/graficos-areas">
              <Button variant="outline" size="sm">
                🎨 Ver Áreas Curriculares
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            📐 Playground de Gráficos — Matemática
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Experimenta con diferentes configuraciones JSON para visualizar gráficos educativos interactivos
          </p>
        </div>

        {/* Ejemplos predefinidos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">📚 Ejemplos Predefinidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.keys(ejemplosPredefinidos).map((key) => (
                <Button
                  key={key}
                  onClick={() => cargarEjemplo(key as keyof typeof ejemplosPredefinidos)}
                  variant="outline"
                  size="sm"
                  className="capitalize"
                >
                  {key.replace(/_/g, " ")}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editor y Visualización */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel del Editor JSON */}
          <Card className="h-fit">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">📝 Editor JSON</CardTitle>
              <div className="flex gap-2">
                <Button onClick={limpiarEditor} variant="outline" size="sm">
                  Limpiar
                </Button>
                <Button onClick={copiarJson} variant="outline" size="sm">
                  {copied ? "✓ Copiado" : "Copiar"}
                </Button>
                <Button onClick={formatearJson} variant="outline" size="sm">
                  Formatear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="w-full h-[600px] p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                spellCheck={false}
                placeholder="Ingresa aquí tu configuración JSON..."
              />
              {error && (
                <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-red-700 dark:text-red-300 text-sm">⚠️ {error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panel de Visualización */}
          <Card className="h-fit sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">👁️ Vista Previa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[600px] p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto">
                {graficoActual ? (
                  <div>
                    <GraficoRenderer grafico={graficoActual} />
                    {graficoActual.titulo && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Tipo: <span className="font-mono font-semibold">{graficoActual.tipoGrafico}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 dark:text-gray-500 text-center">
                      Ingresa un JSON válido para ver el gráfico
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guía de Tipos */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">📖 Tipos de Gráficos Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                "ecuacion_cajas",
                "tabla_precios",
                "barras_comparacion",
                "tabla_valores",
                "bloques_agrupados",
                "recta_numerica",
                "circulos_fraccion",
                "barras_fraccion",
                "diagrama_dinero",
                "figuras_geometricas",
                "patron_visual",
                "patron_geometrico",
                "diagrama_venn",
                "tabla_doble_entrada",
                "operacion_vertical",
                "medidas_comparacion",
                "balanza_equilibrio",
                "numeros_ordinales",
                "coordenadas_ejercicios",
                "valor_posicional",
                "descomposicion_numero",
                "abaco",
                "base_diez_bloques",
                "pictograma",
                "grafico_circular",
                "grafico_lineal",
                "tabla_frecuencias",
                "reloj_tiempo",
                "calendario",
                "termometro",
                "conversion_medidas",
                "regla_medicion",
                "caja_funcion",
                "arbol_factores",
                "multiplos_tabla",
                "potencias_raices",
                "cuerpos_geometricos",
                "angulos",
                "simetria",
                "redes_cuerpos",
                "cambio_monedas",
                "recta_fraccion"
              ].map((tipo) => (
                <div
                  key={tipo}
                  className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg text-sm text-blue-700 dark:text-blue-300"
                >
                  {tipo}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GraficosPlayground;
