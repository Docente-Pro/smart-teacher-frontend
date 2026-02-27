import React from 'react';
import type { GraficoFichaProcesoCreativo } from '../../../domain/types/graficos-areas.types';

interface Props {
  data: GraficoFichaProcesoCreativo;
}

const lenguajeEmoji: Record<string, string> = {
  plástico: '🎨',
  musical: '🎵',
  corporal: '🤸',
  dramático: '🎭',
};

/**
 * Ficha de Proceso Creativo — Arte y Cultura
 * Planifica y documenta las etapas de un proyecto artístico.
 */
export const FichaProcesoCreativo: React.FC<Props> = ({ data }) => {
  const { lenguajeArtistico, etapas } = data;

  return (
    <div className="space-y-4">
      {/* Badge del lenguaje */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-xl">{lenguajeEmoji[lenguajeArtistico] ?? '🎨'}</span>
        <span className="text-xs font-semibold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full capitalize">
          Lenguaje {lenguajeArtistico}
        </span>
      </div>

      {/* Etapas */}
      <div className="space-y-0">
        {etapas.map((etapa, i) => (
          <div key={i} className="flex items-start gap-3">
            {/* Indicador lateral */}
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow shrink-0"
                style={{ background: etapa.color }}
              >
                {etapa.icono}
              </div>
              {i < etapas.length - 1 && (
                <div
                  className="w-0.5 flex-1 min-h-[24px]"
                  style={{ background: etapa.color, opacity: 0.4 }}
                />
              )}
            </div>

            {/* Contenido */}
            <div className="pb-5 flex-1">
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{etapa.nombre}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{etapa.descripcion}</p>

              {/* Lista de materiales (opcional) */}
              {etapa.lista && etapa.lista.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {etapa.lista.map((item, j) => (
                    <li key={j} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: etapa.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {/* Pasos numerados (opcional) */}
              {etapa.pasos && etapa.pasos.length > 0 && (
                <ol className="mt-2 space-y-1 list-decimal list-inside">
                  {etapa.pasos.map((paso, j) => (
                    <li key={j} className="text-xs text-gray-600 dark:text-gray-400">
                      {paso}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
