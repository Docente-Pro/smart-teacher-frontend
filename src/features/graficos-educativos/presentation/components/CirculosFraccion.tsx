import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoCirculosFraccion } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoCirculosFraccion;
}

/**
 * Componente para representar fracciones con círculos divididos
 * Ideal para enseñar fracciones en primaria
 */
export const CirculosFraccion: React.FC<Props> = ({ data }) => {
  const { elementos, mostrarEtiquetas = true } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const radioCirculo = 60;
    const espacioX = 180;
    const espacioY = 200;
    const margen = 80;
    
    const circulosPorFila = Math.min(elementos.length, 4);

    elementos.forEach((fraccion, idx) => {
      const fila = Math.floor(idx / circulosPorFila);
      const col = idx % circulosPorFila;
      const centerX = margen + (col * espacioX);
      const centerY = margen + (fila * espacioY);

      const color = roughColors[fraccion.color] || roughColors.azul;

      // Círculo completo (borde)
      const circulo = rc.circle(centerX, centerY, radioCirculo * 2, {
        ...defaultRoughConfig,
        strokeWidth: 3,
        roughness: 0.8
      });
      svgRef.current!.appendChild(circulo);

      // Dividir el círculo en secciones
      const { numerador, denominador } = fraccion;
      const anguloSeccion = (2 * Math.PI) / denominador;

      for (let i = 0; i < denominador; i++) {
        const anguloInicio = i * anguloSeccion - Math.PI / 2;
        const anguloFin = (i + 1) * anguloSeccion - Math.PI / 2;

        // Línea divisoria
        const x2 = centerX + radioCirculo * Math.cos(anguloInicio);
        const y2 = centerY + radioCirculo * Math.sin(anguloInicio);
        
        const linea = rc.line(centerX, centerY, x2, y2, {
          ...defaultRoughConfig,
          strokeWidth: 2,
          roughness: 0.8
        });
        svgRef.current!.appendChild(linea);

        // Rellenar secciones del numerador
        if (i < numerador) {
          const x1 = centerX + (radioCirculo - 5) * Math.cos(anguloInicio);
          const y1 = centerY + (radioCirculo - 5) * Math.sin(anguloInicio);
          const x2End = centerX + (radioCirculo - 5) * Math.cos(anguloFin);
          const y2End = centerY + (radioCirculo - 5) * Math.sin(anguloFin);

          const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radioCirculo - 5} ${radioCirculo - 5} 0 0 1 ${x2End} ${y2End} Z`;
          
          const seccionRellena = rc.path(pathData, {
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
      if (mostrarEtiquetas) {
        const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelText.setAttribute('x', centerX.toString());
        labelText.setAttribute('y', (centerY + radioCirculo + 25).toString());
        labelText.setAttribute('text-anchor', 'middle');
        labelText.setAttribute('font-size', '18');
        labelText.setAttribute('font-weight', 'bold');
        labelText.setAttribute('font-family', 'Comic Sans MS, cursive');
        labelText.setAttribute('fill', '#1e293b');
        labelText.textContent = `${numerador}/${denominador}`;
        svgRef.current!.appendChild(labelText);

        if (fraccion.etiqueta) {
          const etiqueta = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          etiqueta.setAttribute('x', centerX.toString());
          etiqueta.setAttribute('y', (centerY + radioCirculo + 45).toString());
          etiqueta.setAttribute('text-anchor', 'middle');
          etiqueta.setAttribute('font-size', '14');
          etiqueta.setAttribute('font-family', 'Comic Sans MS, cursive');
          etiqueta.setAttribute('fill', '#64748b');
          etiqueta.textContent = fraccion.etiqueta;
          svgRef.current!.appendChild(etiqueta);
        }
      }
    });

  }, [data]);

  const width = Math.min(elementos.length, 4) * 180 + 100;
  const height = Math.ceil(elementos.length / 4) * 200 + 100;

  return (
    <div className="circulos-fraccion-container">
      <svg 
        ref={svgRef} 
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }}
      />
    </div>
  );
};
