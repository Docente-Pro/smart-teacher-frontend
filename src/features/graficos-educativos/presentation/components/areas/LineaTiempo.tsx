import React from 'react';
import type { GraficoLineaTiempo } from '../../../domain/types/graficos-areas.types';

interface Props {
  data: GraficoLineaTiempo;
}

/**
 * Línea de Tiempo — Personal Social
 * Ordena eventos cronológicamente (horizontal o vertical).
 */
export const LineaTiempo: React.FC<Props> = ({ data }) => {
  const { subtitulo, orientacion = 'horizontal', eventos, colorLinea = '#795548' } = data;

  if (orientacion === 'horizontal') {
    return <TimelineHorizontal eventos={eventos} subtitulo={subtitulo} colorLinea={colorLinea} />;
  }

  return <TimelineVertical eventos={eventos} subtitulo={subtitulo} colorLinea={colorLinea} />;
};

/* ---------- Horizontal ---------- */

const TimelineHorizontal: React.FC<{
  eventos: GraficoLineaTiempo['eventos'];
  subtitulo?: string;
  colorLinea: string;
}> = ({ eventos, subtitulo, colorLinea }) => (
  <div className="space-y-3">
    {subtitulo && (
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 italic">{subtitulo}</p>
    )}
    <div className="overflow-x-auto pb-2">
      <div className="relative flex items-start gap-0 min-w-max px-4 pt-8">
        {/* Línea base */}
        <div
          className="absolute top-[52px] left-4 right-4 h-1 rounded-full"
          style={{ background: colorLinea }}
        />

        {eventos.map((ev, i) => (
          <div key={i} className="relative flex flex-col items-center w-44 shrink-0">
            {/* Fecha */}
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full mb-2 text-white"
              style={{ background: ev.color }}
            >
              {ev.fecha}
            </span>
            {/* Punto */}
            <div
              className="w-5 h-5 rounded-full border-4 border-white dark:border-gray-900 shadow z-10"
              style={{ background: ev.color }}
            />
            {/* Contenido debajo */}
            <div className="mt-3 text-center px-2">
              <span className="text-lg">{ev.icono}</span>
              <p className="font-semibold text-xs text-gray-800 dark:text-gray-200 mt-1">
                {ev.etiqueta}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                {ev.descripcion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ---------- Vertical ---------- */

const TimelineVertical: React.FC<{
  eventos: GraficoLineaTiempo['eventos'];
  subtitulo?: string;
  colorLinea: string;
}> = ({ eventos, subtitulo, colorLinea }) => (
  <div className="space-y-3">
    {subtitulo && (
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 italic">{subtitulo}</p>
    )}
    <div className="relative pl-8">
      {/* Línea vertical */}
      <div
        className="absolute left-4 top-0 bottom-0 w-1 rounded-full"
        style={{ background: colorLinea }}
      />

      {eventos.map((ev, i) => (
        <div key={i} className="relative flex items-start gap-4 mb-6 last:mb-0">
          {/* Punto */}
          <div
            className="absolute -left-4 top-1 w-5 h-5 rounded-full border-4 border-white dark:border-gray-900 shadow z-10"
            style={{ background: ev.color }}
          />
          {/* Contenido */}
          <div className="ml-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">{ev.icono}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: ev.color }}
              >
                {ev.fecha}
              </span>
            </div>
            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 mt-1">
              {ev.etiqueta}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{ev.descripcion}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
