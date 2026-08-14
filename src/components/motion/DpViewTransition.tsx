import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { dpSpringUi } from "@/components/motion/dpSprings";

interface DpViewTransitionProps {
  viewKey: string;
  children: ReactNode;
  className?: string;
}

/**
 * Apple Design §7 — misma ruta al entrar/salir (slide vertical suave).
 * Spring critically damped; cross-fade estático si reduced motion.
 */
export default function DpViewTransition({
  viewKey,
  children,
  className = "",
}: DpViewTransitionProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return (
      <div key={viewKey} className={className}>
        {children}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        className={className}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={dpSpringUi}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
