import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { dpEnterVariants, dpSpringEnter } from "@/components/motion/dpSprings";

type DpEnterAs = "div" | "section" | "header" | "nav" | "article";

interface DpEnterProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  as?: DpEnterAs;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  id?: string;
}

const motionTags = {
  div: motion.div,
  section: motion.section,
  header: motion.header,
  nav: motion.nav,
  article: motion.article,
} as const;

const staticTags: Record<DpEnterAs, DpEnterAs> = {
  div: "div",
  section: "section",
  header: "header",
  nav: "nav",
  article: "article",
};

/** Entrada con spring (critically damped). Cross-fade si reduced motion. */
export default function DpEnter({
  children,
  className = "",
  delayMs = 0,
  as = "div",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  id,
}: DpEnterProps) {
  const reduced = usePrefersReducedMotion();
  const Tag = motionTags[as];

  if (reduced) {
    const Static = staticTags[as];
    return (
      <Static
        className={className}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        id={id}
      >
        {children}
      </Static>
    );
  }

  return (
    <Tag
      className={className}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      id={id}
      initial="hidden"
      animate="visible"
      variants={dpEnterVariants}
      transition={dpSpringEnter(delayMs)}
    >
      {children}
    </Tag>
  );
}
