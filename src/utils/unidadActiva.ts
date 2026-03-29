/**
 * Unidad activa (backend): fechaFin == null o fechaFin > ahora.
 * Unidad finalizada: fechaFin existe y ya pasó.
 */
export function isUnidadListaActiva(fechaFin?: string | null): boolean {
  if (fechaFin == null || fechaFin === "") return true;
  const t = new Date(fechaFin).getTime();
  if (Number.isNaN(t)) return true;
  return t > Date.now();
}
