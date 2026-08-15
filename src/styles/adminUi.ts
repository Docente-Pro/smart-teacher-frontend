import { dpCardShadow, dpCtaPrimary, dpFocusRing, dpInputClass } from "@/styles/dpTokens";

export const adminCard = `rounded-[28px] border border-[#E6EBF2] bg-white ${dpCardShadow}`;

export const adminSelect = `${dpFocusRing} h-11 rounded-[16px] border border-[#E6EBF2] bg-white px-3 text-base font-semibold text-[#1F2937]`;

export const adminInput = dpInputClass;

export const adminCta = `${dpCtaPrimary} disabled:opacity-50`;

export const adminBtnAtmosphere = `${dpFocusRing} dp-press inline-flex h-11 items-center justify-center rounded-[16px] bg-[#6B9FE8] px-5 text-base font-extrabold text-white shadow-[0_8px_20px_rgba(107,159,232,0.28)] hover:bg-[#3B6CB5] disabled:opacity-50`;

export const adminBtnGhost = `${dpFocusRing} inline-flex h-11 items-center justify-center rounded-[16px] px-4 text-base font-bold text-[#6B7280] hover:bg-[#EAF2FC] hover:text-[#3B6CB5] disabled:opacity-50`;

export const adminBtnDanger = `${dpFocusRing} dp-press inline-flex h-11 items-center justify-center rounded-[16px] bg-[#C2410C] px-5 text-base font-extrabold text-white hover:bg-[#9A3412] disabled:opacity-50`;

export const adminBtnDangerOutline = `${dpFocusRing} inline-flex h-11 items-center justify-center rounded-[16px] border border-[#E6EBF2] px-4 text-base font-bold text-[#C2410C] hover:bg-[#FFF7ED] disabled:opacity-50`;

export const adminBtnWarningOutline = `${dpFocusRing} inline-flex h-11 items-center justify-center rounded-[16px] bg-[#FFF7ED] px-4 text-base font-bold text-[#C2410C] hover:bg-[#FFEDD5] disabled:opacity-50`;

export const adminRowBtn = `${dpFocusRing} inline-flex h-9 items-center justify-center gap-1 rounded-[14px] px-3 text-sm font-bold disabled:opacity-50`;

export const adminRowWarning = `${adminRowBtn} bg-[#FFF7ED] text-[#C2410C] hover:bg-[#FFEDD5]`;

export const adminRowAtmosphere = `${adminRowBtn} bg-[#EAF2FC] text-[#3B6CB5] hover:bg-[#DCE9FA]`;

export const adminRowGreen = `${adminRowBtn} bg-[#E3F8EC] text-[#15803D] hover:bg-[#DCFCE7]`;

export const adminRowPink = `${adminRowBtn} bg-[#FCE7F3] text-[#BE185D] hover:bg-[#FBCFE8]`;

export const adminTh =
  "px-4 py-3 text-left text-sm font-bold text-[#6B7280]";

export const adminTd = "px-4 py-3 text-base font-semibold text-[#1F2937]";
