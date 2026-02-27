import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoAngulos } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoAngulos;
}

export const Angulos: React.FC<Props> = ({ data }) => {
  const { angulos, mostrarTransportador = false, mostrarClasificacion = true } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || angulos.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const spacing = 200;
    const margen = 100;
    const armLength = 70;

    angulos.forEach((ang, idx) => {
      const cx = margen + idx * spacing;
      const cy = 120;
      const color = ang.color || [roughColors.azul, roughColors.rojo, roughColors.verde][idx % 3];
      const rad = (ang.grados * Math.PI) / 180;

      // Rayo base (horizontal)
      svgRef.current!.appendChild(rc.line(cx, cy, cx + armLength, cy, {
        stroke: '#2C3E50', strokeWidth: 2.5, roughness: 0.8,
      }));

      // Segundo rayo
      const rx = cx + armLength * Math.cos(-rad);
      const ry = cy + armLength * Math.sin(-rad);
      svgRef.current!.appendChild(rc.line(cx, cy, rx, ry, {
        stroke: '#2C3E50', strokeWidth: 2.5, roughness: 0.8,
      }));

      // Arco del ángulo
      const arcR = 30;
      const startAng = 0;
      const endAng = -rad;
      const steps = Math.max(10, Math.floor(ang.grados / 3));
      for (let i = 0; i < steps; i++) {
        const a1 = startAng + (endAng - startAng) * (i / steps);
        const a2 = startAng + (endAng - startAng) * ((i + 1) / steps);
        const x1 = cx + arcR * Math.cos(a1);
        const y1 = cy + arcR * Math.sin(a1);
        const x2 = cx + arcR * Math.cos(a2);
        const y2 = cy + arcR * Math.sin(a2);
        svgRef.current!.appendChild(rc.line(x1, y1, x2, y2, {
          stroke: color, strokeWidth: 2, roughness: 0.3,
        }));
      }

      // Medida del ángulo
      if (ang.mostrarMedida !== false) {
        const labelR = arcR + 18;
        const midAng = -rad / 2;
        const lx = cx + labelR * Math.cos(midAng);
        const ly = cy + labelR * Math.sin(midAng);
        const mt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        mt.setAttribute('x', lx.toString());
        mt.setAttribute('y', ly.toString());
        mt.setAttribute('text-anchor', 'middle');
        mt.setAttribute('font-size', '14');
        mt.setAttribute('font-weight', 'bold');
        mt.setAttribute('font-family', 'Comic Sans MS, cursive');
        mt.setAttribute('fill', color);
        mt.textContent = `${ang.grados}°`;
        svgRef.current!.appendChild(mt);
      }

      // Ángulo recto (cuadradito)
      if (ang.grados === 90) {
        const sq = 12;
        svgRef.current!.appendChild(rc.rectangle(cx, cy - sq, sq, sq, {
          stroke: color, strokeWidth: 1.5, roughness: 0.5,
        }));
      }

      // Clasificación
      if (mostrarClasificacion) {
        const tipoAng = ang.tipo || (ang.grados < 90 ? 'agudo' : ang.grados === 90 ? 'recto' : ang.grados < 180 ? 'obtuso' : ang.grados === 180 ? 'llano' : 'completo');
        const ct = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        ct.setAttribute('x', cx.toString());
        ct.setAttribute('y', '200');
        ct.setAttribute('text-anchor', 'middle');
        ct.setAttribute('font-size', '13');
        ct.setAttribute('font-weight', 'bold');
        ct.setAttribute('font-family', 'Comic Sans MS, cursive');
        ct.setAttribute('fill', color);
        ct.textContent = tipoAng.charAt(0).toUpperCase() + tipoAng.slice(1);
        svgRef.current!.appendChild(ct);
      }

      // Etiqueta
      if (ang.etiqueta) {
        const et = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        et.setAttribute('x', cx.toString());
        et.setAttribute('y', '220');
        et.setAttribute('text-anchor', 'middle');
        et.setAttribute('font-size', '12');
        et.setAttribute('font-family', 'Comic Sans MS, cursive');
        et.setAttribute('fill', '#64748b');
        et.textContent = ang.etiqueta;
        svgRef.current!.appendChild(et);
      }
    });
  }, [data]);

  const width = angulos.length * 200 + 60;

  return (
    <div className="angulos-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} 240`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
