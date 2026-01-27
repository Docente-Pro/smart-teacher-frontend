import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { GraficoNumerosOrdinales, ColorGrafico } from '../../domain/types';
import { roughColors, defaultRoughConfig } from '../hooks/useRoughSVG';

interface Props {
  data: GraficoNumerosOrdinales;
}

// Mapeo de números a texto ordinal
const numerosOrdinalesTexto: Record<number, string> = {
  1: 'Primero',
  2: 'Segundo', 
  3: 'Tercero',
  4: 'Cuarto',
  5: 'Quinto',
  6: 'Sexto',
  7: 'Séptimo',
  8: 'Octavo',
  9: 'Noveno',
  10: 'Décimo',
  11: 'Undécimo',
  12: 'Duodécimo'
};

/**
 * Componente para mostrar números ordinales (1°, 2°, 3°, etc.)
 * Útil para enseñar secuencias, orden y posiciones
 */
export const NumerosOrdinales: React.FC<Props> = ({ data }) => {
  const { elementos, mostrarTexto = false } = data;
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Siempre usar orientación horizontal
  const orientacion = 'horizontal';

  // Mapeo de colores
  const colorMap: Record<ColorGrafico, string> = {
    [ColorGrafico.AZUL]: roughColors.azul,
    [ColorGrafico.ROJO]: roughColors.rojo,
    [ColorGrafico.AMARILLO]: roughColors.amarillo,
    [ColorGrafico.VERDE]: roughColors.verde,
    [ColorGrafico.NARANJA]: roughColors.naranja,
    [ColorGrafico.MORADO]: roughColors.morado,
    [ColorGrafico.NEUTRO]: roughColors.neutro
  };

  // Colores predeterminados para cada número
  const coloresPredeterminados = [
    ColorGrafico.NEUTRO,
    ColorGrafico.AZUL,
    ColorGrafico.ROJO,
    ColorGrafico.VERDE,
    ColorGrafico.AMARILLO,
    ColorGrafico.MORADO,
    ColorGrafico.NARANJA,
    ColorGrafico.AZUL,
    ColorGrafico.ROJO,
    ColorGrafico.VERDE,
    ColorGrafico.AMARILLO,
    ColorGrafico.MORADO
  ];

  useEffect(() => {
    if (!svgRef.current || !elementos || elementos.length === 0) return;

    const rc = rough.svg(svgRef.current);
    svgRef.current.innerHTML = '';

    const anchoBase = 120;
    const altoBase = 120;
    const espacioEntreCajas = 16;
    const margen = 30;
    const maxCajasPorFila = 6; // Máximo de cajas por fila en modo horizontal

    elementos.forEach((elemento, index) => {
      // Calcular tamaño según configuración
      let ancho = anchoBase;
      let alto = altoBase;
      
      if (elemento.tamano === 'pequeno') {
        ancho = 90;
        alto = 90;
      } else if (elemento.tamano === 'grande') {
        ancho = 150;
        alto = 150;
      }

      // Calcular posición
      let x: number, y: number;
      if (orientacion === 'horizontal') {
        // Horizontal = cajas horizontalmente con wrapping
        const fila = Math.floor(index / maxCajasPorFila);
        const columna = index % maxCajasPorFila;
        x = margen + (columna * (ancho + espacioEntreCajas));
        y = margen + (fila * (alto + espacioEntreCajas + (mostrarTexto ? 35 : 10)));
      } else {
        // Vertical = cajas verticalmente (una debajo de otra)
        x = margen;
        y = margen + (index * (alto + espacioEntreCajas));
      }

      // Determinar color
      const colorIndex = (elemento.numero - 1) % coloresPredeterminados.length;
      const color = elemento.color 
        ? colorMap[elemento.color] 
        : colorMap[coloresPredeterminados[colorIndex]];

      // Estilo de caja (más destacado si está marcado)
      const strokeWidth = elemento.destacado ? 5 : 2.5;
      const fillWeight = elemento.destacado ? 0.3 : 1;
      const fillStyle = elemento.destacado ? 'solid' : 'solid';

      // Dibujar caja redondeada
      const caja = rc.rectangle(x, y, ancho, alto, {
        ...defaultRoughConfig,
        stroke: color,
        fill: color,
        fillStyle: fillStyle,
        strokeWidth: strokeWidth,
        roughness: 0.5,
        fillWeight: fillWeight
      });
      svgRef.current!.appendChild(caja);

      // Si está destacado, agregar un resplandor/borde adicional
      if (elemento.destacado) {
        // Rectángulo exterior con efecto de resplandor
        const resplandor = rc.rectangle(x - 4, y - 4, ancho + 8, alto + 8, {
          stroke: color,
          strokeWidth: 3,
          roughness: 0.3,
          fill: 'none',
          strokeLineDash: [8, 4]
        });
        svgRef.current!.appendChild(resplandor);
      }

      // Borde interior decorativo
      const bordeInterior = rc.rectangle(x + 8, y + 8, ancho - 16, alto - 16, {
        stroke: color,
        strokeWidth: 2,
        roughness: 0.4,
        fill: 'none'
      });
      svgRef.current!.appendChild(bordeInterior);

      // Número ordinal (1°, 2°, etc.)
      const numeroOrdinal = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      const fontSize = elemento.tamano === 'pequeno' ? 36 : elemento.tamano === 'grande' ? 52 : 44;
      
      // Determinar color del texto según el fondo para mejor contraste
      const coloresOscuros = [ColorGrafico.AZUL, ColorGrafico.ROJO, ColorGrafico.MORADO, ColorGrafico.VERDE, ColorGrafico.NEUTRO];
      const colorActual = elemento.color || coloresPredeterminados[colorIndex];
      const textColor = coloresOscuros.includes(colorActual) ? '#ffffff' : '#1e293b';
      
      numeroOrdinal.setAttribute('x', (x + ancho / 2).toString());
      numeroOrdinal.setAttribute('y', (y + alto / 2 + fontSize / 3).toString());
      numeroOrdinal.setAttribute('text-anchor', 'middle');
      numeroOrdinal.setAttribute('font-size', fontSize.toString());
      numeroOrdinal.setAttribute('font-weight', 'bold');
      numeroOrdinal.setAttribute('font-family', 'Arial, sans-serif');
      numeroOrdinal.setAttribute('fill', textColor);
      numeroOrdinal.textContent = `${elemento.numero}°`;
      svgRef.current!.appendChild(numeroOrdinal);

      // Etiqueta personalizada debajo (solo si el elemento tiene etiqueta)
      if (elemento.etiqueta) {
        const textoDescriptivo = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const yTexto = orientacion === 'horizontal' ? y + alto + 24 : y + alto / 2;
        const xTexto = orientacion === 'horizontal' ? x + ancho / 2 : x + ancho + 15;
        
        textoDescriptivo.setAttribute('x', xTexto.toString());
        textoDescriptivo.setAttribute('y', yTexto.toString());
        textoDescriptivo.setAttribute('text-anchor', orientacion === 'horizontal' ? 'middle' : 'start');
        textoDescriptivo.setAttribute('font-size', '16');
        textoDescriptivo.setAttribute('font-weight', '700');
        textoDescriptivo.setAttribute('font-family', 'Arial, sans-serif');
        textoDescriptivo.setAttribute('fill', '#1e293b');
        textoDescriptivo.textContent = elemento.etiqueta;
        svgRef.current!.appendChild(textoDescriptivo);
      }
    });

  }, [elementos, orientacion, mostrarTexto]);

  // Calcular dimensiones del SVG
  const calcularDimensiones = () => {
    if (!elementos || elementos.length === 0) return { width: 400, height: 200 };

    const anchoBase = 120;
    const altoBase = 120;
    const espacioEntreCajas = 16;
    const margen = 30;
    // Espacio para etiquetas personalizadas si existen
    const tieneEtiquetas = elementos.some(e => e.etiqueta);
    const espacioTexto = tieneEtiquetas ? 45 : 10;
    const maxCajasPorFila = 6;

    if (orientacion === 'horizontal') {
      // Horizontal = cajas horizontalmente con múltiples filas si es necesario
      const numFilas = Math.ceil(elementos.length / maxCajasPorFila);
      const cajasPorFila = Math.min(elementos.length, maxCajasPorFila);
      const width = (margen * 2) + (cajasPorFila * anchoBase) + ((cajasPorFila - 1) * espacioEntreCajas) + 20; // +20 extra de seguridad
      const height = (margen * 2) + (numFilas * altoBase) + ((numFilas - 1) * espacioEntreCajas) + (numFilas * espacioTexto);
      return { width, height };
    } else {
      // Vertical = cajas verticalmente (una debajo de otra)
      const width = margen * 2 + anchoBase + (mostrarTexto ? 150 : 0);
      const height = margen * 2 + (elementos.length * (altoBase + espacioEntreCajas)) - espacioEntreCajas;
      return { width, height };
    }
  };

  const { width, height } = calcularDimensiones();

  return (
    <div className="numeros-ordinales-container" style={{ width: '100%', maxWidth: '100%' }}>
      <svg 
        ref={svgRef} 
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', maxWidth: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};
