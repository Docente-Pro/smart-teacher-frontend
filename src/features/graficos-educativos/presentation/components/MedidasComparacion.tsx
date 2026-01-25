import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { ConfiguracionGrafico, ColorGrafico } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Medida {
  tipo: 'longitud' | 'peso' | 'capacidad' | 'tiempo';
  valor: number;
  unidad: string;
  etiqueta?: string;
  color: ColorGrafico;
}

interface MedidasComparacionData extends ConfiguracionGrafico {
  elementos: Medida[];
}

interface Props {
  data: MedidasComparacionData;
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
    const margen = 100;

    // Encontrar el valor máximo para escalar
    const valorMax = Math.max(...elementos.map(e => e.valor));

    elementos.forEach((medida, idx) => {
      const y = margen + (idx * espacioEntre);
      const color = roughColors[medida.color] || roughColors.azul;
      
      // Escalar la barra según el valor
      const anchoReal = (medida.valor / valorMax) * anchoBarra;

      // Barra de medida
      const barra = rc.rectangle(margen, y, anchoReal, altoBarra, {
        ...defaultRoughConfig,
        stroke: color,
        fill: color,
        fillStyle: 'cross-hatch',
        fillWeight: 1,
        strokeWidth: 3,
        roughness: 0.8
      });
      svgRef.current!.appendChild(barra);

      // Etiqueta de la medida
      const etiqueta = medida.etiqueta || `Medida ${idx + 1}`;
      const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelText.setAttribute('x', (margen - 10).toString());
      labelText.setAttribute('y', (y + altoBarra / 2 + 5).toString());
      labelText.setAttribute('text-anchor', 'end');
      labelText.setAttribute('font-size', '14');
      labelText.setAttribute('font-weight', 'bold');
      labelText.setAttribute('font-family', 'Comic Sans MS, cursive');
      labelText.setAttribute('fill', '#1e293b');
      labelText.textContent = etiqueta;
      svgRef.current!.appendChild(labelText);

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

  const height = 100 + (elementos.length * 80);

  return (
    <div className="medidas-comparacion-container">
      <svg ref={svgRef} width="650" height={height} />
    </div>
  );
};
