import React from 'react';
import type { GraficoFichaAutoconocimiento } from '../../../domain/types/graficos-areas.types';
import { resolveColor } from '../../hooks/useRoughSVG';

interface Props {
  data: GraficoFichaAutoconocimiento;
}

/**
 * Ficha de Autoconocimiento — Personal Social
 * Tarjetas con preguntas de autoreflexión agrupadas por sección.
 */
export const FichaAutoconocimiento: React.FC<Props> = ({ data }) => {
  const { subtitulo, colorFondo: _colorFondo, secciones } = data;
  const colorFondo = resolveColor(_colorFondo, 'transparent');

  return (
    <div className="space-y-4" style={{ background: colorFondo, borderRadius: 12, padding: colorFondo !== 'transparent' ? 16 : 0 }}>
      {subtitulo && (
        <p className="text-center text-sm text-gray-500 italic">{subtitulo}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {secciones.map((sec, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray-200 bg-white overflow-visible shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-xl">{sec.icono}</span>
              <h5 className="font-bold text-sm text-gray-800">{sec.nombre}</h5>
            </div>

            {/* Preguntas */}
            <div className="p-4 space-y-3">
              {sec.preguntas.map((preg, pIdx) => (
                <div key={pIdx}>
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    {preg}
                  </p>
                  <div className="w-full h-8 border-b-2 border-dashed border-gray-300" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
