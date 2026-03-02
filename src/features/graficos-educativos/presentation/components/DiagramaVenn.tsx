import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoDiagramaVenn } from '../../domain/types';
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoDiagramaVenn;
}

/**
 * Componente para diagramas de Venn
 * Para enseñar teoría de conjuntos e intersecciones
 */
export const DiagramaVenn: React.FC<Props> = ({ data }) => {
  const { elementos, interseccion = [] } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || elementos.length === 0) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const radio = 100;
    const centerY = 150;

    if (elementos.length === 2) {
      // Dos conjuntos
      const centerX1 = 120;
      const centerX2 = 200;

      const color1 = resolveColor(elementos[0].color, roughColors.azul);
      const color2 = resolveColor(elementos[1].color, roughColors.rojo);

      // Círculo 1
      const circulo1 = rc.circle(centerX1, centerY, radio * 2, {
        stroke: color1,
        fill: color1,
        fillStyle: 'solid',
        strokeWidth: 2.5,
        roughness: 0.8
      });
      circulo1.setAttribute('opacity', '0.25');
      svgRef.current.appendChild(circulo1);

      // Círculo 2
      const circulo2 = rc.circle(centerX2, centerY, radio * 2, {
        stroke: color2,
        fill: color2,
        fillStyle: 'solid',
        strokeWidth: 2.5,
        roughness: 0.8
      });
      circulo2.setAttribute('opacity', '0.25');
      svgRef.current.appendChild(circulo2);

      // Bordes encima (opacos) para definir bien los círculos
      svgRef.current.appendChild(rc.circle(centerX1, centerY, radio * 2, {
        stroke: color1, strokeWidth: 2.5, roughness: 0.8, fill: 'none',
      }));
      svgRef.current.appendChild(rc.circle(centerX2, centerY, radio * 2, {
        stroke: color2, strokeWidth: 2.5, roughness: 0.8, fill: 'none',
      }));

      // Nombre conjunto 1
      const nombre1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nombre1.setAttribute('x', (centerX1 - 40).toString());
      nombre1.setAttribute('y', '50');
      nombre1.setAttribute('font-size', '16');
      nombre1.setAttribute('font-weight', 'bold');
      nombre1.setAttribute('font-family', 'Comic Sans MS, cursive');
      nombre1.setAttribute('fill', color1);
      nombre1.textContent = elementos[0].nombre;
      svgRef.current.appendChild(nombre1);

      // Nombre conjunto 2
      const nombre2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nombre2.setAttribute('x', (centerX2 + 20).toString());
      nombre2.setAttribute('y', '50');
      nombre2.setAttribute('font-size', '16');
      nombre2.setAttribute('font-weight', 'bold');
      nombre2.setAttribute('font-family', 'Comic Sans MS, cursive');
      nombre2.setAttribute('fill', color2);
      nombre2.textContent = elementos[1].nombre;
      svgRef.current.appendChild(nombre2);

      // Elementos únicos del conjunto 1
      const unicosSet1 = elementos[0].elementos.filter(e => !interseccion.includes(e));
      unicosSet1.forEach((elem, idx) => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (centerX1 - 50).toString());
        text.setAttribute('y', (centerY - 20 + idx * 20).toString());
        text.setAttribute('font-size', '13');
        text.setAttribute('font-family', 'Arial');
        text.setAttribute('fill', '#1e293b');
        text.textContent = elem;
        svgRef.current!.appendChild(text);
      });

      // Elementos únicos del conjunto 2
      const unicosSet2 = elementos[1].elementos.filter(e => !interseccion.includes(e));
      unicosSet2.forEach((elem, idx) => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (centerX2 + 20).toString());
        text.setAttribute('y', (centerY - 20 + idx * 20).toString());
        text.setAttribute('font-size', '13');
        text.setAttribute('font-family', 'Arial');
        text.setAttribute('fill', '#1e293b');
        text.textContent = elem;
        svgRef.current!.appendChild(text);
      });

      // Elementos de la intersección
      if (interseccion.length > 0) {
        interseccion.forEach((elem, idx) => {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', ((centerX1 + centerX2) / 2).toString());
          text.setAttribute('y', (centerY - 10 + idx * 18).toString());
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('font-size', '13');
          text.setAttribute('font-weight', 'bold');
          text.setAttribute('font-family', 'Arial');
          text.setAttribute('fill', '#1e293b');
          text.textContent = elem;
          svgRef.current!.appendChild(text);
        });
      }

    } else if (elementos.length === 3) {
      // Tres conjuntos (disposición triangular)
      const centerX1 = 160;
      const centerX2 = 240;
      const centerY1 = 120;
      const centerY2 = 200;

      const color1 = resolveColor(elementos[0].color, roughColors.azul);
      const color2 = resolveColor(elementos[1].color, roughColors.rojo);
      const color3 = resolveColor(elementos[2].color, roughColors.amarillo);

      // Círculo 1
      const circulo1 = rc.circle(centerX1, centerY1, radio * 2, {
        stroke: color1,
        fill: color1,
        fillStyle: 'solid',
        strokeWidth: 2.5,
        roughness: 0.8
      });
      circulo1.setAttribute('opacity', '0.25');
      svgRef.current.appendChild(circulo1);

      // Círculo 2
      const circulo2 = rc.circle(centerX2, centerY1, radio * 2, {
        stroke: color2,
        fill: color2,
        fillStyle: 'solid',
        strokeWidth: 2.5,
        roughness: 0.8
      });
      circulo2.setAttribute('opacity', '0.25');
      svgRef.current.appendChild(circulo2);

      // Círculo 3
      const circulo3 = rc.circle((centerX1 + centerX2) / 2, centerY2, radio * 2, {
        stroke: color3,
        fill: color3,
        fillStyle: 'solid',
        strokeWidth: 2.5,
        roughness: 0.8
      });
      circulo3.setAttribute('opacity', '0.25');
      svgRef.current.appendChild(circulo3);

      // Bordes opacos encima
      svgRef.current.appendChild(rc.circle(centerX1, centerY1, radio * 2, {
        stroke: color1, strokeWidth: 2.5, roughness: 0.8, fill: 'none',
      }));
      svgRef.current.appendChild(rc.circle(centerX2, centerY1, radio * 2, {
        stroke: color2, strokeWidth: 2.5, roughness: 0.8, fill: 'none',
      }));
      svgRef.current.appendChild(rc.circle((centerX1 + centerX2) / 2, centerY2, radio * 2, {
        stroke: color3, strokeWidth: 2.5, roughness: 0.8, fill: 'none',
      }));

      // Nombres de conjuntos
      [elementos[0].nombre, elementos[1].nombre, elementos[2].nombre].forEach((nombre, idx) => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const positions = [
          { x: centerX1 - 60, y: 50 },
          { x: centerX2 + 20, y: 50 },
          { x: (centerX1 + centerX2) / 2 - 20, y: 320 }
        ];
        text.setAttribute('x', positions[idx].x.toString());
        text.setAttribute('y', positions[idx].y.toString());
        text.setAttribute('font-size', '16');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-family', 'Comic Sans MS, cursive');
        text.setAttribute('fill', [color1, color2, color3][idx]);
        text.textContent = nombre;
        svgRef.current!.appendChild(text);
      });
    }

  }, [data]);

  const width = elementos.length === 3 ? 400 : 340;
  const height = elementos.length === 3 ? 350 : 300;

  return (
    <div className="diagrama-venn-container">
      <svg 
        ref={svgRef} 
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }}
      />
    </div>
  );
};
