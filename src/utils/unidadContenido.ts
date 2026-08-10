import type { IReflexionPregunta } from "@/interfaces/IUnidadIA";

/**
 * `contenido.materiales` y `contenido.reflexiones` conviven en dos formas:
 * el wizard guarda arrays planos, mientras que las unidades generadas por IA
 * quedaron persistidas con el envoltorio que devuelve el servicio Python
 * (`{ materiales: [...] }` / `{ reflexiones: [...] }`).
 *
 * Estos normalizadores aceptan ambas y toleran además que el modelo devuelva
 * strings sueltos en vez de objetos `{ pregunta }`.
 */

export function normalizeMateriales(raw: unknown): string[] {
  if (typeof raw === "string") return raw.trim() ? [raw] : [];
  if (Array.isArray(raw)) return raw.flatMap(normalizeMateriales);
  if (raw && typeof raw === "object" && "materiales" in raw)
    return normalizeMateriales((raw as { materiales: unknown }).materiales);
  return [];
}

function toPregunta(item: unknown): IReflexionPregunta | null {
  if (typeof item === "string") {
    const texto = item.trim();
    return texto ? { pregunta: texto } : null;
  }
  if (item && typeof item === "object") {
    const obj = item as Record<string, unknown>;
    for (const clave of ["pregunta", "texto", "reflexion"]) {
      const valor = obj[clave];
      if (typeof valor === "string" && valor.trim()) return { pregunta: valor.trim() };
    }
  }
  return null;
}

export function normalizeReflexiones(raw: unknown): IReflexionPregunta[] {
  if (Array.isArray(raw)) {
    return raw.map(toPregunta).filter((r): r is IReflexionPregunta => r !== null);
  }
  if (raw && typeof raw === "object" && "reflexiones" in raw)
    return normalizeReflexiones((raw as { reflexiones: unknown }).reflexiones);
  return [];
}
