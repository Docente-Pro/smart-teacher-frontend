import React from 'react';
import type { GraficoCuadroComparativo } from '../../../domain/types/graficos-areas.types';
import { resolveColor } from '../../hooks/useRoughSVG';
import { normalizarEtiquetaGrafico } from '@/utils/normalizarEtiquetaGrafico';

interface Props {
  data: GraficoCuadroComparativo;
}

/**
 * Cuadro Comparativo — Personal Social
 * Compara 2-3 elementos con criterios comunes.
 */
export const CuadroComparativo: React.FC<Props> = ({ data }) => {
  const { criterios, columnas, colorEncabezado: _colorEncabezado = '#3F51B5' } = data;
  const colorEncabezado = resolveColor(_colorEncabezado);

  return (
    <div className="overflow-visible rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {/* Celda vacía esquina */}
            <th
              className="px-4 py-3 text-left font-bold text-white"
              style={{ background: colorEncabezado }}
            >
              Criterio
            </th>
            {columnas.map((col, i) => (
              <th
                key={i}
                className="px-4 py-3 text-center font-bold text-white"
                style={{ background: resolveColor(col.color) }}
              >
                {normalizarEtiquetaGrafico(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {criterios.map((criterio, rIdx) => (
            <tr
              key={rIdx}
              className={
                rIdx % 2 === 0
                  ? 'bg-white'
                  : 'bg-gray-50'
              }
            >
              <td className="px-4 py-2 font-semibold text-gray-700 border-t border-gray-200">
                {criterio}
              </td>
              {columnas.map((col, cIdx) => (
                <td
                  key={cIdx}
                  className="px-4 py-2 text-center text-gray-700 border-t border-gray-200"
                >
                  {col.valores[rIdx] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
