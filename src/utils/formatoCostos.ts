/**
 * Formateo de importes de consumo de IA.
 *
 * El gasto por llamada son fracciones de centavo, así que un `toFixed(2)` fijo
 * lo mostraría todo como "$0.00". Estas funciones ajustan los decimales a la
 * magnitud del número para que un céntimo siga siendo legible.
 */

export function formatearUsd(valor: number | null | undefined): string {
  if (valor == null || !Number.isFinite(valor)) return "—";
  if (valor === 0) return "$0";
  if (Math.abs(valor) < 0.01) return `$${valor.toFixed(5)}`;
  if (Math.abs(valor) < 1) return `$${valor.toFixed(4)}`;
  return `$${valor.toFixed(2)}`;
}

export function formatearPen(valor: number | null | undefined): string {
  if (valor == null || !Number.isFinite(valor)) return "—";
  if (Math.abs(valor) < 0.01 && valor !== 0) return `S/ ${valor.toFixed(4)}`;
  return `S/ ${valor.toFixed(2)}`;
}

/** Miles con separador local, para recuentos de tokens y llamadas. */
export function formatearNumero(valor: number | null | undefined): string {
  if (valor == null || !Number.isFinite(valor)) return "—";
  return valor.toLocaleString("es-PE");
}

/** Tokens en forma compacta: 1 234 567 → "1.2 M". */
export function formatearTokens(valor: number | null | undefined): string {
  if (valor == null || !Number.isFinite(valor)) return "—";
  if (valor >= 1_000_000) return `${(valor / 1_000_000).toFixed(1)} M`;
  if (valor >= 1_000) return `${(valor / 1_000).toFixed(1)} K`;
  return String(valor);
}
