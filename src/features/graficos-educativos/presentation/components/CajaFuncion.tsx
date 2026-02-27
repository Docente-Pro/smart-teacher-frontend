import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoCajaFuncion } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoCajaFuncion;
}

export const CajaFuncion: React.FC<Props> = ({ data }) => {
  const { regla, pares, incognitas = [], mostrarRegla = true } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || pares.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const centerX = 250;
    const boxW = 140;
    const boxH = 80;
    const boxY = 30;

    // Caja de función (máquina)
    svgRef.current.appendChild(rc.rectangle(centerX - boxW / 2, boxY, boxW, boxH, {
      ...defaultRoughConfig, stroke: roughColors.morado, fill: roughColors.morado, fillStyle: 'solid', strokeWidth: 3, roughness: 0.8,
    }));

    // Engranajes decorativos
    const gear = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    gear.setAttribute('x', (centerX - 20).toString());
    gear.setAttribute('y', (boxY + boxH / 2 + 5).toString());
    gear.setAttribute('font-size', '24');
    gear.textContent = '⚙️';
    svgRef.current.appendChild(gear);

    // Regla
    if (mostrarRegla) {
      const rText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      rText.setAttribute('x', (centerX + 15).toString());
      rText.setAttribute('y', (boxY + boxH / 2 + 6).toString());
      rText.setAttribute('text-anchor', 'start');
      rText.setAttribute('font-size', '16');
      rText.setAttribute('font-weight', 'bold');
      rText.setAttribute('font-family', 'Comic Sans MS, cursive');
      rText.setAttribute('fill', '#fff');
      rText.textContent = regla;
      svgRef.current.appendChild(rText);
    }

    // Pares entrada/salida
    const startY = boxY + boxH + 30;
    const pairH = 50;

    pares.forEach((par, idx) => {
      const y = startY + idx * pairH;
      const esIncognita = incognitas.includes(idx);

      // Flecha entrada
      svgRef.current!.appendChild(rc.line(40, y + 15, centerX - boxW / 2 - 30, y + 15, {
        stroke: roughColors.azul, strokeWidth: 2, roughness: 0.8,
      }));

      // Valor entrada
      const entBox = rc.rectangle(10, y, 60, 30, {
        ...defaultRoughConfig, stroke: roughColors.azul, fill: roughColors.azul, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
      });
      svgRef.current!.appendChild(entBox);

      const entText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      entText.setAttribute('x', '40');
      entText.setAttribute('y', (y + 20).toString());
      entText.setAttribute('text-anchor', 'middle');
      entText.setAttribute('font-size', '16');
      entText.setAttribute('font-weight', 'bold');
      entText.setAttribute('font-family', 'Comic Sans MS, cursive');
      entText.setAttribute('fill', '#fff');
      svgRef.current!.appendChild(entText);

      // Flecha salida
      svgRef.current!.appendChild(rc.line(centerX + boxW / 2 + 30, y + 15, 460, y + 15, {
        stroke: roughColors.rojo, strokeWidth: 2, roughness: 0.8,
      }));

      // Valor salida
      const salBox = rc.rectangle(430, y, 60, 30, {
        ...defaultRoughConfig, stroke: roughColors.rojo, fill: esIncognita ? roughColors.amarillo : roughColors.rojo, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
      });
      svgRef.current!.appendChild(salBox);

      const salText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      salText.setAttribute('x', '460');
      salText.setAttribute('y', (y + 20).toString());
      salText.setAttribute('text-anchor', 'middle');
      salText.setAttribute('font-size', '16');
      salText.setAttribute('font-weight', 'bold');
      salText.setAttribute('font-family', 'Comic Sans MS, cursive');
      salText.setAttribute('fill', esIncognita ? '#1e293b' : '#fff');
      svgRef.current!.appendChild(salText);
    });

    // Labels
    const labIn = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labIn.setAttribute('x', '40');
    labIn.setAttribute('y', (startY - 10).toString());
    labIn.setAttribute('text-anchor', 'middle');
    labIn.setAttribute('font-size', '13');
    labIn.setAttribute('font-weight', 'bold');
    labIn.setAttribute('font-family', 'Comic Sans MS, cursive');
    labIn.setAttribute('fill', roughColors.azul);
    labIn.textContent = 'Entrada';
    svgRef.current.appendChild(labIn);

    const labOut = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labOut.setAttribute('x', '460');
    labOut.setAttribute('y', (startY - 10).toString());
    labOut.setAttribute('text-anchor', 'middle');
    labOut.setAttribute('font-size', '13');
    labOut.setAttribute('font-weight', 'bold');
    labOut.setAttribute('font-family', 'Comic Sans MS, cursive');
    labOut.setAttribute('fill', roughColors.rojo);
    labOut.textContent = 'Salida';
    svgRef.current.appendChild(labOut);
  }, [data]);

  const height = 110 + 30 + pares.length * 50 + 20;

  return (
    <div className="caja-funcion-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 500 ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: '500px', height: 'auto' }} />
    </div>
  );
};
