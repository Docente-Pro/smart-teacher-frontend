import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import LoginForm from "./components/LoginForm";
import SocialLogin from "./components/SocialLogin";
import { useUserStatus } from "@/hooks/useUserStatus";

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const { isPremium, isLoading } = useUserStatus();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (isPremium) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, isPremium, isLoading, navigate]);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DocentePro</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Bienvenido de vuelta! Ingresa tus credenciales</p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Social Login */}
          <SocialLogin />

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-dp-text-secondary dark:text-gray-400">
              ¿No tienes una cuenta?{" "}
              <a href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Regístrate
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-25">
          <div className="absolute top-10 -left-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] bg-sky-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-lg text-white space-y-6 relative z-10">
          <h2 className="text-4xl font-bold">Planifica tus sesiones con Inteligencia Artificial</h2>
          <p className="text-xl text-blue-100">Genera sesiones de aprendizaje alineadas al Currículo Nacional en minutos</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span className="text-lg">5 sesiones por semana</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span className="text-lg">Evaluaciones automáticas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span className="text-lg">Exporta en PDF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
