const DEFAULT_DURATION_MS = 220;
const DEFAULT_OFFSET_PX = 88;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export interface SmoothScrollOptions {
  offset?: number;
  duration?: number;
}

/** Scroll rápido con easing suave (no instantáneo, no lento). */
export function smoothScrollToSection(
  sectionId: string,
  { offset = DEFAULT_OFFSET_PX, duration = DEFAULT_DURATION_MS }: SmoothScrollOptions = {},
): void {
  const target = document.getElementById(sectionId);
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    window.scrollTo({ top, behavior: "auto" });
    focusSection(sectionId);
    return;
  }

  const startY = window.scrollY;
  const distance = top - startY;
  if (Math.abs(distance) < 2) return;

  const startTime = performance.now();

  const step = (currentTime: number) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * easeOutCubic(progress));

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      focusSection(sectionId);
    }
  };

  requestAnimationFrame(step);
}

function focusSection(sectionId: string): void {
  const target = document.getElementById(sectionId);
  if (!target) return;

  if (!target.hasAttribute("tabindex")) {
    target.setAttribute("tabindex", "-1");
  }
  target.focus({ preventScroll: true });
}
