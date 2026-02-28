import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoRedesCuerpos } from '../../domain/types';
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoRedesCuerpos;
}

export const RedesCuerpos: React.FC<Props> = ({ data }) => {
  const { redes } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || redes.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const margen = 30;

    redes.forEach((red, redIdx) => {
      const offsetX = margen + redIdx * 280;
      const offsetY = 40;
      const color = resolveColor('azul');

      // Título del cuerpo
      const titulo = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      titulo.setAttribute('x', (offsetX + 100).toString());
      titulo.setAttribute('y', '25');
      titulo.setAttribute('text-anchor', 'middle');
      titulo.setAttribute('font-size', '15');
      titulo.setAttribute('font-weight', 'bold');
      titulo.setAttribute('font-family', 'Comic Sans MS, cursive');
      titulo.setAttribute('fill', resolveColor('azul'));
      titulo.textContent = `Red: ${red.cuerpo}`;
      svgRef.current!.appendChild(titulo);

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

  const width = redes.length * 280 + 60;

  return (
    <div className="redes-cuerpos-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} 280`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
