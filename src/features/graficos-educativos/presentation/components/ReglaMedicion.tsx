import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoReglaMedicion } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoReglaMedicion;
}

export const ReglaMedicion: React.FC<Props> = ({ data }) => {
  const { inicio, fin, unidad, intervalo = 1, marcas = [], objetoMedir } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const margen = 40;
    const reglaY = 100;
    const reglaH = 40;
    const rango = fin - inicio;
    const totalW = 500;
    const scale = (totalW - margen * 2) / rango;

    // Cuerpo de la regla
    svgRef.current.appendChild(rc.rectangle(margen, reglaY, totalW - margen * 2, reglaH, {
      ...defaultRoughConfig, stroke: '#8B4513', fill: roughColors.amarillo, fillStyle: 'solid', strokeWidth: 3, roughness: 0.8,
    }));

    // Marcas de escala
    for (let v = inicio; v <= fin; v += intervalo) {
      const x = margen + (v - inicio) * scale;
      const esMarcaMayor = (v - inicio) % (intervalo * 5 === 0 ? 5 : intervalo) === 0;
      const tickH = esMarcaMayor ? 20 : 12;

      svgRef.current.appendChild(rc.line(x, reglaY, x, reglaY + tickH, {
        stroke: '#2C3E50', strokeWidth: esMarcaMayor ? 2 : 1, roughness: 0.3,
      }));

      // Número cada intervalo
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', x.toString());
      t.setAttribute('y', (reglaY + reglaH + 18).toString());
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '11');
      t.setAttribute('font-family', 'Comic Sans MS, cursive');
      t.setAttribute('fill', '#1e293b');
      t.textContent = v.toString();
      svgRef.current.appendChild(t);
    }

    // Unidad
    const uText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    uText.setAttribute('x', (totalW - margen + 10).toString());
    uText.setAttribute('y', (reglaY + reglaH / 2 + 5).toString());
    uText.setAttribute('font-size', '14');
    uText.setAttribute('font-weight', 'bold');
    uText.setAttribute('font-family', 'Comic Sans MS, cursive');
    uText.setAttribute('fill', '#64748b');
    uText.textContent = unidad;
    svgRef.current.appendChild(uText);

    // Marcas especiales
    marcas.forEach((marca) => {
      const x = margen + (marca.posicion - inicio) * scale;
      const color = marca.color || roughColors.rojo;

      svgRef.current!.appendChild(rc.line(x, reglaY - 15, x, reglaY, {
        stroke: color, strokeWidth: 3, roughness: 0.5,
      }));
      // Triángulo indicador
      svgRef.current!.appendChild(rc.polygon([[x - 6, reglaY - 20], [x + 6, reglaY - 20], [x, reglaY - 8]], {
        fill: color, fillStyle: 'solid', strokeWidth: 1, roughness: 0.5,
      }));

      if (marca.etiqueta) {
        const mt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        mt.setAttribute('x', x.toString());
        mt.setAttribute('y', (reglaY - 25).toString());
        mt.setAttribute('text-anchor', 'middle');
        mt.setAttribute('font-size', '12');
        mt.setAttribute('font-weight', 'bold');
        mt.setAttribute('font-family', 'Comic Sans MS, cursive');
        mt.setAttribute('fill', color);
        mt.textContent = marca.etiqueta;
        svgRef.current!.appendChild(mt);
      }
    });

    // Objeto a medir
    if (objetoMedir) {
      const ot = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      ot.setAttribute('x', (totalW / 2).toString());
      ot.setAttribute('y', (reglaY + reglaH + 45).toString());
      ot.setAttribute('text-anchor', 'middle');
      ot.setAttribute('font-size', '14');
      ot.setAttribute('font-family', 'Comic Sans MS, cursive');
      ot.setAttribute('fill', '#64748b');
      ot.textContent = `📏 ${objetoMedir}`;
      svgRef.current.appendChild(ot);
    }
  }, [data]);

  return (
    <div className="regla-medicion-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 540 ${objetoMedir ? 180 : 160}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: '540px', height: 'auto' }} />
    </div>
  );
};
