import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, ArrowLeft, CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/services/backendAuth.service";

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
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md space-y-8">
          {/* Back to login */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </button>

          {/* Logo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DocentePro</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Recupera el acceso a tu cuenta
            </p>
          </div>

          {submitted ? (
            /* ─── Success State ─── */
            <div className="space-y-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Revisa tu correo
                </h2>
                <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                  Si el email <span className="font-medium text-gray-900 dark:text-white">{email}</span> está
                  registrado, recibirás un enlace para restablecer tu contraseña.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-5 text-base rounded-xl shadow-lg transition-all duration-300"
                >
                  Volver al inicio de sesión
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail("");
                  }}
                  className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Intentar con otro correo
                </Button>
              </div>
            </div>
          ) : (
            /* ─── Form State ─── */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Te enviaremos un enlace para que puedas crear una nueva contraseña.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-6 text-lg rounded-xl shadow-lg transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Enviar enlace de recuperación
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-25">
          <div className="absolute top-10 -left-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] bg-sky-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-lg text-white space-y-6 relative z-10">
          <h2 className="text-4xl font-bold">No te preocupes</h2>
          <p className="text-xl text-blue-100">
            Restablecer tu contraseña es rápido y sencillo. Solo necesitas tu correo electrónico.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span className="text-lg">Ingresa tu correo electrónico</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span className="text-lg">Revisa tu bandeja de entrada</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span className="text-lg">Crea una nueva contraseña</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
