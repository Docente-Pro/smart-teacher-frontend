import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { User, Lock, Eye, EyeOff, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignupStore } from "../store/signupStore";
import type { ISignupFormErrors } from "../interfaces/ISignup";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import LoadingComponent from "@/components/LoadingComponent";
import { validateSignupForm } from "../functions/validateSignupForm";
import { registerUser } from "@/services/auth0.service";

const fieldFocus =
  "h-12 rounded-[16px] border-[#E6EBF2] bg-[#F5F7FA] text-base font-semibold text-[#1F2937] placeholder:text-[#9CA3AF] shadow-none focus-visible:border-[#6B9FE8] focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]";

function SignupForm() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<ISignupFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { formData, isLoading, setFormData, setLoading, setError } =
    useSignupStore();

  const validateForm = (): boolean => {
    const newErrors = validateSignupForm(formData);
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

    registerUser({
      name: formData.nombre,
      email: formData.email,
      password: formData.password,
    })
      .then(() => {
        handleToaster(
          "¡Cuenta creada exitosamente! Inicia sesión para continuar.",
          "success",
        );
        setLoading(false);
        navigate("/login");
      })
      .catch((error: any) => {
        setLoading(false);

        const errorMessage =
          error.response?.data?.message || error.response?.data?.error;

        if (
          errorMessage?.includes("already exists") ||
          errorMessage?.includes("already registered") ||
          errorMessage?.includes("email")
        ) {
          handleToaster(
            "Este email ya está registrado. Intenta iniciar sesión.",
            "error",
          );
          setErrors({ email: "Este email ya está en uso" });
        } else {
          handleToaster(
            errorMessage || "Error al crear la cuenta. Intenta nuevamente.",
            "error",
          );
          setError(errorMessage || "Error al crear la cuenta");
        }
      });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="nombre" className="text-sm font-bold text-[#1F2937]">
            Nombre completo
          </Label>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]"
              aria-hidden="true"
            />
            <Input
              id="nombre"
              type="text"
              autoComplete="name"
              placeholder="María Pérez"
              className={`${fieldFocus} pl-11`}
              value={formData.nombre}
              onChange={(e) => setFormData({ nombre: e.target.value })}
              disabled={isLoading}
              aria-invalid={Boolean(errors.nombre)}
              aria-describedby={errors.nombre ? "nombre-error" : undefined}
            />
          </div>
          {errors.nombre && (
            <p
              id="nombre-error"
              className="text-sm font-semibold text-[#C2410C]"
            >
              {errors.nombre}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-bold text-[#1F2937]">
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
              value={formData.email}
              onChange={(e) => setFormData({ email: e.target.value })}
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
              autoComplete="new-password"
              placeholder="••••••••"
              className={`${fieldFocus} pl-11 pr-12`}
              value={formData.password}
              onChange={(e) => setFormData({ password: e.target.value })}
              disabled={isLoading}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "password-error" : "password-hint"
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="dp-press absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-[12px] text-[#6B7280] hover:bg-white hover:text-[#1F2937] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p
              id="password-error"
              className="text-sm font-semibold text-[#C2410C]"
            >
              {errors.password}
            </p>
          ) : (
            <p
              id="password-hint"
              className="text-sm font-semibold leading-5 text-[#9CA3AF]"
            >
              Mínimo 8 caracteres, con mayúscula, minúscula y número.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-bold text-[#1F2937]"
          >
            Confirmar contraseña
          </Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]"
              aria-hidden="true"
            />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className={`${fieldFocus} pl-11 pr-12`}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ confirmPassword: e.target.value })
              }
              disabled={isLoading}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword ? "confirm-error" : undefined
              }
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="dp-press absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-[12px] text-[#6B7280] hover:bg-white hover:text-[#1F2937] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
              aria-label={
                showConfirmPassword
                  ? "Ocultar confirmación"
                  : "Mostrar confirmación"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p
              id="confirm-error"
              className="text-sm font-semibold text-[#C2410C]"
            >
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="dp-press dp-lift dp-cta-soft-pattern relative mt-1 h-12 w-full overflow-hidden rounded-[20px] bg-[#FF8B5C] text-base font-extrabold text-white shadow-[0_16px_40px_rgba(255,139,92,0.28)] hover:bg-[#F97316] focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
        >
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </Button>

        <p className="text-center text-sm font-semibold leading-6 text-[#9CA3AF]">
          Al registrarte, aceptas nuestros{" "}
          <Link
            to="/terminos"
            className="font-extrabold text-[#3B6CB5] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
          >
            Términos de servicio
          </Link>{" "}
          y{" "}
          <Link
            to="/privacidad"
            className="font-extrabold text-[#3B6CB5] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
          >
            Política de privacidad
          </Link>
          .
        </p>
      </form>

      {isLoading && <LoadingComponent />}
    </>
  );
}

export default SignupForm;
