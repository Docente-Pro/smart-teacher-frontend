import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoBarrasComparacion } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';
import '../styles/BarrasComparacion.css';

interface Props {
  data: GraficoBarrasComparacion;
}

/**
 * Componente para renderizar gráficos de barras comparativas con estilo dibujado a mano
 * Ideal para comparar cantidades, estadísticas, etc.
 */
export const BarrasComparacion: React.FC<Props> = ({ data }) => {
  const { elementos, ejeY } = data;
  const svgRef = useRef<SVGSVGElement>(null);
  const maximo = ejeY?.maximo || Math.max(...elementos.map(e => e.valor)) + 2;
  const intervalo = ejeY?.intervalo || 1;

  const marcasY = Array.from(
    { length: Math.ceil(maximo / intervalo) + 1 }, 
    (_, i) => i * intervalo
  ).reverse();

  const getBarColor = (color: string): string => {
    const colorMap: Record<string, string> = {
      azul: roughColors.azul,
      rojo: roughColors.rojo,
      verde: roughColors.verde,
      amarillo: roughColors.amarillo,
      morado: roughColors.morado,
      naranja: roughColors.naranja,
    };
    return colorMap[color] || roughColors.azul;
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const padding = 60;
    const chartHeight = 400;
    const barWidth = 60;
    const barSpacing = 40;
    const chartWidth = elementos.length * (barWidth + barSpacing) + padding * 2;
    const axisX = padding;
    const axisY = chartHeight - padding;

    // Eje Y
    const yAxis = rc.line(axisX, padding, axisX, axisY + 5, {
      stroke: '#2C3E50',
      strokeWidth: 2,
      roughness: 0.8
    });
    svgRef.current.appendChild(yAxis);

    // Eje X
    const xAxis = rc.line(axisX - 5, axisY, chartWidth - padding / 2, axisY, {
      stroke: '#2C3E50',
      strokeWidth: 2,
      roughness: 0.8
    });
    svgRef.current.appendChild(xAxis);

    // Marcas del eje Y
    const yRange = chartHeight - padding * 2;
    marcasY.forEach((marca) => {
      const yPos = padding + yRange - (marca / maximo) * yRange;
      
      // Línea de guía horizontal
      const gridLine = rc.line(axisX, yPos, chartWidth - padding / 2, yPos, {
        stroke: '#E8E8E8',
        strokeWidth: 1,
        roughness: 0.3
      });
      svgRef.current?.appendChild(gridLine);

      // Marca numérica
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (axisX - 10).toString());
      text.setAttribute('y', (yPos + 4).toString());
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-size', '13');
      text.setAttribute('fill', '#2C3E50');
      text.setAttribute('class', 'rough-text');
      text.textContent = marca.toString();
      svgRef.current?.appendChild(text);
    });

    // Título del eje Y
    if (ejeY?.titulo) {
      const titleY = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      titleY.setAttribute('x', '20');
      titleY.setAttribute('y', ((padding + axisY) / 2).toString());
      titleY.setAttribute('transform', `rotate(-90, 20, ${(padding + axisY) / 2})`);
      titleY.setAttribute('text-anchor', 'middle');
      titleY.setAttribute('font-size', '14');
      titleY.setAttribute('font-weight', 'bold');
      titleY.setAttribute('fill', '#2C3E50');
      titleY.setAttribute('class', 'rough-text');
      titleY.textContent = ejeY.titulo;
      svgRef.current?.appendChild(titleY);
    }

    // Barras
    elementos.forEach((barra, idx) => {
      const barX = axisX + idx * (barWidth + barSpacing) + barSpacing;
      const barHeight = (barra.valor / maximo) * yRange;
      const barY = axisY - barHeight;
      const fillColor = getBarColor(barra.color);

      // Barra con relleno
      const bar = rc.rectangle(barX, barY, barWidth, barHeight, {
        ...defaultRoughConfig,
        fill: fillColor,
        fillStyle: 'hachure',
        stroke: fillColor,
        strokeWidth: 2,
        roughness: 1.0,
        hachureAngle: 45 + idx * 15,
        hachureGap: 5
      });
      svgRef.current?.appendChild(bar);

      // Valor encima de la barra
      const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valueText.setAttribute('x', (barX + barWidth / 2).toString());
      valueText.setAttribute('y', (barY - 8).toString());
      valueText.setAttribute('text-anchor', 'middle');
      valueText.setAttribute('font-size', '15');
      valueText.setAttribute('font-weight', 'bold');
      valueText.setAttribute('fill', fillColor);
      valueText.setAttribute('class', 'rough-text');
      valueText.textContent = barra.valor.toString();
      svgRef.current?.appendChild(valueText);

      // Etiqueta debajo del eje X
      const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelText.setAttribute('x', (barX + barWidth / 2).toString());
      labelText.setAttribute('y', (axisY + 25).toString());
      labelText.setAttribute('text-anchor', 'middle');
      labelText.setAttribute('font-size', '13');
      labelText.setAttribute('fill', '#2C3E50');
      labelText.setAttribute('class', 'rough-text');
      labelText.textContent = `${barra.icono || ''} ${barra.etiqueta}`;
      svgRef.current?.appendChild(labelText);
    });

    svgRef.current.setAttribute('width', chartWidth.toString());
    svgRef.current.setAttribute('height', (chartHeight + 20).toString());
  }, [elementos, ejeY, maximo, intervalo, marcasY]);

  return (
    <div className="barras-comparacion">
      <svg ref={svgRef} className="barras-svg" />
    </div>
  );
};
