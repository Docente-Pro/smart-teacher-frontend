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
  const { 
    marcas = [], 
    inicio, 
    fin, 
    intervalo = 1, 
    saltos = [], 
    mostrarFlechas = true 
  } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  // Función auxiliar para mapear colores
  const obtenerColor = (color?: string | any): string => {
    if (!color) return roughColors.rojo;
    // Si es un color hex directo, usarlo
    if (typeof color === 'string' && color.startsWith('#')) return color;
    // Si es un nombre de color del enum, usar roughColors
    return (roughColors as any)[color] || color || roughColors.rojo;
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const width = 600;
    const marginX = 40;
    const lineY = 80;
    
    const rangoTotal = fin - inicio;
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
    for (let valor = inicio; valor <= fin; valor += intervalo) {
      const x = marginX + ((valor - inicio) * unidad);
      
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

    // Dibujar saltos (arcos) si existen
    if (saltos && saltos.length > 0) {
      saltos.forEach((salto) => {
        if (!svgRef.current) return;

        const xDesde = marginX + ((salto.desde - inicio) * unidad);
        const xHasta = marginX + ((salto.hasta - inicio) * unidad);
        const xMedio = (xDesde + xHasta) / 2;
        const altura = 30; // Altura del arco

        // Dibujar arco curvo
        const path = `M ${xDesde} ${lineY} Q ${xMedio} ${lineY - altura} ${xHasta} ${lineY}`;
        const arco = rc.path(path, {
          ...defaultRoughConfig,
          stroke: obtenerColor(salto.color),
          strokeWidth: 2.5,
          roughness: 0.5,
        });
        svgRef.current.appendChild(arco);

        // Flecha en el extremo
        const flechaPath = `M ${xHasta} ${lineY} L ${xHasta - 8} ${lineY - 6} M ${xHasta} ${lineY} L ${xHasta - 6} ${lineY + 6}`;
        const flecha = rc.path(flechaPath, {
          ...defaultRoughConfig,
          stroke: obtenerColor(salto.color),
          strokeWidth: 2.5,
          roughness: 0.5,
        });
        svgRef.current.appendChild(flecha);

        // Etiqueta del salto
        if (salto.etiqueta) {
          const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          labelText.setAttribute('x', xMedio.toString());
          labelText.setAttribute('y', (lineY - altura - 5).toString());
          labelText.setAttribute('text-anchor', 'middle');
          labelText.setAttribute('font-size', '12');
          labelText.setAttribute('font-weight', 'bold');
          labelText.setAttribute('font-family', 'Comic Sans MS, cursive');
          labelText.setAttribute('fill', obtenerColor(salto.color));
          labelText.textContent = salto.etiqueta;
          svgRef.current.appendChild(labelText);
        }
      });
    }

    // Dibujar elementos destacados
    marcas.forEach((elem) => {
      if (!svgRef.current) return;
      
      const x = marginX + ((elem.posicion - inicio) * unidad);
      const color = obtenerColor(elem.color);

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
      <svg ref={svgRef} viewBox="0 0 600 160" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: '600px' }} />
    </div>
  );
};
