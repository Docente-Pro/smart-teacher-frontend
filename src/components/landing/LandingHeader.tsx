import { Link } from "react-router";
import { BookOpen } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

function LandingHeader() {
  const { isAuthenticated } = useAuth0();

  return (
    <header className="sticky top-0 z-40 bg-[#6B9FE8]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:px-10">
        <Link
          to="/"
          className="dp-press flex min-h-11 items-center gap-3 rounded-[16px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
        >
          <div className="grid h-10 w-10 place-items-center rounded-[14px] bg-white text-[#3B6CB5] shadow-[0_10px_24px_rgba(31,65,112,0.16)]">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="hidden text-lg font-extrabold text-white sm:inline">
            Docente Pro
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="dp-press dp-lift inline-flex min-h-12 items-center whitespace-nowrap rounded-[18px] bg-[#FF8B5C] px-5 text-base font-extrabold text-white shadow-[0_12px_32px_rgba(95,66,42,0.2)] hover:bg-[#F97316] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
            >
              Ir al panel
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="dp-press inline-flex min-h-11 items-center whitespace-nowrap rounded-[16px] px-3 text-sm font-extrabold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 sm:min-h-12 sm:rounded-[18px] sm:px-4 sm:text-base"
              >
                Entrar
              </Link>
              <Link
                to="/signup"
                className="dp-press dp-lift inline-flex min-h-11 items-center whitespace-nowrap rounded-[16px] bg-[#FF8B5C] px-4 text-sm font-extrabold text-white shadow-[0_12px_32px_rgba(95,66,42,0.2)] hover:bg-[#F97316] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 sm:min-h-12 sm:rounded-[18px] sm:px-5 sm:text-base"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default LandingHeader;
