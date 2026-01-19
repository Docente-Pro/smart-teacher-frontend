import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { ConfiguracionGrafico } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface TablaDobleEntradaData extends ConfiguracionGrafico {
  encabezadosColumnas?: string[];
  encabezadosFilas?: string[];
  datos?: (string | number)[][];
  colorEncabezado?: string;
}

interface Props {
  data: TablaDobleEntradaData;
}

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

    const anchoCelda = 100;
    const altoCelda = 50;
    const margenX = 20;
    const margenY = 20;
    const color = colorEncabezado || roughColors.azul;

    // Celda vacía superior izquierda
    const celdaVacia = rc.rectangle(margenX, margenY, anchoCelda, altoCelda, {
      ...defaultRoughConfig,
      strokeWidth: 2,
      roughness: 0.8
    });
    svgRef.current.appendChild(celdaVacia);

    // Encabezados de columnas
    encabezadosColumnas.forEach((encabezado, idx) => {
      const x = margenX + anchoCelda + (idx * anchoCelda);
      const y = margenY;

      const celda = rc.rectangle(x, y, anchoCelda, altoCelda, {
        ...defaultRoughConfig,
        stroke: color,
        fill: color,
        fillStyle: 'cross-hatch',
        fillWeight: 0.5,
        strokeWidth: 2,
        roughness: 0.8
      });
      svgRef.current!.appendChild(celda);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (x + anchoCelda / 2).toString());
      text.setAttribute('y', (y + altoCelda / 2 + 5).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '14');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('font-family', 'Comic Sans MS, cursive');
      text.setAttribute('fill', '#1e293b');
      text.textContent = encabezado;
      svgRef.current!.appendChild(text);
    });

    // Encabezados de filas y datos
    encabezadosFilas.forEach((encabezado, filaIdx) => {
      const y = margenY + altoCelda + (filaIdx * altoCelda);

      // Encabezado de fila
      const celdaFila = rc.rectangle(margenX, y, anchoCelda, altoCelda, {
        ...defaultRoughConfig,
        stroke: color,
        fill: color,
        fillStyle: 'cross-hatch',
        fillWeight: 0.5,
        strokeWidth: 2,
        roughness: 0.8
      });
      svgRef.current!.appendChild(celdaFila);

      const textFila = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textFila.setAttribute('x', (margenX + anchoCelda / 2).toString());
      textFila.setAttribute('y', (y + altoCelda / 2 + 5).toString());
      textFila.setAttribute('text-anchor', 'middle');
      textFila.setAttribute('font-size', '14');
      textFila.setAttribute('font-weight', 'bold');
      textFila.setAttribute('font-family', 'Comic Sans MS, cursive');
      textFila.setAttribute('fill', '#1e293b');
      textFila.textContent = encabezado;
      svgRef.current!.appendChild(textFila);

      // Datos de la fila
      datos[filaIdx]?.forEach((dato, colIdx) => {
        const x = margenX + anchoCelda + (colIdx * anchoCelda);

        const celdaDato = rc.rectangle(x, y, anchoCelda, altoCelda, {
          ...defaultRoughConfig,
          strokeWidth: 2,
          roughness: 0.8
        });
        svgRef.current!.appendChild(celdaDato);

        const textDato = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textDato.setAttribute('x', (x + anchoCelda / 2).toString());
        textDato.setAttribute('y', (y + altoCelda / 2 + 5).toString());
        textDato.setAttribute('text-anchor', 'middle');
        textDato.setAttribute('font-size', '14');
        textDato.setAttribute('font-family', 'Arial');
        textDato.setAttribute('fill', '#1e293b');
        textDato.textContent = dato.toString();
        svgRef.current!.appendChild(textDato);
      });
    });

  }, [data]);

  const width = (encabezadosColumnas.length + 1) * 100 + 40;
  const height = (encabezadosFilas.length + 1) * 50 + 40;

  return (
    <div className="tabla-doble-entrada-container">
      {data.titulo && <h3 className="grafico-titulo">{data.titulo}</h3>}
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};
