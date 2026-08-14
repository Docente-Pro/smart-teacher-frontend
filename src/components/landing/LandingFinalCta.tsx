import { Link } from "react-router";
import SmoothScrollLink from "@/components/landing/SmoothScrollLink";
import {
  LANDING_CTA_SOFT_CLASSES,
  LANDING_CTA_SUBLINE,
  LANDING_PAYMENT_NOTE,
  LANDING_PRIMARY_CTA,
} from "@/utils/landingCopy";

function LandingFinalCta() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-[#E6EBF2] bg-white px-8 py-10 text-center shadow-[0_16px_48px_rgba(60,88,128,0.08)] sm:px-12 sm:py-12">
        <h2 className="text-balance text-3xl font-extrabold tracking-[-0.03em] text-[#1F2937] sm:text-4xl">
          ¿Listo para tu próxima sesión?
        </h2>
        <p className="mx-auto mt-4 max-w-[42ch] text-lg font-semibold leading-8 text-[#6B7280]">
          {LANDING_PAYMENT_NOTE}
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            to="/signup"
            className={`${LANDING_CTA_SOFT_CLASSES} min-h-16 w-full max-w-sm px-10 text-xl sm:max-w-md`}
          >
            {LANDING_PRIMARY_CTA}
          </Link>
          <SmoothScrollLink
            href="#tutorial"
            className="dp-press inline-flex min-h-11 items-center text-base font-extrabold text-[#3B6CB5] underline decoration-[#6B9FE8]/50 decoration-2 underline-offset-8 hover:decoration-[#3B6CB5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
          >
            ¿Prefieres ver el tutorial primero?
          </SmoothScrollLink>
        </div>

        <p className="mt-4 text-base font-extrabold text-[#3B6CB5]">
          {LANDING_CTA_SUBLINE}
        </p>
      </div>
    </section>
  );
}

export default LandingFinalCta;
