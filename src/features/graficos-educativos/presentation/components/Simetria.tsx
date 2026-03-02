import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoSimetria } from '../../domain/types';
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoSimetria;
}

export const Simetria: React.FC<Props> = ({ data }) => {
  const { figuraOriginal, ejeSimetria, mostrarEje = true, mostrarReflejo = true, cuadricula = true } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const svgW = 400;
    const svgH = 300;
    const centerX = svgW / 2;
    const centerY = svgH / 2;
    const cellSize = 20;

    // Cuadrícula
    if (cuadricula) {
      for (let x = 0; x <= svgW; x += cellSize) {
        svgRef.current.appendChild(rc.line(x, 0, x, svgH, { stroke: '#e2e8f0', strokeWidth: 0.5, roughness: 0 }));
      }
      for (let y = 0; y <= svgH; y += cellSize) {
        svgRef.current.appendChild(rc.line(0, y, svgW, y, { stroke: '#e2e8f0', strokeWidth: 0.5, roughness: 0 }));
      }
    }

    // Eje de simetría
    if (mostrarEje) {
      let lineParams: [number, number, number, number];
      if (ejeSimetria === 'vertical') {
        lineParams = [centerX, 0, centerX, svgH];
      } else if (ejeSimetria === 'horizontal') {
        lineParams = [0, centerY, svgW, centerY];
      } else {
        lineParams = [0, 0, svgW, svgH];
      }
      svgRef.current.appendChild(rc.line(...lineParams, {
        stroke: roughColors.rojo, strokeWidth: 2.5, roughness: 0.5,
      }));
    }

    // Dibujar figura original
    const color = resolveColor(figuraOriginal.color, roughColors.azul);
    const puntos = figuraOriginal.puntos || [];

    if (puntos.length >= 2) {
      const scaledPoints = puntos.map(p => [centerX / 2 + p.x * cellSize, centerY + p.y * cellSize] as [number, number]);
      svgRef.current.appendChild(rc.polygon(scaledPoints, {
        ...defaultRoughConfig, stroke: color, fill: color, fillStyle: 'solid', strokeWidth: 2.5, roughness: 0.8,
      }));

      // Reflejo
      if (mostrarReflejo) {
        const reflected = scaledPoints.map(([px, py]) => {
          if (ejeSimetria === 'vertical') return [2 * centerX - px, py] as [number, number];
          if (ejeSimetria === 'horizontal') return [px, 2 * centerY - py] as [number, number];
          // Diagonal: reflect across y=x
          return [py, px] as [number, number];
        });
        svgRef.current.appendChild(rc.polygon(reflected, {
          ...defaultRoughConfig, stroke: roughColors.verde, fill: roughColors.verde, fillStyle: 'solid', strokeWidth: 2.5, roughness: 0.8,
        }));
      }
    }

    // Etiquetas
    const origLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    origLabel.setAttribute('x', (svgW / 4).toString());
    origLabel.setAttribute('y', '20');
    origLabel.setAttribute('text-anchor', 'middle');
    origLabel.setAttribute('font-size', '13');
    origLabel.setAttribute('font-weight', 'bold');
    origLabel.setAttribute('font-family', 'Comic Sans MS, cursive');
    origLabel.setAttribute('fill', color);
    // Mostrar tipo de figura si viene en el contrato
    const tipoLabel = figuraOriginal.tipo ? `Original (${figuraOriginal.tipo})` : 'Original';
    origLabel.textContent = tipoLabel;
    svgRef.current.appendChild(origLabel);

    if (mostrarReflejo) {
      const refLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      refLabel.setAttribute('x', (3 * svgW / 4).toString());
      refLabel.setAttribute('y', '20');
      refLabel.setAttribute('text-anchor', 'middle');
      refLabel.setAttribute('font-size', '13');
      refLabel.setAttribute('font-weight', 'bold');
      refLabel.setAttribute('font-family', 'Comic Sans MS, cursive');
      refLabel.setAttribute('fill', roughColors.verde);
      refLabel.textContent = 'Reflejo';
      svgRef.current.appendChild(refLabel);
    }
  }, [data]);

  return (
    <div className="simetria-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: '400px', height: 'auto' }} />
    </div>
  );
};
