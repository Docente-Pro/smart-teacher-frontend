import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoDescomposicionNumero } from '../../domain/types';
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';
import { calcDynamicSpacing, createSVGText, getWrappedTextExtraHeight } from '../utils/svgTextUtils';

interface Props {
  data: GraficoDescomposicionNumero;
}

export const DescomposicionNumero: React.FC<Props> = ({ data }) => {
  const { numero, partes, tipo, mostrarArbol = true } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const etiquetas = partes.map(p => p.etiqueta || '');
    const { spacing: partSpacing } = calcDynamicSpacing({
      labels: etiquetas,
      minSpacing: 130,
      fontSize: 12,
      paddingExtra: 30,
      maxCharsPerLine: 18,
    });
    const width = Math.max(partes.length * partSpacing, 400);
    const centerX = width / 2;

    // Si mostrarArbol=false, layout lineal sin líneas de conexión
    // (mostrarArbol=true usa layout de árbol con líneas)

    // Número principal arriba
    const circulo = rc.circle(centerX, 50, 70, {
      ...defaultRoughConfig,
      stroke: roughColors.azul,
      fill: roughColors.azul,
      fillStyle: 'solid',
      strokeWidth: 3,
      roughness: 0.8,
    });
    svgRef.current.appendChild(circulo);

    const numText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    numText.setAttribute('x', centerX.toString());
    numText.setAttribute('y', '55');
    numText.setAttribute('text-anchor', 'middle');
    numText.setAttribute('font-size', '24');
    numText.setAttribute('font-weight', 'bold');
    numText.setAttribute('font-family', 'Comic Sans MS, cursive');
    numText.setAttribute('fill', '#fff');
    numText.textContent = numero.toString();
    svgRef.current.appendChild(numText);

    // Líneas y partes
    const partWidth = Math.max(width / partes.length, partSpacing);
    const yParts = 160;

    partes.forEach((parte, idx) => {
      const px = partWidth * idx + partWidth / 2;
      const color = resolveColor(parte.color) || [roughColors.rojo, roughColors.verde, roughColors.naranja, roughColors.morado][idx % 4];

      // Línea del número a la parte (solo si mostrarArbol)
      if (mostrarArbol) {
        const linea = rc.line(centerX, 85, px, yParts - 30, {
          stroke: '#64748b',
          strokeWidth: 2,
          roughness: 1,
        });
        svgRef.current!.appendChild(linea);
      }

      // Círculo de la parte
      const partCirc = rc.circle(px, yParts, 60, {
        ...defaultRoughConfig,
        stroke: color,
        fill: color,
        fillStyle: 'solid',
        strokeWidth: 2,
        roughness: 0.8,
      });
      svgRef.current!.appendChild(partCirc);

      const valText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valText.setAttribute('x', px.toString());
      valText.setAttribute('y', (yParts + 6).toString());
      valText.setAttribute('text-anchor', 'middle');
      valText.setAttribute('font-size', '18');
      valText.setAttribute('font-weight', 'bold');
      valText.setAttribute('font-family', 'Comic Sans MS, cursive');
      valText.setAttribute('fill', '#fff');
      valText.textContent = parte.valor.toString();
      svgRef.current!.appendChild(valText);

      // Etiqueta
      if (parte.etiqueta) {
        const etiqEl = createSVGText({
          x: px, y: yParts + 50, text: parte.etiqueta,
          fontSize: 12, fill: '#64748b',
          maxCharsPerLine: 18, lineHeight: 14,
        });
        svgRef.current!.appendChild(etiqEl);
      }

      // Operador
      if (idx < partes.length - 1) {
        const opText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        opText.setAttribute('x', (px + partWidth / 2).toString());
        opText.setAttribute('y', (yParts + 6).toString());
        opText.setAttribute('text-anchor', 'middle');
        opText.setAttribute('font-size', '22');
        opText.setAttribute('font-weight', 'bold');
        opText.setAttribute('font-family', 'Comic Sans MS, cursive');
        opText.setAttribute('fill', '#1e293b');
        opText.textContent = tipo === 'multiplicativa' ? '×' : '+';
        svgRef.current!.appendChild(opText);
      }
    });
  }, [data]);

  const etiquetas = partes.map(p => p.etiqueta || '');
  const { spacing: partSpacing } = calcDynamicSpacing({
    labels: etiquetas, minSpacing: 130, fontSize: 12, paddingExtra: 30, maxCharsPerLine: 18,
  });
  const width = Math.max(partes.length * partSpacing, 400);
  const extraH = getWrappedTextExtraHeight(etiquetas, 18, 14);
  const svgHeight = 220 + extraH;

  return (
    <div className="descomposicion-numero-container" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${svgHeight}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }} />
    </div>
  );
};
