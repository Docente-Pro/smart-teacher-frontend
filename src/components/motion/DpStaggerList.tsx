import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  dpEnterVariants,
  dpSpringUi,
  dpStaggerContainer,
} from "@/components/motion/dpSprings";

interface DpStaggerListProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
}

/** Grid/lista con entrada escalonada — spring interruptible por hijo. */
export function DpStaggerList({
  children,
  className = "",
}: DpStaggerListProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={dpStaggerContainer}
    >
      {children}
    </motion.div>
  );
}

interface DpStaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function DpStaggerItem({ children, className = "" }: DpStaggerItemProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={dpEnterVariants}
      transition={dpSpringUi}
    >
      {children}
    </motion.div>
  );
}
