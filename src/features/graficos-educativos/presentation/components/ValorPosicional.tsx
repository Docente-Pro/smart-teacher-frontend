import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoValorPosicional } from '../../domain/types';
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoValorPosicional;
}

export const ValorPosicional: React.FC<Props> = ({ data }) => {
  const { numero, posiciones, mostrarDescomposicion = true, estilo = 'tabla' } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const anchoCelda = 90;
    const altoCelda = 60;
    const margen = 30;

    // Título del número
    const tituloText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tituloText.setAttribute('x', (margen + (posiciones.length * anchoCelda) / 2).toString());
    tituloText.setAttribute('y', '30');
    tituloText.setAttribute('text-anchor', 'middle');
    tituloText.setAttribute('font-size', '24');
    tituloText.setAttribute('font-weight', 'bold');
    tituloText.setAttribute('font-family', 'Comic Sans MS, cursive');
    tituloText.setAttribute('fill', '#1e293b');
    tituloText.textContent = numero.toString();
    svgRef.current.appendChild(tituloText);

    const startY = 50;

    // Encabezados de posición
    posiciones.forEach((pos, idx) => {
      const x = margen + idx * anchoCelda;
      const color = resolveColor(pos.color, roughColors.azul);

      const celda = rc.rectangle(x, startY, anchoCelda, altoCelda, {
        ...defaultRoughConfig,
        stroke: color,
        fill: color,
        fillStyle: 'solid',
        strokeWidth: 2,
        roughness: 0.8,
      });
      svgRef.current!.appendChild(celda);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', (x + anchoCelda / 2).toString());
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '12');
      label.setAttribute('font-weight', 'bold');
      label.setAttribute('font-family', 'Comic Sans MS, cursive');
      label.setAttribute('fill', '#fff');

      // Dividir texto largo en líneas para que quepa en la celda
      const palabras = pos.posicion.split(' ');
      const lineas: string[] = [];
      let lineaActual = '';
      for (const palabra of palabras) {
        const test = lineaActual ? lineaActual + ' ' + palabra : palabra;
        if (test.length > 10 && lineaActual) {
          lineas.push(lineaActual);
          lineaActual = palabra;
        } else {
          lineaActual = test;
        }
      }
      if (lineaActual) lineas.push(lineaActual);

      const lineHeight = 14;
      const totalTextH = lineas.length * lineHeight;
      const baseY = startY + altoCelda / 2 - totalTextH / 2 + lineHeight / 2 + 2;

      lineas.forEach((linea, li) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', (x + anchoCelda / 2).toString());
        tspan.setAttribute('y', (baseY + li * lineHeight).toString());
        tspan.textContent = linea;
        label.appendChild(tspan);
      });

      svgRef.current!.appendChild(label);
    });

    // Dígitos
    posiciones.forEach((pos, idx) => {
      const x = margen + idx * anchoCelda;
      const y = startY + altoCelda;

      const celda = rc.rectangle(x, y, anchoCelda, altoCelda, {
        ...defaultRoughConfig,
        strokeWidth: 2,
        roughness: 0.8,
      });
      svgRef.current!.appendChild(celda);

      const digitText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      digitText.setAttribute('x', (x + anchoCelda / 2).toString());
      digitText.setAttribute('y', (y + altoCelda / 2 + 8).toString());
      digitText.setAttribute('text-anchor', 'middle');
      digitText.setAttribute('font-size', '28');
      digitText.setAttribute('font-weight', 'bold');
      digitText.setAttribute('font-family', 'Comic Sans MS, cursive');
      digitText.setAttribute('fill', resolveColor(pos.color, roughColors.azul));
      digitText.textContent = pos.digito.toString();
      svgRef.current!.appendChild(digitText);
    });

    // Descomposición
    if (mostrarDescomposicion) {
      const yDescomp = startY + altoCelda * 2 + 20;
      posiciones.forEach((pos, idx) => {
        const x = margen + idx * anchoCelda;
        const color = resolveColor(pos.color, roughColors.azul);

        const valorText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valorText.setAttribute('x', (x + anchoCelda / 2).toString());
        valorText.setAttribute('y', yDescomp.toString());
        valorText.setAttribute('text-anchor', 'middle');
        valorText.setAttribute('font-size', '16');
        valorText.setAttribute('font-family', 'Comic Sans MS, cursive');
        valorText.setAttribute('fill', color);
        valorText.textContent = pos.valor.toString();
        svgRef.current!.appendChild(valorText);

        if (idx < posiciones.length - 1) {
          const plusText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          plusText.setAttribute('x', (x + anchoCelda + 2).toString());
          plusText.setAttribute('y', yDescomp.toString());
          plusText.setAttribute('text-anchor', 'middle');
          plusText.setAttribute('font-size', '18');
          plusText.setAttribute('font-weight', 'bold');
          plusText.setAttribute('font-family', 'Comic Sans MS, cursive');
          plusText.setAttribute('fill', '#1e293b');
          plusText.textContent = '+';
          svgRef.current!.appendChild(plusText);
        }
      });
    }
  }, [data]);

  const width = posiciones.length * 90 + 60;
  const height = mostrarDescomposicion ? 250 : 200;

  return (
    <div className="valor-posicional-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
