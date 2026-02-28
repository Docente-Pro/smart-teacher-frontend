import React from 'react';
import type { GraficoTablaHabitos } from '../../../domain/types/graficos-areas.types';
import { resolveColor } from '../../hooks/useRoughSVG';

interface Props {
  data: GraficoTablaHabitos;
}

/**
 * Tabla de Hábitos — Educación Física
 * Grilla semanal de hábitos saludables con checkboxes vacíos.
 */
export const TablaHabitos: React.FC<Props> = ({ data }) => {
  const { semana, habitos, dias, meta } = data;

  return (
    <div className="space-y-3">
      {semana && (
        <p className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
          📅 {semana}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-emerald-600 text-white">
              <th className="px-3 py-2 text-left font-semibold">Hábito</th>
              {dias.map((dia, i) => (
                <th key={i} className="px-2 py-2 text-center font-semibold w-12">
                  {dia}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habitos.map((hab, rIdx) => (
              <tr
                key={rIdx}
                className={
                  rIdx % 2 === 0
                    ? 'bg-white dark:bg-gray-900'
                    : 'bg-gray-50 dark:bg-gray-800'
                }
              >
                <td className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{hab.icono}</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {hab.nombre}
                    </span>
                  </div>
                </td>
                {dias.map((_, dIdx) => (
                  <td
                    key={dIdx}
                    className="px-2 py-2 text-center border-t border-gray-200 dark:border-gray-700"
                  >
                    <div
                      className="w-6 h-6 mx-auto rounded border-2 border-gray-300 dark:border-gray-600"
                      style={{ borderColor: resolveColor(hab.color) }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && (
        <p className="text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          🎯 {meta}
        </p>
      )}
    </div>
  );
};
