import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoReglaMedicion } from '../../domain/types';
import { roughColors, resolveColor } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoReglaMedicion;
}

/* ── Helper: texto SVG ── */
function txt(
  svg: SVGSVGElement, x: number, y: number, text: string,
  opts: { size?: number; weight?: string; fill?: string; anchor?: string } = {}
) {
  const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t.setAttribute('x', x.toString());
  t.setAttribute('y', y.toString());
  t.setAttribute('text-anchor', opts.anchor ?? 'middle');
  t.setAttribute('font-size', (opts.size ?? 12).toString());
  t.setAttribute('font-weight', opts.weight ?? 'normal');
  t.setAttribute('font-family', 'Comic Sans MS, cursive');
  t.setAttribute('fill', opts.fill ?? '#334155');
  t.textContent = text;
  svg.appendChild(t);
}

export const ReglaMedicion: React.FC<Props> = ({ data }) => {
  const {
    inicio, fin, unidad, intervalo = 1,
    marcas = [],
    objetoMedir,
  } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  // Layout
  const margen = 50;
  const totalW = 540;
  const reglaW = totalW - margen * 2;
  const reglaY = 80;
  const reglaH = 36;
  const rango = fin - inicio;
  const scale = reglaW / rango;

  // Si hay marcas, necesitamos espacio arriba para etiquetas + flecha de medición
  const hasMarcas = marcas.length > 0;
  const topExtra = hasMarcas ? 46 : 10;
  const svgH = reglaY + reglaH + 30 + (objetoMedir ? 28 : 0) + 10;

  useEffect(() => {
    if (!svgRef.current) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';
    const svg = svgRef.current;

    // ── Sombra de la regla ──
    svg.appendChild(rc.rectangle(margen + 3, reglaY + 3, reglaW, reglaH, {
      roughness: 0.3, strokeWidth: 0, fill: 'rgba(0,0,0,0.08)', fillStyle: 'solid',
    }));

    // ── Cuerpo de la regla ──
    svg.appendChild(rc.rectangle(margen, reglaY, reglaW, reglaH, {
      roughness: 0.7, strokeWidth: 2.5, stroke: '#a16207',
      fill: '#fde68a', fillStyle: 'solid',
    }));

    // Borde superior decorativo (franja oscura)
    svg.appendChild(rc.rectangle(margen, reglaY, reglaW, 6, {
      roughness: 0.5, strokeWidth: 0, fill: '#f59e0b', fillStyle: 'solid',
    }));

    // ── Marcas de escala ──
    for (let v = inicio; v <= fin; v += intervalo) {
      const x = margen + (v - inicio) * scale;

      // Sub-marcas intermedias (mitad)
      if (v < fin) {
        const halfX = x + scale / 2;
        if (halfX <= margen + reglaW) {
          svg.appendChild(rc.line(halfX, reglaY + 6, halfX, reglaY + 14, {
            stroke: '#92400e', strokeWidth: 0.8, roughness: 0.2,
          }));
        }
      }

      // Marca principal
      const tickTop = reglaY + 6;
      const tickBot = reglaY + 22;
      svg.appendChild(rc.line(x, tickTop, x, tickBot, {
        stroke: '#78350f', strokeWidth: 1.5, roughness: 0.3,
      }));

      // Número debajo
      txt(svg, x, reglaY + reglaH + 16, v.toString(), {
        size: 11, fill: '#334155',
      });
    }

    // ── Unidad ──
    txt(svg, margen + reglaW + 22, reglaY + reglaH / 2 + 5, unidad, {
      size: 14, weight: 'bold', fill: '#a16207',
    });

    // ── Marcas destacadas ──
    marcas.forEach((marca) => {
      const x = margen + (marca.posicion - inicio) * scale;
      const color = resolveColor(marca.color, roughColors.rojo);

      // Línea vertical desde arriba de la regla
      svg.appendChild(rc.line(x, reglaY - 18, x, reglaY + 2, {
        stroke: color, strokeWidth: 2.5, roughness: 0.4,
      }));

      // Triángulo apuntando abajo
      svg.appendChild(rc.polygon(
        [[x - 7, reglaY - 18], [x + 7, reglaY - 18], [x, reglaY - 4]],
        { fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 1, roughness: 0.4 }
      ));

      // Etiqueta arriba
      if (marca.etiqueta) {
        // Fondo pill
        const pillW = marca.etiqueta.length * 8 + 16;
        svg.appendChild(rc.rectangle(x - pillW / 2, reglaY - 42, pillW, 20, {
          roughness: 0.4, strokeWidth: 1.5, stroke: color,
          fill: color, fillStyle: 'solid',
        }));
        txt(svg, x, reglaY - 28, marca.etiqueta, {
          size: 11, weight: 'bold', fill: '#ffffff',
        });
      }
    });

    // ── Flecha de medición entre 2 marcas ──
    if (marcas.length >= 2) {
      const sorted = [...marcas].sort((a, b) => a.posicion - b.posicion);
      const x1 = margen + (sorted[0].posicion - inicio) * scale;
      const x2 = margen + (sorted[sorted.length - 1].posicion - inicio) * scale;
      const arrowY = reglaY + reglaH + 28;

      // Línea horizontal
      svg.appendChild(rc.line(x1, arrowY, x2, arrowY, {
        stroke: roughColors.azul, strokeWidth: 2, roughness: 0.5,
      }));
      // Puntas
      svg.appendChild(rc.polygon(
        [[x1, arrowY], [x1 + 8, arrowY - 4], [x1 + 8, arrowY + 4]],
        { fill: roughColors.azul, fillStyle: 'solid', strokeWidth: 0.5, roughness: 0.3 }
      ));
      svg.appendChild(rc.polygon(
        [[x2, arrowY], [x2 - 8, arrowY - 4], [x2 - 8, arrowY + 4]],
        { fill: roughColors.azul, fillStyle: 'solid', strokeWidth: 0.5, roughness: 0.3 }
      ));

      // Valor de medición
      const dist = sorted[sorted.length - 1].posicion - sorted[0].posicion;
      txt(svg, (x1 + x2) / 2, arrowY + 16, `${dist} ${unidad}`, {
        size: 13, weight: 'bold', fill: roughColors.azul,
      });
    }

    // ── Objeto a medir ──
    if (objetoMedir) {
      const objY = marcas.length >= 2 ? reglaY + reglaH + 50 : reglaY + reglaH + 30;
      txt(svg, totalW / 2, objY, `📏 ${objetoMedir}`, {
        size: 14, fill: '#64748b',
      });
    }
  }, [data]);

  const dynamicH = reglaY + reglaH + 30
    + (marcas.length >= 2 ? 35 : 0)
    + (objetoMedir ? 28 : 0)
    + 10;

  return (
    <div className="regla-medicion-container" style={{
      padding: 16, background: '#fff', borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)', margin: '16px 0',
      display: 'flex', justifyContent: 'center',
    }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${totalW} ${dynamicH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', maxWidth: `${totalW}px`, height: 'auto' }}
      />
    </div>
  );
};
