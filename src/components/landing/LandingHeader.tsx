import { useEffect, useState } from "react";
import { Link } from "react-router";
import { BookOpen } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  LANDING_CTA_HEADER_CLASSES,
  LANDING_PRIMARY_CTA,
} from "@/utils/landingCopy";

function LandingHeader() {
  const { isAuthenticated } = useAuth0();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => {
      setScrolled(window.scrollY > 0);
    };

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrolled);
    };
  }, []);

  const onHero = !scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,box-shadow,color] duration-200 ${
        onHero
          ? "border-b border-white/15 bg-transparent"
          : "border-b border-[#E6EBF2] bg-white shadow-[0_8px_28px_rgba(31,41,55,0.06)]"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-10">
        <Link
          to="/"
          className="dp-press flex min-h-11 items-center gap-2.5 rounded-[16px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] sm:gap-3"
        >
          <div
            className={`grid h-10 w-10 place-items-center rounded-[14px] shadow-[0_10px_24px_rgba(31,65,112,0.16)] sm:h-11 sm:w-11 ${
              onHero
                ? "bg-white text-[#3B6CB5]"
                : "bg-[#6B9FE8] text-white"
            }`}
          >
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <span
            className={`text-base font-extrabold sm:text-lg ${
              onHero ? "text-white" : "text-[#1F2937]"
            }`}
          >
            Docente Pro
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className={`dp-press dp-lift inline-flex min-h-11 items-center whitespace-nowrap rounded-[18px] px-4 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] sm:min-h-12 sm:px-5 sm:text-base ${
                onHero
                  ? "bg-white text-[#3B6CB5] shadow-[0_10px_28px_rgba(31,65,112,0.18)] hover:bg-white/95"
                  : "bg-[#FF8B5C] text-white shadow-[0_12px_32px_rgba(255,139,92,0.28)] hover:bg-[#F97316]"
              }`}
            >
              Ir al panel
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className={`dp-press inline-flex min-h-11 items-center whitespace-nowrap rounded-[16px] px-3 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] sm:min-h-12 sm:rounded-[18px] sm:px-4 sm:text-base ${
                  onHero
                    ? "text-white/90 hover:bg-white/10 hover:text-white"
                    : "text-[#3B6CB5] hover:bg-[#EAF2FC]"
                }`}
              >
                Entrar
              </Link>
              <Link
                to="/signup"
                className={
                  onHero
                    ? "dp-press dp-lift inline-flex min-h-11 items-center whitespace-nowrap rounded-[18px] bg-white px-4 text-sm font-extrabold text-[#3B6CB5] shadow-[0_10px_28px_rgba(31,65,112,0.2)] hover:bg-white/95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] sm:min-h-12 sm:px-5 sm:text-base"
                    : LANDING_CTA_HEADER_CLASSES
                }
              >
                {LANDING_PRIMARY_CTA}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default LandingHeader;
