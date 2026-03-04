import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoPotenciasRaices } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';
import { estimateTextWidth } from '../utils/svgTextUtils';

interface Props {
  data: GraficoPotenciasRaices;
}

export const PotenciasRaices: React.FC<Props> = ({ data }) => {
  const { expresiones, mostrarVisualizacion = true, tipo: tipoGlobal } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  // Filtrar expresiones según tipo global si se especifica
  const expresionesFiltradas = tipoGlobal && tipoGlobal !== 'ambos'
    ? expresiones.filter(e => e.tipo === tipoGlobal)
    : expresiones;

  useEffect(() => {
    if (!svgRef.current || expresionesFiltradas.length === 0) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const margen = 30;
    // Ancho dinámico por bloque según expresión más larga
    const exprTexts = expresionesFiltradas.map(e =>
      e.tipo === 'potencia' ? `${e.base}` : `\u221A${e.base} (\u207F${e.exponente})`
    );
    const resultTexts = expresionesFiltradas.map(e => `= ${e.resultado}`);
    const maxExprW = Math.max(...exprTexts.map(t => estimateTextWidth(t, 22)));
    const maxResW = Math.max(...resultTexts.map(t => estimateTextWidth(t, 18)));
    const blockW = Math.max(200, Math.max(maxExprW, maxResW) + 60);

    expresionesFiltradas.forEach((expr, idx) => {
      const x = margen + idx * blockW;
      const y = 30;
      const color = expr.tipo === 'potencia' ? roughColors.azul : roughColors.verde;

      // Expresión matemática
      const exprText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      exprText.setAttribute('x', (x + blockW / 2).toString());
      exprText.setAttribute('y', y.toString());
      exprText.setAttribute('text-anchor', 'middle');
      exprText.setAttribute('font-size', '22');
      exprText.setAttribute('font-weight', 'bold');
      exprText.setAttribute('font-family', 'Comic Sans MS, cursive');
      exprText.setAttribute('fill', color);

      if (expr.tipo === 'potencia') {
        exprText.textContent = `${expr.base}`;
        svgRef.current!.appendChild(exprText);

        // Superíndice (exponente)
        const supText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        supText.setAttribute('x', (x + blockW / 2 + 12).toString());
        supText.setAttribute('y', (y - 10).toString());
        supText.setAttribute('font-size', '14');
        supText.setAttribute('font-weight', 'bold');
        supText.setAttribute('font-family', 'Comic Sans MS, cursive');
        supText.setAttribute('fill', roughColors.rojo);
        supText.textContent = expr.exponente.toString();
        svgRef.current!.appendChild(supText);
      } else {
        exprText.textContent = `√${expr.base} (ⁿ${expr.exponente})`;
        svgRef.current!.appendChild(exprText);
      }

      // Igual
      const eqText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      eqText.setAttribute('x', (x + blockW / 2).toString());
      eqText.setAttribute('y', (y + 30).toString());
      eqText.setAttribute('text-anchor', 'middle');
      eqText.setAttribute('font-size', '18');
      eqText.setAttribute('font-weight', 'bold');
      eqText.setAttribute('font-family', 'Comic Sans MS, cursive');
      eqText.setAttribute('fill', '#1e293b');
      eqText.textContent = `= ${expr.resultado}`;
      svgRef.current!.appendChild(eqText);

      // Visualización con cuadraditos
      if (mostrarVisualizacion && expr.tipo === 'potencia' && expr.exponente === 2 && expr.base <= 5) {
        const vizY = y + 50;
        const unitS = 16;
        for (let r = 0; r < expr.base; r++) {
          for (let c = 0; c < expr.base; c++) {
            svgRef.current!.appendChild(rc.rectangle(
              x + (blockW / 2 - (expr.base * unitS) / 2) + c * unitS,
              vizY + r * unitS,
              unitS - 1, unitS - 1,
              { fill: color, fillStyle: 'solid', strokeWidth: 1, roughness: 0.4 }
            ));
          }
        }
      }
    });
  }, [data, expresionesFiltradas]);

  // Ancho dinámico por bloque
  const exprTextsR = expresionesFiltradas.map(e =>
    e.tipo === 'potencia' ? `${e.base}` : `\u221A${e.base} (\u207F${e.exponente})`
  );
  const resultTextsR = expresionesFiltradas.map(e => `= ${e.resultado}`);
  const maxExprWR = Math.max(0, ...exprTextsR.map(t => estimateTextWidth(t, 22)));
  const maxResWR = Math.max(0, ...resultTextsR.map(t => estimateTextWidth(t, 18)));
  const dynBlockW = Math.max(200, Math.max(maxExprWR, maxResWR) + 60);
  const width = expresionesFiltradas.length * dynBlockW + 60;
  const height = mostrarVisualizacion ? 200 : 100;

  return (
    <div className="potencias-raices-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
