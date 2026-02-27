import React from 'react';
import type { GraficoTarjetaCompromiso } from '../../../domain/types/graficos-areas.types';

interface Props {
  data: GraficoTarjetaCompromiso;
}

/**
 * Tarjeta de Compromiso — Educación Religiosa
 * Ficha de compromiso concreto con 4 campos de ejecución.
 */
export const TarjetaCompromiso: React.FC<Props> = ({ data }) => {
  const { valor, campos, colorFondo = '#FCE4EC' } = data;

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-md"
      style={{ background: colorFondo }}
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-2 py-4 px-5">
        <span className="text-2xl">🤝</span>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Valor trabajado
          </p>
          <p className="font-bold text-lg text-gray-800">{valor}</p>
        </div>
      </div>

      {/* Campos */}
      <div className="bg-white dark:bg-gray-900 p-5 space-y-4 rounded-t-xl">
        {campos.map((campo, i) => (
          <div key={i}>
            <p className="text-xs font-bold text-pink-600 dark:text-pink-400 mb-1">
              {campo.pregunta}
            </p>
            <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg px-3 py-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">{campo.respuesta}</p>
            </div>
          </div>
        ))}

        {/* Espacio firma */}
        <div className="pt-4 mt-2 border-t border-dashed border-gray-300 dark:border-gray-600 text-center">
          <div className="w-48 mx-auto border-b-2 border-gray-400 mb-1 h-8" />
          <p className="text-[10px] uppercase tracking-wider text-gray-400">
            Nombre del estudiante
          </p>
        </div>
      </div>
    </div>
  );
};
