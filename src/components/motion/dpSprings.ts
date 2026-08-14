import type { Transition } from "framer-motion";

/**
 * Apple Design spring presets (WWDC 2018 — Designing Fluid Interfaces).
 * bounce: 0 ≈ damping 1.0 (sin overshoot). Solo usar bounce > 0 con momentum de gesto.
 */
export const dpSpringUi: Transition = {
  type: "spring",
  bounce: 0,
  duration: 0.35,
};

export const dpSpringSheet: Transition = {
  type: "spring",
  bounce: 0.2,
  duration: 0.3,
};

export const dpSpringEnter = (delayMs = 0): Transition => ({
  ...dpSpringUi,
  delay: delayMs / 1000,
});

export const dpStaggerStep = 0.04;

export const dpEnterVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export const dpStaggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: dpStaggerStep, delayChildren: 0.06 },
  },
};

/** Apple Design §12 — modal materialize (blur + scale, misma ruta al cerrar) */
export const dpModalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const dpModalPanelMaterialVariants = {
  hidden: { opacity: 0, scale: 0.94, filter: "blur(8px)" },
  visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.96, filter: "blur(4px)" },
};

export const dpModalPanelDefaultVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
};

export const dpModalFadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};
