import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoTablaFrecuencias } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoTablaFrecuencias;
}

/**
 * Divide texto en múltiples líneas según el ancho máximo aproximado
 */
const wrapText = (text: string, maxWidth: number, fontSize: number = 13): string[] => {
  const charWidth = fontSize * 0.55;
  const maxChars = Math.floor(maxWidth / charWidth);
  
  if (text.length <= maxChars) return [text];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxChars) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      if (word.length > maxChars) {
        let remaining = word;
        while (remaining.length > maxChars) {
          lines.push(remaining.substring(0, maxChars - 1) + '-');
          remaining = remaining.substring(maxChars - 1);
        }
        currentLine = remaining;
      } else {
        currentLine = word;
      }
    }
  }
  if (currentLine) lines.push(currentLine);
  
  return lines.slice(0, 3);
};

export const TablaFrecuencias: React.FC<Props> = ({ data }) => {
  const { datos, mostrarConteo = true, mostrarRelativa = false, mostrarAcumulada = false, totalDatos } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || datos.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const anchoCelda = 120; // Aumentado para más espacio
    const baseAltoCelda = 40;
    const lineHeight = 16;
    const margen = 20;

    // Determinar columnas
    const columnas: string[] = ['Dato'];
    if (mostrarConteo) columnas.push('Conteo');
    columnas.push('Frecuencia');
    if (mostrarRelativa) columnas.push('f. Relativa');
    if (mostrarAcumulada) columnas.push('f. Acumulada');

    // Calcular altura de cada fila basándose en el contenido del dato
    const rowHeights: number[] = datos.map((fila) => {
      const lines = wrapText(String(fila.dato), anchoCelda - 20, 13);
      return Math.max(baseAltoCelda, 15 + lines.length * lineHeight);
    });

    // Encabezados
    columnas.forEach((col, idx) => {
      const x = margen + idx * anchoCelda;
      const celda = rc.rectangle(x, margen, anchoCelda, baseAltoCelda, {
        ...defaultRoughConfig,
        stroke: roughColors.azul,
        fill: roughColors.azul,
        fillStyle: 'solid',
        strokeWidth: 2,
        roughness: 0.8,
      });
      svgRef.current!.appendChild(celda);

      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', (x + anchoCelda / 2).toString());
      t.setAttribute('y', (margen + baseAltoCelda / 2 + 5).toString());
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '12');
      t.setAttribute('font-weight', 'bold');
      t.setAttribute('font-family', 'Comic Sans MS, cursive');
      t.setAttribute('fill', '#1e293b');
      t.textContent = col;
      svgRef.current!.appendChild(t);
    });

    // Filas de datos
    let currentY = margen + baseAltoCelda;
    datos.forEach((fila, rowIdx) => {
      const altoCelda = rowHeights[rowIdx];
      let colIdx = 0;

      // Función para dibujar celda con wrap de texto
      const drawCellWithWrap = (value: string, ci: number, isFirst: boolean = false) => {
        const x = margen + ci * anchoCelda;
        svgRef.current!.appendChild(rc.rectangle(x, currentY, anchoCelda, altoCelda, {
          ...defaultRoughConfig, strokeWidth: 2, roughness: 0.8,
        }));
        
        if (isFirst) {
          // Primera columna: aplicar wrapping
          const lines = wrapText(value, anchoCelda - 20, 13);
          const totalTextHeight = lines.length * lineHeight;
          const startTextY = currentY + (altoCelda - totalTextHeight) / 2 + lineHeight / 2 + 3;
          
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          t.setAttribute('text-anchor', 'middle');
          t.setAttribute('font-size', '13');
          t.setAttribute('font-family', 'Arial');
          t.setAttribute('fill', '#1e293b');
          
          lines.forEach((line, lineIdx) => {
            const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            tspan.setAttribute('x', (x + anchoCelda / 2).toString());
            tspan.setAttribute('y', (startTextY + lineIdx * lineHeight).toString());
            tspan.textContent = line;
            t.appendChild(tspan);
          });
          svgRef.current!.appendChild(t);
        } else {
          // Otras columnas: centrado simple
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          t.setAttribute('x', (x + anchoCelda / 2).toString());
          t.setAttribute('y', (currentY + altoCelda / 2 + 5).toString());
          t.setAttribute('text-anchor', 'middle');
          t.setAttribute('font-size', '13');
          t.setAttribute('font-family', 'Arial');
          t.setAttribute('fill', '#1e293b');
          t.textContent = value;
          svgRef.current!.appendChild(t);
        }
      };

      drawCellWithWrap(String(fila.dato), colIdx++, true);
      if (mostrarConteo) drawCellWithWrap(fila.conteo || '|'.repeat(fila.frecuencia), colIdx++);
      drawCellWithWrap(fila.frecuencia.toString(), colIdx++);
      if (mostrarRelativa) drawCellWithWrap(fila.frecuenciaRelativa !== undefined ? fila.frecuenciaRelativa.toFixed(2) : '-', colIdx++);
      if (mostrarAcumulada) drawCellWithWrap(fila.frecuenciaAcumulada !== undefined ? fila.frecuenciaAcumulada.toString() : '-', colIdx++);
      
      currentY += altoCelda;
    });

    // Fila de total
    if (totalDatos !== undefined) {
      const y = currentY;
      const x = margen;
      svgRef.current.appendChild(rc.rectangle(x, y, anchoCelda, baseAltoCelda, {
        ...defaultRoughConfig, stroke: roughColors.verde, fill: roughColors.verde, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
      }));
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', (x + anchoCelda / 2).toString());
      t.setAttribute('y', (y + baseAltoCelda / 2 + 5).toString());
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '13');
      t.setAttribute('font-weight', 'bold');
      t.setAttribute('font-family', 'Comic Sans MS, cursive');
      t.setAttribute('fill', '#1e293b');
      t.textContent = 'Total';
      svgRef.current.appendChild(t);

      // Frecuencia total
      let ci = 1;
      if (mostrarConteo) ci++;
      const xFreq = margen + ci * anchoCelda;
      svgRef.current.appendChild(rc.rectangle(xFreq, y, anchoCelda, baseAltoCelda, { ...defaultRoughConfig, strokeWidth: 2, roughness: 0.8 }));
      const tf = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tf.setAttribute('x', (xFreq + anchoCelda / 2).toString());
      tf.setAttribute('y', (y + baseAltoCelda / 2 + 5).toString());
      tf.setAttribute('text-anchor', 'middle');
      tf.setAttribute('font-size', '13');
      tf.setAttribute('font-weight', 'bold');
      tf.setAttribute('font-family', 'Arial');
      tf.setAttribute('fill', '#1e293b');
      tf.textContent = totalDatos.toString();
      svgRef.current.appendChild(tf);
      
      currentY += baseAltoCelda;
    }

    // Actualizar viewBox
    const totalRowsHeight = rowHeights.reduce((sum, h) => sum + h, 0);
    const finalHeight = margen + baseAltoCelda + totalRowsHeight + (totalDatos !== undefined ? baseAltoCelda : 0) + margen;
    const finalWidth = columnas.length * anchoCelda + margen * 2;
    svgRef.current.setAttribute('viewBox', `0 0 ${finalWidth} ${finalHeight}`);
    svgRef.current.style.width = '100%';
    svgRef.current.style.maxWidth = `${finalWidth}px`;
    svgRef.current.style.height = 'auto';
  }, [data, mostrarConteo, mostrarRelativa, mostrarAcumulada, totalDatos, datos]);

  const numCols = 2 + (mostrarConteo ? 1 : 0) + (mostrarRelativa ? 1 : 0) + (mostrarAcumulada ? 1 : 0);
  const width = numCols * 120 + 40;
  const height = (datos.length + 2) * 50 + 40;

  return (
    <div className="tabla-frecuencias-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
