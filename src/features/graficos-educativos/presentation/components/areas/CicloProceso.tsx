import React from 'react';
import type { GraficoCicloProceso } from '../../../domain/types/graficos-areas.types';
import { resolveColor } from '../../hooks/useRoughSVG';

interface Props {
  data: GraficoCicloProceso;
}

/**
 * Ciclo / Proceso — Ciencia y Tecnología
 * Visualiza fases de un ciclo (circular) o proceso (lineal).
 */
export const CicloProceso: React.FC<Props> = ({ data }) => {
  const { tipo, fases, colorFondo } = data;
  const resolvedColorFondo = resolveColor(colorFondo, 'transparent');

  if (tipo === 'circular') {
    return <CicloCircular fases={fases} colorFondo={resolvedColorFondo} />;
  }

  return <ProcesoLineal fases={fases} colorFondo={resolvedColorFondo} />;
};

/* ---------- Circular ---------- */

/**
 * Dibuja una punta de flecha directamente como path (sin <marker>/<defs>)
 * para compatibilidad con html2canvas/html2pdf.
 */
function arrowHeadPath(
  fromX: number, fromY: number,
  toX: number, toY: number,
  size = 8,
): string {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const x1 = toX - size * Math.cos(angle - Math.PI / 6);
  const y1 = toY - size * Math.sin(angle - Math.PI / 6);
  const x2 = toX - size * Math.cos(angle + Math.PI / 6);
  const y2 = toY - size * Math.sin(angle + Math.PI / 6);
  return `M ${toX} ${toY} L ${x1} ${y1} L ${x2} ${y2} Z`;
}

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

          // Calcular punto final de la curva (ajustado para la flecha)
          // Evaluamos la curva Bézier cuadrática en t=0.95 para obtener dirección
          const t = 0.95;
          const preX = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * mx + t * t * nx;
          const preY = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * my + t * t * ny;

          return (
            <g key={i}>
              {/* Línea de conexión */}
              <path
                d={`M ${x} ${y} Q ${mx} ${my} ${nx} ${ny}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
              />
              {/* Punta de flecha dibujada directamente (compatible con html2canvas) */}
              <path
                d={arrowHeadPath(preX, preY, nx, ny, 8)}
                fill="#94a3b8"
              />
              {/* Nodo */}
              <circle cx={x} cy={y} r="30" fill={resolveColor(fase.color)} />
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
      </svg>

      {/* Leyenda */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {fases.map((fase, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span
              className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0"
              style={{ background: resolveColor(fase.color), color: '#fff' }}
            >
              {i + 1}
            </span>
            <div>
              <p className="font-semibold text-gray-800">{fase.nombre}</p>
              <p className="text-gray-600 text-xs">{fase.descripcion}</p>
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
              style={{ background: resolveColor(fase.color) }}
            >
              {fase.icono}
            </div>
            {i < fases.length - 1 && (
              <div className="w-0.5 h-10 bg-gray-300" />
            )}
          </div>

          {/* Contenido */}
          <div className="pb-4">
            <p className="font-bold text-sm text-gray-800">{fase.nombre}</p>
            <p className="text-xs text-gray-600">{fase.descripcion}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
