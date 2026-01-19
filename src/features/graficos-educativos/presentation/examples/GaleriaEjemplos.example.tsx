/**
 * Ejemplos de uso del feature Gráficos Educativos
 */

import React from 'react';
import { GraficoRenderer } from '../components';
import { 
  TipoGraficoMatematica,
  ConfiguracionGrafico,
  GraficoEcuacionCajas,
  GraficoTablaPrecios,
  GraficoBarrasComparacion,
  ColorGrafico
} from '../../domain/types';

/**
 * Ejemplo 1: Ecuación con Cajas
 */
export const EjemploEcuacionCajas: React.FC = () => {
  const grafico: GraficoEcuacionCajas = {
    tipoGrafico: TipoGraficoMatematica.ECUACION_CAJAS,
    titulo: "Suma de números",
    elementos: [
      { tipo: "caja", contenido: "12", color: ColorGrafico.AZUL },
      { tipo: "operador", contenido: "+" },
      { tipo: "caja", contenido: "6", color: ColorGrafico.AZUL },
      { tipo: "operador", contenido: "=" },
      { tipo: "caja", contenido: "18", color: ColorGrafico.VERDE, destacado: true }
    ],
    agrupaciones: [
      {
        desde: 0,
        hasta: 2,
        colorLlave: ColorGrafico.AMARILLO,
        textoAbajo: "Total: 18"
      }
    ]
  };

  return (
    <div>
      <h2>Ejemplo: Ecuación con Cajas</h2>
      <GraficoRenderer grafico={grafico} />
    </div>
  );
};

/**
 * Ejemplo 2: Tabla de Precios
 */
export const EjemploTablaPrecios: React.FC = () => {
  const grafico: GraficoTablaPrecios = {
    tipoGrafico: TipoGraficoMatematica.TABLA_PRECIOS,
    titulo: "Compra en el mercado",
    elementos: [
      {
        tipo: "fila",
        producto: "Manzanas",
        precioUnitario: 4,
        cantidad: 3,
        total: 12,
        icono: "🍎"
      },
      {
        tipo: "fila",
        producto: "Naranjas",
        precioUnitario: 3,
        cantidad: 2,
        total: 6,
        icono: "🍊"
      },
      {
        tipo: "fila",
        producto: "Plátanos",
        precioUnitario: 2,
        cantidad: 5,
        total: 10,
        icono: "🍌"
      }
    ],
    moneda: "S/",
    mostrarTotal: true
  };

  return (
    <div>
      <h2>Ejemplo: Tabla de Precios</h2>
      <GraficoRenderer grafico={grafico} />
    </div>
  );
};

/**
 * Ejemplo 3: Barras de Comparación
 */
export const EjemploBarrasComparacion: React.FC = () => {
  const grafico: GraficoBarrasComparacion = {
    tipoGrafico: TipoGraficoMatematica.BARRAS_COMPARACION,
    titulo: "Ventas por día",
    elementos: [
      {
        tipo: "barra",
        etiqueta: "Lunes",
        valor: 8,
        color: ColorGrafico.AZUL,
        icono: "📅"
      },
      {
        tipo: "barra",
        etiqueta: "Martes",
        valor: 12,
        color: ColorGrafico.VERDE,
        icono: "📅"
      },
      {
        tipo: "barra",
        etiqueta: "Miércoles",
        valor: 6,
        color: ColorGrafico.ROJO,
        icono: "📅"
      },
      {
        tipo: "barra",
        etiqueta: "Jueves",
        valor: 15,
        color: ColorGrafico.NARANJA,
        icono: "📅"
      },
      {
        tipo: "barra",
        etiqueta: "Viernes",
        valor: 10,
        color: ColorGrafico.MORADO,
        icono: "📅"
      }
    ],
    ejeY: {
      titulo: "Cantidad de ventas",
      maximo: 20,
      intervalo: 2
    }
  };

  return (
    <div>
      <h2>Ejemplo: Barras de Comparación</h2>
      <GraficoRenderer grafico={grafico} />
    </div>
  );
};

/**
 * Ejemplo 4: Múltiples Gráficos
 */
export const EjemploMultiplesGraficos: React.FC = () => {
  const graficos: ConfiguracionGrafico[] = [
    {
      tipoGrafico: TipoGraficoMatematica.ECUACION_CAJAS,
      titulo: "Operación 1",
      elementos: [
        { tipo: "caja", contenido: "5", color: "azul" },
        { tipo: "operador", contenido: "×" },
        { tipo: "caja", contenido: "3", color: "azul" },
        { tipo: "operador", contenido: "=" },
        { tipo: "caja", contenido: "15", color: "verde", destacado: true }
      ]
    },
    {
      tipoGrafico: TipoGraficoMatematica.ECUACION_CAJAS,
      titulo: "Operación 2",
      elementos: [
        { tipo: "caja", contenido: "20", color: "rojo" },
        { tipo: "operador", contenido: "÷" },
        { tipo: "caja", contenido: "4", color: "rojo" },
        { tipo: "operador", contenido: "=" },
        { tipo: "caja", contenido: "5", color: "verde", destacado: true }
      ]
    }
  ];

  return (
    <div>
      <h2>Ejemplo: Múltiples Gráficos</h2>
      {graficos.map((grafico, idx) => (
        <GraficoRenderer key={idx} grafico={grafico} />
      ))}
    </div>
  );
};

/**
 * Ejemplo 5: Simulación de Datos del Backend
 */
export const EjemploConDatosBackend: React.FC = () => {
  // Simular respuesta del backend
  const respuestaBackend = {
    proceso: "Familiarización con el problema",
    problemaMatematico: "Ana compró 3kg de manzanas a S/4 c/u y 2kg de naranjas a S/3 c/u. ¿Cuánto gastó?",
    graficoProblema: {
      tipoGrafico: "tabla_precios",
      elementos: [
        {
          tipo: "fila",
          producto: "Manzanas",
          precioUnitario: 4,
          cantidad: 3,
          total: 12,
          icono: "🍎"
        },
        {
          tipo: "fila",
          producto: "Naranjas",
          precioUnitario: 3,
          cantidad: 2,
          total: 6,
          icono: "🍊"
        }
      ],
      moneda: "S/",
      mostrarTotal: true
    },
    solucionProblema: "Paso 1: 3 × S/4 = S/12\nPaso 2: 2 × S/3 = S/6\nPaso 3: S/12 + S/6 = S/18",
    graficoSolucion: {
      tipoGrafico: "ecuacion_cajas",
      elementos: [
        { tipo: "caja", contenido: "12", color: "azul" },
        { tipo: "operador", contenido: "+" },
        { tipo: "caja", contenido: "6", color: "azul" },
        { tipo: "operador", contenido: "=" },
        { tipo: "caja", contenido: "18", color: "verde", destacado: true }
      ]
    }
  };

  return (
    <div>
      <h2>Ejemplo: Con Datos del Backend</h2>
      
      <div className="problema">
        <h3>📝 Problema:</h3>
        <p>{respuestaBackend.problemaMatematico}</p>
        <GraficoRenderer grafico={respuestaBackend.graficoProblema} />
      </div>

      <details>
        <summary>👁️ Ver solución</summary>
        <div className="solucion">
          <pre>{respuestaBackend.solucionProblema}</pre>
          <GraficoRenderer grafico={respuestaBackend.graficoSolucion} />
        </div>
      </details>
    </div>
  );
};

/**
 * Componente que muestra todos los ejemplos
 */
export const GaleriaEjemplos: React.FC = () => {
  return (
    <div className="galeria-ejemplos" style={{ padding: '2rem' }}>
      <h1>Galería de Ejemplos - Gráficos Educativos</h1>
      
      <EjemploEcuacionCajas />
      <hr />
      
      <EjemploTablaPrecios />
      <hr />
      
      <EjemploBarrasComparacion />
      <hr />
      
      <EjemploMultiplesGraficos />
      <hr />
      
      <EjemploConDatosBackend />
    </div>
  );
};
