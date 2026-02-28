import React from 'react';
import type { GraficoTarjetaReflexion } from '../../../domain/types/graficos-areas.types';
import { resolveColor } from '../../hooks/useRoughSVG';

interface Props {
  data: GraficoTarjetaReflexion;
}

/**
 * Tarjeta de Reflexión — Educación Religiosa
 * Muestra un texto bíblico o parábola con preguntas de reflexión.
 */
export const TarjetaReflexion: React.FC<Props> = ({ data }) => {
  const { referencia, texto, esParabola, color: _color, preguntas } = data;
  const color = resolveColor(_color);

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-md"
      style={{ borderLeft: `6px solid ${color}` }}
    >
      {/* Cuerpo del texto */}
      <div className="bg-white dark:bg-gray-900 p-5 space-y-3">
        {/* Referencia */}
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
          {esParabola ? '📖 Parábola' : '📜 Lectura Bíblica'} — {referencia}
        </p>

        {/* Texto */}
        <blockquote
          className="text-sm italic leading-relaxed text-gray-700 dark:text-gray-300 border-l-4 pl-4"
          style={{ borderColor: `${color}50` }}
        >
          "{texto}"
        </blockquote>
      </div>

      {/* Preguntas */}
      <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
          Reflexionamos
        </p>
        {preguntas.map((preg, i) => (
          <div key={i} className="flex items-start gap-2">
            <span
              className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ background: color }}
            >
              {i + 1}
            </span>
            <p className="text-sm text-gray-700 dark:text-gray-300">{preg}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
