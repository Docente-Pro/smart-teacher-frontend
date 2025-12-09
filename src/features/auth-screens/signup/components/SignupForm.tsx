import { useState } from "react";
import { useNavigate } from "react-router";
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

function SignupForm() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<ISignupFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { formData, isLoading, setFormData, setLoading, setError } = useSignupStore();

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
      .then((response) => {
        console.log(response);

        handleToaster("¡Cuenta creada exitosamente! Inicia sesión para continuar.", "success");
        setLoading(false);
        navigate("/login");
      })
      .catch((error: any) => {
        setLoading(false);

        const errorMessage = error.response?.data?.message || error.response?.data?.error;

        if (errorMessage?.includes("already exists") || errorMessage?.includes("already registered") || errorMessage?.includes("email")) {
          handleToaster("Este email ya está registrado. Intenta iniciar sesión.", "error");
          setErrors({ email: "Este email ya está en uso" });
        } else {
          handleToaster(errorMessage || "Error al crear la cuenta. Intenta nuevamente.", "error");
          setError(errorMessage || "Error al crear la cuenta");
        }
      });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre Completo */}
        <div className="space-y-2">
          <Label htmlFor="nombre" className="text-gray-700 dark:text-gray-300">
            Nombre Completo
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="nombre"
              type="text"
              placeholder="Juan Pérez"
              className="pl-10"
              value={formData.nombre}
              onChange={(e) => setFormData({ nombre: e.target.value })}
              disabled={isLoading}
            />
          </div>
          {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
        </div>

        {/* Email */}
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
              value={formData.email}
              onChange={(e) => setFormData({ email: e.target.value })}
              disabled={isLoading}
            />
          </div>
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
            Contraseña
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-10"
              value={formData.password}
              onChange={(e) => setFormData({ password: e.target.value })}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
            Confirmar Contraseña
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-10"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ confirmPassword: e.target.value })}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-base font-semibold"
          disabled={isLoading}
        >
          {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
        </Button>

        {/* Password Requirements */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula y número
        </p>

        {/* Terms */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Al registrarte, aceptas nuestros{" "}
          <a href="/terminos" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Términos de Servicio
          </a>{" "}
          y{" "}
          <a href="/privacidad" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Política de Privacidad
          </a>
        </p>
      </form>

      {isLoading && <LoadingComponent />}
    </>
  );
}

export default SignupForm;
