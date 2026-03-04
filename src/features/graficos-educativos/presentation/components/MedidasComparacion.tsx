import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoMedidasComparacion } from '../../domain/types';
import { roughColors, defaultRoughConfig, resolveColor } from '../hooks/useRoughSVG';
import { estimateTextWidth, createSVGText } from '../utils/svgTextUtils';

interface Props {
  data: GraficoMedidasComparacion;
}

/**
 * Componente para comparar medidas
 * Para enseñar unidades de medida y comparación
 */
export const MedidasComparacion: React.FC<Props> = ({ data }) => {
  const { elementos } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || elementos.length === 0) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const tipoMedida = elementos[0].tipo;
    const anchoBarra = 400;
    const altoBarra = 50;
    const espacioEntre = 80;
    // Margen izquierdo dinámico según la etiqueta más larga
    const allLabels = elementos.map((m, i) => m.etiqueta || `Medida ${i + 1}`);
    const maxLabelW = Math.max(...allLabels.map(l => estimateTextWidth(l, 14)));
    const margen = Math.max(100, maxLabelW + 20);

    // Encontrar el valor máximo para escalar
    const valorMax = Math.max(...elementos.map(e => e.valor));

    elementos.forEach((medida, idx) => {
      const y = margen + (idx * espacioEntre);
      const color = resolveColor(medida.color, roughColors.azul);
      
      // Escalar la barra según el valor
      const anchoReal = (medida.valor / valorMax) * anchoBarra;

      // Barra de medida
      const barra = rc.rectangle(margen, y, anchoReal, altoBarra, {
        ...defaultRoughConfig,
        stroke: color,
        fill: color,
        fillStyle: 'solid',
        strokeWidth: 3,
        roughness: 0.8
      });
      svgRef.current!.appendChild(barra);

      // Etiqueta de la medida
      const etiqueta = medida.etiqueta || `Medida ${idx + 1}`;
      const labelEl = createSVGText({
        x: margen - 10, y: y + altoBarra / 2 + 5, text: etiqueta,
        fontSize: 14, fontWeight: '700', fill: '#1e293b',
        textAnchor: 'end', maxCharsPerLine: 20, lineHeight: 16,
      });
      svgRef.current!.appendChild(labelEl);

      // Valor y unidad
      const valorText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valorText.setAttribute('x', (margen + anchoReal + 10).toString());
      valorText.setAttribute('y', (y + altoBarra / 2 + 5).toString());
      valorText.setAttribute('text-anchor', 'start');
      valorText.setAttribute('font-size', '16');
      valorText.setAttribute('font-weight', 'bold');
      valorText.setAttribute('font-family', 'Comic Sans MS, cursive');
      valorText.setAttribute('fill', color);
      valorText.textContent = `${medida.valor} ${medida.unidad}`;
      svgRef.current!.appendChild(valorText);

      // Íconos según el tipo de medida
      let icono = '';
      switch (tipoMedida) {
        case 'longitud':
          icono = '📏';
          break;
        case 'peso':
          icono = '⚖️';
          break;
        case 'capacidad':
          icono = '🥤';
          break;
        case 'tiempo':
          icono = '⏰';
          break;
      }

      if (icono) {
        const iconoText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        iconoText.setAttribute('x', (margen + anchoReal / 2).toString());
        iconoText.setAttribute('y', (y + altoBarra / 2 + 8).toString());
        iconoText.setAttribute('text-anchor', 'middle');
        iconoText.setAttribute('font-size', '24');
        iconoText.textContent = icono;
        svgRef.current!.appendChild(iconoText);
      }
    });

  }, [data]);

  const allLabels = elementos.map((m, i) => m.etiqueta || `Medida ${i + 1}`);
  const maxLabelW = Math.max(...allLabels.map(l => estimateTextWidth(l, 14)));
  const dynamicMargen = Math.max(100, maxLabelW + 20);
  const svgWidth = dynamicMargen + 400 + 150;
  const height = 100 + (elementos.length * 80);

  return (
    <div className="medidas-comparacion-container">
      <svg ref={svgRef} viewBox={`0 0 ${svgWidth} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: `${svgWidth}px` }} />
    </div>
  );
};
