import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoOperacionVertical } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoOperacionVertical;
}

/**
 * Componente para mostrar operaciones matemáticas en formato vertical
 * Fundamental para enseñar algoritmos de suma, resta, multiplicación y división
 */
export const OperacionVertical: React.FC<Props> = ({ data }) => {
  const { operacion, operandos, mostrarResultado = true, llevadasPrestas = [], destacarLlevadas = false } = data;

  // Mapear operación en palabras a símbolos
  const simboloOperacion = {
    suma: '+',
    resta: '-',
    multiplicacion: '×',
    division: '÷'
  }[operacion] || '+';
  const svgRef = useRef<SVGSVGElement>(null);

  // Calcular resultado automáticamente si no viene especificado
  const calcularResultado = (): number | undefined => {
    if (data.resultado !== undefined) return data.resultado;
    if (!operandos || operandos.length === 0) return undefined;

    switch (operacion) {
      case 'suma':
        return operandos.reduce((acc: number, num: number) => acc + num, 0);
      case 'resta':
        return operandos.reduce((acc: number, num: number, idx: number) => idx === 0 ? num : acc - num);
      case 'multiplicacion':
        return operandos.reduce((acc: number, num: number) => acc * num, 1);
      case 'division':
        return operandos.length >= 2 ? Math.floor(operandos[0] / operandos[1]) : undefined;
      default:
        return undefined;
    }
  };

  const resultado = calcularResultado();

  useEffect(() => {
    if (!svgRef.current || !operandos || operandos.length === 0) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const digitoAncho = 35;
    const filaAlto = 50;
    const margen = 80;

    // Calcular el número más largo para alinear correctamente
    const maxDigitos = Math.max(...operandos.map((n: number) => n.toString().length), 
                                 resultado ? resultado.toString().length : 0);
    const anchoTotal = maxDigitos * digitoAncho;

    let currentY = margen;

    // Dibujar cada número
    operandos.forEach((numero: number, idx: number) => {
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
        simboloText.textContent = simboloOperacion;
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
    if (destacarLlevadas && llevadasPrestas.length > 0) {
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
    }

  }, [data]);

  return (
    <div className="operacion-vertical-container">
      <svg ref={svgRef} viewBox="0 0 400 350" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: '400px' }} />
    </div>
  );
};
