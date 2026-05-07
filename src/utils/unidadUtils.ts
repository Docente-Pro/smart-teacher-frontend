import type { IUnidadListItem } from "@/interfaces/IUnidadList";

/**
 * Verifica si una fechaFin indica que la unidad sigue activa.
 * Activa = fechaFin es null/vacía o está en el futuro.
 */
export function isUnidadFechaActiva(fechaFin?: string | null): boolean {
  if (fechaFin == null || fechaFin === "") return true;
  const t = new Date(fechaFin).getTime();
  if (Number.isNaN(t)) return true;
  return t > Date.now();
}

/**
 * Una unidad está activa si no tiene fechaFin o si fechaFin está en el futuro.
 */
export function isUnidadActiva(unidad: IUnidadListItem): boolean {
  return isUnidadFechaActiva(unidad.fechaFin);
}

/** @deprecated Usa isUnidadFechaActiva o isUnidadActiva de '@/utils/unidadUtils' */
export const isUnidadListaActiva = isUnidadFechaActiva;
