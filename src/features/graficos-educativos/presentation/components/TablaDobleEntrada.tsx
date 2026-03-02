import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoTablaDobleEntrada } from '../../domain/types';
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoTablaDobleEntrada;
}

/**
 * Divide texto en múltiples líneas según el ancho máximo aproximado
 */
const wrapText = (text: string, maxWidth: number, fontSize: number = 14): string[] => {
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

/**
 * Componente para tablas de doble entrada
 * Esencial para organizar información y resolver problemas
 */
export const TablaDobleEntrada: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Transformar datos del backend si vienen en formato {elementos: [{figura, cantidad}]}
  const getTableData = () => {
    // Si ya tiene el formato correcto, usarlo directamente
    if (data.encabezadosColumnas && data.encabezadosFilas && data.datos) {
      return {
        encabezadosColumnas: data.encabezadosColumnas,
        encabezadosFilas: data.encabezadosFilas,
        datos: data.datos,
        colorEncabezado: data.colorEncabezado
      };
    }

    // Si viene del backend con formato {elementos: [{figura, cantidad}]}
    if (data.elementos && Array.isArray(data.elementos)) {
      const elementos = data.elementos as any[];
      
      // Crear tabla simple: Figura | Cantidad
      const encabezadosColumnas = ['Cantidad'];
      const encabezadosFilas = elementos.map((elem: any) => elem.figura || elem.nombre || 'Item');
      const datos = elementos.map((elem: any) => [elem.cantidad || elem.valor || 0]);

      return {
        encabezadosColumnas,
        encabezadosFilas,
        datos,
        colorEncabezado: data.colorEncabezado
      };
    }

    // Fallback: tabla vacía
    return {
      encabezadosColumnas: ['Dato'],
      encabezadosFilas: ['Sin datos'],
      datos: [[0]],
      colorEncabezado: data.colorEncabezado
    };
  };

  const { encabezadosColumnas, encabezadosFilas, datos, colorEncabezado } = getTableData();

  useEffect(() => {
    if (!svgRef.current) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const anchoCelda = 130; // Aumentado para más espacio
    const baseAltoCelda = 50;
    const lineHeight = 16;
    const margenX = 20;
    const margenY = 20;
    const color = resolveColor(colorEncabezado, roughColors.azul);

    // Calcular altura de cada fila basándose en el contenido del encabezado de fila
    const rowHeights: number[] = encabezadosFilas.map((encabezado) => {
      const lines = wrapText(encabezado, anchoCelda - 20, 14);
      return Math.max(baseAltoCelda, 20 + lines.length * lineHeight);
    });

    // Celda vacía superior izquierda
    const celdaVacia = rc.rectangle(margenX, margenY, anchoCelda, baseAltoCelda, {
      ...defaultRoughConfig,
      strokeWidth: 2,
      roughness: 0.8
    });
    svgRef.current.appendChild(celdaVacia);

    // Encabezados de columnas
    encabezadosColumnas.forEach((encabezado, idx) => {
      const x = margenX + anchoCelda + (idx * anchoCelda);
      const y = margenY;

      const celda = rc.rectangle(x, y, anchoCelda, baseAltoCelda, {
        ...defaultRoughConfig,
        stroke: color,
        fill: color,
        fillStyle: 'solid',
        strokeWidth: 2,
        roughness: 0.8
      });
      svgRef.current!.appendChild(celda);

      // Wrap text en encabezados de columna
      const lines = wrapText(encabezado, anchoCelda - 20, 14);
      const totalTextHeight = lines.length * lineHeight;
      const startY = y + (baseAltoCelda - totalTextHeight) / 2 + lineHeight / 2 + 3;
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '14');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('font-family', 'Comic Sans MS, cursive');
      text.setAttribute('fill', '#1e293b');
      
      lines.forEach((line, lineIdx) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', (x + anchoCelda / 2).toString());
        tspan.setAttribute('y', (startY + lineIdx * lineHeight).toString());
        tspan.textContent = line;
        text.appendChild(tspan);
      });
      svgRef.current!.appendChild(text);
    });

    // Encabezados de filas y datos
    let currentY = margenY + baseAltoCelda;
    encabezadosFilas.forEach((encabezado, filaIdx) => {
      const altoCelda = rowHeights[filaIdx];

      // Encabezado de fila con wrap
      const celdaFila = rc.rectangle(margenX, currentY, anchoCelda, altoCelda, {
        ...defaultRoughConfig,
        stroke: color,
        fill: color,
        fillStyle: 'solid',
        strokeWidth: 2,
        roughness: 0.8
      });
      svgRef.current!.appendChild(celdaFila);

      const lines = wrapText(encabezado, anchoCelda - 20, 14);
      const totalTextHeight = lines.length * lineHeight;
      const startTextY = currentY + (altoCelda - totalTextHeight) / 2 + lineHeight / 2 + 3;
      
      const textFila = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textFila.setAttribute('text-anchor', 'middle');
      textFila.setAttribute('font-size', '14');
      textFila.setAttribute('font-weight', 'bold');
      textFila.setAttribute('font-family', 'Comic Sans MS, cursive');
      textFila.setAttribute('fill', '#1e293b');
      
      lines.forEach((line, lineIdx) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', (margenX + anchoCelda / 2).toString());
        tspan.setAttribute('y', (startTextY + lineIdx * lineHeight).toString());
        tspan.textContent = line;
        textFila.appendChild(tspan);
      });
      svgRef.current!.appendChild(textFila);

      // Datos de la fila
      datos[filaIdx]?.forEach((dato, colIdx) => {
        const x = margenX + anchoCelda + (colIdx * anchoCelda);

        const celdaDato = rc.rectangle(x, currentY, anchoCelda, altoCelda, {
          ...defaultRoughConfig,
          strokeWidth: 2,
          roughness: 0.8
        });
        svgRef.current!.appendChild(celdaDato);

        const datoStr = dato.toString();
        const datoLines = wrapText(datoStr, anchoCelda - 20, 14);
        const datoTextHeight = datoLines.length * lineHeight;
        const datoStartY = currentY + (altoCelda - datoTextHeight) / 2 + lineHeight / 2 + 3;

        const textDato = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textDato.setAttribute('text-anchor', 'middle');
        textDato.setAttribute('font-size', '14');
        textDato.setAttribute('font-family', 'Arial');
        textDato.setAttribute('fill', '#1e293b');
        
        datoLines.forEach((line, lineIdx) => {
          const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          tspan.setAttribute('x', (x + anchoCelda / 2).toString());
          tspan.setAttribute('y', (datoStartY + lineIdx * lineHeight).toString());
          tspan.textContent = line;
          textDato.appendChild(tspan);
        });
        svgRef.current!.appendChild(textDato);
      });

      currentY += altoCelda;
    });

    // Actualizar viewBox
    const totalRowsHeight = rowHeights.reduce((sum, h) => sum + h, 0);
    const finalWidth = (encabezadosColumnas.length + 1) * anchoCelda + margenX * 2;
    const finalHeight = baseAltoCelda + totalRowsHeight + margenY * 2;
    svgRef.current.setAttribute('viewBox', `0 0 ${finalWidth} ${finalHeight}`);
    svgRef.current.style.width = '100%';
    svgRef.current.style.maxWidth = `${finalWidth}px`;
    svgRef.current.style.height = 'auto';
  }, [data, encabezadosColumnas, encabezadosFilas, datos, colorEncabezado]);

  const width = (encabezadosColumnas.length + 1) * 100 + 40;
  const height = (encabezadosFilas.length + 1) * 50 + 40;

  return (
    <div className="tabla-doble-entrada-container">
      <svg 
        ref={svgRef} 
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }}
      />
    </div>
  );
};
