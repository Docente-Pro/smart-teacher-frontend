import React from 'react';
import type { GraficoTarjetaReflexion } from '../../../domain/types/graficos-areas.types';
import { resolveColor } from '../../hooks/useRoughSVG';

/**
 * Convierte un color hex (#RRGGBB) a rgba con opacidad dada (0-1).
 * Seguro para html2canvas que no siempre soporta hex de 8 dígitos.
 */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
      className="rounded-2xl overflow-visible shadow-md"
      style={{ borderLeft: `6px solid ${color}` }}
    >
      {/* Cuerpo del texto */}
      <div className="bg-white p-5 space-y-3">
        {/* Referencia */}
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
          {esParabola ? '📖 Parábola' : '📜 Lectura Bíblica'} — {referencia}
        </p>

        {/* Texto */}
        <blockquote
          className="text-sm italic leading-relaxed text-gray-700 border-l-4 pl-4"
          style={{ borderColor: hexToRgba(color, 0.31) }}
        >
          "{texto}"
        </blockquote>
      </div>

      {/* Preguntas */}
      <div className="px-5 py-4 bg-gray-50 space-y-3">
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
            <p className="text-sm text-gray-700">{preg}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
