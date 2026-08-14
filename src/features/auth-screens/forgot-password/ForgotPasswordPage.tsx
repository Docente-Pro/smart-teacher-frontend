import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, ArrowLeft, CheckCircle, Send, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/services/backendAuth.service";

const fieldFocus =
  "h-12 rounded-[16px] border-[#E6EBF2] bg-[#F5F7FA] text-base font-semibold text-[#1F2937] placeholder:text-[#9CA3AF] shadow-none focus-visible:border-[#6B9FE8] focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("El correo electrónico es obligatorio");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Ingresa un correo electrónico válido");
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="dp-canvas-dots flex min-h-[100dvh] text-[#1F2937]"
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
    >
      <div className="flex w-full items-center justify-center px-4 py-10 sm:px-8 lg:w-[48%] lg:px-12">
        <div className="dp-enter w-full max-w-[420px]">
          <div className="rounded-[28px] border border-[#E6EBF2] bg-white p-6 shadow-[0_8px_28px_rgba(31,41,55,0.05)] sm:p-8">
            <Link
              to="/login"
              className="dp-press mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-[#6B7280] hover:text-[#3B6CB5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver al inicio de sesión
            </Link>

            <div className="mb-7 flex flex-col items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-[18px] bg-[#6B9FE8] text-white shadow-[0_10px_24px_rgba(107,159,232,0.28)]">
                <BookOpen className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#3B6CB5]">Docente Pro</p>
                <h1 className="mt-1 text-balance text-3xl font-extrabold tracking-[-0.02em] text-[#1F2937]">
                  Recupera tu acceso
                </h1>
                <p className="mt-2 text-base font-semibold leading-7 text-[#6B7280]">
                  Te enviamos un enlace para crear una nueva contraseña.
                </p>
              </div>
            </div>

            {submitted ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-[#E3F8EC]">
                  <CheckCircle
                    className="h-8 w-8 text-[#15803D]"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#1F2937]">
                    Revisa tu correo
                  </h2>
                  <p className="mt-3 text-base font-semibold leading-7 text-[#6B7280]">
                    Si el email{" "}
                    <span className="font-extrabold text-[#1F2937]">
                      {email}
                    </span>{" "}
                    está registrado, recibirás un enlace para restablecer tu
                    contraseña.
                  </p>
                </div>
                <div className="space-y-3">
                  <Button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="dp-press dp-lift dp-cta-soft-pattern relative h-12 w-full overflow-hidden rounded-[20px] bg-[#FF8B5C] text-base font-extrabold text-white shadow-[0_16px_40px_rgba(255,139,92,0.28)] hover:bg-[#F97316] focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
                  >
                    Volver al inicio de sesión
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                    }}
                    className="dp-press h-12 w-full rounded-[20px] text-base font-extrabold text-[#6B7280] hover:bg-[#EAF2FC] hover:text-[#3B6CB5] focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
                  >
                    Intentar con otro correo
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-bold text-[#1F2937]"
                  >
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]"
                      aria-hidden="true"
                    />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="tu@email.com"
                      className={`${fieldFocus} pl-11`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      disabled={isLoading}
                      autoFocus
                      aria-invalid={Boolean(error)}
                      aria-describedby={
                        error ? "email-error" : "email-hint"
                      }
                    />
                  </div>
                  {error ? (
                    <p
                      id="email-error"
                      className="text-sm font-semibold text-[#C2410C]"
                    >
                      {error}
                    </p>
                  ) : (
                    <p
                      id="email-hint"
                      className="text-sm font-semibold leading-5 text-[#9CA3AF]"
                    >
                      Te enviaremos un enlace para crear una nueva contraseña.
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="dp-press dp-lift dp-cta-soft-pattern relative h-12 w-full overflow-hidden rounded-[20px] bg-[#FF8B5C] text-base font-extrabold text-white shadow-[0_16px_40px_rgba(255,139,92,0.28)] hover:bg-[#F97316] focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
                >
                  {isLoading ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="h-5 w-5" aria-hidden="true" />
                      Enviar enlace de recuperación
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      <aside
        className="dp-banner-notebook relative hidden overflow-hidden bg-[#6B9FE8] lg:flex lg:w-[52%] lg:flex-col lg:justify-between lg:p-12 xl:p-14"
        aria-hidden="true"
      >
        <div className="relative z-10 max-w-lg">
          <p className="text-sm font-bold text-white/90">Recuperación segura</p>
          <h2 className="mt-3 text-balance text-4xl font-extrabold leading-tight tracking-[-0.02em] text-white">
            No te preocupes, lo resolvemos rápido
          </h2>
          <p className="mt-4 max-w-[36ch] text-lg font-semibold leading-8 text-white/95">
            Solo necesitas tu correo. En pocos minutos vuelves a planificar.
          </p>
        </div>

        <ul className="relative z-10 mt-10 max-w-md space-y-3 text-base font-semibold text-white">
          <li className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[12px] bg-white/20 text-sm font-extrabold">
              1
            </span>
            Ingresa tu correo electrónico
          </li>
          <li className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[12px] bg-white/20 text-sm font-extrabold">
              2
            </span>
            Revisa tu bandeja de entrada
          </li>
          <li className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[12px] bg-white/20 text-sm font-extrabold">
              3
            </span>
            Crea una nueva contraseña
          </li>
        </ul>

        <img
          src="/dashboard/welcome-male.png?v=forgot1"
          alt=""
          className="dp-banner-art pointer-events-none absolute bottom-0 right-0 z-[1] h-[58%] w-auto max-w-[55%] object-contain object-bottom xl:h-[62%] xl:max-w-[50%]"
          loading="eager"
          decoding="async"
        />
      </aside>
    </div>
  );
}

export default ForgotPasswordPage;
