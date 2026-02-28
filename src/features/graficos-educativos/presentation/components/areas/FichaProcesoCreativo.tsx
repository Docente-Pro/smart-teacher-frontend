import React from 'react';
import type { GraficoFichaProcesoCreativo } from '../../../domain/types/graficos-areas.types';
import { resolveColor } from '../../hooks/useRoughSVG';

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
        <span className="text-xs font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 px-3 py-1 rounded-full capitalize">
          Lenguaje {lenguajeArtistico}
        </span>
      </div>

      {/* Etapas */}
      <div className="space-y-0">
        {etapas.map((etapa, i) => {
          const c = resolveColor(etapa.color);
          return (
          <div key={i} className="flex items-start gap-3">
            {/* Indicador lateral */}
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow shrink-0"
                style={{ background: c }}
              >
                {etapa.icono}
              </div>
              {i < etapas.length - 1 && (
                <div
                  className="w-0.5 flex-1 min-h-[24px]"
                  style={{ background: c, opacity: 0.4 }}
                />
              )}
            </div>

            {/* Contenido */}
            <div className="pb-5 flex-1">
              <p className="font-bold text-sm text-gray-800">{etapa.nombre}</p>
              <p className="text-xs text-gray-600 mt-0.5">{etapa.descripcion}</p>

              {/* Lista de materiales (opcional) */}
              {etapa.lista && etapa.lista.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {etapa.lista.map((item, j) => (
                    <li key={j} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {/* Pasos numerados (opcional) */}
              {etapa.pasos && etapa.pasos.length > 0 && (
                <ol className="mt-2 space-y-1 list-decimal list-inside">
                  {etapa.pasos.map((paso, j) => (
                    <li key={j} className="text-xs text-gray-600">
                      {paso}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};
