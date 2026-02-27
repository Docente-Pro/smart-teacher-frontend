import React from 'react';
import type { GraficoFichaAnalisisObra } from '../../../domain/types/graficos-areas.types';

interface Props {
  data: GraficoFichaAnalisisObra;
}

const tipoObraEmoji: Record<string, string> = {
  cerámica: '🏺',
  pintura: '🎨',
  tejido: '🧶',
  danza: '💃',
  música: '🎵',
  escultura: '🗿',
  artesanía: '🪡',
  arquitectura: '🏛️',
};

/**
 * Ficha de Análisis de Obra — Arte y Cultura
 * Análisis multidimensional de una obra o manifestación cultural.
 */
export const FichaAnalisisObra: React.FC<Props> = ({ data }) => {
  const { obra, dimensiones, miOpinion } = data;

  return (
    <div className="space-y-4">
      {/* Datos de la obra */}
      <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4 flex items-start gap-3">
        <span className="text-3xl">{tipoObraEmoji[obra.tipo] ?? '🎭'}</span>
        <div className="text-sm">
          <p className="font-bold text-gray-800 dark:text-gray-200">{obra.nombre}</p>
          <p className="text-gray-600 dark:text-gray-400">
            {obra.autor} — {obra.origen}
          </p>
          <span className="inline-block mt-1 text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full capitalize">
            {obra.tipo}
          </span>
        </div>
      </div>

      {/* Dimensiones de análisis */}
      <div className="space-y-2">
        {dimensiones.map((dim, i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
          >
            <span className="text-xl shrink-0">{dim.icono}</span>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {dim.aspecto}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{dim.observacion}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mi opinión */}
      {miOpinion && (
        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <p className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-2">
            🗣️ Mi opinión
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 italic">{miOpinion}</p>
          <div className="mt-3 w-full h-10 border-b-2 border-dashed border-purple-300 dark:border-purple-600" />
        </div>
      )}
    </div>
  );
};
