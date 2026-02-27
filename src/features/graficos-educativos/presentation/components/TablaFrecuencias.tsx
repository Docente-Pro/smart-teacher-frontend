import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoTablaFrecuencias } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoTablaFrecuencias;
}

export const TablaFrecuencias: React.FC<Props> = ({ data }) => {
  const { datos, mostrarConteo = true, mostrarRelativa = false, mostrarAcumulada = false, totalDatos } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || datos.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const anchoCelda = 100;
    const altoCelda = 40;
    const margen = 20;

    // Determinar columnas
    const columnas: string[] = ['Dato'];
    if (mostrarConteo) columnas.push('Conteo');
    columnas.push('Frecuencia');
    if (mostrarRelativa) columnas.push('f. Relativa');
    if (mostrarAcumulada) columnas.push('f. Acumulada');

    // Encabezados
    columnas.forEach((col, idx) => {
      const x = margen + idx * anchoCelda;
      const celda = rc.rectangle(x, margen, anchoCelda, altoCelda, {
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
      t.setAttribute('y', (margen + altoCelda / 2 + 5).toString());
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '12');
      t.setAttribute('font-weight', 'bold');
      t.setAttribute('font-family', 'Comic Sans MS, cursive');
      t.setAttribute('fill', '#1e293b');
      t.textContent = col;
      svgRef.current!.appendChild(t);
    });

    // Filas de datos
    datos.forEach((fila, rowIdx) => {
      const y = margen + altoCelda + rowIdx * altoCelda;
      let colIdx = 0;

      // Dato
      const drawCell = (value: string, ci: number) => {
        const x = margen + ci * anchoCelda;
        svgRef.current!.appendChild(rc.rectangle(x, y, anchoCelda, altoCelda, {
          ...defaultRoughConfig, strokeWidth: 2, roughness: 0.8,
        }));
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', (x + anchoCelda / 2).toString());
        t.setAttribute('y', (y + altoCelda / 2 + 5).toString());
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('font-size', '13');
        t.setAttribute('font-family', 'Arial');
        t.setAttribute('fill', '#1e293b');
        t.textContent = value;
        svgRef.current!.appendChild(t);
      };

      drawCell(String(fila.dato), colIdx++);
      if (mostrarConteo) drawCell(fila.conteo || '|'.repeat(fila.frecuencia), colIdx++);
      drawCell(fila.frecuencia.toString(), colIdx++);
      if (mostrarRelativa) drawCell(fila.frecuenciaRelativa !== undefined ? fila.frecuenciaRelativa.toFixed(2) : '-', colIdx++);
      if (mostrarAcumulada) drawCell(fila.frecuenciaAcumulada !== undefined ? fila.frecuenciaAcumulada.toString() : '-', colIdx++);
    });

    // Fila de total
    if (totalDatos !== undefined) {
      const y = margen + altoCelda + datos.length * altoCelda;
      const x = margen;
      svgRef.current.appendChild(rc.rectangle(x, y, anchoCelda, altoCelda, {
        ...defaultRoughConfig, stroke: roughColors.verde, fill: roughColors.verde, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
      }));
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', (x + anchoCelda / 2).toString());
      t.setAttribute('y', (y + altoCelda / 2 + 5).toString());
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
      svgRef.current.appendChild(rc.rectangle(xFreq, y, anchoCelda, altoCelda, { ...defaultRoughConfig, strokeWidth: 2, roughness: 0.8 }));
      const tf = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tf.setAttribute('x', (xFreq + anchoCelda / 2).toString());
      tf.setAttribute('y', (y + altoCelda / 2 + 5).toString());
      tf.setAttribute('text-anchor', 'middle');
      tf.setAttribute('font-size', '13');
      tf.setAttribute('font-weight', 'bold');
      tf.setAttribute('font-family', 'Arial');
      tf.setAttribute('fill', '#1e293b');
      tf.textContent = totalDatos.toString();
      svgRef.current.appendChild(tf);
    }
  }, [data]);

  const numCols = 2 + (mostrarConteo ? 1 : 0) + (mostrarRelativa ? 1 : 0) + (mostrarAcumulada ? 1 : 0);
  const width = numCols * 100 + 40;
  const height = (datos.length + 2) * 40 + 40;

  return (
    <div className="tabla-frecuencias-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
