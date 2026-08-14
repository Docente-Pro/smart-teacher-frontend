/** Docente Pro design tokens — alineados con DESIGN.md */

export const dpFocusRing =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7FA]";

export const dpPressable = "dp-press";

export const dpLiftable = "dp-press dp-lift";

export const dpCardShadow = "shadow-[0_8px_28px_rgba(31,41,55,0.05)]";

/** Well suave sobre lienzo blanco — agrupa listas sin volver al canvas gris */
export const dpCanvasWell =
  "rounded-[24px] border border-[#E6EBF2] bg-[#F5F7FA] p-3 sm:p-4";

/** Fila interactiva dentro de un well (surface blanca elevada) */
export const dpWellListRow = `rounded-[20px] border border-[#E6EBF2] bg-white ${dpCardShadow}`;

/** Fila interactiva directamente sobre lienzo blanco */
export const dpCanvasListRow =
  "rounded-[20px] border border-[#E6EBF2] bg-[#F5F7FA] hover:bg-[#EEF3F9]";

export const dpCtaPrimary = `${dpFocusRing} ${dpLiftable} dp-cta-soft-pattern inline-flex min-h-12 items-center justify-center rounded-[18px] bg-[#FF8B5C] px-5 text-base font-extrabold text-white shadow-[0_12px_28px_rgba(255,139,92,0.24)] hover:bg-[#F97316]`;

/** CTA peach en tarjeta grande (acción dominante del hub) */
export const dpCtaPrimaryCard = `${dpFocusRing} ${dpLiftable} dp-cta-soft-pattern relative flex min-h-[156px] w-full items-center gap-4 overflow-hidden rounded-[28px] bg-[#FF8B5C] p-5 text-left text-white shadow-[0_16px_40px_rgba(255,139,92,0.28)] hover:bg-[#F97316] sm:gap-5 sm:p-6`;

/** Upsell Premium — azul atmosphere, no compite con peach */
export const dpPremiumUpsellSidebar = `${dpFocusRing} ${dpLiftable} hidden rounded-[22px] border border-[#C5D8F2] bg-[#EAF2FC] p-4 text-left text-[#3B6CB5] shadow-[0_8px_24px_rgba(107,159,232,0.12)] hover:bg-[#DCE9FA] xl:block`;

export const dpPremiumUpsellIcon = `${dpFocusRing} ${dpLiftable} grid h-12 w-12 place-items-center rounded-[18px] border border-[#C5D8F2] bg-[#EAF2FC] text-[#3B6CB5] shadow-[0_8px_20px_rgba(107,159,232,0.1)] hover:bg-[#DCE9FA] xl:hidden`;

/** Separación vertical entre bloques principales del hub */
export const dpSectionGap = "mb-10";

export const dpInputClass = `${dpFocusRing} h-11 rounded-[16px] border-[#E6EBF2] bg-white text-base font-semibold text-[#1F2937] placeholder:text-[#9CA3AF]`;

export const dpOutlineButtonClass = `${dpFocusRing} h-11 rounded-[16px] border-[#E6EBF2] px-5 text-base font-bold text-[#6B7280] hover:bg-[#F5F7FA]`;

/** Entrada escalonada — index 0..5 (ver index.css) */
export function dpEnterClass(index = 0, maxDelay = 5): string {
  const clamped = Math.min(Math.max(index, 0), maxDelay);
  return clamped === 0 ? "dp-enter" : `dp-enter dp-enter-delay-${clamped}`;
}
