import { useEffect, useRef } from 'react';
import rough from 'roughjs';
import type { RoughSVG } from 'roughjs/bin/svg';

/**
 * Hook para inicializar Rough.js en un elemento SVG
 * Retorna una referencia al SVG y al generador de Rough.js
 */
export const useRoughSVG = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const roughRef = useRef<RoughSVG | null>(null);

  useEffect(() => {
    if (svgRef.current && !roughRef.current) {
      roughRef.current = rough.svg(svgRef.current);
    }
  }, []);

  return { svgRef, roughSvg: roughRef.current };
};

/**
 * Configuración por defecto para gráficos educativos
 */
export const defaultRoughConfig = {
  roughness: 1.2,
  bowing: 1,
  strokeWidth: 2,
  fillStyle: 'hachure' as const,
  fillWeight: 0.5,
  hachureGap: 4,
  hachureAngle: -41,
  simplification: 0
};

/**
 * Colores educativos en formato RGB
 */
export const roughColors = {
  azul: '#4A90E2',
  rojo: '#E24A4A',
  amarillo: '#F5D547',
  verde: '#7ED321',
  naranja: '#F5A623',
  morado: '#BD10E0',
  neutro: '#2C3E50'
};

/**
 * Determina el color de texto óptimo (blanco o negro) según la
 * luminosidad del fondo. Esencial para impresión B&N.
 */
export const textColorForBg = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.6 ? '#ffffff' : '#1e293b';
};

/**
 * Config rápida para forma con relleno sólido (ideal para formas con texto encima).
 * Mantiene bordes irregulares "hand-drawn" pero el interior es limpio.
 */
export const solidFillConfig = (color: string, extra?: Record<string, unknown>) => ({
  ...defaultRoughConfig,
  stroke: color,
  fill: color,
  fillStyle: 'solid' as const,
  strokeWidth: 2,
  roughness: 0.8,
  ...extra,
});
