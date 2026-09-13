import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  DownloadSimple,
  Sparkle,
  Student,
  type Icon,
} from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type WorkflowStep = {
  icon: Icon;
  title: string;
  description: string;
  visualLabel: string;
};

const steps: WorkflowStep[] = [
  {
    icon: Student,
    title: "Cuéntanos sobre tu aula",
    description:
      "Selecciona nivel, grado, área, competencia y el tema que trabajarás.",
    visualLabel: "Captura pendiente de selección del contexto educativo",
  },
  {
    icon: Sparkle,
    title: "Recibe una propuesta",
    description:
      "Docente Pro organiza la secuencia y los elementos curriculares para que puedas revisarlos.",
    visualLabel: "Captura pendiente de la propuesta generada",
  },
  {
    icon: DownloadSimple,
    title: "Revisa y descarga",
    description:
      "Adapta el contenido a tu aula y llévalo contigo en un documento claro.",
    visualLabel: "Captura pendiente de revisión y descarga del documento",
  },
];

function BlankVisual({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`aspect-[16/10] w-full rounded-[16px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-50 ${className}`}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function GuidedWorkflow() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const progressRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        {
          desktop: "(min-width: 1024px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions ?? {};
          if (!desktop || reduceMotion) return;

          const panels = panelRefs.current.filter(
            (panel): panel is HTMLDivElement => Boolean(panel),
          );
          const stepElements = stepRefs.current.filter(
            (step): step is HTMLElement => Boolean(step),
          );
          const progress = progressRefs.current.filter(
            (item): item is HTMLSpanElement => Boolean(item),
          );

          if (
            !listRef.current ||
            !visualRef.current ||
            panels.length !== steps.length ||
            stepElements.length !== steps.length
          ) {
            return;
          }

          // Exit snappy / enter deliberate — marketing explanation moment.
          const EXIT_MS = 0.16;
          const ENTER_MS = 0.42;
          const EASE_OUT = "power3.out";

          gsap.set(panels[0], {
            autoAlpha: 1,
            transform: "translateY(0px) scale(1)",
            filter: "blur(0px)",
          });
          gsap.set(panels.slice(1), {
            autoAlpha: 0,
            transform: "translateY(14px) scale(0.97)",
            filter: "blur(2px)",
          });
          gsap.set(stepElements[0], { opacity: 1 });
          gsap.set(stepElements.slice(1), { opacity: 0.46 });
          gsap.set(progress[0], { transform: "scaleX(1)" });
          gsap.set(progress.slice(1), { transform: "scaleX(0)" });

          let activeIndex = 0;

          const showStep = (nextIndex: number) => {
            if (nextIndex === activeIndex) return;

            const previousPanel = panels[activeIndex];
            const nextPanel = panels[nextIndex];
            const goingForward = nextIndex > activeIndex;

            gsap.killTweensOf([
              previousPanel,
              nextPanel,
              ...stepElements,
              ...progress,
            ]);

            // Exit faster than enter (asymmetric timing).
            gsap.to(previousPanel, {
              autoAlpha: 0,
              filter: "blur(2px)",
              transform: goingForward
                ? "translateY(-10px) scale(0.97)"
                : "translateY(10px) scale(0.97)",
              duration: EXIT_MS,
              ease: EASE_OUT,
            });

            gsap.fromTo(
              nextPanel,
              {
                autoAlpha: 0,
                filter: "blur(2px)",
                transform: goingForward
                  ? "translateY(14px) scale(0.97)"
                  : "translateY(-14px) scale(0.97)",
              },
              {
                autoAlpha: 1,
                filter: "blur(0px)",
                transform: "translateY(0px) scale(1)",
                duration: ENTER_MS,
                ease: EASE_OUT,
                overwrite: true,
              },
            );

            gsap.to(stepElements, {
              opacity: 0.46,
              duration: EXIT_MS,
              ease: EASE_OUT,
            });
            gsap.to(stepElements[nextIndex], {
              opacity: 1,
              duration: 0.22,
              ease: EASE_OUT,
            });

            gsap.to(progress, {
              transform: "scaleX(0)",
              duration: EXIT_MS,
              ease: EASE_OUT,
            });
            gsap.to(progress[nextIndex], {
              transform: "scaleX(1)",
              duration: 0.32,
              ease: EASE_OUT,
            });

            activeIndex = nextIndex;
          };

          ScrollTrigger.create({
            trigger: listRef.current,
            start: "top top+=112",
            end: "bottom bottom-=96",
            pin: visualRef.current,
            pinSpacing: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          });

          stepElements.forEach((step, index) => {
            ScrollTrigger.create({
              trigger: step,
              start: "top center",
              end: "bottom center",
              onEnter: () => showStep(index),
              onEnterBack: () => showStep(index),
            });
          });
        },
      );

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="como-funciona"
      ref={sectionRef}
      className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32 lg:px-8"
    >
      <div className="max-w-3xl">
        <h2 className="text-balance font-['Outfit'] text-4xl font-bold tracking-[-0.04em] text-slate-950 md:text-5xl dark:text-white">
          De tu contexto al documento final.
        </h2>
        <p className="mt-5 max-w-[60ch] text-lg leading-8 text-slate-600 dark:text-slate-300">
          Sin instrucciones técnicas ni formularios intimidantes.
        </p>
      </div>

      <div
        ref={listRef}
        className="mt-14 grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16"
      >
        <div>
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <article
                key={step.title}
                ref={(element) => {
                  stepRefs.current[index] = element;
                }}
                className="flex min-h-[46vh] flex-col justify-center py-9 lg:min-h-[58vh]"
              >
                <div className="grid grid-cols-[52px_1fr] gap-5">
                  <div className="grid h-[52px] w-[52px] place-items-center rounded-[12px] bg-sky-100 text-[#075985] dark:bg-sky-950 dark:text-sky-300">
                    <IconComponent size={27} weight="duotone" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-['Outfit'] text-3xl font-semibold tracking-[-0.025em] text-slate-950 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-[48ch] text-lg leading-8 text-slate-600 dark:text-slate-300">
                      {step.description}
                    </p>
                    <span
                      ref={(element) => {
                        progressRefs.current[index] = element;
                      }}
                      aria-hidden="true"
                      className={`mt-6 block h-[3px] w-20 origin-left rounded-full bg-[#075985] dark:bg-sky-300 ${
                        index === 0 ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-8 lg:hidden">
                  <BlankVisual label={step.visualLabel} />
                </div>
              </article>
            );
          })}
        </div>

        <div className="hidden lg:block">
          <div
            ref={visualRef}
            className="relative aspect-[16/10] w-full [transform:translateZ(0)]"
            aria-live="polite"
          >
            {steps.map((step, index) => (
              <div
                key={step.visualLabel}
                ref={(element) => {
                  panelRefs.current[index] = element;
                }}
                className={`absolute inset-0 will-change-[transform,opacity,filter] ${
                  index === 0 ? "" : "invisible opacity-0"
                }`}
              >
                <BlankVisual label={step.visualLabel} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
