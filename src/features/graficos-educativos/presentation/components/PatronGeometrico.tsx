import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoPatronGeometrico } from '../../domain/types';
import { defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoPatronGeometrico;
}

/**
 * Componente para mostrar patrones geométricos
 * Útil para enseñar secuencias, patrones y razonamiento lógico
 */
export const PatronGeometrico: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Adaptar estructura alternativa del backend (marcas, inicio, fin)
  const dataAdaptada = data as any;
  let secuencia = data.secuencia;
  
  // Si viene con 'marcas' en lugar de 'secuencia', adaptar
  if (!secuencia && dataAdaptada.marcas && Array.isArray(dataAdaptada.marcas)) {
    secuencia = dataAdaptada.marcas.map((marca: any) => {
      // Mapear emojis a formas
      let forma: any = 'circulo';
      let color = '#3B82F6';
      
      if (marca.etiqueta) {
        if (marca.etiqueta === '⭐') {
          forma = 'estrella';
          color = '#FFD700';
        } else if (marca.etiqueta === '⭕') {
          forma = 'circulo';
          color = '#FF6B6B';
        } else if (marca.etiqueta === '△' || marca.etiqueta === '▲') {
          forma = 'triangulo';
          color = '#4ECDC4';
        } else if (marca.etiqueta === '■' || marca.etiqueta === '▢') {
          forma = 'cuadrado';
          color = '#95E1D3';
        } else if (marca.etiqueta === '?' || marca.etiqueta === '❓') {
          forma = 'interrogacion';
          color = '#95A5A6';
        }
      }
      
      return {
        forma,
        color,
        etiqueta: marca.etiqueta,
        destacado: marca.destacado || false
      };
    });
  }
  
  const orientacion = data.orientacion || 'horizontal';
  const mostrarIndices = data.mostrarIndices || false;

  useEffect(() => {
    if (!svgRef.current || !secuencia || secuencia.length === 0) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const figuraSize = 60;
    const spacing = 30;
    const margen = 40;

    secuencia.forEach((elemento, index) => {
      if (!svgRef.current) return;

      let x: number, y: number;

      if (orientacion === 'horizontal') {
        x = margen + (index * (figuraSize + spacing));
        y = margen + 30;
      } else {
        x = margen + 30;
        y = margen + (index * (figuraSize + spacing));
      }

      const centerX = x + figuraSize / 2;
      const centerY = y + figuraSize / 2;

      // Configuración de estilo
      const fillColor = elemento.color || '#3B82F6';
      const strokeWidth = elemento.destacado ? 4 : 2;
      const roughness = elemento.destacado ? 0.3 : 0.8;

      // Dibujar forma según el tipo
      if (elemento.forma === 'circulo') {
        const circulo = rc.circle(centerX, centerY, figuraSize - 10, {
          ...defaultRoughConfig,
          stroke: fillColor,
          fill: fillColor,
          fillStyle: 'solid',
          strokeWidth,
          roughness,
        });
        svgRef.current.appendChild(circulo);
      } else if (elemento.forma === 'cuadrado') {
        const cuadrado = rc.rectangle(x + 5, y + 5, figuraSize - 10, figuraSize - 10, {
          ...defaultRoughConfig,
          stroke: fillColor,
          fill: fillColor,
          fillStyle: 'solid',
          strokeWidth,
          roughness,
        });
        svgRef.current.appendChild(cuadrado);
      } else if (elemento.forma === 'triangulo') {
        const path = `M ${centerX} ${y + 5} L ${x + figuraSize - 5} ${y + figuraSize - 5} L ${x + 5} ${y + figuraSize - 5} Z`;
        const triangulo = rc.path(path, {
          ...defaultRoughConfig,
          stroke: fillColor,
          fill: fillColor,
          fillStyle: 'solid',
          strokeWidth,
          roughness,
        });
        svgRef.current.appendChild(triangulo);
      } else if (elemento.forma === 'rectangulo') {
        const rectangulo = rc.rectangle(x + 5, y + 15, figuraSize - 10, figuraSize - 30, {
          ...defaultRoughConfig,
          stroke: fillColor,
          fill: fillColor,
          fillStyle: 'solid',
          strokeWidth,
          roughness,
        });
        svgRef.current.appendChild(rectangulo);
      } else if (elemento.forma === 'rombo') {
        const path = `M ${centerX} ${y + 5} L ${x + figuraSize - 5} ${centerY} L ${centerX} ${y + figuraSize - 5} L ${x + 5} ${centerY} Z`;
        const rombo = rc.path(path, {
          ...defaultRoughConfig,
          stroke: fillColor,
          fill: fillColor,
          fillStyle: 'solid',
          strokeWidth,
          roughness,
        });
        svgRef.current.appendChild(rombo);
      } else if (elemento.forma === 'hexagono') {
        const radius = (figuraSize - 10) / 2;
        const points: string[] = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          const px = centerX + radius * Math.cos(angle);
          const py = centerY + radius * Math.sin(angle);
          points.push(`${px},${py}`);
        }
        const path = `M ${points.join(' L ')} Z`;
        const hexagono = rc.path(path, {
          ...defaultRoughConfig,
          stroke: fillColor,
          fill: fillColor,
          fillStyle: 'solid',
          strokeWidth,
          roughness,
        });
        svgRef.current.appendChild(hexagono);
      } else if (elemento.forma === 'estrella') {
        const outerRadius = (figuraSize - 10) / 2;
        const innerRadius = outerRadius * 0.4;
        const points: string[] = [];
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const px = centerX + radius * Math.cos(angle);
          const py = centerY + radius * Math.sin(angle);
          points.push(`${px},${py}`);
        }
        const path = `M ${points.join(' L ')} Z`;
        const estrella = rc.path(path, {
          ...defaultRoughConfig,
          stroke: fillColor,
          fill: fillColor,
          fillStyle: 'solid',
          strokeWidth,
          roughness,
        });
        svgRef.current.appendChild(estrella);
      } else if (elemento.forma === 'interrogacion') {
        // Dibujar cuadrado con borde punteado para la interrogación
        const cuadrado = rc.rectangle(x + 5, y + 5, figuraSize - 10, figuraSize - 10, {
          ...defaultRoughConfig,
          stroke: fillColor,
          strokeWidth: 3,
          strokeLineDash: [5, 5],
          roughness: 0.5,
        });
        svgRef.current.appendChild(cuadrado);
      }

      // Etiqueta
      if (elemento.etiqueta) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', centerX.toString());
        text.setAttribute('y', centerY.toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', elemento.forma === 'interrogacion' ? '36' : '20');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-family', 'Comic Sans MS, cursive');
        text.setAttribute('fill', elemento.forma === 'interrogacion' ? fillColor : 'white');
        text.textContent = elemento.etiqueta;
        svgRef.current.appendChild(text);
      }

      // Índice de posición
      if (mostrarIndices) {
        const indiceText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        indiceText.setAttribute('x', centerX.toString());
        indiceText.setAttribute('y', (orientacion === 'horizontal' ? y - 15 : centerY - figuraSize).toString());
        indiceText.setAttribute('text-anchor', 'middle');
        indiceText.setAttribute('font-size', '14');
        indiceText.setAttribute('font-family', 'Arial');
        indiceText.setAttribute('fill', '#64748b');
        indiceText.textContent = (index + 1).toString();
        svgRef.current.appendChild(indiceText);
      }
    });

  }, [data]);

  // Calcular dimensiones dinámicas del SVG
  const figuraSize = 60;
  const spacing = 30;
  const margen = 40;
  const svgWidth = orientacion === 'horizontal' 
    ? margen * 2 + (secuencia.length * (figuraSize + spacing))
    : margen * 2 + figuraSize;
  const svgHeight = orientacion === 'vertical'
    ? margen * 2 + (secuencia.length * (figuraSize + spacing))
    : margen * 2 + figuraSize + 60;

  return (
    <div className="patron-geometrico-container">
      <svg 
        ref={svgRef} 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
        preserveAspectRatio="xMidYMid meet" 
        style={{ width: '100%', maxWidth: `${svgWidth}px` }} 
      />
    </div>
  );
};
