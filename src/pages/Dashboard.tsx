import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, BarChart3, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthStore } from "@/store/auth.store";
import ProblematicaModal from "@/components/Shared/Modal/ProblematicaModal";

function Dashboard() {
  const { logout } = useAuth0();
  const { user } = useAuthStore(); // Usuario del store (ya validado por ProtectedRoute)
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useGlobalLoading();
  const [showProblematicaModal, setShowProblematicaModal] = useState(false);

  // Cargar datos del dashboard (sin validaciones, ya las hizo ProtectedRoute)
  useEffect(() => {
    async function cargarDashboard() {
      if (!user) return;
      
      showLoading("Cargando dashboard...");

      try {
        // TODO: Cargar datos del dashboard
        // await Promise.all([
        //   obtenerSesionesRecientes(user.id),
        //   obtenerEstadisticas(user.id),
        // ]);

        console.log("✅ Dashboard cargado. Usuario:", {
          nombre: user.name,
          email: user.email,
          plan: user.plan,
          perfilCompleto: user.perfilCompleto,
        });
      } catch (error: any) {
        console.error("Error al cargar dashboard:", error);
        handleToaster("Error al cargar el dashboard", "error");
      } finally {
        hideLoading();
      }
    }

    cargarDashboard();
  }, [user?.id]); // Solo recargar si cambia el ID del usuario

  // Botón de logout simple
  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const features = [
    {
      icon: BookOpen,
      title: "Crear Sesión",
      description: "Genera una nueva sesión de aprendizaje",
      action: () => {
        // Validar problemática
        if (!user) return;
        
        showLoading("Cargando cuestionario...");
        navigate("/crear-sesion");
      },
    },
    {
      icon: FileText,
      title: "Mis Sesiones",
      description: "Ver todas mis sesiones creadas",
      action: () => {
        showLoading("Cargando sesiones...");
        navigate("/mis-sesiones");
      },
    },
    {
      icon: BarChart3,
      title: "Evaluaciones",
      description: "Crear y gestionar evaluaciones",
      action: () => {
        showLoading("Cargando evaluaciones...");
        navigate("/evaluaciones");
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DocentePro</h1>
            <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-semibold px-2.5 py-0.5 rounded">
              Premium
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">{user?.name}</span>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Bienvenido de vuelta, {user?.name?.split(" ")[0]}! 👋
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">¿Qué te gustaría hacer hoy?</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-blue-500"
                onClick={feature.action}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Tus últimas sesiones y actividades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aún no has creado ninguna sesión</p>
              <p className="text-sm">Comienza creando tu primera sesión de aprendizaje</p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modal de Problemática */}
      <ProblematicaModal
        isOpen={showProblematicaModal}
        onComplete={() => {
          setShowProblematicaModal(false);
          // Continuar con la creación de sesión
          showLoading("Cargando cuestionario...");
          navigate("/crear-sesion");
        }}
      />
    </div>
  );
}

export default Dashboard;
