import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoArbolFactores, NodoFactor } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoArbolFactores;
}

export const ArbolFactores: React.FC<Props> = ({ data }) => {
  const { numero, arbol, mostrarPrimos = true, resultado } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const nodeR = 22;
    const levelH = 70;

    // Calcular profundidad y ancho del árbol
    const getDepth = (node: NodoFactor): number => {
      if (!node.hijos || node.hijos.length === 0) return 1;
      return 1 + Math.max(...node.hijos.map(getDepth));
    };
    const getWidth = (node: NodoFactor): number => {
      if (!node.hijos || node.hijos.length === 0) return 1;
      return node.hijos.reduce((sum, h) => sum + getWidth(h), 0);
    };

    const depth = getDepth(arbol);
    const totalLeaves = getWidth(arbol);
    const svgW = Math.max(totalLeaves * 70, 200);
    const svgH = depth * levelH + 60;

    const drawNode = (node: NodoFactor, cx: number, cy: number, leftX: number, rightX: number) => {
      const color = node.esPrimo ? roughColors.rojo : roughColors.azul;

      svgRef.current!.appendChild(rc.circle(cx, cy, nodeR * 2, {
        ...defaultRoughConfig, stroke: color, fill: color, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
      }));

      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', cx.toString());
      t.setAttribute('y', (cy + 5).toString());
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '16');
      t.setAttribute('font-weight', 'bold');
      t.setAttribute('font-family', 'Comic Sans MS, cursive');
      t.setAttribute('fill', '#fff');
      t.textContent = node.valor.toString();
      svgRef.current!.appendChild(t);

      if (node.hijos && node.hijos.length > 0) {
        const childWidth = (rightX - leftX) / node.hijos.length;
        node.hijos.forEach((hijo, idx) => {
          const childLeft = leftX + idx * childWidth;
          const childRight = childLeft + childWidth;
          const childCx = (childLeft + childRight) / 2;
          const childCy = cy + levelH;

          // Línea al hijo
          svgRef.current!.appendChild(rc.line(cx, cy + nodeR, childCx, childCy - nodeR, {
            stroke: '#64748b', strokeWidth: 2, roughness: 0.8,
          }));

          drawNode(hijo, childCx, childCy, childLeft, childRight);
        });
      }
    };

    drawNode(arbol, svgW / 2, 40, 0, svgW);

    // Resultado
    if (resultado) {
      const rt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      rt.setAttribute('x', (svgW / 2).toString());
      rt.setAttribute('y', (svgH - 5).toString());
      rt.setAttribute('text-anchor', 'middle');
      rt.setAttribute('font-size', '15');
      rt.setAttribute('font-weight', 'bold');
      rt.setAttribute('font-family', 'Comic Sans MS, cursive');
      rt.setAttribute('fill', roughColors.verde);
      rt.textContent = resultado;
      svgRef.current.appendChild(rt);
    }

    // Ajustar viewBox
    svgRef.current.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  }, [data]);

  return (
    <div className="arbol-factores-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: '400px', height: 'auto' }} />
    </div>
  );
};
