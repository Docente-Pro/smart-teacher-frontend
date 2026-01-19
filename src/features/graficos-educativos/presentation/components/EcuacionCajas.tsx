import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoEcuacionCajas } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';
import '../styles/EcuacionCajas.css';

interface Props {
  data: GraficoEcuacionCajas;
}

/**
 * Componente para renderizar ecuaciones matemáticas con cajas visuales
 * Soporta resolución paso a paso en múltiples filas
 * Ejemplo: [12] + [6] = [18]
 * Ahora con estilo dibujado a mano usando Rough.js
 */
export const EcuacionCajas: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Transformar datos del backend si vienen con "valor" en lugar de "contenido"
  const getTransformedData = () => {
    const elementosTransformados = (data.elementos || []).map((elem: any) => {
      if (elem.contenido !== undefined) {
        return elem;
      }
      return {
        ...elem,
        contenido: elem.valor || elem.contenido || ''
      };
    });

    return {
      elementos: elementosTransformados,
      agrupaciones: data.agrupaciones,
      filas: data.filas
    };
  };

  const { elementos, agrupaciones, filas } = getTransformedData();

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const boxWidth = 70;
    const boxHeight = 50;
    const gap = 15;
    const rowGap = 80; // Espacio vertical entre filas
    const bracketHeight = 40; // Altura de las llaves
    
    let maxWidth = 0;
    let currentY = 20;

    // Función para renderizar una fila de elementos
    const renderFila = (
      elementosFila: any[], 
      agrupacionesFila: any[] | undefined, 
      yPosition: number
    ) => {
      let currentX = 20;
      const elementosPos: { startX: number; endX: number }[] = [];

      elementosFila.forEach((elem) => {
        const startX = currentX;
        
        if (elem.tipo === 'caja') {
          let color: string;
          if (elem.color && elem.color.startsWith('#')) {
            color = elem.color;
          } else {
            color = roughColors[elem.color as keyof typeof roughColors] || roughColors.neutro;
          }
          
          const box = rc.rectangle(currentX, yPosition, boxWidth, boxHeight, {
            ...defaultRoughConfig,
            stroke: color,
            fill: color,
            fillWeight: elem.destacado ? 2 : 0.5,
            strokeWidth: elem.destacado ? 3 : 2,
            roughness: elem.destacado ? 0.8 : 1.2,
            fillStyle: 'cross-hatch'
          });
          svgRef.current?.appendChild(box);

          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', (currentX + boxWidth / 2).toString());
          text.setAttribute('y', (yPosition + boxHeight / 2 + 6).toString());
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('font-size', '20');
          text.setAttribute('font-weight', elem.destacado ? 'bold' : '600');
          text.setAttribute('fill', '#2C3E50');
          text.setAttribute('class', 'rough-text');
          text.textContent = elem.contenido;
          svgRef.current?.appendChild(text);

          currentX += boxWidth + gap;
          elementosPos.push({ startX, endX: currentX - gap });
        } else {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', (currentX + 15).toString());
          text.setAttribute('y', (yPosition + boxHeight / 2 + 8).toString());
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('font-size', '28');
          text.setAttribute('font-weight', 'bold');
          text.setAttribute('fill', '#2C3E50');
          text.setAttribute('class', 'rough-text');
          text.textContent = elem.contenido;
          svgRef.current?.appendChild(text);

          currentX += 40;
          elementosPos.push({ startX, endX: currentX });
        }
      });

      // Dibujar agrupaciones (llaves) si existen
      if (agrupacionesFila && agrupacionesFila.length > 0) {
        const agrupY = yPosition + boxHeight + 15;
        
        agrupacionesFila.forEach((agrup) => {
          const startX = elementosPos[agrup.desde]?.startX || 20;
          const endX = elementosPos[agrup.hasta]?.endX || startX + boxWidth;
          const width = endX - startX;
          const color = roughColors[agrup.colorLlave as keyof typeof roughColors] || roughColors.amarillo;

          const midX = startX + width / 2;
          const path = `M ${startX},${agrupY} Q ${startX},${agrupY + 15} ${startX + 10},${agrupY + 15} L ${midX - 5},${agrupY + 15} Q ${midX},${agrupY + 15} ${midX},${agrupY + 25} Q ${midX},${agrupY + 15} ${midX + 5},${agrupY + 15} L ${endX - 10},${agrupY + 15} Q ${endX},${agrupY + 15} ${endX},${agrupY}`;
          
          const bracket = rc.path(path, {
            stroke: color,
            strokeWidth: 2.5,
            roughness: 1,
            fill: 'none'
          });
          svgRef.current?.appendChild(bracket);

          if (agrup.textoAbajo) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', midX.toString());
            text.setAttribute('y', (agrupY + 40).toString());
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '13');
            text.setAttribute('fill', color);
            text.setAttribute('class', 'rough-text');
            text.textContent = agrup.textoAbajo;
            svgRef.current?.appendChild(text);
          }
        });
      }

      maxWidth = Math.max(maxWidth, currentX);
      return elementosPos;
    };

    // Renderizar fila principal
    renderFila(elementos, agrupaciones, currentY);
    currentY += boxHeight + (agrupaciones && agrupaciones.length > 0 ? bracketHeight + 30 : 0);

    // Renderizar filas adicionales (pasos de resolución)
    if (filas && filas.length > 0) {
      filas.forEach((fila) => {
        currentY += rowGap;
        renderFila(fila.elementos, fila.agrupaciones, currentY);
        currentY += boxHeight + (fila.agrupaciones && fila.agrupaciones.length > 0 ? bracketHeight + 30 : 0);
      });
    }

    const totalWidth = maxWidth + 20;
    const totalHeight = currentY + 20;
    svgRef.current.setAttribute('width', totalWidth.toString());
    svgRef.current.setAttribute('height', totalHeight.toString());
  }, [elementos, agrupaciones, filas]);

  return (
    <div className="ecuacion-cajas" ref={containerRef}>
      <svg ref={svgRef} className="ecuacion-svg" />
    </div>
  );
};
