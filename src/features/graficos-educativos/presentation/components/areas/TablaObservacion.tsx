import React from 'react';
import type { GraficoTablaObservacion } from '../../../domain/types/graficos-areas.types';

interface Props {
  data: GraficoTablaObservacion;
}

/**
 * Tabla de Observación — Ciencia y Tecnología
 * Registro de variables de un experimento.
 */
export const TablaObservacion: React.FC<Props> = ({ data }) => {
  const { subtitulo, columnas, filas, unidades } = data;

  return (
    <div className="space-y-3">
      {subtitulo && (
        <p className="text-center text-sm italic text-gray-700 dark:text-gray-300 font-medium">
          🔬 {subtitulo}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border-2 border-teal-700 dark:border-teal-500 shadow-sm">
        <table className="w-full text-sm border-collapse tabla-observacion-ciencia">
          <style>{`
            .tabla-observacion-ciencia thead th {
              background-color: #0f766e !important;
              color: #ffffff !important;
              font-weight: 700 !important;
            }
            .tabla-observacion-ciencia thead th .unidad-label {
              color: #ccfbf1 !important;
            }
          `}</style>
          <thead>
            <tr>
              {columnas.map((col, idx) => (
                <th
                  key={idx}
                  className="px-4 py-2.5 text-left whitespace-nowrap border-r border-teal-600 last:border-r-0"
                >
                  {col.nombre}
                  {unidades[idx] && (
                    <span className="unidad-label ml-1 text-xs font-medium">
                      ({unidades[idx]})
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, rIdx) => (
              <tr
                key={rIdx}
                className={
                  rIdx % 2 === 0
                    ? 'bg-white dark:bg-gray-900'
                    : 'bg-teal-50 dark:bg-gray-800'
                }
              >
                {fila.map((celda, cIdx) => (
                  <td
                    key={cIdx}
                    className={`px-4 py-2.5 border-t border-r border-gray-300 dark:border-gray-600 last:border-r-0 ${
                      cIdx === 0
                        ? 'font-semibold text-gray-900 dark:text-gray-100 bg-teal-50 dark:bg-teal-900/30'
                        : 'text-gray-700 dark:text-gray-300'
                    } ${columnas[cIdx]?.tipo === 'numero' ? 'text-right font-mono' : ''}`}
                  >
                    {celda || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
