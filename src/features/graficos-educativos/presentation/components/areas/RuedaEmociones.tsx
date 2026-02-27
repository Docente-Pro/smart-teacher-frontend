import React, { useState } from 'react';
import type { GraficoRuedaEmociones } from '../../../domain/types/graficos-areas.types';

interface Props {
  data: GraficoRuedaEmociones;
}

/**
 * Rueda de Emociones — Personal Social
 * Sectores circulares coloreados; el estudiante selecciona en clase.
 */
export const RuedaEmociones: React.FC<Props> = ({ data }) => {
  const { instruccion, emociones, preguntaReflexion } = data;
  const [seleccionada, setSeleccionada] = useState<string | null>(data.emocionSeleccionada);

  const n = emociones.length;
  const radio = 120;
  const centro = 140;
  const size = centro * 2;

  return (
    <div className="space-y-4">
      {instruccion && (
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 italic">
          {instruccion}
        </p>
      )}

      {/* Rueda SVG */}
      <div className="flex justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[300px]">
          {emociones.map((emo, i) => {
            const startAngle = (2 * Math.PI * i) / n - Math.PI / 2;
            const endAngle = (2 * Math.PI * (i + 1)) / n - Math.PI / 2;

            const x1 = centro + radio * Math.cos(startAngle);
            const y1 = centro + radio * Math.sin(startAngle);
            const x2 = centro + radio * Math.cos(endAngle);
            const y2 = centro + radio * Math.sin(endAngle);

            const largeArc = n <= 2 ? 1 : 0;

            const midAngle = (startAngle + endAngle) / 2;
            const labelR = radio * 0.6;
            const lx = centro + labelR * Math.cos(midAngle);
            const ly = centro + labelR * Math.sin(midAngle);

            const isSelected = seleccionada === emo.nombre;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onClick={() => setSeleccionada(emo.nombre)}
              >
                <path
                  d={`M ${centro} ${centro} L ${x1} ${y1} A ${radio} ${radio} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={emo.color}
                  stroke={isSelected ? '#1e293b' : '#fff'}
                  strokeWidth={isSelected ? 3 : 1.5}
                  opacity={isSelected ? 1 : 0.85}
                />
                <text
                  x={lx}
                  y={ly - 6}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="18"
                >
                  {emo.icono}
                </text>
                <text
                  x={lx}
                  y={ly + 12}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="9"
                  fontWeight="bold"
                  fill="#1e293b"
                >
                  {emo.nombre}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Leyenda */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {emociones.map((emo, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSeleccionada(emo.nombre)}
            className={`flex items-center gap-2 text-left text-xs rounded-lg px-3 py-2 border transition-all ${
              seleccionada === emo.nombre
                ? 'ring-2 ring-offset-1 border-gray-800 dark:border-gray-200 font-bold'
                : 'border-gray-200 dark:border-gray-700'
            }`}
            style={{
              background: seleccionada === emo.nombre ? `${emo.color}30` : undefined,
            }}
          >
            <span className="text-lg">{emo.icono}</span>
            <span className="text-gray-700 dark:text-gray-300">{emo.nombre}</span>
          </button>
        ))}
      </div>

      {/* Pregunta de reflexión */}
      {preguntaReflexion && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
            ✍️ {preguntaReflexion}
          </p>
        </div>
      )}
    </div>
  );
};
