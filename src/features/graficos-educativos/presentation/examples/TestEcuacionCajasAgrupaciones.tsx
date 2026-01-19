/**
 * Test rápido para verificar el componente EcuacionCajas con resolución paso a paso
 * Copiar este código en cualquier página de prueba
 */

import { GraficoRenderer } from '@/features/graficos-educativos/presentation/components/GraficoRenderer';
import { TipoGraficoMatematica, ColorGrafico } from '@/features/graficos-educativos/domain/types';

export const TestEcuacionCajasAgrupaciones = () => {
  // Test del ejemplo con resolución paso a paso
  const graficoTest = {
    tipoGrafico: TipoGraficoMatematica.ECUACION_CAJAS,
    elementos: [
      { tipo: "caja" as const, contenido: "4", color: ColorGrafico.AZUL },
      { tipo: "operador" as const, contenido: "×" },
      { tipo: "caja" as const, contenido: "3", color: ColorGrafico.AZUL },
      { tipo: "operador" as const, contenido: "+" },
      { tipo: "caja" as const, contenido: "5", color: ColorGrafico.AZUL },
      { tipo: "operador" as const, contenido: "×" },
      { tipo: "caja" as const, contenido: "2", color: ColorGrafico.AZUL },
      { tipo: "operador" as const, contenido: "=" },
      { tipo: "caja" as const, contenido: "22", color: ColorGrafico.VERDE, destacado: true }
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
          { tipo: "caja" as const, contenido: "12", color: ColorGrafico.VERDE },
          { tipo: "operador" as const, contenido: "+" },
          { tipo: "caja" as const, contenido: "10", color: ColorGrafico.NARANJA },
          { tipo: "operador" as const, contenido: "=" },
          { tipo: "caja" as const, contenido: "22", color: ColorGrafico.VERDE, destacado: true }
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
          { tipo: "caja" as const, contenido: "22", color: ColorGrafico.VERDE, destacado: true },
          { tipo: "operador" as const, contenido: "=" },
          { tipo: "caja" as const, contenido: "22", color: ColorGrafico.VERDE, destacado: true }
        ]
      }
    ]
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">
          🧪 Test: Ecuación con Resolución Paso a Paso
        </h1>
        
        <div className="mb-4 text-sm text-gray-600">
          <p>Este test verifica que:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>✓ Fila 1: Muestra la ecuación completa con llaves en multiplicaciones</li>
            <li>✓ Fila 2: Muestra los resultados parciales (12 + 10)</li>
            <li>✓ Fila 3: Muestra el resultado final (22 = 22)</li>
            <li>✓ Las llaves y textos aparecen correctamente</li>
            <li>✓ Los colores son coherentes entre pasos</li>
          </ul>
        </div>

        <div className="border-2 border-blue-200 rounded p-4 bg-blue-50">
          <GraficoRenderer grafico={graficoTest} />
        </div>

        <div className="mt-6 text-sm">
          <h3 className="font-semibold mb-2">✓ Checklist Visual:</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Fila 1: Llave verde cubre "4 × 3"</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Fila 1: Llave naranja cubre "5 × 2"</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Fila 2: Muestra [12] + [10] = [22]</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Fila 2: Llave morada cubre "12 + 10"</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Fila 3: Muestra [22] = [22] (resultado final)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Las filas están bien separadas verticalmente</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEcuacionCajasAgrupaciones;
