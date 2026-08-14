import type { Problematica } from "../interfaces/problematica.interface";

function normalizeText(value?: string): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const QUICK_START_KEYWORDS = [
  "convivencia",
  "emocion",
  "identidad",
  "organizacion",
  "aula",
];

/**
 * Elige la problemática más segura para inicio rápido:
 * 1) la más usada por otros docentes, 2) temas universales, 3) la primera disponible.
 */
export function pickQuickStartProblematica(
  list: Problematica[],
): Problematica | null {
  if (!list.length) return null;

  const byUsage = [...list].sort(
    (a, b) => (b._count?.usuarios ?? 0) - (a._count?.usuarios ?? 0),
  );
  if ((byUsage[0]._count?.usuarios ?? 0) > 0) {
    return byUsage[0];
  }

  for (const keyword of QUICK_START_KEYWORDS) {
    const match = list.find((item) => normalizeText(item.nombre).includes(keyword));
    if (match) return match;
  }

  return list[0];
}
