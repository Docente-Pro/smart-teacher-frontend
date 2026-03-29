/**
 * Normaliza etiquetas de columnas/encabezados cuando el backend o la IA envían:
 * - objetos con `nombre`, `encabezado`, etc.
 * - strings con dict estilo Python: {'nombre': 'X', 'tipo': 'texto'}
 */

export function normalizarEtiquetaGrafico(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    const pick =
      o.nombre ??
      o.encabezado ??
      o.texto ??
      o.contenido ??
      o.valor ??
      o.titulo;
    if (pick !== undefined) return normalizarEtiquetaGrafico(pick);
    return "";
  }

  const raw = String(value).trim();
  if (!raw) return "";

  if (raw.startsWith("{") && raw.endsWith("}")) {
    try {
      const normalized = raw.replace(/'/g, '"');
      const parsed = JSON.parse(normalized) as Record<string, unknown>;
      const pick =
        parsed.nombre ??
        parsed.encabezado ??
        parsed.texto ??
        parsed.contenido ??
        parsed.valor ??
        parsed.titulo;
      if (pick !== undefined) return normalizarEtiquetaGrafico(pick);
    } catch {
      const m = raw.match(/['"]nombre['"]\s*:\s*['"]([^'"]*)['"]/i);
      if (m) return m[1];
      const m2 = raw.match(/['"]nombre['"]\s*:\s*'((?:[^'\\]|\\.)*)'/);
      if (m2) return m2[1].replace(/\\'/g, "'");
    }
  }

  return raw;
}

/** Para `tabla_observacion`: alinear clase numérica cuando `tipo` viene en string u objeto. */
export function normalizarTipoColumnaObservacion(
  col: unknown,
): "texto" | "numero" | undefined {
  if (col && typeof col === "object" && "tipo" in col) {
    const t = String((col as Record<string, unknown>).tipo ?? "").toLowerCase();
    if (t === "numero" || t === "number") return "numero";
    if (t) return "texto";
    return undefined;
  }

  if (typeof col === "string" && col.includes("tipo")) {
    const raw = col.trim();
    try {
      const normalized = raw.replace(/'/g, '"');
      const parsed = JSON.parse(normalized) as Record<string, unknown>;
      const t = String(parsed.tipo ?? "").toLowerCase();
      if (t === "numero" || t === "number") return "numero";
      if (t) return "texto";
    } catch {
      const m = raw.match(/['"]tipo['"]\s*:\s*['"]([^'"]*)['"]/i);
      if (m) {
        const t = m[1].toLowerCase();
        if (t === "numero" || t === "number") return "numero";
        return "texto";
      }
    }
  }

  return undefined;
}
