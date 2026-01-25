import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import SignupForm from "./components/SignupForm";
import SocialLogin from "./components/SocialLogin";
import { useUserStatus } from "@/hooks/useUserStatus";
import { useAuthStore } from "@/store/auth.store";
import { createNewUsuario } from "@/services/usuarios.service";
import { handleToaster } from "@/utils/Toasters/handleToasters";

function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user: auth0User, isLoading: auth0Loading } = useAuth0();
  const { isPremium, isLoading } = useUserStatus();
  const { user: backendUser } = useAuthStore();

  // Manejar el retorno de Auth0 después del login social
  useEffect(() => {
    const handleSocialSignup = async () => {
      // Solo procesar si está autenticado con Auth0 pero NO tiene usuario en backend
      if (isAuthenticated && auth0User && !auth0Loading && !backendUser) {
        console.log('🔍 Usuario autenticado con Auth0, verificando en backend...');
        
        try {
          // Crear usuario en el backend con los datos de Auth0
          await createNewUsuario({
            nombre: auth0User.name || auth0User.email?.split('@')[0] || 'Usuario',
            email: auth0User.email!,
            nombreInstitucion: "",
            nivelId: 1,
            gradoId: 1,
            problematicaId: 1,
            suscripcion: {
              fechaInicio: new Date().toISOString(),
              plan: "free",
              activa: true,
            },
          });

          handleToaster("¡Cuenta creada exitosamente!", "success");
          // El PostLoginValidator se encargará de la redirección
          navigate("/dashboard");
        } catch (error: any) {
          console.error('Error creando usuario:', error);
          
          // Si el usuario ya existe, es OK, solo redirigir
          if (error.response?.status === 409 || error.message?.includes('already exists')) {
            console.log('Usuario ya existe en backend, continuando...');
            navigate("/dashboard");
          } else {
            handleToaster("Error al crear el usuario. Intenta de nuevo.", "error");
          }
        }
      }
    };

    handleSocialSignup();
  }, [isAuthenticated, auth0User, auth0Loading, backendUser, navigate]);

  // Redirigir si ya está autenticado
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
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DocentePro</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Crea tu cuenta y comienza a planificar</p>
          </div>

          {/* Signup Form */}
          <SignupForm />

          {/* Social Login */}
          <SocialLogin />

          {/* Login Link */}
          <div className="text-center">
            <p className="text-dp-text-secondary dark:text-gray-400">
              ¿Ya tienes una cuenta?{" "}
              <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Inicia sesión
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
          <h2 className="text-4xl font-bold">Crea tu cuenta en minutos</h2>
          <p className="text-xl text-blue-100">
            Únete a miles de docentes que ya están transformando su forma de planificar clases
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span className="text-lg">Sin necesidad de tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span className="text-lg">Comienza a crear sesiones inmediatamente</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
              <span className="text-lg">5 sesiones por semana incluidas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
