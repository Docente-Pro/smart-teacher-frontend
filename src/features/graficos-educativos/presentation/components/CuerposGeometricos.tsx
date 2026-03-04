import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoCuerposGeometricos } from '../../domain/types';
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoCuerposGeometricos;
}

export const CuerposGeometricos: React.FC<Props> = ({ data }) => {
  const { cuerpos, mostrarNombres = true, mostrarMedidas = false, vista = 'frontal' } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  // Calcular spacing dinámico según la longitud máxima de etiquetas
  const maxLabelLength = cuerpos.reduce((max, c) => {
    const label = c.etiqueta || c.tipo.charAt(0).toUpperCase() + c.tipo.slice(1);
    return Math.max(max, label.length);
  }, 0);

  // Estimar ancho máximo de etiqueta (~7.5px por carácter a font-size 14, Comic Sans)
  const estimatedMaxLabelWidth = maxLabelLength * 7.5;
  // Spacing mínimo 180, pero crece si las etiquetas son largas
  const spacing = Math.max(180, estimatedMaxLabelWidth + 50);
  const margen = Math.max(90, estimatedMaxLabelWidth / 2 + 30);

  // Calcular altura dinámica según la cantidad máxima de medidas
  const maxMedidasCount = mostrarMedidas
    ? cuerpos.reduce((max, c) => Math.max(max, c.medidas ? Object.keys(c.medidas).length : 0), 0)
    : 0;

  const width = cuerpos.length * spacing + margen;
  const heightSvg = mostrarMedidas ? 230 + maxMedidasCount * 16 + 20 : 240;

  useEffect(() => {
    if (!svgRef.current || cuerpos.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

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

      // Medidas del cuerpo
      if (mostrarMedidas && cuerpo.medidas) {
        const entries = Object.entries(cuerpo.medidas);
        entries.forEach(([key, val], mIdx) => {
          const mt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          mt.setAttribute('x', cx.toString());
          mt.setAttribute('y', (225 + mIdx * 16).toString());
          mt.setAttribute('text-anchor', 'middle');
          mt.setAttribute('font-size', '11');
          mt.setAttribute('font-family', 'Comic Sans MS, cursive');
          mt.setAttribute('fill', '#64748b');
          mt.textContent = `${key}: ${val}`;
          svgRef.current!.appendChild(mt);
        });
      }
    });
  }, [data, spacing, margen]);

  return (
    <div className="cuerpos-geometricos-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${heightSvg}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
