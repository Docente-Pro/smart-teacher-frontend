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
        <p className="text-center text-sm italic text-gray-700 font-medium">
          🔬 {subtitulo}
        </p>
      )}

      <div className="rounded-lg border-2 border-teal-700 shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {columnas.map((col, idx) => (
                <th
                  key={idx}
                  className="px-4 py-2.5 text-left border-r border-teal-600 last:border-r-0"
                  style={{ backgroundColor: '#0f766e', color: '#ffffff', fontWeight: 700 }}
                >
                  {col.nombre}
                  {unidades[idx] && (
                    <span className="ml-1 text-xs font-medium" style={{ color: '#ccfbf1' }}>
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
                    ? 'bg-white'
                    : 'bg-teal-50'
                }
              >
                {fila.map((celda, cIdx) => (
                  <td
                    key={cIdx}
                    className={`px-4 py-2.5 border-t border-r border-gray-300 last:border-r-0 ${
                      cIdx === 0
                        ? 'font-semibold text-gray-900 bg-teal-50'
                        : 'text-gray-700'
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
