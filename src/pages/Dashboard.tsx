import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  BarChart3,
  LogOut,
  User,
  ChevronRight,
  Sparkles,
  Crown,
  FolderPlus,
  Lock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthStore } from "@/store/auth.store";
import ProblematicaModal from "@/components/Shared/Modal/ProblematicaModal";
import UpgradePremiumModal from "@/components/Shared/Modal/UpgradePremiumModal";
import { usePermissions } from "@/hooks/usePermissions";

function Dashboard() {
  const { logout } = useAuth0();
  const { user } = useAuthStore();
  const permissions = usePermissions();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useGlobalLoading();
  const [showProblematicaModal, setShowProblematicaModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    async function cargarDashboard() {
      if (!user) return;
      showLoading("Cargando dashboard...");
      try {
        // TODO: Cargar datos del dashboard
      } catch (error: any) {
        console.error("Error al cargar dashboard:", error);
        handleToaster("Error al cargar el dashboard", "error");
      } finally {
        hideLoading();
      }
    }
    cargarDashboard();
  }, [user?.id]);

  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.getState().clearAuth();
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  /**
   * Intenta crear unidad.
   * Siempre navega a /crear-unidad. El chequeo de plan (free/premium)
   * se hace dentro del wizard tras seleccionar tipo PERSONAL/COMPARTIDA.
   */
  const handleCrearUnidad = () => {
    if (!user) return;
    showLoading("Preparando creación de unidad...");
    navigate("/crear-unidad");
  };

  /**
   * Intenta crear sesión.
   * Si no tiene problemática completa → mostrar modal de problemática.
   * Si no tiene sesiones restantes → mostrar modal de upgrade.
   */
  const handleCrearSesion = () => {
    if (!user) return;
    if (user.problematicaCompleta === false) {
      setShowProblematicaModal(true);
      return;
    }
    if (!permissions.canCreateSesion) {
      setShowUpgradeModal(true);
      return;
    }
    showLoading("Cargando cuestionario...");
    navigate("/crear-sesion");
  };

  // ─── Cards de funcionalidades ───

  const features = [
    {
      icon: FolderPlus,
      title: "Crear Unidad",
      description: "Crea una Unidad de Aprendizaje con IA",
      color: "from-violet-500 to-purple-600",
      bgLight: "bg-violet-50 dark:bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
      action: handleCrearUnidad,
      premium: true,
    },
    {
      icon: BookOpen,
      title: "Crear Sesión",
      description: "Genera una nueva sesión de aprendizaje con IA",
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      action: handleCrearSesion,
      premium: false,
    },
    {
      icon: FileText,
      title: "Mis Sesiones",
      description: "Ver y gestionar tus sesiones creadas",
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      action: () => {
        showLoading("Cargando sesiones...");
        navigate("/mis-sesiones");
      },
      premium: false,
    },
    {
      icon: BarChart3,
      title: "Evaluaciones",
      description: "Crear y gestionar evaluaciones",
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      action: () => {
        showLoading("Cargando evaluaciones...");
        navigate("/evaluaciones");
      },
      premium: false,
    },
  ];

  const firstName = user?.name?.split(" ")[0] || "Docente";
  const { isPremium, planLabel } = permissions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">DocentePro</h1>
            <span className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2.5 py-0.5 rounded-full flex-shrink-0 ${
              isPremium
                ? "bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-500/20 dark:to-yellow-500/20 text-amber-700 dark:text-amber-300"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}>
              {planLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                {firstName.charAt(0)}
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">{user?.name}</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-slate-500 dark:text-slate-400">¡Hola de nuevo!</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">
            <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">¡Bienvenido, {firstName}!</span>{" "}
            <span className="inline-block animate-[wave_1.5s_ease-in-out_1]">👋</span>
          </h2>
          <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400">¿Qué te gustaría hacer hoy?</p>
        </div>

        {/* Stats row (mobile-friendly) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 mb-8 sm:mb-10">
          <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Usadas</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{user?.sesionesUsadas ?? 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Restantes</p>
              <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">{user?.sesionesRestantes ?? 0}</p>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Plan</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{planLabel}</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8 sm:mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLocked = feature.premium && !permissions.canCreateUnidad;
            return (
              <button
                key={index}
                onClick={feature.action}
                className="group relative flex items-center sm:flex-col sm:items-start gap-4 sm:gap-0 p-4 sm:p-6 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
              >
                {/* Top accent bar (desktop) */}
                <div className={`hidden sm:block absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Premium badge */}
                {feature.premium && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    {isLocked ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        <Lock className="w-2.5 h-2.5" />
                        Premium
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <Crown className="w-2.5 h-2.5" />
                        Activo
                      </span>
                    )}
                  </div>
                )}

                <div className={`p-3 sm:p-3.5 rounded-xl ${feature.bgLight} flex-shrink-0 sm:mb-4 group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
                    {feature.description}
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all sm:hidden flex-shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-white">Actividad Reciente</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Tus últimas sesiones y actividades</p>
          </div>
          <div className="px-4 sm:px-6 py-10 sm:py-12 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aún no has creado ninguna sesión</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Comienza creando tu primera sesión de aprendizaje</p>
          </div>
        </div>
      </main>

      {/* Modal de Problemática */}
      <ProblematicaModal
        isOpen={showProblematicaModal}
        onClose={() => setShowProblematicaModal(false)}
        onComplete={() => {
          setShowProblematicaModal(false);
          showLoading("Cargando cuestionario...");
          navigate("/crear-sesion");
        }}
      />

      {/* Modal de Upgrade Premium */}
      <UpgradePremiumModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}

export default Dashboard;
