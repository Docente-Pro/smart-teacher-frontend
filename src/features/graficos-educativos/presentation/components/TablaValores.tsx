import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoTablaValores } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';
import '../styles/TablaValores.css';

interface Props {
  data: GraficoTablaValores;
}

/**
 * Componente para renderizar tablas de valores genéricas con estilo dibujado a mano
 * Útil para mostrar datos tabulares diversos
 */
export const TablaValores: React.FC<Props> = ({ data }) => {
  // Normalizar datos: el backend puede enviar formato nuevo (2D array de objetos)
  // o el formato esperado (encabezados + elementos con celdas)
  const normalizado = React.useMemo(() => {
    let encabezados: string[] = data.encabezados || [];
    let elementos: { celdas: (string | number)[] }[] = [];
    const mostrarBordes = data.mostrarBordes ?? true;

    if (encabezados.length > 0 && data.elementos?.length > 0 && 'celdas' in (data.elementos[0] || {})) {
      // Formato original: encabezados[] + elementos[].celdas[]
      elementos = data.elementos as any;
    } else if (Array.isArray(data.elementos) && data.elementos.length > 0) {
      // Formato backend nuevo: array 2D de objetos {tipo, contenido, esEncabezado}
      const filas = data.elementos as any[];
      filas.forEach((fila: any) => {
        if (!Array.isArray(fila)) return;
        const esFilaEncabezado = fila.some((celda: any) => celda?.esEncabezado);
        if (esFilaEncabezado && encabezados.length === 0) {
          encabezados = fila.map((celda: any) =>
            String(celda?.contenido ?? celda ?? '')
          );
        } else {
          elementos.push({
            celdas: fila.map((celda: any) =>
              celda?.contenido !== undefined ? celda.contenido : celda
            ),
          });
        }
      });
    }

    // Fallback si no se encontraron encabezados
    if (encabezados.length === 0 && elementos.length > 0) {
      encabezados = elementos[0].celdas.map((_, i) => `Col ${i + 1}`);
    }

    return { encabezados, elementos, mostrarBordes };
  }, [data]);

  const { encabezados, elementos, mostrarBordes } = normalizado;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    if (encabezados.length === 0) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const padding = 15;
    const rowHeight = 40;
    const cellWidth = 120;
    const colCount = encabezados.length;
    const tableWidth = colCount * cellWidth + padding * 2;
    const headerHeight = 45;
    const tableHeight = headerHeight + elementos.length * rowHeight + padding;

    if (mostrarBordes) {
      // Borde exterior de la tabla
      const tableBorder = rc.rectangle(10, 10, tableWidth, tableHeight, {
        ...defaultRoughConfig,
        fill: '#FFFFFF',
        fillStyle: 'solid',
        stroke: roughColors.azul,
        strokeWidth: 2,
        roughness: 0.8
      });
      svgRef.current.appendChild(tableBorder);
    }

    // Fondo del header
    const headerBg = rc.rectangle(10, 10, tableWidth, headerHeight, {
      ...defaultRoughConfig,
      fill: roughColors.azul,
      fillStyle: 'cross-hatch',
      stroke: mostrarBordes ? roughColors.azul : 'transparent',
      strokeWidth: 2,
      roughness: 0.8
    });
    svgRef.current.appendChild(headerBg);

    // Encabezados
    encabezados.forEach((encabezado, idx) => {
      const headerX = padding + idx * cellWidth + cellWidth / 2;
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', headerX.toString());
      text.setAttribute('y', '35');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '14');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#2C3E50');
      text.setAttribute('class', 'rough-text');
      text.textContent = encabezado;
      svgRef.current?.appendChild(text);

      // Líneas verticales del header
      if (mostrarBordes && idx > 0) {
        const vLine = rc.line(
          padding + idx * cellWidth,
          10,
          padding + idx * cellWidth,
          headerHeight + 10,
          {
            stroke: roughColors.azul,
            strokeWidth: 1.5,
            roughness: 0.6
          }
        );
        svgRef.current?.appendChild(vLine);
      }
    });

    // Filas de datos
    let currentY = headerHeight + 10;
    elementos.forEach((fila, _idxFila) => {
      // Línea divisoria horizontal
      if (mostrarBordes) {
        const hLine = rc.line(10, currentY, tableWidth + 10, currentY, {
          stroke: '#E3F2FD',
          strokeWidth: 1,
          roughness: 0.4
        });
        svgRef.current?.appendChild(hLine);
      }

      // Celdas de la fila
      fila.celdas.forEach((celda, idxCelda) => {
        const cellX = padding + idxCelda * cellWidth + cellWidth / 2;
        const cellY = currentY + rowHeight / 2 + 5;

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', cellX.toString());
        text.setAttribute('y', cellY.toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '13');
        text.setAttribute('fill', '#2C3E50');
        text.setAttribute('class', 'rough-text');
        text.textContent = typeof celda === 'number' ? celda.toString() : celda;
        svgRef.current?.appendChild(text);

        // Líneas verticales
        if (mostrarBordes && idxCelda > 0) {
          const vLine = rc.line(
            padding + idxCelda * cellWidth,
            currentY,
            padding + idxCelda * cellWidth,
            currentY + rowHeight,
            {
              stroke: '#E3F2FD',
              strokeWidth: 1,
              roughness: 0.4
            }
          );
          svgRef.current?.appendChild(vLine);
        }
      });

      currentY += rowHeight;
    });

    const svgWidth = tableWidth + 30;
    const svgHeight = tableHeight + 20;
    
    svgRef.current.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svgRef.current.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svgRef.current.style.width = '100%';
    svgRef.current.style.maxWidth = `${svgWidth}px`;
    svgRef.current.style.height = 'auto';
  }, [encabezados, elementos, mostrarBordes]);

  return (
    <div className={`tabla-valores ${mostrarBordes ? 'con-bordes' : 'sin-bordes'}`}>
      <svg ref={svgRef} className="tabla-svg" />
    </div>
  );
};
