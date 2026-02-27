import React from 'react';
import type { GraficoSecuenciaMovimiento } from '../../../domain/types/graficos-areas.types';

interface Props {
  data: GraficoSecuenciaMovimiento;
}

const tipoMovEmoji: Record<string, string> = {
  calentamiento: '🔥',
  juego: '🎯',
  danza: '💃',
  ejercicio: '💪',
  estiramiento: '🧘',
  circuito: '🔄',
};

/**
 * Secuencia de Movimiento — Educación Física
 * Pasos de una rutina, juego o ejercicio físico.
 */
export const SecuenciaMovimiento: React.FC<Props> = ({ data }) => {
  const { tipo, pasos, repeticiones, materiales, colorFondo } = data;

  return (
    <div
      className="space-y-4 rounded-xl p-4"
      style={{ background: colorFondo ?? 'transparent' }}
    >
      {/* Tipo + meta */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
        <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
          {tipoMovEmoji[tipo] ?? '🏃'} {tipo}
        </span>
        <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm text-gray-600 dark:text-gray-400">
          🔁 {repeticiones} {repeticiones === 1 ? 'repetición' : 'repeticiones'}
        </span>
      </div>

      {/* Pasos */}
      <div className="space-y-3">
        {pasos.map((paso) => (
          <div
            key={paso.numero}
            className="flex items-start gap-3 bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
          >
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {paso.numero}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{paso.nombre}</p>
                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                  ⏱ {paso.duracion}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{paso.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Materiales */}
      {materiales.length > 0 && materiales[0] !== 'ninguno' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            🎒 Materiales
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{materiales.join(' • ')}</p>
        </div>
      )}
    </div>
  );
};
