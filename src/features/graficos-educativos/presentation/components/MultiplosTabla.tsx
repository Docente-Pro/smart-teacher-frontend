import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoMultiplosTabla } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoMultiplosTabla;
}

export const MultiplosTabla: React.FC<Props> = ({ data }) => {
  const { numero, rango, multiplosDestacados, mostrarTabla100 = false, colorMultiplo } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const cellSize = 38;
    const margen = 20;
    const color = colorMultiplo || roughColors.azul;

    if (mostrarTabla100) {
      // Tabla del 1 al 100
      for (let i = 1; i <= 100; i++) {
        const col = (i - 1) % 10;
        const row = Math.floor((i - 1) / 10);
        const x = margen + col * cellSize;
        const y = margen + row * cellSize;
        const esMultiplo = i % numero === 0;

        svgRef.current.appendChild(rc.rectangle(x, y, cellSize, cellSize, {
          ...defaultRoughConfig,
          strokeWidth: 1.5,
          roughness: 0.6,
          ...(esMultiplo ? { fill: color, fillStyle: 'solid' as const } : {}),
        }));

        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', (x + cellSize / 2).toString());
        t.setAttribute('y', (y + cellSize / 2 + 5).toString());
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('font-size', '12');
        t.setAttribute('font-weight', esMultiplo ? 'bold' : 'normal');
        t.setAttribute('font-family', 'Comic Sans MS, cursive');
        t.setAttribute('fill', esMultiplo ? '#fff' : '#94a3b8');
        t.textContent = i.toString();
        svgRef.current.appendChild(t);
      }

      // Leyenda
      const ly = margen + 10 * cellSize + 20;
      svgRef.current.appendChild(rc.rectangle(margen, ly, 18, 18, { fill: color, fillStyle: 'solid' as const, strokeWidth: 1, roughness: 0.5 }));
      const lt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lt.setAttribute('x', (margen + 26).toString());
      lt.setAttribute('y', (ly + 14).toString());
      lt.setAttribute('font-size', '13');
      lt.setAttribute('font-family', 'Comic Sans MS, cursive');
      lt.setAttribute('fill', '#1e293b');
      lt.textContent = `Múltiplos de ${numero}`;
      svgRef.current.appendChild(lt);
    } else {
      // Lista horizontal de múltiplos
      const multiplos: number[] = [];
      for (let v = rango.inicio; v <= rango.fin; v++) {
        if (v % numero === 0) multiplos.push(v);
      }

      multiplos.forEach((m, idx) => {
        const x = margen + idx * (cellSize + 10);
        const y = margen + 20;
        const esDestacado = multiplosDestacados?.includes(m);

        svgRef.current!.appendChild(rc.circle(x + cellSize / 2, y + cellSize / 2, cellSize, {
          ...defaultRoughConfig,
          stroke: color,
          fill: esDestacado ? color : undefined,
          fillStyle: 'solid' as const,
          strokeWidth: 2,
          roughness: 0.8,
        }));

        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', (x + cellSize / 2).toString());
        t.setAttribute('y', (y + cellSize / 2 + 5).toString());
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('font-size', '14');
        t.setAttribute('font-weight', 'bold');
        t.setAttribute('font-family', 'Comic Sans MS, cursive');
        t.setAttribute('fill', esDestacado ? '#fff' : '#1e293b');
        t.textContent = m.toString();
        svgRef.current!.appendChild(t);
      });

      // Título
      const titulo = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      titulo.setAttribute('x', margen.toString());
      titulo.setAttribute('y', '20');
      titulo.setAttribute('font-size', '15');
      titulo.setAttribute('font-weight', 'bold');
      titulo.setAttribute('font-family', 'Comic Sans MS, cursive');
      titulo.setAttribute('fill', color);
      titulo.textContent = `Múltiplos de ${numero}`;
      svgRef.current.appendChild(titulo);
    }
  }, [data]);

  let width: number, height: number;
  if (mostrarTabla100) {
    width = 10 * 38 + 40;
    height = 10 * 38 + 70;
  } else {
    const count = Math.floor((rango.fin - rango.inicio) / numero) + 1;
    width = count * 48 + 40;
    height = 120;
  }

  return (
    <div className="multiplos-tabla-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
