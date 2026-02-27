import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoConversionMedidas } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoConversionMedidas;
}

export const ConversionMedidas: React.FC<Props> = ({ data }) => {
  const { conversiones, tipo, mostrarEscalera = false } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || conversiones.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const margen = 30;
    const boxW = 120;
    const boxH = 50;
    const arrowW = 80;
    const startY = 40;

    conversiones.forEach((conv, idx) => {
      const y = startY + idx * 80;

      // Caja origen
      const x1 = margen;
      svgRef.current!.appendChild(rc.rectangle(x1, y, boxW, boxH, {
        ...defaultRoughConfig, stroke: roughColors.azul, fill: roughColors.azul, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
      }));
      const t1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t1.setAttribute('x', (x1 + boxW / 2).toString());
      t1.setAttribute('y', (y + boxH / 2 + 5).toString());
      t1.setAttribute('text-anchor', 'middle');
      t1.setAttribute('font-size', '14');
      t1.setAttribute('font-weight', 'bold');
      t1.setAttribute('font-family', 'Comic Sans MS, cursive');
      t1.setAttribute('fill', '#fff');
      svgRef.current!.appendChild(t1);

      // Flecha
      const arrowX1 = x1 + boxW + 10;
      const arrowX2 = arrowX1 + arrowW;
      const arrowY = y + boxH / 2;
      svgRef.current!.appendChild(rc.line(arrowX1, arrowY, arrowX2, arrowY, {
        stroke: roughColors.verde, strokeWidth: 3, roughness: 0.8,
      }));
      // Punta flecha
      svgRef.current!.appendChild(rc.line(arrowX2 - 10, arrowY - 8, arrowX2, arrowY, { stroke: roughColors.verde, strokeWidth: 3, roughness: 0.5 }));
      svgRef.current!.appendChild(rc.line(arrowX2 - 10, arrowY + 8, arrowX2, arrowY, { stroke: roughColors.verde, strokeWidth: 3, roughness: 0.5 }));

      // Factor
      if (conv.factor) {
        const ft = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        ft.setAttribute('x', ((arrowX1 + arrowX2) / 2).toString());
        ft.setAttribute('y', (arrowY - 10).toString());
        ft.setAttribute('text-anchor', 'middle');
        ft.setAttribute('font-size', '12');
        ft.setAttribute('font-family', 'Comic Sans MS, cursive');
        ft.setAttribute('fill', roughColors.verde);
        ft.textContent = conv.factor;
        svgRef.current!.appendChild(ft);
      }

      // Caja destino
      const x2 = arrowX2 + 10;
      svgRef.current!.appendChild(rc.rectangle(x2, y, boxW, boxH, {
        ...defaultRoughConfig, stroke: roughColors.rojo, fill: roughColors.rojo, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
      }));
      const t2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t2.setAttribute('x', (x2 + boxW / 2).toString());
      t2.setAttribute('y', (y + boxH / 2 + 5).toString());
      t2.setAttribute('text-anchor', 'middle');
      t2.setAttribute('font-size', '14');
      t2.setAttribute('font-weight', 'bold');
      t2.setAttribute('font-family', 'Comic Sans MS, cursive');
      t2.setAttribute('fill', '#fff');
      t2.textContent = `${conv.hasta.valor} ${conv.hasta.unidad}`;
      svgRef.current!.appendChild(t2);
    });
  }, [data]);

  const width = 420;
  const height = conversiones.length * 80 + 60;

  return (
    <div className="conversion-medidas-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
