import React from 'react';
import type { GraficoCicloProceso } from '../../../domain/types/graficos-areas.types';

interface Props {
  data: GraficoCicloProceso;
}

/**
 * Ciclo / Proceso — Ciencia y Tecnología
 * Visualiza fases de un ciclo (circular) o proceso (lineal).
 */
export const CicloProceso: React.FC<Props> = ({ data }) => {
  const { tipo, fases, colorFondo } = data;

  if (tipo === 'circular') {
    return <CicloCircular fases={fases} colorFondo={colorFondo} />;
  }

  return <ProcesoLineal fases={fases} colorFondo={colorFondo} />;
};

/* ---------- Circular ---------- */

const CicloCircular: React.FC<{ fases: GraficoCicloProceso['fases']; colorFondo?: string }> = ({
  fases,
  colorFondo,
}) => {
  const n = fases.length;
  const radio = 140;
  const centro = 180;
  const size = centro * 2;

  return (
    <div
      className="flex flex-col items-center gap-4"
      style={{ background: colorFondo ?? 'transparent', borderRadius: 12, padding: 16 }}
    >
      {/* SVG del ciclo */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[400px]"
        aria-label="Ciclo circular"
      >
        {fases.map((fase, i) => {
          const angle = (2 * Math.PI * i) / n - Math.PI / 2;
          const x = centro + radio * Math.cos(angle);
          const y = centro + radio * Math.sin(angle);

          // Flecha al siguiente nodo
          const nextAngle = (2 * Math.PI * ((i + 1) % n)) / n - Math.PI / 2;
          const nx = centro + radio * Math.cos(nextAngle);
          const ny = centro + radio * Math.sin(nextAngle);

          // Punto medio para curva
          const mx = (x + nx) / 2 + (centro - (x + nx) / 2) * 0.3;
          const my = (y + ny) / 2 + (centro - (y + ny) / 2) * 0.3;

          return (
            <g key={i}>
              {/* Línea de conexión */}
              <path
                d={`M ${x} ${y} Q ${mx} ${my} ${nx} ${ny}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
              {/* Nodo */}
              <circle cx={x} cy={y} r="30" fill={fase.color} opacity={0.9} />
              <text
                x={x}
                y={y + 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="18"
              >
                {fase.icono}
              </text>
            </g>
          );
        })}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
          </marker>
        </defs>
      </svg>

      {/* Leyenda */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {fases.map((fase, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span
              className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0"
              style={{ background: fase.color, color: '#fff' }}
            >
              {i + 1}
            </span>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{fase.nombre}</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">{fase.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- Lineal ---------- */

const ProcesoLineal: React.FC<{ fases: GraficoCicloProceso['fases']; colorFondo?: string }> = ({
  fases,
  colorFondo,
}) => {
  return (
    <div
      className="space-y-0"
      style={{ background: colorFondo ?? 'transparent', borderRadius: 12, padding: 16 }}
    >
      {fases.map((fase, i) => (
        <div key={i} className="flex items-start gap-3">
          {/* Línea vertical + punto */}
          <div className="flex flex-col items-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 shadow"
              style={{ background: fase.color }}
            >
              {fase.icono}
            </div>
            {i < fases.length - 1 && (
              <div className="w-0.5 h-10 bg-gray-300 dark:bg-gray-600" />
            )}
          </div>

          {/* Contenido */}
          <div className="pb-4">
            <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{fase.nombre}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{fase.descripcion}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
