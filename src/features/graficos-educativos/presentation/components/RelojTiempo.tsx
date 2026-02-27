import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoRelojTiempo } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoRelojTiempo;
}

export const RelojTiempo: React.FC<Props> = ({ data }) => {
  const { relojes, formato = '12h', mostrarDigital = true } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || relojes.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const radio = 70;
    const spacing = 200;
    const margen = 100;

    relojes.forEach((reloj, idx) => {
      const cx = margen + idx * spacing;
      const cy = 100;

      // Círculo del reloj
      svgRef.current!.appendChild(rc.circle(cx, cy, radio * 2, {
        ...defaultRoughConfig, stroke: '#2C3E50', strokeWidth: 3, roughness: 0.8,
      }));

      // Marcas de horas
      for (let h = 1; h <= 12; h++) {
        const ang = (h * 30 - 90) * (Math.PI / 180);
        const x1 = cx + (radio - 8) * Math.cos(ang);
        const y1 = cy + (radio - 8) * Math.sin(ang);
        const x2 = cx + (radio - 15) * Math.cos(ang);
        const y2 = cy + (radio - 15) * Math.sin(ang);
        svgRef.current!.appendChild(rc.line(x1, y1, x2, y2, { stroke: '#2C3E50', strokeWidth: 2, roughness: 0.5 }));

        // Número
        const nx = cx + (radio - 25) * Math.cos(ang);
        const ny = cy + (radio - 25) * Math.sin(ang);
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', nx.toString());
        t.setAttribute('y', (ny + 4).toString());
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('font-size', '12');
        t.setAttribute('font-weight', 'bold');
        t.setAttribute('font-family', 'Comic Sans MS, cursive');
        t.setAttribute('fill', '#1e293b');
        t.textContent = h.toString();
        svgRef.current!.appendChild(t);
      }

      // Manecilla de horas
      const horaAng = ((reloj.hora % 12 + reloj.minuto / 60) * 30 - 90) * (Math.PI / 180);
      const hx = cx + (radio * 0.5) * Math.cos(horaAng);
      const hy = cy + (radio * 0.5) * Math.sin(horaAng);
      svgRef.current!.appendChild(rc.line(cx, cy, hx, hy, { stroke: roughColors.azul, strokeWidth: 4, roughness: 0.6 }));

      // Manecilla de minutos
      const minAng = (reloj.minuto * 6 - 90) * (Math.PI / 180);
      const mx = cx + (radio * 0.7) * Math.cos(minAng);
      const my = cy + (radio * 0.7) * Math.sin(minAng);
      svgRef.current!.appendChild(rc.line(cx, cy, mx, my, { stroke: roughColors.rojo, strokeWidth: 2.5, roughness: 0.6 }));

      // Centro
      svgRef.current!.appendChild(rc.circle(cx, cy, 8, { fill: '#2C3E50', fillStyle: 'solid', strokeWidth: 1, roughness: 0.3 }));

      // Digital
      if (mostrarDigital) {
        const hStr = formato === '24h' ? reloj.hora.toString().padStart(2, '0') : ((reloj.hora % 12) || 12).toString();
        const mStr = reloj.minuto.toString().padStart(2, '0');
        const ampm = formato === '12h' ? (reloj.hora >= 12 ? ' PM' : ' AM') : '';
        const dt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        dt.setAttribute('x', cx.toString());
        dt.setAttribute('y', (cy + radio + 25).toString());
        dt.setAttribute('text-anchor', 'middle');
        dt.setAttribute('font-size', '16');
        dt.setAttribute('font-weight', 'bold');
        dt.setAttribute('font-family', 'Comic Sans MS, cursive');
        dt.setAttribute('fill', roughColors.azul);
        dt.textContent = `${hStr}:${mStr}${ampm}`;
        svgRef.current!.appendChild(dt);
      }

      // Etiqueta
      if (reloj.etiqueta) {
        const et = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        et.setAttribute('x', cx.toString());
        et.setAttribute('y', (cy + radio + 45).toString());
        et.setAttribute('text-anchor', 'middle');
        et.setAttribute('font-size', '13');
        et.setAttribute('font-family', 'Comic Sans MS, cursive');
        et.setAttribute('fill', '#64748b');
        et.textContent = reloj.etiqueta;
        svgRef.current!.appendChild(et);
      }
    });
  }, [data]);

  const width = relojes.length * 200 + 50;
  const height = 250;

  return (
    <div className="reloj-tiempo-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
