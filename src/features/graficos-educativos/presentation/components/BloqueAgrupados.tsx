import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoBloqueAgrupados } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';
import '../styles/BloqueAgrupados.css';

interface Props {
  data: GraficoBloqueAgrupados;
}

/**
 * Componente para renderizar bloques agrupados con estilo dibujado a mano
 * Útil para representar conjuntos, cantidades agrupadas, etc.
 */
export const BloqueAgrupados: React.FC<Props> = ({ data }) => {
  // Adaptar estructura: aceptar tanto elementos[] como cantidadGrupos + elementosPorGrupo
  const adaptedData = React.useMemo(() => {
    const { elementos, disposicion = 'horizontal', tamanoBloque = 30 } = data;
    const dataAny = data as any;

    // Si viene con cantidadGrupos y elementosPorGrupo, generar elementos automáticamente
    if (dataAny.cantidadGrupos && dataAny.elementosPorGrupo && (!elementos || elementos.length === 0)) {
      const cantidadGrupos = dataAny.cantidadGrupos;
      const elementosPorGrupo = dataAny.elementosPorGrupo;
      const icono = dataAny.icono || '●';
      const colorGrupo = dataAny.colorGrupo || 'azul';
      const etiquetaGrupo = dataAny.etiquetaGrupo || 'Grupo';
      
      // Generar array de elementos
      const generatedElementos: any[] = [];
      for (let i = 0; i < cantidadGrupos; i++) {
        generatedElementos.push({
          tipo: 'bloque',
          cantidad: elementosPorGrupo,
          color: colorGrupo,
          etiqueta: `${etiquetaGrupo} ${i + 1}`,
          icono: icono
        });
      }
      
      return {
        ...data,
        elementos: generatedElementos,
        disposicion,
        tamanoBloque
      };
    }

    return data;
  }, [data]);

  const { elementos, disposicion = 'horizontal', tamanoBloque = 30 } = adaptedData;
  const svgRef = useRef<SVGSVGElement>(null);

  const getBlockColor = (color: string): string => {
    const colorMap: Record<string, string> = {
      azul: roughColors.azul,
      rojo: roughColors.rojo,
      verde: roughColors.verde,
      amarillo: roughColors.amarillo,
      morado: roughColors.morado,
      naranja: roughColors.naranja,
    };
    return colorMap[color] || roughColors.azul;
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const padding = 20;
    const blockSpacing = 5;
    const labelHeight = 40;
    const countHeight = 30;
    const groupSpacing = 40;

    if (disposicion === 'horizontal') {
      let currentX = padding;
      let maxHeight = 0;

      elementos.forEach((grupo, idxGrupo) => {
        const fillColor = getBlockColor(grupo.color);
        const groupStartX = currentX;

        // Etiqueta del grupo
        if (grupo.etiqueta) {
          const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          labelText.setAttribute('x', currentX.toString());
          labelText.setAttribute('y', (padding + 15).toString());
          labelText.setAttribute('font-size', '14');
          labelText.setAttribute('font-weight', 'bold');
          labelText.setAttribute('fill', '#2C3E50');
          labelText.setAttribute('class', 'rough-text');
          labelText.textContent = `${grupo.icono || ''} ${grupo.etiqueta}`;
          svgRef.current?.appendChild(labelText);
        }

        // Bloques
        let blockX = currentX;
        let blockY = padding + labelHeight;
        const blocksPerRow = Math.ceil(Math.sqrt(grupo.cantidad));
        
        for (let i = 0; i < grupo.cantidad; i++) {
          const block = rc.rectangle(blockX, blockY, tamanoBloque, tamanoBloque, {
            ...defaultRoughConfig,
            fill: fillColor,
            fillStyle: 'hachure',
            stroke: fillColor,
            strokeWidth: 2,
            roughness: 1.2,
            hachureAngle: 45 + idxGrupo * 30,
            hachureGap: 4
          });
          svgRef.current?.appendChild(block);

          blockX += tamanoBloque + blockSpacing;

          if ((i + 1) % blocksPerRow === 0) {
            blockX = currentX;
            blockY += tamanoBloque + blockSpacing;
          }
        }

        const rows = Math.ceil(grupo.cantidad / blocksPerRow);
        const groupHeight = labelHeight + rows * (tamanoBloque + blockSpacing) + countHeight;
        maxHeight = Math.max(maxHeight, groupHeight);

        // Cantidad total
        const countText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        countText.setAttribute('x', (groupStartX + (blocksPerRow * (tamanoBloque + blockSpacing)) / 2).toString());
        countText.setAttribute('y', (blockY + countHeight - 10).toString());
        countText.setAttribute('text-anchor', 'middle');
        countText.setAttribute('font-size', '16');
        countText.setAttribute('font-weight', 'bold');
        countText.setAttribute('fill', fillColor);
        countText.setAttribute('class', 'rough-text');
        countText.textContent = grupo.cantidad.toString();
        svgRef.current?.appendChild(countText);

        currentX += blocksPerRow * (tamanoBloque + blockSpacing) + groupSpacing;
      });

      const svgWidth = currentX + padding;
      const svgHeight = maxHeight + padding * 2;
      
      svgRef.current.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
      svgRef.current.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svgRef.current.style.width = '100%';
      svgRef.current.style.maxWidth = `${svgWidth}px`;
      svgRef.current.style.height = 'auto';

    } else {
      // Disposición vertical
      let currentY = padding;
      let maxWidth = 0;

      elementos.forEach((grupo, idxGrupo) => {
        const fillColor = getBlockColor(grupo.color);
        
        // Etiqueta del grupo
        if (grupo.etiqueta) {
          const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          labelText.setAttribute('x', padding.toString());
          labelText.setAttribute('y', (currentY + 15).toString());
          labelText.setAttribute('font-size', '14');
          labelText.setAttribute('font-weight', 'bold');
          labelText.setAttribute('fill', '#2C3E50');
          labelText.setAttribute('class', 'rough-text');
          labelText.textContent = `${grupo.icono || ''} ${grupo.etiqueta}`;
          svgRef.current?.appendChild(labelText);
        }

        currentY += labelHeight;

        // Bloques
        let blockX = padding;
        let blockY = currentY;
        const blocksPerRow = Math.ceil(Math.sqrt(grupo.cantidad));
        
        for (let i = 0; i < grupo.cantidad; i++) {
          const block = rc.rectangle(blockX, blockY, tamanoBloque, tamanoBloque, {
            ...defaultRoughConfig,
            fill: fillColor,
            fillStyle: 'hachure',
            stroke: fillColor,
            strokeWidth: 2,
            roughness: 1.2,
            hachureAngle: 45 + idxGrupo * 30,
            hachureGap: 4
          });
          svgRef.current?.appendChild(block);

          blockX += tamanoBloque + blockSpacing;

          if ((i + 1) % blocksPerRow === 0) {
            blockX = padding;
            blockY += tamanoBloque + blockSpacing;
          }
        }

        const groupWidth = blocksPerRow * (tamanoBloque + blockSpacing);
        maxWidth = Math.max(maxWidth, groupWidth);

        // Cantidad total
        const countText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        countText.setAttribute('x', (padding + groupWidth / 2).toString());
        countText.setAttribute('y', (blockY + countHeight).toString());
        countText.setAttribute('text-anchor', 'middle');
        countText.setAttribute('font-size', '16');
        countText.setAttribute('font-weight', 'bold');
        countText.setAttribute('fill', fillColor);
        countText.setAttribute('class', 'rough-text');
        countText.textContent = grupo.cantidad.toString();
        svgRef.current?.appendChild(countText);

        currentY = blockY + countHeight + groupSpacing;
      });

      const svgWidth = maxWidth + padding * 2;
      const svgHeight = currentY + padding;
      
      svgRef.current.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
      svgRef.current.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svgRef.current.style.width = '100%';
      svgRef.current.style.maxWidth = `${svgWidth}px`;
      svgRef.current.style.height = 'auto';
    }

  }, [elementos, disposicion, tamanoBloque]);

  return (
    <div className={`bloques-agrupados disposicion-${disposicion}`}>
      <svg ref={svgRef} className="bloques-svg" />
    </div>
  );
};
