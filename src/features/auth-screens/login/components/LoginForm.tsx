import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginStore } from "../store/loginStore";
import { LOGIN_VALIDATION } from "../constants/loginConstants";
import type { ILoginFormErrors } from "../interfaces/ILogin";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useNavigate } from "react-router";
import { loginWithBackend } from "@/services/backendAuth.service";
import { useAuthStore } from "@/store/auth.store";

function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ILoginFormErrors>({});
  const setTokens = useAuthStore((state) => state.setTokens);

  const { credentials, isLoading, setCredentials, setLoading, setError } = useLoginStore();

  const validateForm = (): boolean => {
    const newErrors: ILoginFormErrors = {};

    if (!credentials.email) {
      newErrors.email = LOGIN_VALIDATION.EMAIL.REQUIRED;
    } else if (!LOGIN_VALIDATION.EMAIL.PATTERN.test(credentials.email)) {
      newErrors.email = LOGIN_VALIDATION.EMAIL.INVALID;
    }

    if (!credentials.password) {
      newErrors.password = LOGIN_VALIDATION.PASSWORD.REQUIRED;
    } else if (credentials.password.length < LOGIN_VALIDATION.PASSWORD.MIN_LENGTH) {
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
      // 1. Llamar al backend para obtener los tokens
      const response = await loginWithBackend({
        email: credentials.email,
        password: credentials.password,
      });

      // 2. Guardar tokens en el store de autenticación
      setTokens(response);

      // 3. Guardar refresh token en localStorage para restaurar sesión
      if (response.refresh_token) {
        localStorage.setItem("refresh_token", response.refresh_token);
      }

      handleToaster("¡Inicio de sesión exitoso!", "success");

      // 4. El PostLoginValidator se encargará de redirigir según el estado del usuario
      // Por ahora navegamos al dashboard y el validator decidirá
      navigate("/dashboard");
    } catch (error: any) {
      setLoading(false);

      const errorMessage = error.message || error.response?.data?.message;

      if (errorMessage?.includes("Wrong") || errorMessage?.includes("invalid") || errorMessage?.includes("credentials")) {
        handleToaster("Email o contraseña incorrectos", "error");
        setError("Credenciales inválidas");
      } else {
        handleToaster(errorMessage || "Error al iniciar sesión", "error");
        setError(errorMessage || "Error al iniciar sesión");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Input */}
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
            value={credentials.email}
            onChange={(e) => setCredentials({ email: e.target.value })}
            disabled={isLoading}
          />
        </div>
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      {/* Password Input */}
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
            value={credentials.password}
            onChange={(e) => setCredentials({ password: e.target.value })}
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

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={credentials.rememberMe}
            onChange={(e) => setCredentials({ rememberMe: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">Recordarme</span>
        </label>
        <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-6 text-lg rounded-xl shadow-lg transition-all duration-300"
        disabled={isLoading}
      >
        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
      </Button>

      {/* General Error */}
      {errors.general && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
        </div>
      )}
    </form>
  );
}

export default LoginForm;
