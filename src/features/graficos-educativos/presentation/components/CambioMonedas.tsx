import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoCambioMonedas } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoCambioMonedas;
}

export const CambioMonedas: React.FC<Props> = ({ data }) => {
  const { monedasInicio, monedasResultado, moneda = 'S/', mostrarEquivalencia = true, totalOriginal } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const margen = 30;
    const coinR = 22;
    const billW = 60;
    const billH = 30;

    const drawMoneda = (item: { tipo: string; valor: number; cantidad: number }, startX: number, startY: number, color: string) => {
      let curX = startX;
      for (let i = 0; i < item.cantidad; i++) {
        if (item.tipo === 'moneda') {
          svgRef.current!.appendChild(rc.circle(curX, startY, coinR * 2, {
            ...defaultRoughConfig, stroke: color, fill: roughColors.amarillo, fillStyle: 'solid', strokeWidth: 2, roughness: 0.6,
          }));
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          t.setAttribute('x', curX.toString());
          t.setAttribute('y', (startY + 5).toString());
          t.setAttribute('text-anchor', 'middle');
          t.setAttribute('font-size', '11');
          t.setAttribute('font-weight', 'bold');
          t.setAttribute('font-family', 'Comic Sans MS, cursive');
          t.setAttribute('fill', '#1e293b');
          t.textContent = `${moneda}${item.valor}`;
          svgRef.current!.appendChild(t);
          curX += coinR * 2 + 8;
        } else {
          svgRef.current!.appendChild(rc.rectangle(curX - billW / 2, startY - billH / 2, billW, billH, {
            ...defaultRoughConfig, stroke: color, fill: roughColors.verde, fillStyle: 'solid', strokeWidth: 2, roughness: 0.8,
          }));
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          t.setAttribute('x', curX.toString());
          t.setAttribute('y', (startY + 5).toString());
          t.setAttribute('text-anchor', 'middle');
          t.setAttribute('font-size', '12');
          t.setAttribute('font-weight', 'bold');
          t.setAttribute('font-family', 'Comic Sans MS, cursive');
          t.setAttribute('fill', '#fff');
          t.textContent = `${moneda}${item.valor}`;
          svgRef.current!.appendChild(t);
          curX += billW + 8;
        }
      }
      return curX;
    };

    // Título "Original"
    const tOrig = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tOrig.setAttribute('x', margen.toString());
    tOrig.setAttribute('y', '25');
    tOrig.setAttribute('font-size', '14');
    tOrig.setAttribute('font-weight', 'bold');
    tOrig.setAttribute('font-family', 'Comic Sans MS, cursive');
    tOrig.setAttribute('fill', roughColors.azul);
    tOrig.textContent = 'Tienes:';
    svgRef.current.appendChild(tOrig);

    let cx = margen + 30;
    monedasInicio.forEach((item) => {
      cx = drawMoneda(item, cx, 60, roughColors.azul);
      cx += 10;
    });

    // Flecha
    const arrowY = 110;
    svgRef.current.appendChild(rc.line(200, arrowY - 15, 200, arrowY + 15, { stroke: roughColors.naranja, strokeWidth: 3, roughness: 0.8 }));
    svgRef.current.appendChild(rc.line(190, arrowY + 5, 200, arrowY + 15, { stroke: roughColors.naranja, strokeWidth: 3, roughness: 0.5 }));
    svgRef.current.appendChild(rc.line(210, arrowY + 5, 200, arrowY + 15, { stroke: roughColors.naranja, strokeWidth: 3, roughness: 0.5 }));

    const tEquiv = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tEquiv.setAttribute('x', '220');
    tEquiv.setAttribute('y', (arrowY + 5).toString());
    tEquiv.setAttribute('font-size', '13');
    tEquiv.setAttribute('font-family', 'Comic Sans MS, cursive');
    tEquiv.setAttribute('fill', roughColors.naranja);
    tEquiv.textContent = 'Cambio';
    svgRef.current.appendChild(tEquiv);

    // Título "Resultado"
    const tRes = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tRes.setAttribute('x', margen.toString());
    tRes.setAttribute('y', '155');
    tRes.setAttribute('font-size', '14');
    tRes.setAttribute('font-weight', 'bold');
    tRes.setAttribute('font-family', 'Comic Sans MS, cursive');
    tRes.setAttribute('fill', roughColors.rojo);
    tRes.textContent = 'Recibes:';
    svgRef.current.appendChild(tRes);

    cx = margen + 30;
    monedasResultado.forEach((item) => {
      cx = drawMoneda(item, cx, 190, roughColors.rojo);
      cx += 10;
    });

    // Total
    if (mostrarEquivalencia && totalOriginal !== undefined) {
      const tt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tt.setAttribute('x', '200');
      tt.setAttribute('y', '235');
      tt.setAttribute('text-anchor', 'middle');
      tt.setAttribute('font-size', '16');
      tt.setAttribute('font-weight', 'bold');
      tt.setAttribute('font-family', 'Comic Sans MS, cursive');
      tt.setAttribute('fill', roughColors.verde);
      tt.textContent = `Total: ${moneda}${totalOriginal}`;
      svgRef.current.appendChild(tt);
    }
  }, [data]);

  return (
    <div className="cambio-monedas-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox="0 0 450 260" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: '450px', height: 'auto' }} />
    </div>
  );
};
