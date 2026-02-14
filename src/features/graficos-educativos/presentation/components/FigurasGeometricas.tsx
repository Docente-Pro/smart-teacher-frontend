import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { ConfiguracionGrafico, ColorGrafico } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Figura {
  tipo: 'cuadrado' | 'rectangulo' | 'círculo' | 'circulo' | 'triángulo' | 'triangulo' | 'trapecio' | 'rombo';
  ancho?: number;
  alto?: number;
  radio?: number;
  dimensiones?: string; // Backend puede enviar "3cm", "4cm", etc.
  color: ColorGrafico | string; // Permite string para compatibilidad
  etiqueta?: string;
}

interface FigurasGeometricasData extends ConfiguracionGrafico {
  elementos: Figura[];
}

interface Props {
  data: FigurasGeometricasData;
}

/**
 * Componente para dibujar figuras geométricas básicas
 * Para enseñar geometría plana en primaria
 */
export const FigurasGeometricas: React.FC<Props> = ({ data }) => {
  const { elementos } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const espacioX = 180;
    const espacioY = 180;
    const margen = 100;
    const figurasPorFila = Math.min(elementos.length, 3);

    // Función auxiliar para extraer dimensión numérica de string como "3cm"
    const parseDimension = (dim?: string | number): number | undefined => {
      if (typeof dim === 'number') return dim;
      if (!dim) return undefined;
      const parsed = parseInt(dim);
      return isNaN(parsed) ? undefined : parsed * 20; // Convertir cm a pixels (1cm = 20px)
    };

    elementos.forEach((figura, idx) => {
      const fila = Math.floor(idx / figurasPorFila);
      const col = idx % figurasPorFila;
      const centerX = margen + (col * espacioX);
      const centerY = margen + (fila * espacioY);

      // Manejar color: puede ser del enum o string directo
      let color: string;
      if (typeof figura.color === 'string') {
        // Si es un string, puede ser un valor del enum o un color directo
        color = roughColors[figura.color as keyof typeof roughColors] || figura.color;
      } else {
        color = roughColors[figura.color] || roughColors.azul;
      }

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
            fillStyle: 'cross-hatch',
            fillWeight: 1,
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
            fillStyle: 'cross-hatch',
            fillWeight: 1,
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
            fillStyle: 'cross-hatch',
            fillWeight: 1,
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
            fillStyle: 'cross-hatch',
            fillWeight: 1,
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
            fillStyle: 'cross-hatch',
            fillWeight: 1,
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
            fillStyle: 'cross-hatch',
            fillWeight: 1,
            strokeWidth: 3,
            roughness: 0.8
          });
          svgRef.current!.appendChild(rombo);
          break;
        }
      }

      // Etiqueta
      if (figura.etiqueta) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', centerX.toString());
        text.setAttribute('y', (centerY + 70).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-family', 'Comic Sans MS, cursive');
        text.setAttribute('fill', '#1e293b');
        text.textContent = figura.etiqueta;
        svgRef.current!.appendChild(text);
      }
    });

  }, [data]);

  const width = Math.min(elementos.length, 3) * 180 + 150;
  const height = Math.ceil(elementos.length / 3) * 180 + 150;

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
