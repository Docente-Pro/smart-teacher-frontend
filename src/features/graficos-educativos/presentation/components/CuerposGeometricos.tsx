import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoCuerposGeometricos } from '../../domain/types';
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoCuerposGeometricos;
}

export const CuerposGeometricos: React.FC<Props> = ({ data }) => {
  const { cuerpos, mostrarNombres = true, mostrarMedidas = false } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || cuerpos.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const spacing = 180;
    const margen = 90;

    cuerpos.forEach((cuerpo, idx) => {
      const cx = margen + idx * spacing;
      const cy = 120;
      const color = resolveColor(cuerpo.color) || [roughColors.azul, roughColors.rojo, roughColors.verde, roughColors.naranja][idx % 4];

      if (cuerpo.tipo === 'cubo') {
        const s = 60;
        const off = 20;
        // Cara frontal
        svgRef.current!.appendChild(rc.rectangle(cx - s / 2, cy - s / 2, s, s, {
          ...defaultRoughConfig, stroke: color, fill: color, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
        }));
        // Cara superior (parallelogram)
        svgRef.current!.appendChild(rc.polygon([
          [cx - s / 2, cy - s / 2],
          [cx - s / 2 + off, cy - s / 2 - off],
          [cx + s / 2 + off, cy - s / 2 - off],
          [cx + s / 2, cy - s / 2],
        ], { ...defaultRoughConfig, stroke: color, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8 }));
        // Cara lateral
        svgRef.current!.appendChild(rc.polygon([
          [cx + s / 2, cy - s / 2],
          [cx + s / 2 + off, cy - s / 2 - off],
          [cx + s / 2 + off, cy + s / 2 - off],
          [cx + s / 2, cy + s / 2],
        ], { ...defaultRoughConfig, stroke: color, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8 }));
      } else if (cuerpo.tipo === 'esfera') {
        svgRef.current!.appendChild(rc.circle(cx, cy, 100, {
          ...defaultRoughConfig, stroke: color, fill: color, fillStyle: 'solid', strokeWidth: 2.5, roughness: 0.8,
        }));
        svgRef.current!.appendChild(rc.ellipse(cx, cy, 100, 30, {
          stroke: color, strokeWidth: 1.5, roughness: 0.8, fill: undefined,
        }));
      } else if (cuerpo.tipo === 'cilindro') {
        const w = 60, h = 80;
        svgRef.current!.appendChild(rc.rectangle(cx - w / 2, cy - h / 2 + 10, w, h, {
          ...defaultRoughConfig, stroke: color, fill: color, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
        }));
        svgRef.current!.appendChild(rc.ellipse(cx, cy - h / 2 + 10, w, 22, {
          ...defaultRoughConfig, stroke: color, fill: color, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
        }));
        svgRef.current!.appendChild(rc.ellipse(cx, cy + h / 2 + 10, w, 22, {
          stroke: color, strokeWidth: 2, roughness: 0.8, fill: undefined,
        }));
      } else if (cuerpo.tipo === 'cono') {
        const base = 70, h = 90;
        svgRef.current!.appendChild(rc.polygon([
          [cx, cy - h / 2],
          [cx - base / 2, cy + h / 2],
          [cx + base / 2, cy + h / 2],
        ], { ...defaultRoughConfig, stroke: color, fill: color, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8 }));
        svgRef.current!.appendChild(rc.ellipse(cx, cy + h / 2, base, 20, {
          stroke: color, strokeWidth: 2, roughness: 0.8, fill: undefined,
        }));
      } else if (cuerpo.tipo === 'piramide') {
        const base = 70, h = 80;
        const off = 15;
        // Base
        svgRef.current!.appendChild(rc.polygon([
          [cx - base / 2, cy + h / 2],
          [cx + base / 2, cy + h / 2],
          [cx + base / 2 + off, cy + h / 2 - off],
          [cx - base / 2 + off, cy + h / 2 - off],
        ], { ...defaultRoughConfig, stroke: color, strokeWidth: 2, roughness: 0.8 }));
        // Caras
        const apex = [cx + off / 2, cy - h / 2] as [number, number];
        svgRef.current!.appendChild(rc.polygon([
          [cx - base / 2, cy + h / 2], [cx + base / 2, cy + h / 2], apex,
        ], { ...defaultRoughConfig, stroke: color, fill: color, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8 }));
        svgRef.current!.appendChild(rc.line(cx + base / 2, cy + h / 2, apex[0], apex[1], { stroke: color, strokeWidth: 2, roughness: 0.8 }));
        svgRef.current!.appendChild(rc.line(cx + base / 2 + off, cy + h / 2 - off, apex[0], apex[1], { stroke: color, strokeWidth: 2, roughness: 0.8 }));
      } else if (cuerpo.tipo === 'prisma') {
        const w = 50, h = 70, off = 25;
        // Cara frontal
        svgRef.current!.appendChild(rc.rectangle(cx - w / 2, cy - h / 2, w, h, {
          ...defaultRoughConfig, stroke: color, fill: color, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
        }));
        // Superior
        svgRef.current!.appendChild(rc.polygon([
          [cx - w / 2, cy - h / 2], [cx - w / 2 + off, cy - h / 2 - off / 2],
          [cx + w / 2 + off, cy - h / 2 - off / 2], [cx + w / 2, cy - h / 2],
        ], { stroke: color, strokeWidth: 2, roughness: 0.8 }));
        // Lateral
        svgRef.current!.appendChild(rc.polygon([
          [cx + w / 2, cy - h / 2], [cx + w / 2 + off, cy - h / 2 - off / 2],
          [cx + w / 2 + off, cy + h / 2 - off / 2], [cx + w / 2, cy + h / 2],
        ], { stroke: color, strokeWidth: 2, roughness: 0.8 }));
      }

      // Nombre
      if (mostrarNombres) {
        const nt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nt.setAttribute('x', cx.toString());
        nt.setAttribute('y', '210');
        nt.setAttribute('text-anchor', 'middle');
        nt.setAttribute('font-size', '14');
        nt.setAttribute('font-weight', 'bold');
        nt.setAttribute('font-family', 'Comic Sans MS, cursive');
        nt.setAttribute('fill', color);
        nt.textContent = cuerpo.etiqueta || cuerpo.tipo.charAt(0).toUpperCase() + cuerpo.tipo.slice(1);
        svgRef.current!.appendChild(nt);
      }
    });
  }, [data]);

  const width = cuerpos.length * 180 + 60;

  return (
    <div className="cuerpos-geometricos-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} 240`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
