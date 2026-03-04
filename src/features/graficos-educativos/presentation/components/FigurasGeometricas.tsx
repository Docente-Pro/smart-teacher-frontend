import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoFigurasGeometricas } from '../../domain/types';
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoFigurasGeometricas;
}

/**
 * Componente para dibujar figuras geométricas básicas
 * Para enseñar geometría plana en primaria
 */
export const FigurasGeometricas: React.FC<Props> = ({ data }) => {
  const { elementos } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  // Calcular spacing dinámico según la longitud máxima de etiquetas
  const maxLabelLength = elementos.reduce((max, e) => {
    return Math.max(max, (e.etiqueta || '').length);
  }, 0);
  // ~7.5px por carácter a font-size 14, Comic Sans
  const estimatedMaxLabelWidth = maxLabelLength * 7.5;
  // Máximo de caracteres por línea antes de hacer wrap
  const maxCharsPerLine = 22;
  // Spacing: mínimo 180, crece si etiquetas son largas (pero con wrap, usamos menor de los dos)
  const espacioX = Math.max(200, Math.min(estimatedMaxLabelWidth + 60, maxCharsPerLine * 7.5 + 80));
  const espacioY = 180 + (maxLabelLength > maxCharsPerLine ? Math.ceil(maxLabelLength / maxCharsPerLine) * 16 : 0);
  const margen = Math.max(100, espacioX / 2);
  const figurasPorFila = Math.min(elementos.length, 3);

  const width = Math.min(elementos.length, figurasPorFila) * espacioX + margen + 50;
  const height = Math.ceil(elementos.length / figurasPorFila) * espacioY + 100;

  useEffect(() => {
    if (!svgRef.current) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    // Función auxiliar para extraer dimensión numérica de string como "3cm"
    const parseDimension = (dim?: string | number): number | undefined => {
      if (typeof dim === 'number') return dim;
      if (!dim) return undefined;
      const parsed = parseInt(dim);
      return isNaN(parsed) ? undefined : parsed * 20; // Convertir cm a pixels (1cm = 20px)
    };

    // Función para partir texto largo en líneas
    const wrapText = (str: string, maxLen: number): string[] => {
      if (str.length <= maxLen) return [str];
      const words = str.split(/(\s+|,\s*)/);
      const lines: string[] = [];
      let current = '';
      for (const word of words) {
        if ((current + word).length > maxLen && current.length > 0) {
          lines.push(current.trim());
          current = word.trimStart();
        } else {
          current += word;
        }
      }
      if (current.trim()) lines.push(current.trim());
      return lines;
    };

    elementos.forEach((figura, idx) => {
      const fila = Math.floor(idx / figurasPorFila);
      const col = idx % figurasPorFila;
      const centerX = margen + (col * espacioX);
      const centerY = margen + (fila * espacioY);

      const color = resolveColor(figura.color as string, roughColors.azul);

      // Normalizar tipo (eliminar acentos)
      const tipoNormalizado = figura.tipo
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase() as 'cuadrado' | 'rectangulo' | 'circulo' | 'triangulo' | 'trapecio' | 'rombo';

      // Obtener dimensiones (priorizar ancho/alto/radio, luego dimensiones)
      const dimension = parseDimension(figura.dimensiones) || figura.ancho || 80;

      switch (tipoNormalizado) {
        case 'cuadrado': {
          const lado = dimension;
          const x = centerX - lado / 2;
          const y = centerY - lado / 2;
          const cuadrado = rc.rectangle(x, y, lado, lado, {
            ...defaultRoughConfig,
            stroke: color,
            fill: color,
            fillStyle: 'solid',
            strokeWidth: 3,
            roughness: 0.8
          });
          svgRef.current!.appendChild(cuadrado);
          break;
        }

        case 'rectangulo': {
          const ancho = dimension;
          const alto = figura.alto || dimension * 0.6;
          const x = centerX - ancho / 2;
          const y = centerY - alto / 2;
          const rectangulo = rc.rectangle(x, y, ancho, alto, {
            ...defaultRoughConfig,
            stroke: color,
            fill: color,
            fillStyle: 'solid',
            strokeWidth: 3,
            roughness: 0.8
          });
          svgRef.current!.appendChild(rectangulo);
          break;
        }

        case 'circulo': {
          const radio = figura.radio || dimension / 2;
          const circulo = rc.circle(centerX, centerY, radio * 2, {
            ...defaultRoughConfig,
            stroke: color,
            fill: color,
            fillStyle: 'solid',
            strokeWidth: 3,
            roughness: 0.6
          });
          svgRef.current!.appendChild(circulo);
          break;
        }

        case 'triangulo': {
          const lado = dimension;
          const altura = (lado * Math.sqrt(3)) / 2;
          const x1 = centerX;
          const y1 = centerY - altura / 2;
          const x2 = centerX - lado / 2;
          const y2 = centerY + altura / 2;
          const x3 = centerX + lado / 2;
          const y3 = centerY + altura / 2;

          const triangulo = rc.polygon([
            [x1, y1],
            [x2, y2],
            [x3, y3]
          ], {
            ...defaultRoughConfig,
            stroke: color,
            fill: color,
            fillStyle: 'solid',
            strokeWidth: 3,
            roughness: 0.8
          });
          svgRef.current!.appendChild(triangulo);
          break;
        }

        case 'trapecio': {
          const baseInferior = dimension;
          const baseSuperior = baseInferior * 0.6;
          const altura = figura.alto || dimension * 0.6;
          
          const trapecio = rc.polygon([
            [centerX - baseSuperior / 2, centerY - altura / 2],
            [centerX + baseSuperior / 2, centerY - altura / 2],
            [centerX + baseInferior / 2, centerY + altura / 2],
            [centerX - baseInferior / 2, centerY + altura / 2]
          ], {
            ...defaultRoughConfig,
            stroke: color,
            fill: color,
            fillStyle: 'solid',
            strokeWidth: 3,
            roughness: 0.8
          });
          svgRef.current!.appendChild(trapecio);
          break;
        }

        case 'rombo': {
          const ancho = dimension;
          const alto = figura.alto || dimension * 1.25;
          
          const rombo = rc.polygon([
            [centerX, centerY - alto / 2],
            [centerX + ancho / 2, centerY],
            [centerX, centerY + alto / 2],
            [centerX - ancho / 2, centerY]
          ], {
            ...defaultRoughConfig,
            stroke: color,
            fill: color,
            fillStyle: 'solid',
            strokeWidth: 3,
            roughness: 0.8
          });
          svgRef.current!.appendChild(rombo);
          break;
        }
      }

      // Etiqueta con word-wrap
      if (figura.etiqueta) {
        const lines = wrapText(figura.etiqueta, maxCharsPerLine);
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', centerX.toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '13');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-family', 'Comic Sans MS, cursive');
        text.setAttribute('fill', '#1e293b');

        lines.forEach((line, lineIdx) => {
          const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          tspan.setAttribute('x', centerX.toString());
          tspan.setAttribute('y', (centerY + 70 + lineIdx * 16).toString());
          tspan.textContent = line;
          text.appendChild(tspan);
        });

        svgRef.current!.appendChild(text);
      }
    });

  }, [data, espacioX, espacioY, margen, figurasPorFila]);

  return (
    <div className="figuras-geometricas-container">
      <svg 
        ref={svgRef} 
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }}
      />
    </div>
  );
};
