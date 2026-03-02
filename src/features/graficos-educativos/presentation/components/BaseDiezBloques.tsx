import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoBaseDiezBloques } from '../../domain/types';
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoBaseDiezBloques;
}

export const BaseDiezBloques: React.FC<Props> = ({ data }) => {
  const { numero, bloques, mostrarTotal = true, agrupacion = false } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    let cursorX = 30;
    const startY = 30;
    const unitSize = 16;
    const gap = 6;

    bloques.forEach((bloque) => {
      const color = resolveColor(bloque.color, roughColors.azul);

      if (bloque.tipo === 'placa') {
        // 100: cuadrado 10x10
        for (let c = 0; c < bloque.cantidad; c++) {
          for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
              const rect = rc.rectangle(
                cursorX + col * unitSize,
                startY + row * unitSize,
                unitSize - 1,
                unitSize - 1,
                { ...defaultRoughConfig, stroke: color, fill: color, fillStyle: 'solid', strokeWidth: 1, roughness: 0.4 }
              );
              svgRef.current!.appendChild(rect);
            }
          }
          // Etiqueta
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          t.setAttribute('x', (cursorX + 80).toString());
          t.setAttribute('y', (startY + 10 * unitSize + 20).toString());
          t.setAttribute('text-anchor', 'middle');
          t.setAttribute('font-size', '14');
          t.setAttribute('font-weight', 'bold');
          t.setAttribute('font-family', 'Comic Sans MS, cursive');
          t.setAttribute('fill', color);
          t.textContent = '100';
          svgRef.current!.appendChild(t);
          cursorX += 10 * unitSize + gap * 3;
        }
      } else if (bloque.tipo === 'barra') {
        // 10: barra vertical de 10
        for (let c = 0; c < bloque.cantidad; c++) {
          for (let row = 0; row < 10; row++) {
            const rect = rc.rectangle(cursorX, startY + row * unitSize, unitSize - 1, unitSize - 1, {
              ...defaultRoughConfig, stroke: color, fill: color, fillStyle: 'solid', strokeWidth: 1, roughness: 0.4,
            });
            svgRef.current!.appendChild(rect);
          }
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          t.setAttribute('x', (cursorX + unitSize / 2).toString());
          t.setAttribute('y', (startY + 10 * unitSize + 20).toString());
          t.setAttribute('text-anchor', 'middle');
          t.setAttribute('font-size', '12');
          t.setAttribute('font-weight', 'bold');
          t.setAttribute('font-family', 'Comic Sans MS, cursive');
          t.setAttribute('fill', color);
          t.textContent = '10';
          svgRef.current!.appendChild(t);
          cursorX += unitSize + gap;
        }
        cursorX += gap * 2;
      } else if (bloque.tipo === 'unidad') {
        // 1: cubos individuales
        for (let c = 0; c < bloque.cantidad; c++) {
          const rect = rc.rectangle(cursorX, startY + 9 * unitSize, unitSize - 1, unitSize - 1, {
            ...defaultRoughConfig, stroke: color, fill: color, fillStyle: 'solid', strokeWidth: 1, roughness: 0.4,
          });
          svgRef.current!.appendChild(rect);
          cursorX += unitSize + gap / 2;
        }
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', (cursorX - (bloque.cantidad * (unitSize + gap / 2)) / 2).toString());
        t.setAttribute('y', (startY + 10 * unitSize + 20).toString());
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('font-size', '12');
        t.setAttribute('font-weight', 'bold');
        t.setAttribute('font-family', 'Comic Sans MS, cursive');
        t.setAttribute('fill', color);
        t.textContent = bloque.cantidad.toString();
        svgRef.current!.appendChild(t);
        cursorX += gap * 2;
      } else if (bloque.tipo === 'cubo') {
        // 1000
        const cuboSize = 10 * unitSize;
        const cubo = rc.rectangle(cursorX, startY, cuboSize, cuboSize, {
          ...defaultRoughConfig, stroke: color, fill: color, fillStyle: 'solid', strokeWidth: 3, roughness: 0.8,
        });
        svgRef.current!.appendChild(cubo);
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', (cursorX + cuboSize / 2).toString());
        t.setAttribute('y', (startY + cuboSize / 2 + 6).toString());
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('font-size', '20');
        t.setAttribute('font-weight', 'bold');
        t.setAttribute('font-family', 'Comic Sans MS, cursive');
        t.setAttribute('fill', '#fff');
        t.textContent = '1000';
        svgRef.current!.appendChild(t);
        cursorX += cuboSize + gap * 3;
      }
    });

    // Total
    if (mostrarTotal) {
      const totalText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      totalText.setAttribute('x', (cursorX / 2).toString());
      totalText.setAttribute('y', (startY + 10 * unitSize + 50).toString());
      totalText.setAttribute('text-anchor', 'middle');
      totalText.setAttribute('font-size', '22');
      totalText.setAttribute('font-weight', 'bold');
      totalText.setAttribute('font-family', 'Comic Sans MS, cursive');
      totalText.setAttribute('fill', roughColors.azul);
      totalText.textContent = `= ${numero}`;
      svgRef.current.appendChild(totalText);
    }

    // Indicador de agrupación
    if (agrupacion) {
      const agrupText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      agrupText.setAttribute('x', (cursorX / 2).toString());
      agrupText.setAttribute('y', (startY + 10 * unitSize + (mostrarTotal ? 75 : 50)).toString());
      agrupText.setAttribute('text-anchor', 'middle');
      agrupText.setAttribute('font-size', '14');
      agrupText.setAttribute('font-family', 'Comic Sans MS, cursive');
      agrupText.setAttribute('fill', '#64748b');
      agrupText.textContent = '📦 Con agrupación';
      svgRef.current.appendChild(agrupText);
    }
  }, [data]);

  // Estimate width based on bloques
  let estimatedWidth = 60;
  bloques.forEach((b) => {
    if (b.tipo === 'placa') estimatedWidth += b.cantidad * 180;
    else if (b.tipo === 'barra') estimatedWidth += b.cantidad * 22 + 20;
    else if (b.tipo === 'unidad') estimatedWidth += b.cantidad * 18 + 20;
    else if (b.tipo === 'cubo') estimatedWidth += b.cantidad * 180;
  });
  const width = Math.max(estimatedWidth, 300);

  return (
    <div className="base-diez-bloques-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${mostrarTotal ? 260 : 220}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
