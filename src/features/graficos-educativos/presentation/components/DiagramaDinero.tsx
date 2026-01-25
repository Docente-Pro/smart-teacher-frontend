import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { ConfiguracionGrafico } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Billete {
  tipo: 'billete';
  valor: number;
  cantidad: number;
}

interface Moneda {
  tipo: 'moneda';
  valor: number;
  cantidad: number;
}

interface DiagramaDineroData extends ConfiguracionGrafico {
  elementos: (Billete | Moneda)[];
  moneda: 'S/' | '$' | '€';
  mostrarTotal?: boolean;
}

interface Props {
  data: DiagramaDineroData;
}

/**
 * Componente para representar dinero (billetes y monedas)
 * Esencial para problemas de compra-venta y manejo de dinero
 */
export const DiagramaDinero: React.FC<Props> = ({ data }) => {
  const { elementos, moneda = 'S/', mostrarTotal = true } = data;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !elementos || elementos.length === 0) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    let currentY = 30;
    let total = 0;
    const margenIzquierdo = 30;

    elementos.forEach((elem, index) => {
      const subtotal = elem.valor * elem.cantidad;
      total += subtotal;

      if (elem.tipo === 'billete') {
        // Dibujar billetes
        const anchoBillete = 140;
        const altoBillete = 70;
        const espacioX = 150;

        // Etiqueta del tipo de billete
        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelGroup.setAttribute('x', margenIzquierdo.toString());
        labelGroup.setAttribute('y', (currentY - 8).toString());
        labelGroup.setAttribute('font-size', '14');
        labelGroup.setAttribute('font-weight', '600');
        labelGroup.setAttribute('font-family', 'Arial, sans-serif');
        labelGroup.setAttribute('fill', '#64748b');
        labelGroup.textContent = `Billetes de ${moneda}${elem.valor}:`;
        svgRef.current!.appendChild(labelGroup);

        for (let i = 0; i < elem.cantidad; i++) {
          const x = margenIzquierdo + (i * espacioX);
          
          const color = elem.valor >= 100 ? roughColors.morado : 
                       elem.valor >= 50 ? roughColors.azul :
                       elem.valor >= 20 ? roughColors.verde :
                       elem.valor >= 10 ? roughColors.naranja :
                       roughColors.amarillo;

          // Rectángulo del billete con sombra
          const billete = rc.rectangle(x, currentY, anchoBillete, altoBillete, {
            ...defaultRoughConfig,
            stroke: color,
            fill: color,
            fillStyle: 'cross-hatch',
            fillWeight: 1,
            strokeWidth: 3,
            roughness: 0.6
          });
          svgRef.current!.appendChild(billete);

          // Decoración del billete (borde interior)
          const bordeInterior = rc.rectangle(x + 8, currentY + 8, anchoBillete - 16, altoBillete - 16, {
            stroke: color,
            strokeWidth: 2,
            roughness: 0.5,
            fill: 'none'
          });
          svgRef.current!.appendChild(bordeInterior);

          // Valor del billete
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', (x + anchoBillete / 2).toString());
          text.setAttribute('y', (currentY + altoBillete / 2 + 10).toString());
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('font-size', '28');
          text.setAttribute('font-weight', 'bold');
          text.setAttribute('font-family', 'Arial, sans-serif');
          text.setAttribute('fill', '#1e293b');
          text.textContent = `${moneda}${elem.valor}`;
          svgRef.current!.appendChild(text);
        }

        currentY += altoBillete + 35;

      } else if (elem.tipo === 'moneda') {
        // Dibujar monedas
        const radioMoneda = elem.valor >= 5 ? 38 : 
                           elem.valor >= 2 ? 34 : 
                           elem.valor >= 1 ? 30 : 26;
        const espacioX = (radioMoneda * 2) + 20;

        // Etiqueta del tipo de moneda
        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelGroup.setAttribute('x', margenIzquierdo.toString());
        labelGroup.setAttribute('y', (currentY - 8).toString());
        labelGroup.setAttribute('font-size', '14');
        labelGroup.setAttribute('font-weight', '600');
        labelGroup.setAttribute('font-family', 'Arial, sans-serif');
        labelGroup.setAttribute('fill', '#64748b');
        const valorMoneda = elem.valor >= 1 ? `${moneda}${elem.valor}` : `${elem.valor * 100}¢`;
        labelGroup.textContent = `Monedas de ${valorMoneda}:`;
        svgRef.current!.appendChild(labelGroup);

        for (let i = 0; i < elem.cantidad; i++) {
          const centerX = margenIzquierdo + radioMoneda + (i * espacioX);
          const centerY = currentY + radioMoneda;

          const color = elem.valor >= 5 ? roughColors.amarillo :
                       elem.valor >= 2 ? roughColors.naranja :
                       elem.valor >= 1 ? roughColors.neutro :
                       '#94a3b8';

          // Círculo exterior de la moneda
          const monedaExterior = rc.circle(centerX, centerY, radioMoneda * 2, {
            ...defaultRoughConfig,
            stroke: color,
            fill: color,
            fillStyle: 'solid',
            strokeWidth: 3,
            roughness: 0.3
          });
          svgRef.current!.appendChild(monedaExterior);

          // Círculo interior decorativo
          const monedaInterior = rc.circle(centerX, centerY, radioMoneda * 1.6, {
            stroke: color,
            strokeWidth: 2,
            roughness: 0.4,
            fill: 'none'
          });
          svgRef.current!.appendChild(monedaInterior);

          // Valor de la moneda
          const fontSize = elem.valor >= 5 ? 20 : elem.valor >= 1 ? 18 : 16;
          // Usar texto blanco para monedas oscuras (1 sol y menos), negro para monedas claras
          const textColor = elem.valor < 2 ? '#ffffff' : '#1e293b';
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', centerX.toString());
          text.setAttribute('y', (centerY + fontSize/3).toString());
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('font-size', fontSize.toString());
          text.setAttribute('font-weight', 'bold');
          text.setAttribute('font-family', 'Arial, sans-serif');
          text.setAttribute('fill', textColor);
          text.textContent = elem.valor >= 1 ? `${elem.valor}` : `${(elem.valor * 100).toFixed(0)}¢`;
          svgRef.current!.appendChild(text);
        }

        currentY += (radioMoneda * 2) + 35;
      }
    });

    // Mostrar total
    if (mostrarTotal && total > 0) {
      currentY += 15;
      
      // Línea separadora con estilo
      const linea = rc.line(margenIzquierdo, currentY, 500, currentY, {
        ...defaultRoughConfig,
        strokeWidth: 3,
        roughness: 0.5,
        stroke: '#059669'
      });
      svgRef.current!.appendChild(linea);

      // Fondo del total
      const fondoTotal = rc.rectangle(margenIzquierdo, currentY + 10, 200, 45, {
        fill: '#d1fae5',
        fillStyle: 'solid',
        stroke: '#059669',
        strokeWidth: 2,
        roughness: 0.5
      });
      svgRef.current!.appendChild(fondoTotal);

      // Texto "TOTAL:"
      const labelTotal = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelTotal.setAttribute('x', (margenIzquierdo + 10).toString());
      labelTotal.setAttribute('y', (currentY + 38).toString());
      labelTotal.setAttribute('text-anchor', 'start');
      labelTotal.setAttribute('font-size', '20');
      labelTotal.setAttribute('font-weight', 'bold');
      labelTotal.setAttribute('font-family', 'Arial, sans-serif');
      labelTotal.setAttribute('fill', '#047857');
      labelTotal.textContent = 'TOTAL:';
      svgRef.current!.appendChild(labelTotal);

      // Valor del total
      const totalText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      totalText.setAttribute('x', (margenIzquierdo + 90).toString());
      totalText.setAttribute('y', (currentY + 38).toString());
      totalText.setAttribute('text-anchor', 'start');
      totalText.setAttribute('font-size', '26');
      totalText.setAttribute('font-weight', 'bold');
      totalText.setAttribute('font-family', 'Arial, sans-serif');
      totalText.setAttribute('fill', '#059669');
      totalText.textContent = `${moneda}${total.toFixed(2)}`;
      svgRef.current!.appendChild(totalText);
    }

  }, [elementos, moneda, mostrarTotal]);

  return (
    <div className="diagrama-dinero-container">
      <svg ref={svgRef} width="600" height="600" style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
};
