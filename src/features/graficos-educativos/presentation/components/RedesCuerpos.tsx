import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoRedesCuerpos } from '../../domain/types';
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';
import { estimateTextWidth, createSVGText } from '../utils/svgTextUtils';

interface Props {
  data: GraficoRedesCuerpos;
}

export const RedesCuerpos: React.FC<Props> = ({ data }) => {
  const { redes, mostrarCuerpo3D = false, mostrarDobleces = false } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || redes.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const margen = 30;
    // Espaciado dinámico según títulos de cuerpos
    const titulos = redes.map(r => `Red: ${r.cuerpo}`);
    const maxTitleW = Math.max(...titulos.map(t => estimateTextWidth(t, 15)));
    const netSpacing = Math.max(280, maxTitleW + 100);

    redes.forEach((red, redIdx) => {
      const offsetX = margen + redIdx * netSpacing;
      const offsetY = 40;
      const color = resolveColor('azul');

      // Título del cuerpo
      const tituloEl = createSVGText({
        x: offsetX + 100, y: 25, text: `Red: ${red.cuerpo}`,
        fontSize: 15, fontWeight: '700', fill: resolveColor('azul'),
        maxCharsPerLine: 22, lineHeight: 17,
      });
      svgRef.current!.appendChild(tituloEl);

      // Dibujar red predefinida según tipo de cuerpo
      if (red.cuerpo === 'cubo') {
        // Cruz de 6 cuadrados
        const s = 50;
        const positions = [
          [1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2],
        ];
        positions.forEach(([col, row], i) => {
          const x = offsetX + col * s;
          const y = offsetY + row * s;
          const c = resolveColor(red.caras[i]?.color) || [roughColors.azul, roughColors.rojo, roughColors.verde, roughColors.amarillo, roughColors.naranja, roughColors.morado][i % 6];
          svgRef.current!.appendChild(rc.rectangle(x, y, s, s, {
            ...defaultRoughConfig, stroke: c, fill: c, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
          }));
        });
      } else if (red.cuerpo === 'piramide') {
        // Base cuadrada + 4 triángulos
        const s = 60;
        const bx = offsetX + 30;
        const by = offsetY + 80;
        svgRef.current!.appendChild(rc.rectangle(bx, by, s, s, {
          ...defaultRoughConfig, stroke: color, fill: roughColors.amarillo, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
        }));
        // Triángulos
        const triColor = roughColors.verde;
        // Top
        svgRef.current!.appendChild(rc.polygon([[bx, by], [bx + s, by], [bx + s / 2, by - s * 0.8]], {
          ...defaultRoughConfig, stroke: triColor, fill: triColor, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
        }));
        // Bottom
        svgRef.current!.appendChild(rc.polygon([[bx, by + s], [bx + s, by + s], [bx + s / 2, by + s + s * 0.8]], {
          ...defaultRoughConfig, stroke: triColor, fill: triColor, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
        }));
        // Left
        svgRef.current!.appendChild(rc.polygon([[bx, by], [bx, by + s], [bx - s * 0.8, by + s / 2]], {
          ...defaultRoughConfig, stroke: triColor, fill: triColor, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
        }));
        // Right
        svgRef.current!.appendChild(rc.polygon([[bx + s, by], [bx + s, by + s], [bx + s + s * 0.8, by + s / 2]], {
          ...defaultRoughConfig, stroke: triColor, fill: triColor, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
        }));
      } else {
        // Generic: draw caras como rectángulos
        red.caras.forEach((cara, i) => {
          const x = cara.posicion?.x || offsetX + (i % 3) * 60;
          const y = cara.posicion?.y || offsetY + Math.floor(i / 3) * 60;
          const w = cara.dimensiones?.ancho || 50;
          const h = cara.dimensiones?.alto || 50;
          const c = resolveColor(cara.color) || color;
          svgRef.current!.appendChild(rc.rectangle(x, y, w, h, {
            ...defaultRoughConfig, stroke: c, fill: c, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
          }));
        });
      }
    });
  }, [data]);

  const titulosRender = redes.map(r => `Red: ${r.cuerpo}`);
  const maxTitleWR = Math.max(0, ...titulosRender.map(t => estimateTextWidth(t, 15)));
  const dynNetSpacing = Math.max(280, maxTitleWR + 100);
  const width = redes.length * dynNetSpacing + 60;
  const height = mostrarCuerpo3D ? 330 : 280;

  return (
    <div className="redes-cuerpos-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {mostrarDobleces && (
        <p style={{ fontFamily: 'Comic Sans MS, cursive', fontSize: 12, color: '#64748b', marginBottom: 8 }}>
          ✂️ Líneas de dobleces mostradas
        </p>
      )}
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
