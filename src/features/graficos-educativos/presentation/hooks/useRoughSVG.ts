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
 * Paleta extendida de colores con nombre.
 * El backend envía nombres como "verde", "azul", etc.
 * Esta paleta mapea TODOS los nombres aceptados a su hex correspondiente.
 */
export const colorPalette: Record<string, string> = {
  // — Colores base (ColorGrafico enum) —
  azul:      '#4A90E2',
  rojo:      '#E24A4A',
  amarillo:  '#F5D547',
  verde:     '#7ED321',
  naranja:   '#F5A623',
  morado:    '#BD10E0',
  neutro:    '#2C3E50',
  // — Colores extendidos —
  rosa:      '#E91E63',
  celeste:   '#03A9F4',
  turquesa:  '#009688',
  marron:    '#795548',
  gris:      '#607D8B',
  dorado:    '#F5A623',
  indigo:    '#3F51B5',
  cyan:      '#00BCD4',
  lima:      '#CDDC39',
  coral:     '#FF6B6B',
  lavanda:   '#CE93D8',
  oliva:     '#8BC34A',
  salmon:    '#FF8A80',
  borgoña:   '#880E4F',
  esmeralda: '#2ECC71',
  oceano:    '#1565C0',
  menta:     '#80CBC4',
  melocoton: '#FFAB91',
  // — Aliases comunes (español) —
  blanco:    '#FFFFFF',
  negro:     '#1E293B',
  purpura:   '#BD10E0',
  violeta:   '#9C27B0',
};

/**
 * Resuelve un color que puede venir como nombre ("verde", "azul")
 * o como hex ("#FF6B6B").
 * - Si es un nombre conocido → devuelve el hex de la paleta
 * - Si ya es hex (#xxx o #xxxxxx) → lo pasa tal cual
 * - Fallback → '#4A90E2' (azul)
 */
export function resolveColor(color: string | undefined, fallback = '#4A90E2'): string {
  if (!color) return fallback;
  // Si empieza con # es hex directo
  if (color.startsWith('#')) return color;
  // Buscar en la paleta (lowercase + trim)
  const key = color.toLowerCase().trim();
  return colorPalette[key] ?? fallback;
}

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
