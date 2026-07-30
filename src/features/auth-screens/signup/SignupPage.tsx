import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { BookOpen } from "lucide-react";
import SignupForm from "./components/SignupForm";
import SocialLogin from "./components/SocialLogin";
import { useUserStatus } from "@/hooks/useUserStatus";
import { useAuthStore } from "@/store/auth.store";

function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const { isPremium, isLoading } = useUserStatus();
  const { user: backendUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && backendUser && !isLoading) {
      if (isPremium) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, backendUser, isPremium, isLoading, navigate]);

  return (
    <div
      className="dp-canvas-dots flex min-h-[100dvh] text-[#1F2937]"
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
    >
      <div className="flex w-full items-center justify-center px-4 py-8 sm:px-8 lg:w-[48%] lg:px-12 lg:py-10">
        <div className="dp-enter w-full max-w-[440px]">
          <div className="rounded-[28px] border border-[#E6EBF2] bg-white p-6 shadow-[0_8px_28px_rgba(31,41,55,0.05)] sm:p-8">
            <div className="mb-6 flex flex-col items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-[18px] bg-[#6B9FE8] text-white shadow-[0_10px_24px_rgba(107,159,232,0.28)]">
                <BookOpen className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#3B6CB5]">Docente Pro</p>
                <h1 className="mt-1 text-balance text-3xl font-extrabold tracking-[-0.02em] text-[#1F2937]">
                  Crea tu cuenta
                </h1>
                <p className="mt-2 text-base font-semibold leading-7 text-[#6B7280]">
                  Empieza a planificar tus sesiones en minutos.
                </p>
              </div>
            </div>

            <SignupForm />
            <div className="mt-5">
              <SocialLogin />
            </div>

            <p className="mt-6 text-center text-base font-semibold text-[#6B7280]">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="font-extrabold text-[#3B6CB5] underline-offset-2 hover:text-[#6B9FE8] hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] focus-visible:ring-offset-2"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>

      <aside
        className="dp-banner-notebook relative hidden overflow-hidden bg-[#6B9FE8] lg:flex lg:w-[52%] lg:flex-col lg:justify-between lg:p-12 xl:p-14"
        aria-hidden="true"
      >
        <div className="relative z-10 max-w-lg">
          <p className="text-sm font-bold text-white/90">
            Para docentes peruanos
          </p>
          <h2 className="mt-3 text-balance text-4xl font-extrabold leading-tight tracking-[-0.02em] text-white">
            Tu planificación, lista para el aula
          </h2>
          <p className="mt-4 max-w-[36ch] text-lg font-semibold leading-8 text-white/95">
            Sin tarjeta al empezar. Crea sesiones alineadas al Currículo Nacional.
          </p>
        </div>

        <ul className="relative z-10 mt-10 max-w-md space-y-3 text-base font-semibold text-white">
          <li className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[12px] bg-white/20 text-sm font-extrabold">
              1
            </span>
            Regístrate en un momento
          </li>
          <li className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[12px] bg-white/20 text-sm font-extrabold">
              2
            </span>
            Crea tu primera sesión
          </li>
          <li className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[12px] bg-white/20 text-sm font-extrabold">
              3
            </span>
            Descárgala lista para clase
          </li>
        </ul>

        <img
          src="/dashboard/welcome-female.png?v=signup1"
          alt=""
          className="dp-banner-art pointer-events-none absolute bottom-0 right-0 z-[1] h-[58%] w-auto max-w-[55%] object-contain object-bottom xl:h-[62%] xl:max-w-[50%]"
          loading="eager"
          decoding="async"
        />
      </aside>
    </div>
  );
}

export default SignupPage;
