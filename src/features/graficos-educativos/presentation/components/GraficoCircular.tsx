import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoCircular as GraficoCircularType } from '../../domain/types';
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoCircularType;
}

const COLORES_SECTOR = [roughColors.azul, roughColors.rojo, roughColors.verde, roughColors.amarillo, roughColors.naranja, roughColors.morado];

export const GraficoCircularComp: React.FC<Props> = ({ data }) => {
  const { sectores, mostrarPorcentajes = true, mostrarLeyenda = true } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || sectores.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const centerX = 200;
    const centerY = 180;
    const radio = 140;
    const total = sectores.reduce((sum, s) => sum + s.valor, 0);

    let angAcumulado = -Math.PI / 2;

    sectores.forEach((sector, idx) => {
      const porcion = sector.valor / total;
      const angInicio = angAcumulado;
      const angFin = angAcumulado + porcion * 2 * Math.PI;
      const color = resolveColor(sector.color) || COLORES_SECTOR[idx % COLORES_SECTOR.length];

      const x1 = centerX + radio * Math.cos(angInicio);
      const y1 = centerY + radio * Math.sin(angInicio);
      const x2 = centerX + radio * Math.cos(angFin);
      const y2 = centerY + radio * Math.sin(angFin);
      const largeArc = porcion > 0.5 ? 1 : 0;

      const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radio} ${radio} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      const slice = rc.path(pathData, {
        ...defaultRoughConfig,
        fill: color,
        fillStyle: 'solid',
        stroke: '#fff',
        strokeWidth: 2,
        roughness: 0.8,
      });
      svgRef.current!.appendChild(slice);

      // Etiqueta en el sector
      const midAng = angInicio + (angFin - angInicio) / 2;
      const labelR = radio * 0.65;
      const lx = centerX + labelR * Math.cos(midAng);
      const ly = centerY + labelR * Math.sin(midAng);

      if (mostrarPorcentajes) {
        const pctText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        pctText.setAttribute('x', lx.toString());
        pctText.setAttribute('y', ly.toString());
        pctText.setAttribute('text-anchor', 'middle');
        pctText.setAttribute('font-size', '14');
        pctText.setAttribute('font-weight', 'bold');
        pctText.setAttribute('font-family', 'Comic Sans MS, cursive');
        pctText.setAttribute('fill', '#fff');
        pctText.setAttribute('stroke', '#1e293b');
        pctText.setAttribute('stroke-width', '0.3');
        pctText.textContent = `${Math.round(porcion * 100)}%`;
        svgRef.current!.appendChild(pctText);
      }

      angAcumulado = angFin;
    });

    // Leyenda
    if (mostrarLeyenda) {
      sectores.forEach((sector, idx) => {
        const lx = 20;
        const ly = centerY + radio + 30 + idx * 25;
        const color = resolveColor(sector.color) || COLORES_SECTOR[idx % COLORES_SECTOR.length];

        const box = rc.rectangle(lx, ly - 12, 16, 16, {
          fill: color,
          fillStyle: 'solid',
          strokeWidth: 1,
          roughness: 0.5,
        });
        svgRef.current!.appendChild(box);

        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', (lx + 24).toString());
        t.setAttribute('y', (ly + 2).toString());
        t.setAttribute('font-size', '13');
        t.setAttribute('font-family', 'Comic Sans MS, cursive');
        t.setAttribute('fill', '#1e293b');
        t.textContent = `${sector.etiqueta}: ${sector.valor}`;
        svgRef.current!.appendChild(t);
      });
    }
  }, [data]);

  const height = 180 + 140 + (mostrarLeyenda ? 30 + sectores.length * 25 : 20);

  return (
    <div className="grafico-circular-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 400 ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: '400px', height: 'auto' }} />
    </div>
  );
};
