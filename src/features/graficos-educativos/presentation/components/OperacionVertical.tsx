import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { ConfiguracionGrafico } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface OperacionVerticalData extends ConfiguracionGrafico {
  operacion: '+' | '-' | '×' | '÷';
  numeros: number[];
  mostrarResultado?: boolean;
  resultado?: number;
  llevadasPrestas?: { posicion: number; valor: number }[];
}

interface Props {
  data: OperacionVerticalData;
}

/**
 * Componente para mostrar operaciones matemáticas en formato vertical
 * Fundamental para enseñar algoritmos de suma, resta, multiplicación y división
 */
export const OperacionVertical: React.FC<Props> = ({ data }) => {
  // Adaptar estructura: si viene con 'elementos', extraer el primer elemento
  const operacionData = (data as any).elementos && Array.isArray((data as any).elementos) && (data as any).elementos.length > 0
    ? (data as any).elementos[0]
    : data;

  const { operacion, numeros, mostrarResultado = true, llevadasPrestas = [] } = operacionData;
  const svgRef = useRef<SVGSVGElement>(null);

  // Calcular resultado automáticamente si no viene especificado
  const calcularResultado = (): number | undefined => {
    if (operacionData.resultado !== undefined) return operacionData.resultado;
    if (!numeros || numeros.length === 0) return undefined;

    switch (operacion) {
      case '+':
        return numeros.reduce((acc: number, num: number) => acc + num, 0);
      case '-':
        return numeros.reduce((acc: number, num: number, idx: number) => idx === 0 ? num : acc - num);
      case '×':
      case '*':
        return numeros.reduce((acc: number, num: number) => acc * num, 1);
      case '÷':
      case '/':
        return numeros.length >= 2 ? numeros[0] / numeros[1] : undefined;
      default:
        return undefined;
    }
  };

  const resultado = calcularResultado();

  useEffect(() => {
    if (!svgRef.current || !numeros || numeros.length === 0) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const digitoAncho = 35;
    const filaAlto = 50;
    const margen = 80;

    // Calcular el número más largo para alinear correctamente
    const maxDigitos = Math.max(...numeros.map((n: number) => n.toString().length), 
                                 resultado ? resultado.toString().length : 0);
    const anchoTotal = maxDigitos * digitoAncho;

    let currentY = margen;

    // Dibujar cada número
    numeros.forEach((numero: number, idx: number) => {
      const numeroStr = numero.toString();
      const digitos = numeroStr.split('');

      // Alinear a la derecha
      const offsetX = margen + ((maxDigitos - digitos.length) * digitoAncho);

      digitos.forEach((digito: string, digitoIdx: number) => {
        const x = offsetX + (digitoIdx * digitoAncho);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (x + digitoAncho / 2).toString());
        text.setAttribute('y', (currentY + 5).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '32');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-family', 'Comic Sans MS, cursive');
        text.setAttribute('fill', '#1e293b');
        text.textContent = digito;
        svgRef.current!.appendChild(text);
      });

      // Símbolo de operación en el primer término subsecuente
      if (idx > 0) {
        const simboloText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        simboloText.setAttribute('x', (margen - 30).toString());
        simboloText.setAttribute('y', (currentY + 5).toString());
        simboloText.setAttribute('text-anchor', 'middle');
        simboloText.setAttribute('font-size', '32');
        simboloText.setAttribute('font-weight', 'bold');
        simboloText.setAttribute('font-family', 'Arial');
        simboloText.setAttribute('fill', roughColors.rojo);
        simboloText.textContent = operacion;
        svgRef.current!.appendChild(simboloText);
      }

      currentY += filaAlto;
    });

    // Línea divisoria antes del resultado
    const lineaY = currentY - 15;
    const linea = rc.line(margen, lineaY, margen + anchoTotal, lineaY, {
      ...defaultRoughConfig,
      strokeWidth: 3,
      roughness: 0.8
    });
    svgRef.current.appendChild(linea);

    // Resultado
    if (mostrarResultado && resultado !== undefined) {
      const resultadoStr = resultado.toString();
      const digitos = resultadoStr.split('');
      const offsetX = margen + ((maxDigitos - digitos.length) * digitoAncho);

      digitos.forEach((digito, digitoIdx) => {
        const x = offsetX + (digitoIdx * digitoAncho);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (x + digitoAncho / 2).toString());
        text.setAttribute('y', (currentY + 20).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '32');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-family', 'Comic Sans MS, cursive');
        text.setAttribute('fill', roughColors.verde);
        text.textContent = digito;
        svgRef.current!.appendChild(text);
      });
    }

    // Llevadas o préstamos (números pequeños arriba)
    llevadasPrestas.forEach(({ posicion, valor }: { posicion: number; valor: number }) => {
      const x = margen + (maxDigitos - posicion - 1) * digitoAncho + digitoAncho / 2;
      const y = margen - 20;

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x.toString());
      text.setAttribute('y', y.toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '16');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('font-family', 'Arial');
      text.setAttribute('fill', roughColors.naranja);
      text.textContent = valor.toString();
      svgRef.current!.appendChild(text);
    });

  }, [data]);

  return (
    <div className="operacion-vertical-container">
      <svg ref={svgRef} width="400" height="350" />
    </div>
  );
};
