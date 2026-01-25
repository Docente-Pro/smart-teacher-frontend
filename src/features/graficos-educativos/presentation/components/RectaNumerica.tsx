import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoRectaNumerica } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoRectaNumerica;
}

/**
 * Componente para renderizar rectas numéricas
 * Fundamental para enseñar secuencias, comparación y operaciones
 */
export const RectaNumerica: React.FC<Props> = ({ data }) => {
  const { elementos, rangoInicio, rangoFin, intervalo = 1, mostrarFlechas = true } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const width = 600;
    const marginX = 40;
    const lineY = 60;
    
    const rangoTotal = rangoFin - rangoInicio;
    const espacioDisponible = width - (marginX * 2);
    const unidad = espacioDisponible / rangoTotal;

    // Dibujar línea principal
    const lineaBase = rc.line(marginX, lineY, width - marginX, lineY, {
      ...defaultRoughConfig,
      strokeWidth: 3,
      roughness: 0.8
    });
    svgRef.current.appendChild(lineaBase);

    // Flechas en los extremos
    if (mostrarFlechas) {
      const flechaIzq = rc.path(`M ${marginX} ${lineY} L ${marginX - 10} ${lineY - 5} L ${marginX - 10} ${lineY + 5} Z`, {
        ...defaultRoughConfig,
        fill: '#1e293b',
        fillStyle: 'solid',
        roughness: 0.8
      });
      const flechaDer = rc.path(`M ${width - marginX} ${lineY} L ${width - marginX + 10} ${lineY - 5} L ${width - marginX + 10} ${lineY + 5} Z`, {
        ...defaultRoughConfig,
        fill: '#1e293b',
        fillStyle: 'solid',
        roughness: 0.8
      });
      svgRef.current.appendChild(flechaIzq);
      svgRef.current.appendChild(flechaDer);
    }

    // Dibujar marcas del intervalo
    for (let valor = rangoInicio; valor <= rangoFin; valor += intervalo) {
      const x = marginX + ((valor - rangoInicio) * unidad);
      
      const marca = rc.line(x, lineY - 8, x, lineY + 8, {
        ...defaultRoughConfig,
        strokeWidth: 2
      });
      svgRef.current.appendChild(marca);

      // Etiqueta del valor
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x.toString());
      text.setAttribute('y', (lineY + 25).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '14');
      text.setAttribute('font-family', 'Comic Sans MS, cursive');
      text.setAttribute('fill', '#334155');
      text.textContent = valor.toString();
      svgRef.current.appendChild(text);
    }

    // Dibujar elementos destacados
    elementos.forEach((elem) => {
      if (!svgRef.current) return;
      
      const x = marginX + ((elem.valor - rangoInicio) * unidad);
      const color = elem.color ? roughColors[elem.color] : roughColors.rojo;

      // Círculo destacado
      const circulo = rc.circle(x, lineY, 16, {
        ...defaultRoughConfig,
        stroke: color,
        fill: color,
        fillStyle: 'solid',
        strokeWidth: 3,
        roughness: 0.5
      });
      svgRef.current.appendChild(circulo);

      // Etiqueta personalizada si existe
      if (elem.etiqueta) {
        const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelText.setAttribute('x', x.toString());
        labelText.setAttribute('y', (lineY - 20).toString());
        labelText.setAttribute('text-anchor', 'middle');
        labelText.setAttribute('font-size', '13');
        labelText.setAttribute('font-weight', 'bold');
        labelText.setAttribute('font-family', 'Comic Sans MS, cursive');
        labelText.setAttribute('fill', color);
        labelText.textContent = elem.etiqueta;
        svgRef.current.appendChild(labelText);
      }
    });

  }, [data]);

  return (
    <div className="recta-numerica-container">
      <svg ref={svgRef} width="600" height="120" />
    </div>
  );
};
