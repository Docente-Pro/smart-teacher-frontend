import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoRectaFraccion } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoRectaFraccion;
}

export const RectaFraccion: React.FC<Props> = ({ data }) => {
  const { inicio, fin, denominadorBase, marcas, mostrarDivisiones = true } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || marcas.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const margen = 60;
    const lineY = 100;
    const totalW = 500;
    const lineW = totalW - margen * 2;
    const rango = fin - inicio;

    // Recta principal
    svgRef.current.appendChild(rc.line(margen, lineY, totalW - margen, lineY, {
      stroke: '#2C3E50', strokeWidth: 3, roughness: 0.8,
    }));

    // Flechas en los extremos
    svgRef.current.appendChild(rc.line(margen, lineY, margen + 10, lineY - 6, { stroke: '#2C3E50', strokeWidth: 2, roughness: 0.5 }));
    svgRef.current.appendChild(rc.line(margen, lineY, margen + 10, lineY + 6, { stroke: '#2C3E50', strokeWidth: 2, roughness: 0.5 }));
    svgRef.current.appendChild(rc.line(totalW - margen, lineY, totalW - margen - 10, lineY - 6, { stroke: '#2C3E50', strokeWidth: 2, roughness: 0.5 }));
    svgRef.current.appendChild(rc.line(totalW - margen, lineY, totalW - margen - 10, lineY + 6, { stroke: '#2C3E50', strokeWidth: 2, roughness: 0.5 }));

    // Divisiones del denominador base
    if (mostrarDivisiones && denominadorBase) {
      const totalDivisions = Math.round(rango * denominadorBase);
      for (let i = 0; i <= totalDivisions; i++) {
        const x = margen + (i / totalDivisions) * lineW;
        const isMajor = i % denominadorBase === 0;
        const tickH = isMajor ? 15 : 8;
        svgRef.current.appendChild(rc.line(x, lineY - tickH, x, lineY + tickH, {
          stroke: '#94a3b8', strokeWidth: isMajor ? 2 : 1, roughness: 0.3,
        }));

        // Números enteros
        if (isMajor) {
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          t.setAttribute('x', x.toString());
          t.setAttribute('y', (lineY + 30).toString());
          t.setAttribute('text-anchor', 'middle');
          t.setAttribute('font-size', '13');
          t.setAttribute('font-weight', 'bold');
          t.setAttribute('font-family', 'Comic Sans MS, cursive');
          t.setAttribute('fill', '#1e293b');
          t.textContent = (inicio + i / denominadorBase).toString();
          svgRef.current.appendChild(t);
        }
      }
    }

    // Marcas de fracciones
    marcas.forEach((marca) => {
      const frac = (marca.posicion - inicio) / rango;
      const x = margen + frac * lineW;
      const color = marca.color || roughColors.rojo;

      // Punto
      svgRef.current!.appendChild(rc.circle(x, lineY, 14, {
        fill: color, fillStyle: 'solid', stroke: color, strokeWidth: 2, roughness: 0.5,
      }));

      // Etiqueta de fracción arriba
      const fracText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      fracText.setAttribute('x', x.toString());
      fracText.setAttribute('y', (lineY - 25).toString());
      fracText.setAttribute('text-anchor', 'middle');
      fracText.setAttribute('font-size', '16');
      fracText.setAttribute('font-weight', 'bold');
      fracText.setAttribute('font-family', 'Comic Sans MS, cursive');
      fracText.setAttribute('fill', color);
      fracText.textContent = marca.etiqueta || `${marca.numerador}/${marca.denominador}`;
      svgRef.current!.appendChild(fracText);
    });
  }, [data]);

  return (
    <div className="recta-fraccion-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox="0 0 500 160" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: '500px', height: 'auto' }} />
    </div>
  );
};
