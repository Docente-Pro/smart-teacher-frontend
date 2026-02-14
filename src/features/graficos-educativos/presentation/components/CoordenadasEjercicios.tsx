import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import {
  GraficoCoordenadasEjercicios,
  PlanoCartesiano,
  FiguraCartesiana,
} from '../../domain/types';
import { defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoCoordenadasEjercicios;
}

// ============= CONSTANTES =============
const CELDA = 30; // px por unidad en el plano
const PADDING = 40;
const LABEL_OFFSET = 14;

// ============= SUB-COMPONENTE: PLANO CARTESIANO =============

interface PlanoProps {
  plano: PlanoCartesiano;
}

const PlanoCartesianoSVG: React.FC<PlanoProps> = ({ plano }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const { tamano, origen, figuras, instruccion } = plano;
  const svgWidth = tamano.ancho * CELDA + PADDING * 2;
  const svgHeight = tamano.alto * CELDA + PADDING * 2;

  // Convertir coordenadas del plano a coordenadas SVG
  const toSvgX = (x: number) => PADDING + (x - 0) * CELDA;
  const toSvgY = (y: number) => PADDING + (tamano.alto - y) * CELDA;

  useEffect(() => {
    if (!svgRef.current) return;

    const rc = rough.svg(svgRef.current);
    // Limpiar sólo los elementos generados por rough (no los nativos)
    const roughElements = svgRef.current.querySelectorAll('.rough-element');
    roughElements.forEach(el => el.remove());

    // Dibujar figuras con RoughJS
    figuras.forEach((fig, idx) => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.classList.add('rough-element');

      if (fig.tipo === 'poligono' && fig.vertices && fig.vertices.length >= 2) {
        const points: [number, number][] = fig.vertices.map(v => [toSvgX(v.x), toSvgY(v.y)]);
        const polygon = rc.polygon(points, {
          ...defaultRoughConfig,
          fill: fig.color,
          fillStyle: 'cross-hatch',
          fillWeight: 1.2,
          stroke: fig.color,
          strokeWidth: 2.5,
          roughness: 0.8,
        });
        group.appendChild(polygon);

        // Etiquetas en vértices
        fig.vertices.forEach((v, vIdx) => {
          const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          label.setAttribute('x', toSvgX(v.x).toString());
          label.setAttribute('y', (toSvgY(v.y) - 8).toString());
          label.setAttribute('text-anchor', 'middle');
          label.setAttribute('font-size', '11');
          label.setAttribute('font-family', 'Comic Sans MS, cursive');
          label.setAttribute('fill', '#374151');
          label.textContent = `(${v.x},${v.y})`;
          group.appendChild(label);
        });
      }

      if (fig.tipo === 'circulo' && fig.centro && fig.radio) {
        const circle = rc.circle(toSvgX(fig.centro.x), toSvgY(fig.centro.y), fig.radio * CELDA * 2, {
          ...defaultRoughConfig,
          fill: fig.color,
          fillStyle: 'cross-hatch',
          fillWeight: 1,
          stroke: fig.color,
          strokeWidth: 2.5,
          roughness: 0.8,
        });
        group.appendChild(circle);
      }

      if ((fig.tipo === 'cuadrado' || fig.tipo === 'rectangulo') && fig.vertices && fig.vertices.length >= 2) {
        const minX = Math.min(...fig.vertices.map(v => v.x));
        const maxX = Math.max(...fig.vertices.map(v => v.x));
        const minY = Math.min(...fig.vertices.map(v => v.y));
        const maxY = Math.max(...fig.vertices.map(v => v.y));
        const rect = rc.rectangle(
          toSvgX(minX), toSvgY(maxY),
          (maxX - minX) * CELDA, (maxY - minY) * CELDA,
          {
            ...defaultRoughConfig,
            fill: fig.color,
            fillStyle: 'cross-hatch',
            fillWeight: 1,
            stroke: fig.color,
            strokeWidth: 2.5,
            roughness: 0.8,
          }
        );
        group.appendChild(rect);
      }

      if (fig.tipo === 'triangulo' && fig.vertices && fig.vertices.length >= 3) {
        const points: [number, number][] = fig.vertices.map(v => [toSvgX(v.x), toSvgY(v.y)]);
        const triangle = rc.polygon(points, {
          ...defaultRoughConfig,
          fill: fig.color,
          fillStyle: 'cross-hatch',
          fillWeight: 1,
          stroke: fig.color,
          strokeWidth: 2.5,
          roughness: 0.8,
        });
        group.appendChild(triangle);
      }

      // Etiqueta general de la figura
      if (fig.etiqueta) {
        const centroX = fig.centro?.x ?? (fig.vertices ? fig.vertices.reduce((s, v) => s + v.x, 0) / fig.vertices.length : 0);
        const centroY = fig.centro?.y ?? (fig.vertices ? fig.vertices.reduce((s, v) => s + v.y, 0) / fig.vertices.length : 0);
        const etiqueta = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        etiqueta.setAttribute('x', toSvgX(centroX).toString());
        etiqueta.setAttribute('y', (toSvgY(centroY) - 2).toString());
        etiqueta.setAttribute('text-anchor', 'middle');
        etiqueta.setAttribute('dominant-baseline', 'middle');
        etiqueta.setAttribute('font-size', '13');
        etiqueta.setAttribute('font-weight', 'bold');
        etiqueta.setAttribute('font-family', 'Comic Sans MS, cursive');
        etiqueta.setAttribute('fill', '#1e293b');
        etiqueta.textContent = fig.etiqueta;
        group.appendChild(etiqueta);
      }

      svgRef.current!.appendChild(group);
    });
  }, [figuras, tamano, origen]);

  return (
    <div className="coordenadas-plano-wrapper" style={{ marginBottom: '16px' }}>
      {instruccion && (
        <p style={{
          fontFamily: 'Comic Sans MS, cursive',
          fontSize: '14px',
          color: '#4B5563',
          marginBottom: '8px',
          textAlign: 'center',
          fontWeight: 'bold',
        }}>
          📌 {instruccion}
        </p>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', maxWidth: `${svgWidth}px`, height: 'auto', background: '#fafafa', borderRadius: '8px' }}
      >
        {/* Cuadrícula */}
        {Array.from({ length: tamano.ancho + 1 }).map((_, i) => (
          <line
            key={`vl-${i}`}
            x1={PADDING + i * CELDA} y1={PADDING}
            x2={PADDING + i * CELDA} y2={PADDING + tamano.alto * CELDA}
            stroke={i === origen.x ? '#374151' : '#d1d5db'}
            strokeWidth={i === origen.x ? 2 : 0.5}
          />
        ))}
        {Array.from({ length: tamano.alto + 1 }).map((_, j) => (
          <line
            key={`hl-${j}`}
            x1={PADDING} y1={PADDING + j * CELDA}
            x2={PADDING + tamano.ancho * CELDA} y2={PADDING + j * CELDA}
            stroke={j === (tamano.alto - origen.y) ? '#374151' : '#d1d5db'}
            strokeWidth={j === (tamano.alto - origen.y) ? 2 : 0.5}
          />
        ))}

        {/* Etiquetas eje X */}
        {Array.from({ length: tamano.ancho + 1 }).map((_, i) => (
          <text
            key={`xl-${i}`}
            x={PADDING + i * CELDA}
            y={PADDING + tamano.alto * CELDA + LABEL_OFFSET}
            textAnchor="middle"
            fontSize="10"
            fontFamily="Comic Sans MS, cursive"
            fill="#6B7280"
          >
            {i}
          </text>
        ))}

        {/* Etiquetas eje Y */}
        {Array.from({ length: tamano.alto + 1 }).map((_, j) => (
          <text
            key={`yl-${j}`}
            x={PADDING - LABEL_OFFSET}
            y={PADDING + (tamano.alto - j) * CELDA + 4}
            textAnchor="middle"
            fontSize="10"
            fontFamily="Comic Sans MS, cursive"
            fill="#6B7280"
          >
            {j}
          </text>
        ))}

        {/* Flechas ejes */}
        <polygon
          points={`${PADDING + tamano.ancho * CELDA + 8},${toSvgY(origen.y)} ${PADDING + tamano.ancho * CELDA - 2},${toSvgY(origen.y) - 5} ${PADDING + tamano.ancho * CELDA - 2},${toSvgY(origen.y) + 5}`}
          fill="#374151"
        />
        <text
          x={PADDING + tamano.ancho * CELDA + 14}
          y={toSvgY(origen.y) + 4}
          fontSize="12"
          fontWeight="bold"
          fontFamily="Comic Sans MS, cursive"
          fill="#374151"
        >
          x
        </text>

        <polygon
          points={`${toSvgX(origen.x)},${PADDING - 8} ${toSvgX(origen.x) - 5},${PADDING + 2} ${toSvgX(origen.x) + 5},${PADDING + 2}`}
          fill="#374151"
        />
        <text
          x={toSvgX(origen.x) + 10}
          y={PADDING - 2}
          fontSize="12"
          fontWeight="bold"
          fontFamily="Comic Sans MS, cursive"
          fill="#374151"
        >
          y
        </text>

        {/* Puntos de la cuadrícula */}
        {Array.from({ length: tamano.ancho + 1 }).map((_, i) =>
          Array.from({ length: tamano.alto + 1 }).map((_, j) => (
            <circle
              key={`dot-${i}-${j}`}
              cx={PADDING + i * CELDA}
              cy={PADDING + j * CELDA}
              r={1.5}
              fill="#9CA3AF"
            />
          ))
        )}
      </svg>
    </div>
  );
};

// ============= SUB-COMPONENTE: TABLA DE COORDENADAS =============

interface TablaProps {
  tabla: {
    titulo: string;
    encabezados: string[];
    filas: { elemento: string; valores: string[] }[];
    pregunta: string;
  };
}

const TablaCoordenadasView: React.FC<TablaProps> = ({ tabla }) => (
  <div style={{ marginBottom: '16px', overflowX: 'auto' }}>
    {tabla.titulo && (
      <p style={{
        fontFamily: 'Comic Sans MS, cursive',
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#1e293b',
        marginBottom: '6px',
      }}>
        📋 {tabla.titulo}
      </p>
    )}
    <table style={{
      borderCollapse: 'collapse',
      width: '100%',
      fontFamily: 'Comic Sans MS, cursive',
      fontSize: '13px',
    }}>
      <thead>
        <tr>
          {tabla.encabezados.map((h, i) => (
            <th key={i} style={{
              border: '2px solid #94a3b8',
              padding: '8px 12px',
              backgroundColor: '#e2e8f0',
              color: '#1e293b',
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tabla.filas.map((fila, fIdx) => (
          <tr key={fIdx}>
            <td style={{
              border: '2px solid #cbd5e1',
              padding: '6px 12px',
              backgroundColor: '#f1f5f9',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#334155',
            }}>
              {fila.elemento}
            </td>
            {fila.valores.map((val, vIdx) => (
              <td key={vIdx} style={{
                border: '2px solid #cbd5e1',
                padding: '6px 12px',
                textAlign: 'center',
                backgroundColor: val === '' ? '#fef9c3' : '#ffffff',
                color: val === '' ? '#92400e' : '#1e293b',
                fontWeight: val === '' ? 'bold' : 'normal',
                minWidth: '60px',
              }}>
                {val || '___'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    {tabla.pregunta && (
      <p style={{
        fontFamily: 'Comic Sans MS, cursive',
        fontSize: '13px',
        color: '#7c3aed',
        marginTop: '8px',
        fontWeight: 'bold',
      }}>
        ❓ {tabla.pregunta}
      </p>
    )}
  </div>
);

// ============= COMPONENTE PRINCIPAL =============

/**
 * Componente para coordenadas con ejercicios
 * Renderiza planos cartesianos, ejercicios y tablas de coordenadas
 */
export const CoordenadasEjercicios: React.FC<Props> = ({ data }) => {
  const { planos = [], ejercicios = [], tablas = [] } = data;

  return (
    <div className="coordenadas-ejercicios-container">
      {/* Planos cartesianos */}
      {planos.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
          {planos.map((plano) => (
            <div key={plano.id} style={{ flex: '1 1 auto', minWidth: '280px', maxWidth: '500px' }}>
              <PlanoCartesianoSVG plano={plano} />
            </div>
          ))}
        </div>
      )}

      {/* Lista de ejercicios */}
      {ejercicios.length > 0 && (
        <div style={{
          margin: '16px 0',
          padding: '12px 16px',
          backgroundColor: '#eff6ff',
          borderRadius: '8px',
          border: '2px solid #bfdbfe',
        }}>
          <p style={{
            fontFamily: 'Comic Sans MS, cursive',
            fontWeight: 'bold',
            fontSize: '15px',
            color: '#1e40af',
            marginBottom: '8px',
          }}>
            ✏️ Ejercicios
          </p>
          <ol style={{
            fontFamily: 'Comic Sans MS, cursive',
            fontSize: '14px',
            color: '#1e293b',
            paddingLeft: '20px',
            margin: 0,
            lineHeight: '1.8',
          }}>
            {ejercicios.map((ej) => (
              <li key={ej.numero} style={{ marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{ej.numero}.</span>{' '}
                {ej.pregunta}
                <span style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  marginLeft: '6px',
                  backgroundColor: '#e5e7eb',
                  padding: '1px 6px',
                  borderRadius: '4px',
                }}>
                  {ej.tipo}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Tablas de coordenadas */}
      {tablas.length > 0 && (
        <div style={{ margin: '16px 0' }}>
          {tablas.map((tabla, idx) => (
            <TablaCoordenadasView key={idx} tabla={tabla} />
          ))}
        </div>
      )}
    </div>
  );
};
