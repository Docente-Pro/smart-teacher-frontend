/**
 * Ejemplo de uso del componente EcuacionCajas con resolución paso a paso
 * Muestra cómo resolver ecuaciones en múltiples filas con agrupaciones
 */

import React from 'react';
import { GraficoRenderer } from '../components/GraficoRenderer';
import { TipoGraficoMatematica, ColorGrafico } from '../../domain/types';
import type { GraficoEcuacionCajas } from '../../domain/types';

export const EjemploEcuacionCajasConAgrupaciones: React.FC = () => {
  // Ejemplo 1: Resolución paso a paso - Multiplicaciones separadas
  const graficoEjemplo1: GraficoEcuacionCajas = {
    tipoGrafico: TipoGraficoMatematica.ECUACION_CAJAS,
    elementos: [
      { tipo: "caja", contenido: "4", color: ColorGrafico.AZUL },
      { tipo: "operador", contenido: "×" },
      { tipo: "caja", contenido: "3", color: ColorGrafico.AZUL },
      { tipo: "operador", contenido: "+" },
      { tipo: "caja", contenido: "5", color: ColorGrafico.AZUL },
      { tipo: "operador", contenido: "×" },
      { tipo: "caja", contenido: "2", color: ColorGrafico.AZUL },
      { tipo: "operador", contenido: "=" },
      { tipo: "caja", contenido: "26", color: ColorGrafico.VERDE, destacado: true }
    ],
    agrupaciones: [
      {
        desde: 0,
        hasta: 2,
        colorLlave: ColorGrafico.VERDE,
        textoAbajo: "Paso 1: 4 × 3 = 12"
      },
      {
        desde: 4,
        hasta: 6,
        colorLlave: ColorGrafico.NARANJA,
        textoAbajo: "Paso 2: 5 × 2 = 10"
      }
    ],
    filas: [
      {
        elementos: [
          { tipo: "caja", contenido: "12", color: ColorGrafico.VERDE },
          { tipo: "operador", contenido: "+" },
          { tipo: "caja", contenido: "10", color: ColorGrafico.NARANJA },
          { tipo: "operador", contenido: "=" },
          { tipo: "caja", contenido: "26", color: ColorGrafico.VERDE, destacado: true }
        ],
        agrupaciones: [
          {
            desde: 0,
            hasta: 2,
            colorLlave: ColorGrafico.MORADO,
            textoAbajo: "12 + 10 = 22"
          }
        ]
      },
      {
        elementos: [
          { tipo: "caja", contenido: "22", color: ColorGrafico.MORADO },
          { tipo: "operador", contenido: "=" },
          { tipo: "caja", contenido: "22", color: ColorGrafico.VERDE, destacado: true }
        ]
      }
    ]
  };

  // Ejemplo 2: Ecuación algebraica simple
  const graficoEjemplo2: GraficoEcuacionCajas = {
    tipoGrafico: TipoGraficoMatematica.ECUACION_CAJAS,
    elementos: [
      { tipo: "caja", contenido: "3x", color: ColorGrafico.AZUL },
      { tipo: "operador", contenido: "+" },
      { tipo: "caja", contenido: "5", color: ColorGrafico.ROJO },
      { tipo: "operador", contenido: "=" },
      { tipo: "caja", contenido: "20", color: ColorGrafico.VERDE }
    ],
    agrupaciones: [
      {
        desde: 0,
        hasta: 4,
        colorLlave: ColorGrafico.AMARILLO,
        textoAbajo: "Restar 5 de ambos lados"
      }
    ],
    filas: [
      {
        elementos: [
          { tipo: "caja", contenido: "3x", color: ColorGrafico.AZUL },
          { tipo: "operador", contenido: "+" },
          { tipo: "caja", contenido: "5", color: ColorGrafico.ROJO },
          { tipo: "operador", contenido: "-" },
          { tipo: "caja", contenido: "5", color: ColorGrafico.ROJO },
          { tipo: "operador", contenido: "=" },
          { tipo: "caja", contenido: "20", color: ColorGrafico.VERDE },
          { tipo: "operador", contenido: "-" },
          { tipo: "caja", contenido: "5", color: ColorGrafico.ROJO }
        ],
        agrupaciones: [
          {
            desde: 1,
            hasta: 4,
            colorLlave: ColorGrafico.AMARILLO,
            textoAbajo: "5 - 5 = 0"
          },
          {
            desde: 6,
            hasta: 8,
            colorLlave: ColorGrafico.AMARILLO,
            textoAbajo: "20 - 5 = 15"
          }
        ]
      },
      {
        elementos: [
          { tipo: "caja", contenido: "3x", color: ColorGrafico.AZUL },
          { tipo: "operador", contenido: "=" },
          { tipo: "caja", contenido: "15", color: ColorGrafico.VERDE }
        ],
        agrupaciones: [
          {
            desde: 0,
            hasta: 2,
            colorLlave: ColorGrafico.MORADO,
            textoAbajo: "Dividir entre 3"
          }
        ]
      },
      {
        elementos: [
          { tipo: "caja", contenido: "x", color: ColorGrafico.AZUL, destacado: true },
          { tipo: "operador", contenido: "=" },
          { tipo: "caja", contenido: "5", color: ColorGrafico.VERDE, destacado: true }
        ]
      }
    ]
  };

  // Ejemplo 3: Sin filas adicionales (versión simple con solo llaves)
  const graficoSimple: GraficoEcuacionCajas = {
    tipoGrafico: TipoGraficoMatematica.ECUACION_CAJAS,
    elementos: [
      { tipo: "caja", contenido: "8", color: ColorGrafico.AZUL },
      { tipo: "operador", contenido: "+" },
      { tipo: "caja", contenido: "7", color: ColorGrafico.AZUL },
      { tipo: "operador", contenido: "=" },
      { tipo: "caja", contenido: "15", color: ColorGrafico.VERDE, destacado: true }
    ],
    agrupaciones: [
      {
        desde: 0,
        hasta: 2,
        colorLlave: ColorGrafico.VERDE,
        textoAbajo: "8 + 7 = 15"
      }
    ]
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          📐 Ejemplos: Ecuación con Resolución Paso a Paso
        </h1>
        
        <div className="space-y-12">
          {/* Ejemplo 1 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Ejemplo 1: Operaciones compuestas - Resolución completa
            </h2>
            <p className="text-gray-600 mb-4">
              4 × 3 + 5 × 2 = 22 (muestra cada paso de la resolución en filas adicionales)
            </p>
            <GraficoRenderer grafico={graficoEjemplo1} />
          </div>

          {/* Ejemplo 2 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Ejemplo 2: Ecuación algebraica
            </h2>
            <p className="text-gray-600 mb-4">
              Resolver 3x + 5 = 20 paso a paso
            </p>
            <GraficoRenderer grafico={graficoEjemplo2} />
          </div>

          {/* Ejemplo 3 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Ejemplo 3: Versión simple (sin filas adicionales)
            </h2>
            <p className="text-gray-600 mb-4">
              Solo muestra la ecuación con llaves explicativas
            </p>
            <GraficoRenderer grafico={graficoSimple} />
          </div>
        </div>

        {/* Información técnica */}
        <div className="mt-12 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold mb-3 text-blue-900">
            📝 Estructura del campo filas (resolución paso a paso)
          </h3>
          <pre className="bg-white p-4 rounded border border-blue-300 overflow-x-auto text-sm">
{`{
  "elementos": [...],  // Fila principal
  "agrupaciones": [...],  // Llaves de la fila principal
  "filas": [  // Pasos adicionales de resolución
    {
      "elementos": [...],  // Elementos de esta fila
      "agrupaciones": [...]  // Llaves de esta fila (opcional)
    },
    {
      "elementos": [...],  // Siguiente paso
      "agrupaciones": [...]
    }
  ]
}`}
          </pre>
          <div className="mt-4 text-sm text-blue-800">
            <p><strong>Notas:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>El campo <code className="bg-blue-100 px-1 rounded">filas</code> es opcional</li>
              <li>Cada fila puede tener sus propias agrupaciones</li>
              <li>Las filas se muestran verticalmente una debajo de otra</li>
              <li>Perfecto para mostrar la resolución paso a paso de ecuaciones</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EjemploEcuacionCajasConAgrupaciones;
