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
    if (!svgRef.current) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    let currentY = 20;
    let total = 0;

    elementos.forEach((elem) => {
      const subtotal = elem.valor * elem.cantidad;
      total += subtotal;

      if (elem.tipo === 'billete') {
        // Dibujar billetes
        const anchoBillete = 120;
        const altoBillete = 60;
        const espacioX = 130;

        for (let i = 0; i < elem.cantidad; i++) {
          const x = 20 + (i * espacioX);
          
          const color = elem.valor >= 100 ? roughColors.morado : 
                       elem.valor >= 50 ? roughColors.azul :
                       elem.valor >= 20 ? roughColors.verde :
                       roughColors.naranja;

          // Rectángulo del billete
          const billete = rc.rectangle(x, currentY, anchoBillete, altoBillete, {
            ...defaultRoughConfig,
            stroke: color,
            fill: color,
            fillStyle: 'cross-hatch',
            fillWeight: 0.8,
            strokeWidth: 3,
            roughness: 0.8
          });
          svgRef.current!.appendChild(billete);

          // Valor del billete
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', (x + anchoBillete / 2).toString());
          text.setAttribute('y', (currentY + altoBillete / 2 + 8).toString());
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('font-size', '22');
          text.setAttribute('font-weight', 'bold');
          text.setAttribute('font-family', 'Comic Sans MS, cursive');
          text.setAttribute('fill', '#1e293b');
          text.textContent = `${moneda}${elem.valor}`;
          svgRef.current!.appendChild(text);
        }

        currentY += altoBillete + 25;

      } else if (elem.tipo === 'moneda') {
        // Dibujar monedas
        const radioMoneda = elem.valor >= 5 ? 35 : elem.valor >= 2 ? 30 : 25;
        const espacioX = (radioMoneda * 2) + 15;

        for (let i = 0; i < elem.cantidad; i++) {
          const centerX = 20 + radioMoneda + (i * espacioX);
          const centerY = currentY + radioMoneda;

          const color = elem.valor >= 5 ? roughColors.amarillo :
                       elem.valor >= 2 ? roughColors.naranja :
                       roughColors.neutro;

          // Círculo de la moneda
          const moneda = rc.circle(centerX, centerY, radioMoneda * 2, {
            ...defaultRoughConfig,
            stroke: color,
            fill: color,
            fillStyle: 'solid',
            strokeWidth: 3,
            roughness: 0.5
          });
          svgRef.current!.appendChild(moneda);

          // Valor de la moneda
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', centerX.toString());
          text.setAttribute('y', (centerY + 6).toString());
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('font-size', (radioMoneda / 2).toString());
          text.setAttribute('font-weight', 'bold');
          text.setAttribute('font-family', 'Comic Sans MS, cursive');
          text.setAttribute('fill', '#1e293b');
          text.textContent = elem.valor >= 1 ? `${moneda}${elem.valor}` : `${elem.valor * 100}¢`;
          svgRef.current!.appendChild(text);
        }

        currentY += (radioMoneda * 2) + 25;
      }
    });

    // Mostrar total
    if (mostrarTotal && total > 0) {
      currentY += 10;
      
      // Línea separadora
      const linea = rc.line(20, currentY, 400, currentY, {
        ...defaultRoughConfig,
        strokeWidth: 2,
        roughness: 0.8
      });
      svgRef.current!.appendChild(linea);

      // Texto del total
      const totalText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      totalText.setAttribute('x', '20');
      totalText.setAttribute('y', (currentY + 30).toString());
      totalText.setAttribute('text-anchor', 'start');
      totalText.setAttribute('font-size', '24');
      totalText.setAttribute('font-weight', 'bold');
      totalText.setAttribute('font-family', 'Comic Sans MS, cursive');
      totalText.setAttribute('fill', '#059669');
      totalText.textContent = `TOTAL: ${moneda}${total.toFixed(2)}`;
      svgRef.current!.appendChild(totalText);
    }

  }, [data]);

  return (
    <div className="diagrama-dinero-container">
      {data.titulo && <h3 className="grafico-titulo">{data.titulo}</h3>}
      <svg ref={svgRef} width="600" height="500" />
    </div>
  );
};
