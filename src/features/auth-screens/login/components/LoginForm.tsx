import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginStore } from "../store/loginStore";
import { LOGIN_VALIDATION } from "../constants/loginConstants";
import type { ILoginFormErrors } from "../interfaces/ILogin";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { Link, useNavigate } from "react-router";
import { loginWithBackend } from "@/services/backendAuth.service";
import { useAuthStore } from "@/store/auth.store";

const fieldFocus =
  "h-12 rounded-[16px] border-[#E6EBF2] bg-[#F5F7FA] text-base font-semibold text-[#1F2937] placeholder:text-[#9CA3AF] shadow-none focus-visible:border-[#6B9FE8] focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]";

function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ILoginFormErrors>({});
  const setTokens = useAuthStore((state) => state.setTokens);

  const { credentials, isLoading, setCredentials, setLoading, setError } =
    useLoginStore();

  const validateForm = (): boolean => {
    const newErrors: ILoginFormErrors = {};

    if (!credentials.email) {
      newErrors.email = LOGIN_VALIDATION.EMAIL.REQUIRED;
    } else if (!LOGIN_VALIDATION.EMAIL.PATTERN.test(credentials.email)) {
      newErrors.email = LOGIN_VALIDATION.EMAIL.INVALID;
    }

    if (!credentials.password) {
      newErrors.password = LOGIN_VALIDATION.PASSWORD.REQUIRED;
    } else if (
      credentials.password.length < LOGIN_VALIDATION.PASSWORD.MIN_LENGTH
    ) {
      newErrors.password = LOGIN_VALIDATION.PASSWORD.MIN_LENGTH_MESSAGE;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await loginWithBackend({
        email: credentials.email,
        password: credentials.password,
      });

      setTokens(response);

      if (response.refresh_token) {
        localStorage.setItem("refresh_token", response.refresh_token);
      }

      handleToaster("¡Inicio de sesión exitoso!", "success");
      navigate("/dashboard");
    } catch (error: any) {
      setLoading(false);

      const errorMessage = error.message || error.response?.data?.message;

      if (
        errorMessage?.includes("Wrong") ||
        errorMessage?.includes("invalid") ||
        errorMessage?.includes("credentials")
      ) {
        handleToaster("Email o contraseña incorrectos", "error");
        setError("Credenciales inválidas");
      } else {
        handleToaster(errorMessage || "Error al iniciar sesión", "error");
        setError(errorMessage || "Error al iniciar sesión");
      }
    }
  };

  return (
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
            value={credentials.email}
            onChange={(e) => setCredentials({ email: e.target.value })}
            disabled={isLoading}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </div>
        {errors.email && (
          <p id="email-error" className="text-sm font-semibold text-[#C2410C]">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-sm font-bold text-[#1F2937]"
        >
          Contraseña
        </Label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]"
            aria-hidden="true"
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${fieldFocus} pl-11 pr-12`}
            value={credentials.password}
            onChange={(e) => setCredentials({ password: e.target.value })}
            disabled={isLoading}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="dp-press absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-[12px] text-[#6B7280] hover:bg-white hover:text-[#1F2937] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && (
          <p
            id="password-error"
            className="text-sm font-semibold text-[#C2410C]"
          >
            {errors.password}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="flex min-h-11 cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={credentials.rememberMe}
            onChange={(e) =>
              setCredentials({ rememberMe: e.target.checked })
            }
            className="h-5 w-5 rounded border-[#E6EBF2] text-[#FF8B5C] accent-[#FF8B5C] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
          />
          <span className="text-base font-semibold text-[#6B7280]">
            Recordarme
          </span>
        </label>
        <Link
          to="/forgot-password"
          className="text-sm font-extrabold text-[#3B6CB5] underline-offset-2 hover:text-[#6B9FE8] hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] focus-visible:ring-offset-2"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="dp-press dp-lift dp-cta-soft-pattern relative h-12 w-full overflow-hidden rounded-[20px] bg-[#FF8B5C] text-base font-extrabold text-white shadow-[0_16px_40px_rgba(255,139,92,0.28)] hover:bg-[#F97316] focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
      >
        {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>

      {errors.general && (
        <div
          role="alert"
          className="rounded-[16px] border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3"
        >
          <p className="text-sm font-semibold text-[#C2410C]">{errors.general}</p>
        </div>
      )}
    </form>
  );
}

export default LoginForm;
