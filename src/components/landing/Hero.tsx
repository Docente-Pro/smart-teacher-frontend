import { useNavigate } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import SmoothScrollLink from "@/components/landing/SmoothScrollLink";
import {
  LANDING_CTA_HERO_CLASSES,
  LANDING_CTA_SUBLINE,
  LANDING_PRIMARY_CTA,
} from "@/utils/landingCopy";

function Hero() {
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
      return;
    }
    navigate("/signup");
  };

  return (
    <section className="dp-enter relative isolate overflow-hidden">
      {/* Atmósfera full-bleed del cuaderno del docente */}
      <div
        className="dp-banner-notebook dp-banner-notebook-landing pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-[8%] bottom-[-42%] h-[92%] aspect-square rounded-full bg-white/[0.14]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid min-h-[min(80dvh,820px)] max-w-7xl grid-cols-1 items-center gap-4 px-5 pb-8 pt-24 sm:px-8 sm:pt-28 lg:grid-cols-[1.02fr_0.98fr] lg:gap-4 lg:px-10 lg:py-10">
        <div className="flex max-w-[40rem] flex-col gap-8">
          <div>
            <h1 className="text-balance text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl">
              Tu sesión de clase, lista en minutos
            </h1>
            <p className="mt-6 max-w-[34ch] text-xl font-semibold leading-8 text-white/95 sm:text-2xl sm:leading-9">
              Prepárala según el Currículo Nacional y descárgala en{" "}
              <span className="font-extrabold text-white">Word o PDF</span>.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleGetStarted}
              className={LANDING_CTA_HERO_CLASSES}
            >
              {isAuthenticated ? "Ir al panel" : LANDING_PRIMARY_CTA}
            </button>
            <SmoothScrollLink
              href="#como-funciona"
              className="inline-flex min-h-12 items-center px-2 text-lg font-extrabold text-white underline decoration-white/50 decoration-2 underline-offset-8 hover:decoration-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              Ver cómo funciona
            </SmoothScrollLink>
          </div>
          {!isAuthenticated && (
            <p className="text-base font-extrabold text-white/90">
              {LANDING_CTA_SUBLINE}
            </p>
          )}
        </div>

        <div className="relative flex min-h-[340px] items-end justify-center self-end lg:min-h-[540px] lg:justify-end">
          <div
            className="absolute bottom-[12%] right-[4%] h-[68%] w-[72%] rounded-full bg-white/25 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-[8%] right-[2%] h-[78%] w-[84%] rounded-[48%_48%_18%_18%] border border-white/30 bg-white/28 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_20px_60px_rgba(255,255,255,0.14)]"
            aria-hidden="true"
          />
          <span
            className="absolute left-[0%] top-[14%] z-[2] rotate-[-7deg] rounded-[14px] bg-white px-3 py-2 text-sm font-extrabold text-[#3B6CB5] shadow-[0_16px_36px_rgba(31,65,112,0.18)] sm:left-[2%] sm:top-[20%] sm:rounded-[16px] sm:px-4 sm:py-3 sm:text-base"
            aria-hidden="true"
          >
            Documento Word
          </span>
          <span
            className="absolute bottom-[20%] right-[-4%] z-[2] rotate-[6deg] rounded-[14px] bg-[#FFF4EF] px-3 py-2 text-sm font-extrabold text-[#C75F38] shadow-[0_16px_36px_rgba(31,65,112,0.16)] sm:bottom-[18%] sm:right-[-2%] sm:rounded-[16px] sm:px-4 sm:py-3 sm:text-base"
            aria-hidden="true"
          >
            También en PDF
          </span>
          <img
            src="/landing/teacher-female-cutout-cropped.png"
            alt="Docente con su cuaderno y materiales de clase"
            className="dp-banner-art pointer-events-none relative z-[1] h-[360px] w-auto max-w-full object-contain object-bottom drop-shadow-[0_32px_56px_rgba(31,65,112,0.32)] sm:h-[430px] lg:h-[min(70vh,600px)]"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            width={600}
            height={720}
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
