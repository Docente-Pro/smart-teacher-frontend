import React from 'react';
import type { GraficoLineaTiempo } from '../../../domain/types/graficos-areas.types';
import { resolveColor } from '../../hooks/useRoughSVG';

interface Props {
  data: GraficoLineaTiempo;
}

/**
 * Línea de Tiempo — Personal Social
 * Ordena eventos cronológicamente (horizontal o vertical).
 */
export const LineaTiempo: React.FC<Props> = ({ data }) => {
  const { subtitulo, orientacion = 'horizontal', eventos, colorLinea: _colorLinea = '#795548' } = data;
  const colorLinea = resolveColor(_colorLinea);

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
      <p className="text-center text-sm text-gray-500 italic">{subtitulo}</p>
    )}
    {/* Sin overflow-x-auto para que html2canvas capture todo el contenido */}
    <div className="pb-2">
      <div className="relative flex items-start gap-0 flex-wrap justify-center px-4 pt-8">
        {/* Línea base */}
        <div
          className="absolute top-[52px] left-4 right-4 h-1 rounded-full"
          style={{ background: colorLinea }}
        />

        {eventos.map((ev, i) => {
          const c = resolveColor(ev.color);
          return (
          <div key={i} className="relative flex flex-col items-center" style={{ width: '10rem', flexShrink: 0 }}>
            {/* Fecha */}
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full mb-2 text-white"
              style={{ background: c }}
            >
              {ev.fecha}
            </span>
            {/* Punto */}
            <div
              className="w-5 h-5 rounded-full border-4 border-white shadow z-10"
              style={{ background: c }}
            />
            {/* Contenido debajo */}
            <div className="mt-3 text-center px-2">
              <span className="text-lg">{ev.icono}</span>
              <p className="font-semibold text-xs text-gray-800 mt-1">
                {ev.etiqueta}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                {ev.descripcion}
              </p>
            </div>
          </div>
          );
        })}
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
      <p className="text-center text-sm text-gray-500 italic">{subtitulo}</p>
    )}
    <div className="relative pl-8">
      {/* Línea vertical */}
      <div
        className="absolute left-4 top-0 bottom-0 w-1 rounded-full"
        style={{ background: colorLinea }}
      />

      {eventos.map((ev, i) => {
        const c = resolveColor(ev.color);
        return (
        <div key={i} className="relative flex items-start gap-4 mb-6 last:mb-0">
          {/* Punto */}
          <div
            className="absolute -left-4 top-1 w-5 h-5 rounded-full border-4 border-white shadow z-10"
            style={{ background: c }}
          />
          {/* Contenido */}
          <div className="ml-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">{ev.icono}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: c }}
              >
                {ev.fecha}
              </span>
            </div>
            <p className="font-semibold text-sm text-gray-800 mt-1">
              {ev.etiqueta}
            </p>
            <p className="text-xs text-gray-500">{ev.descripcion}</p>
          </div>
        </div>
        );
      })}
    </div>
  </div>
);
