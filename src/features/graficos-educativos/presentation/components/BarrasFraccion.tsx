import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoBarrasFraccion } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoBarrasFraccion;
}

/**
 * Componente para representar fracciones con barras
 * Permite comparación visual de fracciones
 */
export const BarrasFraccion: React.FC<Props> = ({ data }) => {
  const { elementos, orientacion: _orientacion = 'horizontal' } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const anchoBarra = 300;
    const altoBarra = 50;
    const espacioEntreBarras = 80;
    const margen = 60;

    elementos.forEach((fraccion, idx) => {
      const y = margen + (idx * espacioEntreBarras);
      const color = roughColors[fraccion.color] || roughColors.azul;
      const { numerador, denominador } = fraccion;

      // Barra completa (fondo)
      const barraCompleta = rc.rectangle(margen, y, anchoBarra, altoBarra, {
        ...defaultRoughConfig,
        strokeWidth: 3,
        roughness: 0.8
      });
      svgRef.current!.appendChild(barraCompleta);

      // Dividir la barra en secciones
      const anchoSeccion = anchoBarra / denominador;

      for (let i = 0; i < denominador; i++) {
        const x = margen + (i * anchoSeccion);

        // Línea divisoria
        if (i > 0) {
          const linea = rc.line(x, y, x, y + altoBarra, {
            ...defaultRoughConfig,
            strokeWidth: 1.5,
            roughness: 0.8
          });
          svgRef.current!.appendChild(linea);
        }

        // Rellenar secciones del numerador
        if (i < numerador) {
          const seccionRellena = rc.rectangle(x + 2, y + 2, anchoSeccion - 4, altoBarra - 4, {
            ...defaultRoughConfig,
            fill: color,
            fillStyle: 'cross-hatch',
            fillWeight: 1.5,
            strokeWidth: 0,
            roughness: 1
          });
          svgRef.current!.appendChild(seccionRellena);
        }
      }

      // Etiqueta de la fracción
      const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelText.setAttribute('x', (margen + anchoBarra + 20).toString());
      labelText.setAttribute('y', (y + altoBarra / 2 + 5).toString());
      labelText.setAttribute('text-anchor', 'start');
      labelText.setAttribute('font-size', '20');
      labelText.setAttribute('font-weight', 'bold');
      labelText.setAttribute('font-family', 'Comic Sans MS, cursive');
      labelText.setAttribute('fill', '#1e293b');
      labelText.textContent = `${numerador}/${denominador}`;
      svgRef.current!.appendChild(labelText);

      // Etiqueta personalizada
      if (fraccion.etiqueta) {
        const etiqueta = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        etiqueta.setAttribute('x', margen.toString());
        etiqueta.setAttribute('y', (y - 8).toString());
        etiqueta.setAttribute('text-anchor', 'start');
        etiqueta.setAttribute('font-size', '14');
        etiqueta.setAttribute('font-family', 'Comic Sans MS, cursive');
        etiqueta.setAttribute('fill', '#64748b');
        etiqueta.textContent = fraccion.etiqueta;
        svgRef.current!.appendChild(etiqueta);
      }
    });

  }, [data]);

  const height = 60 + (elementos.length * 80);

  return (
    <div className="barras-fraccion-container">
      <svg ref={svgRef} width="500" height={height} />
    </div>
  );
};
