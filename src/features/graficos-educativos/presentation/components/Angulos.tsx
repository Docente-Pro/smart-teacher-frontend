import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoAngulos } from '../../domain/types';
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';
import { calcDynamicSpacing, createSVGText, getWrappedTextExtraHeight } from '../utils/svgTextUtils';

interface Props {
  data: GraficoAngulos;
}

export const Angulos: React.FC<Props> = ({ data }) => {
  const { angulos, mostrarTransportador = false, mostrarClasificacion = true } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  const labels = angulos.map(a => a.etiqueta || '');
  const { spacing, margin: margen } = calcDynamicSpacing({
    labels,
    minSpacing: 200,
    fontSize: 12,
    paddingExtra: 50,
    maxCharsPerLine: 22,
  });
  const extraH = getWrappedTextExtraHeight(labels, 22);

  useEffect(() => {
    if (!svgRef.current || angulos.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';
    const armLength = 70;

    // Transportador de fondo si está activo
    if (mostrarTransportador && angulos.length === 1) {
      const cx = margen;
      const cy = 120;
      const transportR = 85;
      // Semicírculo
      const tPath = `M ${cx - transportR} ${cy} A ${transportR} ${transportR} 0 0 0 ${cx + transportR} ${cy}`;
      svgRef.current.appendChild(rc.path(tPath, {
        stroke: '#cbd5e1', strokeWidth: 1.5, roughness: 0.3, fill: '#f1f5f9', fillStyle: 'solid',
      }));
      // Marcas cada 10°
      for (let deg = 0; deg <= 180; deg += 10) {
        const rad = (deg * Math.PI) / 180;
        const inner = transportR - 8;
        const outer = transportR;
        const x1 = cx + inner * Math.cos(-rad);
        const y1 = cy + inner * Math.sin(-rad);
        const x2 = cx + outer * Math.cos(-rad);
        const y2 = cy + outer * Math.sin(-rad);
        svgRef.current.appendChild(rc.line(x1, y1, x2, y2, {
          stroke: '#94a3b8', strokeWidth: deg % 30 === 0 ? 1.5 : 0.8, roughness: 0.2,
        }));
        if (deg % 30 === 0) {
          const lx = cx + (transportR + 12) * Math.cos(-rad);
          const ly = cy + (transportR + 12) * Math.sin(-rad);
          const dt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          dt.setAttribute('x', lx.toString());
          dt.setAttribute('y', ly.toString());
          dt.setAttribute('text-anchor', 'middle');
          dt.setAttribute('font-size', '9');
          dt.setAttribute('font-family', 'Comic Sans MS, cursive');
          dt.setAttribute('fill', '#94a3b8');
          dt.textContent = `${deg}°`;
          svgRef.current.appendChild(dt);
        }
      }
    }

    angulos.forEach((ang, idx) => {
      const cx = margen + idx * spacing;
      const cy = 120;
      const color = resolveColor(ang.color) || [roughColors.azul, roughColors.rojo, roughColors.verde][idx % 3];
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
        const et = createSVGText({
          x: cx, y: 220, text: ang.etiqueta,
          fontSize: 12, fill: '#64748b', maxCharsPerLine: 22, lineHeight: 14,
        });
        svgRef.current!.appendChild(et);
      }
    });
  }, [data, spacing, margen]);

  const width = angulos.length * spacing + margen;
  const svgHeight = 240 + extraH;

  return (
    <div className="angulos-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${svgHeight}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
