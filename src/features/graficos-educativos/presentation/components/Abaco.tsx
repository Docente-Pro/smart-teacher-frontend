import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoAbaco } from '../../domain/types';
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoAbaco;
}

export const Abaco: React.FC<Props> = ({ data }) => {
  const { columnas, numero, mostrarValor = true, maxCuentas = 9 } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const colWidth = 80;
    const margen = 50;
    const totalWidth = columnas.length * colWidth + margen * 2;
    const topY = 40;
    const bottomY = 300;
    const cuentaR = 14;

    // Marco del ábaco
    const marco = rc.rectangle(margen - 20, topY - 15, totalWidth - margen * 2 + 40, bottomY - topY + 40, {
      ...defaultRoughConfig,
      stroke: '#8B4513',
      strokeWidth: 3,
      roughness: 1,
    });
    svgRef.current.appendChild(marco);

    // Barra superior
    const barraSuperior = rc.line(margen - 10, topY, totalWidth - margen + 10, topY, {
      stroke: '#8B4513',
      strokeWidth: 4,
      roughness: 0.8,
    });
    svgRef.current.appendChild(barraSuperior);

    columnas.forEach((col, idx) => {
      const x = margen + idx * colWidth + colWidth / 2;
      const color = resolveColor(col.color) || [roughColors.rojo, roughColors.azul, roughColors.verde, roughColors.naranja][idx % 4];

      // Varilla vertical
      const varilla = rc.line(x, topY, x, bottomY, {
        stroke: '#8B4513',
        strokeWidth: 2,
        roughness: 0.5,
      });
      svgRef.current!.appendChild(varilla);

      // Cuentas
      for (let i = 0; i < col.cuentas; i++) {
        const cy = bottomY - 20 - i * (cuentaR * 2 + 4);
        const cuenta = rc.circle(x, cy, cuentaR * 2, {
          ...defaultRoughConfig,
          stroke: color,
          fill: color,
          fillStyle: 'solid',
          strokeWidth: 2,
          roughness: 0.6,
        });
        svgRef.current!.appendChild(cuenta);
      }

      // Etiqueta de posición
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x.toString());
      label.setAttribute('y', (bottomY + 45).toString());
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '12');
      label.setAttribute('font-weight', 'bold');
      label.setAttribute('font-family', 'Comic Sans MS, cursive');
      label.setAttribute('fill', '#1e293b');
      label.textContent = col.posicion;
      svgRef.current!.appendChild(label);

      // Dígito
      const digLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      digLabel.setAttribute('x', x.toString());
      digLabel.setAttribute('y', (bottomY + 65).toString());
      digLabel.setAttribute('text-anchor', 'middle');
      digLabel.setAttribute('font-size', '18');
      digLabel.setAttribute('font-weight', 'bold');
      digLabel.setAttribute('font-family', 'Comic Sans MS, cursive');
      digLabel.setAttribute('fill', color);
      digLabel.textContent = col.cuentas.toString();
      svgRef.current!.appendChild(digLabel);
    });

    // Valor total
    if (mostrarValor) {
      const valText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valText.setAttribute('x', (totalWidth / 2).toString());
      valText.setAttribute('y', (bottomY + 90).toString());
      valText.setAttribute('text-anchor', 'middle');
      valText.setAttribute('font-size', '22');
      valText.setAttribute('font-weight', 'bold');
      valText.setAttribute('font-family', 'Comic Sans MS, cursive');
      valText.setAttribute('fill', roughColors.azul);
      valText.textContent = `= ${numero}`;
      svgRef.current.appendChild(valText);
    }
  }, [data]);

  const width = columnas.length * 80 + 100;
  const height = mostrarValor ? 405 : 375;

  return (
    <div className="abaco-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
