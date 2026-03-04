/**
 * Utilidades compartidas para texto SVG en gráficos educativos.
 * Resuelve problemas de superposición de etiquetas con spacing dinámico y word-wrap.
 */

// ─── Constantes ───

/** Ancho estimado por carácter a font-size 14px, Comic Sans MS */
const PX_PER_CHAR_14 = 7.5;
/** Ancho estimado por carácter a font-size 13px */
const PX_PER_CHAR_13 = 7;
/** Ancho estimado por carácter a font-size 12px */
const PX_PER_CHAR_12 = 6.5;
/** Ancho estimado por carácter a font-size 11px */
const PX_PER_CHAR_11 = 6;

// ─── Estimación de ancho de texto ───

/**
 * Estima el ancho en px de un texto SVG (Comic Sans, font-weight normal).
 * Es una aproximación conservadora que evita la necesidad de `getComputedTextLength()`.
 */
export function estimateTextWidth(text: string, fontSize: number = 14): number {
  const pxPerChar =
    fontSize >= 16 ? 8.5 :
    fontSize >= 14 ? PX_PER_CHAR_14 :
    fontSize >= 13 ? PX_PER_CHAR_13 :
    fontSize >= 12 ? PX_PER_CHAR_12 :
    PX_PER_CHAR_11;
  return text.length * pxPerChar;
}

// ─── Word-wrap ───

/**
 * Divide un texto en líneas que no excedan `maxChars` caracteres.
 * Respeta espacios y comas como puntos de corte naturales.
 */
export function wrapText(text: string, maxChars: number = 22): string[] {
  if (text.length <= maxChars) return [text];
  const tokens = text.split(/(\s+|,\s*)/);
  const lines: string[] = [];
  let current = '';
  for (const token of tokens) {
    if ((current + token).length > maxChars && current.length > 0) {
      lines.push(current.trim());
      current = token.trimStart();
    } else {
      current += token;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines.length > 0 ? lines : [text];
}

// ─── Spacing dinámico ───

export interface DynamicSpacingOptions {
  /** Lista de etiquetas (strings) a evaluar */
  labels: string[];
  /** Espaciado mínimo entre centros de elementos (px) */
  minSpacing: number;
  /** Font-size de las etiquetas */
  fontSize?: number;
  /** Padding extra a cada lado de la etiqueta más ancha */
  paddingExtra?: number;
  /** Máximo de caracteres por línea para word-wrap (si se habilita) */
  maxCharsPerLine?: number;
}

export interface DynamicSpacingResult {
  /** Spacing calculado entre centros de elementos */
  spacing: number;
  /** Margen izquierdo recomendado */
  margin: number;
}

/**
 * Calcula un spacing dinámico entre elementos basado en la etiqueta más larga.
 * El spacing nunca es menor que `minSpacing`.
 */
export function calcDynamicSpacing(opts: DynamicSpacingOptions): DynamicSpacingResult {
  const {
    labels,
    minSpacing,
    fontSize = 14,
    paddingExtra = 40,
    maxCharsPerLine,
  } = opts;

  // Cuando hay word-wrap, la longitud efectiva es la línea más larga, no el texto completo
  const effectiveMaxLen = labels.reduce((max, label) => {
    if (maxCharsPerLine) {
      const lines = wrapText(label, maxCharsPerLine);
      const longestLine = Math.max(...lines.map(l => l.length));
      return Math.max(max, longestLine);
    }
    return Math.max(max, label.length);
  }, 0);

  const estimatedWidth = estimateTextWidth('x'.repeat(effectiveMaxLen), fontSize);
  const spacing = Math.max(minSpacing, estimatedWidth + paddingExtra);
  const margin = Math.max(minSpacing / 2, estimatedWidth / 2 + 20);

  return { spacing, margin };
}

// ─── Creación de texto SVG con word-wrap ───

export interface SVGTextOptions {
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  fill?: string;
  textAnchor?: 'start' | 'middle' | 'end';
  maxCharsPerLine?: number;
  lineHeight?: number;
}

/**
 * Crea un elemento `<text>` SVG con soporte opcional de word-wrap usando `<tspan>`.
 * Si el texto cabe en una línea, crea un `<text>` simple.
 * Si no, crea múltiples `<tspan>` dentro del `<text>`.
 *
 * @returns El elemento SVG `<text>` listo para appendChild.
 */
export function createSVGText(opts: SVGTextOptions): SVGTextElement {
  const {
    x,
    y,
    text,
    fontSize = 14,
    fontWeight = 'normal',
    fontFamily = 'Comic Sans MS, cursive',
    fill = '#1e293b',
    textAnchor = 'middle',
    maxCharsPerLine,
    lineHeight = 16,
  } = opts;

  const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  textEl.setAttribute('x', x.toString());
  textEl.setAttribute('text-anchor', textAnchor);
  textEl.setAttribute('font-size', fontSize.toString());
  textEl.setAttribute('font-weight', fontWeight);
  textEl.setAttribute('font-family', fontFamily);
  textEl.setAttribute('fill', fill);

  if (maxCharsPerLine && text.length > maxCharsPerLine) {
    const lines = wrapText(text, maxCharsPerLine);
    lines.forEach((line, idx) => {
      const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      tspan.setAttribute('x', x.toString());
      tspan.setAttribute('y', (y + idx * lineHeight).toString());
      tspan.textContent = line;
      textEl.appendChild(tspan);
    });
  } else {
    textEl.setAttribute('y', y.toString());
    textEl.textContent = text;
  }

  return textEl;
}

/**
 * Calcula altura extra que ocupan las líneas wrapeadas (para ajustar viewBox).
 */
export function getWrappedTextExtraHeight(
  labels: string[],
  maxCharsPerLine: number,
  lineHeight: number = 16
): number {
  let maxExtraLines = 0;
  for (const label of labels) {
    const lines = wrapText(label, maxCharsPerLine);
    if (lines.length > 1) {
      maxExtraLines = Math.max(maxExtraLines, lines.length - 1);
    }
  }
  return maxExtraLines * lineHeight;
}
