import { IGrado } from "@/interfaces/IGrado";

/**
 * Filtra los grados según el nivel seleccionado
 * @param grados - Todos los grados disponibles
 * @param nivelId - ID del nivel seleccionado
 * @returns Grados filtrados por nivel
 */
export function filterGradosByNivel(grados: IGrado[], nivelId: number): IGrado[] {
  if (!nivelId) return [];
  return grados.filter((grado) => grado.nivelId === nivelId);
}

/**
 * Verifica si un grado pertenece al nivel seleccionado
 * @param gradoId - ID del grado a verificar
 * @param gradosFiltrados - Grados del nivel seleccionado
 * @returns true si el grado pertenece al nivel
 */
export function isGradoValidForNivel(gradoId: number, gradosFiltrados: IGrado[]): boolean {
  if (!gradoId) return false;
  return gradosFiltrados.some((grado) => grado.id === gradoId);
}
