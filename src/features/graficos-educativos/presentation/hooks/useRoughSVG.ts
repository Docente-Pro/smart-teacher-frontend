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
