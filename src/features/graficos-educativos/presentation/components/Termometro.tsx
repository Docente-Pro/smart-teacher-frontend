import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoTermometro } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoTermometro;
}

export const Termometro: React.FC<Props> = ({ data }) => {
  const { temperatura, minimo = 0, maximo = 50, unidad = 'C', marcas, etiqueta, colorLiquido } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const cx = 100;
    const topY = 30;
    const bottomY = 280;
    const tubeW = 30;
    const bulbR = 25;
    const termH = bottomY - topY;

    // Tubo del termómetro
    svgRef.current.appendChild(rc.rectangle(cx - tubeW / 2, topY, tubeW, termH, {
      ...defaultRoughConfig, stroke: '#2C3E50', strokeWidth: 2.5, roughness: 0.8,
    }));

    // Bulbo
    svgRef.current.appendChild(rc.circle(cx, bottomY + bulbR - 5, bulbR * 2, {
      ...defaultRoughConfig, stroke: '#2C3E50', fill: colorLiquido || roughColors.rojo, fillStyle: 'solid', strokeWidth: 2.5, roughness: 0.6,
    }));

    // Relleno del líquido
    const rango = maximo - minimo;
    const fraccion = Math.max(0, Math.min(1, (temperatura - minimo) / rango));
    const fillH = fraccion * (termH - 10);
    const fillY = bottomY - fillH;

    svgRef.current.appendChild(rc.rectangle(cx - tubeW / 2 + 4, fillY, tubeW - 8, fillH, {
      fill: colorLiquido || roughColors.rojo, fillStyle: 'solid', stroke: 'none', strokeWidth: 0, roughness: 0.3,
    }));

    // Marcas de escala
    const numMarcas = marcas || Array.from({ length: 6 }, (_, i) => minimo + (rango / 5) * i);
    (Array.isArray(numMarcas) ? numMarcas : []).forEach((val) => {
      const frac = (val - minimo) / rango;
      const my = bottomY - frac * (termH - 10);

      svgRef.current!.appendChild(rc.line(cx + tubeW / 2, my, cx + tubeW / 2 + 10, my, {
        stroke: '#2C3E50', strokeWidth: 1.5, roughness: 0.5,
      }));

      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', (cx + tubeW / 2 + 15).toString());
      t.setAttribute('y', (my + 4).toString());
      t.setAttribute('font-size', '12');
      t.setAttribute('font-family', 'Comic Sans MS, cursive');
      t.setAttribute('fill', '#64748b');
      t.textContent = `${val}°`;
      svgRef.current!.appendChild(t);
    });

    // Valor actual
    const valText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    valText.setAttribute('x', cx.toString());
    valText.setAttribute('y', (bottomY + bulbR + 35).toString());
    valText.setAttribute('text-anchor', 'middle');
    valText.setAttribute('font-size', '20');
    valText.setAttribute('font-weight', 'bold');
    valText.setAttribute('font-family', 'Comic Sans MS, cursive');
    valText.setAttribute('fill', colorLiquido || roughColors.rojo);
    valText.textContent = `${temperatura}°${unidad}`;
    svgRef.current.appendChild(valText);

    // Etiqueta
    if (etiqueta) {
      const et = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      et.setAttribute('x', cx.toString());
      et.setAttribute('y', (bottomY + bulbR + 55).toString());
      et.setAttribute('text-anchor', 'middle');
      et.setAttribute('font-size', '13');
      et.setAttribute('font-family', 'Comic Sans MS, cursive');
      et.setAttribute('fill', '#64748b');
      et.textContent = etiqueta;
      svgRef.current.appendChild(et);
    }
  }, [data]);

  return (
    <div className="termometro-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox="0 0 220 380" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: '220px', height: 'auto' }} />
    </div>
  );
};
