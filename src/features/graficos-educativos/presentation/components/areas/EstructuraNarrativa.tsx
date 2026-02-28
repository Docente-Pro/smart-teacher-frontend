import React from 'react';
import type { GraficoEstructuraNarrativa } from '../../../domain/types/graficos-areas.types';
import { resolveColor } from '../../hooks/useRoughSVG';

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
            style={{ borderColor: c, background: `${c}12` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{sec.icono}</span>
              <h4 className="font-bold text-base" style={{ color: c }}>
                {sec.nombre}
              </h4>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            👤 Personajes
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {personajes.join(', ')}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            📍 Lugar
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{lugar}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            💡 Mensaje
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{mensaje}</p>
        </div>
      </div>
    </div>
  );
};
