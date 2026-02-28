import React from 'react';
import type { GraficoEstructuraNarrativa } from '../../../domain/types/graficos-areas.types';
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
  data: GraficoEstructuraNarrativa;
}

/**
 * Estructura Narrativa — Comunicación
 * Organiza Inicio, Nudo y Desenlace de un texto narrativo.
 */
export const EstructuraNarrativa: React.FC<Props> = ({ data }) => {
  const { secciones, personajes, lugar, mensaje } = data;

  return (
    <div className="space-y-4">
      {/* Secciones: Inicio – Nudo – Desenlace */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {secciones.map((sec, idx) => {
          const c = resolveColor(sec.color);
          return (
          <div
            key={idx}
            className="rounded-xl border-2 p-4 flex flex-col gap-2 shadow-sm"
            style={{ borderColor: c, background: hexToRgba(c, 0.07) }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{sec.icono}</span>
              <h4 className="font-bold text-base" style={{ color: c }}>
                {sec.nombre}
              </h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {sec.contenido}
            </p>
          </div>
          );
        })}
      </div>

      {/* Flechas de conexión (sólo visual, md+) */}
      <div className="hidden md:flex justify-center items-center gap-2 -mt-2 -mb-2">
        <span className="text-xl text-gray-400">→</span>
        <span className="text-xl text-gray-400">→</span>
      </div>

      {/* Meta-datos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 rounded-lg p-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            👤 Personajes
          </p>
          <p className="text-sm text-gray-700">
            {personajes.join(', ')}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            📍 Lugar
          </p>
          <p className="text-sm text-gray-700">{lugar}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            💡 Mensaje
          </p>
          <p className="text-sm text-gray-700">{mensaje}</p>
        </div>
      </div>
    </div>
  );
};
