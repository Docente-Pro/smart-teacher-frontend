/** Copy unificado de conversión en la landing (un solo camino: probar gratis). */
export const LANDING_PRIMARY_CTA = "Probar gratis";
export const LANDING_CTA_SUBLINE = "2 sesiones incluidas · sin tarjeta";

export const LANDING_PAYMENT_NOTE =
  "Primero pruebas gratis con 2 sesiones. Si te convence, activas Premium desde S/20 al mes por Yape o WhatsApp. Sin tarjeta para empezar.";

import { getTutorialByVideoId } from "@/data/dashboardTutorials";

/** Tutorial paso a paso (YouTube) en la landing */
export const LANDING_TUTORIAL_VIDEO_ID = "VbRbbp37Weg";
export const LANDING_TUTORIAL_TITLE =
  getTutorialByVideoId(LANDING_TUTORIAL_VIDEO_ID)?.title ??
  "Tutorial Docente Pro: registro y 2 sesiones gratis";

const LANDING_CTA_SELLER_BASE =
  "dp-press dp-lift dp-cta-soft-pattern dp-cta-seller relative overflow-hidden focus-visible:outline-none focus-visible:ring-4";

/** CTA principal del hero — pulso + brillo más marcados */
export const LANDING_CTA_HERO_CLASSES =
  `${LANDING_CTA_SELLER_BASE} dp-cta-seller-hero inline-flex min-h-16 items-center justify-center rounded-[20px] bg-[#FF8B5C] px-9 text-xl font-extrabold text-white hover:bg-[#F97316] focus-visible:ring-white/50`;

/** CTAs peach secundarios en la landing — mismo lenguaje, ritmo más calmado */
export const LANDING_CTA_SOFT_CLASSES =
  `${LANDING_CTA_SELLER_BASE} dp-cta-seller-soft inline-flex items-center justify-center rounded-[20px] bg-[#FF8B5C] font-extrabold text-white shadow-[0_16px_40px_rgba(255,139,92,0.28)] hover:bg-[#F97316] focus-visible:ring-[rgba(255,139,92,0.32)]`;

/** Header compacto cuando ya hay scroll */
export const LANDING_CTA_HEADER_CLASSES =
  `${LANDING_CTA_SELLER_BASE} dp-cta-seller-soft inline-flex min-h-11 items-center whitespace-nowrap rounded-[18px] px-4 text-sm font-extrabold sm:min-h-12 sm:px-5 sm:text-base bg-[#FF8B5C] text-white shadow-[0_12px_32px_rgba(255,139,92,0.28)] hover:bg-[#F97316] focus-visible:ring-[rgba(255,139,92,0.32)]`;
