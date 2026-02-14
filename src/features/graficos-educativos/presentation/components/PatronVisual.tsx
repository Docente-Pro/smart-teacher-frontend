import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { ConfiguracionGrafico } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface ElementoPatron {
  tipo: 'forma' | 'numero' | 'color';
  valor: string | number;
  color?: string;
}

interface PatronVisualData extends ConfiguracionGrafico {
  elementos: ElementoPatron[];
  repeticiones?: number;
}

interface Props {
  data: PatronVisualData;
}

/**
 * Componente para representar patrones visuales
 * Fundamental para desarrollar pensamiento algebraico en primaria
 */
export const PatronVisual: React.FC<Props> = ({ data }) => {
  const { elementos, repeticiones = 1 } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const tamañoElemento = 60;
    const espacioX = 80;
    const margen = 40;
    let currentX = margen;
    const y = 60;

    // Repetir el patrón
    for (let rep = 0; rep < repeticiones; rep++) {
      elementos.forEach((elem, _idx) => {
        const centerX = currentX + tamañoElemento / 2;
        const centerY = y + tamañoElemento / 2;

        if (elem.tipo === 'forma') {
          const colorElem = elem.color || roughColors.azul;
          
          switch (elem.valor) {
            case 'circulo':
              const circulo = rc.circle(centerX, centerY, tamañoElemento, {
                ...defaultRoughConfig,
                stroke: colorElem,
                fill: colorElem,
                fillStyle: 'solid',
                strokeWidth: 3,
                roughness: 0.6
              });
              svgRef.current!.appendChild(circulo);
              break;

            case 'cuadrado':
              const cuadrado = rc.rectangle(currentX, y, tamañoElemento, tamañoElemento, {
                ...defaultRoughConfig,
                stroke: colorElem,
                fill: colorElem,
                fillStyle: 'cross-hatch',
                fillWeight: 1,
                strokeWidth: 3,
                roughness: 0.8
              });
              svgRef.current!.appendChild(cuadrado);
              break;

            case 'triangulo':
              const triangulo = rc.polygon([
                [centerX, y],
                [currentX, y + tamañoElemento],
                [currentX + tamañoElemento, y + tamañoElemento]
              ], {
                ...defaultRoughConfig,
                stroke: colorElem,
                fill: colorElem,
                fillStyle: 'cross-hatch',
                fillWeight: 1,
                strokeWidth: 3,
                roughness: 0.8
              });
              svgRef.current!.appendChild(triangulo);
              break;

            case 'estrella':
              // Estrella de 5 puntas simplificada
              const puntos = 5;
              const radioExt = tamañoElemento / 2;
              const radioInt = radioExt * 0.4;
              const estrellaPoints: [number, number][] = [];

              for (let i = 0; i < puntos * 2; i++) {
                const radio = i % 2 === 0 ? radioExt : radioInt;
                const angulo = (i * Math.PI) / puntos - Math.PI / 2;
                const x = centerX + radio * Math.cos(angulo);
                const y = centerY + radio * Math.sin(angulo);
                estrellaPoints.push([x, y]);
              }

              const estrella = rc.polygon(estrellaPoints, {
                ...defaultRoughConfig,
                stroke: colorElem,
                fill: colorElem,
                fillStyle: 'solid',
                strokeWidth: 2,
                roughness: 0.8
              });
              svgRef.current!.appendChild(estrella);
              break;
          }
        } else if (elem.tipo === 'numero') {
          // Dibujar número en un círculo
          const circulo = rc.circle(centerX, centerY, tamañoElemento, {
            ...defaultRoughConfig,
            strokeWidth: 3,
            roughness: 0.6
          });
          svgRef.current!.appendChild(circulo);

          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', centerX.toString());
          text.setAttribute('y', (centerY + 8).toString());
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('font-size', '24');
          text.setAttribute('font-weight', 'bold');
          text.setAttribute('font-family', 'Comic Sans MS, cursive');
          text.setAttribute('fill', '#1e293b');
          text.textContent = elem.valor.toString();
          svgRef.current!.appendChild(text);
        }

        currentX += espacioX;
      });

      // Separador visual entre repeticiones
      if (rep < repeticiones - 1) {
        const lineaX = currentX - espacioX / 2;
        const linea = rc.line(lineaX, y, lineaX, y + tamañoElemento, {
          ...defaultRoughConfig,
          stroke: '#94a3b8',
          strokeWidth: 2,
          roughness: 0.5,
          strokeLineDash: [5, 5]
        });
        svgRef.current!.appendChild(linea);
        currentX += 20;
      }
    }

  }, [data]);

  const width = (elementos.length * 80 * repeticiones) + (repeticiones - 1) * 20 + 80;
  const height = 180;

  return (
    <div className="patron-visual-container">
      <svg 
        ref={svgRef} 
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }}
      />
    </div>
  );
};
