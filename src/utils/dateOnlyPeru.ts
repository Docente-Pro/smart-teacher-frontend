/**
 * Utilidades para fechas "solo día" (sin hora) alineadas a Perú.
 * Evita que "2026-03-16" se muestre como 15 por interpretación UTC.
 * Usamos los componentes de fecha en UTC para no desplazar el día.
 */

/**
 * Convierte una fecha (YYYY-MM-DD o ISO con Z) a YYYY-MM-DD para <input type="date">.
 * Usa getUTC* para que el día no cambie en Perú (UTC-5).
 */
export function dateOnlyToInputValue(fecha: string | undefined): string {
  if (!fecha?.trim()) return "";
  const d = new Date(fecha.trim());
  if (isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Formatea una fecha "solo día" para mostrar en es-PE (ej. "16 de marzo de 2026").
 * Usa getUTC* y luego local para que el día no cambie en Perú.
 */
export function formatDateOnlyEsPE(fecha: string | undefined): string {
  if (!fecha?.trim()) return "";
  const d = new Date(fecha.trim());
  if (isNaN(d.getTime())) return fecha;
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  const localMidnight = new Date(y, m, day);
  return localMidnight.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
